import { describe, expect, it } from "vitest";
import { hexToRgba } from "./color";

describe("hexToRgba", () => {
  it("converts 6- and 3-digit hex colours", () => {
    expect(hexToRgba("#0C1626", 0.86)).toBe("rgba(12, 22, 38, 0.86)");
    expect(hexToRgba(" #ffd79a ", 0)).toBe("rgba(255, 215, 154, 0)");
    expect(hexToRgba("#fff", 1)).toBe("rgba(255, 255, 255, 1)");
  });
  it("rejects other formats", () => {
    expect(() => hexToRgba("red", 1)).toThrow(/Not a hex colour/);
    expect(() => hexToRgba("#12345", 1)).toThrow();
  });
});
