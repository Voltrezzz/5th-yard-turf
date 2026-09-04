begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  booking_date date not null,
  start_chunk smallint not null check (start_chunk >= 18 and start_chunk <= 43),
  end_chunk smallint not null check (end_chunk >= 19 and end_chunk <= 44),
  duration_mins smallint not null check (duration_mins in (60, 90, 120)),
  total_price integer not null check (total_price > 0),
  advance_paid integer not null check (advance_paid > 0),
  balance_due integer not null check (balance_due >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'expired', 'payment_failed', 'cancelled', 'refunded')),
  customer_name text not null,
  customer_phone text not null,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  expires_at timestamptz,
  constraint bookings_chunk_order check (start_chunk < end_chunk),
  constraint bookings_duration_matches_chunks
    check (end_chunk - start_chunk = duration_mins / 30)
);

comment on column public.bookings.advance_paid is
  'Authoritative advance amount in rupees. It remains non-refundable after an ordinary confirmed-booking cancellation.';

create table public.slot_locks (
  booking_date date not null,
  chunk_index smallint not null check (chunk_index >= 18 and chunk_index <= 43),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  locked_at timestamptz not null default now(),
  primary key (booking_date, chunk_index)
);

create index idx_bookings_date on public.bookings (booking_date);
create index idx_bookings_user on public.bookings (user_id);
create index idx_bookings_status_expires
  on public.bookings (status, expires_at)
  where status = 'pending';
create index idx_bookings_order_id
  on public.bookings (razorpay_order_id)
  where razorpay_order_id is not null;
