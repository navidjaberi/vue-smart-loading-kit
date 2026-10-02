import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";

describe("OrbitDots Spinner (via Spinner wrapper, type='orbitDots')", () => {
  it("renders 3 dots orbiting the center", () => {
    const wrapper = mount(Spinner, { props: { type: "orbitDots" } });

    expect(wrapper.findAll(".holder")).toHaveLength(3);
    expect(wrapper.findAll(".dot-core")).toHaveLength(3);
  });

  it("rotates each holder by 0deg, 120deg and 240deg", () => {
    const wrapper = mount(Spinner, { props: { type: "orbitDots" } });

    const holders = wrapper.findAll(".holder");
    expect(holders[0].attributes("style")).toContain("rotate(0deg)");
    expect(holders[1].attributes("style")).toContain("rotate(120deg)");
    expect(holders[2].attributes("style")).toContain("rotate(240deg)");
  });

  it("applies the wrapper's default size (40px) to the container", () => {
    const wrapper = mount(Spinner, { props: { type: "orbitDots" } });

    const container = wrapper.find(".vslk-spinner-orbit-dots");
    expect(container.element).toHaveStyle({ width: "40px", height: "40px" });
  });

  it("applies a custom size to the container", () => {
    const wrapper = mount(Spinner, {
      props: { type: "orbitDots", size: 80 },
    });

    const container = wrapper.find(".vslk-spinner-orbit-dots");
    expect(container.element).toHaveStyle({ width: "80px", height: "80px" });
  });

  it("sizes each dot to 1/4 of the container size", () => {
    const wrapper = mount(Spinner, {
      props: { type: "orbitDots", size: 80 },
    });

    const dot = wrapper.find(".dot-core");
    expect(dot.attributes("style")).toContain("width: 20px");
    expect(dot.attributes("style")).toContain("height: 20px");
  });

  it("recomputes dot size and orbit radius when size changes reactively", async () => {
    const wrapper = mount(Spinner, {
      props: { type: "orbitDots", size: 40 },
    });

    const initialDotStyle = wrapper.find(".dot-core").attributes("style");
    expect(initialDotStyle).toContain("width: 10px"); 

    await wrapper.setProps({ size: 120 });

    const updatedDotStyle = wrapper.find(".dot-core").attributes("style");
    expect(updatedDotStyle).toContain("width: 30px"); // 120 / 4
    expect(updatedDotStyle).not.toContain("width: 10px");
  });

  it("recomputes animation duration when speed changes reactively", async () => {
    const wrapper = mount(Spinner, {
      props: { type: "orbitDots", speed: 1 },
    });

    expect(
      wrapper.find(".vslk-spinner-orbit-dots").attributes("style")
    ).toContain("animation-duration: 1s");

    await wrapper.setProps({ speed: 2 });
    expect(
      wrapper.find(".vslk-spinner-orbit-dots").attributes("style")
    ).toContain("animation-duration: 0.5s");
  });

  it("applies the wrapper's default color (currentColor) to every dot", () => {
    const wrapper = mount(Spinner, { props: { type: "orbitDots" } });

    wrapper.findAll(".dot-core").forEach((dot) => {
      expect((dot.element as HTMLElement).style.backgroundColor.toLowerCase()).toBe("currentcolor");
    });
  });

  it("applies a custom color to every dot", () => {
    const wrapper = mount(Spinner, {
      props: { type: "orbitDots", color: "#7c3aed" },
    });

    wrapper.findAll(".dot-core").forEach((dot) => {
      expect(dot.element).toHaveStyle({ backgroundColor: "#7c3aed" });
    });
  });

  it("applies duration = 1/speed to the container and every dot", () => {
    const wrapper = mount(Spinner, {
      props: { type: "orbitDots", speed: 0.5 },
    });

    const container = wrapper.find(".vslk-spinner-orbit-dots");
    expect(container.attributes("style")).toContain("animation-duration: 2s");

    wrapper.findAll(".dot-core").forEach((dot) => {
      expect(dot.attributes("style")).toContain("animation-duration: 2s");
    });
  });

  it("is correctly dispatched by the Spinner wrapper for type='orbitDots'", () => {
    const wrapper = mount(Spinner, { props: { type: "orbitDots" } });

    expect(wrapper.find(".vslk-spinner-orbit-dots").exists()).toBe(true);
    const other = mount(Spinner, { props: { type: "circle" } });
    expect(other.find(".vslk-spinner-orbit-dots").exists()).toBe(false);
  });

  // Orbit geometry, pinned by mutation testing (npm run test:mutation)
  describe("orbit geometry", () => {
    const core = (props: Record<string, unknown>) =>
      mount(Spinner, { props: { variant: "orbit-dots", ...props } }).find(".dot-core").element as HTMLElement;

    it("puts the dots on a radius of size * 3/8 and pulses them 28% of it inward (px)", () => {
      const el = core({ size: 80 });
      expect(el.style.getPropertyValue("--orbit-radius")).toBe("30px");
      expect(el.style.getPropertyValue("--inward-offset")).toBe("8.4px");
      expect(el).toHaveStyle({ width: "20px", height: "20px" });
    });

    it("uses calc() for non-px sizes", () => {
      const el = core({ size: "3rem" });
      expect(el.style.getPropertyValue("--orbit-radius")).toBe("calc(3rem * 0.375)");
      expect(el.style.getPropertyValue("--inward-offset")).toBe("calc(3rem * 0.105)");
      expect(el.style.width).toBe("calc(0.75rem)"); // jsdom simplifies calc(3rem / 4)
    });

    it("runs one orbit per second at speed 1, and treats a non-positive speed as 1", () => {
      expect(core({ speed: 2 }).style.animationDuration).toBe("0.5s");
      expect(core({ speed: 0 }).style.animationDuration).toBe("1s");
      expect(core({ speed: -1 }).style.animationDuration).toBe("1s");
    });
  });
});
