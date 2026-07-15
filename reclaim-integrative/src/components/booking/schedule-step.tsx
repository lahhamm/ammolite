"use client";

import { Button } from "@/components/ui/button";
import {
  formatDateLabel,
  formatTime,
  getAvailability,
} from "@/lib/availability";
import { getServiceBySlug } from "@/data/booking";
import type { BookingAction, BookingState } from "./booking-reducer";

interface ScheduleStepProps {
  state: BookingState;
  dispatch: (action: BookingAction) => void;
  /** Injected after mount to avoid server/client clock mismatches. */
  now: Date | null;
}

export function ScheduleStep({ state, dispatch, now }: ScheduleStepProps) {
  const service = state.serviceSlug ? getServiceBySlug(state.serviceSlug) : null;

  if (!service || now === null) {
    return (
      <div>
        <h2 className="font-serif text-3xl text-ink">Pick a date and time</h2>
        <p className="mt-3 font-sans text-muted">Loading availability…</p>
      </div>
    );
  }

  const days = getAvailability(service.slug, service.durationMin, now);
  const selectedDay = days.find((d) => d.date === state.date) ?? null;

  return (
    <div>
      <h2 className="font-serif text-3xl text-ink">Pick a date and time</h2>
      <p className="mt-3 font-sans text-muted">
        Times shown in Pacific Time. {service.durationMin} minute visit.
      </p>

      <div
        role="group"
        aria-label="Choose a date"
        className="mt-8 flex gap-2 overflow-x-auto pb-2"
      >
        {days.map((day) => {
          const hasOpenSlots = day.open && day.slots.some((s) => s.available);
          const isSelected = state.date === day.date;
          return (
            <button
              key={day.date}
              type="button"
              disabled={!hasOpenSlots}
              aria-pressed={isSelected}
              onClick={() => dispatch({ type: "SELECT_DATE", date: day.date })}
              className={`shrink-0 rounded-lg border px-4 py-3 font-sans text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent-sage ${
                isSelected
                  ? "border-ink bg-ink text-canvas"
                  : hasOpenSlots
                    ? "border-border bg-white text-ink hover:border-accent-sage"
                    : "cursor-default border-border/60 bg-transparent text-muted/50"
              }`}
            >
              <span className="block">{formatDateLabel(day.date)}</span>
              <span className="mt-0.5 block text-xs opacity-70">
                {day.open ? (hasOpenSlots ? "Available" : "Fully booked") : "Closed"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDay && (
        <div role="group" aria-label="Choose a time" className="mt-8">
          <p className="font-sans text-sm font-medium text-ink">
            {formatDateLabel(selectedDay.date)}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {selectedDay.slots.map((slot) => {
              const isSelected = state.time === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={!slot.available}
                  aria-pressed={isSelected}
                  onClick={() => dispatch({ type: "SELECT_TIME", time: slot.time })}
                  className={`rounded-sm border px-3 py-2.5 font-sans text-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent-sage ${
                    isSelected
                      ? "border-ink bg-ink text-canvas"
                      : slot.available
                        ? "border-border bg-white text-ink hover:border-accent-sage"
                        : "cursor-default border-border/50 bg-transparent text-muted/40 line-through"
                  }`}
                >
                  {formatTime(slot.time)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state.date && state.time && (
        <div className="mt-8">
          <Button
            variant="primary"
            onClick={() => dispatch({ type: "GO_TO_STEP", step: "details" })}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
