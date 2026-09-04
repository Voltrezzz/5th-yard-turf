import assert from "node:assert/strict";
import test from "node:test";

import {
  createBookingSchema,
  otpSchema,
  phoneSchema,
} from "../src/lib/validation.ts";

const validBooking = {
  bookingDate: "2026-09-05",
  startChunk: 18,
  endChunk: 20,
  customerName: "Asha Player",
  customerPhone: "+919876543210",
};

test("accepts a valid booking and trims the customer name", () => {
  const result = createBookingSchema.parse({
    ...validBooking,
    customerName: "  Asha Player  ",
  });
  assert.equal(result.customerName, "Asha Player");
});

test("rejects invalid durations and phone numbers", () => {
  assert.equal(
    createBookingSchema.safeParse({ ...validBooking, endChunk: 23 }).success,
    false,
  );
  assert.equal(phoneSchema.safeParse("9876543210").success, false);
  assert.equal(phoneSchema.safeParse("+919876543210").success, true);
});

test("requires a six-digit OTP", () => {
  assert.equal(otpSchema.safeParse("123456").success, true);
  assert.equal(otpSchema.safeParse("12345").success, false);
});
