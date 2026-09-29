import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";
import { skeletonVariants } from "../../src/components/Skeleton/variants";
import type { SkeletonVariantName } from "../../src/components/Skeleton/types";

const variantNames = Object.keys(skeletonVariants) as SkeletonVariantName[];

/* The border is drawn by `.vslk-sk--outlined .vslk-sk-shape` using the
   --vslk-sk-outline-w / -style variables, which every shape reads from
   its NEAREST Skeleton container. Composite variants (table, card, ...)
   nest Skeletons, so each nested container must carry the same config. */
function outlineOfEveryShape(wrapper: ReturnType<typeof mount>) {
  const shapes = [...wrapper.element.querySelectorAll(".vslk-sk-shape")];
  expect(shapes.length).toBeGreaterThan(0);

  return shapes.map((shape) => {
    const container = shape.closest(".vslk-skeleton-container") as HTMLElement;
    return {
      outlined: container.classList.contains("vslk-sk--outlined"),
      width: container.style.getPropertyValue("--vslk-sk-outline-w"),
      style: container.style.getPropertyValue("--vslk-sk-outline-style"),
    };
  });
}

describe("Skeleton outline", () => {
  it.each(variantNames)("%s applies a custom width and style to every shape", (variant) => {
    const wrapper = mount(Skeleton, {
      props: { variant, outlined: { width: 3, style: "dashed" } },
    });

    for (const outline of outlineOfEveryShape(wrapper)) {
      expect(outline).toEqual({ outlined: true, width: "3px", style: "dashed" });
    }
  });

  it("defaults to a 1px solid outline for `outlined: true`", () => {
    const wrapper = mount(Skeleton, { props: { outlined: true } });

    expect(outlineOfEveryShape(wrapper)).toEqual([
      { outlined: true, width: "1px", style: "solid" },
    ]);
  });

  it("fills in defaults for a partial config", () => {
    const wrapper = mount(Skeleton, { props: { outlined: { style: "dotted" } } });

    expect(outlineOfEveryShape(wrapper)).toEqual([
      { outlined: true, width: "1px", style: "dotted" },
    ]);
  });

  it("accepts a CSS length string as the width", () => {
    const wrapper = mount(Skeleton, { props: { outlined: { width: "0.2rem" } } });

    expect(outlineOfEveryShape(wrapper)[0]!.width).toBe("0.2rem");
  });

  it.each([false, { enabled: false, width: 4 }] as const)(
    "is not outlined for %j",
    (outlined) => {
      const wrapper = mount(Skeleton, { props: { outlined } });

      expect(outlineOfEveryShape(wrapper)[0]!.outlined).toBe(false);
    }
  );
});
