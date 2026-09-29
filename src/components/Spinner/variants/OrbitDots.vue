<script setup lang="ts">
import { computed } from "vue";
import { scaleSize, toCssSize, toPx } from "../../../utils/size";

interface Props {
  size?: number | string;
  color?: string;
  speed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "#3b82f6",
  speed: 1,
});

const boxSize = computed(() => toCssSize(props.size));
const dotSize = computed(() => scaleSize(props.size, "/", 4));
const duration = computed(() => 1 / (props.speed > 0 ? props.speed : 1));
const angle = 120;

/** (size - dot) / 2, i.e. size * 3/8, and 28% of that for the inward pulse. */
const px = computed(() => toPx(props.size));
const orbitRadius = computed(() =>
  px.value != null
    ? `${(px.value - px.value / 4) / 2}px`
    : `calc(${props.size} * 0.375)`
);
const inwardOffset = computed(() =>
  px.value != null
    ? `${((px.value - px.value / 4) / 2) * 0.28}px`
    : `calc(${props.size} * 0.105)`
);
</script>

<template>
  <div
    class="vslk-spinner-orbit-dots"
    :style="{
      width: boxSize,
      height: boxSize,
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
          transform: `translate(-50%, calc(-50% - ${orbitRadius}))`,
        }"
      >
        <span
          class="dot-core"
          :style="{
            width: dotSize,
            height: dotSize,
            backgroundColor: props.color,
            animationDuration: duration + 's',
            animationDelay: (-(i - 1) * duration) / 3 + 's',
            '--orbit-radius': orbitRadius,
            '--inward-offset': inwardOffset,
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