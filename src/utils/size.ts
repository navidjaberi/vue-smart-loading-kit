export type CssSize = number | string;

const PX = /^\s*(-?\d*\.?\d+)px\s*$/;

/** Numbers — and plain "<n>px" strings — as a number of pixels; any
 *  other CSS length (rem, %, calc(), ...) can't be reduced, so null. */
export function toPx(size: CssSize): number | null {
  if (typeof size === "number") return size;
  const match = PX.exec(size);
  return match ? Number(match[1]) : null;
}

/** A CSS length: numbers become px, strings pass through. */
export function toCssSize(size: CssSize): string {
  return typeof size === "number" ? `${size}px` : size;
}

/** `size * n` or `size / n` as a CSS length. Pixel sizes are computed
 *  in JS (so `60` and `"60px"` render identically); any other unit is
 *  left to the browser via calc(). */
export function scaleSize(size: CssSize, op: "*" | "/", n: number): string {
  const px = toPx(size);
  if (px != null) return `${op === "*" ? px * n : px / n}px`;
  return `calc(${size} ${op} ${n})`;
}
