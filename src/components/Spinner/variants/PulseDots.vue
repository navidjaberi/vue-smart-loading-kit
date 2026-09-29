<script setup lang="ts">
import { computed } from 'vue'
import { scaleSize, toCssSize } from '../../../utils/size'

interface Props {
  size?: number | string
  color?: string
  speed?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: '#3b82f6',
  speed: 1,
})

const boxSize = computed(() => toCssSize(props.size))
const dotSize = computed(() => scaleSize(props.size, '/', 5))

const duration = computed(() => {
  const speed = props.speed > 0 ? props.speed : 1
  return 1 / speed
})
</script>

<template>
  <div
    class="vslk-pulse-orbit"
    :style="{
      width: boxSize,
      height: boxSize
    }"
  >
    <span
      v-for="i in 3"
      :key="i"
      class="dot"
      :style="{
        width: dotSize,
        height: dotSize,
        backgroundColor: props.color,
        animationDuration: duration + 's',
        animationDelay: ((i - 1) * duration / 3) + 's'
      }"
    />
  </div>
</template>

<style scoped>
.vslk-pulse-orbit {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16%;
}

/* سه نقطه روی یک خط افقی، با فاصله نسبی */
.dot {
  flex: 0 0 auto;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  transform-origin: center;
  animation-name: vslk-pulse-orbit-pulse;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  will-change: transform;
}

@keyframes vslk-pulse-orbit-pulse {
  0% {
    transform: translateY(-25%) scale(0.7);
    opacity: 0.5;
  }
  35% {
    transform: translateY(10%) scale(1.35);
    opacity: 1;
  }
  60% {
    transform: translateY(10%) scale(1.35);
    opacity: 1;
  }
  100% {
    transform: translateY(-25%) scale(0.7);
    opacity: 0.5;
  }
}
</style>