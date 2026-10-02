import { effectScope, ref, watch, type DirectiveBinding, type EffectScope, type ObjectDirective, type Ref, type VNode } from "vue";
import { DEFAULT_DELAY, DEFAULT_MIN_DURATION, useDelayedLoading } from "../utils/useDelayedLoading";
import { LOADING_CONFIG, type LoadingKitConfig } from "../config";
import { resolveSkeletonAppearance } from "./appearance";

export type SkeletonDirectiveValue = boolean | { loading: boolean; delay?: number; minDuration?: number };

export const SKELETONIZE_CLASS = "vslk-skeletonize";
const ANIMATION_CLASSES = ["shimmer", "pulse", "none"].map((a) => `${SKELETONIZE_CLASS}--${a}`);
const VARS = ["--vslk-sk-base", "--vslk-sk-hi", "--vslk-sk-duration"];
const SKELETON_ATTRS = ["inert", "aria-hidden"] as const;
/** Attributes the directive may override (or that SSR may have rendered). */
const MANAGED_ATTRS = ["inert", "aria-hidden", "aria-busy", "data-allow-mismatch"] as const;

interface Resolved {
  loading: boolean;
  delay: number;
  minDuration: number;
}
interface State {
  scope: EffectScope;
  value: Ref<Resolved>;
  config: Ref<LoadingKitConfig>;
  shown: Ref<boolean>;
  /** What the template itself binds for each managed attribute (null = absent). */
  bound: Map<string, string | null>;
  /** Attributes currently carrying the directive's (or SSR's) value. */
  overridden: Set<string>;
}
const states = new WeakMap<HTMLElement, State>();

/** The config the directive's owning component sees (plugin or provideLoadingConfig). */
function configOf(binding: DirectiveBinding): LoadingKitConfig {
  const provides = (binding.instance?.$ as unknown as { provides?: Record<symbol, unknown> } | undefined)?.provides;
  return (provides?.[LOADING_CONFIG as symbol] as LoadingKitConfig | undefined) ?? {};
}

function resolve(value: SkeletonDirectiveValue, config: LoadingKitConfig): Resolved {
  const v = typeof value === "object" && value !== null ? value : { loading: Boolean(value) };
  return {
    loading: v.loading,
    delay: v.delay ?? config.smartLoader?.delay ?? DEFAULT_DELAY,
    minDuration: v.minDuration ?? config.smartLoader?.minDuration ?? DEFAULT_MIN_DURATION,
  };
}

/* The value to restore is what the TEMPLATE binds (read from the vnode on
   every mount/update), never what is in the DOM: after SSR the DOM already
   holds the skeleton's own inert/aria-hidden, and a bound value may change
   mid-load. */
function boundFrom(vnode: VNode): Map<string, string | null> {
  const props = (vnode.props ?? {}) as Record<string, unknown>;
  return new Map(
    MANAGED_ATTRS.map((name) => {
      const v = props[name];
      // Mirror Vue: null/undefined remove the attribute, and booleans render
      // as "true"/"false", except inert, which Vue sets as a DOM property.
      if (v === undefined || v === null) return [name, null];
      if (name === "inert" && typeof v === "boolean") return [name, v ? "" : null];
      return [name, String(v)];
    })
  );
}

function override(el: HTMLElement, state: State, name: string, value: string) {
  state.overridden.add(name);
  el.setAttribute(name, value);
}
function release(el: HTMLElement, state: State, name: string) {
  if (!state.overridden.delete(name)) return;
  const bound = state.bound.get(name) ?? null;
  if (bound === null) el.removeAttribute(name);
  else el.setAttribute(name, bound);
}

function show(el: HTMLElement, state: State) {
  const look = resolveSkeletonAppearance({}, state.config.value.skeleton);
  el.classList.remove(...ANIMATION_CLASSES);
  el.classList.add(SKELETONIZE_CLASS, `${SKELETONIZE_CLASS}--${look.animation}`);
  el.style.setProperty("--vslk-sk-base", look.base);
  el.style.setProperty("--vslk-sk-hi", look.highlight);
  el.style.setProperty("--vslk-sk-duration", look.duration);
  override(el, state, "inert", "");
  override(el, state, "aria-hidden", "true");
}

function hide(el: HTMLElement, state: State) {
  el.classList.remove(SKELETONIZE_CLASS, ...ANIMATION_CLASSES);
  for (const v of VARS) el.style.removeProperty(v);
  for (const name of SKELETON_ATTRS) release(el, state, name);
}

/**
 * v-skeleton="loading" or v-skeleton="{ loading, delay, minDuration }":
 * restyles the element's real content into a skeleton of the same layout
 * (see skeletonize.css). Only classes, attributes and CSS variables change.
 */
export const vSkeleton: ObjectDirective<HTMLElement, SkeletonDirectiveValue> = {
  mounted(el, binding, vnode) {
    const config = ref(configOf(binding)) as Ref<LoadingKitConfig>;
    const state: State = {
      scope: effectScope(true),
      value: ref(resolve(binding.value, config.value)),
      config,
      shown: ref(false),
      bound: boundFrom(vnode),
      overridden: new Set(),
    };
    states.set(el, state);

    // Anything SSR rendered that the template doesn't bind is ours to release.
    for (const name of MANAGED_ATTRS) {
      if (el.hasAttribute(name) && state.bound.get(name) === null) state.overridden.add(name);
    }
    release(el, state, "data-allow-mismatch"); // only needed during hydration

    state.scope.run(() => {
      const shown = useDelayedLoading(() => state.value.value.loading, {
        delay: () => state.value.value.delay,
        minDuration: () => state.value.value.minDuration,
      });
      watch(
        () => state.value.value.loading,
        (loading) => (loading ? override(el, state, "aria-busy", "true") : release(el, state, "aria-busy")),
        { immediate: true, flush: "sync" }
      );
      watch(
        shown,
        (isShown) => {
          state.shown.value = isShown;
          if (isShown) show(el, state);
          else hide(el, state);
        },
        { immediate: true, flush: "sync" }
      );
    });
  },

  updated(el, binding, vnode) {
    const state = states.get(el);
    if (!state) return;
    state.bound = boundFrom(vnode);
    state.config.value = configOf(binding);
    state.value.value = resolve(binding.value, state.config.value);
    /* Vue may just have re-patched class, style or the aria attributes
       (e.g. a :class change mid-load), wiping what the directive set:
       re-apply the current state. */
    if (state.shown.value) show(el, state);
    if (state.value.value.loading) override(el, state, "aria-busy", "true");
  },

  unmounted(el) {
    const state = states.get(el);
    if (!state) return;
    state.scope.stop();
    hide(el, state);
    release(el, state, "aria-busy");
    states.delete(el);
  },

  /* Directives don't run on the server. With delay 0 (placeholder data),
     render the skeleton into the server HTML so fake content never shows,
     and let hydration accept the attributes the client then also sets. */
  getSSRProps(binding) {
    const config = configOf(binding);
    const v = resolve(binding.value, config);
    if (!v.loading) return {};
    if (v.delay > 0) return { "aria-busy": "true" };
    const look = resolveSkeletonAppearance({}, config.skeleton);
    return {
      class: `${SKELETONIZE_CLASS} ${SKELETONIZE_CLASS}--${look.animation}`,
      style: { "--vslk-sk-base": look.base, "--vslk-sk-hi": look.highlight, "--vslk-sk-duration": look.duration },
      inert: "",
      "aria-hidden": "true",
      "aria-busy": "true",
      "data-allow-mismatch": "class,style,attribute",
    };
  },
};
