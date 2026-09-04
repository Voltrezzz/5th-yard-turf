"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { formatTimeRange, normalizeIndianPhone, parseLocalDate } from "@/lib/booking-utils";
import { useToast } from "@/hooks/useToast";
import type { Booking, BookingResult } from "@/types";

interface ManageBookingsModalProps {
  open: boolean;
  bookings: Booking[];
  onClose: () => void;
  onCancel: (bookingId: string) => BookingResult;
}

function formatRupees(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}

export function ManageBookingsModal({
  open,
  bookings,
  onClose,
  onCancel,
}: ManageBookingsModalProps) {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState<string | null>(null);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  const results = useMemo(
    () =>
      searchedPhone
        ? bookings.filter((booking) => booking.customerPhone === searchedPhone)
        : [],
    [bookings, searchedPhone],
  );

  if (!open) return null;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeIndianPhone(phone);
    if (!/^\+91\d{10}$/.test(normalized)) {
      setSearchError("Enter a valid 10-digit Indian mobile number.");
      setSearchedPhone(null);
      return;
    }
    setSearchError("");
    setSearchedPhone(normalized);
  }

  function handleCancel(booking: Booking) {
    const confirmed = window.confirm(
      `Cancel ${formatTimeRange(booking.startChunk, booking.endChunk)} on ${booking.bookingDate}? The ₹500 advance is non-refundable.`,
    );
    if (!confirmed) return;

    const result = onCancel(booking.id);
    toast({ message: result.message, tone: result.success ? "success" : "error" });
  }

  return (
    <div className="booking-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-bookings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="booking-modal-header">
          <div>
            <p className="booking-kicker">Your sessions</p>
            <h2 id="manage-bookings-title">Manage bookings</h2>
          </div>
          <button className="booking-modal-close" type="button" onClick={onClose} aria-label="Close manage bookings">×</button>
        </div>

        <form className="booking-search" onSubmit={handleSearch}>
          <label htmlFor="manage-phone">Mobile number</label>
          <div>
            <input
              id="manage-phone"
              className="booking-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
            />
            <button className="btn-primary" type="submit">Find bookings</button>
          </div>
          <button
            className="booking-demo-phone"
            type="button"
            onClick={() => setPhone("98765 43210")}
          >
            Try demo number: 98765 43210
          </button>
          {searchError && <p className="booking-form-error" role="alert">{searchError}</p>}
        </form>

        <div className="booking-records" aria-live="polite">
          {searchedPhone && results.length === 0 && (
            <div className="booking-empty-state">
              <strong>No bookings found</strong>
              <p>Check the mobile number or create a new mock booking first.</p>
            </div>
          )}

          {results.map((booking) => (
            <article className="booking-record" key={booking.id}>
              <div className="booking-record-topline">
                <span className={`booking-status ${booking.status}`}>{booking.status}</span>
                <small>#{booking.id.slice(0, 8).toUpperCase()}</small>
              </div>
              <h3>{formatTimeRange(booking.startChunk, booking.endChunk)}</h3>
              <p>
                {parseLocalDate(booking.bookingDate).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                <span aria-hidden="true"> · </span>{booking.durationMins} mins
              </p>
              <div className="booking-record-footer">
                <span>{formatRupees(booking.totalPrice)} total</span>
                {["pending", "confirmed"].includes(booking.status) && (
                  <button type="button" onClick={() => handleCancel(booking)}>Cancel booking</button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
