import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import Skeleton from "../../src/components/Skeleton/Skeleton.vue";

function nestedSkeletons(wrapper: ReturnType<typeof mount>) {
  return wrapper
    .findAllComponents(Skeleton)
    .filter((c) => c.vm !== wrapper.vm);
}

describe("Profile Variant", () => {
  it("renders one avatar and 2 lines by default", () => {
    const wrapper = mount(Skeleton, { props: { variant: "profile" } });

    const nested = nestedSkeletons(wrapper);
    const avatar = nested.filter((c) => c.props("variant") === "avatar");
    const lines = nested.filter((c) => c.props("variant") === "text");

    expect(avatar).toHaveLength(1);
    expect(lines).toHaveLength(2);
  });

  it("respects a custom line count via options.lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { lines: 4 } },
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    expect(lines).toHaveLength(4);
  });

  it("clamps options.lines to a minimum of 1", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { lines: 0 } },
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    expect(lines).toHaveLength(1);
  });

  it("gives a single line 72% width", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { lines: 1 } },
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    expect(lines[0].props("width")).toBe("72%");
  });

  it("gives two lines widths [72%, 55%]", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { lines: 2 } },
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    expect(lines.map((l) => l.props("width"))).toEqual(["72%", "55%"]);
  });

  it("gives four lines widths [72%, 64%, 64%, 55%]", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { lines: 4 } },
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    expect(lines.map((l) => l.props("width"))).toEqual([
      "72%",
      "64%",
      "64%",
      "55%",
    ]);
  });

  it("passes the default avatarSize (56) as the avatar's size prop", () => {
    const wrapper = mount(Skeleton, { props: { variant: "profile" } });

    const avatar = nestedSkeletons(wrapper).find(
      (c) => c.props("variant") === "avatar"
    );
    expect(avatar?.props("size")).toBe(56);
  });

  it("passes a custom avatarSize through options", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { avatarSize: 96 } },
    });

    const avatar = nestedSkeletons(wrapper).find(
      (c) => c.props("variant") === "avatar"
    );
    expect(avatar?.props("size")).toBe(96);
  });

  it("passes the default lineHeight (10) to every text line", () => {
    const wrapper = mount(Skeleton, { props: { variant: "profile" } });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    lines.forEach((line) => expect(line.props("height")).toBe(10));
  });

  it("passes a custom lineHeight through options", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", options: { lineHeight: 14 } },
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    lines.forEach((line) => expect(line.props("height")).toBe(14));
  });

  it("does not leak a top-level `lines` prop into nested text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", lines: 3 } as any,
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    lines.forEach((line) => expect(line.props("lines")).toBeUndefined());
  });

  it("does not leak a top-level `size` prop into nested text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", size: 999 } as any,
    });

    const lines = nestedSkeletons(wrapper).filter(
      (c) => c.props("variant") === "text"
    );
    lines.forEach((line) => expect(line.props("size")).toBeUndefined());
  });

  it("does not leak a top-level `height` prop into the avatar", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", height: "777px" } as any,
    });

    const avatar = nestedSkeletons(wrapper).find(
      (c) => c.props("variant") === "avatar"
    );
    expect(avatar?.props("height")).toBeUndefined();
  });

  it("still applies avatarSize correctly even when a stray top-level size is passed", () => {
    const wrapper = mount(Skeleton, {
      props: {
        variant: "profile",
        size: 999,
        options: { avatarSize: 40 },
      } as any,
    });

    const avatar = nestedSkeletons(wrapper).find(
      (c) => c.props("variant") === "avatar"
    );
    expect(avatar?.props("size")).toBe(40);
  });

  it("propagates top-level color to both avatar and text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", color: "#7c3aed" },
    });

    const nested = nestedSkeletons(wrapper);
    nested.forEach((c) => expect(c.props("color")).toBe("#7c3aed"));
  });

  it("propagates animation to both avatar and text lines", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", animation: "pulse" },
    });

    const nested = nestedSkeletons(wrapper);
    nested.forEach((c) => expect(c.props("animation")).toBe("pulse"));
  });

  it("marks the avatar with the class that prevents flex-shrink squishing", () => {
    const wrapper = mount(Skeleton, { props: { variant: "profile" } });

    expect(wrapper.find(".vslk-profile__avatar").exists()).toBe(true);
  });

  it("defaults the profile container to 100% width", () => {
    const wrapper = mount(Skeleton, { props: { variant: "profile" } });

    const profile = wrapper.find(".vslk-profile");
    expect(profile.element).toHaveStyle({ width: "100%" });
  });

  it("applies a custom width to the profile container", () => {
    const wrapper = mount(Skeleton, {
      props: { variant: "profile", width: 320 },
    });

    const profile = wrapper.find(".vslk-profile");
    expect(profile.element).toHaveStyle({ width: "320px" });
  });
});