/**
 * Characterisation tests (task 0003): the migrated sunset math must give the
 * same numbers as the legacy inline script of sunset.html @ e93f17e.
 * Fixture: tests/fixtures/sunset-legacy.json (scripts/legacy-sunset-fixtures.mjs).
 */

import { describe, expect, it } from "vitest";
import { expectClose } from "../../../tests/fixtures/moonPathLegacy";
import { sunsetLegacy } from "../../../tests/fixtures/sunsetLegacy";
import { solarDeclinationDeg } from "./declination";
import { sunsetGeometry, sunVector } from "./sunsetGeometry";
import { cross, dot, normalize } from "./vec3";

/** Fixture numbers are rounded to 1e-9. */
const TOL = 2e-9;

describe("solarDeclinationDeg matches legacy decl()", () => {
  it.each(sunsetLegacy.declination.map((d) => [d.eclLonDeg, d] as const))("λ = %s°", (_, d) => {
    expectClose(solarDeclinationDeg(d.eclLonDeg), d.declDeg, TOL);
  });
});

describe("sunsetGeometry matches legacy geom()", () => {
  it.each(sunsetLegacy.geometry.map((g) => [`φ ${g.latDeg}° δ ${g.declDeg}°`, g] as const))(
    "%s",
    (_, g) => {
      const r = sunsetGeometry(g.latDeg, g.declDeg);
      expect(r.state).toBe(g.state);
      if (r.state !== "ok" || g.state !== "ok") return;
      expectClose(r.azFromNorthDeg, g.A, TOL);
      expectClose(r.azSetDeg, g.azSet, TOL);
      expectClose(r.rateDegPerHour, g.rate, TOL);
      expectClose(r.gammaDeg, g.gamma, TOL);
      // Durations grow large near polar day; compare relative to size.
      expectClose(r.durationMin, g.dur, TOL * Math.max(1, g.dur));
      expectClose(r.hourAngleSetDeg, g.H0, TOL);
    },
  );
});

describe("sunVector matches legacy sunVec()", () => {
  it.each(
    sunsetLegacy.sunVector.map(
      (s) => [`φ ${s.latDeg}° δ ${s.declDeg}° H ${s.hourAngleDeg}°`, s] as const,
    ),
  )("%s", (_, s) => {
    const v = sunVector(s.latDeg, s.declDeg, s.hourAngleDeg);
    v.forEach((c, i) => expectClose(c, s.v[i] ?? NaN, TOL));
  });
});

describe("vector helpers match legacy dot/cross/norm", () => {
  it.each(sunsetLegacy.vectors.map((v) => [JSON.stringify(v.a), v] as const))("%s", (_, v) => {
    expectClose(dot(v.a, v.b), v.dot, TOL);
    cross(v.a, v.b).forEach((c, i) => expectClose(c, v.cross[i] ?? NaN, TOL));
    normalize(v.a).forEach((c, i) => expectClose(c, v.norm[i] ?? NaN, TOL));
  });
});
