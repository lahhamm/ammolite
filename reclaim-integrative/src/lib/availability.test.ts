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
    const a = getSlotsForDate("2026-07-20", "newport-beach", "iv-myers-cocktail", 60);
    const b = getSlotsForDate("2026-07-20", "newport-beach", "iv-myers-cocktail", 60);
    expect(a).toEqual(b);
  });

  it("returns no slots on days a clinic is closed", () => {
    // 2026-07-19 is a Sunday: both clinics closed.
    expect(getSlotsForDate("2026-07-19", "newport-beach", "blood-draw", 30)).toEqual([]);
    expect(getSlotsForDate("2026-07-19", "rancho-cucamonga", "blood-draw", 30)).toEqual([]);
  });

  it("uses Newport Beach's real per-day windows", () => {
    // 2026-07-20 Monday: 8:00-16:00 for a 120-minute service.
    const monday = getSlotsForDate("2026-07-20", "newport-beach", "iv-nad-750", 120);
    expect(monday.map((s) => s.time)).toEqual(["08:00", "10:00", "12:00", "14:00"]);
    // 2026-07-21 Tuesday: shorter window 9:00-12:00.
    const tuesday = getSlotsForDate("2026-07-21", "newport-beach", "blood-draw", 30);
    expect(tuesday[0].time).toBe("09:00");
    expect(tuesday[tuesday.length - 1].time).toBe("11:30");
    // 2026-07-24 Friday: 8:00-15:00.
    const friday = getSlotsForDate("2026-07-24", "newport-beach", "blood-draw", 30);
    expect(friday[0].time).toBe("08:00");
    expect(friday[friday.length - 1].time).toBe("14:30");
  });

  it("floors the interval at 30 minutes for 15-minute services", () => {
    // 2026-07-20 Monday, Newport 8:00-16:00.
    const slots = getSlotsForDate("2026-07-20", "newport-beach", "b12-vitamin-shot", 15);
    expect(slots[0].time).toBe("08:00");
    expect(slots[1].time).toBe("08:30");
    expect(slots[slots.length - 1].time).toBe("15:30");
  });

  it("opens Rancho Cucamonga only on Thursday 12-4 and Saturday 9-12", () => {
    // 2026-07-23 Thursday: 12:00-16:00.
    const thursday = getSlotsForDate("2026-07-23", "rancho-cucamonga", "blood-draw", 30);
    expect(thursday[0].time).toBe("12:00");
    expect(thursday[thursday.length - 1].time).toBe("15:30");
    // 2026-07-25 Saturday: 9:00-12:00.
    const saturday = getSlotsForDate("2026-07-25", "rancho-cucamonga", "blood-draw", 30);
    expect(saturday[0].time).toBe("09:00");
    expect(saturday[saturday.length - 1].time).toBe("11:30");
    // 2026-07-20 Monday: closed at Rancho even though Newport is open.
    expect(getSlotsForDate("2026-07-20", "rancho-cucamonga", "blood-draw", 30)).toEqual([]);
  });

  it("makes roughly 60 to 75 percent of slots available across two weeks", () => {
    let available = 0;
    let total = 0;
    for (let day = 1; day <= 14; day++) {
      const dateStr = `2026-07-${String(day).padStart(2, "0")}`;
      for (const slot of getSlotsForDate(dateStr, "newport-beach", "blood-draw", 30)) {
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
    const days = getAvailability("newport-beach", "blood-draw", 30, from);
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

  it("marks most days closed for Rancho Cucamonga over a 14-day window", () => {
    const from = new Date(2026, 6, 20, 8, 0); // Monday morning
    const days = getAvailability("rancho-cucamonga", "blood-draw", 30, from);
    const openDays = days.filter((d) => d.open);
    // Two weeks contains two Thursdays and two Saturdays: exactly four open days.
    expect(openDays).toHaveLength(4);
    // Every open day is a Thursday or Saturday.
    for (const d of openDays) {
      const [y, m, day] = d.date.split("-").map(Number);
      const weekday = new Date(y, m - 1, day).getDay();
      expect([4, 6]).toContain(weekday);
    }
    // Closed days carry no slots.
    for (const d of days.filter((day) => !day.open)) {
      expect(d.slots).toEqual([]);
    }
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
