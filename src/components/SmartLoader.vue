<script setup lang="ts">
import { computed, ref, watch } from "vue";
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
    /** Any truthy value (true, an Error, a message) shows the error state. */
    error?: unknown;
    /** replace mode: keep the content's height while the loader stands in
     *  for it, so the rest of the page doesn't jump. */
    preserveHeight?: boolean;
  }>(),
  {
    mode: "replace",
    delay: DEFAULT_DELAY,
    minDuration: DEFAULT_MIN_DURATION,
    preserveHeight: true,
  }
);

const emit = defineEmits<{
  /** The default error UI's "Try again" button (or the slot's `retry`). */
  retry: [];
}>();

/* The loader appears only after `delay` and stays for `minDuration`, but
   aria-busy (in the template) follows the real `loading` state, so
   assistive tech knows the region is updating while the loader waits. */
const showLoader = useDelayedLoading(() => props.loading, {
  delay: () => props.delay,
  minDuration: () => props.minDuration,
});

/* What is on screen: a visible loader wins, then an error, then content.
   So during a retry the error stays up until the loader actually appears,
   rather than flashing stale or empty content in between. */
const view = computed(() =>
  showLoader.value ? "loader" : props.error ? "error" : "content"
);

const retry = () => emit("retry");

/* Layout shift: measure what is on screen right before the loader
   replaces it ("pre" runs before the DOM update, while the content is
   still there) and keep that height until the loader goes away. On a
   first load nothing was shown yet, so nothing is reserved. */
const root = ref<HTMLElement>();
const reservedHeight = ref<number | null>(null);
watch(
  showLoader,
  (shown) => {
    if (!shown) {
      reservedHeight.value = null;
      return;
    }
    if (props.mode !== "replace" || !props.preserveHeight || !root.value) return;
    const height = root.value.getBoundingClientRect().height;
    reservedHeight.value = height > 0 ? height : null;
  },
  { flush: "pre" }
);

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
    ref="root"
    class="vslk-smart-loader"
    :class="`vslk-smart-loader--${props.mode}`"
    :style="reservedHeight ? { minHeight: `${reservedHeight}px` } : undefined"
    :aria-busy="props.loading || undefined"
  >
    <template v-if="props.mode === 'replace'">
      <slot v-if="view === 'loader'" name="loader">
        <Skeleton v-bind="skeletonProps" />
      </slot>
      <slot v-else-if="view === 'error'" name="error" :error="props.error" :retry="retry">
        <div class="vslk-smart-loader__error" role="alert">
          <p>Something went wrong.</p>
          <button type="button" @click="retry">Try again</button>
        </div>
      </slot>
      <slot v-else />
    </template>

    <template v-else>
      <div
        class="vslk-smart-loader__content"
        :class="{ 'vslk-smart-loader__content--busy': view !== 'content' }"
        :inert="view !== 'content' || undefined"
      >
        <slot />
      </div>
      <div v-if="view !== 'content'" class="vslk-smart-loader__overlay">
        <slot v-if="view === 'loader'" name="loader">
          <Spinner v-bind="spinnerProps" />
        </slot>
        <slot v-else name="error" :error="props.error" :retry="retry">
          <div class="vslk-smart-loader__error" role="alert">
            <p>Something went wrong.</p>
            <button type="button" @click="retry">Try again</button>
          </div>
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

.vslk-smart-loader__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px;
  text-align: center;
}

.vslk-smart-loader__error p {
  margin: 0;
}

.vslk-smart-loader__error button {
  font: inherit;
  color: inherit;
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .vslk-smart-loader__content {
    transition: none;
  }
}
</style>
