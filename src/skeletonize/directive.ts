import { effectScope, ref, watch, type DirectiveBinding, type EffectScope, type ObjectDirective, type Ref } from "vue";
import { DEFAULT_DELAY, DEFAULT_MIN_DURATION, useDelayedLoading } from "../utils/useDelayedLoading";
import { LOADING_CONFIG, type LoadingKitConfig } from "../config";
import { resolveSkeletonAppearance } from "./appearance";

export type SkeletonDirectiveValue = boolean | { loading: boolean; delay?: number; minDuration?: number };

export const SKELETONIZE_CLASS = "vslk-skeletonize";
const ANIMATION_CLASSES = ["shimmer", "pulse", "none"].map((a) => `${SKELETONIZE_CLASS}--${a}`);
const VARS = ["--vslk-sk-base", "--vslk-sk-hi", "--vslk-sk-duration"];
const SKELETON_ATTRS = ["inert", "aria-hidden"] as const;

interface Resolved {
  loading: boolean;
  delay: number;
  minDuration: number;
}
interface State {
  scope: EffectScope;
  value: Ref<Resolved>;
  config: Ref<LoadingKitConfig>;
  saved: Map<string, string | null>;
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

/* Attributes the directive overrides are saved once and put back exactly,
   so an element's own aria-hidden="false" or inert survives a load. */
function save(el: HTMLElement, state: State, name: string) {
  if (!state.saved.has(name)) state.saved.set(name, el.getAttribute(name));
}
function restore(el: HTMLElement, state: State, name: string) {
  if (!state.saved.has(name)) return;
  const previous = state.saved.get(name)!;
  if (previous === null) el.removeAttribute(name);
  else el.setAttribute(name, previous);
  state.saved.delete(name);
}

function show(el: HTMLElement, state: State) {
  const look = resolveSkeletonAppearance({}, state.config.value.skeleton);
  el.classList.remove(...ANIMATION_CLASSES);
  el.classList.add(SKELETONIZE_CLASS, `${SKELETONIZE_CLASS}--${look.animation}`);
  el.style.setProperty("--vslk-sk-base", look.base);
  el.style.setProperty("--vslk-sk-hi", look.highlight);
  el.style.setProperty("--vslk-sk-duration", look.duration);
  for (const name of SKELETON_ATTRS) save(el, state, name);
  el.setAttribute("inert", "");
  el.setAttribute("aria-hidden", "true");
}

function hide(el: HTMLElement, state: State) {
  el.classList.remove(SKELETONIZE_CLASS, ...ANIMATION_CLASSES);
  for (const v of VARS) el.style.removeProperty(v);
  for (const name of SKELETON_ATTRS) restore(el, state, name);
}

/**
 * v-skeleton="loading" or v-skeleton="{ loading, delay, minDuration }":
 * restyles the element's real content into a skeleton of the same layout
 * (see skeletonize.css). Only classes, attributes and CSS variables change.
 */
export const vSkeleton: ObjectDirective<HTMLElement, SkeletonDirectiveValue> = {
  mounted(el, binding) {
    const config = ref(configOf(binding)) as Ref<LoadingKitConfig>;
    const state: State = {
      scope: effectScope(true),
      value: ref(resolve(binding.value, config.value)),
      config,
      saved: new Map(),
    };
    states.set(el, state);

    state.scope.run(() => {
      const shown = useDelayedLoading(() => state.value.value.loading, {
        delay: () => state.value.value.delay,
        minDuration: () => state.value.value.minDuration,
      });
      watch(
        () => state.value.value.loading,
        (loading) => {
          if (loading) {
            save(el, state, "aria-busy");
            el.setAttribute("aria-busy", "true");
          } else restore(el, state, "aria-busy");
        },
        { immediate: true, flush: "sync" }
      );
      watch(shown, (isShown) => (isShown ? show(el, state) : hide(el, state)), { immediate: true, flush: "sync" });
    });
  },

  updated(el, binding) {
    const state = states.get(el);
    if (!state) return;
    state.config.value = configOf(binding);
    state.value.value = resolve(binding.value, state.config.value);
    if (el.classList.contains(SKELETONIZE_CLASS)) show(el, state); // pick up appearance changes
  },

  unmounted(el) {
    const state = states.get(el);
    if (!state) return;
    state.scope.stop();
    hide(el, state);
    restore(el, state, "aria-busy");
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
