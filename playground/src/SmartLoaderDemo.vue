<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { SmartLoader, useDelayedLoading } from "vue-smart-loading-kit";

const mode = ref<"replace" | "overlay">("replace");
const delay = ref(200);
const minDuration = ref(500);

const loading = ref(false);
const lastRun = ref<{ ms: number; shown: boolean } | null>(null);

// Same logic SmartLoader uses internally, to report whether the loader showed.
const shown = useDelayedLoading(loading, { delay, minDuration });
let shownThisRun = false;
watch(shown, (v) => {
  if (v) shownThisRun = true;
});

let timer: ReturnType<typeof setTimeout> | undefined;
function request(ms: number) {
  clearTimeout(timer);
  shownThisRun = false;
  loading.value = true;
  timer = setTimeout(() => {
    loading.value = false;
    lastRun.value = { ms, shown: shownThisRun };
  }, ms);
}
onBeforeUnmount(() => clearTimeout(timer));

const users = [
  { name: "Ada Lovelace", role: "Engineer" },
  { name: "Grace Hopper", role: "Rear Admiral" },
  { name: "Alan Turing", role: "Mathematician" },
];

const snippet = computed(() => {
  const lines = ["<SmartLoader", `  :loading="loading"`];
  if (mode.value !== "replace") lines.push(`  mode="${mode.value}"`);
  if (delay.value !== 200) lines.push(`  :delay="${delay.value}"`);
  if (minDuration.value !== 500) lines.push(`  :min-duration="${minDuration.value}"`);
  if (mode.value === "replace") lines.push(`  :skeleton="{ variant: 'list', options: { items: 3 } }"`);
  lines.push(">", "  <UserList :users=\"users\" />", "</SmartLoader>");
  return lines.join("\n");
});
</script>

<template>
  <div class="demo">
    <header class="demo__head">
      <h1>Smart loader</h1>
      <p class="demo__sub">
        Shows a loader only when a load is slow enough to notice, and keeps it up
        long enough to not blink. Try a fast and a slow request.
      </p>
    </header>

    <section class="demo__panel">
      <div class="demo__controls">
        <label>
          <span>mode</span>
          <select v-model="mode">
            <option value="replace">replace (skeleton)</option>
            <option value="overlay">overlay (spinner)</option>
          </select>
        </label>
        <label>
          <span>delay · {{ delay }}ms</span>
          <input v-model.number="delay" type="range" min="0" max="1000" step="50" />
        </label>
        <label>
          <span>minDuration · {{ minDuration }}ms</span>
          <input v-model.number="minDuration" type="range" min="0" max="1500" step="50" />
        </label>
      </div>

      <div class="demo__actions">
        <button class="demo__btn" :disabled="loading" @click="request(100)">Fast request · 100ms</button>
        <button class="demo__btn" :disabled="loading" @click="request(2000)">Slow request · 2s</button>
        <span class="demo__status" aria-live="polite">
          <template v-if="loading">Loading…</template>
          <template v-else-if="lastRun">
            Took {{ lastRun.ms }}ms · loader
            {{ lastRun.shown ? "was shown" : "never appeared (no flash)" }}
          </template>
        </span>
      </div>
    </section>

    <section class="demo__panel demo__stage">
      <SmartLoader
        :loading="loading"
        :mode="mode"
        :delay="delay"
        :min-duration="minDuration"
        :skeleton="{ variant: 'list', options: { items: 3 } }"
        label="Loading users"
      >
        <ul class="users">
          <li v-for="u in users" :key="u.name">
            <span class="users__avatar">{{ u.name[0] }}</span>
            <span>
              <strong>{{ u.name }}</strong>
              <small>{{ u.role }}</small>
            </span>
          </li>
        </ul>
      </SmartLoader>
    </section>

    <section class="demo__panel">
      <pre class="demo__code">{{ snippet }}</pre>
    </section>
  </div>
</template>

<style scoped>
.demo__head h1 {
  margin: 0 0 4px;
  font-size: 24px;
}
.demo__sub {
  margin: 0 0 20px;
  color: var(--muted);
}

.demo__panel {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  margin-bottom: 20px;
  padding: 16px;
}

.demo__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px 20px;
  margin-bottom: 16px;
}
.demo__controls label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}

.demo__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.demo__btn {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 13px;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.demo__btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.demo__status {
  font-size: 13px;
  color: var(--muted);
}

.demo__stage {
  background: var(--bg);
  min-height: 170px;
}

.users {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.users li {
  display: flex;
  align-items: center;
  gap: 12px;
}
.users__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
}
.users strong,
.users small {
  display: block;
}
.users small {
  color: var(--muted);
}

.demo__code {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}
</style>
