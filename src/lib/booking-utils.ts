import { siteConfig } from "./site-config.ts";
import type { Booking, BookingDuration, PriceBreakdown } from "../types/index.ts";

export const OPEN_CHUNK = siteConfig.booking.openHour * 2;
export const CLOSE_CHUNK = siteConfig.booking.closeHour * 2;
export const SLOT_START_CHUNKS = Array.from(
  { length: siteConfig.booking.closeHour - siteConfig.booking.openHour },
  (_, index) => OPEN_CHUNK + index * 2,
);

export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addLocalDays(date: Date, days: number) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
}

export function timeToChunk(hour: number, minute = 0) {
  if (!Number.isInteger(hour) || ![0, 30].includes(minute)) {
    throw new Error("Time must use a whole hour and either 0 or 30 minutes.");
  }

  return hour * 2 + minute / 30;
}

export function chunkToTime(chunk: number) {
  const hour24 = Math.floor(chunk / 2);
  const minute = chunk % 2 === 0 ? "00" : "30";
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

export function formatTimeRange(startChunk: number, endChunk: number) {
  return `${chunkToTime(startChunk)} – ${chunkToTime(endChunk)}`;
}

export function isWeekend(date: Date | string) {
  const parsedDate = typeof date === "string" ? parseLocalDate(date) : date;
  return parsedDate.getDay() === 0 || parsedDate.getDay() === 6;
}

export function calculatePrice(
  bookingDate: Date | string,
  durationMins: BookingDuration,
): PriceBreakdown {
  const rates = isWeekend(bookingDate)
    ? siteConfig.pricing.weekend
    : siteConfig.pricing.weekday;
  const extensionChunks = Math.max(0, (durationMins - 60) / 30);
  const totalPrice = rates.baseRate + extensionChunks * rates.extensionRate;
  const advancePaid = siteConfig.pricing.advanceAmount;

  return {
    totalPrice,
    advancePaid,
    balanceDue: totalPrice - advancePaid,
  };
}

export function isSlotPast(
  bookingDate: string,
  startChunk: number,
  now = new Date(),
) {
  const today = formatLocalDate(now);
  if (bookingDate < today) return true;
  if (bookingDate > today) return false;

  const slotHour = Math.floor(startChunk / 2);
  const slotMinute = startChunk % 2 === 0 ? 0 : 30;
  const slotStart = new Date(now);
  slotStart.setHours(slotHour, slotMinute, 0, 0);
  return slotStart.getTime() <= now.getTime();
}

export function durationToChunks(durationMins: BookingDuration) {
  return durationMins / siteConfig.booking.chunkMinutes;
}

export function bookingBlocksRange(
  booking: Booking,
  bookingDate: string,
  startChunk: number,
  endChunk: number,
) {
  return (
    booking.bookingDate === bookingDate &&
    ["pending", "confirmed"].includes(booking.status) &&
    booking.startChunk < endChunk &&
    booking.endChunk > startChunk
  );
}

export function isRangeAvailable(
  bookings: Booking[],
  bookingDate: string,
  startChunk: number,
  durationMins: BookingDuration,
  now = new Date(),
) {
  const endChunk = startChunk + durationToChunks(durationMins);

  if (startChunk < OPEN_CHUNK || endChunk > CLOSE_CHUNK) return false;
  if (isSlotPast(bookingDate, startChunk, now)) return false;

  return !bookings.some((booking) =>
    bookingBlocksRange(booking, bookingDate, startChunk, endChunk),
  );
}

export function normalizeIndianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return value.trim();
}

export function cancelBookingInMemory(
  bookings: Booking[],
  bookingId: string,
  cancelledAt = new Date().toISOString(),
) {
  const currentBooking = bookings.find((booking) => booking.id === bookingId);
  if (!currentBooking || !["pending", "confirmed"].includes(currentBooking.status)) {
    return null;
  }

  const cancelledBooking: Booking = {
    ...currentBooking,
    status: "cancelled",
    cancelledAt,
    updatedAt: cancelledAt,
  };

  return {
    booking: cancelledBooking,
    bookings: bookings.map((booking) =>
      booking.id === bookingId ? cancelledBooking : booking,
    ),
  };
}
