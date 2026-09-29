/* The shimmer is a linear-gradient(angle) on a 300% x 300%, no-repeat
   background whose bright band crosses the image's center, slid with
   background-position. With a 300% image only 0%..100% keeps the box
   over the image; anything outside shows the empty no-repeat area
   (a hard cut-off edge) or nothing at all.

   So the slide runs between two OPPOSITE CORNERS of that valid range,
   picked by the sign of each axis of the gradient direction. Moving the
   box from corner to corner shifts it by its full width and height
   relative to the band, which always exceeds what the band needs to
   enter and leave the box completely (half the box's extent along the
   gradient + half the band's width = 0.65 of that extent) — for any
   angle and any aspect ratio. The band travels along the gradient's own
   direction, so 90deg sweeps left to right. */

const EPS = 1e-9;

export function shimmerPath(angle: number | string | undefined): {
  from: string;
  to: string;
} {
  const deg = typeof angle === "number" ? angle : parseFloat(String(angle));
  const rad = ((Number.isFinite(deg) ? deg : 90) * Math.PI) / 180;

  // CSS gradient direction: 0deg points up, 90deg points right (y grows down)
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);

  // The band moves along +direction, so the box starts at the +direction corner.
  const start = (v: number) => (v > EPS ? 100 : v < -EPS ? 0 : 50);
  const [x, y] = [start(dx), start(dy)];

  return { from: `${x}% ${y}%`, to: `${100 - x}% ${100 - y}%` };
}
