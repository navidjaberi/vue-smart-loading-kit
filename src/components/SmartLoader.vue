<template>
    <div>
      <slot v-if="!loading"></slot>
  
      <slot
        v-else
        name="loading"
      >
        <Skeleton width="100%" height="20px" />
      </slot>
    </div>
  </template>
  
  <script setup lang="ts">
  import Skeleton from './Skeleton.vue'
  
  defineProps<{
    loading: boolean
  }>()
  </script>
  