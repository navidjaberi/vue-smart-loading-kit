<script setup lang="ts">
// the route waits for this, so <PageProgress> shows during the navigation
const { data } = await useAsyncData('slow', () => new Promise<string>(resolve => setTimeout(() => resolve('Loaded after 1.2s'), 1200)))
</script>

<template>
  <main>
    <h1>{{ data }}</h1>
  </main>
</template>
