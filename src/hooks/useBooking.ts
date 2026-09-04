"use client";

import { useCallback, useMemo, useState } from "react";

import {
  addLocalDays,
  cancelBookingInMemory,
  calculatePrice,
  durationToChunks,
  formatLocalDate,
  isRangeAvailable,
  normalizeIndianPhone,
} from "@/lib/booking-utils";
import { createBookingSchema, phoneSchema } from "@/lib/validation";
import type {
  Booking,
  BookingDuration,
  BookingResult,
  BookingSlotState,
} from "@/types";

const DEMO_PHONE = "+919876543210";

function makeMockBooking(
  bookingDate: string,
  startChunk: number,
  customerName: string,
): Booking {
  const durationMins = 60;
  const price = calculatePrice(bookingDate, durationMins);
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    userId: "mock-user",
    bookingDate,
    startChunk,
    endChunk: startChunk + 2,
    durationMins,
    ...price,
    status: "confirmed",
    customerName,
    customerPhone: DEMO_PHONE,
    razorpayOrderId: null,
    razorpayPaymentId: null,
    createdAt: now,
    updatedAt: now,
    confirmedAt: now,
    cancelledAt: null,
    expiresAt: null,
  };
}

function createInitialBookings() {
  const today = new Date();
  return [
    makeMockBooking(formatLocalDate(addLocalDays(today, 1)), 36, "Demo Player"),
    makeMockBooking(formatLocalDate(addLocalDays(today, 3)), 40, "Demo Player"),
  ];
}

export function useBooking() {
  const [bookings, setBookings] = useState<Booking[]>(createInitialBookings);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartChunk, setSelectedStartChunk] = useState<number | null>(null);
  const [durationMins, setDurationMins] = useState<BookingDuration>(60);

  const selectDate = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedStartChunk(null);
    setDurationMins(60);
  }, []);

  const getSlotState = useCallback(
    (startChunk: number): BookingSlotState => {
      if (!selectedDate) return "available";
      if (!isRangeAvailable([], selectedDate, startChunk, 60)) return "past";
      if (!isRangeAvailable(bookings, selectedDate, startChunk, 60)) return "booked";
      return "available";
    },
    [bookings, selectedDate],
  );

  const selectSlot = useCallback(
    (startChunk: number) => {
      if (!selectedDate || !isRangeAvailable(bookings, selectedDate, startChunk, 60)) {
        return false;
      }
      setSelectedStartChunk(startChunk);
      setDurationMins(60);
      return true;
    },
    [bookings, selectedDate],
  );

  const canUseDuration = useCallback(
    (duration: BookingDuration) => {
      if (!selectedDate || selectedStartChunk === null) return false;
      return isRangeAvailable(
        bookings,
        selectedDate,
        selectedStartChunk,
        duration,
      );
    },
    [bookings, selectedDate, selectedStartChunk],
  );

  const selectDuration = useCallback(
    (duration: BookingDuration) => {
      if (!canUseDuration(duration)) return false;
      setDurationMins(duration);
      return true;
    },
    [canUseDuration],
  );

  const price = useMemo(
    () => (selectedDate ? calculatePrice(selectedDate, durationMins) : null),
    [durationMins, selectedDate],
  );

  const createBooking = useCallback(
    (customerName: string, phoneInput: string): BookingResult => {
      if (!selectedDate || selectedStartChunk === null) {
        return { success: false, message: "Choose a date and available time first." };
      }

      const customerPhone = normalizeIndianPhone(phoneInput);
      const endChunk = selectedStartChunk + durationToChunks(durationMins);
      const validation = createBookingSchema.safeParse({
        bookingDate: selectedDate,
        startChunk: selectedStartChunk,
        endChunk,
        customerName,
        customerPhone,
      });

      if (!validation.success) {
        return {
          success: false,
          message: validation.error.issues[0]?.message ?? "Check your booking details.",
        };
      }

      if (!isRangeAvailable(bookings, selectedDate, selectedStartChunk, durationMins)) {
        return {
          success: false,
          message: "That time is no longer available. Please choose another slot.",
        };
      }

      const now = new Date().toISOString();
      const currentPrice = calculatePrice(selectedDate, durationMins);
      const booking: Booking = {
        id: crypto.randomUUID(),
        userId: "mock-user",
        bookingDate: selectedDate,
        startChunk: selectedStartChunk,
        endChunk,
        durationMins,
        ...currentPrice,
        status: "confirmed",
        customerName: validation.data.customerName,
        customerPhone,
        razorpayOrderId: null,
        razorpayPaymentId: null,
        createdAt: now,
        updatedAt: now,
        confirmedAt: now,
        cancelledAt: null,
        expiresAt: null,
      };

      setBookings((current) => [booking, ...current]);
      setSelectedStartChunk(null);
      setDurationMins(60);

      return {
        success: true,
        message: "Mock booking confirmed. No payment was charged.",
        booking,
      };
    },
    [bookings, durationMins, selectedDate, selectedStartChunk],
  );

  const cancelBooking = useCallback((bookingId: string): BookingResult => {
    const cancellation = cancelBookingInMemory(bookings, bookingId);
    if (!cancellation) {
      return { success: false, message: "This booking cannot be cancelled." };
    }

    setBookings(cancellation.bookings);
    return {
      success: true,
      message: "Booking cancelled. The ₹500 advance is non-refundable.",
      booking: cancellation.booking,
    };
  }, [bookings]);

  const findBookingsByPhone = useCallback(
    (phoneInput: string) => {
      const phone = normalizeIndianPhone(phoneInput);
      if (!phoneSchema.safeParse(phone).success) return null;
      return bookings.filter((booking) => booking.customerPhone === phone);
    },
    [bookings],
  );

  return {
    bookings,
    selectedDate,
    selectedStartChunk,
    durationMins,
    price,
    selectDate,
    selectSlot,
    getSlotState,
    canUseDuration,
    selectDuration,
    createBooking,
    cancelBooking,
    findBookingsByPhone,
  };
}
