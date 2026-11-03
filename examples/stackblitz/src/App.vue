<script setup>
import { ref } from 'vue'
import UserCard from './UserCard.vue'

const avatar = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23${color}'/%3E%3C/svg%3E`

const users = [
  { name: 'Ada Lovelace', role: 'Engineer', bio: 'Wrote the first program for a machine that did not exist yet.', avatar: avatar('a78bfa') },
  { name: 'Alan Turing', role: 'Mathematician', bio: 'Asked whether machines can think.', avatar: avatar('fbbf24') },
]

const loading = ref(true)
const reload = () => {
  loading.value = true
  setTimeout(() => (loading.value = false), 1500)
}
</script>

<template>
  <main>
    <h1>v-skeleton</h1>
    <p>Your real component, turned into its own skeleton. Nothing moves.</p>
    <label><input v-model="loading" type="checkbox" /> loading</label>
    <button type="button" @click="reload">Simulate a 1.5s request</button>

    <div class="cards">
      <UserCard v-for="u in users" :key="u.name" v-skeleton="loading" :user="u" />
    </div>

    <h2>SmartLoader</h2>
    <SmartLoader :loading="loading">
      <p>Loaded. Fast loads never flash a spinner; slow ones never blink.</p>
    </SmartLoader>
  </main>
</template>

<style>
body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
main > label { margin-right: 12px; }
.cards { display: flex; flex-wrap: wrap; gap: 16px; margin: 24px 0; }
</style>
