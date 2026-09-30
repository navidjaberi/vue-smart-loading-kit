import { computed, inject, ref, warn, type ComputedRef, type InjectionKey } from "vue";

/** The three router methods used, so vue-router is not a dependency. */
export interface RouterLike {
  beforeEach(guard: (...args: never[]) => unknown): () => void;
  afterEach(hook: (...args: never[]) => unknown): () => void;
  onError(handler: (...args: never[]) => unknown): () => void;
}

export interface PageProgress {
  /** True while at least one started task has not finished. */
  readonly loading: ComputedRef<boolean>;
  /** Marks one task as started. Every start() needs a matching done(). */
  start(): void;
  /** Marks one task as finished. Extra calls are ignored. */
  done(): void;
}

/**
 * The state behind <PageProgress>: a counter of running tasks, so several
 * parallel requests keep the bar up until the last one finishes. It holds
 * no timers (the bar's own component does the animation), so it is safe to
 * create on the server.
 */
export function createPageProgress(): PageProgress {
  const pending = ref(0);
  return {
    loading: computed(() => pending.value > 0),
    start() {
      pending.value++;
    },
    done() {
      pending.value = Math.max(0, pending.value - 1);
    },
  };
}

export const PAGE_PROGRESS: InjectionKey<PageProgress> = Symbol("vue-smart-loading-kit:page-progress");

/**
 * The app's page progress (created by the plugin), to wrap any task:
 *   const progress = usePageProgress()
 *   progress.start(); await fetchData(); progress.done()
 */
export function usePageProgress(): PageProgress {
  const progress = inject(PAGE_PROGRESS, null);
  if (progress) return progress;
  warn(
    "[vue-smart-loading-kit] usePageProgress() needs the plugin: app.use(VueSmartLoadingKit). " +
      "Without it, start() and done() do nothing."
  );
  return createPageProgress();
}

/**
 * Starts the bar when a navigation begins and finishes it when it ends or
 * fails. A navigation holds exactly one slot however many times it is
 * redirected, and only releases its own slot, so it never ends a task that
 * was started manually.
 */
export function bindRouter(progress: PageProgress, router: RouterLike): () => void {
  let navigating = false;
  const begin = () => {
    if (navigating) return;
    navigating = true;
    progress.start();
  };
  const end = () => {
    if (!navigating) return;
    navigating = false;
    progress.done();
  };

  const offs = [router.beforeEach(begin), router.afterEach(end), router.onError(end)];
  return () => offs.forEach((off) => off());
}
