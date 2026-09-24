<script setup lang="ts">
import { computed } from "vue";
import type { SkeletonBaseProps } from "../types";

const props = defineProps<SkeletonBaseProps>();

const w = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width ?? "100%"
);
const h = computed(() =>
  typeof props.height === "number" ? `${props.height}px` : props.height ?? "16px"
);
const r = computed(() =>
  typeof props.radius === "number" ? `${props.radius}px` : props.radius ?? "4px"
);
</script>

<template>
  <div class="vslk-sk-shape" :style="{ width: w, height: h, borderRadius: r }" />
</template>