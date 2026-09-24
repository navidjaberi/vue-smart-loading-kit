import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

function nestedSkeletons(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAllComponents(Skeleton)
    .filter((c) => c.vm !== wrapper.vm);
}

function blockComponents(wrapper: ReturnType<typeof mount>) {
  return nestedSkeletons(wrapper).filter((c) => c.props("variant") === "block");
}

function textComponents(wrapper: ReturnType<typeof mount>) {
  return nestedSkeletons(wrapper).filter((c) => c.props("variant") === "text");
}

describe("Card Variant", () => {
  it("defaults to the 'image' layout", () => {
    const wrapper = mount(Skeleton, { props: { variant: "card" } });

    expect(wrapper.find(".vslk-card--image").exists()).toBe(true);
    expect(blockComponents(wrapper)).toHaveLength(1); // the image block
  });

  it("renders the 'simple' layout with no media block", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { layout: "simple" } },
    });

    expect(wrapper.find(".vslk-card--simple").exists()).toBe(true);
    expect(blockComponents(wrapper)).toHaveLength(0);
  });

  it("renders the 'horizontal' layout with a media block", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { layout: "horizontal" } },
    });

    expect(wrapper.find(".vslk-card--horizontal").exists()).toBe(true);
    expect(blockComponents(wrapper)).toHaveLength(1); // the media block
  });

  it("renders 3 body lines by default, plus 1 title", () => {
    const wrapper = mount(Skeleton, { props: { variant: "card" } });
    expect(textComponents(wrapper)).toHaveLength(4);
  });

  it("respects a custom line count via options.lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { lines: 5 } },
    });

    expect(textComponents(wrapper)).toHaveLength(6);
  });

  it("clamps options.lines to a minimum of 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { lines: 0 } },
    });

    expect(textComponents(wrapper)).toHaveLength(2);
  });

  it("gives a single body line 100% width (not the last-line style)", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { lines: 1 } },
    });

    const [, bodyLine] = textComponents(wrapper); 
    expect(bodyLine.props("width")).toBe("100%");
  });

  it("gives 3 body lines widths [100%, 82%, 55%]", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { lines: 3 } },
    });

    const [, ...bodyLines] = textComponents(wrapper);
    expect(bodyLines.map((l) => l.props("width"))).toEqual([
      "100%",
      "82%",
      "55%",
    ]);
  });

  it("applies the default titleWidth (72%) to the title", () => {
    const wrapper = mount(Skeleton, { props: { variant: "card" } });

    const [title] = textComponents(wrapper);
    expect(title.props("width")).toBe("72%");
  });

  it("applies a custom titleWidth", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { titleWidth: "90%" } },
    });

    const [title] = textComponents(wrapper);
    expect(title.props("width")).toBe("90%");
  });

  it("applies the default imageHeight (180) to the image block", () => {
    const wrapper = mount(Skeleton, { props: { variant: "card" } });

    const [image] = blockComponents(wrapper);
    expect(image.props("height")).toBe("180px");
  });

  it("applies a custom imageHeight", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { imageHeight: 220 } },
    });

    const [image] = blockComponents(wrapper);
    expect(image.props("height")).toBe("220px");
  });

  it("applies the default mediaWidth (120) as both width and height in horizontal layout", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { layout: "horizontal" } },
    });

    const [media] = blockComponents(wrapper);
    expect(media.props("width")).toBe("120px");
    expect(media.props("height")).toBe("120px");
  });

  it("applies a custom mediaWidth", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "card",
        options: { layout: "horizontal", mediaWidth: 80 },
      },
    });

    const [media] = blockComponents(wrapper);
    expect(media.props("width")).toBe("80px");
    expect(media.props("height")).toBe("80px");
  });

  it("applies the default card radius (14px) to the container", () => {
    const wrapper = mount(Skeleton, { props: { variant: "card" } });

    const card = wrapper.find(".vslk-card");
    expect(card.element).toHaveStyle({ borderRadius: "14px" });
  });

  it("applies a custom radius to the container and to the image/media block", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { radius: 24 } },
    });

    const card = wrapper.find(".vslk-card");
    expect(card.element).toHaveStyle({ borderRadius: "24px" });

    const [image] = blockComponents(wrapper);
    expect(image.props("radius")).toBe("24px");
  });

  it("applies borderWidth and borderColor to the container", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "card",
        options: { borderWidth: 2, borderColor: "#7c3aed" },
      },
    });

    const card = wrapper.find(".vslk-card");
    expect(card.element).toHaveStyle({
      borderWidth: "2px",
      borderColor: "#7c3aed",
    });
  });

  it("defaults the card width to 320px", () => {
    const wrapper = mount(Skeleton, { props: { variant: "card" } });

    const card = wrapper.find(".vslk-card");
    expect(card.element).toHaveStyle({ width: "320px" });
  });

  it("applies a custom width", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", width: 400 },
    });

    const card = wrapper.find(".vslk-card");
    expect(card.element).toHaveStyle({ width: "400px" });
  });

  it("does not leak a top-level `lines` prop into title/body text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", lines: 5 } as any,
    });

    textComponents(wrapper).forEach((c) =>
      expect(c.props("lines")).toBeUndefined()
    );
  });

  it("does not leak a top-level `size` prop into nested calls", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", size: 999 } as any,
    });

    nestedSkeletons(wrapper).forEach((c) =>
      expect(c.props("size")).toBeUndefined()
    );
  });

  it("does not leak a top-level `radius` prop into title/body text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", radius: "999px" } as any,
    });

    textComponents(wrapper).forEach((c) =>
      expect(c.props("radius")).toBeUndefined()
    );
  });

  it("still applies the card's own options.radius to the image block even with a stray top-level radius", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "card",
        radius: "999px",
        options: { radius: 20 },
      } as any,
    });

    const [image] = blockComponents(wrapper);
    expect(image.props("radius")).toBe("20px");
  });

  it("marks the horizontal layout's media block with the flex-shrink-safe class", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", options: { layout: "horizontal" } },
    });

    expect(wrapper.find(".vslk-card__media").exists()).toBe(true);
  });

  it("propagates top-level color to media block and text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", color: "#7c3aed" },
    });

    nestedSkeletons(wrapper).forEach((c) =>
      expect(c.props("color")).toBe("#7c3aed")
    );
  });

  it("propagates animation to media block and text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "card", animation: "pulse" },
    });

    nestedSkeletons(wrapper).forEach((c) =>
      expect(c.props("animation")).toBe("pulse")
    );
  });
});