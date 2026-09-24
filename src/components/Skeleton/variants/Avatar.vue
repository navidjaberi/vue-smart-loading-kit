<script setup lang="ts">
import { computed } from "vue";
import type { SkeletonBaseProps } from "../types";

const props = defineProps<SkeletonBaseProps>();

const size = computed(() =>
  typeof props.size === "number"
    ? `${props.size}px`
    : props.size ?? "48px"
);

const r = computed(() =>
  typeof props.radius === "number" ? `${props.radius}px` : props.radius ?? "9999px"
);
</script>

<template>
  <div
    class="vslk-sk-shape"
    :style="{
      width: size,
      height: size,
      borderRadius: r,
    }"
  />
</template>