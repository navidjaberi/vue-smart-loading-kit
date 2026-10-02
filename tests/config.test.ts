import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, type Component } from "vue";
import VueSmartLoadingKit, {
  ProgressBar,
  Skeleton,
  SmartLoader,
  Spinner,
  provideLoadingConfig,
  type LoadingKitConfig,
} from "../src/index";

/** Mounts `component` inside an app configured with `config` via the plugin. */
function withConfig(config: LoadingKitConfig, component: Component, props: Record<string, unknown> = {}) {
  return mount(component, {
    props,
    global: { plugins: [[VueSmartLoadingKit, config]] },
  });
}

const style = (w: ReturnType<typeof mount>) => (w.element as HTMLElement).getAttribute("style") ?? "";

describe("global config: precedence", () => {
  it("applies config when the prop is not set", () => {
    const w = withConfig({ skeleton: { color: "#7c3aed" } }, Skeleton);

    expect(style(w)).toContain("--vslk-sk-base: #7c3aed");
  });

  it("lets an explicit prop win over config", () => {
    const w = withConfig({ skeleton: { color: "#7c3aed" } }, Skeleton, { color: "#ff0000" });

    expect(style(w)).toContain("--vslk-sk-base: #ff0000");
  });

  it("falls back to the built-in default without config", () => {
    const w = mount(Skeleton);

    expect(style(w)).toContain("--vslk-sk-base: rgba(148, 163, 184, 0.22)");
  });

  // boolean props: `false` written by the user must still beat config `true`
  it.each([
    ["Skeleton outlined", Skeleton, { skeleton: { outlined: true } }, { outlined: false },
      (w: ReturnType<typeof mount>) => w.classes().includes("vslk-sk--outlined")],
    ["Spinner track", Spinner, { spinner: { track: true } }, { variant: "arc", track: false },
      (w: ReturnType<typeof mount>) => w.find("[data-vslk-track]").exists()],
    ["ProgressBar track", ProgressBar, { progressBar: { track: true } }, { track: false },
      (w: ReturnType<typeof mount>) => w.find("[data-vslk-track]").exists()],
  ] as const)("%s: an explicit false beats config true", (_name, component, config, props, isOn) => {
    expect(isOn(withConfig(config as LoadingKitConfig, component))).toBe(true);
    expect(isOn(withConfig(config as LoadingKitConfig, component, props))).toBe(false);
  });
});

describe("global config: Skeleton", () => {
  it("applies animation, speed, angle, highlight and outlined", () => {
    const w = withConfig(
      {
        skeleton: {
          animation: "pulse",
          speed: 2,
          angle: 180,
          highlight: "#ffffff",
          outlined: { width: 3, style: "dashed" },
        },
      },
      Skeleton
    );

    expect(w.classes()).toContain("vslk-sk--anim-pulse");
    expect(w.classes()).toContain("vslk-sk--outlined");
    expect(style(w)).toContain("--vslk-sk-duration: 750ms");
    expect(style(w)).toContain("--vslk-sk-shimmer-angle: 180deg");
    expect(style(w)).toContain("--vslk-sk-hi: #ffffff");
    expect(style(w)).toContain("--vslk-sk-outline-w: 3px");
  });

  it("reaches the nested skeletons of composite variants", () => {
    const w = withConfig({ skeleton: { color: "#7c3aed" } }, Skeleton, { variant: "card" });
    const containers = w.findAll(".vslk-skeleton-container");

    expect(containers.length).toBeGreaterThan(1);
    for (const c of containers) expect(c.attributes("style")).toContain("--vslk-sk-base: #7c3aed");
  });
});

describe("global config: Spinner", () => {
  it("applies variant, color, size, thickness and track", () => {
    const w = withConfig(
      { spinner: { variant: "arc", color: "#7c3aed", size: 24, thickness: 2, track: true } },
      Spinner
    );
    const svg = w.find("svg.vslk-spinner-arc").element as SVGElement;

    expect(svg).toBeTruthy();
    expect(svg.style.width).toBe("24px");
    expect(svg.style.color).toBe("rgb(124, 58, 237)");
    expect(w.find("[data-vslk-track]").exists()).toBe(true);
  });

  it("lets the deprecated `type` prop beat a configured variant", () => {
    const w = withConfig({ spinner: { variant: "arc" } }, Spinner, { type: "dots" });

    expect(w.find(".vslk-spinner-dots").exists()).toBe(true);
  });
});

