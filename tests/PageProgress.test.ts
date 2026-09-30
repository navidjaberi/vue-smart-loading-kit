import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import VueSmartLoadingKit, { PageProgress, usePageProgress } from "../src/index";
import { createPageProgress, type RouterLike } from "../src/utils/pageProgress";

const bar = (w: ReturnType<typeof mount>) => w.find(".vslk-page-progress");
const width = (w: ReturnType<typeof mount>) =>
  (w.find(".vslk-progress__bar").element as HTMLElement | undefined)?.style.width;

/** Advances fake time in small steps, flushing renders, so tests can
 *  assert something held (or never happened) at every point in between. */
async function tick(ms: number, check?: () => void) {
  for (let t = 0; t < ms; t += 10) {
    vi.advanceTimersByTime(10);
    await nextTick();
    check?.();
  }
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PageProgress", () => {
  it("shows nothing while idle", () => {
    const w = mount(PageProgress, { props: { progress: createPageProgress() } });

    expect(bar(w).exists()).toBe(false);
  });

  it("appears after the delay and trickles toward, but never past, 90%", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 200 } });

    progress.start();
    await tick(190);
    expect(bar(w).exists()).toBe(false);

    await tick(20);
    expect(bar(w).exists()).toBe(true);
    const first = parseFloat(width(w)!);

    await tick(5000);
    const later = parseFloat(width(w)!);
    expect(later).toBeGreaterThan(first);
    expect(later).toBeLessThanOrEqual(90);
  });

  it("never appears for a task shorter than the delay", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 200 } });

    progress.start();
    await tick(150, () => expect(bar(w).exists()).toBe(false));
    progress.done();
    await tick(500, () => expect(bar(w).exists()).toBe(false));
  });

  it("fills to 100% on done, then goes away", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 0 } });

    progress.start();
    await tick(500);
    progress.done();
    await nextTick();

    expect(width(w)).toBe("100%");
    expect(bar(w).classes()).toContain("vslk-page-progress--done");

    await tick(500);
    expect(bar(w).exists()).toBe(false);
  });

  it("stays up while parallel tasks are still running", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 0 } });

    progress.start();
    progress.start();
    progress.done();
    await tick(1000);

    expect(bar(w).exists()).toBe(true);
    expect(bar(w).classes()).not.toContain("vslk-page-progress--done");
  });

  it("restarts without disappearing when a task starts while it finishes", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 0 } });

    progress.start();
    await tick(300);
    progress.done();
    await tick(100);
    progress.start();
    await nextTick();

    await tick(1000, () => expect(bar(w).exists()).toBe(true));
    expect(bar(w).classes()).not.toContain("vslk-page-progress--done");
    expect(parseFloat(width(w)!)).toBeLessThan(100);
  });

  it("clears its timers when unmounted", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 0 } });

    progress.start();
    await tick(100);
    w.unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("follows a router passed as a prop", async () => {
    const hooks: Record<string, () => void> = {};
    const router: RouterLike = {
      beforeEach: (fn) => ((hooks.before = fn as () => void), () => {}),
      afterEach: (fn) => ((hooks.after = fn as () => void), () => {}),
      onError: (fn) => ((hooks.error = fn as () => void), () => {}),
    };
    const w = mount(PageProgress, { props: { router, delay: 0 } });

    hooks.before();
    await tick(50);
    expect(bar(w).exists()).toBe(true);

    hooks.after();
    await tick(500);
    expect(bar(w).exists()).toBe(false);
  });

  it("is pinned to the top of the viewport", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 0 } });

    progress.start();
    await tick(50);

    expect(bar(w).classes()).toContain("vslk-page-progress");
  });

  it("announces itself as a progressbar when labelled", async () => {
    const progress = createPageProgress();
    const w = mount(PageProgress, { props: { progress, delay: 0, label: "Loading page" } });

    progress.start();
    await tick(50);

    const el = w.find('[role="progressbar"]');
    expect(el.attributes("aria-label")).toBe("Loading page");
    expect(Number(el.attributes("aria-valuenow"))).toBeGreaterThan(0);
  });
});

describe("PageProgress with the plugin", () => {
  it("shares one controller between usePageProgress() and the bar", async () => {
    let api!: ReturnType<typeof usePageProgress>;
    const Fetcher = defineComponent({
      setup() {
        api = usePageProgress();
        return () => null;
      },
    });
    const w = mount(
      { render: () => [h(PageProgress, { delay: 0 }), h(Fetcher)] },
      { global: { plugins: [VueSmartLoadingKit] } }
    );

    api.start();
    await tick(50);
    expect(w.find(".vslk-page-progress").exists()).toBe(true);

    api.done();
    await tick(500);
    expect(w.find(".vslk-page-progress").exists()).toBe(false);
  });

  it("binds the router given to the plugin", async () => {
    const hooks: Record<string, () => void> = {};
    const router: RouterLike = {
      beforeEach: (fn) => ((hooks.before = fn as () => void), () => {}),
      afterEach: (fn) => ((hooks.after = fn as () => void), () => {}),
      onError: (fn) => ((hooks.error = fn as () => void), () => {}),
    };
    const w = mount(PageProgress, {
      props: { delay: 0 },
      global: { plugins: [[VueSmartLoadingKit, { router }]] },
    });

    hooks.before();
    await tick(50);

    expect(bar(w).exists()).toBe(true);
  });

  it("applies pageProgress config (color, thickness, delay)", async () => {
    let api!: ReturnType<typeof usePageProgress>;
    const Fetcher = defineComponent({
      setup() {
        api = usePageProgress();
        return () => null;
      },
    });
    const w = mount(
      { render: () => [h(PageProgress), h(Fetcher)] },
      {
        global: {
          plugins: [[VueSmartLoadingKit, { pageProgress: { color: "#7c3aed", thickness: 5, delay: 50 } }]],
        },
      }
    );

    api.start();
    await tick(40);
    expect(w.find(".vslk-page-progress").exists()).toBe(false);
    await tick(20);

    const progressEl = w.find(".vslk-progress").element as HTMLElement;
    expect(progressEl.style.height).toBe("5px");
    expect(progressEl.style.color).toBe("rgb(124, 58, 237)");
  });

  it("usePageProgress() without the plugin warns and does nothing", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    let api!: ReturnType<typeof usePageProgress>;
    mount(defineComponent({ setup: () => ((api = usePageProgress()), () => null) }));

    expect(() => (api.start(), api.done())).not.toThrow();
    expect(warn.mock.calls.map((c) => String(c[0])).join()).toMatch(/usePageProgress.*plugin/);
    warn.mockRestore();
  });
});
