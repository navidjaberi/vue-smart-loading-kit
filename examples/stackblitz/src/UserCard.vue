<script setup>
defineProps({ user: { type: Object, required: true } })
</script>

<template>
  <article class="card">
    <header>
      <img :src="user.avatar" alt="" width="48" height="48" />
      <div>
        <h3>{{ user.name }}</h3>
        <small>{{ user.role }}</small>
      </div>
    </header>
    <p>{{ user.bio }}</p>
    <button type="button">Follow</button>
  </article>
</template>

<style scoped>
.card { width: 300px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; }
header { display: flex; gap: 12px; align-items: center; }
img { border-radius: 50%; }
h3 { margin: 0; font-size: 16px; }
small { color: #64748b; }
p { line-height: 1.5; }
button { padding: 8px 16px; border: 0; border-radius: 8px; background: #7c3aed; color: #fff; }
</style>
