import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

type ImageOptions = {
  ratio?: string;
  icon?: boolean;
  iconSize?: number | string;
  iconColor?: string;
};

function styleOf(wrapper: { attributes: (name: string) => string | undefined }) {
  return wrapper.attributes("style") ?? "";
}

function findImageRoot(wrapper: ReturnType<typeof mount>) {
  const image = wrapper.find(".vslk-sk-image");
  if (!image.exists()) {
    throw new Error(
      [
        "Expected Skeleton(variant: 'image') to render '.vslk-sk-image', but it was not found.",
        "This usually means Skeleton.vue is not wiring the 'image' variant to Image.vue (or not passing options/props).",
      ].join("\n"),
    );
  }
  return image;
}

function findImageIcon(wrapper: ReturnType<typeof mount>) {
  return wrapper.find("svg.vslk-sk-image__icon");
}

function mountImage(props?: {
  variant?: "image";
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  color?: string;
  highlight?: string;
  animation?: "shimmer" | "pulse" | "none";
  speed?: number;
  angle?: number;
  outlined?: boolean;
  options?: ImageOptions;
}) {
  return mount(Skeleton, {
    props: {
      variant: "image",
      ...props,
    },
  });
}

describe("Skeleton / Image Variant", () => {
  // -----------------------
  // General (wrapper-level) tests
  // -----------------------

  it("applies shimmer animation by default", () => {
    const wrapper = mountImage();
    expect(wrapper.classes()).toContain("vslk-sk--anim-shimmer");
  });

  it("switches to pulse animation", () => {
    const wrapper = mountImage({ animation: "pulse" });
    expect(wrapper.classes()).toContain("vslk-sk--anim-pulse");
  });

  it("disables animation when animation is none", () => {
    const wrapper = mountImage({ animation: "none" });
    expect(wrapper.classes()).toContain("vslk-sk--anim-none");
    expect(styleOf(wrapper)).toContain("--vslk-sk-duration: 0ms");
  });

  it("applies custom color (base) on wrapper css var", () => {
    const wrapper = mountImage({ color: "#ff0000" });
    expect(styleOf(wrapper)).toContain("--vslk-sk-base: #ff0000");
  });

  it("applies custom highlight on wrapper css var", () => {
    const wrapper = mountImage({ color: "#111111", highlight: "#00ff00" });
    expect(styleOf(wrapper)).toContain("--vslk-sk-hi: #00ff00");
  });

  it("generates highlight automatically when not provided", () => {
    const wrapper = mountImage({ color: "#111111" });
    expect(styleOf(wrapper)).toContain("--vslk-sk-hi:");
  });

  it("supports outlined mode", () => {
    const wrapper = mountImage({ outlined: true });
    expect(wrapper.classes()).toContain("vslk-sk--outlined");
    expect(styleOf(wrapper)).toContain("--vslk-sk-outline-w:");
    expect(styleOf(wrapper)).toContain("--vslk-sk-outline-style:");
  });

  it("maps speed to duration (speed=1 -> 1500ms)", () => {
    const wrapper = mountImage({ speed: 1 });
    expect(styleOf(wrapper)).toContain("--vslk-sk-duration: 1500ms");
  });

  it("maps speed to duration (speed=2 -> 750ms)", () => {
    const wrapper = mountImage({ speed: 2 });
    expect(styleOf(wrapper)).toContain("--vslk-sk-duration: 750ms");
  });

  it("applies shimmer angle on wrapper css var", () => {
    const wrapper = mountImage({ angle: 45 });
    expect(styleOf(wrapper)).toContain("--vslk-sk-shimmer-angle: 45deg");
  });

  it("sets numeric width/height/radius on wrapper css vars (px)", () => {
    const wrapper = mountImage({ width: 320, height: 180, radius: 16 });
    const st = styleOf(wrapper);
    expect(st).toContain("--vslk-sk-w: 320px");
    expect(st).toContain("--vslk-sk-h: 180px");
    expect(st).toContain("--vslk-sk-r: 16px");
  });

  it("sets string width/height/radius on wrapper css vars (raw)", () => {
    const wrapper = mountImage({ width: "12rem", height: "40vh", radius: "8px" });
    const st = styleOf(wrapper);
    expect(st).toContain("--vslk-sk-w: 12rem");
    expect(st).toContain("--vslk-sk-h: 40vh");
    expect(st).toContain("--vslk-sk-r: 8px");
  });

  // -----------------------
  // Variant-specific tests (Image internals)
  // -----------------------

  it("renders image variant root", () => {
    const wrapper = mountImage();
    const image = findImageRoot(wrapper);

    expect(image.classes()).toContain("vslk-sk-shape");
    expect(image.classes()).toContain("vslk-sk-image");
  });

  it("leaves a11y semantics to the Skeleton container (no role/aria-label)", () => {
    const wrapper = mountImage();
    const image = findImageRoot(wrapper);

    expect(image.attributes("role")).toBeUndefined();
    expect(image.attributes("aria-label")).toBeUndefined();
    expect(wrapper.attributes("aria-hidden")).toBe("true");
  });

  it("renders the icon by default", () => {
    const wrapper = mountImage();
    findImageRoot(wrapper);

    const icon = findImageIcon(wrapper);
    expect(icon.exists()).toBe(true);
    expect(icon.attributes("aria-hidden")).toBe("true");
  });

  it("hides the icon when options.icon is false", () => {
    const wrapper = mountImage({
      options: { icon: false },
    });

    const image = findImageRoot(wrapper);
    expect(image.exists()).toBe(true);
    expect(findImageIcon(wrapper).exists()).toBe(false);
  });

  it("applies options.iconColor as --vslk-sk-icon-color on image root", () => {
    const wrapper = mountImage({
      options: { iconColor: "#ff0000" },
    });

    const image = findImageRoot(wrapper);
    const st = image.attributes("style") ?? "";
    expect(st).toContain("--vslk-sk-icon-color: #ff0000");
  });

  it("renders default icon size (40%) on the svg icon", () => {
    const wrapper = mountImage();
    findImageRoot(wrapper);
    const icon = findImageIcon(wrapper);
    expect(icon.exists()).toBe(true);

    const st = icon.attributes("style") ?? "";
    expect(st).toContain("width: 40%");
    expect(st).toContain("height: 40%");
  });

  it("applies options.iconSize (number -> px) on the svg icon", () => {
    const wrapper = mountImage({
      options: { iconSize: 48 },
    });

    findImageRoot(wrapper);
    const icon = findImageIcon(wrapper);
    expect(icon.exists()).toBe(true);

    const st = icon.attributes("style") ?? "";
    expect(st).toContain("width: 48px");
    expect(st).toContain("height: 48px");
  });

  it("applies options.iconSize (string raw) on the svg icon", () => {
    const wrapper = mountImage({
      options: { iconSize: "32%" },
    });

    findImageRoot(wrapper);
    const icon = findImageIcon(wrapper);
    expect(icon.exists()).toBe(true);

    const st = icon.attributes("style") ?? "";
    expect(st).toContain("width: 32%");
    expect(st).toContain("height: 32%");
  });

  describe("options.ratio (aspect-ratio)", () => {
    it.each([
      ["16:9", "16 / 9"],
      ["4:3", "4 / 3"],
      ["1:1", "1 / 1"],
    ])("sets aspect-ratio for valid ratio '%s' -> '%s'", (ratio, expected) => {
      const wrapper = mountImage({
        options: { ratio },
      });

      const image = findImageRoot(wrapper);
      const st = image.attributes("style") ?? "";
      expect(st).toContain(`aspect-ratio: ${expected}`);
    });

    it.each([
      "16/9",
      "1.5",
      "0:10",
      "10:0",
      "invalid",
      "",
    ])("does not set aspect-ratio for invalid ratio '%s'", (ratio) => {
      const wrapper = mountImage({
        options: { ratio },
      });

      const image = findImageRoot(wrapper);
      const st = image.attributes("style") ?? "";
      expect(st.includes("aspect-ratio:")).toBe(false);
    });
  });

  // The image element itself, not only the wrapper's CSS variables
  // (pinned by mutation testing: npm run test:mutation)
  describe("image element size", () => {
    const image = (props: Parameters<typeof mountImage>[0]) =>
      findImageRoot(mountImage(props)).element as HTMLElement;

    it("sets numeric width, height and radius in px", () => {
      expect(image({ width: 320, height: 180, radius: 16 })).toHaveStyle({
        width: "320px",
        height: "180px",
        borderRadius: "16px",
      });
    });

    it("passes string width, height and radius through", () => {
      expect(image({ width: "12rem", height: "40vh", radius: "50%" })).toHaveStyle({
        width: "12rem",
        height: "40vh",
        borderRadius: "50%",
      });
    });

    it("sets no size or radius of its own by default", () => {
      const style = findImageRoot(mountImage()).attributes("style") ?? "";
      expect(style).not.toMatch(/(^|;)\s*(width|height|border-radius):/);
    });

    it("lets an explicit height win over options.ratio", () => {
      const el = image({ height: 100, options: { ratio: "16:9" } });
      expect(el).toHaveStyle({ height: "100px" });
      expect(el.getAttribute("style")).not.toContain("aspect-ratio");
    });
  });
});
