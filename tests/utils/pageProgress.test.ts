import { describe, expect, it, vi } from "vitest";
import { createPageProgress, bindRouter, type RouterLike } from "../../src/utils/pageProgress";

/** A minimal stand-in for vue-router: records hooks so tests can fire them. */
function fakeRouter() {
  const hooks = { before: [] as Array<() => unknown>, after: [] as Array<() => unknown>, error: [] as Array<() => unknown> };
  const router: RouterLike = {
    beforeEach: (fn) => (hooks.before.push(fn), () => {}),
    afterEach: (fn) => (hooks.after.push(fn), () => {}),
    onError: (fn) => (hooks.error.push(fn), () => {}),
  };
  const fire = (list: Array<() => unknown>) => list.forEach((fn) => fn());
  return {
    router,
    navigateStart: () => fire(hooks.before),
    navigateEnd: () => fire(hooks.after),
    fail: () => fire(hooks.error),
  };
}

describe("createPageProgress", () => {
  it("is idle until started", () => {
    expect(createPageProgress().loading.value).toBe(false);
  });

  it("stays loading until every start has a matching done", () => {
    const p = createPageProgress();

    p.start();
    p.start();
    p.start();
    p.done();
    p.done();
    expect(p.loading.value).toBe(true);

    p.done();
    expect(p.loading.value).toBe(false);
  });

  it("ignores extra done() calls instead of going negative", () => {
    const p = createPageProgress();

    p.done();
    p.done();
    p.start();

    expect(p.loading.value).toBe(true);
  });
});

describe("bindRouter", () => {
  it("loads from the start of a navigation until it ends", () => {
    const p = createPageProgress();
    const nav = fakeRouter();
    bindRouter(p, nav.router);

    nav.navigateStart();
    expect(p.loading.value).toBe(true);
    nav.navigateEnd();
    expect(p.loading.value).toBe(false);
  });

  it("counts a redirect (several beforeEach, one afterEach) as one navigation", () => {
    const p = createPageProgress();
    const nav = fakeRouter();
    bindRouter(p, nav.router);

    nav.navigateStart();
    nav.navigateStart(); // redirected
    nav.navigateEnd();

    expect(p.loading.value).toBe(false);
  });

  it("finishes when a navigation errors", () => {
    const p = createPageProgress();
    const nav = fakeRouter();
    bindRouter(p, nav.router);

    nav.navigateStart();
    nav.fail();

    expect(p.loading.value).toBe(false);
  });

  it("does not end a manual start() when a navigation finishes", () => {
    const p = createPageProgress();
    const nav = fakeRouter();
    bindRouter(p, nav.router);

    p.start(); // e.g. a fetch
    nav.navigateStart();
    nav.navigateEnd();
    nav.navigateEnd(); // a stray afterEach must not consume the manual start
    expect(p.loading.value).toBe(true);

    p.done();
    expect(p.loading.value).toBe(false);
  });
});

describe("bindRouter with a real vue-router", () => {
  // Also a type test: passing a real Router must compile (see RouterLike).
  it("is busy during a navigation and idle once it lands", async () => {
    const { createRouter, createMemoryHistory } = await import("vue-router");
    let release: (() => void) | undefined;
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: { render: () => null } },
        {
          path: "/slow",
          component: { render: () => null },
          beforeEnter: () => new Promise<void>((resolve) => (release = resolve)),
        },
      ],
    });
    const progress = createPageProgress();
    bindRouter(progress, router);
    await router.push("/");
    expect(progress.loading.value).toBe(false);

    const navigation = router.push("/slow");
    // the route's own guard is pending, so the global beforeEach already ran
    await vi.waitFor(() => expect(release).toBeDefined());
    expect(progress.loading.value).toBe(true);

    release!();
    await navigation;
    expect(progress.loading.value).toBe(false);
  });
});
