import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createApp, h, nextTick } from "vue";
import SmartLoader from "../src/components/SmartLoader.vue";
import VueSmartLoadingKit, { SmartLoader as ExportedSmartLoader } from "../src/index";

const content = { default: () => h("p", { class: "content" }, "Loaded") };

function mountLoader(props: Record<string, unknown>, slots: Record<string, () => unknown> = content) {
  return mount(SmartLoader, { props: { loading: false, ...props }, slots });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SmartLoader — replace mode (default)", () => {
  it("shows the content when not loading", () => {
    const wrapper = mountLoader({ loading: false });

    expect(wrapper.find(".content").exists()).toBe(true);
    expect(wrapper.find(".vslk-skeleton-container").exists()).toBe(false);
  });

  it("keeps the content during the delay, then swaps in a skeleton", async () => {
    const wrapper = mountLoader({ loading: true, delay: 200 });

    expect(wrapper.find(".content").exists()).toBe(true);

    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find(".content").exists()).toBe(false);
    expect(wrapper.find(".vslk-skeleton-container").exists()).toBe(true);
  });

  it("defaults to a three-line text skeleton", () => {
    const wrapper = mountLoader({ loading: true, delay: 0 });

    expect(wrapper.find(".vslk-sk--v-text").exists()).toBe(true);
    expect(wrapper.findAll(".vslk-sk-shape")).toHaveLength(3);
  });

  it("forwards `skeleton` props", () => {
    const wrapper = mountLoader({ loading: true, delay: 0, skeleton: { variant: "table" } });

    expect(wrapper.find(".vslk-sk--v-table").exists()).toBe(true);
  });

  it("keeps the loader up for minDuration after loading ends", async () => {
    const wrapper = mountLoader({ loading: true, delay: 0, minDuration: 500 });

    await wrapper.setProps({ loading: false });
    expect(wrapper.find(".content").exists()).toBe(false);

    vi.advanceTimersByTime(500);
    await nextTick();
    expect(wrapper.find(".content").exists()).toBe(true);
  });
});

describe("SmartLoader — overlay mode", () => {
  it("keeps the content rendered and interactive when idle", () => {
    const wrapper = mountLoader({ mode: "overlay", loading: false });

    expect(wrapper.find(".content").exists()).toBe(true);
    expect(wrapper.find(".vslk-smart-loader__overlay").exists()).toBe(false);
    expect(wrapper.find(".vslk-smart-loader__content").attributes("inert")).toBeUndefined();
  });

  it("covers the content with a spinner and makes it inert", () => {
    const wrapper = mountLoader({ mode: "overlay", loading: true, delay: 0 });

    expect(wrapper.find(".content").exists()).toBe(true);
    expect(wrapper.find(".vslk-smart-loader__overlay .vslk-spinner-arc").exists()).toBe(true);
    expect(wrapper.find(".vslk-smart-loader__content").attributes("inert")).toBeDefined();
  });

  it("forwards `spinner` props", () => {
    const wrapper = mountLoader({
      mode: "overlay",
      loading: true,
      delay: 0,
      spinner: { variant: "dots", size: 24 },
    });

    expect(wrapper.find(".vslk-smart-loader__overlay .vslk-spinner-dots").exists()).toBe(true);
  });
});

describe("SmartLoader — slots and accessibility", () => {
  it("renders the #loader slot instead of the default loader", () => {
    const wrapper = mountLoader(
      { loading: true, delay: 0 },
      { ...content, loader: () => h("span", { class: "custom-loader" }) }
    );

    expect(wrapper.find(".custom-loader").exists()).toBe(true);
    expect(wrapper.find(".vslk-skeleton-container").exists()).toBe(false);
  });

  it("marks the region aria-busy as soon as loading starts, before the loader shows", async () => {
    const wrapper = mountLoader({ loading: false, delay: 200 });
    expect(wrapper.attributes("aria-busy")).toBeUndefined();

    await wrapper.setProps({ loading: true });
    expect(wrapper.attributes("aria-busy")).toBe("true");
  });

  it.each(["replace", "overlay"] as const)("%s mode passes `label` to its loader", (mode) => {
    const wrapper = mountLoader({ mode, loading: true, delay: 0, label: "Loading users" });

    expect(wrapper.find('[role="status"]').text()).toContain("Loading users");
  });
});

