<script setup lang="ts">
import { computed, warn, watch } from "vue";
import Circle from "./variants/Circle.vue";
import Dots from "./variants/Dots.vue";
import Pulse from "./variants/Pulse.vue";
import Bars from "./variants/Bars.vue";
import Ring from "./variants/Ring.vue";
import Orbit from "./variants/Orbit.vue";
import PulseDots from "./variants/PulseDots.vue";
import OrbitDots from "./variants/OrbitDots.vue";
import Arc from "./variants/Arc.vue";
import type { Component } from "vue";
import type { SpinnerProps, SpinnerVariantName } from "./spinner.types";
import { usePrefersReducedMotion } from "../../utils/usePrefersReducedMotion";
import { clampProgress, progressA11y } from "../../utils/progress";

const props = withDefaults(defineProps<SpinnerProps>(), {
  size: 40,
  color: "currentColor",
  speed: 1,
  thickness: 4,
  /* An explicit undefined default opts out of Vue's Boolean casting (an
     absent boolean prop becomes `false`), so each variant's own track
     default applies unless the user sets `track`. */
  track: undefined,
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
  arc: Arc,
};

/** `variant` wins over the deprecated `type`; camelCase names are
 *  normalized to kebab-case so both v0.1.0 spellings keep working. */
const variantName = computed(() => {
  const raw = props.variant ?? props.type ?? "circle";
  return raw.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
});
const component = computed(() => variants[variantName.value as SpinnerVariantName] ?? Circle);

/** Prop names the current variant declares. */
const accepted = computed(() => Object.keys((component.value as { props?: object }).props ?? {}));

/* Pass each variant only the props it declares: anything else (e.g.
   `thickness` on dots) would render as a stray HTML attribute. Undefined
   values are dropped so the variant's own defaults apply. */
const variantProps = computed(() => {
  const all: Record<string, unknown> = {
    size: props.size,
    color: props.color,
    speed: effectiveSpeed.value,
    thickness: props.thickness,
    track: props.track,
    value: props.value,
  };
  return Object.fromEntries(
    Object.entries(all).filter(([k, v]) => v !== undefined && accepted.value.includes(k))
  );
});

const progress = computed(() =>
  accepted.value.includes("value") ? clampProgress(props.value) : null
);

watch(
  () => props.value != null && !accepted.value.includes("value"),
  (unsupported) => {
    if (unsupported)
      warn(
        `[vue-smart-loading-kit] Spinner \`value\` is ignored by variant "${variantName.value}". ` +
          `To show progress, use variant="arc" or <ProgressBar>.`
      );
  },
  { immediate: true }
);

const a11y = computed(() => progressA11y(props.label, progress.value));
</script>

<template>
  <span
    class="vslk-spinner-wrapper"
    v-bind="a11y"
  >
    <component :is="component" v-bind="variantProps" />
    <span v-if="props.label && progress === null" class="vslk-sr-only">{{ props.label }}</span>
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