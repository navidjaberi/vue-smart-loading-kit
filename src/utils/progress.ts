import type { HTMLAttributes } from "vue";

/** A usable 0–100 progress, or null for "indeterminate" (missing or non-finite). */
export function clampProgress(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : null;
}

/**
 * Accessibility attributes shared by every loading indicator. Decorative
 * (hidden) by default; with a label it is announced as a progressbar with
 * its percentage when progress is known, or as a live status otherwise.
 * In the status case the label is rendered as visually hidden text.
 */
export function progressA11y(label: string | undefined, progress: number | null): HTMLAttributes {
  if (!label) return { "aria-hidden": true };
  if (progress !== null)
    return {
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": Math.round(progress),
      "aria-label": label,
    };
  return { role: "status", "aria-live": "polite", "aria-busy": true };
}
