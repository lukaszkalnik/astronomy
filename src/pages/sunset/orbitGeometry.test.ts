import { describe, expect, it } from "vitest";
import { formatDayMonthShort } from "../../lib/format";
import { sunsetLegacy } from "../../../tests/fixtures/sunsetLegacy";
import {
  approxDateForEclLon,
  eclLonFromOrbitPoint,
  ORBIT_FLATTEN,
  orbitAngleRad,
} from "./orbitGeometry";

describe("approxDateForEclLon", () => {
  // Legacy dateFor() used its own month table with "Sep."; Intl (de-DE) writes "Sept.".
  it.each(sunsetLegacy.orbitDate.map((o) => [o.eclLonDeg, o] as const))(
    "λ = %s° matches the legacy label",
    (_, o) => {
      const label = formatDayMonthShort(approxDateForEclLon(o.eclLonDeg).getTime());
      expect(label).toBe(o.label.replace("Sep.", "Sept."));
    },
  );
});

describe("eclLonFromOrbitPoint", () => {
  it("inverts orbitAngleRad on the drawn ellipse", () => {
    const rx = 86;
    for (const lam of [0, 45, 90, 180, 271, 359]) {
      const psi = orbitAngleRad(lam);
      const lamBack = eclLonFromOrbitPoint(Math.cos(psi) * rx, Math.sin(psi) * rx * ORBIT_FLATTEN);
      expect(lamBack).toBeCloseTo(lam, 9);
    }
  });
  it("puts the March equinox at the bottom of the figure", () => {
    expect(eclLonFromOrbitPoint(0, 10)).toBeCloseTo(0, 12);
    expect(eclLonFromOrbitPoint(-10, 0)).toBeCloseTo(90, 12);
  });
});
