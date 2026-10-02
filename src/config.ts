import { getCurrentInstance, inject, provide, type ComponentInternalInstance, type InjectionKey } from "vue";
import type { SkeletonBaseProps, SkeletonVariantName } from "./components/Skeleton/types";
import type { SpinnerProps } from "./components/Spinner/spinner.types";

/** App-wide defaults. An explicit prop always wins over these, and these
 *  win over the built-in defaults. Only appearance and behavior can be
 *  configured, not per-instance layout such as width or lines. */
export interface LoadingKitConfig {
  skeleton?: Pick<SkeletonBaseProps, "color" | "highlight" | "animation" | "speed" | "angle" | "outlined">;
  spinner?: Pick<SpinnerProps, "variant" | "color" | "size" | "speed" | "thickness" | "track">;
  progressBar?: {
    color?: string;
    thickness?: number;
    track?: boolean | string;
    speed?: number;
  };
  smartLoader?: {
    mode?: "replace" | "overlay" | "skeletonize";
    delay?: number;
    minDuration?: number;
    preserveHeight?: boolean;
    skeleton?: SkeletonBaseProps & { variant?: SkeletonVariantName };
    spinner?: SpinnerProps;
  };
  pageProgress?: {
    color?: string;
    thickness?: number;
    /** ms a task must last before the bar appears. */
    delay?: number;
    label?: string;
  };
}

export const LOADING_CONFIG: InjectionKey<LoadingKitConfig> = Symbol("vue-smart-loading-kit:config");

const SECTIONS = ["skeleton", "spinner", "progressBar", "smartLoader", "pageProgress"] as const;

/** Merges per section, so an override of one key keeps the others. */
export function mergeLoadingConfig(base: LoadingKitConfig, override: LoadingKitConfig): LoadingKitConfig {
  const merged: LoadingKitConfig = { ...base };
  for (const key of SECTIONS) {
    if (override[key]) merged[key] = { ...base[key], ...override[key] } as never;
  }
  return merged;
}

/** The config in effect for the calling component ({} when none is set). */
export function useLoadingConfig(): LoadingKitConfig {
  return inject(LOADING_CONFIG, {});
}

/**
 * Overrides the config for this component's subtree, on top of whatever
 * the app (or an outer component) set. Also the way to configure the kit
 * when importing components locally instead of installing the plugin.
 * Call it in `setup`.
 */
export function provideLoadingConfig(config: LoadingKitConfig): void {
  const merged = mergeLoadingConfig(useLoadingConfig(), config);
  provide(LOADING_CONFIG, merged);
  const instance = getCurrentInstance();
  if (instance) subtreeConfigs.set(instance, merged);
}

/* Directive hooks can't call inject(). So that v-skeleton sees the same
   config as a component would, provideLoadingConfig() also records its
   config per component, and configForInstance() finds the nearest one up
   the parent chain, else the app's. Only Vue's public, typed API is used. */
const subtreeConfigs = new WeakMap<ComponentInternalInstance, LoadingKitConfig>();

/** The config in effect for a component, for code that can't call inject(). */
export function configForInstance(instance: ComponentInternalInstance | null | undefined): LoadingKitConfig {
  for (let i = instance; i; i = i.parent) {
    const config = subtreeConfigs.get(i);
    if (config) return config;
  }
  return (instance?.appContext.provides[LOADING_CONFIG as symbol] as LoadingKitConfig | undefined) ?? {};
}
