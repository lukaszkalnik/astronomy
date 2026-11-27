/** Time helpers and unit constants. Pure functions; local time = the runtime's timezone. */

export const MS_PER_MINUTE = 60_000;
export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY = 86_400_000;

/** Julian date of a Unix time in ms (JD 2440587.5 = 1970-01-01T00:00Z). */
export function julianDate(tMs: number): number {
  return tMs / MS_PER_DAY + 2440587.5;
}

/** Start (00:00 local time) of the local calendar day containing `tMs`. */
export function localDayStartMs(tMs: number): number {
  const d = new Date(tMs);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
