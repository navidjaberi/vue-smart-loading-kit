<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { usePageProgress } from "vue-smart-loading-kit";

const progress = usePageProgress();
const running = ref(0);
const log = ref<string[]>([]);
const timers = new Set<ReturnType<typeof setTimeout>>();

function task(name: string, ms: number) {
  progress.start();
  running.value++;
  const started = performance.now();
  const t = setTimeout(() => {
    timers.delete(t);
    progress.done();
    running.value--;
    log.value = [`${name} finished after ${Math.round(performance.now() - started)}ms`, ...log.value].slice(0, 5);
  }, ms);
  timers.add(t);
}

function parallel() {
  task("Request A", 800);
  task("Request B", 1600);
  task("Request C", 2400);
}

onBeforeUnmount(() => timers.forEach(clearTimeout));

const setup = `// main.ts
app.use(VueSmartLoadingKit, { router })   // follows every navigation

// App.vue, once
<PageProgress />

// anywhere else, for your own tasks
const progress = usePageProgress()
progress.start()
await fetchData()
progress.done()`;
</script>

<template>
  <div class="demo">
    <header class="demo__head">
      <h1>Page progress</h1>
      <p class="demo__sub">
        A thin bar at the very top of the page, like the ones on GitHub or YouTube. It
        follows route changes and any task you start. Watch the top edge of this window.
      </p>
    </header>

    <section class="demo__panel">
      <div class="demo__actions">
        <button class="demo__btn" @click="task('Fast task', 100)">Fast task · 100ms</button>
        <button class="demo__btn" @click="task('Slow task', 2000)">Slow task · 2s</button>
        <button class="demo__btn" @click="parallel">3 parallel requests</button>
      </div>
      <p class="demo__status" aria-live="polite">
        Running: {{ running }}
        <template v-if="running === 0 && log.length"> · the fast task never shows the bar</template>
      </p>
      <ul class="demo__log">
        <li v-for="(line, i) in log" :key="i + line">{{ line }}</li>
      </ul>
    </section>

    <section class="demo__panel">
      <pre class="demo__code">{{ setup }}</pre>
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
.demo__actions {
  display: flex;
  flex-wrap: wrap;
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
.demo__status {
  margin: 14px 0 6px;
  min-height: 1.5em;
  font-size: 13px;
  color: var(--muted);
}
.demo__log {
  margin: 0;
  padding-left: 18px;
  font-size: 12px;
  color: var(--muted);
  min-height: 7.5em;
}
.demo__code {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}
</style>
