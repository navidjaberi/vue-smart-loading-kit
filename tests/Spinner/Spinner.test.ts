import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";

const rootClass = {
  circle: ".vslk-spinner-circle",
  dots: ".vslk-spinner-dots",
  pulse: ".vslk-spinner-pulse",
  bars: ".v-spinner-bars",
  ring: ".spinner-ring",
  orbit: ".vslk-orbit",
  "pulse-dots": ".vslk-pulse-orbit",
  "orbit-dots": ".vslk-spinner-orbit-dots",
} as const;

describe("Spinner variant selection", () => {
  it("renders the circle variant by default", () => {
    const wrapper = mount(Spinner);

    expect(wrapper.find(rootClass.circle).exists()).toBe(true);
  });

  it.each(Object.entries(rootClass))(
    "renders %s via the `variant` prop",
    (variant, selector) => {
      const wrapper = mount(Spinner, { props: { variant: variant as any } });

      expect(wrapper.find(selector).exists()).toBe(true);
    }
  );

  it.each([
    ["pulseDots", rootClass["pulse-dots"]],
    ["orbitDots", rootClass["orbit-dots"]],
  ])("accepts the legacy camelCase name %s", (variant, selector) => {
    const wrapper = mount(Spinner, { props: { variant: variant as any } });

    expect(wrapper.find(selector).exists()).toBe(true);
  });

  it("still supports the deprecated `type` prop", () => {
    const wrapper = mount(Spinner, { props: { type: "dots" } });

    expect(wrapper.find(rootClass.dots).exists()).toBe(true);
  });

  it("prefers `variant` over `type` when both are set", () => {
    const wrapper = mount(Spinner, {
      props: { variant: "ring", type: "dots" },
    });

    expect(wrapper.find(rootClass.ring).exists()).toBe(true);
    expect(wrapper.find(rootClass.dots).exists()).toBe(false);
  });

  it("falls back to circle for an unknown variant", () => {
    const wrapper = mount(Spinner, { props: { variant: "nope" as any } });

    expect(wrapper.find(rootClass.circle).exists()).toBe(true);
  });
});
