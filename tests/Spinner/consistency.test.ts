import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import postcss from "postcss";
import { parse as parseSfc } from "vue/compiler-sfc";
import Spinner from "../../src/components/Spinner/Spinner.vue";
import type { SpinnerVariantName } from "../../src/components/Spinner/spinner.types";

const variants: SpinnerVariantName[] = [
  "circle", "dots", "pulse", "bars", "ring", "orbit", "pulse-dots", "orbit-dots", "arc",
];

const root = (wrapper: ReturnType<typeof mount>) =>
  wrapper.find(".vslk-spinner-wrapper").element.firstElementChild as HTMLElement;

describe("Spinner color", () => {
  /* Every color in a spinner must come from its `color` prop (exposed as
     the root's CSS `color`, read via currentColor). A hardcoded literal
     ignores the prop — e.g. a black track that vanishes on dark
     backgrounds, or a leftover green track on every orbit. */
  const VARIANTS_DIR = join(__dirname, "../../src/components/Spinner/variants");
  const COLOR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\b(?:black|white|gray|grey|red|green|blue)\b/i;

  const PROGRESS_BAR = join(__dirname, "../../src/components/ProgressBar/ProgressBar.vue");
  const styleSources = [
    ...readdirSync(VARIANTS_DIR)
      .filter((f) => f.endsWith(".vue"))
      .map((f) => join(VARIANTS_DIR, f)),
    PROGRESS_BAR,
  ].map((path) => {
    const { descriptor } = parseSfc(readFileSync(path, "utf8"));
    return [path.split("/").pop()!, descriptor.styles.map((s) => s.content).join("\n")] as const;
  });

  it.each(styleSources)("%s hardcodes no color in its styles", (_file, css) => {
    const literals: string[] = [];
    postcss.parse(css).walkDecls((decl) => {
      if (COLOR_LITERAL.test(decl.value)) literals.push(`${decl.prop}: ${decl.value}`);
    });

    expect(literals).toEqual([]);
  });

  it.each(variants)("%s inherits the surrounding text color by default", (variant) => {
    const wrapper = mount(Spinner, { props: { variant } });

    expect(root(wrapper).style.color.toLowerCase()).toBe("currentcolor");
  });

  it.each(variants)("%s exposes a custom color on its root", (variant) => {
    const wrapper = mount(Spinner, { props: { variant, color: "#7c3aed" } });

    expect(root(wrapper).style.color).toBe("rgb(124, 58, 237)");
  });
});

describe("Spinner box size", () => {
  // Swapping variants (e.g. inside a button) must not shift the layout.
  it.each(variants)("%s renders a size x size box", (variant) => {
    for (const [size, css] of [[40, "40px"], ["3rem", "3rem"]] as const) {
      const el = root(mount(Spinner, { props: { variant, size } }));

      expect([el.style.width, el.style.height]).toEqual([css, css]);
    }
  });
});

describe("Ring stagger", () => {
  /* The chasing effect comes from each segment starting a fixed FRACTION
     of the cycle behind the next. Delays in absolute seconds only line
     up at one speed; at others the segments fall out of order. */
  const phases = (speed: number) => {
    const wrapper = mount(Spinner, { props: { variant: "ring", speed } });
    return wrapper.findAll(".segment").map((s) => {
      const style = (s.element as HTMLElement).style;
      const delay = -parseFloat(style.animationDelay || "0") || 0; // no -0
      return Math.round((delay / parseFloat(style.animationDuration)) * 1000) / 1000;
    });
  };

  it("keeps the same segment order at every speed", () => {
    expect(phases(1)).toEqual([0.45, 0.3, 0.15, 0]);
    expect(phases(3)).toEqual(phases(1));
    expect(phases(0.5)).toEqual(phases(1));
  });
});
