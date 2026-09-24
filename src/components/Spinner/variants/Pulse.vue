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

const formattedSize = computed(() => {
  return typeof props.size === "number"
    ? `${props.size}px`
    : props.size;
});

const formattedDuration = computed(() => {
  const safeSpeed =
    Number.isFinite(props.speed) && props.speed > 0
      ? props.speed
      : 1;

  return `${1 / safeSpeed}s`;
});

const pulseStyle = computed(() => ({
  width: formattedSize.value,
  height: formattedSize.value,
  "--vslk-pulse-color": props.color,
  "--vslk-pulse-duration": formattedDuration.value,
}));
</script>

<template>
  <div class="vslk-spinner-pulse" :style="pulseStyle">
    <span class="vslk-spinner-pulse__wave" />
    <span class="vslk-spinner-pulse__core" />
  </div>
</template>

<style scoped>
.vslk-spinner-pulse {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
}

.vslk-spinner-pulse__core {
  position: absolute;
  width: 38%;
  height: 38%;
  border-radius: 50%;
  background-color: var(--vslk-pulse-color);
  animation: vslk-pulse-core var(--vslk-pulse-duration)
    ease-in-out infinite;
}

.vslk-spinner-pulse__wave {
  position: absolute;
  width: 38%;
  height: 38%;
  box-sizing: border-box;
  border: 2px solid var(--vslk-pulse-color);
  border-radius: 50%;
  animation: vslk-pulse-wave var(--vslk-pulse-duration)
    ease-out infinite;
}

@keyframes vslk-pulse-core {
  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

@keyframes vslk-pulse-wave {
  0% {
    transform: scale(0.7);
    opacity: 0.9;
  }

  70%,
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}
</style>
