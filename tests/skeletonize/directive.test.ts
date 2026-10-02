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

describe("v-skeleton review fixes", () => {
  it("leaves no skeleton attributes behind after SSR hydration once loading ends", async () => {
    const { createSSRApp } = await import("vue");
    const { renderToString } = await import("vue/server-renderer");
    const loading = ref(true);
    const make = () =>
      createSSRApp({
        render: () =>
          withDirectives(h("article", { class: "card" }, [h("p", "Placeholder")]), [
            [vSkeleton, { loading: loading.value, delay: 0, minDuration: 0 }],
          ]),
      });

    const html = await renderToString(make());
    const container = document.createElement("div");
    container.innerHTML = html;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    make().mount(container);
    warn.mockRestore();

    loading.value = false;
    await nextTick();
    const article = container.querySelector("article")!;
    for (const name of ["inert", "aria-hidden", "aria-busy", "data-allow-mismatch"]) {
      expect(article.hasAttribute(name), name).toBe(false);
    }
    expect(article.className).toBe("card");
  });

  it("keeps the skeleton when Vue re-patches the element's class mid-load", async () => {
    const active = ref(false);
    const Comp = defineComponent({
      render: () =>
        withDirectives(h("section", { class: ["host", { active: active.value }] }, [h("p", "Ada")]), [
          [vSkeleton, { loading: true, delay: 0 }],
        ]),
    });
    const w = mount(Comp);

    active.value = true;
    await nextTick();

    expect(el(w).classList).toContain("active");
    expect(isSkeleton(el(w))).toBe(true);
  });

  it("restores the latest bound aria-hidden, not a stale one", async () => {
    const hidden = ref("false");
    const loading = ref(true);
    const Comp = defineComponent({
      render: () =>
        withDirectives(h("section", { class: "host", "aria-hidden": hidden.value }, [h("p", "Ada")]), [
          [vSkeleton, { loading: loading.value, delay: 0, minDuration: 0 }],
        ]),
    });
    const w = mount(Comp);

    hidden.value = "true";
    await nextTick();
    expect(el(w).getAttribute("aria-hidden")).toBe("true");
    loading.value = false;
    await nextTick();

    expect(el(w).getAttribute("aria-hidden")).toBe("true");
    hidden.value = "false";
    await nextTick();
    expect(el(w).getAttribute("aria-hidden")).toBe("false");
  });
});

// Gaps found by mutation testing (npm run test:mutation)
describe("v-skeleton restores and configures exactly", () => {
  it("restores boolean-bound aria attributes the way Vue renders them", async () => {
    const attrs = { "aria-hidden": false, "aria-busy": false } as const;
    const plain = mount({ render: () => h("section", attrs) }).element as HTMLElement;
    const loading = ref(true);
    const Comp = defineComponent({
      render: () =>
        withDirectives(h("section", { class: "host", ...attrs }, [h("p", "Ada")]), [
          [vSkeleton, { loading: loading.value, delay: 0, minDuration: 0 }],
        ]),
    });
    const w = mount(Comp);

    expect(el(w).getAttribute("aria-hidden")).toBe("true");
    loading.value = false;
    await nextTick();

    for (const name of Object.keys(attrs)) {
      expect(el(w).getAttribute(name), name).toBe(plain.getAttribute(name));
    }
  });

  it("restores a template-bound inert after loading ends", async () => {
    const loading = ref(true);
    const Comp = defineComponent({
      render: () =>
        withDirectives(h("section", { class: "host", inert: "" }, [h("p", "Ada")]), [
          [vSkeleton, { loading: loading.value, delay: 0, minDuration: 0 }],
        ]),
    });
    const w = mount(Comp);

    loading.value = false;
    await nextTick();

    expect(el(w).getAttribute("inert")).toBe("");
  });

  it("uses a configured delay and minDuration when the binding has none", async () => {
    const value = ref<SkeletonDirectiveValue>(true);
    const w = mount(host(value), {
      global: { plugins: [[VueSmartLoadingKit, { smartLoader: { delay: 50, minDuration: 1000 } }]] },
    });

    vi.advanceTimersByTime(49);
    expect(isSkeleton(el(w))).toBe(false);
    vi.advanceTimersByTime(1);
    expect(isSkeleton(el(w))).toBe(true);

    value.value = false;
    await nextTick();
    vi.advanceTimersByTime(999);
    expect(isSkeleton(el(w))).toBe(true);
    vi.advanceTimersByTime(1);
    expect(isSkeleton(el(w))).toBe(false);
  });

  it("sets every appearance variable, inert, and exactly one animation class", () => {
    const w = mount(host(ref<SkeletonDirectiveValue>({ loading: true, delay: 0 })), {
      global: { plugins: [[VueSmartLoadingKit, { skeleton: { animation: "pulse", highlight: "#abcdef" } }]] },
    });

    expect(el(w).style.getPropertyValue("--vslk-sk-hi")).toBe("#abcdef");
    expect(el(w).style.getPropertyValue("--vslk-sk-duration")).toBe("1500ms");
    expect(el(w).getAttribute("inert")).toBe("");
    expect([...el(w).classList].filter((c) => c.startsWith("vslk-skeletonize--"))).toEqual(["vslk-skeletonize--pulse"]);
  });

  it("keeps aria-busy set when Vue re-patches it mid-load", async () => {
    const busy = ref<string | undefined>(undefined);
    const Comp = defineComponent({
      render: () =>
        withDirectives(h("section", { class: "host", "aria-busy": busy.value }, [h("p", "Ada")]), [
          [vSkeleton, { loading: true, delay: 1000 }],
        ]),
    });
    const w = mount(Comp);

    busy.value = "false";
    await nextTick();

    expect(el(w).getAttribute("aria-busy")).toBe("true");
  });

  it("removes its state on unmount, so the element can be skeletonized again", async () => {
    const show = ref(true);
    const Comp = defineComponent({
      render: () =>
        show.value
          ? withDirectives(h("section", { class: "host" }, [h("p", "Ada")]), [[vSkeleton, { loading: true, delay: 0 }]])
          : h("div"),
    });
    const w = mount(Comp);
    const node = el(w);

    show.value = false;
    await nextTick();

    expect(isSkeleton(node)).toBe(false);
    expect(node.hasAttribute("inert")).toBe(false);
    expect(node.hasAttribute("aria-hidden")).toBe(false);
  });
});

describe("v-skeleton getSSRProps", () => {
  const ssr = (value: SkeletonDirectiveValue) =>
    vSkeleton.getSSRProps!({ value, instance: null } as never, null as never);

  it("renders the full skeleton for delay 0", () => {
    expect(ssr({ loading: true, delay: 0 })).toEqual({
      class: "vslk-skeletonize vslk-skeletonize--shimmer",
      style: {
        "--vslk-sk-base": "rgba(148, 163, 184, 0.22)",
        "--vslk-sk-hi": "rgba(202, 209, 220, 0.28)",
        "--vslk-sk-duration": "1500ms",
      },
      inert: "",
      "aria-hidden": "true",
      "aria-busy": "true",
      "data-allow-mismatch": "class,style,attribute",
    });
  });

  it("renders only aria-busy while a delay is pending, and nothing when idle", () => {
    expect(ssr(true)).toEqual({ "aria-busy": "true" });
    expect(ssr(false)).toEqual({});
  });
});
