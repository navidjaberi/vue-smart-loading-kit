<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, onScopeDispose, ref, watch } from "vue";
import ProgressBar from "../ProgressBar/ProgressBar.vue";
import { useLoadingConfig } from "../../config";
import { useDelayedLoading } from "../../utils/useDelayedLoading";
import {
  PAGE_PROGRESS,
  bindRouter,
  createPageProgress,
  type PageProgress,
  type RouterLike,
} from "../../utils/pageProgress";

const props = defineProps<{
  color?: string;
  /** Bar height in px. */
  thickness?: number;
  /** ms a task must last before the bar appears. */
  delay?: number;
  /** Announced to screen readers while the bar is visible. */
  label?: string;
  /** Follow this router's navigations (instead of passing it to the plugin). */
  router?: RouterLike;
  /** Drive the bar from a specific controller (defaults to the app's). */
  progress?: PageProgress;
}>();

// explicit prop > global config > built-in default
const config = useLoadingConfig();
const conf = () => config.pageProgress ?? {};
const color = computed(() => props.color ?? conf().color);
const thickness = computed(() => props.thickness ?? conf().thickness ?? 3);
const label = computed(() => props.label ?? conf().label);

// The app's controller (from the plugin), or a private one.
const progress = props.progress ?? inject(PAGE_PROGRESS, null) ?? createPageProgress();

let unbindRouter: (() => void) | undefined;
onMounted(() => {
  if (props.router) unbindRouter = bindRouter(progress, props.router);
});
onBeforeUnmount(() => unbindRouter?.());

/* Visuals. The real duration is unknown, so the bar starts at 10% and
   eases toward 90% (each step covers a tenth of the remaining distance);
   done() fills it to 100% and it fades out. A task shorter than `delay`
   never shows it at all. */
const START = 10;
const CEILING = 90;
const TRICKLE_MS = 200;
const FINISH_MS = 400;

const shown = useDelayedLoading(progress.loading, {
  delay: () => props.delay ?? conf().delay ?? 200,
  minDuration: 0,
});
const visible = ref(false);
const finishing = ref(false);
const value = ref(0);
let trickle: ReturnType<typeof setInterval> | undefined;
let finishTimer: ReturnType<typeof setTimeout> | undefined;

function begin() {
  clearTimeout(finishTimer);
  clearInterval(trickle);
  visible.value = true;
  finishing.value = false;
  value.value = START;
  trickle = setInterval(() => {
    value.value += (CEILING - value.value) * 0.1;
  }, TRICKLE_MS);
}

watch(shown, (isShown) => {
  if (isShown && !visible.value) begin();
});

watch(progress.loading, (loading) => {
  if (loading) {
    // a new task while the bar was fading out: pick up again, no flicker
    if (finishing.value) begin();
    return;
  }
  if (!visible.value) return; // finished within the delay: never shown
  clearInterval(trickle);
  value.value = 100;
  finishing.value = true;
  finishTimer = setTimeout(() => {
    visible.value = false;
    finishing.value = false;
    value.value = 0;
  }, FINISH_MS);
});

onScopeDispose(() => {
  clearInterval(trickle);
  clearTimeout(finishTimer);
});
</script>

<template>
  <div
    v-if="visible"
    class="vslk-page-progress"
    :class="{ 'vslk-page-progress--done': finishing }"
  >
    <ProgressBar :value="value" :color="color" :thickness="thickness" :track="false" :label="label" />
  </div>
</template>

<style scoped>
.vslk-page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}

/* after the bar has run to 100% (ProgressBar's own 0.3s width transition) */
.vslk-page-progress--done {
  opacity: 0;
  transition: opacity 0.2s ease 0.2s;
}

.vslk-page-progress :deep(.vslk-progress) {
  border-radius: 0;
}

@media (prefers-reduced-motion: reduce) {
  .vslk-page-progress--done {
    transition: none;
  }
}
</style>
