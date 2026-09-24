import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Text Variant", () => {
  it("renders a single shape by default (no lines prop)", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text" },
    });

    expect(wrapper.findAll(".vslk-sk-shape")).toHaveLength(1);
  });

  it("renders a single shape when lines=1 explicitly", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 1 },
    });                                       
    expect(wrapper.findAll(".vslk-sk-shape")).toHaveLength(1);
  });
  it("does not wrap single-line output (backward compatible DOM)", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text" },
    });

    expect(wrapper.find(".vslk-sk-text-lines").exists()).toBe(false);
  });

  it("applies default width/height/radius on single line", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", width: 180, height: 20, radius: 6 },
    });

    const shape = wrapper.find(".vslk-sk-shape");

    expect(shape.element).toHaveStyle({
      width: "180px",
      height: "20px",
      borderRadius: "6px",
    });
  });

  it("renders multiple lines when lines > 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 3 },
    });

    expect(wrapper.findAll(".vslk-sk-shape")).toHaveLength(3);
  });

  it("wraps multi-line output in a lines container", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 3 },
    });

    expect(wrapper.find(".vslk-sk-text-lines").exists()).toBe(true);
  });

  it("clamps lines to a minimum of 1 for invalid values", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 0 },
    });

    expect(wrapper.findAll(".vslk-sk-shape")).toHaveLength(1);
  });

  it("gives every line the same height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 3, height: 18, radius: 5 },
    });

    const shapes = wrapper.findAll(".vslk-sk-shape");

    shapes.forEach((shape) => {
      expect(shape.element).toHaveStyle({
        height: "18px",
        borderRadius: "5px",
      });
    });
  });

  it("makes the last line shorter (default 60%) while others match width", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 3, width: 300 },
    });

    const shapes = wrapper.findAll(".vslk-sk-shape");

    expect(shapes[0].element).toHaveStyle({ width: "300px" });
    expect(shapes[1].element).toHaveStyle({ width: "300px" });
    expect(shapes[2].element).toHaveStyle({ width: "60%" });
  });

  it("supports a custom lastLineWidth via options", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "text",
        lines: 2,
        width: 300,
        options: { lastLineWidth: "40%" },
      },
    });

    const shapes = wrapper.findAll(".vslk-sk-shape");

    expect(shapes[1].element).toHaveStyle({ width: "40%" });
  });

  it("supports a custom gap between lines via options", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "text",
        lines: 2,
        options: { gap: 16 },
      },
    });

    const container = wrapper.find(".vslk-sk-text-lines");

    expect(container.element).toHaveStyle({ gap: "16px" });
  });

  it("applies animation classes to every line, not just the first", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "text", lines: 3, animation: "shimmer" },
    });
    expect(wrapper.classes()).toContain("vslk-sk--anim-shimmer");
    expect(wrapper.findAll(".vslk-sk-shape")).toHaveLength(3);
  });
});