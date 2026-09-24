<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "../Skeleton.vue";
import type { SkeletonBaseProps } from "../types";

type CardOptions = {
  layout?: "simple" | "image" | "horizontal";
  lines?: number;
  imageHeight?: number | string;
  mediaWidth?: number | string;
  titleWidth?: number | string;
  radius?: number | string;
  borderWidth?: number | string;
  borderColor?: string;
};

const props = withDefaults(defineProps<SkeletonBaseProps>(), {
  width: 320,
});

const options = computed(() => (props.options ?? {}) as CardOptions);
const layout = computed(() => options.value.layout ?? "image");
const lines = computed(() => Math.max(1, options.value.lines ?? 3));

const containerWidth = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width ?? "320px"
);

const imageHeight = computed(() => {
  const value = options.value.imageHeight ?? 180;
  return typeof value === "number" ? `${value}px` : value;
});

const mediaWidth = computed(() => {
  const value = options.value.mediaWidth ?? 120;
  return typeof value === "number" ? `${value}px` : value;
});

const titleWidth = computed(() => options.value.titleWidth ?? "72%");

const cardRadius = computed(() => {
  const value = options.value.radius ?? "14px";
  return typeof value === "number" ? `${value}px` : value;
});

const borderWidth = computed(() => {
  const value = options.value.borderWidth ?? "1px";
  return typeof value === "number" ? `${value}px` : value;
});

const borderColor = computed(() => options.value.borderColor ?? "rgba(148, 163, 184, 0.18)");

const forwardedProps = computed(() => {
  const { width, height, options, variant, lines: topLevelLines, size, radius, ...rest } =
    props as any;
  return rest;
});

const lineWidths = computed(() =>
  Array.from({ length: lines.value }, (_, i) => {
    if (i === 0) return "100%";
    if (i === lines.value - 1) return "55%";
    return "82%";
  })
);
</script>

<template>
  <div
    v-if="layout === 'image'"
    class="vslk-card vslk-card--image"
    :style="{
      width: containerWidth,
      borderRadius: cardRadius,
      borderWidth,
      borderColor,
    }"
  >
    <Skeleton
      v-bind="forwardedProps"
      variant="block"
      width="100%"
      :height="imageHeight"
      :radius="cardRadius"
    />

    <div class="vslk-card__content">
      <Skeleton
        v-bind="forwardedProps"
        variant="text"
        :width="titleWidth"
        height="14px"
      />

      <Skeleton
        v-for="(w, i) in lineWidths"
        :key="i"
        v-bind="forwardedProps"
        variant="text"
        :width="w"
        height="10px"
      />
    </div>
  </div>

  <div
    v-else-if="layout === 'simple'"
    class="vslk-card vslk-card--simple"
    :style="{
      width: containerWidth,
      borderRadius: cardRadius,
      borderWidth,
      borderColor,
    }"
  >
    <div class="vslk-card__content">
      <Skeleton
        v-bind="forwardedProps"
        variant="text"
        :width="titleWidth"
        height="14px"
      />

      <Skeleton
        v-for="(w, i) in lineWidths"
        :key="i"
        v-bind="forwardedProps"
        variant="text"
        :width="w"
        height="10px"
      />
    </div>
  </div>

  <div
    v-else
    class="vslk-card vslk-card--horizontal"
    :style="{
      width: containerWidth,
      borderRadius: cardRadius,
      borderWidth,
      borderColor,
    }"
  >
    <Skeleton
      v-bind="forwardedProps"
      variant="block"
      :width="mediaWidth"
      :height="mediaWidth"
      :radius="cardRadius"
      class="vslk-card__media"
    />

    <div class="vslk-card__content">
      <Skeleton
        v-bind="forwardedProps"
        variant="text"
        :width="titleWidth"
        height="14px"
      />

      <Skeleton
        v-for="(w, i) in lineWidths"
        :key="i"
        v-bind="forwardedProps"
        variant="text"
        :width="w"
        height="10px"
      />
    </div>
  </div>
</template>

<style scoped>
.vslk-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-style: solid;
  background: transparent;
  box-sizing: border-box;
  overflow: hidden;
}

.vslk-card--image,
.vslk-card--simple {
  flex-direction: column;
}

.vslk-card--horizontal {
  flex-direction: row;
  align-items: flex-start;
}
.vslk-card--horizontal :deep(.vslk-card__media) {
  flex-shrink: 0;
}

.vslk-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
</style>