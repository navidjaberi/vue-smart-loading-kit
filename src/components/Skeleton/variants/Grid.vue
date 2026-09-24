<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "../Skeleton.vue";
import type { SkeletonBaseProps } from "../types";

type GridOptions = {
  rows?: number;
  columns?: number;
  minItemWidth?: number | string;
  itemCount?: number;
  gap?: number | string;
  itemHeight?: number | string;
  itemRadius?: number | string;
  padding?: number | string;
};

const props = defineProps<SkeletonBaseProps>();

const options = computed(() => (props.options ?? {}) as GridOptions);

function toUnit(value?: number | string) {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

const rows = computed(() => Math.max(1, options.value.rows ?? 2));
const columns = computed(() => Math.max(1, options.value.columns ?? 3));

const gap = computed(() => toUnit(options.value.gap ?? "16px"));

const itemHeight = computed(() => toUnit(options.value.itemHeight ?? "140px"));

const itemRadius = computed(() => toUnit(options.value.itemRadius ?? "12px"));


const padding = computed(() => toUnit(options.value.padding ?? "0"));

const containerWidth = computed(() =>
  typeof props.width === "number"
    ? `${props.width}px`
    : props.width ?? "100%"
);

const forwardedProps = computed(() => {
  const { width, options, ...rest } = props;
  return rest;
});

const isAutoFit = computed(() => options.value.minItemWidth != null);

const totalItems = computed(() => {
  if (options.value.itemCount != null) {
    return Math.max(1, options.value.itemCount);
  }
  return rows.value * columns.value;
});

const gridStyle = computed(() => {
  const base = {
    width: containerWidth.value,
    gap: gap.value,
    padding: padding.value,
  };

  if (isAutoFit.value) {
    return {
      ...base,
      gridTemplateColumns: `repeat(auto-fit, minmax(${toUnit(
        options.value.minItemWidth!
      )}, 1fr))`,
    };
  }

  return {
    ...base,
    gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
  };
});
</script>

<template>
  <div class="vslk-grid" :style="gridStyle">
    <div
      v-for="item in totalItems"
      :key="item"
      class="vslk-grid__item"
    >
      <Skeleton
        v-bind="forwardedProps"
        variant="block"
        width="100%"
        :height="itemHeight"
        :radius="itemRadius"
      />
    </div>
  </div>
</template>

<style scoped>
.vslk-grid {
  display: grid;
  box-sizing: border-box;
  min-width: 0;
}

.vslk-grid__item {
  min-width: 0;
  box-sizing: border-box;
}
</style>