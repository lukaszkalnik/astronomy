import { describe, expect, it } from "vitest";
import { DEFAULT_LOCATION, parseStoredLocation, serializeLocation } from "./state";

describe("parseStoredLocation (localStorage 'moonPath.location')", () => {
  it("reads a value written by saveLocation", () => {
    expect(parseStoredLocation('{"lat":71.17,"lon":25.78}')).toEqual({
      latDeg: 71.17,
      lonDeg: 25.78,
    });
    expect(parseStoredLocation('{"lat":-33.5,"lon":151.21}')).toEqual({
      latDeg: -33.5,
      lonDeg: 151.21,
    });
  });

  it("accepts the range limits", () => {
    expect(parseStoredLocation('{"lat":-90,"lon":180}')).toEqual({ latDeg: -90, lonDeg: 180 });
    expect(parseStoredLocation('{"lat":90,"lon":-180}')).toEqual({ latDeg: 90, lonDeg: -180 });
  });

  it("round-trips with serializeLocation", () => {
    const loc = { latDeg: 12.5, lonDeg: -3.25 };
    expect(parseStoredLocation(serializeLocation(loc))).toEqual(loc);
    expect(serializeLocation(loc)).toBe('{"lat":12.5,"lon":-3.25}');
  });

  it.each([
    ["missing", null],
    ["out-of-range lat", '{"lat":91,"lon":0}'],
    ["out-of-range lon", '{"lat":0,"lon":-180.5}'],
    ["numeric strings", '{"lat":"50","lon":"7"}'],
    ["non-numeric", '{"lat":"abc","lon":true}'],
    ["missing lon", '{"lat":50}'],
    ["null fields", '{"lat":null,"lon":null}'],
    ["huge exponent", '{"lat":1e400,"lon":0}'],
    ["malformed JSON", '{"lat":50,'],
    ["JSON null", "null"],
    ["JSON number", "42"],
    ["JSON array", "[50,7]"],
    ["markup", '{"lat":"<img src=x onerror=alert(1)>","lon":0}'],
  ])("falls back to the default for %s", (_, raw) => {
    expect(parseStoredLocation(raw)).toEqual(DEFAULT_LOCATION);
  });

  it("returns a fresh object each time", () => {
    expect(parseStoredLocation(null)).not.toBe(parseStoredLocation(null));
  });
});
