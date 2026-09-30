<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "./Skeleton/Skeleton.vue";
import Spinner from "./Spinner/Spinner.vue";
import type { SkeletonBaseProps, SkeletonVariantName } from "./Skeleton/types";
import type { SpinnerProps } from "./Spinner/spinner.types";
import {
  DEFAULT_DELAY,
  DEFAULT_MIN_DURATION,
  useDelayedLoading,
} from "../utils/useDelayedLoading";

const props = withDefaults(
  defineProps<{
    loading: boolean;
    /** replace: swap the content for a skeleton.
     *  overlay: keep the content (inert, dimmed) and center a spinner over it. */
    mode?: "replace" | "overlay";
    /** ms a load must last before the loader appears. */
    delay?: number;
    /** ms the loader stays up once shown. */
    minDuration?: number;
    /** Props for the default skeleton (replace mode). */
    skeleton?: SkeletonBaseProps & { variant?: SkeletonVariantName };
    /** Props for the default spinner (overlay mode). */
    spinner?: SpinnerProps;
    /** Announced to screen readers while the loader is visible. */
    label?: string;
  }>(),
  {
    mode: "replace",
    delay: DEFAULT_DELAY,
    minDuration: DEFAULT_MIN_DURATION,
  }
);

/* The loader appears only after `delay` and stays for `minDuration`, but
   aria-busy (in the template) follows the real `loading` state, so
   assistive tech knows the region is updating while the loader waits. */
const showLoader = useDelayedLoading(() => props.loading, {
  delay: () => props.delay,
  minDuration: () => props.minDuration,
});

const skeletonProps = computed(() => ({
  variant: "text" as const,
  lines: 3,
  width: "100%",
  height: 12,
  ...props.skeleton,
  label: props.label,
}));

const spinnerProps = computed(() => ({
  variant: "arc" as const,
  ...props.spinner,
  label: props.label,
}));
</script>

<template>
  <div
    class="vslk-smart-loader"
    :class="`vslk-smart-loader--${props.mode}`"
    :aria-busy="props.loading || undefined"
  >
    <template v-if="props.mode === 'replace'">
      <slot v-if="showLoader" name="loader">
        <Skeleton v-bind="skeletonProps" />
      </slot>
      <slot v-else />
    </template>

    <template v-else>
      <div
        class="vslk-smart-loader__content"
        :class="{ 'vslk-smart-loader__content--busy': showLoader }"
        :inert="showLoader || undefined"
      >
        <slot />
      </div>
      <div v-if="showLoader" class="vslk-smart-loader__overlay">
        <slot name="loader">
          <Spinner v-bind="spinnerProps" />
        </slot>
      </div>
    </template>
  </div>
</template>

<style scoped>
.vslk-smart-loader--overlay {
  position: relative;
}

.vslk-smart-loader__content {
  transition: opacity 0.2s ease;
}

.vslk-smart-loader__content--busy {
  opacity: 0.4;
}

.vslk-smart-loader__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (prefers-reduced-motion: reduce) {
  .vslk-smart-loader__content {
    transition: none;
  }
}
</style>
