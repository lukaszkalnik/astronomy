/** Page state of the moon path page and persistence of the chosen location. */

export interface Location {
  latDeg: number;
  lonDeg: number;
}

export interface MoonPathState extends Location {
  /** Shown moment, Unix ms. */
  tMs: number;
  /** Interval id while "Tage abspielen" runs. */
  playTimer: number | null;
}

/** Cologne. */
export const DEFAULT_LOCATION: Readonly<Location> = { latDeg: 50.94, lonDeg: 6.96 };

/** localStorage key; the value is `{"lat":…,"lon":…}`. */
export const STORAGE_KEY = "moonPath.location";

function isNumberIn(v: unknown, min: number, max: number): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
}

/** Parse the stored location; anything invalid gives the default (Cologne). */
export function parseStoredLocation(raw: string | null): Location {
  if (raw === null) return { ...DEFAULT_LOCATION };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_LOCATION };
  }
  if (typeof value !== "object" || value === null) return { ...DEFAULT_LOCATION };
  const lat: unknown = (value as Record<string, unknown>)["lat"];
  const lon: unknown = (value as Record<string, unknown>)["lon"];
  if (!isNumberIn(lat, -90, 90) || !isNumberIn(lon, -180, 180)) return { ...DEFAULT_LOCATION };
  return { latDeg: lat, lonDeg: lon };
}

export function serializeLocation(loc: Location): string {
  return JSON.stringify({ lat: loc.latDeg, lon: loc.lonDeg });
}

/** Storage access can throw (private mode, blocked storage). */
function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadLocation(): Location {
  try {
    return parseStoredLocation(storage()?.getItem(STORAGE_KEY) ?? null);
  } catch {
    return { ...DEFAULT_LOCATION };
  }
}

export function saveLocation(loc: Location): void {
  try {
    storage()?.setItem(STORAGE_KEY, serializeLocation(loc));
  } catch {
    // Not persisted – the page still works.
  }
}

export function createState(nowMs: number): MoonPathState {
  return { tMs: nowMs, ...loadLocation(), playTimer: null };
}
