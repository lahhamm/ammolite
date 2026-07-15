// Simulated availability for the demo booking flow.
// Deterministic: slots are seeded from date strings, never Math.random() at
// render time, so server and client always agree (no hydration mismatches).

export interface TimeSlot {
  /** 24h "HH:MM" start time. */
  time: string;
  available: boolean;
}

export interface DayAvailability {
  /** "YYYY-MM-DD" local date. */
  date: string;
  /** Sunday closed; past days disabled. */
  open: boolean;
  slots: TimeSlot[];
}

/** Small deterministic string hash (FNV-1a variant). */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function minutesToTime(minutes: number): string {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/** Clinic hours in minutes from midnight, by JS weekday (0 = Sunday). */
function hoursForWeekday(weekday: number): { open: number; close: number } | null {
  if (weekday === 0) return null; // Sunday closed
  if (weekday === 6) return { open: 9 * 60, close: 13 * 60 }; // Saturday
  return { open: 9 * 60, close: 17 * 60 }; // Mon-Fri
}

/**
 * Generates the slot list for one day. Interval equals the service duration,
 * with a 30 minute floor for short services. Roughly two thirds of slots are
 * marked available, seeded from the date, time, and service slug.
 */
export function getSlotsForDate(
  dateStr: string,
  serviceSlug: string,
  durationMin: number,
): TimeSlot[] {
  const [y, m, d] = dateStr.split("-").map(Number);
  const weekday = new Date(y, m - 1, d).getDay();
  const hours = hoursForWeekday(weekday);
  if (!hours) return [];

  const interval = Math.max(durationMin, 30);
  const slots: TimeSlot[] = [];
  for (let start = hours.open; start + durationMin <= hours.close; start += interval) {
    const time = minutesToTime(start);
    const seed = hashString(`${dateStr}T${time}|${serviceSlug}`);
    slots.push({ time, available: seed % 100 < 68 });
  }
  return slots;
}

/**
 * Builds the next `days` days of availability starting from `from`.
 * Past times on the first day are marked unavailable via `nowMinutes`.
 */
export function getAvailability(
  serviceSlug: string,
  durationMin: number,
  from: Date,
  days = 14,
): DayAvailability[] {
  const result: DayAvailability[] = [];
  const nowMinutes = from.getHours() * 60 + from.getMinutes();

  for (let i = 0; i < days; i++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    const dateStr = toDateString(day);
    const weekday = day.getDay();
    const open = hoursForWeekday(weekday) !== null;
    let slots = getSlotsForDate(dateStr, serviceSlug, durationMin);

    if (i === 0) {
      // Disable today's past times.
      slots = slots.map((slot) => {
        const [h, m] = slot.time.split(":").map(Number);
        const startMinutes = h * 60 + m;
        return startMinutes <= nowMinutes ? { ...slot, available: false } : slot;
      });
    }

    result.push({ date: dateStr, open, slots });
  }
  return result;
}

/** "09:00" to "9:00 AM" for display. Timezone is presented as Pacific. */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/** "2026-07-15" to a short label like "Wed, Jul 15". */
export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "2026-07-15" to a full label like "Wednesday, July 15, 2026". */
export function formatDateLong(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Deterministic demo confirmation code seeded from the selection. */
export function confirmationCode(parts: string[]): string {
  const seed = hashString(parts.join("|"));
  return `RI-${String(seed % 1000000).padStart(6, "0")}`;
}
