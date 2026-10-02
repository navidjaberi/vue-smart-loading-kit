<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import Skeleton from "./Skeleton/Skeleton.vue";
import Spinner from "./Spinner/Spinner.vue";
import type { SkeletonBaseProps, SkeletonVariantName } from "./Skeleton/types";
import type { SpinnerProps } from "./Spinner/spinner.types";
import {
  DEFAULT_DELAY,
  DEFAULT_MIN_DURATION,
  useDelayedLoading,
} from "../utils/useDelayedLoading";
import { useLoadingConfig } from "../config";
import { vSkeleton } from "../skeletonize/directive";

const props = withDefaults(
  defineProps<{
    loading: boolean;
    /** replace: swap the content for a skeleton.
     *  overlay: keep the content (inert, dimmed) and center a spinner over it.
     *  skeletonize: keep the content and restyle it into a skeleton (v-skeleton). */
    mode?: "replace" | "overlay" | "skeletonize";
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
    /** Any truthy value (true, an Error, a message) shows the error state.
     *  A string is shown as the message; anything else shows a generic one. */
    error?: unknown;
    /** replace mode: keep the content's height while the loader stands in
     *  for it, so the rest of the page doesn't jump. */
    preserveHeight?: boolean;
  }>(),
  {
    // explicit undefined opts out of Vue's Boolean casting, so an unset
    // `preserveHeight` can fall through to the global config
    preserveHeight: undefined,
  }
);

// explicit prop > global config > built-in default
const config = useLoadingConfig();
const conf = () => config.smartLoader ?? {};
const mode = computed(() => props.mode ?? conf().mode ?? "replace");
const preserveHeight = computed(() => props.preserveHeight ?? conf().preserveHeight ?? true);

const emit = defineEmits<{
  /** The default error UI's "Try again" button (or the slot's `retry`). */
  retry: [];
}>();

/* The loader appears only after `delay` and stays for `minDuration`, but
   aria-busy (in the template) follows the real `loading` state, so
   assistive tech knows the region is updating while the loader waits. */
const delay = computed(() => props.delay ?? conf().delay ?? DEFAULT_DELAY);
const minDuration = computed(() => props.minDuration ?? conf().minDuration ?? DEFAULT_MIN_DURATION);
const showLoader = useDelayedLoading(() => props.loading, { delay, minDuration });

/* skeletonize mode: v-skeleton gets the real loading state and timing, so
   its getSSRProps can skeletonize the server HTML (the delayed `view` never
   reaches "loader" on the server). Content that only mounts once the loader
   is due (after an error) is skeletonized at once: the wait already happened. */
const skeletonizeValue = computed(() => ({
  loading: props.loading,
  delay: view.value === "loader" ? 0 : delay.value,
  minDuration: minDuration.value,
}));

/* The label is announced only after mount: the server can't know whether
   the loader is up, and inserting text into an existing live region is
   what screen readers reliably announce. */
const mounted = ref(false);
onMounted(() => (mounted.value = true));

/* What is on screen: a visible loader wins, then an error, then content.
   So during a retry the error stays up until the loader actually appears,
   rather than flashing stale or empty content in between. */
const view = computed(() =>
  showLoader.value ? "loader" : props.error ? "error" : "content"
);

const retry = () => emit("retry");

/* A string is a message written for the user, so it is shown. An Error's
   message is usually technical ("Failed to fetch"), so it gets the generic
   text; the #error slot can show anything else. */
const errorMessage = computed(() =>
  typeof props.error === "string" && props.error.trim() ? props.error : "Something went wrong."
);

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
    if (mode.value !== "replace" || !preserveHeight.value || !root.value) return;
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
  ...conf().skeleton,
  ...props.skeleton,
  label: props.label,
}));

const spinnerProps = computed(() => ({
  variant: "arc" as const,
  ...conf().spinner,
  ...props.spinner,
  label: props.label,
}));
</script>

<template>
  <div
    ref="root"
    class="vslk-smart-loader"
    :class="`vslk-smart-loader--${mode}`"
    :style="reservedHeight ? { minHeight: `${reservedHeight}px` } : undefined"
    :aria-busy="props.loading || undefined"
  >
    <template v-if="mode === 'replace'">
      <slot v-if="view === 'loader'" name="loader">
        <Skeleton v-bind="skeletonProps" />
      </slot>
      <slot v-else-if="view === 'error'" name="error" :error="props.error" :retry="retry">
        <div class="vslk-smart-loader__error" role="alert">
          <p>{{ errorMessage }}</p>
          <button type="button" @click="retry">Try again</button>
        </div>
      </slot>
      <slot v-else />
    </template>

    <template v-else-if="mode === 'skeletonize'">
      <slot v-if="view === 'error'" name="error" :error="props.error" :retry="retry">
        <div class="vslk-smart-loader__error" role="alert">
          <p>{{ errorMessage }}</p>
          <button type="button" @click="retry">Try again</button>
        </div>
      </slot>
      <template v-else>
        <div class="vslk-smart-loader__content" v-skeleton="skeletonizeValue">
          <slot />
        </div>
        <span v-if="props.label" class="vslk-sr-only" role="status">{{
          mounted && view === "loader" ? props.label : ""
        }}</span>
      </template>
    </template>

    <!-- overlay, and any unknown mode (a typo shouldn't make content vanish) -->
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
            <p>{{ errorMessage }}</p>
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

.vslk-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
