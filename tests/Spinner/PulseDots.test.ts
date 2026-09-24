import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Spinner from "../../src/components/Spinner/Spinner.vue";
import PulseDots from "../../src/components/Spinner/variants/PulseDots.vue";

describe("PulseDots Variant", () => {
  it("renders correctly with 3 dots", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots" },
    });

    expect(wrapper.find(".vslk-pulse-orbit").exists()).toBe(true);
    expect(wrapper.findAll(".vslk-pulse-orbit .dot")).toHaveLength(3);
  });

  it("applies size to the container as width and height", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots", size: 60 },
    });

    const container = wrapper.find(".vslk-pulse-orbit");

    expect(container.element).toHaveStyle({ width: "60px", height: "60px" });
  });

  it("derives dot size from size / 5", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots", size: 100 },
    });

    const dot = wrapper.find(".dot");

    expect(dot.element).toHaveStyle({ width: "20px", height: "20px" });
  });

  it("derives dot size from the size prop (compared across separate mounts)", () => {
    const small = mount(PulseDots, { props: { size: 40 } });
    const large = mount(PulseDots, { props: { size: 100 } });

    expect(small.find(".dot").element).toHaveStyle({ width: "8px" });
    expect(large.find(".dot").element).toHaveStyle({ width: "20px" });

    const container = large.find(".vslk-pulse-orbit");
    expect(container.element).toHaveStyle({ width: "100px" });
  });

  it("applies custom color to every dot", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots", color: "#ff0000" },
    });

    wrapper.findAll(".dot").forEach((dot) => {
      expect(dot.element).toHaveStyle({ backgroundColor: "#ff0000" });
    });
  });

  it("derives animation duration from 1 / speed", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots", speed: 2 },
    });

    wrapper.findAll(".dot").forEach((dot) => {
      expect(dot.element).toHaveStyle({ animationDuration: "0.5s" });
    });
  });

  it("derives duration from the speed prop (compared across separate mounts)", () => {
    const slow = mount(PulseDots, { props: { speed: 1 } });
    const fast = mount(PulseDots, { props: { speed: 4 } });

    expect(slow.find(".dot").element).toHaveStyle({ animationDuration: "1s" });
    expect(fast.find(".dot").element).toHaveStyle({ animationDuration: "0.25s" });
  });

  it("REGRESSION: guards against speed = 0 (previously produced 'Infinitys')", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots", speed: 0 },
    });

    const dot = wrapper.find(".dot");

    expect(dot.element).toHaveStyle({ animationDuration: "1s" });
    expect(dot.attributes("style")).not.toContain("Infinity");
  });

  it("staggers dot animation delay across the 3-dot cycle", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots", speed: 1 },
    });

    const dots = wrapper.findAll(".dot");
    const delays = dots.map(
      (dot) => parseFloat((dot.element as HTMLElement).style.animationDelay)
    );
    expect(delays[0]).toBeCloseTo(0, 5);
    expect(delays[1]).toBeCloseTo(1 / 3, 5);
    expect(delays[2]).toBeCloseTo(2 / 3, 5);
  });

  it("falls back to Spinner's defaults (size 40, color #3b82f6, speed 1) when omitted", () => {
    const wrapper = mount(Spinner, {
      props: { type: "pulseDots" },
    });

    const container = wrapper.find(".vslk-pulse-orbit");
    const dot = wrapper.find(".dot");

    expect(container.element).toHaveStyle({ width: "40px", height: "40px" });
    expect(dot.element).toHaveStyle({
      width: "8px",
      backgroundColor: "#3b82f6",
      animationDuration: "1s",
    });
  });
});