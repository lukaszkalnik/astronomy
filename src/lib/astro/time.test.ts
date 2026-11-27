import { describe, expect, it } from "vitest";
import { julianDate, localDayStartMs, MS_PER_DAY } from "./time";

describe("time", () => {
  it("converts Unix ms to Julian date", () => {
    expect(julianDate(0)).toBe(2440587.5);
    // J2000.0 = 2000-01-01T12:00Z = JD 2451545.0
    expect(julianDate(Date.UTC(2000, 0, 1, 12))).toBe(2451545);
    expect(julianDate(MS_PER_DAY)).toBe(2440588.5);
  });

  it("finds the local day start (Europe/Berlin), also across DST changes", () => {
    expect(localDayStartMs(Date.UTC(2026, 10, 27, 19, 5))).toBe(Date.UTC(2026, 10, 26, 23));
    // 2026-03-29: clocks go forward at 02:00 CET; the day still starts at 00:00 CET.
    expect(localDayStartMs(Date.UTC(2026, 2, 29, 20))).toBe(Date.UTC(2026, 2, 28, 23));
    // Just after local midnight in summer (CEST, UTC+2).
    expect(localDayStartMs(Date.UTC(2026, 5, 20, 22, 30))).toBe(Date.UTC(2026, 5, 20, 22));
  });
});
