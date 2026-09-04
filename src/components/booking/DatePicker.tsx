"use client";

import { addLocalDays, formatLocalDate } from "@/lib/booking-utils";
import { siteConfig } from "@/lib/site-config";

interface DatePickerProps {
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const today = new Date();
  const dates = Array.from(
    { length: siteConfig.booking.daysInAdvance },
    (_, index) => addLocalDays(today, index),
  );

  return (
    <section className="booking-panel" aria-labelledby="booking-date-title">
      <div className="booking-step-heading">
        <span className="booking-step-number">01</span>
        <div>
          <p className="booking-kicker">Pick your match day</p>
          <h2 id="booking-date-title">Choose a date</h2>
        </div>
      </div>

      <div className="booking-date-grid">
        {dates.map((date, index) => {
          const value = formatLocalDate(date);
          const selected = selectedDate === value;

          return (
            <button
              key={value}
              type="button"
              className={`booking-date-card${selected ? " selected" : ""}`}
              aria-pressed={selected}
              onClick={() => onSelect(value)}
            >
              <span>
                {index === 0
                  ? "Today"
                  : date.toLocaleDateString("en-IN", { weekday: "short" })}
              </span>
              <strong>{date.getDate()}</strong>
              <small>{date.toLocaleDateString("en-IN", { month: "short" })}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}
