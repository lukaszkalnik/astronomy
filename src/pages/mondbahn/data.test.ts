/** Characterisation tests (task 0002) for the year / cycle data and the phase icon path. */

import { describe, expect, it } from "vitest";
import { expectClose, legacy } from "../../../tests/fixtures/mondbahnLegacy";
import { cycleData, yearData } from "./data";
import { phasePath } from "./render/phaseIcon";

describe("yearData matches legacy yearData()", () => {
  it.each(legacy.yearData.map((y) => [`${y.year} ${y.place}`, y] as const))("%s", (_, y) => {
    const r = yearData(y.tMs, y.latDeg, y.lonDeg);
    expect(r.year).toBe(y.year);
    expect(r.yearStartMs).toBe(y.yearStartMs);
    expect(r.days).toHaveLength(y.dayCount);
    for (const d of y.days) {
      const a = r.days[d.i];
      expect(a).toBeDefined();
      if (!a) continue;
      expectClose(a.moonMaxAltDeg, d.moonMaxAltDeg);
      expectClose(a.k, d.k);
      expectClose(a.sunNoonAltDeg, d.sunNoonAltDeg);
    }
    expect(r.fullMoons).toHaveLength(y.fullMoons.length);
    y.fullMoons.forEach((f, i) => {
      const a = r.fullMoons[i];
      expect(a).toBeDefined();
      if (!a) return;
      expectClose(a.dayOffset, f.dayOffset);
      expectClose(a.maxAltDeg, f.maxAltDeg);
      expectClose(a.tMs, f.tMs, 1);
    });
  });

  it("caches by year and location", () => {
    const [a] = legacy.yearData;
    if (!a) throw new Error("fixture empty");
    const first = yearData(a.tMs, a.latDeg, a.lonDeg);
    expect(yearData(a.tMs + 86_400_000, a.latDeg, a.lonDeg)).toBe(first);
    expect(yearData(a.tMs, a.latDeg + 1, a.lonDeg)).not.toBe(first);
  });
});

describe("cycleData matches legacy cyc", () => {
  it("has the same windows", () => {
    const r = cycleData();
    expect(r).toHaveLength(legacy.cycle.count);
    for (const c of legacy.cycle.samples) {
      const a = r[c.i];
      expect(a).toBeDefined();
      if (!a) continue;
      expect(a.tMs).toBe(c.tMs);
      expectClose(a.hiDecDeg, c.hiDecDeg);
      expectClose(a.loDecDeg, c.loDecDeg);
    }
    expect(cycleData()).toBe(r);
  });
});

describe("phasePath matches legacy phasePath()", () => {
  it.each(legacy.phasePath.map((p) => [`lat ${p.latDeg} k ${p.k} waxing ${p.waxing}`, p] as const))(
    "%s",
    (_, p) => {
      expect(phasePath(38, 38, 32, p.k, p.waxing, p.latDeg)).toBe(p.d);
    },
  );
});
