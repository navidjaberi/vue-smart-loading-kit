<!-- src/components/skeleton/variants/Circle.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { SkeletonBaseProps } from '../types'
import { toCssSize } from '../../../utils/size'

const props = defineProps<SkeletonBaseProps>()

/** A circle has one dimension: the first of size → width → height. */
const s = computed(() => toCssSize(props.size ?? props.width ?? props.height ?? 40))
</script>

<template>
   <div class="vslk-sk-shape" :style="{ width: s, height: s, borderRadius: '50%' }" />

</template>
