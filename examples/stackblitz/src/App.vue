<script setup>
import { ref } from 'vue'
import { usePageProgress } from 'vue-smart-loading-kit'
import UserCard from './UserCard.vue'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const avatar = (color) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect width='48' height='48' fill='%23${color}'/%3E%3C/svg%3E`

const users = [
  { name: 'Ada Lovelace', role: 'Engineer', bio: 'Wrote the first program for a machine that did not exist yet.', avatar: avatar('a78bfa') },
  { name: 'Alan Turing', role: 'Mathematician', bio: 'Asked whether machines can think.', avatar: avatar('fbbf24') },
]

// v-skeleton: your real component becomes its own skeleton
const loading = ref(true)
async function reload() {
  loading.value = true
  await wait(1500)
  loading.value = false
}

// <Skeleton>: ready-made placeholders
// each variant with the props that show it best; try your own
const variants = [
  { variant: 'text', width: '100%', lines: 3 },
  { variant: 'avatar' },
  { variant: 'profile' },
  { variant: 'button' },
  { variant: 'input' },
  { variant: 'image', height: 120 },
  { variant: 'card' },
  { variant: 'list' },
  { variant: 'table' },
  { variant: 'article' },
  { variant: 'grid' },
]
const animation = ref('shimmer')

// <Spinner>
const spinners = ['circle', 'dots', 'pulse', 'bars', 'ring', 'orbit', 'pulse-dots', 'orbit-dots', 'arc']

// <ProgressBar>
const value = ref(40)

// <PageProgress>: the bar at the top of the page
const progress = usePageProgress()
async function request() {
  progress.start()
  await wait(1200)
  progress.done()
}

// <SmartLoader>: no flash for fast loads, no blink for slow ones
const smartLoading = ref(false)
const error = ref(null)
async function load(ms, fail = false) {
  error.value = null
  smartLoading.value = true
  await wait(ms)
  smartLoading.value = false
  if (fail) error.value = 'The server did not answer.'
}
</script>

<template>
  <PageProgress />
  <main>
    <h1>vue-smart-loading-kit</h1>
    <p class="lead">Edit this file and see the result on the right. Each section below is independent.</p>

    <section>
      <h2>v-skeleton</h2>
      <p>Your real component, turned into its own skeleton. Nothing moves.</p>
      <label><input v-model="loading" type="checkbox" /> loading</label>
      <button type="button" @click="reload">Simulate a 1.5s request</button>
      <div class="row">
        <UserCard v-for="u in users" :key="u.name" v-skeleton="loading" :user="u" />
      </div>
    </section>

    <section>
      <h2>&lt;Skeleton&gt;</h2>
      <p>
        Ready-made placeholders, for when there is no real component to skeletonize.
        <select v-model="animation">
          <option>shimmer</option>
          <option>pulse</option>
          <option>none</option>
        </select>
      </p>
      <div class="grid">
        <figure v-for="v in variants" :key="v.variant">
          <Skeleton v-bind="v" :animation="animation" />
          <figcaption>{{ v.variant }}</figcaption>
        </figure>
      </div>
    </section>

    <section>
      <h2>&lt;Spinner&gt;</h2>
      <div class="row">
        <figure v-for="v in spinners" :key="v" class="spinner">
          <Spinner :variant="v" color="#7c3aed" />
          <figcaption>{{ v }}</figcaption>
        </figure>
        <figure class="spinner">
          <Spinner variant="arc" :value="value" color="#7c3aed" track />
          <figcaption>arc, {{ value }}%</figcaption>
        </figure>
      </div>
    </section>

    <section>
      <h2>&lt;ProgressBar&gt;</h2>
      <label><input v-model.number="value" type="range" min="0" max="100" /> {{ value }}%</label>
      <ProgressBar :value="value" color="#7c3aed" class="bar" />
      <p>Without a value it is indeterminate:</p>
      <ProgressBar color="#7c3aed" class="bar" />
    </section>

    <section>
      <h2>&lt;PageProgress&gt;</h2>
      <p>A replacement for NProgress. It follows vue-router when you pass the router to the plugin, and your own tasks through <code>usePageProgress()</code>. Parallel tasks keep it up until the last one ends.</p>
      <button type="button" @click="request">One request</button>
      <button type="button" @click="request(); request(); request()">Three in parallel</button>
    </section>

    <section>
      <h2>&lt;SmartLoader&gt;</h2>
      <p>It waits 200ms before showing anything, then keeps the loader up for at least 500ms.</p>
      <button type="button" @click="load(100)">Fast load (100ms)</button>
      <button type="button" @click="load(1500)">Slow load (1.5s)</button>
      <button type="button" @click="load(800, true)">Failing load</button>
      <SmartLoader :loading="smartLoading" :error="error" :skeleton="{ variant: 'article' }" @retry="load(800)">
        <p class="loaded">Loaded. The fast load never flashed a skeleton.</p>
      </SmartLoader>
    </section>
  </main>
</template>

<style>
:root { color-scheme: light; }
body { font-family: system-ui, sans-serif; margin: 0; color: #0f172a; background: #fff; }
main { max-width: 960px; margin: 0 auto; padding: 24px 16px 64px; }
.lead { color: #64748b; }
section { margin-top: 40px; }
section > h2 { margin-bottom: 4px; }
button, select { margin: 0 8px 8px 0; padding: 6px 12px; font: inherit; }
.row { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
figure { margin: 0; }
figcaption { margin-top: 6px; color: #64748b; font-size: 13px; }
.spinner { display: grid; justify-items: center; width: 80px; }
.bar { margin: 12px 0; }
.loaded { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; }
</style>
