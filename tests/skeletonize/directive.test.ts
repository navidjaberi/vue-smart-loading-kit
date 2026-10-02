import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref, withDirectives, type Ref } from "vue";
import VueSmartLoadingKit, { provideLoadingConfig, vSkeleton, type SkeletonDirectiveValue } from "../../src/index";

/** A component whose root <section> carries v-skeleton bound to `value`. */
function host(value: Ref<SkeletonDirectiveValue>, attrs: Record<string, string> = {}) {
  return defineComponent({
    render: () =>
      withDirectives(h("section", { class: "host", ...attrs }, [h("p", "Ada Lovelace")]), [[vSkeleton, value.value]]),
  });
}
const el = (w: ReturnType<typeof mount>) => w.find(".host").element as HTMLElement;
const isSkeleton = (e: HTMLElement) => e.classList.contains("vslk-skeletonize");

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("v-skeleton timing", () => {
  it("marks the element busy at once, and skeletonizes it after the 200ms default delay", async () => {
    const value = ref<SkeletonDirectiveValue>(true);
    const w = mount(host(value));

    expect(el(w).getAttribute("aria-busy")).toBe("true");
    expect(isSkeleton(el(w))).toBe(false);
    vi.advanceTimersByTime(200);
    expect(isSkeleton(el(w))).toBe(true);
    expect(el(w).hasAttribute("inert")).toBe(true);
    expect(el(w).getAttribute("aria-hidden")).toBe("true");
  });

  it("skeletonizes immediately with delay 0", () => {
    const w = mount(host(ref<SkeletonDirectiveValue>({ loading: true, delay: 0 })));

    expect(isSkeleton(el(w))).toBe(true);
  });

  it("never skeletonizes a load shorter than the delay", async () => {
    const value = ref<SkeletonDirectiveValue>(true);
    const w = mount(host(value));
    const seen: boolean[] = [];

    for (let t = 0; t < 150; t += 10) {
      vi.advanceTimersByTime(10);
      seen.push(isSkeleton(el(w)));
    }
    value.value = false;
    await nextTick();
    vi.advanceTimersByTime(1000);

    expect([...seen, isSkeleton(el(w))]).not.toContain(true);
  });

  it("holds the skeleton for minDuration", async () => {
    const value = ref<SkeletonDirectiveValue>({ loading: true, delay: 0, minDuration: 500 });
    const w = mount(host(value));

    value.value = { loading: false, delay: 0, minDuration: 500 };
    await nextTick();
    expect(isSkeleton(el(w))).toBe(true);
    vi.advanceTimersByTime(500);
    expect(isSkeleton(el(w))).toBe(false);
  });
});

describe("v-skeleton attributes", () => {
  it("restores the element's own aria and inert values afterwards", async () => {
    const value = ref<SkeletonDirectiveValue>({ loading: true, delay: 0, minDuration: 0 });
    const w = mount(host(value, { "aria-hidden": "false", "aria-busy": "false" }));

    value.value = { loading: false, delay: 0, minDuration: 0 };
    await nextTick();

    expect(el(w).getAttribute("aria-hidden")).toBe("false");
    expect(el(w).getAttribute("aria-busy")).toBe("false");
    expect(el(w).hasAttribute("inert")).toBe(false);
    expect(el(w).className).toBe("host");
    expect(el(w).getAttribute("style") ?? "").not.toContain("--vslk-sk");
  });

  it("sets appearance variables and the animation class from config", () => {
    const w = mount(host(ref<SkeletonDirectiveValue>({ loading: true, delay: 0 })), {
      global: { plugins: [[VueSmartLoadingKit, { skeleton: { color: "#111111", animation: "pulse", speed: 2 } }]] },
    });

    expect(el(w).classList).toContain("vslk-skeletonize--pulse");
    expect(el(w).style.getPropertyValue("--vslk-sk-base")).toBe("#111111");
    expect(el(w).style.getPropertyValue("--vslk-sk-duration")).toBe("750ms");
  });

  it("reads delay from config smartLoader, an explicit value winning", () => {
    const w = mount(host(ref<SkeletonDirectiveValue>(true)), {
      global: { plugins: [[VueSmartLoadingKit, { smartLoader: { delay: 0 } }]] },
    });

    expect(isSkeleton(el(w))).toBe(true);
  });

  it("follows provideLoadingConfig from an ancestor", () => {
    const value = ref<SkeletonDirectiveValue>({ loading: true, delay: 0 });
    const Inner = host(value);
    const Outer = defineComponent({
      setup() {
        provideLoadingConfig({ skeleton: { color: "#222222" } });
        return () => h(Inner);
      },
    });

    expect(el(mount(Outer)).style.getPropertyValue("--vslk-sk-base")).toBe("#222222");
  });

  it("clears timers and restores attributes on unmount", () => {
    const w = mount(host(ref<SkeletonDirectiveValue>(true)));
    const node = el(w);

    w.unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(node.hasAttribute("aria-busy")).toBe(false);
  });
});
