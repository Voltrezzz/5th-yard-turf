"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { ApiError } from "@/lib/errors";
import {
  addLocalDays,
  cancelBookingInMemory,
  calculatePrice,
  durationToChunks,
  formatLocalDate,
  isLockedChunkRangeAvailable,
  isRangeAvailable,
  normalizeIndianPhone,
} from "@/lib/booking-utils";
import { createBookingSchema, phoneSchema } from "@/lib/validation";
import type {
  Booking,
  BookingDuration,
  BookingResponse,
  BookingResult,
  BookingSlotState,
  MyBookingsResponse,
  SlotsResponse,
} from "@/types";

const DEMO_PHONE = "+919876543210";

function isBackendConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function responseErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as Partial<ApiError>;
    return body.error?.message ?? `Request failed with status ${response.status}.`;
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

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

function createInitialBookings(backendEnabled: boolean) {
  if (backendEnabled) return [];
  const today = new Date();
  return [
    makeMockBooking(formatLocalDate(addLocalDays(today, 1)), 36, "Demo Player"),
    makeMockBooking(formatLocalDate(addLocalDays(today, 3)), 40, "Demo Player"),
  ];
}

export function useBooking() {
  const backendEnabled = isBackendConfigured();
  const [bookings, setBookings] = useState<Booking[]>(() =>
    createInitialBookings(backendEnabled),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedStartChunk, setSelectedStartChunk] = useState<number | null>(null);
  const [durationMins, setDurationMins] = useState<BookingDuration>(60);
  const [lockedChunks, setLockedChunks] = useState<number[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState("");
  const slotRequestId = useRef(0);

  const loadSlots = useCallback(
    async (date: string) => {
      if (!backendEnabled) return;
      const requestId = ++slotRequestId.current;
      setIsLoadingSlots(true);
      setBackendError("");

      try {
        const response = await fetch(`/api/booking/slots?date=${encodeURIComponent(date)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(await responseErrorMessage(response));
        const data = (await response.json()) as SlotsResponse;
        if (requestId === slotRequestId.current) setLockedChunks(data.lockedChunks);
      } catch (error) {
        if (requestId === slotRequestId.current) {
          setLockedChunks([]);
          setBackendError(error instanceof Error ? error.message : "Could not load slots.");
        }
      } finally {
        if (requestId === slotRequestId.current) setIsLoadingSlots(false);
      }
    },
    [backendEnabled],
  );

  const selectDate = useCallback(
    (date: string) => {
      setSelectedDate(date);
      setSelectedStartChunk(null);
      setDurationMins(60);
      setLockedChunks([]);
      void loadSlots(date);
    },
    [loadSlots],
  );

  const rangeIsAvailable = useCallback(
    (startChunk: number, duration: BookingDuration) => {
      if (!selectedDate || isLoadingSlots) return false;
      return backendEnabled
        ? isLockedChunkRangeAvailable(lockedChunks, selectedDate, startChunk, duration)
        : isRangeAvailable(bookings, selectedDate, startChunk, duration);
    },
    [backendEnabled, bookings, isLoadingSlots, lockedChunks, selectedDate],
  );

  const getSlotState = useCallback(
    (startChunk: number): BookingSlotState => {
      if (!selectedDate) return "available";
      if (!isRangeAvailable([], selectedDate, startChunk, 60)) return "past";
      if (!rangeIsAvailable(startChunk, 60)) return "booked";
      return "available";
    },
    [rangeIsAvailable, selectedDate],
  );

  const selectSlot = useCallback(
    (startChunk: number) => {
      if (!rangeIsAvailable(startChunk, 60)) return false;
      setSelectedStartChunk(startChunk);
      setDurationMins(60);
      return true;
    },
    [rangeIsAvailable],
  );

  const canUseDuration = useCallback(
    (duration: BookingDuration) =>
      selectedStartChunk !== null && rangeIsAvailable(selectedStartChunk, duration),
    [rangeIsAvailable, selectedStartChunk],
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
    async (customerName: string, phoneInput: string): Promise<BookingResult> => {
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
      if (!rangeIsAvailable(selectedStartChunk, durationMins)) {
        return {
          success: false,
          message: "That time is no longer available. Please choose another slot.",
        };
      }

      setIsSubmitting(true);
      try {
        if (backendEnabled) {
          const response = await fetch("/api/booking/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(validation.data),
          });
          if (!response.ok) {
            const message = await responseErrorMessage(response);
            if (response.status === 409) await loadSlots(selectedDate);
            return { success: false, message };
          }

          const data = (await response.json()) as BookingResponse;
          setBookings((current) => [data.booking, ...current]);
          setLockedChunks((current) => [
            ...new Set([
              ...current,
              ...Array.from(
                { length: data.booking.endChunk - data.booking.startChunk },
                (_, index) => data.booking.startChunk + index,
              ),
            ]),
          ]);
          setSelectedStartChunk(null);
          setDurationMins(60);
          return { success: true, message: data.message, booking: data.booking };
        }

        const now = new Date().toISOString();
        const currentPrice = calculatePrice(selectedDate, durationMins);
        const mockBooking: Booking = {
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
        setBookings((current) => [mockBooking, ...current]);
        setSelectedStartChunk(null);
        setDurationMins(60);
        return {
          success: true,
          message: "Mock booking confirmed. No payment was charged.",
          booking: mockBooking,
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "Could not create the booking.",
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [backendEnabled, durationMins, loadSlots, rangeIsAvailable, selectedDate, selectedStartChunk],
  );

  const cancelBooking = useCallback(
    async (bookingId: string): Promise<BookingResult> => {
      if (backendEnabled) {
        try {
          const response = await fetch("/api/booking/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });
          if (!response.ok) {
            return { success: false, message: await responseErrorMessage(response) };
          }
          const data = (await response.json()) as { booking: Booking };
          setBookings((current) =>
            current.map((booking) => (booking.id === bookingId ? data.booking : booking)),
          );
          if (selectedDate === data.booking.bookingDate) await loadSlots(selectedDate);
          return {
            success: true,
            message: "Booking cancelled. The ₹500 advance is non-refundable.",
            booking: data.booking,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : "Could not cancel the booking.",
          };
        }
      }

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
    },
    [backendEnabled, bookings, loadSlots, selectedDate],
  );

  const findBookings = useCallback(
    async (phoneInput: string): Promise<Booking[] | null> => {
      if (!backendEnabled) {
        const phone = normalizeIndianPhone(phoneInput);
        if (!phoneSchema.safeParse(phone).success) return null;
        return bookings.filter((booking) => booking.customerPhone === phone);
      }

      try {
        const response = await fetch("/api/booking/my-bookings", { cache: "no-store" });
        if (!response.ok) throw new Error(await responseErrorMessage(response));
        const data = (await response.json()) as MyBookingsResponse;
        setBookings(data.bookings);
        return data.bookings;
      } catch (error) {
        setBackendError(error instanceof Error ? error.message : "Could not load bookings.");
        return null;
      }
    },
    [backendEnabled, bookings],
  );

  return {
    backendEnabled,
    backendError,
    bookings,
    selectedDate,
    selectedStartChunk,
    durationMins,
    price,
    isLoadingSlots,
    isSubmitting,
    selectDate,
    selectSlot,
    getSlotState,
    canUseDuration,
    selectDuration,
    createBooking,
    cancelBooking,
    findBookings,
  };
}
