import { describe, expect, it } from "vitest";
import { createApp } from "vue";
import VueSmartLoadingKit from "../src/index";

describe("plugin install", () => {
  it("registers the components and the directive globally by default", () => {
    const app = createApp({});
    app.use(VueSmartLoadingKit);

    for (const name of ["Skeleton", "Spinner", "SmartLoader", "ProgressBar", "PageProgress"]) {
      expect(app.component(name)).toBeDefined();
    }
    expect(app.directive("skeleton")).toBeDefined();
  });

  it("skips global components with components: false, keeping the directive", () => {
    const app = createApp({});
    app.use(VueSmartLoadingKit, { components: false });

    for (const name of ["Skeleton", "Spinner", "SmartLoader", "ProgressBar", "PageProgress"]) {
      expect(app.component(name)).toBeUndefined();
    }
    expect(app.directive("skeleton")).toBeDefined();
  });

  it("does not pass components into the provided config", () => {
    const app = createApp({});
    app.use(VueSmartLoadingKit, { components: false, spinner: { color: "red" } });

    const provided = Object.getOwnPropertySymbols(app._context.provides)
      .map((key) => app._context.provides[key as never] as Record<string, unknown>)
      .find((value) => value && "spinner" in value);
    expect(provided).toEqual({ spinner: { color: "red" } });
  });
});
