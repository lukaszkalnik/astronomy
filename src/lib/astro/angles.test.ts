import { describe, expect, it } from "vitest";
import { normDeg } from "./angles";

describe("normDeg", () => {
  it("keeps angles already in [0, 360)", () => {
    expect(normDeg(0)).toBe(0);
    expect(normDeg(123.5)).toBe(123.5);
  });

  it("wraps angles of 360 and above", () => {
    expect(normDeg(360)).toBe(0);
    expect(normDeg(725)).toBe(5);
  });

  it("wraps negative angles", () => {
    expect(normDeg(-10)).toBe(350);
    expect(normDeg(-360)).toBe(0);
    expect(normDeg(-0)).toBe(0);
  });

  it("runs with the Europe/Berlin timezone", () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Europe/Berlin");
  });
});

// TEMPORARY: deliberately failing test to verify CI goes red (task 0005); reverted next commit.
import { test as tmpTest, expect as tmpExpect } from "vitest";
tmpTest("ci must fail", () => {
  tmpExpect(1).toBe(2);
});
