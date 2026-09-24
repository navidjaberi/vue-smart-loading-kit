<!-- src/components/skeleton/variants/Text.vue -->
<script setup lang="ts">
import { computed } from "vue";
import type { SkeletonBaseProps } from "../types";
type TextOptions = {
  gap?: number | string;
  lastLineWidth?: number | string;
};

const props = defineProps<SkeletonBaseProps>();

function toUnit(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

const options = computed(() => (props.options ?? {}) as TextOptions);

const lineCount = computed(() => Math.max(1, props.lines ?? 1));

const w = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width ?? "4em"
);

const h = computed(() =>
  typeof props.height === "number" ? `${props.height}px` : props.height ?? "2em"
);

const r = computed(() =>
  typeof props.radius === "number" ? `${props.radius}px` : props.radius ?? "4px"
);

const gap = computed(() => toUnit(options.value.gap ?? 8));

const lastLineWidth = computed(() => toUnit(options.value.lastLineWidth ?? "60%"));
</script>

<template>
  <div
    v-if="lineCount <= 1"
    class="vslk-sk-shape"
    :style="{ width: w, height: h, borderRadius: r }"
  />

  <div v-else class="vslk-sk-text-lines" :style="{ gap }">
    <div
      v-for="i in lineCount"
      :key="i"
      class="vslk-sk-shape"
      :style="{
        width: i === lineCount ? lastLineWidth : w,
        height: h,
        borderRadius: r,
      }"
    />
  </div>
</template>

<style scoped>
.vslk-sk-text-lines {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>