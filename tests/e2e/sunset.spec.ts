import { expect, test, type Page } from "@playwright/test";
import {
  canvasData,
  expectNoHorizontalScrollAt360,
  expectNoProblems,
  isCanvasDrawn,
  trackProblems,
} from "./helpers";

const CANVASES = ["#sky", "#orbit", "#horizon"] as const;

/**
 * Fake clock paused before load: requestAnimationFrame only ticks when the
 * test advances time with `page.clock.runFor` (install alone runs in real time).
 */
async function pauseClock(page: Page): Promise<void> {
  await page.clock.install({ time: new Date("2026-06-21T12:00:00+02:00") });
  await page.clock.pauseAt(new Date("2026-06-21T12:00:01+02:00"));
}

async function expectCanvasesDrawn(page: Page): Promise<void> {
  for (const sel of CANVASES) {
    await expect.poll(() => isCanvasDrawn(page, sel), { message: `${sel} is blank` }).toBe(true);
  }
}

test("loads without errors and draws every canvas", async ({ page }) => {
  const problems = trackProblems(page);
  await pauseClock(page);
  await page.goto("sunset.html");
  await page.clock.runFor(200);
  await expect(page.locator("h1")).toContainText("die Bahn wird flacher");
  await expect(page.locator("#durSel")).toHaveText(/^\d+,\d{2} min$/);
  await expectCanvasesDrawn(page);
  expectNoProblems(problems);
});

test("no horizontal scroll at 360 px", async ({ page }) => {
  await page.goto("sunset.html");
  await expectNoHorizontalScrollAt360(page);
  await expectCanvasesDrawn(page);
});

test("latitude slider changes the shown duration", async ({ page }) => {
  const problems = trackProblems(page);
  await page.goto("sunset.html");
  const durSel = page.locator("#durSel");
  await expect(durSel).toHaveText(/min$/);
  const before = await durSel.textContent();

  await page.locator("#lat").fill("20");
  await expect(page.locator("#latVal")).toHaveText("20,0° N");
  await expect(durSel).toHaveText(/min$/);
  await expect(durSel).not.toHaveText(before ?? "");

  await page.getByRole("button", { name: "Tromsø" }).click();
  await expect(page.locator("#latVal")).toHaveText("69,7° N");
  expectNoProblems(problems);
});

test("polar states: midnight sun and polar night", async ({ page }) => {
  await page.goto("sunset.html");
  await page.locator("#lat").fill("70");
  await page.getByRole("button", { name: "Sommersonnenwende" }).click();
  await expect(page.locator("#warn")).toHaveClass(/\bon\b/);
  await expect(page.locator("#warn")).toContainText("Mitternachtssonne");
  await expect(page.locator("#factor")).toHaveText("∞");

  await page.getByRole("button", { name: "Wintersonnenwende" }).click();
  await expect(page.locator("#warn")).toContainText("Polarnacht");

  await page.getByRole("button", { name: "Frühlingspunkt" }).click();
  await expect(page.locator("#warn")).not.toHaveClass(/\bon\b/);
  await expect(page.locator("#durSel")).toHaveText(/min$/);
});

test("play/pause toggles the animation", async ({ page }) => {
  await pauseClock(page);
  await page.goto("sunset.html");
  const play = page.locator("#play");
  const clock = page.locator("#clock");
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await expect(play).toHaveText("Pause");

  // Running: the race clock advances (≈ 0.9 min per second).
  await page.clock.runFor(2000);
  await expect(clock).not.toHaveText("0,00 min");

  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  await expect(play).toHaveText("Abspielen");
  const paused = await clock.textContent();
  const sky = await canvasData(page, "#sky");
  await page.clock.runFor(2000);
  await expect(clock).toHaveText(paused ?? "");
  expect(await canvasData(page, "#sky")).toBe(sky);

  await play.click();
  await expect(play).toHaveAttribute("aria-pressed", "true");
  await page.clock.runFor(2000);
  await expect(clock).not.toHaveText(paused ?? "");
});

test.describe("with prefers-reduced-motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing autoplays", async ({ page }) => {
    await pauseClock(page);
    await page.goto("sunset.html");
    const play = page.locator("#play");
    await expect(play).toHaveAttribute("aria-pressed", "false");
    await expect(play).toHaveText("Abspielen");

    await page.clock.runFor(200);
    const sky = await canvasData(page, "#sky");
    const horizon = await canvasData(page, "#horizon");
    await page.clock.runFor(3000);
    await expect(page.locator("#clock")).toHaveText("0,00 min");
    expect(await canvasData(page, "#sky")).toBe(sky);
    expect(await canvasData(page, "#horizon")).toBe(horizon);
  });
});
