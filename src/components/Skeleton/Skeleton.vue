<!-- src/components/skeleton/VSkeleton.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { skeletonVariants } from "./variants";
import type { SkeletonBaseProps, SkeletonVariantName } from "./types";
import { generateAutoHighlight } from "./utils/color";

const props = withDefaults(
  defineProps<
    SkeletonBaseProps & {
      variant?: SkeletonVariantName;
      label?: string;
    }
  >(),
  {
    variant: "block",
    animation: "shimmer",
    speed: 1,
    angle: 90,
  }
);

const Comp = computed(() => skeletonVariants[props.variant ?? "block"]);

/* `variant` and `label` belong to this wrapper only. Variants don't
   declare them, so passing them down would render them as stray HTML
   attributes (e.g. <div variant="avatar" label="...">). */
const variantProps = computed(() => {
  const { variant, label, ...rest } = props;
  return rest;
});

const resolvedBase = computed(() => props.color ?? "rgba(148, 163, 184, 0.22)");

const resolvedHighlight = computed(() => {
  if (props.highlight) return props.highlight;
  const auto = generateAutoHighlight(resolvedBase.value, {
    lightThreshold: 0.8,
    lightenBy: 0.5,
    darkenBy: 0.22,
    alphaBoost: 0.06,
  });
  return auto ?? "rgba(255, 255, 255, 0.35)";
});

const normalizedAnimation = computed(() => {
  return props.animation === "wave" ? "shimmer" : (props.animation ?? "shimmer");
});

const resolvedDuration = computed(() => {
  const s = props.speed && props.speed > 0 ? props.speed : 1;
  const durations: Record<string, number> = {
    shimmer: 1500,
    pulse: 1500,
    wave: 1400,
    none: 0,
  };
  const baseMs = durations[normalizedAnimation.value] ?? 0;
  return baseMs === 0 ? "0ms" : `${Math.round(baseMs / s)}ms`;
});

const shimmerVector = computed(() => {
  const raw = props.angle;
  const deg = typeof raw === "number" ? raw : parseFloat(String(raw)) || 90;
  const rad = (deg * Math.PI) / 180;
  return { dx: Math.sin(rad), dy: -Math.cos(rad) };
});

const shimmerFrom = computed(() => {
  const { dx, dy } = shimmerVector.value;
  return `${(-200 * dx).toFixed(2)}% ${(-200 * dy).toFixed(2)}%`;
});

const shimmerTo = computed(() => {
  const { dx, dy } = shimmerVector.value;
  return `${(200 * dx).toFixed(2)}% ${(200 * dy).toFixed(2)}%`;
});

const outlinedCfg = computed(() => {
  const v = props.outlined;
  if (!v) return { enabled: false, width: "1px", style: "solid" };
  if (v === true) return { enabled: true, width: "1px", style: "solid" };
  return {
    enabled: v.enabled ?? true,
    width: typeof v.width === "number" ? `${v.width}px` : (v.width ?? "1px"),
    style: v.style ?? "solid",
  };
});

// CSS custom property helpers
const skWidth = computed(() => {
  const w = props.width;
  return w == null ? undefined : typeof w === "number" ? `${w}px` : w;
});

const skHeight = computed(() => {
  const h = props.height;
  return h == null ? undefined : typeof h === "number" ? `${h}px` : h;
});

const skRadius = computed(() => {
  const r = props.radius;
  return r == null ? undefined : typeof r === "number" ? `${r}px` : r;
});

const skAngle = computed(() => {
  const a = props.angle;
  return a == null ? "90deg" : typeof a === "number" ? `${a}deg` : a;
});
</script>

