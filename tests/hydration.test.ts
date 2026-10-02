import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, nextTick, withDirectives, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { Spinner, ProgressBar, SmartLoader, vSkeleton } from "../src/index";

/* Hydration: the first client render must produce exactly the HTML the
   server sent, or Vue reports a mismatch (and may patch or re-render).
   The server cannot know the visitor's settings, so anything read from
   the browser (e.g. prefers-reduced-motion) must only apply after mount. */

function reducedMotion(matches: boolean) {
  vi.stubGlobal("matchMedia", () => ({
    matches,
    addEventListener() {},
    removeEventListener() {},
  }));
}

async function hydrate(component: Component, props: Record<string, unknown>) {
  const app = () => createSSRApp({ render: () => h(component, props, () => h("p", "Content")) });

  vi.stubGlobal("matchMedia", undefined); // the server has no matchMedia
  const html = await renderToString(app());

  reducedMotion(true); // the visitor asked for reduced motion
  const container = document.createElement("div");
  container.innerHTML = html;
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  app().mount(container);
  await nextTick();

  const messages = [...warn.mock.calls, ...error.mock.calls].map((c) => String(c[0]));
  warn.mockRestore();
  error.mockRestore();
  return { container, mismatches: messages.filter((m) => /hydration/i.test(m)) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("hydration", () => {
  // [variant, a duration that only appears at half speed]
  it.each([
    ["circle", "animation-duration: 2s"],
    ["ring", "animation-duration: 2s"],
    ["dots", "animation-duration: 2s"],
    ["arc", "--vslk-arc-rotate: 4s"],
  ])("Spinner %s hydrates without a mismatch, then slows down", async (variant, slowed) => {
    const { container, mismatches } = await hydrate(Spinner, { variant, speed: 1 });

    expect(mismatches).toEqual([]);
    // after mount the visitor's preference applies
    expect(container.innerHTML).toContain(slowed);
  });

  it("ProgressBar hydrates without a mismatch, then slows down", async () => {
    const { container, mismatches } = await hydrate(ProgressBar, { speed: 1 });

    expect(mismatches).toEqual([]);
    expect(container.innerHTML).toContain("--vslk-progress-duration: 3s");
  });

  it("SmartLoader hydrates without a mismatch", async () => {
    const { mismatches } = await hydrate(SmartLoader, { loading: true });

    expect(mismatches).toEqual([]);
  });

  it("v-skeleton with placeholder data (delay 0) hydrates without a mismatch", async () => {
    // a realistic element: its own class and style are what Vue compares during hydration
    const Comp = {
      render: () =>
        withDirectives(h("article", { class: "card", style: { padding: "8px" } }, [h("p", "Placeholder")]), [
          [vSkeleton, { loading: true, delay: 0 }],
        ]),
    };
    const { container, mismatches } = await hydrate(Comp, {});

    expect(mismatches).toEqual([]);
    expect(container.querySelector(".vslk-skeletonize")).not.toBeNull();
  });
});
