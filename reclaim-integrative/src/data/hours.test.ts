import { describe, expect, it } from "vitest";
import {
  formatWindow,
  hoursSummary,
  hoursSummaryLine,
  noteFor,
  openDayNames,
  openWindowFor,
} from "./hours";

describe("clinic hours", () => {
  it("encodes the official Newport Beach windows", () => {
    // Mon 8-4, Tue 9-12, Wed 8-4, Thu 8-4, Fri 8-3, Sat/Sun closed.
    expect(openWindowFor("newport-beach", 1)).toEqual({ open: 8 * 60, close: 16 * 60 });
    expect(openWindowFor("newport-beach", 2)).toEqual({ open: 9 * 60, close: 12 * 60 });
    expect(openWindowFor("newport-beach", 3)).toEqual({ open: 8 * 60, close: 16 * 60 });
    expect(openWindowFor("newport-beach", 4)).toEqual({ open: 8 * 60, close: 16 * 60 });
    expect(openWindowFor("newport-beach", 5)).toEqual({ open: 8 * 60, close: 15 * 60 });
    expect(openWindowFor("newport-beach", 6)).toBeNull();
    expect(openWindowFor("newport-beach", 0)).toBeNull();
  });

  it("encodes Rancho Cucamonga as Thursday and Saturday only", () => {
    expect(openWindowFor("rancho-cucamonga", 4)).toEqual({ open: 12 * 60, close: 16 * 60 });
    expect(openWindowFor("rancho-cucamonga", 6)).toEqual({ open: 9 * 60, close: 12 * 60 });
    // Every other day is closed.
    for (const day of [0, 1, 2, 3, 5]) {
      expect(openWindowFor("rancho-cucamonga", day)).toBeNull();
    }
  });

  it("marks Rancho Cucamonga as appointment only and Newport with no note", () => {
    expect(noteFor("rancho-cucamonga")).toBe("By appointment only");
    expect(noteFor("newport-beach")).toBeUndefined();
  });

  it("formats windows with a regular hyphen and no minutes on the hour", () => {
    expect(formatWindow({ open: 8 * 60, close: 16 * 60 })).toBe("8am-4pm");
    expect(formatWindow({ open: 9 * 60, close: 12 * 60 })).toBe("9am-12pm");
    expect(formatWindow({ open: 8 * 60, close: 15 * 60 })).toBe("8am-3pm");
  });

  it("condenses consecutive same-window days in the Newport summary", () => {
    // Wed and Thu share 8am-4pm, so they collapse into one entry.
    expect(hoursSummary("newport-beach")).toEqual([
      "Mon 8am-4pm",
      "Tue 9am-12pm",
      "Wed-Thu 8am-4pm",
      "Fri 8am-3pm",
    ]);
    expect(hoursSummaryLine("newport-beach")).toBe(
      "Mon 8am-4pm · Tue 9am-12pm · Wed-Thu 8am-4pm · Fri 8am-3pm",
    );
  });

  it("summarizes Rancho Cucamonga's two open days without collapsing them", () => {
    expect(hoursSummary("rancho-cucamonga")).toEqual([
      "Thu 12pm-4pm",
      "Sat 9am-12pm",
    ]);
  });

  it("lists open weekday names in week order", () => {
    expect(openDayNames("rancho-cucamonga")).toEqual(["Thursday", "Saturday"]);
    expect(openDayNames("newport-beach")).toEqual([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);
  });

  it("contains no em-dashes in any generated display string", () => {
    const strings = [
      ...hoursSummary("newport-beach"),
      ...hoursSummary("rancho-cucamonga"),
      hoursSummaryLine("newport-beach"),
      hoursSummaryLine("rancho-cucamonga"),
      noteFor("rancho-cucamonga") ?? "",
    ];
    for (const s of strings) {
      expect(s).not.toContain("—");
    }
  });
});
