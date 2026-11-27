/**
 * Canvas colours. The CSS custom properties in style.css are the single source
 * of truth; this reads them once at start-up.
 */

import { hexToRgba } from "../../lib/color";

const TOKENS = {
  ink: "--ink",
  ink2: "--ink-2",
  line: "--line",
  brass: "--brass",
  brassDim: "--brass-dim",
  ivory: "--ivory",
  dim: "--ivory-dim",
  cyan: "--cyan",
  rose: "--rose",
  sun: "--sun",
  earth: "--earth",
  duskTop: "--dusk-top",
  duskMid: "--dusk-mid",
  duskLow: "--dusk-low",
} as const;

export type Theme = Record<keyof typeof TOKENS, string> & {
  /** Same colour with an alpha channel, for translucent fills and glows. */
  alpha: (colour: string, a: number) => string;
};

export function readTheme(root: Element = document.documentElement): Theme {
  const style = getComputedStyle(root);
  const entries = Object.entries(TOKENS).map(([key, prop]) => {
    const value = style.getPropertyValue(prop).trim();
    if (!value) throw new Error(`CSS custom property ${prop} is not set`);
    return [key, value];
  });
  return {
    ...(Object.fromEntries(entries) as Record<keyof typeof TOKENS, string>),
    alpha: hexToRgba,
  };
}
