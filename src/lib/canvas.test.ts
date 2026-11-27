import { afterEach, describe, expect, it, vi } from "vitest";
import { fitCanvas, setMonoFont } from "./canvas";

function fakeCanvas(width: number, height: number) {
  const ctx = { setTransform: vi.fn(), font: "" };
  const canvas = {
    width: 0,
    height: 0,
    getBoundingClientRect: () => ({ width, height }),
    getContext: () => ctx,
  };
  return { canvas: canvas as unknown as HTMLCanvasElement, ctx };
}

afterEach(() => vi.unstubAllGlobals());

describe("fitCanvas", () => {
  it("scales the backing store by the device pixel ratio, capped at 2", () => {
    vi.stubGlobal("window", { devicePixelRatio: 3 });
    const { canvas, ctx } = fakeCanvas(100.4, 50);
    const fitted = fitCanvas(canvas);
    expect([canvas.width, canvas.height]).toEqual([201, 100]);
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect([fitted.w, fitted.h]).toEqual([100.4, 50]);
  });
  it("uses at least 1×1 pixels and DPR 1 when unknown", () => {
    vi.stubGlobal("window", { devicePixelRatio: 0 });
    const { canvas, ctx } = fakeCanvas(0, 0);
    fitCanvas(canvas);
    expect([canvas.width, canvas.height]).toEqual([1, 1]);
    expect(ctx.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
  });
  it("throws without a 2D context", () => {
    vi.stubGlobal("window", { devicePixelRatio: 1 });
    const canvas = {
      getBoundingClientRect: () => ({ width: 1, height: 1 }),
      getContext: () => null,
    } as unknown as HTMLCanvasElement;
    expect(() => fitCanvas(canvas)).toThrow(/2D context/);
  });
});

describe("setMonoFont", () => {
  it("builds the font shorthand", () => {
    const ctx = { font: "" } as CanvasRenderingContext2D;
    setMonoFont(ctx, 9.5, 500);
    expect(ctx.font).toBe("500 9.5px 'IBM Plex Mono', monospace");
    setMonoFont(ctx, 10);
    expect(ctx.font).toBe("400 10px 'IBM Plex Mono', monospace");
  });
});
