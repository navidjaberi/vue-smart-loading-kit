import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Spinner from "../../src/components/Spinner/Spinner.vue";

type Listener = (event: { matches: boolean }) => void;

/** Installs a controllable window.matchMedia (jsdom has none). */
function mockReducedMotion(initial: boolean) {
  const listeners = new Set<Listener>();
  const query = {
    matches: initial,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: vi.fn((_: string, fn: Listener) => listeners.add(fn)),
    removeEventListener: vi.fn((_: string, fn: Listener) => listeners.delete(fn)),
  };
  vi.stubGlobal("matchMedia", vi.fn(() => query));

  return {
    query,
    listeners,
    set(matches: boolean) {
      query.matches = matches;
      listeners.forEach((fn) => fn({ matches }));
    },
  };
}

const circleDuration = (wrapper: ReturnType<typeof mount>) =>
  (wrapper.find(".vslk-spinner-circle").element as HTMLElement).style.animationDuration;

describe("Spinner prefers-reduced-motion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("runs at normal speed when matchMedia is unavailable (SSR / old browsers)", () => {
    const wrapper = mount(Spinner, { props: { speed: 1 } });

    expect(circleDuration(wrapper)).toBe("1s");
  });

  it("runs at normal speed when the user has no motion preference", () => {
    mockReducedMotion(false);
    const wrapper = mount(Spinner, { props: { speed: 1 } });

    expect(circleDuration(wrapper)).toBe("1s");
  });

  it("slows down to half speed once mounted when reduced motion is requested", async () => {
    mockReducedMotion(true);
    const wrapper = mount(Spinner, { props: { speed: 2 } });
    // applied after mount, so the first render matches server HTML (see hydration.test.ts)
    await nextTick();

    expect(circleDuration(wrapper)).toBe("1s");
  });

  it("reacts when the preference changes while mounted", async () => {
    const media = mockReducedMotion(false);
    const wrapper = mount(Spinner, { props: { speed: 1 } });

    media.set(true);
    await nextTick();
    expect(circleDuration(wrapper)).toBe("2s");

    media.set(false);
    await nextTick();
    expect(circleDuration(wrapper)).toBe("1s");
  });

  it("stops listening once unmounted", () => {
    const media = mockReducedMotion(false);
    const wrapper = mount(Spinner);

    expect(media.listeners.size).toBe(1);
    wrapper.unmount();
    expect(media.listeners.size).toBe(0);
  });
});
