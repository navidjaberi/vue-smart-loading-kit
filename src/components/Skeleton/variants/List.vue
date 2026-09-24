<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "../Skeleton.vue";
import type { SkeletonBaseProps } from "../types";

type ListOptions = {
  items?: number;
  dot?: boolean;
  dotSize?: number | string;
  dotRadius?: number | string;

  lines?: number;
  titleWidth?: number | string;
  subtitleWidth?: number | string;
  lineHeight?: number | string;

  itemGap?: number | string;
  contentGap?: number | string;

  padding?: number | string;
  divider?: boolean;
  borderColor?: string;
};

const props = defineProps<SkeletonBaseProps>();

const options = computed(() => (props.options ?? {}) as ListOptions);

const items = computed(() => Math.max(1, options.value.items ?? 4));
const dot = computed(() => options.value.dot ?? true);

const dotSize = computed(() => {
  const v = options.value.dotSize ?? 8;
  return typeof v === "number" ? `${v}px` : v;
});

const dotRadius = computed(() => {
  const v = options.value.dotRadius ?? "9999px";
  return typeof v === "number" ? `${v}px` : v;
});

const lines = computed(() => Math.max(0, options.value.lines ?? 2));

const titleWidth = computed(() => options.value.titleWidth ?? "68%");
const subtitleWidth = computed(() => options.value.subtitleWidth ?? "52%");

const lineHeight = computed(() => {
  const v = options.value.lineHeight ?? "12px";
  return typeof v === "number" ? `${v}px` : v;
});

const itemGap = computed(() => {
  const v = options.value.itemGap ?? "12px";
  return typeof v === "number" ? `${v}px` : v;
});

const contentGap = computed(() => {
  const v = options.value.contentGap ?? "8px";
  return typeof v === "number" ? `${v}px` : v;
});

const padding = computed(() => {
  const v = options.value.padding ?? "12px 0";
  return typeof v === "number" ? `${v}px` : v;
});

const divider = computed(() => options.value.divider ?? false);
const borderColor = computed(
  () => options.value.borderColor ?? "rgba(148, 163, 184, 0.18)"
);

const containerWidth = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width ?? "100%"
);

/* Exclude props that are explicitly re-bound per nested element (width,
   height via dotSize/lineHeight, size, lines via options.lines) so a
   stray top-level value passed to <Skeleton variant="list"> can never
   leak into the nested marker/text calls — e.g. a top-level `lines`
   prop would otherwise be forwarded into every item's text-line
   Skeleton and make each one recursively multi-line. */
const forwardedProps = computed(() => {
  const { width, options, size, lines: topLevelLines, ...rest } = props;
  return rest;
});

function getLineWidth(itemIndex: number, lineIndex: number) {
  if (lineIndex === 0) return titleWidth.value;
  if (lineIndex === 1) return subtitleWidth.value;

  const presets = ["90%", "75%", "62%", "84%", "70%"];
  return presets[(itemIndex + lineIndex) % presets.length];
}

const itemAlign = computed(() => (lines.value <= 1 ? "center" : "flex-start"));
</script>

<template>
  <div class="vslk-list" :style="{ width: containerWidth, gap: itemGap }">
    <div
      v-for="item in items"
      :key="item"
      class="vslk-list__item"
      :class="{ 'vslk-list__item--divider': divider && item !== items }"
      :style="{
        padding,
        borderBottomColor: borderColor,
        alignItems: itemAlign,
      }"
    >
      <div v-if="dot" class="vslk-list__marker">
        <Skeleton
          v-bind="forwardedProps"
          variant="block"
          :width="dotSize"
          :height="dotSize"
          :radius="dotRadius"
        />
      </div>

      <div class="vslk-list__content" :style="{ gap: contentGap }">
        <Skeleton
          v-for="line in lines"
          :key="line"
          v-bind="forwardedProps"
          variant="text"
          :width="getLineWidth(item - 1, line - 1)"
          :height="lineHeight"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vslk-list {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-width: 0;
}

.vslk-list__item {
  display: flex;
  gap: 12px;
  min-width: 0;
  box-sizing: border-box;
}

.vslk-list__item--divider {
  border-bottom: 1px solid;
}

.vslk-list__marker {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding-top: 1px;
}

.vslk-list__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>