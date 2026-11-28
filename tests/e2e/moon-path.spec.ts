import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalScrollAt360,
  expectNoProblems,
  expectSvgsDrawn,
  trackProblems,
} from "./helpers";

/** Fixed "now" so readouts are deterministic (Sunday evening, Berlin time). */
const NOW = new Date("2026-03-15T21:00:00+01:00");
const FIGURES = ["#sky", "#year", "#cyc", "#phase"] as const;

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NOW);
});

test("loads without errors and draws every figure", async ({ page }) => {
  const problems = trackProblems(page);
  await page.goto("./");
  await expect(page).toHaveTitle("Mondbahn am Himmel");
  await expect(page.locator("#when")).toHaveText("Sonntag, 15. März 2026, 21:00 Uhr");
  await expectSvgsDrawn(page, FIGURES);
  await expect(page.locator("#moonMax")).not.toBeEmpty();
  await expect(page.locator("#nf")).not.toBeEmpty();
  expectNoProblems(problems);
});

test("no horizontal scroll at 360 px", async ({ page }) => {
  await page.goto("./");
  await expectNoHorizontalScrollAt360(page);
  await expectSvgsDrawn(page, FIGURES);
});

test("place, date and time change the readouts", async ({ page }) => {
  const problems = trackProblems(page);
  await page.goto("./");
  const latLbl = page.locator("#latLbl");
  const sunMax = page.locator("#sunMax");
  const sunNow = page.locator("#sunNow");
  const when = page.locator("#when");

  const sunMaxCologne = await sunMax.textContent();
  await page.locator("#place").selectOption({ label: "Kairo" });
  await expect(latLbl).not.toHaveText(/50/);
  await expect(sunMax).not.toHaveText(sunMaxCologne ?? "");

  const sunMaxMarch = await sunMax.textContent();
  await page.locator("#date").fill("2026-06-21");
  await expect(when).toHaveText(/^Sonntag, 21\. Juni 2026/);
  await expect(sunMax).not.toHaveText(sunMaxMarch ?? "");

  await expect(sunNow).toHaveText("unter dem Horizont");
  await page.locator("#time").fill("720");
  await expect(page.locator("#timeLbl")).toHaveText("12:00");
  await expect(when).toHaveText(/12:00 Uhr$/);
  await expect(sunNow).toHaveText(/hoch$/);
  expectNoProblems(problems);
});

test("„Vollmond ›“ jumps to the next full moon", async ({ page }) => {
  await page.goto("./");
  const nextFullDate = await page.locator("#nf").textContent();
  await expect(page.locator("#phaseTxt")).not.toHaveText(/^Vollmond/);

  await page.getByRole("button", { name: "Vollmond ›" }).click();
  await expect(page.locator("#phaseTxt")).toHaveText(/^Vollmond, (9[89]|100) %$/);
  // The shown day is the full moon date announced before the jump.
  const { day, month, year } = parseGermanDate(nextFullDate ?? "");
  await expect(page.locator("#date")).toHaveValue(`${year}-${month}-${day}`);
});

test("chosen location survives a reload", async ({ page }) => {
  await page.goto("./");
  await page.locator("#place").selectOption({ label: "Nordkap" });
  const latText = await page.locator("#latLbl").textContent();

  await page.reload();
  await expect(page.locator("#place option:checked")).toHaveText("Nordkap");
  await expect(page.locator("#latLbl")).toHaveText(latText ?? "");
});

test("an invalid stored location falls back to Köln", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("moonPath.location", '{"lat":"<img src=x onerror=alert(1)>","lon":1}');
  });
  const problems = trackProblems(page);
  page.on("dialog", (d) => problems.push(`dialog: ${d.message()}`));
  await page.goto("./");
  await expect(page.locator("#place option:checked")).toHaveText("Köln");
  expectNoProblems(problems);
});

const MONTHS_DE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/** "3. April 2026" (de-DE `formatDate`) → zero-padded parts. */
function parseGermanDate(text: string): { day: string; month: string; year: string } {
  const m = /^(\d{1,2})\. (\S+) (\d{4})$/.exec(text.trim());
  const monthIndex = MONTHS_DE.indexOf(m?.[2] ?? "");
  if (!m?.[1] || !m[3] || monthIndex < 0) throw new Error(`Not a German date: ${text}`);
  return {
    day: m[1].padStart(2, "0"),
    month: String(monthIndex + 1).padStart(2, "0"),
    year: m[3],
  };
}
