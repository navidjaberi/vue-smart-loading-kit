import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";

const ROOT = ".vslk-spinner-pulse";

const mountPulse = (props: Record<string, unknown> = {}) =>
  mount(Spinner, { props: { type: "pulse", ...props } });

const styleOf = (wrapper: ReturnType<typeof mountPulse>) =>
  wrapper.find(ROOT).attributes("style") ?? "";

describe("Pulse Spinner (via Spinner wrapper, type='pulse')", () => {
  it("renders with the vslk-spinner-pulse root class", () => {
    const wrapper = mountPulse();
    expect(wrapper.find(ROOT).exists()).toBe(true);
  });

  it("renders the core and wave elements", () => {
    const wrapper = mountPulse();
    expect(wrapper.find(".vslk-spinner-pulse__core").exists()).toBe(true);
    expect(wrapper.find(".vslk-spinner-pulse__wave").exists()).toBe(true);
  });

  it("applies the default size (40px) as width and height", () => {
    const wrapper = mountPulse();
    expect(wrapper.find(ROOT).element).toHaveStyle({
      width: "40px",
      height: "40px",
    });
  });

  it("applies a custom numeric size as px", () => {
    const wrapper = mountPulse({ size: 72 });
    expect(wrapper.find(ROOT).element).toHaveStyle({
      width: "72px",
      height: "72px",
    });
  });

  it("accepts a string size value directly", () => {
    const wrapper = mountPulse({ size: "3rem" });
    expect(wrapper.find(ROOT).element).toHaveStyle({ width: "3rem" });
  });

  it("exposes the default color via the --vslk-pulse-color variable", () => {
    const wrapper = mountPulse();
    expect(styleOf(wrapper)).toContain("--vslk-pulse-color: currentColor");
  });

  it("exposes a custom color via the --vslk-pulse-color variable", () => {
    const wrapper = mountPulse({ color: "#7c3aed" });
    expect(styleOf(wrapper)).toContain("--vslk-pulse-color: #7c3aed");
  });

  it("uses a 1s duration for the default speed (1)", () => {
    const wrapper = mountPulse();
    expect(styleOf(wrapper)).toContain("--vslk-pulse-duration: 1s");
  });

  it("derives the duration from 1 / speed", () => {
    const wrapper = mountPulse({ speed: 2 });
    expect(styleOf(wrapper)).toContain("--vslk-pulse-duration: 0.5s");
  });

  it("supports fractional speeds", () => {
    const wrapper = mountPulse({ speed: 0.5 });
    expect(styleOf(wrapper)).toContain("--vslk-pulse-duration: 2s");
  });

  it("falls back to a 1s duration for an invalid (zero) speed", () => {
    const wrapper = mountPulse({ speed: 0 });
    expect(styleOf(wrapper)).toContain("--vslk-pulse-duration: 1s");
  });

  it("falls back to a 1s duration for a non-finite speed", () => {
    const wrapper = mountPulse({ speed: Number.NaN });
    expect(styleOf(wrapper)).toContain("--vslk-pulse-duration: 1s");
  });

  it("is correctly dispatched by the Spinner wrapper for type='pulse'", () => {
    const wrapper = mountPulse();
    expect(wrapper.find(ROOT).exists()).toBe(true);
    const other = mount(Spinner, { props: { type: "circle" } });
    expect(other.find(ROOT).exists()).toBe(false);
  });
});
