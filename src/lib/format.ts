/**
 * Locale-aware formatting helpers (Intl). The locale is fixed to de-DE until
 * localization (task 0014); times are shown in the device timezone.
 */

const LOCALE = "de-DE";

const timeFmt = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit" });
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long", year: "numeric" });
const longDateFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const weekdayFmt = new Intl.DateTimeFormat(LOCALE, { weekday: "short" });
const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const oneDecimalFmt = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** "21:05" */
export function formatTime(tMs: number): string {
  return timeFmt.format(tMs);
}

/** "27. November 2026" */
export function formatDate(tMs: number): string {
  return dateFmt.format(tMs);
}

/** "Freitag, 27. November 2026" */
export function formatLongDate(tMs: number): string {
  return longDateFmt.format(tMs);
}

/** Short weekday without the trailing dot: "Fr" */
export function formatWeekdayShort(tMs: number): string {
  return weekdayFmt.format(tMs).replace(".", "");
}

/** Angle rounded to whole degrees: "-5°", "62°". Rounds like Math.round (halves up). */
export function formatDeg(deg: number): string {
  // `+ 0` turns -0 into 0, so "-0°" never appears.
  return `${intFmt.format(Math.round(deg) + 0)}°`;
}

/** Latitude with one decimal and hemisphere: "50,9° Nord", "33,9° Süd". */
export function formatLatitude(latDeg: number): string {
  return `${oneDecimalFmt.format(Math.abs(latDeg))}° ${latDeg >= 0 ? "Nord" : "Süd"}`;
}
