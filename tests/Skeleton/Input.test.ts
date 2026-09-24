import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Input Variant", () => {
  it("renders correctly", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
      },
    });

    expect(wrapper.find(".vslk-sk-shape").exists()).toBe(true);
    expect(wrapper.find(".vslk-sk-input").exists()).toBe(true);
  });

  it("uses default width, height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
      },
    });

    const input = wrapper.find(".vslk-sk-input");

    expect(input.element).toHaveStyle({
      width: "100%",
      height: "44px",
      borderRadius: "10px",
    });
  });

  it("applies numeric width and height as px", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        width: 240,
        height: 56,
      },
    });

    const input = wrapper.find(".vslk-sk-input");

    expect(input.element).toHaveStyle({
      width: "240px",
      height: "56px",
    });
  });

  it("applies numeric radius as px", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        radius: 14,
      },
    });

    const input = wrapper.find(".vslk-sk-input");

    expect(input.element).toHaveStyle({
      borderRadius: "14px",
    });
  });

  it("accepts string values for width, height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        width: "50%",
        height: "3rem",
        radius: "999px",
      },
    });

    const input = wrapper.find(".vslk-sk-input");

    expect(input.element).toHaveStyle({
      width: "50%",
      height: "3rem",
      borderRadius: "999px",
    });
  });

  it("renders input-specific class", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
      },
    });

    expect(wrapper.find(".vslk-sk-input").exists()).toBe(true);
  });

  it("uses shimmer animation by default", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-shimmer");
  });

  it("switches to pulse animation", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        animation: "pulse",
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-pulse");
  });

  it("disables animation when animation is 'none'", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        animation: "none",
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--anim-none");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-duration: 0ms");
  });

  it("renders custom color", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        color: "#ff0000",
      },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-base: #ff0000");
  });

  it("renders custom highlight when explicitly provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        color: "#ff0000",
        highlight: "#00ff00",
      },
    });

    expect(wrapper.attributes("style")).toContain("--vslk-sk-hi: #00ff00");
  });

  it("auto-generates a highlight when none is provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        color: "#333333",
      },
    });

    const style = wrapper.attributes("style") ?? "";

    expect(style).toMatch(/--vslk-sk-hi:\s*[^;]+;/);
    expect(style).not.toContain("--vslk-sk-hi: #333333");
  });

  it("supports outlined mode", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        outlined: true,
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--outlined");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-outline-w: 1px");
    expect(wrapper.attributes("style")).toContain(
      "--vslk-sk-outline-style: solid"
    );
  });

  it("supports outlined mode with custom width and style", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        outlined: {
          enabled: true,
          width: 2,
          style: "dashed",
        },
      },
    });

    expect(wrapper.classes()).toContain("vslk-sk--outlined");
    expect(wrapper.attributes("style")).toContain("--vslk-sk-outline-w: 2px");
    expect(wrapper.attributes("style")).toContain(
      "--vslk-sk-outline-style: dashed"
    );
  });

  it("scales animation duration down as speed increases", () => {
    const slow = mount(Skeleton, {
      props: {
        variant: "input",
        animation: "shimmer",
        speed: 1,
      },
    });

    const fast = mount(Skeleton, {
      props: {
        variant: "input",
        animation: "shimmer",
        speed: 2,
      },
    });

    expect(slow.attributes("style")).toContain("--vslk-sk-duration: 1500ms");
    expect(fast.attributes("style")).toContain("--vslk-sk-duration: 750ms");
  });

  it("applies a custom shimmer angle", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
        angle: 45,
      },
    });

    expect(wrapper.attributes("style")).toContain(
      "--vslk-sk-shimmer-angle: 45deg"
    );
  });

  it("uses a 90deg shimmer angle by default", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "input",
      },
    });

    expect(wrapper.attributes("style")).toContain(
      "--vslk-sk-shimmer-angle: 90deg"
    );
  });
});
