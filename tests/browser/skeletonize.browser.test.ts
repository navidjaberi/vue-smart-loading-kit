import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp, h, nextTick, ref, withDirectives } from "vue";
import "../../src/skeletonize/skeletonize.css";
import { vSkeleton } from "../../src/skeletonize/directive";
import { FIXTURE } from "./fixture";

const loading = ref(false);
let root: HTMLElement;
let unmount: () => void;

beforeEach(async () => {
  root = document.createElement("div");
  document.body.appendChild(root);
  const app = createApp({
    render: () =>
      withDirectives(h("div", { class: "scope", innerHTML: FIXTURE }), [
        [vSkeleton, { loading: loading.value, delay: 0, minDuration: 0 }],
      ]),
  });
  app.mount(root);
  unmount = () => app.unmount();
  await nextTick();
});
afterEach(() => {
  loading.value = false;
  unmount();
  root.remove();
});

const q = (sel: string) => root.querySelector(sel) as HTMLElement;
const css = (sel: string) => getComputedStyle(q(sel));
const rects = () =>
  [...root.querySelectorAll(".scope *")].map((e) => {
    const r = e.getBoundingClientRect();
    return [r.x, r.y, r.width, r.height].map((n) => Math.round(n * 2) / 2).join(",");
  });
async function skeletonize() {
  loading.value = true;
  await nextTick();
}
const TRANSPARENT = "rgba(0, 0, 0, 0)";