describe("SmartLoader — exports", () => {
  it("is exported by name", () => {
    expect(ExportedSmartLoader).toBe(SmartLoader);
  });

  it("is registered globally by the plugin", () => {
    const app = createApp({});
    app.use(VueSmartLoadingKit);

    expect(app.component("SmartLoader")).toBe(SmartLoader);
  });
});

describe("SmartLoader — error state", () => {
  it("shows a default error with a retry button instead of the content", () => {
    const wrapper = mountLoader({ loading: false, error: new Error("boom") });

    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain("Something went wrong");
    expect(alert.find("button").text()).toBe("Try again");
    expect(wrapper.find(".content").exists()).toBe(false);
  });

  it("emits retry from the default button", async () => {
    const wrapper = mountLoader({ loading: false, error: true });

    await wrapper.find('[role="alert"] button').trigger("click");

    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("passes the error and a retry function to the #error slot", async () => {
    const wrapper = mountLoader(
      { loading: false, error: "Network down" },
      {
        ...content,
        error: (({ error, retry }: { error: unknown; retry: () => void }) =>
          h("button", { class: "my-retry", onClick: retry }, String(error))) as never,
      }
    );

    expect(wrapper.find(".my-retry").text()).toBe("Network down");
    await wrapper.find(".my-retry").trigger("click");
    expect(wrapper.emitted("retry")).toHaveLength(1);
  });

  it("shows the content when error is falsy", () => {
    for (const error of [null, undefined, false, ""]) {
      expect(mountLoader({ loading: false, error }).find(".content").exists()).toBe(true);
    }
  });

  it("keeps the error on screen while a retry is within its delay, then shows the loader", async () => {
    const wrapper = mountLoader({ loading: false, error: true, delay: 200 });

    await wrapper.setProps({ loading: true });
    expect(wrapper.find('[role="alert"]').exists()).toBe(true);
    expect(wrapper.find(".content").exists()).toBe(false);

    vi.advanceTimersByTime(200);
    await nextTick();
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find(".vslk-skeleton-container").exists()).toBe(true);
  });

  it("overlay mode shows the error over the inert content", () => {
    const wrapper = mountLoader({ mode: "overlay", loading: false, error: true });

    expect(wrapper.find(".content").exists()).toBe(true);
    expect(wrapper.find(".vslk-smart-loader__content").attributes("inert")).toBeDefined();
    expect(wrapper.find('.vslk-smart-loader__overlay [role="alert"]').exists()).toBe(true);
  });
});

describe("SmartLoader — layout shift (replace mode)", () => {
  /* jsdom has no layout: fake one where the real content is `height` px
     tall and anything else (e.g. the skeleton) is 80px. That way a
     measurement taken AFTER the swap (the skeleton's height) is wrong. */
  const fakeHeight = (height: number) =>
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
      this: HTMLElement
    ) {
      return { height: this.querySelector(".content") ? height : 80 } as DOMRect;
    });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reserves the content's height while the loader replaces it, then releases it", async () => {
    fakeHeight(600);
    const wrapper = mountLoader({ loading: false, delay: 0, minDuration: 0 });

    await wrapper.setProps({ loading: true });
    expect(wrapper.find(".vslk-skeleton-container").exists()).toBe(true);
    expect((wrapper.element as HTMLElement).style.minHeight).toBe("600px");

    await wrapper.setProps({ loading: false });
    expect(wrapper.find(".content").exists()).toBe(true);
    expect((wrapper.element as HTMLElement).style.minHeight).toBe("");
  });

  it("reserves nothing on the first load, when there was no content yet", () => {
    fakeHeight(600);
    const wrapper = mountLoader({ loading: true, delay: 0 });

    expect((wrapper.element as HTMLElement).style.minHeight).toBe("");
  });

  it("can be turned off with preserveHeight=false", async () => {
    fakeHeight(600);
    const wrapper = mountLoader({ loading: false, delay: 0, preserveHeight: false });

    await wrapper.setProps({ loading: true });

    expect((wrapper.element as HTMLElement).style.minHeight).toBe("");
  });

  it("does not reserve height in overlay mode, where the content stays", async () => {
    fakeHeight(600);
    const wrapper = mountLoader({ mode: "overlay", loading: false, delay: 0 });

    await wrapper.setProps({ loading: true });

    expect((wrapper.element as HTMLElement).style.minHeight).toBe("");
  });
});
