/** Preset locations of the place menu. Longitude east positive. */

export interface Place {
  name: string;
  latDeg: number;
  lonDeg: number;
}

export const PLACES: readonly Place[] = [
  { name: "Köln", latDeg: 50.94, lonDeg: 6.96 },
  { name: "Gliwice", latDeg: 50.29, lonDeg: 18.67 },
  { name: "Nordkap", latDeg: 71.17, lonDeg: 25.78 },
  { name: "Rom", latDeg: 41.9, lonDeg: 12.5 },
  { name: "Kairo", latDeg: 30.04, lonDeg: 31.24 },
  { name: "Äquator (Quito)", latDeg: -0.18, lonDeg: -78.47 },
  { name: "Sydney", latDeg: -33.87, lonDeg: 151.21 },
];