<template>
  <div
    class="vslk-skeleton-container"
    :class="[
      `vslk-sk--anim-${normalizedAnimation}`,
      `vslk-sk--v-${props.variant}`,
      { 'vslk-sk--outlined': outlinedCfg.enabled },
    ]"
    :style="{
      '--vslk-sk-base': resolvedBase,
      '--vslk-sk-hi': resolvedHighlight,
      '--vslk-sk-duration': resolvedDuration,
      '--vslk-sk-outline-w': outlinedCfg.width,
      '--vslk-sk-outline-style': outlinedCfg.style,
      '--vslk-sk-w': skWidth,
      '--vslk-sk-h': skHeight,
      '--vslk-sk-r': skRadius,
      '--vslk-sk-shimmer-angle': skAngle,
      '--vslk-sk-shimmer-from': shimmerFrom,
      '--vslk-sk-shimmer-to': shimmerTo,
    }"
    v-bind="
      props.label
        ? { role: 'status', 'aria-live': 'polite', 'aria-busy': 'true' }
        : { 'aria-hidden': 'true' }
    "
  >
    <component :is="Comp" v-bind="variantProps" />
    <span v-if="props.label" class="vslk-sr-only">{{ props.label }}</span>
  </div>
</template>

<style>
/* ─── Base shape ─────────────────────────────────────────────────────────── */
.vslk-skeleton-container .vslk-sk-shape {
  background-color: var(--vslk-sk-base);
  position: relative;
  overflow: hidden;
  width: var(--vslk-sk-w, 100%);
  height: var(--vslk-sk-h, 20px);
  border-radius: var(--vslk-sk-r, 4px);
  box-sizing: border-box;
}

/* ─── Shimmer ────────────────────────────────────────────────────────────── */
/*
  background-size: 300% 300% gives the gradient enough canvas to travel
  across any aspect ratio and any angle without a hard seam. The keyframes
  use the JS-computed shimmer-from / shimmer-to vectors so the motion and
  the gradient band are always co-aligned. Both band edges fade to
  transparent so no hard edge is visible at any contrast level.
*/
.vslk-sk--anim-shimmer .vslk-sk-shape {
  background-image: linear-gradient(
    var(--vslk-sk-shimmer-angle, 90deg),
    transparent 0%,
    var(--vslk-sk-hi) 50%,
    transparent 100%
  );
  background-size: 300% 300%;
  background-repeat: no-repeat;
  animation: vslk-shimmer var(--vslk-sk-duration) infinite linear;
}

@keyframes vslk-shimmer {
  0%   { background-position: var(--vslk-sk-shimmer-from, -200% 0%); }
  100% { background-position: var(--vslk-sk-shimmer-to,    200% 0%); }
}

/* ─── Pulse ──────────────────────────────────────────────────────────────── */
/* Animate background-color (not opacity) so light colors pulse visibly too */
.vslk-sk--anim-pulse .vslk-sk-shape {
  animation: vslk-pulse var(--vslk-sk-duration) infinite ease-in-out;
}

@keyframes vslk-pulse {
  0%, 100% { background-color: var(--vslk-sk-base); }
  50%       { background-color: var(--vslk-sk-hi);  }
}

/* ─── Outlined mode ──────────────────────────────────────────────────────── */
/*
  Mask-composite / background-clip border tricks are unreliable across
  browsers, so outlined mode animates the border color instead. It's
  a consistent, smooth sweep everywhere.
*/
.vslk-sk--outlined .vslk-sk-shape {
  background-color: transparent !important;
  background-image: none !important;
  border: var(--vslk-sk-outline-w, 1px) var(--vslk-sk-outline-style, solid) var(--vslk-sk-base);
  box-sizing: border-box;
}

.vslk-sk--outlined.vslk-sk--anim-shimmer .vslk-sk-shape,
.vslk-sk--outlined.vslk-sk--anim-pulse .vslk-sk-shape {
  animation: vslk-pulse-border var(--vslk-sk-duration) infinite ease-in-out !important;
}

@keyframes vslk-pulse-border {
  0%, 100% { border-color: var(--vslk-sk-base); }
  50%       { border-color: var(--vslk-sk-hi);  }
}

/* ─── Accessibility ──────────────────────────────────────────────────────── */
.vslk-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .vslk-sk--anim-shimmer .vslk-sk-shape,
  .vslk-sk--anim-pulse .vslk-sk-shape,
  .vslk-sk--outlined .vslk-sk-shape {
    animation: none !important;
  }
}
</style>
