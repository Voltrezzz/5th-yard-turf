import type { Booking, BookingDuration } from "@/types";
import type { BookingRow } from "@/types/database";

export function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    userId: row.user_id,
    bookingDate: row.booking_date,
    startChunk: row.start_chunk,
    endChunk: row.end_chunk,
    durationMins: row.duration_mins as BookingDuration,
    totalPrice: row.total_price,
    advancePaid: row.advance_paid,
    balanceDue: row.balance_due,
    status: row.status,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    confirmedAt: row.confirmed_at,
    cancelledAt: row.cancelled_at,
    expiresAt: row.expires_at,
  };
}
