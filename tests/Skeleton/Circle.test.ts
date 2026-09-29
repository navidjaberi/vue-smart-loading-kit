// tests/components/Circle.spec.ts
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Circle Variant", () => {
  it("renders correctly", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
      },
    });

    expect(wrapper.find(".vslk-sk-shape").exists()).toBe(true);
  });

  it("renders with default size", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
    });
  });

  it("uses size prop for both width and height", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        size: 80,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "80px",
      height: "80px",
      borderRadius: "50%",
    });
  });

  it("uses width prop when size is not provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        width: 96,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "96px",
      height: "96px",
      borderRadius: "50%",
    });
  });

  it("uses height prop when size and width are not provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        height: 120,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "120px",
      height: "120px",
      borderRadius: "50%",
    });
  });

  it("prioritizes size over width and height", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        size: 64,
        width: 100,
        height: 120,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "64px",
      height: "64px",
    });
  });

  it("prioritizes width over height", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        width: 90,
        height: 120,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "90px",
      height: "90px",
    });
  });

  it("always renders as a circle", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        size: 72,
      },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      borderRadius: "50%",
    });
  });

  it("forwards animation prop", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        animation: "pulse",
      },
    });

    expect(
      wrapper.find(".vslk-sk--anim-pulse").exists()
    ).toBe(true);
  });

  it("forwards custom color and highlight", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        color: "#ff0000",
        highlight: "#00ff00",
      },
    });

    const skeleton = wrapper.findComponent(Skeleton);
    const style = skeleton.attributes("style") || "";

    expect(style).toContain("--vslk-sk-base: #ff0000");
    expect(style).toContain("--vslk-sk-hi: #00ff00");
  });

  it("forwards speed and angle", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        speed: 2,
        angle: 45,
      },
    });

    const skeleton = wrapper.findComponent(Skeleton);
    const style = skeleton.attributes("style") || "";

    expect(style).toContain("--vslk-sk-duration: 750ms");
    expect(style).toContain("--vslk-sk-shimmer-angle: 45deg");
  });

  it("forwards outlined prop", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "circle",
        outlined: true,
      },
    });

    const outlined = wrapper.find(".vslk-sk--outlined");

    expect(outlined.exists()).toBe(true);

    const style = outlined.attributes("style") || "";

    expect(style).toContain("--vslk-sk-outline-w: 1px");
    expect(style).toContain("--vslk-sk-outline-style: solid");
  });

  it.each([
    [{ size: "4rem" }, "4rem"],
    [{ size: "50%" }, "50%"],
    [{ width: "3em" }, "3em"],
    [{ height: "2.5rem" }, "2.5rem"],
  ])("accepts CSS string sizes %j", (sizeProps, expected) => {
    const wrapper = mount(Skeleton, {
      props: { variant: "circle", ...sizeProps },
    });

    expect(wrapper.find(".vslk-sk-shape").element).toHaveStyle({
      width: expected,
      height: expected,
    });
  });

  it("prioritizes a string size over a numeric width", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "circle", size: "4rem", width: 100 },
    });

    expect(wrapper.find(".vslk-sk-shape").element).toHaveStyle({ width: "4rem" });
  });
});
