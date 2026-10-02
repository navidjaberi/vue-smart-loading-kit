import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

function nestedSkeletons(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAllComponents(Skeleton)
    .filter((c) => c.vm !== wrapper.vm);
}

function markerComponents(wrapper: ReturnType<typeof mount>) {
  return nestedSkeletons(wrapper).filter((c) => c.props("variant") === "block");
}

function textComponents(wrapper: ReturnType<typeof mount>) {
  return nestedSkeletons(wrapper).filter((c) => c.props("variant") === "text");
}

describe("List Variant", () => {
  it("renders 4 items by default, each with a dot marker and 2 lines", () => {
    const wrapper = mount(Skeleton, { props: { variant: "list" } });

    expect(wrapper.findAll(".vslk-list__item")).toHaveLength(4);
    expect(markerComponents(wrapper)).toHaveLength(4);
    expect(textComponents(wrapper)).toHaveLength(8); // 4 items x 2 lines
  });

  it("respects a custom item count via options.items", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 6 } },
    });

    expect(wrapper.findAll(".vslk-list__item")).toHaveLength(6);
  });

  it("clamps items to a minimum of 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 0 } },
    });

    expect(wrapper.findAll(".vslk-list__item")).toHaveLength(1);
  });

  it("respects a custom line count per item via options.lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 2, lines: 3 } },
    });

    expect(textComponents(wrapper)).toHaveLength(6); // 2 items x 3 lines
  });

  it("allows lines: 0 (dot-only list, no text lines)", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 3, lines: 0 } },
    });

    expect(textComponents(wrapper)).toHaveLength(0);
    expect(markerComponents(wrapper)).toHaveLength(3);
  });

  /* ---------------- Dot marker ---------------- */

  it("hides the dot marker when dot: false", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { dot: false } },
    });

    expect(wrapper.find(".vslk-list__marker").exists()).toBe(false);
    expect(markerComponents(wrapper)).toHaveLength(0);
  });

  it("applies the default dot size (8) and radius (9999px)", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1 } },
    });

    const marker = markerComponents(wrapper)[0];
    expect(marker.props("width")).toBe("8px");
    expect(marker.props("height")).toBe("8px");
    expect(marker.props("radius")).toBe("9999px");
  });

  it("applies a custom dot size and radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "list",
        options: { items: 1, dotSize: 14, dotRadius: 4 },
      },
    });

    const marker = markerComponents(wrapper)[0];
    expect(marker.props("width")).toBe("14px");
    expect(marker.props("height")).toBe("14px");
    expect(marker.props("radius")).toBe("4px");
  });

  it("uses titleWidth/subtitleWidth defaults for the first two lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1, lines: 2 } },
    });

    const lines = textComponents(wrapper);
    expect(lines[0].props("width")).toBe("68%");
    expect(lines[1].props("width")).toBe("52%");
  });

  it("supports custom titleWidth and subtitleWidth", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "list",
        options: { items: 1, lines: 2, titleWidth: "80%", subtitleWidth: "40%" },
      },
    });

    const lines = textComponents(wrapper);
    expect(lines[0].props("width")).toBe("80%");
    expect(lines[1].props("width")).toBe("40%");
  });

  it("cycles preset widths for the 3rd+ line of an item", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1, lines: 3 } },
    });

    const lines = textComponents(wrapper);
        expect(lines[2].props("width")).toBe("62%");
  });

  it("applies the default lineHeight (12px) to every line", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1, lines: 2 } },
    });

    textComponents(wrapper).forEach((line) =>
      expect(line.props("height")).toBe("12px")
    );
  });

  it("applies a custom lineHeight", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1, lines: 2, lineHeight: 16 } },
    });

    textComponents(wrapper).forEach((line) =>
      expect(line.props("height")).toBe("16px")
    );
  });

  it("shows no divider by default", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 3 } },
    });

    expect(wrapper.find(".vslk-list__item--divider").exists()).toBe(false);
  });

  it("adds a divider to every item except the last when divider: true", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 3, divider: true } },
    });

    const items = wrapper.findAll(".vslk-list__item");
    expect(items[0].classes()).toContain("vslk-list__item--divider");
    expect(items[1].classes()).toContain("vslk-list__item--divider");
    expect(items[2].classes()).not.toContain("vslk-list__item--divider");
  });

  it("centers marker/content alignment when lines <= 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1, lines: 1 } },
    });

    const item = wrapper.find(".vslk-list__item");
    expect(item.element).toHaveStyle({ alignItems: "center" });
  });

  it("top-aligns marker/content when lines > 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", options: { items: 1, lines: 2 } },
    });

    const item = wrapper.find(".vslk-list__item");
    expect(item.element).toHaveStyle({ alignItems: "flex-start" });
  });

  it("does not leak a top-level `lines` prop into nested text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", lines: 5 } as any,
    });

    textComponents(wrapper).forEach((line) =>
      expect(line.props("lines")).toBeUndefined()
    );
  });

  it("does not leak a top-level `size` prop into markers or text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", size: 999 } as any,
    });

    nestedSkeletons(wrapper).forEach((c) =>
      expect(c.props("size")).toBeUndefined()
    );
  });

  it("propagates top-level color to both markers and text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", color: "#7c3aed", options: { items: 2 } },
    });

    nestedSkeletons(wrapper).forEach((c) =>
      expect(c.props("color")).toBe("#7c3aed")
    );
  });

  it("propagates animation to both markers and text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", animation: "pulse", options: { items: 2 } },
    });

    nestedSkeletons(wrapper).forEach((c) =>
      expect(c.props("animation")).toBe("pulse")
    );
  });

  it("defaults the list container to 100% width", () => {
    const wrapper = mount(Skeleton, { props: { variant: "list" } });

    const list = wrapper.find(".vslk-list");
    expect(list.element).toHaveStyle({ width: "100%" });
  });

  it("applies a custom width to the list container", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "list", width: 300 },
    });

    const list = wrapper.find(".vslk-list");
    expect(list.element).toHaveStyle({ width: "300px" });
  });

  // Spacing defaults, pinned by mutation testing (npm run test:mutation)
  describe("spacing and borders", () => {
    const list = (options: Record<string, unknown> = {}) =>
      mount(Skeleton, { props: { variant: "list", options: { items: 2, ...options } } });

    it("defaults to a 12px item gap, 8px content gap, 12px 0 padding and a soft border", () => {
      const w = list();
      expect(w.find(".vslk-list").element).toHaveStyle({ gap: "12px" });
      expect(w.find(".vslk-list__content").element).toHaveStyle({ gap: "8px" });
      const item = w.find(".vslk-list__item").element as HTMLElement;
      expect(item).toHaveStyle({ padding: "12px 0px" });
      expect(item.style.borderBottomColor).toBe("rgba(148, 163, 184, 0.18)");
    });

    it("converts numeric spacing to px and passes strings through", () => {
      const px = list({ itemGap: 4, contentGap: 6, padding: 10, borderColor: "red" });
      expect(px.find(".vslk-list").element).toHaveStyle({ gap: "4px" });
      expect(px.find(".vslk-list__content").element).toHaveStyle({ gap: "6px" });
      expect(px.find(".vslk-list__item").element).toHaveStyle({ padding: "10px" });
      expect((px.find(".vslk-list__item").element as HTMLElement).style.borderBottomColor).toBe("red");

      const raw = list({ itemGap: "1rem", contentGap: "2rem", padding: "3rem" });
      expect(raw.find(".vslk-list").element).toHaveStyle({ gap: "1rem" });
      expect(raw.find(".vslk-list__content").element).toHaveStyle({ gap: "2rem" });
      expect(raw.find(".vslk-list__item").element).toHaveStyle({ padding: "3rem" });
    });

    it("cycles every preset width from the third line on", () => {
      const w = mount(Skeleton, { props: { variant: "list", options: { items: 1, lines: 7 } } });
      const widths = textComponents(w).map((c) => c.props("width"));
      expect(widths.slice(2)).toEqual(["62%", "84%", "70%", "90%", "75%"]);
    });
  });
});
