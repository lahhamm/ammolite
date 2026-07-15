import { describe, expect, it } from "vitest";
import {
  confirmationCode,
  formatDateLabel,
  formatTime,
  getAvailability,
  getSlotsForDate,
  toDateString,
} from "./availability";

describe("availability", () => {
  it("is deterministic: identical inputs always produce identical slots", () => {
    const a = getSlotsForDate("2026-07-20", "iv-myers-cocktail", 60);
    const b = getSlotsForDate("2026-07-20", "iv-myers-cocktail", 60);
    expect(a).toEqual(b);
  });

  it("returns no slots on Sundays", () => {
    // 2026-07-19 is a Sunday.
    expect(getSlotsForDate("2026-07-19", "blood-draw", 30)).toEqual([]);
  });

  it("uses weekday hours 9:00 to 17:00 with interval equal to duration", () => {
    // 2026-07-20 is a Monday.
    const slots = getSlotsForDate("2026-07-20", "iv-nad-750", 120);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "11:00", "13:00", "15:00"]);
  });

  it("floors the interval at 30 minutes for 15-minute services", () => {
    const slots = getSlotsForDate("2026-07-20", "b12-vitamin-shot", 15);
    expect(slots[0].time).toBe("09:00");
    expect(slots[1].time).toBe("09:30");
    // Last slot must still fit before 17:00.
    expect(slots[slots.length - 1].time).toBe("16:30");
  });

  it("uses Saturday hours 9:00 to 13:00", () => {
    // 2026-07-25 is a Saturday.
    const slots = getSlotsForDate("2026-07-25", "eboo", 120);
    expect(slots.map((s) => s.time)).toEqual(["09:00", "11:00"]);
  });

  it("makes roughly 60 to 75 percent of slots available across two weeks", () => {
    let available = 0;
    let total = 0;
    for (let day = 1; day <= 14; day++) {
      const dateStr = `2026-07-${String(day).padStart(2, "0")}`;
      for (const slot of getSlotsForDate(dateStr, "blood-draw", 30)) {
        total++;
        if (slot.available) available++;
      }
    }
    const ratio = available / total;
    expect(ratio).toBeGreaterThan(0.5);
    expect(ratio).toBeLessThan(0.85);
  });

  it("returns 14 days starting today and disables today's past times", () => {
    const from = new Date(2026, 6, 20, 12, 0); // Monday noon
    const days = getAvailability("blood-draw", 30, from);
    expect(days).toHaveLength(14);
    expect(days[0].date).toBe("2026-07-20");
    const morning = days[0].slots.filter((s) => {
      const [h] = s.time.split(":").map(Number);
      return h < 12;
    });
    expect(morning.every((s) => !s.available)).toBe(true);
    // Sunday within the window is marked closed.
    const sunday = days.find((d) => d.date === "2026-07-26");
    expect(sunday?.open).toBe(false);
  });

  it("formats times, dates, and date strings for display", () => {
    expect(formatTime("09:00")).toBe("9:00 AM");
    expect(formatTime("13:30")).toBe("1:30 PM");
    expect(formatTime("12:00")).toBe("12:00 PM");
    expect(formatDateLabel("2026-07-20")).toBe("Mon, Jul 20");
    expect(toDateString(new Date(2026, 6, 5))).toBe("2026-07-05");
  });

  it("produces a stable confirmation code from the same selection", () => {
    const a = confirmationCode(["eboo", "2026-07-20", "09:00"]);
    const b = confirmationCode(["eboo", "2026-07-20", "09:00"]);
    expect(a).toBe(b);
    expect(a).toMatch(/^RI-\d{6}$/);
  });
});
