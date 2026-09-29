<script setup lang="ts">
import { computed } from "vue";
import { toCssSize, toPx } from "../../../utils/size";
import { resolveTrack } from "../track";

interface Props {
  size?: number | string;
  color?: string;
  speed?: number;
  thickness?: number;
  track?: boolean | string;
  /** 0–100; anything non-finite keeps the arc indeterminate. */
  value?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "currentColor",
  speed: 1,
  thickness: 4,
  track: false,
});

const box = computed(() => toCssSize(props.size));
const trackInfo = computed(() => resolveTrack(props.track));

const progress = computed(() =>
  typeof props.value === "number" && Number.isFinite(props.value)
    ? Math.min(100, Math.max(0, props.value))
    : null
);

const speed = computed(() => (props.speed > 0 ? props.speed : 1));

/* The viewBox is 44 units wide. `thickness` is in px (like circle/ring),
   so convert it to viewBox units when the size is known in px; for other
   units (rem, %) fall back to 1 unit = 1px of a 44px box. The radius
   shrinks by half the stroke so a thick stroke never clips at the edge. */
const VIEWBOX = 44;
const strokeWidth = computed(() => {
  const px = toPx(props.size);
  return px ? (props.thickness * VIEWBOX) / px : props.thickness;
});
const radius = computed(() => Math.max(1, VIEWBOX / 2 - strokeWidth.value / 2));
</script>

<template>
  <!-- pathLength="100" makes dash lengths percentages of the circle,
       so `value` maps straight onto stroke-dasharray. -->
  <svg
    class="vslk-spinner-arc"
    :class="{ 'vslk-spinner-arc--indeterminate': progress === null }"
    viewBox="0 0 44 44"
    :style="{
      width: box,
      height: box,
      color: props.color,
      '--vslk-arc-rotate': `${2 / speed}s`,
      '--vslk-arc-dash': `${1.5 / speed}s`,
    }"
  >
    <circle
      v-if="trackInfo"
      class="vslk-spinner-arc__track"
      :data-vslk-track="trackInfo.attr"
      cx="22"
      cy="22"
      :r="radius"
      fill="none"
      :stroke="trackInfo.color"
      :stroke-width="strokeWidth"
    />
    <circle
      class="vslk-spinner-arc__bar"
      cx="22"
      cy="22"
      :r="radius"
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      :stroke-linecap="progress === 0 ? 'butt' : 'round'"
      pathLength="100"
      :style="progress === null ? undefined : { strokeDasharray: `${progress} 100` }"
    />
  </svg>
</template>

<style scoped>
.vslk-spinner-arc {
  display: block;
  max-width: 100%;
  flex-shrink: 0;
  /* determinate: start at 12 o'clock and fill clockwise */
  transform: rotate(-90deg);
}

.vslk-spinner-arc__bar {
  transition: stroke-dasharray 0.3s ease;
}

/* Indeterminate (Material style): the whole circle turns while the arc
   grows and shrinks, so it never looks like a fixed shape spinning. */
.vslk-spinner-arc--indeterminate {
  animation: vslk-arc-rotate var(--vslk-arc-rotate) linear infinite;
}

.vslk-spinner-arc--indeterminate .vslk-spinner-arc__bar {
  animation: vslk-arc-dash var(--vslk-arc-dash) ease-in-out infinite;
}

@keyframes vslk-arc-rotate {
  from {
    transform: rotate(-90deg);
  }
  to {
    transform: rotate(270deg);
  }
}

@keyframes vslk-arc-dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 70 150;
    stroke-dashoffset: -28;
  }
  100% {
    stroke-dasharray: 70 150;
    stroke-dashoffset: -99;
  }
}
</style>