describe("global config: ProgressBar", () => {
  it("applies color, thickness and speed", () => {
    const w = withConfig({ progressBar: { color: "#7c3aed", thickness: 2, speed: 2 } }, ProgressBar);
    const el = w.element as HTMLElement;

    expect(el.style.height).toBe("2px");
    expect(el.style.color).toBe("rgb(124, 58, 237)");
    expect(el.style.getPropertyValue("--vslk-progress-duration")).toBe("0.75s");
  });
});

describe("global config: SmartLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const slot = { default: () => h("p", { class: "content" }, "Loaded") };

  it("applies delay, mode and the default spinner", async () => {
    const w = mount(SmartLoader, {
      props: { loading: true },
      slots: slot,
      global: {
        plugins: [[VueSmartLoadingKit, { smartLoader: { delay: 50, mode: "overlay", spinner: { variant: "dots" } } }]],
      },
    });

    vi.advanceTimersByTime(50);
    await nextTick();
    expect(w.find(".vslk-smart-loader__overlay .vslk-spinner-dots").exists()).toBe(true);
  });

  it("merges a configured skeleton with the prop, the prop winning", () => {
    const w = mount(SmartLoader, {
      props: { loading: true, delay: 0, skeleton: { color: "#ff0000" } },
      slots: slot,
      global: { plugins: [[VueSmartLoadingKit, { smartLoader: { skeleton: { variant: "list", color: "#7c3aed" } } }]] },
    });

    expect(w.find(".vslk-sk--v-list").exists()).toBe(true);
    expect(w.find(".vslk-skeleton-container").attributes("style")).toContain("--vslk-sk-base: #ff0000");
  });

  it("lets an explicit preserveHeight=false beat config", async () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 600 } as DOMRect);
    const w = mount(SmartLoader, {
      props: { loading: false, delay: 0, preserveHeight: false },
      slots: slot,
      global: { plugins: [[VueSmartLoadingKit, { smartLoader: { preserveHeight: true } }]] },
    });

    await w.setProps({ loading: true });
    expect((w.element as HTMLElement).style.minHeight).toBe("");
    vi.restoreAllMocks();
  });
});

describe("provideLoadingConfig", () => {
  it("overrides config for a subtree, merging with the app config", () => {
    const Section = defineComponent({
      setup(_, { slots }) {
        provideLoadingConfig({ skeleton: { color: "#111111" } });
        return () => slots.default?.();
      },
    });
    const w = withConfig({ skeleton: { color: "#7c3aed", animation: "pulse" } }, {
      render: () => [
        h(Skeleton, { class: "outside" }),
        h(Section, null, () => h(Skeleton, { class: "inside" })),
      ],
    });

    const inside = w.find(".inside");
    expect(w.find(".outside").attributes("style")).toContain("--vslk-sk-base: #7c3aed");
    expect(inside.attributes("style")).toContain("--vslk-sk-base: #111111");
    // the section only overrode color; animation still comes from the app
    expect(inside.classes()).toContain("vslk-sk--anim-pulse");
  });

  it("works without the plugin (local imports)", () => {
    const Root = defineComponent({
      setup() {
        provideLoadingConfig({ spinner: { variant: "dots" } });
        return () => h(Spinner);
      },
    });

    expect(mount(Root).find(".vslk-spinner-dots").exists()).toBe(true);
  });
});

describe("mergeLoadingConfig", () => {
  it("keeps the sections an override doesn't touch, and merges the ones it does", async () => {
    const { mergeLoadingConfig } = await import("../src/config");
    const base = { skeleton: { color: "#111111", animation: "pulse" as const }, spinner: { variant: "dots" as const } };

    expect(mergeLoadingConfig(base, { skeleton: { color: "#222222" } })).toEqual({
      skeleton: { color: "#222222", animation: "pulse" },
      spinner: { variant: "dots" },
    });
    expect(mergeLoadingConfig(base, { progressBar: { thickness: 2 } })).toEqual({ ...base, progressBar: { thickness: 2 } });
  });
});
