import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";
import { skeletonVariants } from "../../src/components/Skeleton/variants";
import type { SkeletonVariantName } from "../../src/components/Skeleton/types";

const variantNames = Object.keys(skeletonVariants) as SkeletonVariantName[];

/* Every prop Skeleton accepts, set at once — none of them should ever
   surface as a raw HTML attribute on the rendered markup. */
const everyProp = {
  size: 40,
  width: 200,
  height: 20,
  radius: 6,
  color: "#e5e7eb",
  highlight: "#f3f4f6",
  animation: "pulse",
  speed: 2,
  striped: true,
  angle: 45,
  avatarSize: 32,
  lines: 2,
  outlined: true,
  options: {},
  label: "Loading",
} as const;

const propAttrNames = [
  "variant",
  ...Object.keys(everyProp),
  "avatar-size",
].map((name) => name.toLowerCase());

describe("Skeleton props do not leak into the DOM", () => {
  it.each(variantNames)("%s renders no prop as an HTML attribute", (variant) => {
    const wrapper = mount(Skeleton, { props: { variant, ...everyProp } });

    const leaked = [wrapper.element, ...wrapper.element.querySelectorAll("*")]
      // SVG shapes legitimately use width/height attributes (e.g. <rect>)
      .filter((el) => !(el instanceof SVGElement))
      .flatMap((el) => [...el.attributes].map((attr) => attr.name))
      .filter((name) => propAttrNames.includes(name));

    expect(leaked).toEqual([]);
  });

  it("still passes plain attributes (class, data-*) through to the container", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text" },
      attrs: { class: "my-skeleton", "data-testid": "sk" },
    });

    expect(wrapper.classes()).toContain("my-skeleton");
    expect(wrapper.attributes("data-testid")).toBe("sk");
  });
});

describe("Skeleton accessibility", () => {
  it("is hidden from assistive tech by default", () => {
    const wrapper = mount(Skeleton);

    expect(wrapper.attributes("aria-hidden")).toBe("true");
    expect(wrapper.attributes("role")).toBeUndefined();
  });

  it("announces itself as a polite, busy status when labelled", () => {
    const wrapper = mount(Skeleton, { props: { label: "Loading users" } });

    expect(wrapper.attributes()).toMatchObject({
      role: "status",
      "aria-live": "polite",
      "aria-busy": "true",
    });
    expect(wrapper.attributes("aria-hidden")).toBeUndefined();
    expect(wrapper.find(".vslk-sr-only").text()).toBe("Loading users");
  });

  it.each(variantNames)(
    "%s exposes no accessible role or name of its own",
    (variant) => {
      // The container is the single source of a11y semantics; a nested
      // role="img" / aria-label would be either hidden noise (unlabelled)
      // or a second, conflicting announcement (labelled).
      for (const label of [undefined, "Loading"]) {
        const wrapper = mount(Skeleton, { props: { variant, label } });
        const inner = wrapper.element.querySelectorAll("[role], [aria-label]");

        expect([...inner].map((el) => el.outerHTML)).toEqual([]);
      }
    }
  );
});
