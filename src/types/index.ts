export type BookingStatus =
  | "pending"
  | "confirmed"
  | "expired"
  | "payment_failed"
  | "cancelled"
  | "refunded";

export interface Booking {
  id: string;
  userId: string;
  bookingDate: string;
  startChunk: number;
  endChunk: number;
  durationMins: 60 | 90 | 120;
  totalPrice: number;
  advancePaid: number;
  balanceDue: number;
  status: BookingStatus;
  customerName: string;
  customerPhone: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
}

export interface SlotInfo {
  startChunk: number;
  endChunk: number;
  label: string;
  available: boolean;
  isPast: boolean;
}

export interface PriceBreakdown {
  totalPrice: number;
  advancePaid: number;
  balanceDue: number;
}

export type BookingDuration = 60 | 90 | 120;

export type BookingSlotState = "available" | "booked" | "past";

export interface BookingResult {
  success: boolean;
  message: string;
  booking?: Booking;
}
