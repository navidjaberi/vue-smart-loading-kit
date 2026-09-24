<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  size: number;
  color: string;
  speed: number;
}>();

const dotSize = computed(() => props.size / 4);
const duration = computed(() => 1 / props.speed);
const angle = 120; 
const orbitRadius = computed(() => (props.size - dotSize.value) / 2);
const inwardOffset = computed(() => orbitRadius.value * 0.28);
</script>

<template>
  <div
    class="vslk-spinner-orbit-dots"
    :style="{
      width: props.size + 'px',
      height: props.size + 'px',
      animationDuration: duration + 's',
    }"
  >
    <span
      v-for="i in 3"
      :key="i"
      class="holder"
      :style="{
        transform: `rotate(${(i - 1) * angle}deg)`,
      }"
    >
      <span
        class="dot-orbit"
        :style="{
          transform: `translate(-50%, calc(-50% - ${orbitRadius}px))`,
        }"
      >
        <span
          class="dot-core"
          :style="{
            width: dotSize + 'px',
            height: dotSize + 'px',
            backgroundColor: color,
            animationDuration: duration + 's',
            animationDelay: (-(i - 1) * duration) / 3 + 's',
            '--orbit-radius': orbitRadius + 'px',
            '--inward-offset': inwardOffset + 'px',
          }"
        />
      </span>
    </span>
  </div>
</template>

<style scoped>
.vslk-spinner-orbit-dots {
  position: relative;
  display: inline-block;
  border-radius: 999px;
  animation-name: vslk-orbit-dots-rotate;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  max-width: 100%;
  overflow: hidden;
  flex-shrink: 0;
}
.holder {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  transform-origin: 0 0;
}
.dot-orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
}
.dot-core {
  position: absolute;
  left: 50%;
  top: 50%;
  border-radius: 999px;
  transform-origin: center;
  animation-name: vslk-orbit-dots-pulse;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-fill-mode: both; 
}

@keyframes vslk-orbit-dots-rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes vslk-orbit-dots-pulse {
  0%,
  100% {
    transform: translate(
        -50%,
        calc(-50% + (var(--inward-offset) * 0) )
      )
      scale(0.7);
    opacity: 0.45;
  }
  35% {
    transform: translate(
        -50%,
        calc(-50% + var(--inward-offset) /* کمی به سمت مرکز (پایین) */)
      )
      scale(1.4);
    opacity: 1;
  }
  60% {
    transform: translate(-50%, calc(-50% + var(--inward-offset))) scale(1.4);
    opacity: 1;
  }
}
</style>