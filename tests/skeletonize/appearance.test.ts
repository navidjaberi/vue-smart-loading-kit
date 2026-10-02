import { describe, expect, it } from "vitest";
import { DEFAULT_SKELETON_BASE, resolveSkeletonAppearance } from "../../src/skeletonize/appearance";

describe("resolveSkeletonAppearance", () => {
  it("uses the built-in defaults", () => {
    expect(resolveSkeletonAppearance({})).toEqual({
      base: DEFAULT_SKELETON_BASE,
      highlight: "rgba(202, 209, 220, 0.28)",
      animation: "shimmer",
      duration: "1500ms",
    });
  });

  it("lets props win over config, and config over defaults", () => {
    const config = { color: "#111111", animation: "pulse" as const, speed: 2 };

    expect(resolveSkeletonAppearance({}, config)).toMatchObject({ base: "#111111", animation: "pulse", duration: "750ms" });
    expect(resolveSkeletonAppearance({ color: "#ff0000", speed: 3 }, config)).toMatchObject({ base: "#ff0000", duration: "500ms" });
  });

  it("uses an explicit highlight instead of the derived one", () => {
    expect(resolveSkeletonAppearance({ highlight: "#ffffff" }).highlight).toBe("#ffffff");
  });

  it("maps wave to shimmer and none to a zero duration", () => {
    expect(resolveSkeletonAppearance({ animation: "wave" }).animation).toBe("shimmer");
    expect(resolveSkeletonAppearance({ animation: "none" }).duration).toBe("0ms");
  });

  it("treats a non-positive speed as 1", () => {
    expect(resolveSkeletonAppearance({ speed: 0 }).duration).toBe("1500ms");
    expect(resolveSkeletonAppearance({ speed: -2 }).duration).toBe("1500ms");
  });
});
