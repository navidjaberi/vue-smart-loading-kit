<script setup lang="ts">
import { computed } from 'vue'
import { resolveTrack } from '../track'

interface Props {
  size?: number | string
  color?: string
  speed?: number
  thickness?: number
  track?: boolean | string
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: 'currentColor',
  speed: 1,
  thickness: 4,
  track: true
})

const trackInfo = computed(() => resolveTrack(props.track))

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
    :data-vslk-track="trackInfo?.attr"
    :style="{
      width: formattedSize,
      height: formattedSize,
      color: props.color,
      borderWidth: `${props.thickness}px`,
      borderColor: trackInfo?.color ?? 'transparent',
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
  /* the track color is set inline from the `track` prop */
  border-color: transparent;
  border-radius: 50%;
    animation: vslk-spin linear infinite;
}

@keyframes vslk-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
