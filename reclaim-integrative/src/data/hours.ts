// Single source of truth for clinic hours. Never duplicate these as loose
// strings elsewhere: derive display copy from `hoursSummary` /
// `openWindowFor`, and feed the availability generator from `openWindowFor`.
//
// Ranges use a regular hyphen in copy (never an em-dash, per project rules).

import type { LocationId } from "./booking";

/** JS weekday index: 0 = Sunday ... 6 = Saturday. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** An open window in minutes from midnight. A closed day has no window. */
export interface OpenWindow {
  /** Minutes from midnight the clinic opens, e.g. 8 * 60. */
  open: number;
  /** Minutes from midnight the clinic closes, e.g. 16 * 60. */
  close: number;
}

/** Per-weekday hours for one clinic. `null` = closed that day. */
export type WeeklyHours = Record<Weekday, OpenWindow | null>;

export interface LocationHours {
  location: LocationId;
  weekly: WeeklyHours;
  /** Extra scheduling note surfaced in the UI, e.g. appointment-only clinics. */
  note?: string;
}

const w = (openHour: number, closeHour: number): OpenWindow => ({
  open: openHour * 60,
  close: closeHour * 60,
});

/**
 * Official hours (owner-supplied, source of truth).
 * Newport Beach: Mon 8-4, Tue 9-12, Wed 8-4, Thu 8-4, Fri 8-3, Sat/Sun closed.
 * Rancho Cucamonga: Thu 12-4, Sat 9-12, by appointment only.
 */
export const HOURS: Record<LocationId, LocationHours> = {
  "newport-beach": {
    location: "newport-beach",
    weekly: {
      0: null,
      1: w(8, 16),
      2: w(9, 12),
      3: w(8, 16),
      4: w(8, 16),
      5: w(8, 15),
      6: null,
    },
  },
  "rancho-cucamonga": {
    location: "rancho-cucamonga",
    weekly: {
      0: null,
      1: null,
      2: null,
      3: null,
      4: w(12, 16),
      5: null,
      6: w(9, 12),
    },
    note: "By appointment only",
  },
};

/** The open window for a location on a given JS weekday, or null if closed. */
export function openWindowFor(
  location: LocationId,
  weekday: number,
): OpenWindow | null {
  return HOURS[location].weekly[weekday as Weekday] ?? null;
}

/** The scheduling note for a location, if any (e.g. "By appointment only"). */
export function noteFor(location: LocationId): string | undefined {
  return HOURS[location].note;
}

const DAY_ABBR: Record<Weekday, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/** "8am", "12pm", "3pm" (no minutes for on-the-hour times, else "9:30am"). */
function formatHour(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const min = minutes % 60;
  const period = h24 >= 12 ? "pm" : "am";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return min === 0 ? `${h12}${period}` : `${h12}:${String(min).padStart(2, "0")}${period}`;
}

/** "8am-4pm" for a window. Regular hyphen, never an em-dash. */
export function formatWindow(win: OpenWindow): string {
  return `${formatHour(win.open)}-${formatHour(win.close)}`;
}

/**
 * A condensed, scannable one-line-per-entry summary, collapsing consecutive
 * days that share the same window (e.g. "Wed-Thu 8am-4pm"). Closed days are
 * omitted. Order follows Mon..Sun so the work week reads first.
 */
export function hoursSummary(location: LocationId): string[] {
  const order: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
  const weekly = HOURS[location].weekly;
  const parts: string[] = [];

  let i = 0;
  while (i < order.length) {
    const day = order[i];
    const win = weekly[day];
    if (!win) {
      i++;
      continue;
    }
    // Extend the run while the next consecutive day shares the same window.
    let j = i;
    while (
      j + 1 < order.length &&
      sameWindow(weekly[order[j + 1]], win)
    ) {
      j++;
    }
    const label =
      i === j
        ? DAY_ABBR[day]
        : `${DAY_ABBR[day]}-${DAY_ABBR[order[j]]}`;
    parts.push(`${label} ${formatWindow(win)}`);
    i = j + 1;
  }

  return parts;
}

function sameWindow(a: OpenWindow | null, b: OpenWindow | null): boolean {
  if (!a || !b) return false;
  return a.open === b.open && a.close === b.close;
}

/** The condensed summary joined with a middot for compact single-line display. */
export function hoursSummaryLine(location: LocationId): string {
  return hoursSummary(location).join(" · ");
}

/** Human list of open weekday names, e.g. ["Thursday", "Saturday"]. */
export function openDayNames(location: LocationId): string[] {
  const names: Record<Weekday, string> = {
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
  };
  const order: Weekday[] = [1, 2, 3, 4, 5, 6, 0];
  return order
    .filter((d) => HOURS[location].weekly[d] !== null)
    .map((d) => names[d]);
}
