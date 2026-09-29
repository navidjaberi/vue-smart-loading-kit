import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Spinner from "../../src/components/Spinner/Spinner.vue";
const toDuration = (speed: number) => 1 / speed;
const barDelay = (speed: number, index: number) => (toDuration(speed) / 5) * index;

describe("Spinner - Bars Variant", () => {
  it("renders correctly when type is 'bars'", () => {
    const wrapper = mount(Spinner, {
      props: { type: "bars" },
    });

    expect(wrapper.find(".v-spinner-bars").exists()).toBe(true);
    const spans = wrapper.findAll(".v-spinner-bars span");
    expect(spans).toHaveLength(5);
  });

  it("applies default props (size=40, color=currentColor, speed=1)", () => {
    const wrapper = mount(Spinner, {
      props: { type: "bars" },
    });

    const container = wrapper.find(".v-spinner-bars");
    const spans = wrapper.findAll(".v-spinner-bars span");
    expect((container.element as HTMLElement).style.height).toBe("40px");
    expect((container.element as HTMLElement).style.gap).toBe("3.75px"); // 3/32 of size
    const firstSpanStyle = (spans[0].element as HTMLElement).style;
    expect(firstSpanStyle.width).toBe("5px");
    expect(firstSpanStyle.backgroundColor.toLowerCase()).toBe("currentcolor");
    expect(firstSpanStyle.animationDuration).toBe("1s"); // 1 / 1
  });

  it("handles custom numeric size", () => {
    const wrapper = mount(Spinner, {
      props: { type: "bars", size: 80 },
    });

    const container = wrapper.find(".v-spinner-bars");
    const firstSpan = wrapper.find(".v-spinner-bars span");
    expect((container.element as HTMLElement).style.height).toBe("80px");
    expect((container.element as HTMLElement).style.gap).toBe("7.5px");
    expect((firstSpan.element as HTMLElement).style.width).toBe("10px");
  });

  it("handles custom string size", () => {
    const wrapper = mount(Spinner, {
      props: { type: "bars", size: "60px" },
    });

    const container = wrapper.find(".v-spinner-bars");
    const firstSpan = wrapper.find(".v-spinner-bars span");

    expect((container.element as HTMLElement).style.height).toBe("60px");
    expect((container.element as HTMLElement).style.gap).toBe("5.625px");
    expect((firstSpan.element as HTMLElement).style.width).toBe("7.5px");
  });

  it("applies custom color and synchronizes animation speed with delays", () => {
    const wrapper = mount(Spinner, {
      props: { type: "bars", color: "#ff0000", speed: 2 },
    });

    const spans = wrapper.findAll(".v-spinner-bars span");
    const firstSpanStyle = (spans[0].element as HTMLElement).style;
    const secondSpanStyle = (spans[1].element as HTMLElement).style;
    expect(firstSpanStyle.backgroundColor).toBe("rgb(255, 0, 0)");
    expect(firstSpanStyle.animationDuration).toBe("0.5s");
    expect(secondSpanStyle.animationDelay).toBe("0.05s");
  });
});
