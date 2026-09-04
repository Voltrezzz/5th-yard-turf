# Supabase setup for 5TH YARD TURF

Phase 4 contains the complete database migration and server-side integration,
but a Supabase project is still required before live integration can be tested.

## Required manual setup

1. Create a Supabase project and save its project reference.
2. In the Supabase dashboard, enable the `pg_cron` extension. The Phase 4
   migration schedules expired-hold cleanup every two minutes.
3. Apply `migrations/001_initial_schema.sql` using the Supabase SQL editor, or
   install the Supabase CLI, link this repository to the project, and run
   `supabase db push`.
4. Copy `.env.example` to `.env.local` and provide:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Restart the Next.js server. Never prefix the service-role key with
   `NEXT_PUBLIC_` and never expose it to browser code.
6. Until Phase 5 adds phone OTP, create a development auth user in Supabase and
   set `SUPABASE_DEV_USER_ID` to that user's UUID. This fallback is ignored in
   production. The profile trigger handles new users, and the migration
   backfills users that already exist when it runs.

## Verification after setup

- Request `GET /api/booking/slots?date=YYYY-MM-DD` and confirm it returns the
  authoritative slot-lock state.
- Create a booking through `/book`, then verify the booking and its chunk rows
  in `bookings` and `slot_locks`.
- Attempt the same and a partially overlapping range concurrently; exactly one
  conflicting request must succeed.
- Cancel the booking and confirm its slot-lock rows are removed in the same
  transaction while the booking becomes `cancelled`.

Razorpay and phone OTP are intentionally deferred to Phases 6 and 5,
respectively.
