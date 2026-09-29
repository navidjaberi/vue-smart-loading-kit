<script setup lang="ts">
import { computed } from "vue";
import type { SkeletonBaseProps } from "../types";

interface ImageOptions {
  ratio?: string;
  icon?: boolean;
  iconSize?: number | string;
  iconColor?: string;
}

const props = defineProps<SkeletonBaseProps & { options?: ImageOptions }>();

const showIcon = computed(() => props.options?.icon ?? true);

const normalizedIconSize = computed(() => {
  const value = props.options?.iconSize ?? "40%";

  return typeof value === "number"
    ? `${value}px`
    : value;
});

const aspectRatio = computed(() => {
  const ratio = props.options?.ratio;

  if (!ratio) {
    return undefined;
  }

  const [width, height] = ratio
    .split(":")
    .map((value) => Number(value));

  if (!width || !height) {
    return undefined;
  }

  return `${width} / ${height}`;
});

const containerStyle = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {};

  if (props.width != null && props.width !== "") {
    styles.width =
      typeof props.width === "number"
        ? `${props.width}px`
        : props.width;
  }

  if (props.height != null && props.height !== "") {
    styles.height =
      typeof props.height === "number"
        ? `${props.height}px`
        : props.height;
  } else if (aspectRatio.value) {
    styles.aspectRatio = aspectRatio.value;
  }

  if (props.radius != null && props.radius !== "") {
    styles.borderRadius =
      typeof props.radius === "number"
        ? `${props.radius}px`
        : props.radius;
  }

  if (props.options?.iconColor) {
    styles["--vslk-sk-icon-color"] = props.options.iconColor;
  }

  return styles;
});
</script>

<template>
  <div
    class="vslk-sk-shape vslk-sk-image"
    :style="containerStyle"
  >
    <svg
      v-if="showIcon"
      class="vslk-sk-image__icon"
      :style="{
        width: normalizedIconSize,
        height: normalizedIconSize,
      }"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        ry="2"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <circle
        cx="8.5"
        cy="8.5"
        r="1.5"
        stroke="currentColor"
        stroke-width="1.5"
      />

      <polyline
        points="21 15 16 10 5 21"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>

<style scoped>
.vslk-sk-image {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.vslk-sk-image__icon {
  display: block;
  color: var(--vslk-sk-icon-color, #94a3b8);
  opacity: 0.6;
  flex-shrink: 0;
}
</style>
