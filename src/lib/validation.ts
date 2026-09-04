import { z } from "zod";

export const createBookingSchema = z
  .object({
    bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startChunk: z.number().int().min(18).max(43),
    endChunk: z.number().int().min(19).max(44),
    customerName: z
      .string()
      .trim()
      .min(2, "Enter a name with at least 2 characters")
      .max(100),
    customerPhone: z
      .string()
      .regex(/^\+91\d{10}$/, "Enter a valid 10-digit Indian mobile number"),
  })
  .refine((data) => data.startChunk < data.endChunk, {
    message: "startChunk must be < endChunk",
  })
  .refine((data) => [2, 3, 4].includes(data.endChunk - data.startChunk), {
    message: "Invalid duration",
  });

export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().startsWith("order_"),
  razorpay_payment_id: z.string().startsWith("pay_"),
  razorpay_signature: z.string().length(64),
  bookingId: z.string().uuid(),
});

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const myBookingsQuerySchema = z.object({});

export const phoneSchema = z
  .string()
  .regex(/^\+91\d{10}$/, "Enter a valid 10-digit Indian mobile number");

export const otpSchema = z.string().regex(/^\d{6}$/, "Must be 6 digits");
