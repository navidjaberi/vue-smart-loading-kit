<script setup lang="ts">
import { computed } from "vue";
import Circle from "./variants/Circle.vue";
import Dots from "./variants/Dots.vue";
import Pulse from "./variants/Pulse.vue";
import Bars from "./variants/Bars.vue";
import Ring from "./variants/Ring.vue";
import Orbit from "./variants/Orbit.vue";
import PulseDots from "./variants/PulseDots.vue";
import OrbitDots from "./variants/OrbitDots.vue";

export type SpinnerType =
  | "circle"
  | "dots"
  | "pulse"
  | "bars"
  | "ring"
  | "orbit"
  | "pulseDots"
  | "orbitDots";

export interface SpinnerProps {
  type?: SpinnerType;
  size?: number | string;
  color?: string;
  speed?: number;
  thickness?: number;
  label?: string;
}

const props = withDefaults(defineProps<SpinnerProps>(), {
  type: "circle",
  size: 40,
  color: "#3b82f6",
  speed: 1,
  thickness: 4,
});

const variants: Record<string, any> = {
  circle: Circle,
  dots: Dots,
  pulse: Pulse,
  bars: Bars,
  ring: Ring,
  orbit: Orbit,
  pulseDots: PulseDots,
  orbitDots: OrbitDots,
};

const component = computed(() => {
  return variants[props.type] || Circle;
});
</script>

<template>
  <span
    class="vslk-spinner-wrapper"
    v-bind="props.label
      ? { role: 'status', 'aria-live': 'polite', 'aria-busy': 'true' }
      : { 'aria-hidden': 'true' }"
  >
    <component
      :is="component"
      :size="props.size"
      :color="props.color"
      :speed="props.speed"
      :thickness="props.thickness"
    />
    <span v-if="props.label" class="vslk-sr-only">{{ props.label }}</span>
  </span>
</template>

<style scoped>
.vslk-spinner-wrapper {
  display: inline-flex;
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