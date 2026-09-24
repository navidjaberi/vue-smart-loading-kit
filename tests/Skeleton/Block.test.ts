import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Block Variant", () => {
  it("renders correctly", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
      },
    });

    expect(wrapper.find(".vslk-sk-shape").exists()).toBe(true);
  });

  it("applies width and height", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        width: 200,
        height: 50,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "200px",
      height: "50px",
    });
  });

  it("applies radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        radius: 12,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      borderRadius: "12px",
    });
  });

  it("accepts string values for width, height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        width: "50%",
        height: "2rem",
        radius: "8px",
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "50%",
      height: "2rem",
      borderRadius: "8px",
    });
  });

  it("uses shimmer animation by default", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-shimmer");
  });

  it("switches to pulse animation", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        animation: "pulse",
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-pulse");
  });

  it("disables animation when animation is 'none'", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        animation: "none",
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-none");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-duration: 0ms");
  });

  it("supports outlined mode (boolean form)", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        outlined: true,
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--outlined");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-outline-w: 1px");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-outline-style: solid");
  });

  it("supports outlined mode (object form with custom width/style)", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        outlined: { enabled: true, width: 2, style: "dashed" },
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--outlined");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-outline-w: 2px");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-outline-style: dashed");
  });

  it("renders custom color", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        color: "#ff0000",
      },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-base: #ff0000");
  });

  it("renders custom highlight when explicitly provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        color: "#ff0000",
        highlight: "#00ff00",
      },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-hi: #00ff00");
  });

  it("auto-generates a highlight when none is provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        color: "#333333",
      },
    });

    const style = wrapper.attributes("style") ?? "";
    // Should not fall back to the raw base color, and must set some highlight.
    expect(style).toMatch(/--vslk-sk-hi:\s*[^;]+;/);
    expect(style).not.toContain("--vslk-sk-hi: #333333");
  });

  it("scales animation duration down as speed increases", () => {
    const slow = mount(Skeleton, {
      props: { variant: "block", animation: "shimmer", speed: 1 },
    });
    const fast = mount(Skeleton, {
      props: { variant: "block", animation: "shimmer", speed: 2 },
    });

    expect(slow.attributes("style")).toContain("--vslk-sk-duration: 1500ms");
    expect(fast.attributes("style")).toContain("--vslk-sk-duration: 750ms");
  });

  it("applies a custom shimmer angle", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
        angle: 45,
      },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-shimmer-angle: 45deg");
  });

  it("uses a 90deg shimmer angle by default", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "block",
      },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-shimmer-angle: 90deg");
  });
});