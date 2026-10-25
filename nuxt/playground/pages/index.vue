<script setup lang="ts">
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 1500))
</script>

<template>
  <main>
    <h1>nuxt-smart-loading-kit</h1>

    <article v-skeleton="loading" class="card">
      <img src="https://picsum.photos/seed/vslk/80" width="80" height="80" alt="">
      <h2>Real component, real layout</h2>
      <p>While loading, v-skeleton turns this card into its own skeleton.</p>
      <button type="button">Follow</button>
    </article>

    <Skeleton variant="profile" />
    <Spinner variant="orbit-dots" />
    <ProgressBar :value="40" />
  </main>
</template>

<style>
.card { display: grid; gap: 8px; max-width: 360px; padding: 16px; border: 1px solid #ddd; border-radius: 12px; }
</style>
