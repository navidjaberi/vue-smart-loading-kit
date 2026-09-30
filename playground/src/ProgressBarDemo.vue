<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from "vue";
import { ProgressBar } from "vue-smart-loading-kit";

const c = reactive({
  determinate: true,
  value: 40,
  color: "#7c3aed",
  thickness: 6,
  track: "on" as "on" | "off" | "custom",
  trackColor: "#e5e7eb",
  speed: 1,
  label: "",
});

const trackValue = computed(() => ({ on: true, off: false, custom: c.trackColor })[c.track]);

const snippet = computed(() => {
  const lines = ["<ProgressBar"];
  if (c.determinate) lines.push(`  :value="${c.value}"`);
  lines.push(`  color="${c.color}"`);
  if (c.thickness !== 4) lines.push(`  :thickness="${c.thickness}"`);
  if (c.track === "off") lines.push(`  :track="false"`);
  if (c.track === "custom") lines.push(`  track="${c.trackColor}"`);
  if (!c.determinate && c.speed !== 1) lines.push(`  :speed="${c.speed}"`);
  if (c.label) lines.push(`  label="${c.label}"`);
  lines.push("/>");
  return lines.join("\n");
});

/* ---- example: simulated uploads ---- */
const files = ref([
  { name: "report.pdf", progress: 0 },
  { name: "photo.jpg", progress: 0 },
  { name: "data.csv", progress: 0 },
]);
let tick: ReturnType<typeof setInterval> | undefined;
function upload() {
  clearInterval(tick);
  files.value.forEach((f) => (f.progress = 0));
  tick = setInterval(() => {
    files.value.forEach((f, i) => {
      f.progress = Math.min(100, f.progress + 3 + i * 2 + Math.random() * 4);
    });
    if (files.value.every((f) => f.progress >= 100)) clearInterval(tick);
  }, 120);
}
onBeforeUnmount(() => clearInterval(tick));
</script>

<template>
  <div class="demo">
    <header class="demo__head">
      <h1>Progress bar</h1>
      <p class="demo__sub">
        A linear progress indicator. Give it a value (0–100) to show how far a task has
        got, or leave it out for a sliding "working on it" bar.
      </p>
    </header>

    <section class="demo__panel demo__preview">
      <ProgressBar
        :value="c.determinate ? c.value : undefined"
        :color="c.color"
        :thickness="c.thickness"
        :track="trackValue"
        :speed="c.speed"
        :label="c.label || undefined"
      />
    </section>

    <section class="demo__panel">
      <div class="demo__controls">
        <label class="demo__check">
          <input v-model="c.determinate" type="checkbox" />
          <span>determinate</span>
        </label>
        <label v-if="c.determinate">
          <span>value · {{ c.value }}%</span>
          <input v-model.number="c.value" type="range" min="0" max="100" />
        </label>
        <label v-else>
          <span>speed · {{ c.speed }}</span>
          <input v-model.number="c.speed" type="range" min="0.2" max="4" step="0.1" />
        </label>
        <label>
          <span>color</span>
          <input v-model="c.color" type="color" />
        </label>
        <label>
          <span>thickness · {{ c.thickness }}px</span>
          <input v-model.number="c.thickness" type="range" min="1" max="16" />
        </label>
        <label>
          <span>track</span>
          <select v-model="c.track">
            <option value="on">on</option>
            <option value="off">off</option>
            <option value="custom">custom color</option>
          </select>
        </label>
        <label v-if="c.track === 'custom'">
          <span>track color</span>
          <input v-model="c.trackColor" type="color" />
        </label>
        <label>
          <span>label (a11y)</span>
          <input v-model="c.label" type="text" placeholder="e.g. Uploading" />
        </label>
      </div>
      <pre class="demo__code">{{ snippet }}</pre>
    </section>

    <h2 class="demo__h2">Examples</h2>

    <section class="demo__panel">
      <p class="demo__label">Page loading bar — thin, pinned to the top</p>
      <div class="frame">
        <ProgressBar class="frame__bar" :thickness="3" :track="false" color="#7c3aed" />
        <div class="frame__body">
          <div class="frame__line" />
          <div class="frame__line frame__line--short" />
        </div>
      </div>
    </section>

    <section class="demo__panel">
      <div class="demo__row">
        <p class="demo__label">File uploads</p>
        <button class="demo__btn" @click="upload">Upload</button>
      </div>
      <ul class="files">
        <li v-for="f in files" :key="f.name">
          <span class="files__name">{{ f.name }}</span>
          <ProgressBar :value="f.progress" :thickness="4" :label="`Uploading ${f.name}`" />
          <span class="files__pct">{{ Math.round(f.progress) }}%</span>
        </li>
      </ul>
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
.demo__h2 {
  font-size: 16px;
  margin: 28px 0 12px;
}

.demo__panel {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  margin-bottom: 20px;
  padding: 16px;
}
.demo__preview {
  background: var(--bg);
  padding: 32px 24px;
}

.demo__controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
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
.demo__controls .demo__check {
  flex-direction: row;
  align-items: center;
}

.demo__code {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}

.demo__label {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--muted);
}
.demo__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.demo__row .demo__label {
  margin: 0;
}
.demo__btn {
  border: 1px solid var(--accent);
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.frame {
  position: relative;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--bg);
  overflow: hidden;
}
.frame__bar {
  position: absolute;
  top: 0;
  left: 0;
}
.frame__body {
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.frame__line {
  height: 10px;
  border-radius: 5px;
  background: var(--line);
}
.frame__line--short {
  width: 60%;
}

.files {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.files li {
  display: grid;
  grid-template-columns: 90px 1fr 40px;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.files__pct {
  text-align: right;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
</style>
