import { describe, expect, it } from "vitest";
import { findPhase, phaseName } from "./phases";

describe("phaseName", () => {
  it.each([
    [0.01, true, "Neumond"],
    [0.99, false, "Vollmond"],
    [0.5, true, "Zunehmender Halbmond"],
    [0.5, false, "Abnehmender Halbmond"],
    [0.2, true, "Zunehmende Sichel"],
    [0.2, false, "Abnehmende Sichel"],
    [0.8, true, "Zunehmender Mond"],
    [0.8, false, "Abnehmender Mond"],
  ])("k=%s waxing=%s → %s", (k, waxing, name) => {
    expect(phaseName(k, waxing)).toBe(name);
  });
});

describe("findPhase", () => {
  it("finds the full moon of 2026-12-24 within the model accuracy", () => {
    // USNO / timeanddate.com: full moon 2026-12-24 01:28 UTC.
    const t = findPhase(Date.UTC(2026, 11, 1), 180, 1);
    expect(Math.abs(t - Date.UTC(2026, 11, 24, 1, 28))).toBeLessThan(30 * 60_000);
  });

  it("returns the start time when no phase is found", () => {
    // An unreachable target (elongation never equals NaN) exhausts the search.
    expect(findPhase(0, Number.NaN, 1)).toBe(0);
  });
});
