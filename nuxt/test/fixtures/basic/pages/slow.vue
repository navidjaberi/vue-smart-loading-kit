<script setup lang="ts">
await useAsyncData('slow', () => new Promise(resolve => setTimeout(() => resolve(1), 800)))
</script>

<template>
  <h1 id="slow">Slow page</h1>
</template>
