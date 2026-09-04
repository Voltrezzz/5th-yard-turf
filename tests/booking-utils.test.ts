import assert from "node:assert/strict";
import test from "node:test";

import {
  calculatePrice,
  cancelBookingInMemory,
  chunkToTime,
  isRangeAvailable,
  isLockedChunkRangeAvailable,
  isSlotPast,
  isWeekend,
  timeToChunk,
} from "../src/lib/booking-utils.ts";
import type { Booking } from "../src/types/index.ts";

test("converts between half-hour chunks and readable time", () => {
  assert.equal(timeToChunk(9), 18);
  assert.equal(timeToChunk(21, 30), 43);
  assert.equal(chunkToTime(18), "9:00 AM");
  assert.equal(chunkToTime(43), "9:30 PM");
});

test("calculates weekday and weekend prices including extensions", () => {
  assert.deepEqual(calculatePrice("2026-09-04", 60), {
    totalPrice: 1100,
    advancePaid: 500,
    balanceDue: 600,
  });
  assert.deepEqual(calculatePrice("2026-09-05", 120), {
    totalPrice: 2600,
    advancePaid: 500,
    balanceDue: 2100,
  });
  assert.equal(isWeekend("2026-09-06"), true);
  assert.equal(isWeekend("2026-09-07"), false);
});

test("detects past slots using an injected clock", () => {
  const now = new Date(2026, 8, 4, 15, 15, 0, 0);
  assert.equal(isSlotPast("2026-09-04", 30, now), true);
  assert.equal(isSlotPast("2026-09-04", 32, now), false);
  assert.equal(isSlotPast("2026-09-05", 18, now), false);
});

test("rejects extensions that collide with a booking or closing time", () => {
  const now = new Date(2026, 8, 4, 8, 0, 0, 0);
  const booking = {
    bookingDate: "2026-09-05",
    startChunk: 22,
    endChunk: 24,
    status: "confirmed",
  } as Booking;

  assert.equal(isRangeAvailable([booking], "2026-09-05", 20, 90, now), false);
  assert.equal(isRangeAvailable([], "2026-09-05", 42, 90, now), false);
  assert.equal(isRangeAvailable([], "2026-09-05", 20, 120, now), true);
});

test("cancels an in-memory confirmed booking and releases its slot", () => {
  const booking = {
    id: "b6c31908-61e5-42a9-8c30-47ea0489aa75",
    bookingDate: "2026-09-05",
    startChunk: 22,
    endChunk: 24,
    status: "confirmed",
  } as Booking;
  const cancelledAt = "2026-09-04T12:00:00.000Z";
  const result = cancelBookingInMemory([booking], booking.id, cancelledAt);

  assert.equal(result?.booking.status, "cancelled");
  assert.equal(result?.booking.cancelledAt, cancelledAt);
  assert.equal(
    isRangeAvailable(
      result?.bookings ?? [],
      "2026-09-05",
      22,
      60,
      new Date(2026, 8, 4, 8),
    ),
    true,
  );
  assert.equal(cancelBookingInMemory(result?.bookings ?? [], booking.id), null);
});

test("validates a range against backend-returned locked chunks", () => {
  const now = new Date(2026, 8, 4, 8, 0, 0, 0);
  assert.equal(
    isLockedChunkRangeAvailable([20, 21], "2026-09-05", 18, 60, now),
    true,
  );
  assert.equal(
    isLockedChunkRangeAvailable([20, 21], "2026-09-05", 18, 90, now),
    false,
  );
});
