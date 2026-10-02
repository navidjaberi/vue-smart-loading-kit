import type { SkeletonAnimationName } from "../components/Skeleton/types";
import { generateAutoHighlight } from "../components/Skeleton/utils/color";

export interface SkeletonAppearanceInput {
  color?: string;
  highlight?: string;
  animation?: SkeletonAnimationName;
  speed?: number;
}

export interface SkeletonAppearance {
  base: string;
  highlight: string;
  animation: "shimmer" | "pulse" | "none";
  /** CSS time, e.g. "1500ms"; "0ms" when not animated. */
  duration: string;
}

export const DEFAULT_SKELETON_BASE = "rgba(148, 163, 184, 0.22)";
const BASE_DURATION_MS = 1500;

/**
 * Colors and animation shared by <Skeleton> and v-skeleton, so both always
 * look the same. Each value resolves as: explicit prop > config > default.
 */
export function resolveSkeletonAppearance(
  props: SkeletonAppearanceInput,
  config: SkeletonAppearanceInput = {}
): SkeletonAppearance {
  const base = props.color ?? config.color ?? DEFAULT_SKELETON_BASE;
  const highlight =
    props.highlight ??
    config.highlight ??
    generateAutoHighlight(base, { lightThreshold: 0.8, lightenBy: 0.5, darkenBy: 0.22, alphaBoost: 0.06 }) ??
    "rgba(255, 255, 255, 0.35)";

  const raw = props.animation ?? config.animation ?? "shimmer";
  const animation = raw === "wave" ? "shimmer" : raw;

  const speed = props.speed ?? config.speed ?? 1;
  const s = speed > 0 ? speed : 1;
  const duration = animation === "none" ? "0ms" : `${Math.round(BASE_DURATION_MS / s)}ms`;

  return { base, highlight, animation, duration };
}
