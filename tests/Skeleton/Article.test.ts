import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

function nestedSkeletons(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAllComponents(Skeleton)
    .filter((c) => c.vm !== wrapper.vm);
}

function textComponents(wrapper: ReturnType<typeof mount>) {
  return nestedSkeletons(wrapper).filter((c) => c.props("variant") === "text");
}
describe("Article Variant", () => {
  it("renders 1 title and 2 paragraphs of 4 lines each by default", () => {
    const wrapper = mount(Skeleton, { props: { variant: "article" } });

    expect(wrapper.findAll(".vslk-article__paragraph")).toHaveLength(2);
    expect(textComponents(wrapper)).toHaveLength(9);
  });

  it("respects a custom paragraph count", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", options: { paragraphs: 4 } },
    });

    expect(wrapper.findAll(".vslk-article__paragraph")).toHaveLength(4);
  });

  it("clamps paragraphs to a minimum of 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", options: { paragraphs: 0 } },
    });

    expect(wrapper.findAll(".vslk-article__paragraph")).toHaveLength(1);
  });

  it("respects a custom linesPerParagraph count", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphs: 1, linesPerParagraph: 6 },
      },
    });
    expect(textComponents(wrapper)).toHaveLength(7);
  });

  it("clamps linesPerParagraph to a minimum of 2", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphs: 1, linesPerParagraph: 1 },
      },
    });
    expect(textComponents(wrapper)).toHaveLength(3);
  });

  it("gives the minimum 2-line paragraph widths [85%, 60%]", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphs: 1, linesPerParagraph: 2 },
      },
    });

    const [, ...lines] = textComponents(wrapper); // skip title
    expect(lines.map((l) => l.props("width"))).toEqual(["85%", "60%"]);
  });

  it("gives a 3-line paragraph widths [100%, 85%, 60%]", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphs: 1, linesPerParagraph: 3 },
      },
    });

    const [, ...lines] = textComponents(wrapper);
    expect(lines.map((l) => l.props("width"))).toEqual(["100%", "85%", "60%"]);
  });

  it("gives a 4-line paragraph widths [100%, 100%, 85%, 60%]", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphs: 1, linesPerParagraph: 4 },
      },
    });

    const [, ...lines] = textComponents(wrapper);
    expect(lines.map((l) => l.props("width"))).toEqual([
      "100%",
      "100%",
      "85%",
      "60%",
    ]);
  });

  it("repeats the same width pattern independently for each paragraph", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphs: 2, linesPerParagraph: 3 },
      },
    });

    const [, ...lines] = textComponents(wrapper);
    const paragraph1 = lines.slice(0, 3).map((l) => l.props("width"));
    const paragraph2 = lines.slice(3, 6).map((l) => l.props("width"));

    expect(paragraph1).toEqual(["100%", "85%", "60%"]);
    expect(paragraph2).toEqual(["100%", "85%", "60%"]);
  });
  it("applies the default titleWidth (70%)", () => {
    const wrapper = mount(Skeleton, { props: { variant: "article" } });

    const [title] = textComponents(wrapper);
    expect(title.props("width")).toBe("70%");
    expect(title.props("height")).toBe("20px");
  });

  it("applies a custom titleWidth", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", options: { titleWidth: "45%" } },
    });

    const [title] = textComponents(wrapper);
    expect(title.props("width")).toBe("45%");
  });
  it("applies the default paragraphGap (20px) and lineGap (8px)", () => {
    const wrapper = mount(Skeleton, { props: { variant: "article" } });

    const article = wrapper.find(".vslk-article");
    const paragraph = wrapper.find(".vslk-article__paragraph");

    expect(article.element).toHaveStyle({ gap: "20px" });
    expect(paragraph.element).toHaveStyle({ gap: "8px" });
  });

  it("applies custom paragraphGap and lineGap", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "article",
        options: { paragraphGap: 32, lineGap: 4 },
      },
    });

    const article = wrapper.find(".vslk-article");
    const paragraph = wrapper.find(".vslk-article__paragraph");

    expect(article.element).toHaveStyle({ gap: "32px" });
    expect(paragraph.element).toHaveStyle({ gap: "4px" });
  });

  /* ---------------- Width ---------------- */

  it("defaults the article container to 100% width", () => {
    const wrapper = mount(Skeleton, { props: { variant: "article" } });

    const article = wrapper.find(".vslk-article");
    expect(article.element).toHaveStyle({ width: "100%" });
  });

  it("applies a custom width", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", width: 480 },
    });

    const article = wrapper.find(".vslk-article");
    expect(article.element).toHaveStyle({ width: "480px" });
  });
  it("does not leak a top-level `lines` prop into title/body text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", lines: 5 } as any,
    });

    textComponents(wrapper).forEach((c) =>
      expect(c.props("lines")).toBeUndefined()
    );
  });

  it("does not leak a top-level `size` prop into title/body text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", size: 999 } as any,
    });

    textComponents(wrapper).forEach((c) =>
      expect(c.props("size")).toBeUndefined()
    );
  });
  it("propagates top-level color to title and all body lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", color: "#7c3aed" },
    });

    textComponents(wrapper).forEach((c) =>
      expect(c.props("color")).toBe("#7c3aed")
    );
  });

  it("propagates animation to title and all body lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "article", animation: "pulse" },
    });

    textComponents(wrapper).forEach((c) =>
      expect(c.props("animation")).toBe("pulse")
    );
  });
});