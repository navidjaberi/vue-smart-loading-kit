// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, h, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { Skeleton, Spinner, ProgressBar, SmartLoader } from "../src/index";
import { skeletonVariants } from "../src/components/Skeleton/variants";

/* Server-side rendering (Nuxt, vite-ssr, ...): no window, no document,
   no matchMedia. Every component must render, and must not leave timers
   running on the server, where nothing would ever clean them up. */

const render = (component: Component, props: Record<string, unknown> = {}, slot?: string) =>
  renderToString(createSSRApp({ render: () => h(component, props, slot ? () => h("p", slot) : undefined) }));

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SSR", () => {
  it("runs without a DOM", () => {
    expect(typeof window).toBe("undefined");
  });

  it.each(Object.keys(skeletonVariants))("renders Skeleton %s", async (variant) => {
    const html = await render(Skeleton, { variant, label: "Loading" });

    expect(html).toContain("vslk-skeleton-container");
  });

  it.each(["circle", "dots", "pulse", "bars", "ring", "orbit", "pulse-dots", "orbit-dots", "arc"])(
    "renders Spinner %s",
    async (variant) => {
      const html = await render(Spinner, { variant, track: true, label: "Loading" });

      expect(html).toContain("vslk-spinner-wrapper");
    }
  );

  it.each([{}, { value: 40, label: "Uploading" }])("renders ProgressBar %j", async (props) => {
    expect(await render(ProgressBar, props)).toContain("vslk-progress");
  });

  it.each(["replace", "overlay"])("renders SmartLoader (%s) without scheduling timers", async (mode) => {
    const html = await render(SmartLoader, { loading: true, mode }, "Content");

    // the loader is delayed, so the server sends the content
    expect(html).toContain("Content");
    expect(vi.getTimerCount()).toBe(0);
  });
});
