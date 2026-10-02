import { describe, expect, it } from "vitest";
import {
  darken,
  generateAutoHighlight,
  lighten,
  luminance,
  parseColorToRgba,
  toRgbaString,
} from "../../src/components/Skeleton/utils/color";

describe("parseColorToRgba", () => {
  it.each([
    ["#abc", { r: 0xaa, g: 0xbb, b: 0xcc, a: 1 }],
    ["#abc8", { r: 0xaa, g: 0xbb, b: 0xcc, a: 0x88 / 255 }],
    ["#a1b2c3", { r: 0xa1, g: 0xb2, b: 0xc3, a: 1 }],
    ["#a1b2c380", { r: 0xa1, g: 0xb2, b: 0xc3, a: 0x80 / 255 }],
    ["  #FFF  ", { r: 255, g: 255, b: 255, a: 1 }],
  ])("parses hex %j", (input, expected) => {
    expect(parseColorToRgba(input)).toEqual(expected);
  });

  it.each(["#", "#ab", "#abcde", "#abcdefabc", "#ggg", "#12345z", "#zz1234"])("rejects invalid hex %j", (input) => {
    expect(parseColorToRgba(input)).toBeNull();
  });

  it.each([
    ["rgb(10, 20, 30)", { r: 10, g: 20, b: 30, a: 1 }],
    ["rgba(10, 20, 30, 0.5)", { r: 10, g: 20, b: 30, a: 0.5 }],
    ["rgb(10 20 30)", { r: 10, g: 20, b: 30, a: 1 }],
    ["rgb(10  20   30 / 25%)", { r: 10, g: 20, b: 30, a: 0.25 }],
    ["rgb(100% 50% 0%)", { r: 255, g: 127, b: 0, a: 1 }],
    ["RGBA(300, -5, 20, 2)", { r: 255, g: 0, b: 20, a: 1 }],
    ["rgba(1, 2, 3, nope)", { r: 1, g: 2, b: 3, a: 1 }],
  ])("parses %j", (input, expected) => {
    expect(parseColorToRgba(input)).toEqual(expected);
  });

  it.each(["", "   ", "red", "var(--x)", "currentColor", "rgb(1, 2)", "rgb(a, b, c)", "rgb 1 2 3"])(
    "returns null for %j",
    (input) => {
      expect(parseColorToRgba(input)).toBeNull();
    }
  );
});

describe("color math", () => {
  it("computes relative luminance", () => {
    expect(luminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0);
    expect(luminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 10);
    expect(luminance({ r: 255, g: 0, b: 0, a: 1 })).toBeCloseTo(0.2126, 4);
    expect(luminance({ r: 10, g: 10, b: 10, a: 1 })).toBeCloseTo(10 / 255 / 12.92, 6);
  });

  it("lightens toward white and darkens toward black, keeping alpha", () => {
    const c = { r: 100, g: 50, b: 0, a: 0.4 };
    expect(lighten(c)).toEqual({ r: 170, g: 142, b: 115, a: 0.4 });
    expect(lighten(c, 1)).toEqual({ r: 255, g: 255, b: 255, a: 0.4 });
    expect(darken(c)).toEqual({ r: 78, g: 39, b: 0, a: 0.4 });
    expect(darken(c, 2)).toEqual({ r: 0, g: 0, b: 0, a: 0.4 });
  });

  it("formats rgba strings with clamped channels", () => {
    expect(toRgbaString({ r: 300, g: -1, b: 12.4, a: 1.5 })).toBe("rgba(255, 0, 12, 1)");
  });
});

describe("generateAutoHighlight", () => {
  it("lightens dark colors and darkens light ones, boosting alpha", () => {
    expect(generateAutoHighlight("#000000")).toBe("rgba(128, 128, 128, 1)");
    expect(generateAutoHighlight("#ffffff")).toBe("rgba(199, 199, 199, 1)");
    expect(generateAutoHighlight("rgba(0, 0, 0, 0.2)")).toBe("rgba(128, 128, 128, 0.26)");
  });

  it("returns null for colors it cannot parse", () => {
    expect(generateAutoHighlight("var(--brand)")).toBeNull();
  });
});
