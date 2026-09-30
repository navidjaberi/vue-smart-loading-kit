<script setup lang="ts">
import { computed } from "vue";
import { resolveTrack } from "../Spinner/track";
import { clampProgress, progressA11y } from "../../utils/progress";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";

const props = withDefaults(
  defineProps<{
    /** 0–100. Without it the bar is indeterminate (a sliding segment). */
    value?: number;
    color?: string;
    /** The background rail. `true` derives it from `color`; a string sets it. */
    track?: boolean | string;
    /** Bar height in px. */
    thickness?: number;
    speed?: number;
    /** Announced to screen readers (progressbar or live status). */
    label?: string;
  }>(),
  {
    color: "currentColor",
    // unlike the arc, a bar with no visible rail is hard to read as progress
    track: true,
    thickness: 4,
    speed: 1,
  }
);

const progress = computed(() => clampProgress(props.value));
const trackInfo = computed(() => resolveTrack(props.track));
const a11y = computed(() => progressA11y(props.label, progress.value));

// Same reduced-motion policy as Spinner: slow down rather than freeze.
const prefersReducedMotion = usePrefersReducedMotion();
const duration = computed(() => {
  const speed = props.speed > 0 ? props.speed : 1;
  return `${(1.5 / speed) * (prefersReducedMotion.value ? 2 : 1)}s`;
});
</script>

<template>
  <div
    class="vslk-progress"
    :class="{ 'vslk-progress--indeterminate': progress === null }"
    :data-vslk-track="trackInfo?.attr"
    :style="{
      height: `${props.thickness}px`,
      color: props.color,
      '--vslk-progress-track': trackInfo?.color ?? 'transparent',
      '--vslk-progress-duration': duration,
    }"
    v-bind="a11y"
  >
    <div
      class="vslk-progress__bar"
      :style="progress === null ? undefined : { width: `${progress}%` }"
    />
    <span v-if="props.label && progress === null" class="vslk-sr-only">{{ props.label }}</span>
  </div>
</template>

<style scoped>
.vslk-progress {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 999px;
  background: var(--vslk-progress-track);
}

.vslk-progress__bar {
  height: 100%;
  border-radius: inherit;
  background: currentColor;
  transition: width 0.3s ease;
}

/* Indeterminate: a 40%-wide segment slides from fully off the left edge
   (-100% of its own width) to fully off the right (250% of 40% = 100%). */
.vslk-progress--indeterminate .vslk-progress__bar {
  width: 40%;
  transition: none;
  animation: vslk-progress-slide var(--vslk-progress-duration) ease-in-out infinite;
}

@keyframes vslk-progress-slide {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(250%);
  }
}

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
</style>