create index idx_slot_locks_booking on public.slot_locks (booking_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger bookings_set_updated_at
before update on public.bookings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, full_name, role)
  values (
    new.id,
    coalesce(new.phone, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Projects may already contain auth users when this migration is applied.
-- Backfill their customer profiles so the bookings foreign key is usable.
insert into public.profiles (id, phone, full_name, role)
select
  id,
  coalesce(phone, ''),
  nullif(raw_user_meta_data ->> 'full_name', ''),
  'customer'
from auth.users
on conflict (id) do nothing;

-- Lock each stale booking row before releasing its chunks. This makes expiry
-- serialize safely with confirm_payment and prevents a confirmed booking from
-- losing its locks during a webhook/cron race.
create or replace function public.expire_stale_bookings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_ids uuid[];
  v_expired_count integer := 0;
begin
  select coalesce(array_agg(id), array[]::uuid[])
  into v_booking_ids
  from (
    select id
    from public.bookings
    where status = 'pending' and expires_at < now()
    order by id
    for update skip locked
  ) stale;

  if cardinality(v_booking_ids) = 0 then
    return 0;
  end if;

  delete from public.slot_locks
  where booking_id = any(v_booking_ids);

  update public.bookings
  set status = 'expired', updated_at = now()
  where id = any(v_booking_ids) and status = 'pending';

  get diagnostics v_expired_count = row_count;
  return v_expired_count;
end;
$$;

create or replace function public.create_booking_with_lock(
  p_user_id uuid,
  p_booking_date date,
  p_start_chunk smallint,
  p_end_chunk smallint,
  p_customer_name text,
  p_customer_phone text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking_id uuid;
  v_chunk smallint;
  v_is_weekend boolean;
  v_duration_mins smallint;
  v_base_rate integer;
  v_ext_rate integer;
  v_total_price integer;
  v_advance integer := 500;
  v_inserted integer := 0;
begin
  if p_start_chunk < 18 or p_end_chunk > 44 or p_start_chunk >= p_end_chunk then
    raise exception 'INVALID_CHUNKS';
  end if;

  v_duration_mins := (p_end_chunk - p_start_chunk) * 30;
  if v_duration_mins not in (60, 90, 120) then
    raise exception 'INVALID_DURATION';
  end if;

  if p_booking_date < current_date then
    raise exception 'DATE_IN_PAST';
  end if;

  if length(trim(p_customer_name)) < 2 or p_customer_phone !~ '^\+91[0-9]{10}$' then
    raise exception 'INVALID_CUSTOMER';
  end if;

  v_is_weekend := extract(dow from p_booking_date) in (0, 6);
  v_base_rate := case when v_is_weekend then 1300 else 1100 end;
  v_ext_rate := case when v_is_weekend then 650 else 550 end;
  v_total_price := v_base_rate + ((v_duration_mins - 60) / 30) * v_ext_rate;

  perform public.expire_stale_bookings();

  insert into public.bookings (
    user_id,
    booking_date,
    start_chunk,
    end_chunk,
    duration_mins,
    total_price,
    advance_paid,
    balance_due,
    customer_name,
    customer_phone,
    status,
    expires_at
  ) values (
    p_user_id,
    p_booking_date,
    p_start_chunk,
    p_end_chunk,
    v_duration_mins,
    v_total_price,
    v_advance,
    v_total_price - v_advance,
    trim(p_customer_name),
    p_customer_phone,
    'pending',
    now() + interval '10 minutes'
  )
  returning id into v_booking_id;

  for v_chunk in p_start_chunk .. (p_end_chunk - 1) loop
    insert into public.slot_locks (booking_date, chunk_index, booking_id)
    values (p_booking_date, v_chunk, v_booking_id)
    on conflict (booking_date, chunk_index) do nothing;

    if found then
      v_inserted := v_inserted + 1;
    end if;
  end loop;

  if v_inserted < (p_end_chunk - p_start_chunk) then
    delete from public.bookings where id = v_booking_id;
    raise exception 'SLOT_CONFLICT';
  end if;

  return v_booking_id;
end;
$$;

create or replace function public.confirm_payment(
  p_booking_id uuid,
  p_payment_id text
)
returns setof public.bookings
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.bookings
  set
    status = 'confirmed',
    confirmed_at = now(),
    razorpay_payment_id = p_payment_id,
    expires_at = null,
    updated_at = now()
  where id = p_booking_id
    and status = 'pending'
    and expires_at > now()
  returning *;
end;
$$;

create or replace function public.cancel_booking(
  p_booking_id uuid,
  p_user_id uuid,
  p_is_admin boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_owner_id uuid;
begin
  select status, user_id
  into v_status, v_owner_id
  from public.bookings
  where id = p_booking_id
  for update;

  if not found then
    raise exception 'NOT_FOUND';
  end if;
  if not p_is_admin and p_user_id != v_owner_id then
    raise exception 'FORBIDDEN';
  end if;
  if v_status not in ('pending', 'confirmed') then
    raise exception 'INVALID_STATE_TRANSITION';
  end if;

  delete from public.slot_locks where booking_id = p_booking_id;

  update public.bookings
  set status = 'cancelled', cancelled_at = now(), updated_at = now()
  where id = p_booking_id;

  return true;
end;
$$;

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;
alter table public.slot_locks enable row level security;

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Users read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users update own name"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins read all profiles"
on public.profiles for select
using (public.current_user_is_admin());

create policy "Users read own bookings"
on public.bookings for select
using (user_id = auth.uid());

create policy "Admins read all bookings"
on public.bookings for select
using (public.current_user_is_admin());

create policy "Anyone can read slot locks"
on public.slot_locks for select
using (true);

revoke all on public.profiles, public.bookings, public.slot_locks from anon, authenticated;
grant select on public.slot_locks to anon, authenticated;
grant select on public.profiles, public.bookings to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant all on public.profiles, public.bookings, public.slot_locks to service_role;

revoke all on function public.create_booking_with_lock(uuid, date, smallint, smallint, text, text) from public, anon, authenticated;
revoke all on function public.confirm_payment(uuid, text) from public, anon, authenticated;
revoke all on function public.cancel_booking(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.expire_stale_bookings() from public, anon, authenticated;
grant execute on function public.create_booking_with_lock(uuid, date, smallint, smallint, text, text) to service_role;
grant execute on function public.confirm_payment(uuid, text) to service_role;
grant execute on function public.cancel_booking(uuid, uuid, boolean) to service_role;
grant execute on function public.expire_stale_bookings() to service_role;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.current_user_is_admin() from public, anon;
grant execute on function public.current_user_is_admin() to authenticated, service_role;

-- pg_cron must be enabled for the project before this block is applied.
create extension if not exists pg_cron with schema pg_catalog;

do $$
declare
  v_job_id bigint;
begin
  select jobid into v_job_id
  from cron.job
  where jobname = 'cleanup-expired-holds';

  if v_job_id is not null then
    perform cron.unschedule(v_job_id);
  end if;

  perform cron.schedule(
    'cleanup-expired-holds',
    '*/2 * * * *',
    'select public.expire_stale_bookings();'
  );
end;
$$;

commit;
