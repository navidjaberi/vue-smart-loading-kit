<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: string | number;
  color?: string;
  speed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "#3b82f6",
  speed: 1,
});

const containerHeight = computed(() => {
  return typeof props.size === "number"
    ? `${props.size}px`
    : props.size;
});

const numericSize = computed(() => {
  return typeof props.size === "number"
    ? props.size
    : parseInt(props.size, 10) || 40;
});

const barWidth = computed(() => `${numericSize.value / 8}px`);
const gapSize = computed(() => `${numericSize.value / 10}px`);

const duration = computed(() => {
  const safeSpeed =
    Number.isFinite(props.speed) && props.speed > 0
      ? props.speed
      : 1;

  return 1 / safeSpeed;
});

const formattedDuration = computed(() => `${duration.value}s`);

const getAnimationDelay = (index: number) => {
  return `${index * duration.value * 0.1}s`;
};
</script>

<template>
  <div
    class="v-spinner-bars"
    :style="{
      height: containerHeight,
      gap: gapSize,
    }"
  >
    <span
      v-for="n in 5"
      :key="n"
      :style="{
        width: barWidth,
        backgroundColor: props.color,
        animationDuration: formattedDuration,
        animationDelay: getAnimationDelay(n - 1),
      }"
    />
  </div>
</template>

<style scoped>
.v-spinner-bars {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-spinner-bars span {
  height: 100%;
  border-radius: 999px;
  animation-name: vslk-bars;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes vslk-bars {
  0%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.4;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
