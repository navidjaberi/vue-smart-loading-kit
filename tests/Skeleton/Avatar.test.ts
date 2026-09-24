import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Avatar Variant", () => {
  it("renders correctly", () => {
    const wrapper = mount(Skeleton, { props: { variant: "avatar" } });

    expect(wrapper.find(".vslk-sk-shape").exists()).toBe(true);
  });

  it("defaults to 48px size (equal width and height)", () => {
    const wrapper = mount(Skeleton, { props: { variant: "avatar" } });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("defaults radius to 9999px (fully circular)", () => {
    const wrapper = mount(Skeleton, { props: { variant: "avatar" } });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ borderRadius: "9999px" });
  });

  it("applies a custom numeric size to both width and height", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", size: 72 },
    });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ width: "72px", height: "72px" });
  });

  it("accepts a string size value", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", size: "4rem" },
    });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ width: "4rem", height: "4rem" });
  });

  it("supports a square avatar via a custom radius", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", radius: 12 },
    });

    const shape = wrapper.find(".vslk-sk-shape");
    expect(shape.element).toHaveStyle({ borderRadius: "12px" });
  });

  it("uses shimmer animation by default", () => {
    const wrapper = mount(Skeleton, { props: { variant: "avatar" } });

    expect(wrapper.classes()).toContain("vslk-sk--anim-shimmer");
  });

  it("switches to pulse animation", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", animation: "pulse" },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-pulse");
  });

  it("disables animation when animation is 'none'", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", animation: "none" },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-none");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-duration: 0ms");
  });

  it("renders custom color", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", color: "#7c3aed" },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-base: #7c3aed");
  });

  it("renders custom highlight when explicitly provided", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", color: "#7c3aed", highlight: "#41B780" },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-hi: #41B780");
  });

  it("supports outlined mode", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "avatar", outlined: true },
    });

    expect(wrapper.classes()).toContain("vslk-sk--outlined");
  });
});