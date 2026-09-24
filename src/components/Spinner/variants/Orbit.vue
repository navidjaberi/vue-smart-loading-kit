<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: number | string;
  color?: string;
  speed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  color: "#41B780",
  speed: 1,
});

const numericSize = computed(() => {
  return typeof props.size === "number"
    ? props.size
    : parseInt(props.size) || 48;
});

const dotSize = computed(() => numericSize.value * 0.16);
const ringSize = computed(() => numericSize.value);
const radius = computed(() => (ringSize.value - dotSize.value) / 2);

const duration = computed(() => {
  const safeSpeed =
    Number.isFinite(props.speed) && props.speed > 0 ? props.speed : 1;

  return `${1 / safeSpeed}s`;
});

const orbitStyle = computed(() => ({
  width: `${ringSize.value}px`,
  height: `${ringSize.value}px`,
  "--vslk-size": `${ringSize.value}px`,
  "--vslk-dot-size": `${dotSize.value}px`,
  "--vslk-radius": `${radius.value}px`,
  "--vslk-color": props.color,
  "--vslk-duration": duration.value,
}));
</script>

<template>
  <div class="vslk-orbit" :style="orbitStyle">
    <div class="vslk-orbit-ring"></div>

    <div class="vslk-orbit-rotator">
      <span class="vslk-orbit-dot"></span>
    </div>
  </div>
</template>

<style scoped>
.vslk-orbit {
  position: relative;
  display: inline-block;
  width: var(--vslk-size);
  height: var(--vslk-size);
  flex-shrink: 0;
}

.vslk-orbit-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(65, 183, 128, 0.2);
  box-sizing: border-box;
}

.vslk-orbit-rotator {
  position: absolute;
  inset: 0;
  animation: vslk-orbit-rotate var(--vslk-duration) linear infinite;
  transform-origin: center;
}

.vslk-orbit-dot {
  position: absolute;
  width: var(--vslk-dot-size);
  height: var(--vslk-dot-size);
  border-radius: 50%;
  background: var(--vslk-color);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translateY(calc(var(--vslk-radius) * -1));
  animation: vslk-orbit-pulse var(--vslk-duration) ease-in-out infinite;
  will-change: transform;
  aspect-ratio: 1;
}

@keyframes vslk-orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes vslk-orbit-pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(calc(var(--vslk-radius) * -1))
      scale(0.8);
    opacity: 0.7;
  }

  50% {
    transform: translate(-50%, -50%) translateY(calc(var(--vslk-radius) * -1))
      scale(1.15);
    opacity: 1;
  }
}
</style>
