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

  it("applies the wrapper's default color (#3b82f6) to every dot", () => {
    const wrapper = mount(Spinner, { props: { type: "orbitDots" } });

    wrapper.findAll(".dot-core").forEach((dot) => {
      expect(dot.element).toHaveStyle({ backgroundColor: "#3b82f6" });
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
});