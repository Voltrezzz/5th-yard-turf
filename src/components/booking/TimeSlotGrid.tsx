"use client";

import {
  formatTimeRange,
  parseLocalDate,
  SLOT_START_CHUNKS,
} from "@/lib/booking-utils";
import type { BookingSlotState } from "@/types";

interface TimeSlotGridProps {
  selectedDate: string;
  selectedStartChunk: number | null;
  getSlotState: (startChunk: number) => BookingSlotState;
  onSelect: (startChunk: number) => void;
}

export function TimeSlotGrid({
  selectedDate,
  selectedStartChunk,
  getSlotState,
  onSelect,
}: TimeSlotGridProps) {
  const readableDate = parseLocalDate(selectedDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="booking-panel booking-reveal" aria-labelledby="booking-time-title">
      <div className="booking-step-heading booking-step-heading-row">
        <div className="booking-step-title">
          <span className="booking-step-number">02</span>
          <div>
            <p className="booking-kicker">13 one-hour sessions</p>
            <h2 id="booking-time-title">Choose a time</h2>
          </div>
        </div>
        <p className="booking-selected-date">{readableDate}</p>
      </div>

      <div className="booking-slot-grid">
        {SLOT_START_CHUNKS.map((startChunk) => {
          const state = getSlotState(startChunk);
          const selected = selectedStartChunk === startChunk;
          const unavailable = state !== "available";

          return (
            <button
              key={startChunk}
              type="button"
              className={`booking-slot ${state}${selected ? " selected" : ""}`}
              disabled={unavailable}
              aria-pressed={selected}
              aria-label={`${formatTimeRange(startChunk, startChunk + 2)}, ${state}`}
              onClick={() => onSelect(startChunk)}
            >
              <strong>{formatTimeRange(startChunk, startChunk + 2)}</strong>
              <span>{state === "available" ? "Available" : state}</span>
            </button>
          );
        })}
      </div>

      <div className="booking-legend" aria-label="Slot status legend">
        <span><i className="available" /> Available</span>
        <span><i className="booked" /> Booked</span>
        <span><i className="past" /> Past</span>
      </div>
    </section>
  );
}
