<script setup lang="ts">
import { ref } from "vue";

const loading = ref(false);
const placeholder = ref(true); // scenario B: fake data while the first load runs

const users = [
  { name: "Ada Lovelace", role: "Engineer", bio: "Wrote the first published algorithm for a machine." },
  { name: "Grace Hopper", role: "Rear Admiral", bio: "Pioneered compilers and popularized machine-independent languages." },
];
</script>

<template>
  <div class="demo">
    <header>
      <h1>Skeletonize</h1>
      <p class="demo__sub">
        <code>v-skeleton</code> turns the real content below into a skeleton with the exact same
        layout. Nothing is hand-built, and nothing moves.
      </p>
    </header>

    <label class="demo__check"><input v-model="loading" type="checkbox" /> loading</label>

    <div class="cards">
      <article
        v-for="u in users"
        :key="u.name"
        v-skeleton="{ loading, delay: 0 }"
        class="card"
      >
        <div class="card__head">
          <!-- a few characters on a colored shape: mark it as one block -->
          <span class="card__avatar" data-skeleton="block">{{ u.name[0] }}</span>
          <div>
            <strong>{{ u.name }}</strong>
            <small>{{ u.role }}</small>
          </div>
        </div>
        <p>{{ u.bio }}</p>
        <p class="card__static" data-skeleton="ignore">This line has data-skeleton="ignore".</p>
        <button type="button">Follow</button>
      </article>
    </div>

    <h2 class="demo__h2">Placeholder data (first load)</h2>
    <label class="demo__check"><input v-model="placeholder" type="checkbox" /> first load running</label>
    <ul v-skeleton="{ loading: placeholder, delay: 0 }" class="rows">
      <li v-for="n in 3" :key="n">Placeholder row number {{ n }} with some text</li>
    </ul>
  </div>
</template>

<style scoped>
.demo__sub { color: var(--muted); margin: 0 0 16px; }
.demo__h2 { font-size: 16px; margin: 28px 0 8px; }
.demo__check { display: inline-flex; gap: 6px; align-items: center; font-size: 13px; margin-bottom: 14px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.card { border: 1px solid var(--line); border-radius: 12px; padding: 16px; background: var(--bg); display: flex; flex-direction: column; gap: 10px; }
.card__head { display: flex; gap: 10px; align-items: center; }
.card__head strong, .card__head small { display: block; }
.card__avatar { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--accent); color: #fff; font-weight: 600; }
.card p { margin: 0; }
.card__static { font-size: 12px; color: var(--muted); }
.card button { align-self: flex-start; border: 0; border-radius: 8px; background: var(--accent); color: #fff; padding: 6px 14px; font: inherit; }
.rows { border: 1px solid var(--line); border-radius: 10px; padding: 12px 28px; margin: 0; background: var(--bg); display: flex; flex-direction: column; gap: 8px; }
</style>
