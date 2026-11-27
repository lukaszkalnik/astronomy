import { describe, expect, it } from "vitest";
import { OBLIQUITY_DEG, solarDeclinationDeg } from "./declination";
import { SUN_DIAMETER_DEG, sunPathTangent, sunsetGeometry, sunVector } from "./sunsetGeometry";
import { dot } from "./vec3";

describe("solarDeclinationDeg", () => {
  it("is 0 at the equinoxes and ±ε at the solstices", () => {
    expect(solarDeclinationDeg(0)).toBeCloseTo(0, 12);
    expect(solarDeclinationDeg(180)).toBeCloseTo(0, 12);
    expect(solarDeclinationDeg(90)).toBeCloseTo(OBLIQUITY_DEG, 12);
    expect(solarDeclinationDeg(270)).toBeCloseTo(-OBLIQUITY_DEG, 12);
  });
});

describe("sunsetGeometry", () => {
  it("at the equator on the equinox: vertical path, sets due West, 2.13 min", () => {
    const g = sunsetGeometry(0, 0);
    if (g.state !== "ok") throw new Error(g.state);
    expect(g.gammaDeg).toBeCloseTo(90, 9);
    expect(g.azSetDeg).toBeCloseTo(270, 9);
    expect(g.rateDegPerHour).toBeCloseTo(15, 9);
    expect(g.hourAngleSetDeg).toBeCloseTo(90, 9);
    // 0.5333° at 15°/h
    expect(g.durationMin).toBeCloseTo((SUN_DIAMETER_DEG / 15) * 60, 9);
  });

  it("on the equinox the path meets the horizon at 90° − φ", () => {
    for (const latDeg of [10, 40.7, 51, 69.7]) {
      const g = sunsetGeometry(latDeg, 0);
      if (g.state !== "ok") throw new Error(g.state);
      expect(g.gammaDeg).toBeCloseTo(90 - latDeg, 9);
      // duration = 1 / cos φ times the equator value
      expect(g.durationMin).toBeCloseTo(
        ((SUN_DIAMETER_DEG / 15) * 60) / Math.cos((latDeg * Math.PI) / 180),
        9,
      );
    }
  });

  it("at 51° N in June the path is flatter and the sunset longer than at the equinox", () => {
    // Geometric (no refraction) values: sunset azimuth ≈ 309.6° (NW), cf.
    // timeanddate.com Cologne 21 June (≈ 310°, includes refraction).
    const june = sunsetGeometry(51, OBLIQUITY_DEG);
    const march = sunsetGeometry(51, 0);
    if (june.state !== "ok" || march.state !== "ok") throw new Error("not ok");
    expect(june.azSetDeg).toBeGreaterThan(309);
    expect(june.azSetDeg).toBeLessThan(310.5);
    expect(june.gammaDeg).toBeLessThan(march.gammaDeg);
    expect(june.durationMin / march.durationMin).toBeGreaterThan(1.1);
  });

  it("reports midnight sun and polar night beyond the polar circle", () => {
    expect(sunsetGeometry(70, 23).state).toBe("midnight");
    expect(sunsetGeometry(70, -23).state).toBe("night");
    expect(sunsetGeometry(66, 23).state).toBe("ok");
  });
});

describe("sunVector / sunPathTangent", () => {
  it("are unit vectors and the Sun is on the horizon at the sunset hour angle", () => {
    for (const [latDeg, declDeg] of [
      [51, 20],
      [0, -10],
      [65, 5],
    ] as const) {
      const g = sunsetGeometry(latDeg, declDeg);
      if (g.state !== "ok") throw new Error(g.state);
      const v = sunVector(latDeg, declDeg, g.hourAngleSetDeg);
      expect(dot(v, v)).toBeCloseTo(1, 12);
      expect(v[2]).toBeCloseTo(0, 12);
      // Sunset is in the West (negative East component).
      expect(v[0]).toBeLessThan(0);
      const t = sunPathTangent(latDeg, declDeg, g.hourAngleSetDeg);
      expect(dot(t, t)).toBeCloseTo(1, 12);
      expect(dot(t, v)).toBeCloseTo(0, 12);
      // Setting: the tangent points down.
      expect(t[2]).toBeLessThan(0);
    }
  });

  it("puts the Sun at the meridian at H = 0 (South for φ > δ)", () => {
    const v = sunVector(51, 0, 0);
    expect(v[0]).toBeCloseTo(0, 12);
    expect(v[1]).toBeLessThan(0);
    expect(Math.asin(v[2]) * (180 / Math.PI)).toBeCloseTo(39, 9);
  });
});
