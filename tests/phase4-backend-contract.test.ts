import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { calculatePrice } from "../src/lib/booking-utils.ts";
import { createBookingSchema } from "../src/lib/validation.ts";
import type { BookingStatus } from "../src/types/index.ts";

interface ContractBooking {
  id: string;
  bookingDate: string;
  startChunk: number;
  endChunk: number;
  totalPrice: number;
  advancePaid: number;
  balanceDue: number;
  status: BookingStatus;
}

interface ContractIntent {
  bookingDate: string;
  startChunk: number;
  endChunk: number;
  customerName: string;
  customerPhone: string;
  totalPrice?: number;
}

class TransactionalContractStore {
  private bookings = new Map<string, ContractBooking>();
  private locks = new Map<string, string>();
  private tail: Promise<void> = Promise.resolve();

  private async exclusively<T>(operation: () => T | Promise<T>): Promise<T> {
    const previous = this.tail;
    let release: () => void = () => undefined;
    this.tail = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }

  create(intent: ContractIntent) {
    return this.exclusively(() => {
      const validated = createBookingSchema.parse(intent);
      const chunks = Array.from(
        { length: validated.endChunk - validated.startChunk },
        (_, index) => validated.startChunk + index,
      );
      if (chunks.some((chunk) => this.locks.has(`${validated.bookingDate}:${chunk}`))) {
        throw new Error("SLOT_CONFLICT");
      }

      const durationMins = (validated.endChunk - validated.startChunk) * 30 as 60 | 90 | 120;
      const price = calculatePrice(validated.bookingDate, durationMins);
      const booking: ContractBooking = {
        id: crypto.randomUUID(),
        bookingDate: validated.bookingDate,
        startChunk: validated.startChunk,
        endChunk: validated.endChunk,
        ...price,
        status: "pending",
      };
      chunks.forEach((chunk) => this.locks.set(`${validated.bookingDate}:${chunk}`, booking.id));
      this.bookings.set(booking.id, booking);
      return booking;
    });
  }

  confirm(bookingId: string) {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.status !== "pending") throw new Error("INVALID_STATE_TRANSITION");
    booking.status = "confirmed";
  }

  cancel(bookingId: string) {
    const booking = this.bookings.get(bookingId);
    if (!booking || !["pending", "confirmed"].includes(booking.status)) {
      throw new Error("INVALID_STATE_TRANSITION");
    }
    booking.status = "cancelled";
    for (const [key, ownerId] of this.locks) {
      if (ownerId === bookingId) this.locks.delete(key);
    }
    return booking;
  }

  locked(date: string, chunk: number) {
    return this.locks.has(`${date}:${chunk}`);
  }
}

const validIntent: ContractIntent = {
  bookingDate: "2099-09-05",
  startChunk: 18,
  endChunk: 20,
  customerName: "Test Player",
  customerPhone: "+919876543210",
};

test("migration contains the authoritative locking and security contracts", () => {
  const migration = readFileSync(
    new URL("../supabase/migrations/001_initial_schema.sql", import.meta.url),
    "utf8",
  ).toLowerCase();

  assert.match(migration, /primary key \(booking_date, chunk_index\)/);
  assert.match(migration, /on conflict \(booking_date, chunk_index\) do nothing/);
  assert.match(migration, /create or replace function public\.create_booking_with_lock/);
  assert.match(migration, /create or replace function public\.confirm_payment/);
  assert.match(migration, /create or replace function public\.cancel_booking/);
  assert.match(migration, /for update;/);
  assert.match(migration, /delete from public\.slot_locks where booking_id = p_booking_id/);
  assert.match(migration, /v_base_rate := case when v_is_weekend then 1300 else 1100 end/);
  assert.match(migration, /v_advance integer := 500/);
  assert.match(migration, /revoke all on function public\.create_booking_with_lock/);
  assert.match(migration, /grant execute on function public\.create_booking_with_lock[^;]+to service_role/);
  assert.match(migration, /for update skip locked/);
  assert.match(migration, /cron\.schedule/);
});

test("creates a booking with server-authoritative pricing and ignores a client price", async () => {
  const store = new TransactionalContractStore();
  const booking = await store.create({ ...validIntent, totalPrice: 1, endChunk: 22 });
  assert.equal(booking.totalPrice, 2600);
  assert.equal(booking.advancePaid, 500);
  assert.equal(booking.balanceDue, 2100);
  assert.equal(store.locked(validIntent.bookingDate, 21), true);
});

test("rejects duplicate and partially overlapping bookings", async () => {
  const store = new TransactionalContractStore();
  await store.create(validIntent);
  await assert.rejects(() => store.create(validIntent), /SLOT_CONFLICT/);
  await assert.rejects(
    () => store.create({ ...validIntent, startChunk: 19, endChunk: 21 }),
    /SLOT_CONFLICT/,
  );
});

test("rejects invalid chunks and unsupported durations before persistence", async () => {
  const store = new TransactionalContractStore();
  await assert.rejects(
    () => store.create({ ...validIntent, startChunk: 17, endChunk: 19 }),
    /greater than or equal to 18/i,
  );
  await assert.rejects(
    () => store.create({ ...validIntent, startChunk: 18, endChunk: 19 }),
    /invalid duration/i,
  );
});

test("transactional cancellation releases locks without refunding a confirmed advance", async () => {
  const store = new TransactionalContractStore();
  const booking = await store.create(validIntent);
  store.confirm(booking.id);
  const cancelled = store.cancel(booking.id);

  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.advancePaid, 500);
  assert.equal(store.locked(validIntent.bookingDate, 18), false);
  await store.create(validIntent);
});

test("two concurrent requests for the same chunks produce exactly one winner", async () => {
  const store = new TransactionalContractStore();
  const outcomes = await Promise.allSettled([store.create(validIntent), store.create(validIntent)]);
  assert.equal(outcomes.filter((outcome) => outcome.status === "fulfilled").length, 1);
  assert.equal(outcomes.filter((outcome) => outcome.status === "rejected").length, 1);
});

test("concurrent adjacent bookings both succeed", async () => {
  const store = new TransactionalContractStore();
  const outcomes = await Promise.allSettled([
    store.create(validIntent),
    store.create({ ...validIntent, startChunk: 20, endChunk: 22 }),
  ]);
  assert.equal(outcomes.every((outcome) => outcome.status === "fulfilled"), true);
});
