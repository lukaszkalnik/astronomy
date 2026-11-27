import { describe, expect, it } from "vitest";
import { cross, dot, normalize, scale } from "./vec3";

describe("vec3", () => {
  it("dot and cross follow the right-hand rule", () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });
  it("normalize returns unit length and keeps the zero vector", () => {
    const n = normalize([3, 0, 4]);
    expect(n).toEqual([0.6, 0, 0.8]);
    expect(normalize([0, 0, 0])).toEqual([0, 0, 0]);
  });
  it("scale multiplies every component", () => {
    expect(scale([1, -2, 3], 2)).toEqual([2, -4, 6]);
  });
});
