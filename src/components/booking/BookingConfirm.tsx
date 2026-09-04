"use client";

import { FormEvent, useMemo, useState } from "react";

import {
  calculatePrice,
  formatTimeRange,
  isWeekend,
  parseLocalDate,
} from "@/lib/booking-utils";
import { siteConfig } from "@/lib/site-config";
import type { BookingDuration, BookingResult } from "@/types";

interface BookingConfirmProps {
  selectedDate: string;
  selectedStartChunk: number;
  durationMins: BookingDuration;
  canUseDuration: (duration: BookingDuration) => boolean;
  onDurationChange: (duration: BookingDuration) => boolean;
  onConfirm: (customerName: string, phone: string) => BookingResult;
}

const durationOptions = [
  { value: 60, label: "Standard", note: "1 hour" },
  { value: 90, label: "+30 mins", note: "1.5 hours" },
  { value: 120, label: "+60 mins", note: "2 hours" },
] as const;

function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BookingConfirm({
  selectedDate,
  selectedStartChunk,
  durationMins,
  canUseDuration,
  onDurationChange,
  onConfirm,
}: BookingConfirmProps) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  const price = useMemo(
    () => calculatePrice(selectedDate, durationMins),
    [durationMins, selectedDate],
  );
  const basePrice = calculatePrice(selectedDate, 60).totalPrice;
  const endChunk = selectedStartChunk + durationMins / 30;
  const selectedDay = parseLocalDate(selectedDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function chooseDuration(duration: BookingDuration) {
    if (!onDurationChange(duration)) {
      setFormError("That extension overlaps another booking or runs past closing time.");
      return;
    }
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const result = onConfirm(customerName, phone);
    if (!result.success) setFormError(result.message);
  }

  return (
    <section className="booking-panel booking-confirm-panel booking-reveal" aria-labelledby="booking-confirm-title">
      <div className="booking-step-heading">
        <span className="booking-step-number">03</span>
        <div>
          <p className="booking-kicker">One last check</p>
          <h2 id="booking-confirm-title">Confirm your session</h2>
        </div>
      </div>

      <div className="booking-confirm-grid">
        <form className="booking-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="customer-name">Player name</label>
          <input
            id="customer-name"
            className="booking-input"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            autoComplete="name"
            placeholder="Your full name"
            minLength={2}
            maxLength={100}
            required
          />

          <label htmlFor="customer-phone">Mobile number</label>
          <div className="booking-phone-field">
            <span>+91</span>
            <input
              id="customer-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              aria-describedby="booking-phone-help"
              required
            />
          </div>
          <p id="booking-phone-help" className="booking-field-help">
            We’ll use this number to find your booking later.
          </p>

          <fieldset className="booking-duration-fieldset">
            <legend>Session duration</legend>
            <div className="booking-duration-grid">
              {durationOptions.map((option) => {
                const available = canUseDuration(option.value);
                const optionPrice = calculatePrice(selectedDate, option.value).totalPrice;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`booking-duration-option${durationMins === option.value ? " selected" : ""}`}
                    disabled={!available}
                    aria-pressed={durationMins === option.value}
                    onClick={() => chooseDuration(option.value)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.note}</span>
                    <small>
                      {option.value === 60
                        ? formatRupees(basePrice)
                        : `+${formatRupees(optionPrice - basePrice)}`}
                    </small>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {formError && <p className="booking-form-error" role="alert">{formError}</p>}

          <button className="btn-primary booking-submit" type="submit">
            Confirm Mock Booking · {formatRupees(siteConfig.pricing.advanceAmount)}
          </button>
          <p className="booking-demo-note">Demo only—no card, UPI, or bank payment is collected in Phase 3.</p>
        </form>

        <aside className="booking-price-card" aria-label="Booking price summary">
          <p className="booking-kicker">Your session</p>
          <h3>{formatTimeRange(selectedStartChunk, endChunk)}</h3>
          <dl>
            <div><dt>Date</dt><dd>{selectedDay}</dd></div>
            <div><dt>Rate</dt><dd>{isWeekend(selectedDate) ? "Weekend" : "Weekday"}</dd></div>
            <div><dt>Duration</dt><dd>{durationMins} minutes</dd></div>
            <div className="booking-total-row"><dt>Total</dt><dd>{formatRupees(price.totalPrice)}</dd></div>
            <div className="booking-advance-row"><dt>Advance now</dt><dd>{formatRupees(price.advancePaid)}</dd></div>
            <div><dt>Balance at venue</dt><dd>{formatRupees(price.balanceDue)}</dd></div>
          </dl>
          <div className="booking-policy">
            <strong>Cancellation policy</strong>
            <p>{siteConfig.booking.cancellationPolicy}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
