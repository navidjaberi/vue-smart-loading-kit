<!-- src/components/skeleton/VSkeleton.vue -->
<script setup lang="ts">
import { computed } from "vue";
import { skeletonVariants } from "./variants";
import type { SkeletonBaseProps, SkeletonVariantName } from "./types";
import { generateAutoHighlight } from "./utils/color";
import { shimmerPath } from "./utils/shimmer";
const props = withDefaults(
  defineProps<
    SkeletonBaseProps & {
      variant?: SkeletonVariantName;
      /** Set this on exactly ONE Skeleton instance per loading region
       *  (e.g. the outer Table/Card, not every nested cell) to announce
       *  it to screen readers as "loading". Every Skeleton is
       *  aria-hidden by default since it's a decorative placeholder —
       *  announcing every single one would be noisy and unhelpful. */
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
  return props.animation === "wave" ? "shimmer" : props.animation ?? "shimmer";
});

const resolvedDuration = computed(() => {
  const s = props.speed && props.speed > 0 ? props.speed : 1;
  const durations = {
    shimmer: 1500,
    pulse: 1500, // پالس کمی آرام‌تر حس بهتری می‌دهد
    wave: 1400,
    none: 0,
  };
  const baseMs = durations[normalizedAnimation.value as keyof typeof durations] ?? 0;
  return baseMs === 0 ? "0ms" : `${Math.round(baseMs / s)}ms`;
});

/* Where the sheen's background-position slides from/to for this angle.
   See utils/shimmer.ts for why the endpoints are opposite corners. */
const shimmer = computed(() => shimmerPath(props.angle));

const outlinedCfg = computed(() => {
  const v = props.outlined;
  if (!v) return { enabled: false, width: "1px", style: "solid" };
  if (v === true) return { enabled: true, width: "1px", style: "solid" };
  return {
    enabled: v.enabled ?? true,
    width: typeof v.width === "number" ? `${v.width}px` : v.width ?? "1px",
    style: v.style ?? "solid",
  };
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
      '--vslk-sk-w': typeof props.width === 'number' ? `${props.width}px` : props.width,
      '--vslk-sk-h': typeof props.height === 'number' ? `${props.height}px` : props.height,
      '--vslk-sk-r': typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
      '--vslk-sk-shimmer-angle': typeof props.angle === 'number' ? `${props.angle}deg` : props.angle ?? '90deg',
      '--vslk-sk-shimmer-from': shimmer.from,
      '--vslk-sk-shimmer-to': shimmer.to,
    }"
    v-bind="props.label
      ? { role: 'status', 'aria-live': 'polite', 'aria-busy': 'true' }
      : { 'aria-hidden': 'true' }"
  >
    <component :is="Comp" v-bind="variantProps" />
    <span v-if="props.label" class="vslk-sr-only">{{ props.label }}</span>
  </div>
</template>

<style>
/* Base shape */
.vslk-skeleton-container .vslk-sk-shape {
  background-color: var(--vslk-sk-base);
  position: relative;
  overflow: hidden;
  width: var(--vslk-sk-w, 100%);
  height: var(--vslk-sk-h, 20px);
  border-radius: var(--vslk-sk-r, 4px);
  box-sizing: border-box; /* برای فیکس ماندن ابعاد در حالت outlined */
}

/* -----------------------------
   Normal animations (Filled)
------------------------------ */

/* Shimmer — a translucent sheen sweeping over the solid base color.
   background-size is generous in BOTH axes (300% 300%) so there's
   enough pattern to slide through regardless of angle or the shape's
   own aspect ratio. The keyframes slide between the JS-computed
   --vslk-sk-shimmer-from/-to corners (see utils/shimmer.ts), which stay
   inside the valid 0%-100% range and move the band along the
   gradient's own direction, fully across the box, at any angle. Both ends of the sheen
   fade to fully transparent, so there's never a hard seam regardless
   of color contrast either. */
.vslk-sk--anim-shimmer .vslk-sk-shape {
  /* The bright band is intentionally narrow (45%-50%-55%, not a full
     0%-50%-100% spread) — combined with the large background-size
     needed for non-90deg angles, a full-width spread meant a large
     fraction of the box showed near-opaque highlight at any given
     moment, looking like a solid color panel sliding over rather than
     a thin streak of light. */

  /* Fallback for browsers without relative color syntax support —
     fades directly to `transparent`, which can show a faint dark/muddy
     dip near the fade-out since transparent's RGB is (0,0,0) and plain
     gradients interpolate RGB and alpha together. The next declaration
     overrides this wherever it's understood: rgb(from ...) rebuilds
     the SAME hue at alpha 0, so the fade is alpha-only, no hue shift.

     With background-size 300%, a stop spread of `w` percent of the
     pattern is `3w` percent of the BOX's own extent once rendered, so
     this 10% spread is a band ~30% of the box wide. utils/shimmer.ts
     relies on that width when proving the band always clears the box
     (tests/Skeleton/shimmer.test.ts models it) — change the stops and
     the test's `halfBand` together. */
  background-image: linear-gradient(
    var(--vslk-sk-shimmer-angle, 90deg),
    transparent 45%,
    var(--vslk-sk-hi) 50%,
    transparent 55%
  );
  background-image: linear-gradient(
    var(--vslk-sk-shimmer-angle, 90deg),
    rgb(from var(--vslk-sk-hi) r g b / 0) 45%,
    var(--vslk-sk-hi) 50%,
    rgb(from var(--vslk-sk-hi) r g b / 0) 55%
  );
  background-size: 300% 300%;
  background-repeat: no-repeat;
  animation: vslk-shimmer var(--vslk-sk-duration) infinite linear;
}

@keyframes vslk-shimmer {
  0% { background-position: var(--vslk-sk-shimmer-from, 100% 50%); }
  100% { background-position: var(--vslk-sk-shimmer-to, 0% 50%); }
}

/* Pulse - بجای opacity از رنگ استفاده می‌کنیم تا در رنگ‌های روشن هم کار کند */
.vslk-sk--anim-pulse .vslk-sk-shape {
  animation: vslk-pulse var(--vslk-sk-duration) infinite ease-in-out;
}

@keyframes vslk-pulse {
  0%, 100% { background-color: var(--vslk-sk-base); }
  50% { background-color: var(--vslk-sk-hi); }
}

/* Outlined mode (Animated border)
   A literal "sliding gradient" along a thin border requires
   mask-composite or dual background-clip tricks, both of which are
   unreliable across browsers in practice. Instead, both shimmer and
   pulse animate the border COLOR between base and highlight — visually
   a smooth sweep rather than a moving gradient, but guaranteed to
   animate consistently everywhere with zero exotic CSS features. */

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
  50% { border-color: var(--vslk-sk-hi); }
}

/* -----------------------------
   Utility & Accessibility
------------------------------ */
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