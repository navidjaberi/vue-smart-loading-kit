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
import type { Component } from "vue";
import type { SpinnerProps, SpinnerVariantName } from "./spinner.types";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: 40,
  color: "#3b82f6",
  speed: 1,
  thickness: 4,
});

/* A spinner that stops entirely reads as a frozen page, so reduced
   motion slows it down instead of disabling it (unlike Skeleton). */
const REDUCED_MOTION_SPEED_FACTOR = 0.5;
const prefersReducedMotion = usePrefersReducedMotion();
const effectiveSpeed = computed(() =>
  prefersReducedMotion.value ? props.speed * REDUCED_MOTION_SPEED_FACTOR : props.speed
);

const variants: Record<SpinnerVariantName, Component> = {
  circle: Circle,
  dots: Dots,
  pulse: Pulse,
  bars: Bars,
  ring: Ring,
  orbit: Orbit,
  "pulse-dots": PulseDots,
  "orbit-dots": OrbitDots,
};

/** `variant` wins over the deprecated `type`; camelCase names are
 *  normalized to kebab-case so both v0.1.0 spellings keep working. */
const component = computed(() => {
  const raw = props.variant ?? props.type ?? "circle";
  const name = raw.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  return variants[name as SpinnerVariantName] ?? Circle;
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
      :speed="effectiveSpeed"
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