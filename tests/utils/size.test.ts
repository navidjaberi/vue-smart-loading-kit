import { describe, expect, it } from "vitest";
import { scaleSize, toCssSize, toPx } from "../../src/utils/size";

describe("toPx", () => {
  it.each([
    [40, 40],
    ["40px", 40],
    [" 12.5px ", 12.5],
    [".5px", 0.5],
  ])("reads %j as %d pixels", (input, expected) => {
    expect(toPx(input)).toBe(expected);
  });

  it.each(["3rem", "50%", "calc(10px + 1rem)", "40", "px", ""])(
    "returns null for non-pixel value %j",
    (input) => {
      expect(toPx(input)).toBeNull();
    }
  );
});

describe("toCssSize", () => {
  it("adds px to numbers", () => {
    expect(toCssSize(24)).toBe("24px");
  });

  it("passes strings through untouched", () => {
    expect(toCssSize("2.5rem")).toBe("2.5rem");
  });
});

describe("scaleSize", () => {
  it("computes pixel sizes in JS", () => {
    expect(scaleSize(40, "/", 4)).toBe("10px");
    expect(scaleSize("40px", "*", 0.5)).toBe("20px");
  });

  it("gives a number and its px string the same result", () => {
    expect(scaleSize("60px", "/", 5.5)).toBe(scaleSize(60, "/", 5.5));
  });

  it("defers other units to calc()", () => {
    expect(scaleSize("3rem", "/", 4)).toBe("calc(3rem / 4)");
    expect(scaleSize("50%", "*", 0.16)).toBe("calc(50% * 0.16)");
  });
});
