<script setup lang="ts">
// auto-imported composable: must be the app's progress, not a fallback
const progress = usePageProgress()
</script>

<template>
  <main>
    <section id="directive" v-skeleton="{ loading: true, delay: 0 }">
      <h2>Card title</h2>
    </section>
    <Skeleton id="skeleton" variant="text" />
    <Spinner id="spinner" />
    <NuxtLink id="to-slow" to="/slow">slow</NuxtLink>
    <p id="progress-state">{{ progress.loading.value ? 'busy' : 'idle' }}</p>
  </main>
</template>
