import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createApp } from "vue";
import ProgressBar from "../src/components/ProgressBar/ProgressBar.vue";
import VueSmartLoadingKit, { ProgressBar as ExportedProgressBar } from "../src/index";

const root = (w: ReturnType<typeof mount>) => w.element as HTMLElement;
const bar = (w: ReturnType<typeof mount>) => w.find(".vslk-progress__bar").element as HTMLElement;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ProgressBar", () => {
  it("renders a full-width track whose height is `thickness`", () => {
    const wrapper = mount(ProgressBar, { props: { thickness: 6 } });

    expect(root(wrapper).classList).toContain("vslk-progress");
    expect(root(wrapper).style.height).toBe("6px");
  });

  it("inherits the text color by default and accepts a custom one", () => {
    expect(root(mount(ProgressBar)).style.color.toLowerCase()).toBe("currentcolor");
    expect(root(mount(ProgressBar, { props: { color: "#7c3aed" } })).style.color).toBe(
      "rgb(124, 58, 237)"
    );
  });

  describe("indeterminate (no value)", () => {
    it("animates a sliding segment, scaled by speed", () => {
      const wrapper = mount(ProgressBar, { props: { speed: 2 } });

      expect(root(wrapper).classList).toContain("vslk-progress--indeterminate");
      expect(root(wrapper).style.getPropertyValue("--vslk-progress-duration")).toBe("0.75s");
      expect(bar(wrapper).style.width).toBe("");
    });

    it.each([NaN, Infinity])("stays indeterminate for value %s", (value) => {
      const wrapper = mount(ProgressBar, { props: { value } });

      expect(root(wrapper).classList).toContain("vslk-progress--indeterminate");
    });

    it("runs at half speed when reduced motion is requested", () => {
      vi.stubGlobal("matchMedia", () => ({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      }));
      const wrapper = mount(ProgressBar, { props: { speed: 1 } });

      expect(root(wrapper).style.getPropertyValue("--vslk-progress-duration")).toBe("3s");
    });
  });

  describe("determinate (value)", () => {
    it.each([
      [0, "0%"],
      [42.5, "42.5%"],
      [100, "100%"],
      [-5, "0%"],
      [180, "100%"],
    ])("fills %s as width %s", (value, width) => {
      const wrapper = mount(ProgressBar, { props: { value } });

      expect(root(wrapper).classList).not.toContain("vslk-progress--indeterminate");
      expect(bar(wrapper).style.width).toBe(width);
    });
  });

  describe("track", () => {
    it("is shown by default, derived from the color", () => {
      const wrapper = mount(ProgressBar);

      expect(root(wrapper).getAttribute("data-vslk-track")).toBe("auto");
      // custom properties keep their original casing
      expect(root(wrapper).style.getPropertyValue("--vslk-progress-track")).toMatch(/currentcolor/i);
    });

    it("can be turned off or given a color", () => {
      const off = mount(ProgressBar, { props: { track: false } });
      const custom = mount(ProgressBar, { props: { track: "#e5e7eb" } });

      expect(root(off).hasAttribute("data-vslk-track")).toBe(false);
      expect(root(off).style.getPropertyValue("--vslk-progress-track")).toBe("transparent");
      expect(root(custom).getAttribute("data-vslk-track")).toBe("#e5e7eb");
      expect(root(custom).style.getPropertyValue("--vslk-progress-track")).toBe("#e5e7eb");
    });
  });

  describe("accessibility", () => {
    it("is hidden from assistive tech without a label", () => {
      expect(mount(ProgressBar, { props: { value: 30 } }).attributes("aria-hidden")).toBe("true");
    });

    it("is a progressbar with its percentage when labelled and determinate", () => {
      const wrapper = mount(ProgressBar, { props: { value: 33.6, label: "Uploading" } });

      expect(wrapper.attributes()).toMatchObject({
        role: "progressbar",
        "aria-valuemin": "0",
        "aria-valuemax": "100",
        "aria-valuenow": "34",
        "aria-label": "Uploading",
      });
      expect(wrapper.find(".vslk-sr-only").exists()).toBe(false);
    });

    it("is a live status when labelled and indeterminate", () => {
      const wrapper = mount(ProgressBar, { props: { label: "Loading page" } });

      expect(wrapper.attributes()).toMatchObject({ role: "status", "aria-busy": "true" });
      expect(wrapper.find(".vslk-sr-only").text()).toBe("Loading page");
    });
  });

  describe("exports", () => {
    it("is exported by name and registered by the plugin", () => {
      const app = createApp({});
      app.use(VueSmartLoadingKit);

      expect(ExportedProgressBar).toBe(ProgressBar);
      expect(app.component("ProgressBar")).toBe(ProgressBar);
    });
  });
});
