import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";

describe("Ring Variant", () => {
  it("renders correctly with 4 segments", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring" },
    });

    expect(wrapper.find(".spinner-ring").exists()).toBe(true);
    expect(wrapper.findAll(".spinner-ring .segment")).toHaveLength(4);
  });

  it("applies Spinner's default size (40) as container width", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring" },
    });

    expect(wrapper.find(".spinner-ring").element).toHaveStyle({ width: "40px" });
  });

  it("applies a custom size", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring", size: 80 },
    });

    expect(wrapper.find(".spinner-ring").element).toHaveStyle({ width: "80px" });
  });

  it("applies thickness as border-width on every segment", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring", thickness: 6 },
    });

    wrapper.findAll(".segment").forEach((segment) => {
      expect(segment.element).toHaveStyle({ borderWidth: "6px" });
    });
  });

  it("falls back to Spinner's default thickness (4px) when not provided", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring" },
    });

    expect(wrapper.find(".segment").element).toHaveStyle({ borderWidth: "4px" });
  });

  it("builds a single-arc border color (top colored, rest transparent)", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring", color: "#7c3aed" },
    });

    wrapper.findAll(".segment").forEach((segment) => {
      const style = getComputedStyle(segment.element);
      expect(style.borderTopColor).toBe("rgb(124, 58, 237)");
      expect(style.borderRightColor).toBe("rgba(0, 0, 0, 0)");
      expect(style.borderBottomColor).toBe("rgba(0, 0, 0, 0)");
      expect(style.borderLeftColor).toBe("rgba(0, 0, 0, 0)");
    });
  });

  it("derives animation duration from 1 / speed", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring", speed: 2 },
    });

    wrapper.findAll(".segment").forEach((segment) => {
      expect(segment.element).toHaveStyle({ animationDuration: "0.5s" });
    });
  });

  it("guards against speed = 0 (would otherwise produce 'Infinitys')", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring", speed: 0 },
    });

    const segment = wrapper.find(".segment");

    expect(segment.element).toHaveStyle({ animationDuration: "1s" });
    expect(segment.attributes("style")).not.toContain("Infinity");
  });

  it("falls back to Spinner's defaults (size 40, color #3b82f6, speed 1, thickness 4) when omitted", () => {
    const wrapper = mount(Spinner, {
      props: { type: "ring" },
    });

    const container = wrapper.find(".spinner-ring");
    const segment = wrapper.find(".segment");
    const segmentStyle = getComputedStyle(segment.element);

    expect(container.element).toHaveStyle({ width: "40px" });
    expect(segment.element).toHaveStyle({
      borderWidth: "4px",
      animationDuration: "1s",
    });
    expect(segmentStyle.borderTopColor).toBe("rgb(59, 130, 246)");
    expect(segmentStyle.borderRightColor).toBe("rgba(0, 0, 0, 0)");
  });
});