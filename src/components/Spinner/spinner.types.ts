export type SpinnerVariantName =
  | "circle"
  | "dots"
  | "pulse"
  | "bars"
  | "ring"
  | "orbit"
  | "pulse-dots"
  | "orbit-dots"
  | "arc";

/** camelCase spellings accepted by the legacy `type` prop (v0.1.0). */
export type SpinnerLegacyType = "pulseDots" | "orbitDots";

/** @deprecated Use `SpinnerVariantName` with the `variant` prop. */
export type SpinnerType = SpinnerVariantName | SpinnerLegacyType;

export interface SpinnerProps {
  variant?: SpinnerVariantName | SpinnerLegacyType;
  /** @deprecated Use `variant`. Kept for backward compatibility with v0.1.0. */
  type?: SpinnerType;
  size?: number | string;
  color?: string;
  speed?: number;
  thickness?: number;
  label?: string;
  /** Faint full circle behind the moving part (circle, ring, arc).
   *  `true` derives it from `color`; a string sets its color. */
  track?: boolean | string;
  /** 0–100: turns `arc` into a determinate progress indicator. */
  value?: number;
}
