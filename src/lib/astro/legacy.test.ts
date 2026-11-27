/**
 * Characterisation tests (task 0002): the migrated astronomy code must give the
 * same numbers as the legacy inline script of index.html @ 640ff7f.
 * Fixture: tests/fixtures/mondbahn-legacy.json (scripts/legacy-mondbahn-fixtures.mjs).
 */

import { describe, expect, it } from "vitest";
import { expectClose, legacy } from "../../../tests/fixtures/mondbahnLegacy";
import { findPhase } from "./phases";
import { sunMoonPosition } from "./position";

describe("sunMoonPosition matches legacy pos()", () => {
  it.each(legacy.pos.map((p) => [`${new Date(p.tMs).toISOString()} ${p.place}`, p] as const))(
    "%s",
    (_, p) => {
      const r = sunMoonPosition(p.tMs, p.latDeg, p.lonDeg);
      for (const body of ["sun", "moon"] as const) {
        expectClose(r[body].altDeg, p[body].altDeg);
        expectClose(r[body].azDeg, p[body].azDeg);
        expectClose(r[body].decDeg, p[body].decDeg);
      }
      expectClose(r.k, p.k);
      expect(r.waxing).toBe(p.waxing);
    },
  );
});

describe("findPhase matches legacy findPhase()", () => {
  it.each(
    legacy.findPhase.map(
      (f) => [`${new Date(f.tMs).toISOString()} ${f.targetDeg}° dir ${f.dir}`, f] as const,
    ),
  )("%s", (_, f) => {
    // Bisection resolves ~0.02 ms; the fixture is rounded to whole ms.
    expectClose(findPhase(f.tMs, f.targetDeg, f.dir), f.resultMs, 1);
  });
});
