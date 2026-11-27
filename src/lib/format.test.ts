import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatDeg,
  formatLatitude,
  formatLongDate,
  formatTime,
  formatWeekdayShort,
} from "./format";

// 2026-11-27 19:05 UTC = 20:05 in Europe/Berlin (the test timezone).
const T = Date.UTC(2026, 10, 27, 19, 5);

describe("format (de-DE, Europe/Berlin)", () => {
  it("formats times and dates like the legacy toLocale*String calls", () => {
    expect(formatTime(T)).toBe(
      new Date(T).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
    );
    expect(formatTime(T)).toBe("20:05");
    expect(formatDate(T)).toBe("27. November 2026");
    expect(formatLongDate(T)).toBe("Freitag, 27. November 2026");
    expect(formatWeekdayShort(T)).toBe("Fr");
  });

  it("rounds degrees like Math.round and never shows -0", () => {
    expect(formatDeg(61.6)).toBe("62°");
    expect(formatDeg(-2.5)).toBe("-2°");
    expect(formatDeg(-0.4)).toBe("0°");
    expect(formatDeg(0)).toBe("0°");
  });

  it("formats latitude with a decimal comma and hemisphere", () => {
    expect(formatLatitude(50.94)).toBe("50,9° Nord");
    expect(formatLatitude(-33.87)).toBe("33,9° Süd");
    expect(formatLatitude(0)).toBe("0,0° Nord");
    expect(formatLatitude(-0.18)).toBe("0,2° Süd");
    expect(formatLatitude(71.17)).toBe("71,2° Nord");
  });
});
