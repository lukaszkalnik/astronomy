/** Colour helpers. Pure functions. */

/** "#RRGGBB" (or "#RGB") plus alpha → "rgba(r, g, b, a)". Throws on anything else. */
export function hexToRgba(hex: string, alpha: number): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  const digits = m?.[1];
  if (!digits) throw new Error(`Not a hex colour: ${hex}`);
  const full = digits.length === 3 ? [...digits].map((c) => c + c).join("") : digits;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
