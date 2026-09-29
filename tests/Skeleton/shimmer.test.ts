import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

/* Geometry model of the shimmer (see Skeleton.vue styles):
   - the sheen is a linear-gradient(angle) painted on a 300% x 300%,
     no-repeat background, with its bright band at 45%-50%-55% of the
     gradient line, i.e. centered on the image and 10% of the line wide;
   - the animation slides background-position from
     --vslk-sk-shimmer-from to --vslk-sk-shimmer-to.
   With a 300% image, background-position p% puts the box over image
   region [2W·p, 2W·p + W] — only 0%..100% keeps the box on the image;
   outside that the box shows the empty (no-repeat) area, which is what
   produced hard cut-off edges. */

const EPS = 1e-6;

function parsePosition(value: string): [number, number] {
  const parts = value.trim().split(/\s+/).map((p) => parseFloat(p) / 100);
  expect(parts).toHaveLength(2);
  return parts as [number, number];
}

function shimmerPath(angle: number | string) {
  const style = (mount(Skeleton, { props: { angle } }).element as HTMLElement).style;
  return {
    from: parsePosition(style.getPropertyValue("--vslk-sk-shimmer-from")),
    to: parsePosition(style.getPropertyValue("--vslk-sk-shimmer-to")),
  };
}

/** Signed distance (px) of the band's center from the box's center,
 *  measured along the gradient direction, for a W x H box. */
function bandOffset([px, py]: [number, number], deg: number, W: number, H: number) {
  const rad = (deg * Math.PI) / 180;
  const [dx, dy] = [Math.sin(rad), -Math.cos(rad)];
  // box center relative to image center; the band sits on the image center
  const [cx, cy] = [W * (2 * px - 1), H * (2 * py - 1)];
  return -(cx * dx + cy * dy);
}

/** How far the band must be from the box center to be fully out of view:
 *  half the box's extent along the gradient + half the band's width. */
function clearance(deg: number, W: number, H: number) {
  const rad = (deg * Math.PI) / 180;
  const extent = W * Math.abs(Math.sin(rad)) + H * Math.abs(Math.cos(rad));
  const halfBand = 0.05 * 3 * extent;
  return extent / 2 + halfBand;
}

const angles = Array.from({ length: 360 }, (_, deg) => deg);
const shapes: [string, number, number][] = [
  ["wide", 200, 20],
  ["square", 40, 40],
  ["tall", 20, 200],
];

describe("Skeleton shimmer path", () => {
  it.each(angles)("%d° keeps the box on the gradient image (no cut edges)", (deg) => {
    const { from, to } = shimmerPath(deg);

    for (const v of [...from, ...to]) {
      expect(v).toBeGreaterThanOrEqual(0 - EPS);
      expect(v).toBeLessThanOrEqual(1 + EPS);
    }
  });

  it.each(angles)("%d° sweeps the band fully across the box, along the angle", (deg) => {
    const { from, to } = shimmerPath(deg);

    for (const [, W, H] of shapes) {
      const need = clearance(deg, W, H);
      // starts fully out of view behind the box, ends fully out ahead of it
      expect(bandOffset(from, deg, W, H)).toBeLessThanOrEqual(-need + EPS);
      expect(bandOffset(to, deg, W, H)).toBeGreaterThanOrEqual(need - EPS);
    }
  });

  it("moves left to right at the default 90°", () => {
    const { from, to } = shimmerPath(90);

    expect(from[0]).toBeGreaterThan(to[0]);
  });

  it("accepts the angle as a deg string", () => {
    expect(shimmerPath("236deg")).toEqual(shimmerPath(236));
  });
});
