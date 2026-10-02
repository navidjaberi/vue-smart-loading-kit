import { inject, provide, type InjectionKey } from "vue";
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
  provide(LOADING_CONFIG, mergeLoadingConfig(useLoadingConfig(), config));
}
