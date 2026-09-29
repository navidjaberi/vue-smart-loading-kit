import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Spinner from "../../src/components/Spinner/Spinner.vue";

describe("Spinner - Orbit Variant", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
      },
    });

    const orbit = wrapper.find(".vslk-orbit");
    const ring = wrapper.find(".vslk-orbit-ring");
    const rotator = wrapper.find(".vslk-orbit-rotator");
    const dot = wrapper.find(".vslk-orbit-dot");

    expect(orbit.exists()).toBe(true);
    expect(ring.exists()).toBe(true);
    expect(rotator.exists()).toBe(true);
    expect(dot.exists()).toBe(true);

    const orbitElement = orbit.element as HTMLElement;
    const dotElement = dot.element as HTMLElement;

    expect(orbitElement.style.width).toBe("40px");
    expect(orbitElement.style.height).toBe("40px");

    expect(orbitElement.style.getPropertyValue("--vslk-size")).toBe("40px");
    expect(orbitElement.style.getPropertyValue("--vslk-dot-size")).toBe("6.4px");
    expect(orbitElement.style.getPropertyValue("--vslk-radius")).toBe("16.8px");
    expect(orbitElement.style.getPropertyValue("--vslk-color")).toBe("currentColor");
    expect(orbitElement.style.getPropertyValue("--vslk-duration")).toBe("1s");
    

    expect(dotElement.classList.contains("vslk-orbit-dot")).toBe(true);
  });

  it("calculates dimensions from a numeric size", () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
        size: 80,
      },
    });

    const orbit = wrapper.find(".vslk-orbit");
    const orbitElement = orbit.element as HTMLElement;
    expect(orbitElement.style.width).toBe("80px");
    expect(orbitElement.style.height).toBe("80px");

    expect(orbitElement.style.getPropertyValue("--vslk-size")).toBe("80px");
    expect(orbitElement.style.getPropertyValue("--vslk-dot-size")).toBe(
      "12.8px"
    );
    expect(orbitElement.style.getPropertyValue("--vslk-radius")).toBe("33.6px");
  });

  it("supports string sizes with px units", () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
        size: "64px",
      },
    });

    const orbit = wrapper.find(".vslk-orbit");
    const orbitElement = orbit.element as HTMLElement;

    expect(orbitElement.style.width).toBe("64px");
    expect(orbitElement.style.height).toBe("64px");
    expect(orbitElement.style.getPropertyValue("--vslk-size")).toBe("64px");
    expect(orbitElement.style.getPropertyValue("--vslk-dot-size")).toBe(
      "10.24px"
    );
    expect(orbitElement.style.getPropertyValue("--vslk-radius")).toBe(
      "26.88px"
    );
  });

  it("applies a custom color", () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
        color: "#ef4444",
      },
    });

    const orbitElement = wrapper.find(".vslk-orbit").element as HTMLElement;

    expect(orbitElement.style.getPropertyValue("--vslk-color")).toBe("#ef4444");
  });

  it("calculates animation duration from speed", () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
        speed: 2,
      },
    });

    const orbit = wrapper.find(".vslk-orbit");
    const orbitElement = orbit.element as HTMLElement;

    expect(orbitElement.style.getPropertyValue("--vslk-duration")).toBe("0.5s");
  });

  it("updates size, color, and speed reactively", async () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
        size: 48,
        color: "#41B780",
        speed: 1,
      },
    });

    await wrapper.setProps({
      size: 96,
      color: "#ef4444",
      speed: 0.5,
    });

    const orbit = wrapper.find(".vslk-orbit");
    const orbitElement = orbit.element as HTMLElement;

    expect(orbitElement.style.width).toBe("96px");
    expect(orbitElement.style.height).toBe("96px");
    expect(orbitElement.style.getPropertyValue("--vslk-size")).toBe("96px");
    expect(orbitElement.style.getPropertyValue("--vslk-dot-size")).toBe(
      "15.36px"
    );
    expect(orbitElement.style.getPropertyValue("--vslk-radius")).toBe(
      "40.32px"
    );
    expect(orbitElement.style.getPropertyValue("--vslk-color")).toBe("#ef4444");
    expect(orbitElement.style.getPropertyValue("--vslk-duration")).toBe("2s");
  });

  it("falls back to one second duration for an invalid speed", () => {
    const wrapper = mount(Spinner, {
      props: {
        type: "orbit",
        speed: 0,
      },
    });

    const orbit = wrapper.find(".vslk-orbit");
    const orbitElement = orbit.element as HTMLElement;

    expect(orbitElement.style.getPropertyValue("--vslk-duration")).toBe("1s");
  });
});
