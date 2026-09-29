import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";
import type { SpinnerVariantName } from "../../src/components/Spinner/spinner.types";

/* `size` is typed `number | string`, so any CSS length must work — not
   just numbers, and not just "px" strings that happen to survive
   parseInt(). Each row names an element whose inline style must be
   derived from the given size (directly, or via calc() for parts that
   are a fraction of it, like dots and bars). */
const sizedParts: [SpinnerVariantName, string, string][] = [
  ["circle", ".vslk-spinner-circle", "width"],
  ["pulse", ".vslk-spinner-pulse", "width"],
  ["dots", ".vslk-spinner-dots span", "width"],
  ["bars", ".v-spinner-bars", "height"],
  ["bars", ".v-spinner-bars span", "width"],
  ["ring", ".spinner-ring", "width"],
  ["orbit", ".vslk-orbit", "width"],
  ["orbit", ".vslk-orbit", "--vslk-dot-size"],
  ["pulse-dots", ".vslk-pulse-orbit", "width"],
  ["pulse-dots", ".vslk-pulse-orbit .dot", "width"],
  ["orbit-dots", ".vslk-spinner-orbit-dots", "width"],
  ["orbit-dots", ".vslk-spinner-orbit-dots .dot-core", "width"],
  ["arc", "svg.vslk-spinner-arc", "width"],
];

const allVariants = [...new Set(sizedParts.map(([v]) => v))];

describe("Spinner string sizes", () => {
  it.each(allVariants)("%s never renders a broken length", (variant) => {
    const html = mount(Spinner, { props: { variant, size: "3rem" } }).html();

    expect(html).not.toMatch(/NaN|Infinity|undefined|rempx|pxpx/);
  });

  it.each(sizedParts)(
    "%s derives %s %s from a rem size",
    (variant, selector, property) => {
      const wrapper = mount(Spinner, { props: { variant, size: "3rem" } });
      const el = wrapper.find(selector).element as HTMLElement;

      // the browser may simplify calc(3rem * 0.25) to calc(0.75rem), so
      // assert on the unit: a size lost to parseInt() would come out as px
      expect(el.style.getPropertyValue(property)).toMatch(/\drem\b/);
    }
  );

  it.each(allVariants)("%s renders a px string exactly like the same number", (variant) => {
    const fromString = mount(Spinner, { props: { variant, size: "60px" } }).html();
    const fromNumber = mount(Spinner, { props: { variant, size: 60 } }).html();

    expect(fromString).toBe(fromNumber);
  });
});
