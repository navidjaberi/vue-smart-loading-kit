<script setup lang="ts">
import { ref } from "vue";

const loading = ref(false);
const placeholder = ref(true); // scenario B: fake data while the first load runs

const users = [
  { name: "Ada Lovelace", role: "Engineer", bio: "Wrote the first published algorithm for a machine." },
  { name: "Grace Hopper", role: "Rear Admiral", bio: "Pioneered compilers and popularized machine-independent languages." },
];

/* ---------------- How to use: step-by-step guide ---------------- */
interface Step {
  title: string;
  /** Plain text; `backticks` render as inline code. */
  text: string;
  code: string;
}

const STEPS: Step[] = [
  {
    title: "Register it",
    text: "The plugin registers `v-skeleton` for the whole app. Import the stylesheet once: the skeleton look is pure CSS.",
    code: `// main.ts
import { createApp } from 'vue'
import VueSmartLoadingKit from 'vue-smart-loading-kit'
import 'vue-smart-loading-kit/style.css'
import App from './App.vue'

createApp(App).use(VueSmartLoadingKit).mount('#app')

// Or locally, without the plugin. In <script setup>, an import
// named vSkeleton is available in the template as v-skeleton:
import { vSkeleton } from 'vue-smart-loading-kit'`,
  },
  {
    title: "Render something to skeletonize",
    text: "`v-skeleton` turns what is already on the page into a skeleton. An empty list has nothing to turn into bars, so on the first load render placeholder data with the same shape as the real data, and use `delay: 0` so the fake text is never visible.",
    code: `<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface User { id: number; name: string; role: string; bio: string }

// Fake rows with realistic text lengths: they decide the skeleton's shape
const placeholder: User[] = [1, 2, 3].map((id) => ({
  id: -id,
  name: 'Placeholder name',
  role: 'Job title',
  bio: 'A short bio, about as long as a real one.',
}))

const users = ref<User[]>(placeholder)
const loading = ref(true)

onMounted(async () => {
  try {
    users.value = await fetch('/api/users').then((r) => r.json())
  } catch {
    users.value = []
  } finally {
    loading.value = false
  }
})
<\/script>

<template>
  <ul v-skeleton="{ loading, delay: 0 }">
    <li v-for="u in users" :key="u.id">
      <strong>{{ u.name }}</strong>
      <small>{{ u.role }}</small>
      <p>{{ u.bio }}</p>
    </li>
  </ul>
</template>`,
  },
  {
    title: "Refreshing data you already show",
    text: "When real data is on screen and you reload it, pass just the boolean. The default `delay` (200ms) skips quick refreshes, so they never flash, and a slow one keeps the skeleton for at least `minDuration` (500ms). On a component, it applies to the component's root element.",
    code: `<UserCard v-skeleton="refreshing" :user="user" />

<!-- or with your own timing -->
<UserCard v-skeleton="{ loading: refreshing, delay: 300, minDuration: 600 }" :user="user" />`,
  },
  {
    title: "Fine-tune single elements",
    text: "Most content needs nothing. Use `data-skeleton` where the automatic result isn't what you want: `ignore` keeps an element as it is, `block` turns it into one solid block, `text` forces line bars.",
    code: `<article v-skeleton="loading">
  <h2 data-skeleton="ignore">Team</h2>            <!-- stays visible -->
  <span class="avatar" data-skeleton="block">AL</span> <!-- initials: one solid block -->
  <canvas data-skeleton="block" />                <!-- charts: one solid block -->
  <p>{{ user.bio }}</p>                           <!-- automatic: one bar per line -->
</article>`,
  },
  {
    title: "Add an error state with SmartLoader",
    text: "`SmartLoader` with `mode=\"skeletonize\"` does the same, plus an error message with a retry button and a screen-reader announcement.",
    code: `<SmartLoader
  :loading="loading"
  :error="error"
  mode="skeletonize"
  :delay="0"
  label="Loading users"
  @retry="load"
>
  <UserList :users="users" />
</SmartLoader>`,
  },
  {
    title: "Change the look for the whole app",
    text: "Colors and animation come from the `skeleton` section of the plugin options, and the default timing from `smartLoader`.",
    code: `app.use(VueSmartLoadingKit, {
  skeleton: { color: '#e2e8f0', animation: 'pulse', speed: 1.5 },
  smartLoader: { delay: 300 },
})`,
  },
];

/** Splits "use `x` here" into text and code parts. */
function parts(text: string) {
  return text.split("`").map((value, i) => ({ value, code: i % 2 === 1 }));
}

const copiedStep = ref<number | null>(null);
async function copyStep(index: number) {
  try {
    await navigator.clipboard.writeText(STEPS[index]!.code);
    copiedStep.value = index;
    setTimeout(() => (copiedStep.value = null), 1200);
  } catch {
    copiedStep.value = null;
  }
}
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

    <section class="guide" aria-labelledby="guide-title">
      <h2 id="guide-title" class="guide__title">How to use it</h2>
      <ol class="guide__steps">
        <li v-for="(step, i) in STEPS" :key="step.title" class="guide__step">
          <h3>{{ step.title }}</h3>
          <p>
            <template v-for="(part, j) in parts(step.text)" :key="j">
              <code v-if="part.code">{{ part.value }}</code>
              <template v-else>{{ part.value }}</template>
            </template>
          </p>
          <div class="guide__code">
            <button type="button" class="guide__copy" @click="copyStep(i)">
              {{ copiedStep === i ? "Copied" : "Copy" }}
            </button>
            <pre>{{ step.code }}</pre>
          </div>
        </li>
      </ol>
    </section>
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
.guide { margin-top: 40px; border-top: 1px solid var(--line); padding-top: 24px; }
.guide__title { font-size: 20px; margin: 0 0 16px; }
.guide__steps { list-style: none; margin: 0; padding: 0; counter-reset: step; display: flex; flex-direction: column; gap: 28px; }
.guide__step { counter-increment: step; position: relative; padding-left: 40px; min-width: 0; }
.guide__step::before {
  content: counter(step); position: absolute; left: 0; top: 0;
  width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  background: var(--accent); color: #fff; font-size: 13px; font-weight: 600;
}
.guide__step h3 { font-size: 15px; margin: 2px 0 6px; }
.guide__step p { margin: 0 0 10px; color: var(--muted); max-width: 70ch; line-height: 1.6; }
.guide__step p code { color: var(--fg); background: var(--panel); border: 1px solid var(--line); border-radius: 4px; padding: 0 4px; font-size: 12px; }
.guide__code { position: relative; border: 1px solid var(--line); border-radius: 10px; background: var(--panel); min-width: 0; }
.guide__code pre {
  margin: 0; padding: 14px; overflow-x: auto; color: var(--fg);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.55;
}
.guide__copy {
  position: absolute; top: 8px; right: 8px; border: 1px solid var(--line); background: var(--bg);
  color: inherit; font: inherit; font-size: 12px; padding: 3px 9px; border-radius: 999px; cursor: pointer;
}
</style>
