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
  it("does not move or resize a single element", async () => {
    const before = rects();
    await skeletonize();
    expect(rects()).toEqual(before);
  });

  it("hides every text except under data-skeleton=ignore", async () => {
    await skeletonize();
    for (const sel of [".name", ".role", ".title", ".para", ".inline", ".link", ".item", ".cell", ".label", ".button", ".mixed"]) {
      expect(css(sel).color, sel).toBe(TRANSPARENT);
    }
    expect(css(".ignored").color).not.toBe(TRANSPARENT);
  });

  it("draws line bars on text blocks and text-only elements", async () => {
    await skeletonize();
    for (const sel of [".title", ".para", ".item", ".cell", ".label", ".name", ".role", ".mixed"]) {
      expect(css(sel).maskImage, sel).toContain("repeating-linear-gradient");
    }
  });

  it("gives inline children of a text block no bar of their own", async () => {
    await skeletonize();
    expect(css(".inline").maskImage).toBe("none");
    expect(css(".link").maskImage).toBe("none");
  });

  it("keeps table cell borders (border ring in the mask)", async () => {
    await skeletonize();
    expect(css(".cell").maskComposite).toContain("exclude");
    expect(css(".cell").borderTopWidth).toBe("2px");
  });

  it("fills images and controls with the base color", async () => {
    await skeletonize();
    for (const sel of [".avatar", ".input", ".button"]) {
      expect(css(sel).backgroundColor, sel).not.toBe(TRANSPARENT);
    }
    expect(css(".avatar").objectPosition).toContain("-99999px");
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
  });
});
