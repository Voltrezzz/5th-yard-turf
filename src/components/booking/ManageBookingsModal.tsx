"use client";

import { FormEvent, useEffect, useState } from "react";

import { useToast } from "@/hooks/useToast";
import { formatTimeRange, normalizeIndianPhone, parseLocalDate } from "@/lib/booking-utils";
import type { Booking, BookingResult } from "@/types";

interface ManageBookingsModalProps {
  open: boolean;
  backendEnabled: boolean;
  onClose: () => void;
  onFindBookings: (phone: string) => Promise<Booking[] | null>;
  onCancel: (bookingId: string) => Promise<BookingResult>;
}

function formatRupees(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
}

export function ManageBookingsModal({
  open,
  backendEnabled,
  onClose,
  onFindBookings,
  onCancel,
}: ManageBookingsModalProps) {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!backendEnabled) {
      const normalized = normalizeIndianPhone(phone);
      if (!/^\+91\d{10}$/.test(normalized)) {
        setSearchError("Enter a valid 10-digit Indian mobile number.");
        setSearched(false);
        return;
      }
    }

    setSearchError("");
    setIsLoading(true);
    const found = await onFindBookings(phone);
    setIsLoading(false);
    setSearched(true);

    if (found === null) {
      setResults([]);
      setSearchError(
        backendEnabled
          ? "Could not load your bookings. Sign-in is added in Phase 5; local integration requires SUPABASE_DEV_USER_ID."
          : "Enter a valid mobile number.",
      );
      return;
    }
    setResults(found);
  }

  async function handleCancel(booking: Booking) {
    const confirmed = window.confirm(
      `Cancel ${formatTimeRange(booking.startChunk, booking.endChunk)} on ${booking.bookingDate}? The ₹500 advance is non-refundable.`,
    );
    if (!confirmed) return;

    const result = await onCancel(booking.id);
    if (result.success && result.booking) {
      setResults((current) =>
        current.map((item) => (item.id === booking.id ? result.booking! : item)),
      );
    }
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
          <button
            className="booking-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close manage bookings"
          >
            ×
          </button>
        </div>

        <form className="booking-search" onSubmit={handleSearch}>
          {!backendEnabled && (
            <>
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
                <button className="btn-primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Finding…" : "Find bookings"}
                </button>
              </div>
              <button
                className="booking-demo-phone"
                type="button"
                onClick={() => setPhone("98765 43210")}
              >
                Try demo number: 98765 43210
              </button>
            </>
          )}

          {backendEnabled && (
            <>
              <p className="booking-field-help">
                Bookings are loaded for the validated Supabase user. Phone OTP sign-in arrives in Phase 5.
              </p>
              <button className="btn-primary booking-load-button" type="submit" disabled={isLoading}>
                {isLoading ? "Loading…" : "Load my bookings"}
              </button>
            </>
          )}

          {searchError && <p className="booking-form-error" role="alert">{searchError}</p>}
        </form>

        <div className="booking-records" aria-live="polite">
          {searched && results.length === 0 && !searchError && (
            <div className="booking-empty-state">
              <strong>No bookings found</strong>
              <p>{backendEnabled ? "No bookings exist for this account yet." : "Check the mobile number or create a new mock booking first."}</p>
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
                {(["pending", "confirmed"] as const).includes(
                  booking.status as "pending" | "confirmed",
                ) && (
                  <button type="button" onClick={() => void handleCancel(booking)}>
                    Cancel booking
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
