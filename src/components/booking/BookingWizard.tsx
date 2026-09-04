"use client";

import { useCallback, useState } from "react";

import { BookingConfirm } from "@/components/booking/BookingConfirm";
import { DatePicker } from "@/components/booking/DatePicker";
import { ManageBookingsModal } from "@/components/booking/ManageBookingsModal";
import { TimeSlotGrid } from "@/components/booking/TimeSlotGrid";
import { useBooking } from "@/hooks/useBooking";
import { useToast } from "@/hooks/useToast";
import type { BookingResult } from "@/types";

export function BookingWizard() {
  const booking = useBooking();
  const toast = useToast();
  const [manageOpen, setManageOpen] = useState(false);
  const [lastBooking, setLastBooking] = useState<BookingResult["booking"]>();

  const handleConfirm = useCallback(
    async (customerName: string, phone: string) => {
      const result = await booking.createBooking(customerName, phone);
      if (result.success) {
        setLastBooking(result.booking);
        toast({ message: result.message, tone: "success" });
      }
      return result;
    },
    [booking, toast],
  );

  function handleDateSelect(date: string) {
    setLastBooking(undefined);
    booking.selectDate(date);
  }

  function handleSlotSelect(startChunk: number) {
    setLastBooking(undefined);
    booking.selectSlot(startChunk);
  }

  return (
    <div className="booking-page">
      <div className="booking-orb booking-orb-one" aria-hidden="true" />
      <div className="booking-orb booking-orb-two" aria-hidden="true" />
      <div className="booking-shell">
        <header className="booking-intro">
          <div>
            <p className="booking-eyebrow">5TH YARD BOOKING ARENA</p>
            <h1>Book Your <span>Slot.</span></h1>
            <p className="booking-lede">
              Lock in your football or cricket session in under a minute.
            </p>
          </div>
          <div className="booking-intro-actions">
            <div className="booking-demo-badge">
              <span aria-hidden="true" />
              {booking.backendEnabled
                ? "Supabase backend · payments not active"
                : "Demo mode · no payment charged"}
            </div>
            <button className="booking-manage-button" type="button" onClick={() => setManageOpen(true)}>
              Manage my bookings
            </button>
          </div>
        </header>

        <div className="booking-progress" aria-label="Booking progress">
          <span className="active">Date</span>
          <span className={booking.selectedDate ? "active" : ""}>Time</span>
          <span className={booking.selectedStartChunk !== null ? "active" : ""}>Confirm</span>
        </div>

        <div className="booking-flow">
          <DatePicker selectedDate={booking.selectedDate} onSelect={handleDateSelect} />

          {booking.backendError && (
            <p className="booking-form-error booking-backend-error" role="alert">
              {booking.backendError}
            </p>
          )}

          {booking.selectedDate && (
            <TimeSlotGrid
              selectedDate={booking.selectedDate}
              selectedStartChunk={booking.selectedStartChunk}
              isLoading={booking.isLoadingSlots}
              getSlotState={booking.getSlotState}
              onSelect={handleSlotSelect}
            />
          )}

          {booking.selectedDate && booking.selectedStartChunk !== null && (
            <BookingConfirm
              selectedDate={booking.selectedDate}
              selectedStartChunk={booking.selectedStartChunk}
              durationMins={booking.durationMins}
              backendEnabled={booking.backendEnabled}
              isSubmitting={booking.isSubmitting}
              canUseDuration={booking.canUseDuration}
              onDurationChange={booking.selectDuration}
              onConfirm={handleConfirm}
            />
          )}

          {lastBooking && (
            <section className="booking-success booking-reveal" aria-live="polite">
              <span aria-hidden="true">✓</span>
              <div>
                <p className="booking-kicker">Session locked in</p>
                <h2>{booking.backendEnabled ? "Booking hold created" : "Mock booking confirmed"}</h2>
                <p>
                  {booking.backendEnabled
                    ? `The server returned the authoritative ₹${lastBooking.totalPrice.toLocaleString("en-IN")} price. This unpaid hold expires automatically.`
                    : `No payment was charged. Find or cancel it using mobile number ${lastBooking.customerPhone}.`}
                </p>
              </div>
              <button type="button" onClick={() => setManageOpen(true)}>View booking</button>
            </section>
          )}
        </div>
      </div>

      <ManageBookingsModal
        open={manageOpen}
        backendEnabled={booking.backendEnabled}
        onClose={() => setManageOpen(false)}
        onCancel={booking.cancelBooking}
        onFindBookings={booking.findBookings}
      />
    </div>
  );
}
