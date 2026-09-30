import { onScopeDispose, readonly, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from "vue";

export interface DelayedLoadingOptions {
  /** ms a load must last before the loader appears. Default 200. */
  delay?: MaybeRefOrGetter<number>;
  /** ms the loader stays up once shown, so it never just blinks. Default 500. */
  minDuration?: MaybeRefOrGetter<number>;
}

export const DEFAULT_DELAY = 200;
export const DEFAULT_MIN_DURATION = 500;

/**
 * Turns a raw `loading` flag into "should a loader be visible":
 * - a load shorter than `delay` never shows a loader (no flash);
 * - once shown, the loader stays for at least `minDuration`;
 * - a load that restarts while the loader is still up keeps it up.
 *
 * Options are read when a load starts or ends, so they may be reactive.
 */
export function useDelayedLoading(
  loading: MaybeRefOrGetter<boolean>,
  options: DelayedLoadingOptions = {}
): Readonly<Ref<boolean>> {
  const show = ref(false);
  let shownAt = 0;
  let delayTimer: ReturnType<typeof setTimeout> | undefined;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;

  const ms = (value: MaybeRefOrGetter<number> | undefined, fallback: number) =>
    Math.max(0, toValue(value) ?? fallback);

  const clear = () => {
    clearTimeout(delayTimer);
    clearTimeout(hideTimer);
    delayTimer = hideTimer = undefined;
  };

  const reveal = () => {
    delayTimer = undefined;
    shownAt = Date.now();
    show.value = true;
  };

  // On the server the delay can never elapse and nothing would clear the
  // timers, so the loader simply stays hidden until the client takes over.
  const isServer = typeof window === "undefined";

  watch(
    () => toValue(loading),
    (isLoading) => {
      if (isServer) return;
      if (isLoading) {
        // Restarted while held up by minDuration: just stay visible.
        clearTimeout(hideTimer);
        hideTimer = undefined;
        if (show.value || delayTimer) return;

        const delay = ms(options.delay, DEFAULT_DELAY);
        if (delay === 0) reveal();
        else delayTimer = setTimeout(reveal, delay);
        return;
      }

      // Finished before the delay: the loader never appears.
      clearTimeout(delayTimer);
      delayTimer = undefined;
      if (!show.value) return;

      const remaining = ms(options.minDuration, DEFAULT_MIN_DURATION) - (Date.now() - shownAt);
      if (remaining <= 0) show.value = false;
      else
        hideTimer = setTimeout(() => {
          hideTimer = undefined;
          show.value = false;
        }, remaining);
    },
    // sync: react to every change, even two within one tick
    { immediate: true, flush: "sync" }
  );

  onScopeDispose(clear);

  return readonly(show);
}