describe("skeletonize (real browser)", () => {
  // Safari on macOS draws an unstyled <button> natively and drops that look,
  // a few px taller, once its background changes (see README, Limitations).
  // Measure the rest of the layout with the fixture's button already non-native.
  const macWebKit = /Macintosh/.test(navigator.userAgent) && !/Chrome|Firefox/.test(navigator.userAgent);

  it("does not move or resize a single element", async () => {
    if (macWebKit) q(".button").style.appearance = "none";
    const before = rects();
    await skeletonize();
    expect(rects()).toEqual(before);
  });

  // text is hidden with -webkit-text-fill-color, which leaves `color` (and so
  // every currentColor border or divider) alone
  it("hides every text except under data-skeleton=ignore", async () => {
    await skeletonize();
    for (const sel of [".name", ".role", ".title", ".para", ".inline", ".link", ".item", ".cell", ".label", ".button", ".mixed", ".mixed-auto"]) {
      expect(css(sel).webkitTextFillColor, sel).toBe(TRANSPARENT);
    }
    expect(css(".ignored").webkitTextFillColor).not.toBe(TRANSPARENT);
  });

  it("keeps currentColor borders and dividers visible", async () => {
    const before = { box: css(".bordered").borderTopColor, hr: css(".divider").borderTopColor };
    await skeletonize();
    expect(css(".bordered").borderTopColor).toBe(before.box);
    expect(css(".divider").borderTopColor).toBe(before.hr);
    expect(css(".bordered").borderTopColor).not.toBe(TRANSPARENT);
  });

  it("bars a div whose text is mixed with inline elements as one text block", async () => {
    await skeletonize();
    expect(css(".mixed-auto").textDecorationLine).toBe("underline");
    expect(css(".mixed-b").textDecorationLine).toBe("none");
  });

  // the bar is a raised underline: the browser draws it per line, as wide as
  // that line's text, so a short last line gets a short bar
  it("draws line bars on text blocks and text-only elements", async () => {
    await skeletonize();
    for (const sel of [".title", ".para", ".item", ".cell", ".label", ".name", ".role", ".mixed"]) {
      expect(css(sel).textDecorationLine, sel).toBe("underline");
      expect(css(sel).textDecorationColor, sel).not.toBe(TRANSPARENT);
      expect(css(sel).textDecorationSkipInk, sel).toBe("none");
    }
  });

  // blocks paint the shimmer gradient over their base color, so a translucent
  // base shows twice there: text bars get that same shade to match
  it("gives text bars the same shade as blocks", async () => {
    await skeletonize();
    const alpha = (c: string) => Number(c.match(/[\d.]+(?=\)$)/)?.[0] ?? 1);
    const base = q(".scope").style.getPropertyValue("--vslk-sk-base");
    const a = alpha(base);
    expect(alpha(css(".title").textDecorationColor)).toBeCloseTo(1 - (1 - a) ** 2, 2);
  });

  it("paints no box behind a text block", async () => {
    const before = css(".title").backgroundColor;
    await skeletonize();
    expect(css(".title").backgroundColor).toBe(before);
  });

  it("gives inline children of a text block no bar of their own", async () => {
    await skeletonize();
    expect(css(".inline").textDecorationLine).toBe("none");
    expect(css(".inline").maskImage).toBe("none");
    expect(css(".link").maskImage).toBe("none");
    // the link's own underline is hidden; the paragraph's bar runs through it
    expect(css(".link").textDecorationColor).toBe(TRANSPARENT);
  });

  // component libraries wrap cell text (Element Plus: td > div.cell,
  // PrimeVue: th > div > span); the wrapper gets the bar, once
  it("bars text wrapped inside table cells", async () => {
    await skeletonize();
    expect(css(".td-inner").textDecorationLine).toBe("underline");
    expect(css(".th-inner").textDecorationLine).toBe("underline");
    expect(css(".th-title").textDecorationLine).toBe("none");
    expect(css(".td-cell").textDecorationLine).toBe("none");
  });

  // Quasar's bg-* classes and Tailwind's ! modifier set !important backgrounds
  it("covers a background that is itself !important", async () => {
    await skeletonize();
    expect(css(".imp-bg").backgroundColor).not.toBe("rgb(37, 99, 235)");
  });

  it("keeps table cell borders", async () => {
    const before = css(".cell").borderTopColor;
    await skeletonize();
    expect(css(".cell").borderTopColor).toBe(before);
    expect(css(".cell").borderTopWidth).toBe("2px");
  });

  // icon fonts draw in ::before, which the hidden text would erase
  it("turns empty icon elements into blocks", async () => {
    await skeletonize();
    for (const sel of [".font-icon", ".css-icon"]) {
      expect(css(sel).backgroundColor, sel).not.toBe(TRANSPARENT);
    }
  });

  it("fills images and controls with the base color", async () => {
    await skeletonize();
    for (const sel of [".avatar", ".input", ".button"]) {
      expect(css(sel).backgroundColor, sel).not.toBe(TRANSPARENT);
    }
    expect(css(".avatar").objectPosition).toContain("-99999px");
  });

  // A <use> sprite draws in a shadow tree that selectors can't reach, and an
  // inline !important fill beats any stylesheet: hide the insides instead.
  it("hides icon content, even <use> sprites and inline !important fills", async () => {
    await skeletonize();
    expect(css(".sprite-use").visibility).toBe("hidden");
    expect(css(".hard-path").visibility).toBe("hidden");
    expect(css(".sprite").visibility).toBe("visible");
    expect(css(".sprite").backgroundColor).not.toBe(TRANSPARENT);
  });

  it("turns data-skeleton=block into one solid block", async () => {
    await skeletonize();
    expect(css(".chart").backgroundColor).not.toBe(TRANSPARENT);
    expect(css(".chart-label").visibility).toBe("hidden");
  });

  it("leaves data-skeleton=ignore untouched", async () => {
    const before = { color: css(".ignored").color, mask: css(".ignored").maskImage };
    await skeletonize();
    expect({ color: css(".ignored").color, mask: css(".ignored").maskImage }).toEqual(before);
  });

  it("restores everything when loading ends", async () => {
    const before = css(".title").color;
    await skeletonize();
    loading.value = false;
    await nextTick();
    expect(css(".title").color).toBe(before);
    expect(css(".title").maskImage).toBe("none");
    expect(css(".title").textDecorationLine).toBe("none");
  });
});
