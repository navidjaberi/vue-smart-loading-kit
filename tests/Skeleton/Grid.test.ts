import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

describe("Grid Variant", () => {
  it("renders correctly", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
      },
    });

    expect(wrapper.find(".vslk-grid").exists()).toBe(true);
  });

  it("renders the default number of items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
      },
    });

    expect(wrapper.findAll(".vslk-grid__item")).toHaveLength(6);
  });

  it("renders rows multiplied by columns", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          rows: 3,
          columns: 4,
        },
      },
    });

    expect(wrapper.findAll(".vslk-grid__item")).toHaveLength(12);
  });

  it("uses itemCount instead of rows multiplied by columns", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          rows: 5,
          columns: 5,
          itemCount: 7,
        },
      },
    });

    expect(wrapper.findAll(".vslk-grid__item")).toHaveLength(7);
  });

  it("renders at least one item when itemCount is zero", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          itemCount: 0,
        },
      },
    });

    expect(wrapper.findAll(".vslk-grid__item")).toHaveLength(1);
  });

  it("renders at least one row and one column", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          rows: 0,
          columns: 0,
        },
      },
    });

    expect(wrapper.findAll(".vslk-grid__item")).toHaveLength(1);
  });

  it("applies fixed columns layout by default", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          rows: 2,
          columns: 4,
        },
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    });
  });

  it("applies auto-fit layout when minItemWidth is provided", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          minItemWidth: 220,
        },
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    });
  });

  it("supports string values for minItemWidth", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          minItemWidth: "18rem",
        },
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
    });
  });

  it("applies default grid styles", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      width: "100%",
      gap: "16px",
      padding: "0",
    });
  });

  it("applies custom gap and padding", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          gap: 24,
          padding: 20,
        },
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      gap: "24px",
      padding: "20px",
    });
  });

  it("accepts string values for gap and padding", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          gap: "1.5rem",
          padding: "2rem",
        },
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      gap: "1.5rem",
      padding: "2rem",
    });
  });

  it("applies custom grid width", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        width: 800,
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      width: "800px",
    });
  });

  it("accepts string values for grid width", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        width: "80%",
      },
    });

    const grid = wrapper.find(".vslk-grid");

    expect(grid.element).toHaveStyle({
      width: "80%",
    });
  });

  it("uses default item height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
      },
    });

    const shapes = wrapper.findAll(".vslk-grid__item .vslk-sk-shape");

    expect(shapes).toHaveLength(6);

    shapes.forEach((shape) => {
      expect(shape.element).toHaveStyle({
        width: "100%",
        height: "140px",
        borderRadius: "12px",
      });
    });
  });

  it("applies custom item height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          itemHeight: 180,
          itemRadius: 20,
        },
      },
    });

    const shapes = wrapper.findAll(".vslk-grid__item .vslk-sk-shape");

    expect(shapes).toHaveLength(6);

    shapes.forEach((shape) => {
      expect(shape.element).toHaveStyle({
        width: "100%",
        height: "180px",
        borderRadius: "20px",
      });
    });
  });

  it("accepts string values for item height and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        options: {
          itemHeight: "10rem",
          itemRadius: "1.5rem",
        },
      },
    });

    const shapes = wrapper.findAll(".vslk-grid__item .vslk-sk-shape");

    expect(shapes).toHaveLength(6);

    shapes.forEach((shape) => {
      expect(shape.element).toHaveStyle({
        width: "100%",
        height: "10rem",
        borderRadius: "1.5rem",
      });
    });
  });

  it("forwards animation to all grid items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        animation: "pulse",
      },
    });

    const animatedItems = wrapper.findAll(
      ".vslk-grid__item .vslk-sk--anim-pulse"
    );

    expect(animatedItems).toHaveLength(6);
  });

  it("forwards none animation to all grid items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        animation: "none",
      },
    });

    const animatedItems = wrapper.findAll(
      ".vslk-grid__item .vslk-sk--anim-none"
    );

    expect(animatedItems).toHaveLength(6);

    animatedItems.forEach((item) => {
      expect(item.attributes("style")).toContain("--vslk-sk-duration: 0ms");
    });
  });

  it("forwards outlined mode to all grid items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        outlined: true,
      },
    });

    const outlinedItems = wrapper.findAll(
      ".vslk-grid__item .vslk-sk--outlined"
    );

    expect(outlinedItems).toHaveLength(6);

    outlinedItems.forEach((item) => {
      expect(item.attributes("style")).toContain("--vslk-sk-outline-w: 1px");
      expect(item.attributes("style")).toContain(
        "--vslk-sk-outline-style: solid"
      );
    });
  });

  it("forwards custom color to all grid items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        color: "#ff0000",
      },
    });

    const items = wrapper.findAllComponents(Skeleton);
    expect(items).toHaveLength(6);

    items.forEach((item) => {
      expect(item.attributes("style") || "").toContain("--vslk-sk-base: #ff0000");
    });
  });

  it("forwards custom highlight to all grid items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        color: "#ff0000",
        highlight: "#00ff00",
      },
    });

    const items = wrapper.findAllComponents(Skeleton);
    expect(items).toHaveLength(6);

    items.forEach((item) => {
      expect(item.attributes("style") || "").toContain("--vslk-sk-hi: #00ff00");
    });
  });

  it("forwards custom speed and angle to all grid items", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "grid",
        speed: 2,
        angle: 45,
      },
    });

    const items = wrapper.findAllComponents(Skeleton);
    expect(items).toHaveLength(6);

    items.forEach((item) => {
      expect(item.attributes("style") || "").toContain("--vslk-sk-duration: 750ms");
      expect(item.attributes("style") || "").toContain("--vslk-sk-shimmer-angle: 45deg");
    });
  });
});
