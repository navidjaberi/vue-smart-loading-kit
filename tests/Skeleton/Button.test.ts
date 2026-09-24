import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Button Variant", () => {
  it("renders correctly", () => {
    const wrapper = mount(Skeleton, { props: { variant: "button" } });

    expect(wrapper.find(".vslk-sk-shape").exists()).toBe(true);
  });

  it("defaults to 120px width and 40px height", () => {
    const wrapper = mount(Skeleton, { props: { variant: "button" } });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ width: "120px", height: "40px" });
  });

  it("defaults radius to 8px", () => {
    const wrapper = mount(Skeleton, { props: { variant: "button" } });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ borderRadius: "8px" });
  });

  it("applies custom width, height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", width: 160, height: 48, radius: 24 },
    });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({
      width: "160px",
      height: "48px",
      borderRadius: "24px",
    });
  });

  it("accepts string values for width, height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", width: "50%", height: "3rem", radius: "999px" },
    });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({
      width: "50%",
      height: "3rem",
      borderRadius: "999px",
    });
  });

  it("uses shimmer animation by default", () => {
    const wrapper = mount(Skeleton, { props: { variant: "button" } });

    expect(wrapper.classes()).toContain("vslk-sk--anim-shimmer");
  });

  it("switches to pulse animation", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", animation: "pulse" },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-pulse");
  });

  it("disables animation when animation is 'none'", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", animation: "none" },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-none");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-duration: 0ms");
  });

  it("renders custom color", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", color: "#7c3aed" },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-base: #7c3aed");
  });

  it("renders custom highlight when explicitly provided", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", color: "#7c3aed", highlight: "#41B780" },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-hi: #41B780");
  });

  it("supports outlined mode", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "button", outlined: true },
    });

    expect(wrapper.classes()).toContain("vslk-sk--outlined");
  });
});