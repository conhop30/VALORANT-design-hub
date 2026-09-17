import { spacing } from "../theme";

export interface ContentLayoutMetrics {
  maxWidth: number;
  gutter: number;
}

// Bands are loosely anchored to Electron's WINDOW_SIZE_PRESETS (compact 1024,
// standard 1280, large 1600 — electron/main.js) but apply continuously to any
// windowWidth (freeform resize, a browser tab, etc.), not a fixed reference canvas.
const BANDS: (ContentLayoutMetrics & { minWidth: number })[] = [
  { minWidth: 0, maxWidth: 640, gutter: spacing.md },
  { minWidth: 1024, maxWidth: 760, gutter: spacing.lg },
  { minWidth: 1440, maxWidth: 880, gutter: spacing.xl },
];

/** Pure — no store/RN dependency, so it's unit tested directly. */
export function getContentLayoutMetrics(windowWidth: number): ContentLayoutMetrics {
  let picked = BANDS[0];
  for (const band of BANDS) {
    if (windowWidth >= band.minWidth) picked = band;
  }
  return { maxWidth: picked.maxWidth, gutter: picked.gutter };
}
