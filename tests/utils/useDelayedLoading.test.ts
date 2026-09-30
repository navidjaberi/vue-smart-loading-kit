import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, ref, watch } from "vue";
import { useDelayedLoading } from "../../src/utils/useDelayedLoading";

/** Runs the composable in its own effect scope, recording every value
 *  `show` takes, so tests can assert it never flickered in between. */
function setup(initial: boolean, options?: Parameters<typeof useDelayedLoading>[1]) {
  const loading = ref(initial);
  const scope = effectScope();
  const history: boolean[] = [];
  const show = scope.run(() => {
    const show = useDelayedLoading(loading, options);
    watch(show, (v) => history.push(v), { flush: "sync" });
    return show;
  })!;
  return { loading, show, history, stop: () => scope.stop() };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useDelayedLoading", () => {
  it("defaults to a 200ms delay and a 500ms minimum", () => {
    const { loading, show } = setup(false);

    loading.value = true;
    vi.advanceTimersByTime(199);
    expect(show.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(show.value).toBe(true);

    loading.value = false;
    vi.advanceTimersByTime(499);
    expect(show.value).toBe(true);
    vi.advanceTimersByTime(1);
    expect(show.value).toBe(false);
  });

  it("never shows when loading finishes within the delay (no flash)", () => {
    const { loading, show, history } = setup(false, { delay: 200 });

    loading.value = true;
    vi.advanceTimersByTime(150);
    loading.value = false;
    vi.advanceTimersByTime(1000);

    expect(show.value).toBe(false);
    expect(history).toEqual([]);
  });

  it("respects the delay when loading is already true on mount", () => {
    const { show } = setup(true, { delay: 200 });

    expect(show.value).toBe(false);
    vi.advanceTimersByTime(200);
    expect(show.value).toBe(true);
  });

  it("shows immediately with a zero delay", () => {
    const { loading, show } = setup(false, { delay: 0 });

    loading.value = true;

    expect(show.value).toBe(true);
  });

  it("hides immediately once it has been visible for minDuration", () => {
    const { loading, show } = setup(false, { delay: 0, minDuration: 500 });

    loading.value = true;
    vi.advanceTimersByTime(800);
    loading.value = false;

    expect(show.value).toBe(false);
  });

  it("stays visible without flickering when loading restarts during the minimum", () => {
    const { loading, show, history } = setup(false, { delay: 0, minDuration: 500 });

    loading.value = true; // shown at t=0
    vi.advanceTimersByTime(100);
    loading.value = false; // held until t=500
    vi.advanceTimersByTime(200);
    loading.value = true; // restarts while held
    vi.advanceTimersByTime(1000);

    expect(show.value).toBe(true);
    expect(history).toEqual([true]);

    loading.value = false; // visible for >500ms already
    expect(history).toEqual([true, false]);
  });

  it("waits for the delay again after it has hidden", () => {
    const { loading, show } = setup(false, { delay: 200, minDuration: 0 });

    loading.value = true;
    vi.advanceTimersByTime(200);
    loading.value = false;
    expect(show.value).toBe(false);

    loading.value = true;
    vi.advanceTimersByTime(199);
    expect(show.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(show.value).toBe(true);
  });

  it("restarts the delay when a load is cancelled within it", () => {
    const { loading, show } = setup(false, { delay: 200 });

    loading.value = true;
    vi.advanceTimersByTime(100);
    loading.value = false;
    loading.value = true;
    vi.advanceTimersByTime(100);

    // the first request was cancelled, so the delay counts from the second one
    expect(show.value).toBe(false);
    vi.advanceTimersByTime(100);
    expect(show.value).toBe(true);
  });

  it("reads reactive options when a load starts", () => {
    const delay = ref(200);
    const { loading, show } = setup(false, { delay });

    delay.value = 50;
    loading.value = true;
    vi.advanceTimersByTime(50);

    expect(show.value).toBe(true);
  });

  it("clears its timers when the owning scope is disposed", () => {
    const { loading, show, stop } = setup(false, { delay: 200 });

    loading.value = true;
    stop();
    vi.advanceTimersByTime(1000);

    expect(show.value).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });
});
