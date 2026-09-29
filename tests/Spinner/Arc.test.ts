import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";
import type { SpinnerVariantName } from "../../src/components/Spinner/spinner.types";

const bar = (w: ReturnType<typeof mount>) =>
  w.find(".vslk-spinner-arc__bar").element as SVGCircleElement;
const track = (w: ReturnType<typeof mount>) => w.find(".vslk-spinner-arc__track");

describe("Arc spinner", () => {
  it("renders an SVG arc in a size x size box", () => {
    const wrapper = mount(Spinner, { props: { variant: "arc", size: 48 } });
    const svg = wrapper.find("svg.vslk-spinner-arc").element as SVGElement;

    expect([svg.style.width, svg.style.height]).toEqual(["48px", "48px"]);
    expect(bar(wrapper).getAttribute("stroke")).toBe("currentColor");
  });

  it.each([
    // [size, thickness] -> stroke-width in viewBox units (44 wide), radius
    [44, 6, "6", "19"],
    [88, 4, "2", "21"],
    ["3rem", 4, "4", "20"],
  ] as const)("size %s with thickness %dpx draws stroke %s, radius %s", (size, thickness, sw, r) => {
    const wrapper = mount(Spinner, { props: { variant: "arc", size, thickness } });

    expect(bar(wrapper).getAttribute("stroke-width")).toBe(sw);
    expect(bar(wrapper).getAttribute("r")).toBe(r);
  });

  it("is indeterminate by default, with speed-scaled animations", () => {
    const wrapper = mount(Spinner, { props: { variant: "arc", speed: 2 } });
    const svg = wrapper.find("svg").element as SVGElement;

    expect(svg.classList).toContain("vslk-spinner-arc--indeterminate");
    expect(svg.style.getPropertyValue("--vslk-arc-rotate")).toBe("1s");
    expect(svg.style.getPropertyValue("--vslk-arc-dash")).toBe("0.75s");
  });

  describe("determinate `value`", () => {
    it.each([
      [0, "0 100"],
      [65, "65 100"],
      [100, "100 100"],
      [-10, "0 100"],
      [140, "100 100"],
    ])("draws value %d as dasharray %s", (value, dash) => {
      const wrapper = mount(Spinner, { props: { variant: "arc", value } });

      expect(wrapper.find("svg").classes()).not.toContain("vslk-spinner-arc--indeterminate");
      expect(bar(wrapper).style.strokeDasharray).toBe(dash);
    });

    it("draws nothing at 0% (a round cap would still paint a dot)", () => {
      const empty = mount(Spinner, { props: { variant: "arc", value: 0 } });
      const some = mount(Spinner, { props: { variant: "arc", value: 1 } });

      expect(bar(empty).getAttribute("stroke-linecap")).toBe("butt");
      expect(bar(some).getAttribute("stroke-linecap")).toBe("round");
    });

    it("stays indeterminate for a non-finite value", () => {
      const wrapper = mount(Spinner, { props: { variant: "arc", value: NaN } });

      expect(wrapper.find("svg").classes()).toContain("vslk-spinner-arc--indeterminate");
    });

    it("is announced as a progressbar when labelled", () => {
      const wrapper = mount(Spinner, {
        props: { variant: "arc", value: 42.4, label: "Uploading" },
      });

      expect(wrapper.attributes()).toMatchObject({
        role: "progressbar",
        "aria-valuemin": "0",
        "aria-valuemax": "100",
        "aria-valuenow": "42",
        "aria-label": "Uploading",
      });
    });

    it("warns when used with a variant that cannot show progress", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      mount(Spinner, { props: { variant: "dots", value: 50 } });

      expect(warn.mock.calls.map((c) => String(c[0])).join("\n")).toMatch(/value.*"dots".*arc/);
      warn.mockRestore();
    });
  });
});

describe("Spinner `track`", () => {
  it.each([
    ["arc", false],
    ["ring", false],
    ["circle", true],
  ] as const)("%s shows a track by default: %s", (variant, shown) => {
    const wrapper = mount(Spinner, { props: { variant } });

    expect(wrapper.find("[data-vslk-track]").exists()).toBe(shown);
  });

  it.each(["arc", "ring", "circle"] as const)("%s track can be toggled and colored", (variant) => {
    const off = mount(Spinner, { props: { variant, track: false } });
    const on = mount(Spinner, { props: { variant, track: true } });
    const custom = mount(Spinner, { props: { variant, track: "#e5e7eb" } });

    expect(off.find("[data-vslk-track]").exists()).toBe(false);
    expect(on.find("[data-vslk-track]").attributes("data-vslk-track")).toBe("auto");
    expect(custom.find("[data-vslk-track]").attributes("data-vslk-track")).toBe("#e5e7eb");
  });

  it("arc track is a full circle behind the bar", () => {
    const wrapper = mount(Spinner, { props: { variant: "arc", track: "#e5e7eb" } });

    expect(track(wrapper).attributes("stroke")).toBe("#e5e7eb");
  });
});

describe("Spinner props reach only the variants that declare them", () => {
  const variants: SpinnerVariantName[] = [
    "circle", "dots", "pulse", "bars", "ring", "orbit", "pulse-dots", "orbit-dots", "arc",
  ];
  const propNames = ["variant", "type", "size", "color", "speed", "thickness", "label", "track", "value"];

  it.each(variants)("%s renders no prop as an HTML attribute", (variant) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const wrapper = mount(Spinner, {
      props: { variant, size: 40, color: "red", speed: 1, thickness: 3, track: true, value: 30 },
    });
    warn.mockRestore();

    const leaked = [...wrapper.element.querySelectorAll("*")]
      .filter((el) => !(el instanceof SVGElement))
      .flatMap((el) => [...el.attributes].map((a) => a.name))
      .filter((name) => propNames.includes(name));

    expect(leaked).toEqual([]);
  });
});
