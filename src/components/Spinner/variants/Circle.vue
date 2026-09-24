<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: number | string
  color?: string
  speed?: number
  thickness?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: '#3b82f6',
  speed: 1,
  thickness: 4
})

const formattedSize = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})

const formattedDuration = computed(() => {
  const duration = props.speed > 0 ? 1 / props.speed : 1
  return `${duration}s`
})
</script>

<template>
  <div
    class="vslk-spinner-circle"
    :style="{
      width: formattedSize,
      borderWidth: `${props.thickness}px`,
      borderTopColor: props.color,
      animationDuration: formattedDuration,
    }"
  />
</template>

<style scoped>
.vslk-spinner-circle {
  aspect-ratio: 1 / 1;
  max-width: 100%;
  box-sizing: border-box;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
    animation: vslk-spin linear infinite;
}

@keyframes vslk-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
