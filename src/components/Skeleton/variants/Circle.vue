<!-- src/components/skeleton/variants/Circle.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { SkeletonBaseProps } from '../types'

const props = defineProps<SkeletonBaseProps>()

const s = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  if (typeof props.width === 'number') return `${props.width}px`
  if (typeof props.height === 'number') return `${props.height}px`
  return '40px'
})
</script>

<template>
   <div class="vslk-sk-shape" :style="{ width: s, height: s, borderRadius: '50%' }" />

</template>
