<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { PageProgress, Skeleton, Spinner } from "vue-smart-loading-kit";
import type { SkeletonVariantName, SpinnerVariantName } from "vue-smart-loading-kit";
import SmartLoaderDemo from "./SmartLoaderDemo.vue";
import ProgressBarDemo from "./ProgressBarDemo.vue";
import PageProgressDemo from "./PageProgressDemo.vue";

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

type Ctl =
  | {
      key: string;
      label: string;
      type: "number";
      min: number;
      max: number;
      step?: number;
      def: number;
    }
  | { key: string; label: string; type: "bool"; def: boolean }
  | { key: string; label: string; type: "text"; def: string }
  | { key: string; label: string; type: "select"; opts: string[]; def: string };

/** `props` controls bind to top-level props, `options` controls go into :options */
type VariantDef = {
  name: string;
  blurb: string;
  props?: Ctl[];
  options?: Ctl[];
  /** extra hand-written scenarios worth eyeballing for this variant */
  notes?: string[];
};

const SKELETONS: Record<SkeletonVariantName, VariantDef> = {
  block: {
    name: "Block",
    blurb: "A plain rectangle. The primitive most other variants build on.",
    props: [
      { key: "width", label: "width", type: "text", def: "200px" },
      { key: "height", label: "height", type: "text", def: "50px" },
      { key: "radius", label: "radius", type: "text", def: "4px" },
    ],
  },
  text: {
    name: "Text",
    blurb: "One line, or a multi-line paragraph with a shorter last line.",
    props: [
      { key: "lines", label: "lines", type: "number", min: 1, max: 10, def: 3 },
      { key: "width", label: "width", type: "text", def: "240px" },
      { key: "height", label: "height", type: "text", def: "14px" },
    ],
    options: [
      { key: "gap", label: "gap", type: "number", min: 0, max: 32, def: 8 },
      { key: "lastLineWidth", label: "lastLineWidth", type: "text", def: "60%" },
    ],
  },
  circle: {
    name: "Circle",
    blurb: "A plain circle.",
    props: [
      { key: "size", label: "size", type: "number", min: 8, max: 200, def: 64 },
    ],
  },
  button: {
    name: "Button",
    blurb: "Button placeholder. Defaults to 120×40.",
    props: [
      { key: "width", label: "width", type: "text", def: "120px" },
      { key: "height", label: "height", type: "text", def: "40px" },
      { key: "radius", label: "radius", type: "text", def: "8px" },
    ],
  },
  avatar: {
    name: "Avatar",
    blurb: "Circular by default; set radius for a rounded square.",
    props: [
      { key: "size", label: "size", type: "number", min: 16, max: 200, def: 56 },
      { key: "radius", label: "radius", type: "text", def: "9999px" },
    ],
  },
  input: {
    name: "Input",
    blurb: "Form field placeholder. Defaults to 100% × 44px.",
    props: [
      { key: "width", label: "width", type: "text", def: "100%" },
      { key: "height", label: "height", type: "text", def: "44px" },
      { key: "radius", label: "radius", type: "text", def: "10px" },
    ],
  },
  image: {
    name: "Image",
    blurb: "Aspect-ratio-aware image placeholder with an optional icon.",
    props: [
      { key: "width", label: "width", type: "text", def: "100%" },
      { key: "height", label: "height (overrides ratio)", type: "text", def: "" },
      { key: "radius", label: "radius", type: "text", def: "8px" },
    ],
    options: [
      { key: "ratio", label: "ratio", type: "select", opts: ["16:9", "4:3", "1:1", "21:9", "3:4", "9:16"], def: "16:9" },
      { key: "icon", label: "icon", type: "bool", def: true },
      { key: "iconSize", label: "iconSize", type: "number", min: 8, max: 128, def: 40 },
      { key: "iconColor", label: "iconColor", type: "text", def: "" },
    ],
    notes: ["Set a height to override the aspect ratio, or leave it empty to size by ratio."],
  },
  profile: {
    name: "Profile",
    blurb: "Avatar plus a few text lines — comment rows, user cards.",
    options: [
      { key: "avatarSize", label: "avatarSize", type: "number", min: 16, max: 128, def: 56 },
      { key: "lines", label: "lines", type: "number", min: 1, max: 6, def: 2 },
      { key: "lineHeight", label: "lineHeight", type: "number", min: 4, max: 32, def: 10 },
    ],
    notes: ["The avatar keeps its size and stays round; the text lines take the remaining width."],
  },
  card: {
    name: "Card",
    blurb: "Three layouts: image (vertical), simple (no media), horizontal.",
    props: [
      { key: "width", label: "width", type: "number", min: 160, max: 720, def: 320 },
    ],
    options: [
      { key: "layout", label: "layout", type: "select", opts: ["image", "simple", "horizontal"], def: "image" },
      { key: "lines", label: "lines", type: "number", min: 1, max: 8, def: 3 },
      { key: "imageHeight", label: "imageHeight", type: "number", min: 60, max: 400, def: 180 },
      { key: "mediaWidth", label: "mediaWidth", type: "number", min: 40, max: 240, def: 120 },
      { key: "titleWidth", label: "titleWidth", type: "text", def: "72%" },
      { key: "radius", label: "radius", type: "text", def: "14px" },
      { key: "borderWidth", label: "borderWidth", type: "text", def: "1px" },
    ],
    notes: ["In the horizontal layout the media block stays square, even in a narrow container."],
  },
  article: {
    name: "Article",
    blurb: "Title plus multiple multi-line paragraphs.",
    options: [
      { key: "paragraphs", label: "paragraphs", type: "number", min: 1, max: 6, def: 2 },
      { key: "linesPerParagraph", label: "linesPerParagraph", type: "number", min: 2, max: 10, def: 4 },
      { key: "titleWidth", label: "titleWidth", type: "text", def: "70%" },
      { key: "paragraphGap", label: "paragraphGap", type: "number", min: 0, max: 48, def: 20 },
      { key: "lineGap", label: "lineGap", type: "number", min: 0, max: 24, def: 8 },
    ],
  },
  table: {
    name: "Table",
    blurb: "Full data table with optional header and a flexible pagination footer.",
    options: [
      { key: "rows", label: "rows", type: "number", min: 1, max: 12, def: 5 },
      { key: "columns", label: "columns", type: "number", min: 1, max: 12, def: 4 },
      { key: "minColumnWidth", label: "minColumnWidth", type: "number", min: 0, max: 240, def: 0 },
      { key: "cellWidths", label: "cellWidths (uniform by default)", type: "text", def: "80%" },
      { key: "gridLines", label: "gridLines", type: "bool", def: true },
      { key: "align", label: "align", type: "select", opts: ["left", "center", "right"], def: "left" },
      { key: "padding", label: "padding", type: "number", min: 0, max: 32, def: 12 },
      { key: "header", label: "header", type: "bool", def: false },
      { key: "footer", label: "footer", type: "bool", def: false },
      { key: "footerLabel", label: "footerLabel", type: "bool", def: true },
      { key: "footerLabelWidth", label: "footerLabelWidth", type: "number", min: 40, max: 240, def: 110 },
      { key: "footerItems", label: "footerItems", type: "number", min: 0, max: 8, def: 3 },
      { key: "footerControlWidth", label: "footerControlWidth", type: "number", min: 16, max: 80, def: 28 },
      { key: "footerControlRadius", label: "footerControlRadius", type: "number", min: 0, max: 40, def: 6 },
      { key: "footerAlign", label: "footerAlign", type: "select", opts: ["between", "start", "end"], def: "between" },
    ],
    notes: [
      "Set minColumnWidth to keep columns readable: narrow containers scroll horizontally instead of squashing.",
      "Leave minColumnWidth at 0 to squash columns to fit. Try both with the width slider on the preview.",
      "align positions each bar inside its cell.",
    ],
  },
  list: {
    name: "List",
    blurb: "Rows with a dot marker and title/subtitle lines.",
    options: [
      { key: "items", label: "items", type: "number", min: 1, max: 10, def: 4 },
      { key: "lines", label: "lines", type: "number", min: 0, max: 5, def: 2 },
      { key: "dot", label: "dot", type: "bool", def: true },
      { key: "dotSize", label: "dotSize", type: "number", min: 2, max: 32, def: 8 },
      { key: "divider", label: "divider", type: "bool", def: false },
      { key: "titleWidth", label: "titleWidth", type: "text", def: "68%" },
      { key: "subtitleWidth", label: "subtitleWidth", type: "text", def: "52%" },
      { key: "itemGap", label: "itemGap", type: "number", min: 0, max: 40, def: 12 },
    ],
    notes: ["Dividers appear only between items, never after the last one."],
  },
  grid: {
    name: "Grid",
    blurb: "Fixed columns, or fully fluid via minItemWidth + auto-fit.",
    options: [
      { key: "columns", label: "columns (fixed mode)", type: "number", min: 1, max: 12, def: 3 },
      { key: "rows", label: "rows (fixed mode)", type: "number", min: 1, max: 6, def: 2 },
      { key: "minItemWidth", label: "minItemWidth (0 = fixed mode)", type: "number", min: 0, max: 400, def: 0 },
      { key: "itemCount", label: "itemCount (auto-fit mode)", type: "number", min: 1, max: 24, def: 8 },
      { key: "gap", label: "gap", type: "number", min: 0, max: 48, def: 16 },
      { key: "itemHeight", label: "itemHeight", type: "number", min: 40, max: 320, def: 140 },
      { key: "itemRadius", label: "itemRadius", type: "number", min: 0, max: 40, def: 12 },
    ],
    notes: ["Set minItemWidth to make the grid fluid: the column count follows the container, not the viewport."],
  },
};

const SPINNERS: Record<SpinnerVariantName, VariantDef> = {
  circle: { name: "Circle", blurb: "Classic bordered spinning circle." },
  dots: { name: "Dots", blurb: "A row of moving dots." },
  pulse: { name: "Pulse", blurb: "A single pulsing circle." },
  bars: { name: "Bars", blurb: "Oscillating vertical bars." },
  ring: { name: "Ring", blurb: "Multi-segment ring with staggered delays." },
  orbit: { name: "Orbit", blurb: "One dot orbiting the center." },
  "pulse-dots": { name: "PulseDots", blurb: "Three dots pulsing in sequence." },
  "orbit-dots": { name: "OrbitDots", blurb: "Three dots orbiting at equal spacing." },
  arc: {
    name: "Arc",
    blurb: "Material-style arc that grows and shrinks while it turns. Set a value to show progress.",
    notes: [
      "Turn on determinate and drag the value to use it as a progress indicator (0–100).",
      "With a label, a determinate arc is announced to screen readers as a progressbar.",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */

const family = ref<"skeleton" | "spinner">("skeleton");
const current = ref("table");

/* SKELETONS / SPINNERS are keyed by the package's own variant types, so
   listing a variant the package doesn't have (or missing one) is a type
   error. This string-keyed view is only for lookups by the current key. */
const CATALOGS: Record<"skeleton" | "spinner", Record<string, VariantDef>> = {
  skeleton: SKELETONS,
  spinner: SPINNERS,
};
const skeletonKeys = Object.keys(SKELETONS) as SkeletonVariantName[];
const spinnerKeys = Object.keys(SPINNERS) as SpinnerVariantName[];

const catalog = computed(() => CATALOGS[family.value]);

/* On narrow screens the menu groups become horizontally scrolling rows,
   so the selected item can sit off-screen; keep it in view. */
function revealActiveNav() {
  nextTick(() =>
    document.querySelector(".nav--on")?.scrollIntoView({ block: "nearest", inline: "nearest" })
  );
}
const def = computed<VariantDef>(() => catalog.value[current.value] ?? { name: "?", blurb: "" });

/** Global skeleton appearance */
const g = reactive({
  color: "#7c3aed",
  useHighlight: false,
  highlight: "#41b780",
  animation: "shimmer" as "shimmer" | "pulse" | "none",
  speed: 1,
  angle: 90,
  outlined: false,
  outlineWidth: 1,
  outlineStyle: "solid" as "solid" | "dashed" | "dotted" | "double",
  label: "",
});

/** `outlined` prop value: plain `true` while width/style are defaults,
 *  otherwise the object form with only the non-default fields. */
const outlinedValue = computed(() => {
  if (!g.outlined) return false;
  const o: { width?: number; style?: string } = {};
  if (g.outlineWidth !== 1) o.width = g.outlineWidth;
  if (g.outlineStyle !== "solid") o.style = g.outlineStyle;
  return Object.keys(o).length ? o : true;
});

/** Global spinner appearance */
const s = reactive({
  color: "#7c3aed",
  size: 48,
  speed: 1,
  thickness: 4,
  /** "default" leaves the variant's own default (on for circle, off otherwise) */
  track: "default" as "default" | "on" | "off" | "custom",
  trackColor: "#e5e7eb",
  determinate: false,
  value: 65,
});

/** Per-variant live values, keyed "family:variant" so switching keeps state */
const store = reactive<Record<string, Record<string, any>>>({});

function stateFor(fam: "skeleton" | "spinner", key: string) {
  const id = `${fam}:${key}`;
  if (!store[id]) {
    const d = CATALOGS[fam][key];
    const init: Record<string, any> = {};
    [...(d?.props ?? []), ...(d?.options ?? [])].forEach((c) => (init[c.key] = c.def));
    store[id] = init;
  }
  return store[id];
}

const live = computed(() => stateFor(family.value, current.value));

function resetCurrent() {
  delete store[`${family.value}:${current.value}`];
}

/** Values actually handed to the component, dropping empty/zero-as-off entries
 *  plus options that don't apply to the current mode. Sending an inapplicable
 *  option isn't harmless: Grid.vue prefers `itemCount` over rows*columns
 *  whenever it's present, so always sending it makes the columns/rows
 *  controls look broken. */
function clean(ctls: Ctl[] | undefined) {
  const out: Record<string, any> = {};
  const v0 = live.value;
  const autoFit = current.value === "grid" && (v0.minItemWidth ?? 0) > 0;
  const layout = v0.layout;

  (ctls ?? []).forEach((c) => {
    const v = v0[c.key];
    if (v === "" || v === undefined || v === null) return;
    // treat 0 as "off" for these opt-in numeric options
    if (["minColumnWidth", "minItemWidth", "actions"].includes(c.key) && v === 0) return;

    if (current.value === "grid") {
      if (autoFit && (c.key === "columns" || c.key === "rows")) return;
      if (!autoFit && c.key === "itemCount") return;
    }

    if (current.value === "card") {
      if (c.key === "mediaWidth" && layout !== "horizontal") return;
      if (c.key === "imageHeight" && layout !== "image") return;
    }

    if (current.value === "image") {
      if (v0.icon === false && (c.key === "iconSize" || c.key === "iconColor")) return;
    }

    if (current.value === "table" && v0.footer === false) {
      if (
        [
          "footerLabel",
          "footerLabelWidth",
          "footerItems",
          "footerControlWidth",
          "footerControlRadius",
          "footerAlign",
        ].includes(c.key)
      )
        return;
    }
    if (current.value === "table" && v0.footer && v0.footerLabel === false && c.key === "footerLabelWidth") {
      return;
    }

    out[c.key] = v;
  });
  return out;
}

/** Controls that are currently inert, so the UI can dim them */
const inert = computed(() => {
  const v0 = live.value;
  const set = new Set<string>();
  if (current.value === "grid") {
    if ((v0.minItemWidth ?? 0) > 0) {
      set.add("columns");
      set.add("rows");
    } else {
      set.add("itemCount");
    }
  }
  if (current.value === "card") {
    if (v0.layout !== "horizontal") set.add("mediaWidth");
    if (v0.layout !== "image") set.add("imageHeight");
  }
  if (current.value === "image") {
    if (v0.height) set.add("ratio");
    if (v0.icon === false) {
      set.add("iconSize");
      set.add("iconColor");
    }
  }
  if (current.value === "table") {
    if (!v0.footer) {
      ["footerLabel", "footerLabelWidth", "footerItems", "footerControlWidth", "footerControlRadius", "footerAlign"].forEach(
        (k) => set.add(k)
      );
    } else if (v0.footerLabel === false) {
      set.add("footerLabelWidth");
    }
  }
  return set;
});

const skProps = computed(() => clean(def.value.props));
const skOptions = computed(() => clean(def.value.options));

const bound = computed(() => {
  const p: Record<string, any> = {
    variant: current.value,
    color: g.color,
    animation: g.animation,
    speed: g.speed,
    angle: g.angle,
    ...skProps.value,
  };
  if (g.useHighlight) p.highlight = g.highlight;
  if (outlinedValue.value) p.outlined = outlinedValue.value;
  if (g.label) p.label = g.label;
  if (Object.keys(skOptions.value).length) p.options = skOptions.value;
  return p;
});

const showThickness = computed(() => ["circle", "ring", "arc"].includes(current.value));
const showTrack = showThickness;
const showValue = computed(() => current.value === "arc");

/** `track` prop value for the current controls (undefined = variant default). */
const trackValue = computed(() => {
  if (!showTrack.value) return undefined;
  return { default: undefined, on: true, off: false, custom: s.trackColor }[s.track];
});

const spinnerBound = computed(() => {
  const b: any = {
    variant: current.value,
    color: s.color,
    size: s.size,
    speed: s.speed,
  };
  if (showThickness.value) b.thickness = s.thickness;
  if (trackValue.value !== undefined) b.track = trackValue.value;
  if (showValue.value && s.determinate) b.value = s.value;
  return b;
});

/* ------------------------------------------------------------------ */
/* Width tester + surface                                              */
/* ------------------------------------------------------------------ */

const testWidth = ref(640);
const PRESETS = [1280, 900, 640, 375, 320, 200];
const dark = ref(false);

/* ------------------------------------------------------------------ */
/* Generated snippet                                                   */
/* ------------------------------------------------------------------ */

function fmt(v: any): string {
  if (typeof v === "string") return `"${v}"`;
  return `${v}`;
}

const snippet = computed(() => {
  if (family.value === "spinner") {
    const b = spinnerBound.value;
    const lines = [
      "<Spinner",
      `  variant="${b.variant}"`,
      `  color="${b.color}"`,
      `  :size="${b.size}"`,
      `  :speed="${b.speed}"`,
    ];
    if (showThickness.value) lines.push(`  :thickness="${b.thickness}"`);
    if (b.track === true) lines.push(`  track`);
    else if (b.track === false) lines.push(`  :track="false"`);
    else if (typeof b.track === "string") lines.push(`  track="${b.track}"`);
    if (b.value !== undefined) lines.push(`  :value="${b.value}"`);
    lines.push("/>");
    return lines.join("\n");
  }

  const lines = ["<Skeleton", `  variant="${current.value}"`, `  color="${g.color}"`];
  if (g.useHighlight) lines.push(`  highlight="${g.highlight}"`);
  lines.push(`  animation="${g.animation}"`);
  if (g.speed !== 1) lines.push(`  :speed="${g.speed}"`);
  if (g.angle !== 90) lines.push(`  :angle="${g.angle}"`);
  const ov = outlinedValue.value;
  if (ov === true) lines.push(`  outlined`);
  else if (ov) {
    const fields = Object.entries(ov).map(([k, v]) => (typeof v === "string" ? `${k}: '${v}'` : `${k}: ${v}`));
    lines.push(`  :outlined="{ ${fields.join(", ")} }"`);
  }
  if (g.label) lines.push(`  label="${g.label}"`);

  Object.entries(skProps.value).forEach(([k, v]) => {
    lines.push(typeof v === "string" ? `  ${k}="${v}"` : `  :${k}="${v}"`);
  });

  const o = skOptions.value;
  if (Object.keys(o).length) {
    const inner = Object.entries(o)
      .map(([k, v]) => `${k}: ${fmt(v)}`)
      .join(", ");
    lines.push(`  :options="{ ${inner} }"`);
  }
  lines.push("/>");
  return lines.join("\n");
});

const copied = ref(false);
async function copySnippet() {
  try {
    await navigator.clipboard.writeText(snippet.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1200);
  } catch {
    copied.value = false;
  }
}

/* ------------------------------------------------------------------ */
/* Compare mode: all variants of the current family at once            */
/* ------------------------------------------------------------------ */

const compare = ref(false);
const smartDemo = ref(false);
const progressDemo = ref(false);
const pageDemo = ref(false);

watch([family, current, compare, smartDemo, progressDemo, pageDemo], revealActiveNav);
onMounted(revealActiveNav);

function pick(fam: "skeleton" | "spinner", key: string) {
  family.value = fam;
  current.value = key;
  compare.value = false;
  smartDemo.value = false;
  progressDemo.value = false;
  pageDemo.value = false;
}

function openView(view: "compare" | "smart" | "progress" | "page") {
  compare.value = view === "compare";
  smartDemo.value = view === "smart";
  progressDemo.value = view === "progress";
  pageDemo.value = view === "page";
}
</script>

<template>
  <div class="app" :class="{ 'app--dark': dark }">
    <PageProgress label="Loading" />
    <!-- ===================== Sidebar ===================== -->
    <aside class="side">
      <div class="brand">
        <strong>vue-smart-loading-kit</strong>
        <span>Interactive demo</span>
        <nav class="brand__links">
          <a href="https://github.com/navidjaberi/vue-smart-loading-kit" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.npmjs.com/package/vue-smart-loading-kit" target="_blank" rel="noopener">npm</a>
        </nav>
      </div>

      <div class="group">
        <div class="group__title">Skeletons</div>
        <button
          v-for="(v, k) in SKELETONS"
          :key="'sk-' + k"
          class="nav"
          :class="{ 'nav--on': family === 'skeleton' && current === k && !compare && !smartDemo && !progressDemo && !pageDemo }"
          @click="pick('skeleton', k)"
        >
          {{ v.name }}
        </button>
      </div>

      <div class="group">
        <div class="group__title">Spinners</div>
        <button
          v-for="(v, k) in SPINNERS"
          :key="'sp-' + k"
          class="nav"
          :class="{ 'nav--on': family === 'spinner' && current === k && !compare && !smartDemo && !progressDemo && !pageDemo }"
          @click="pick('spinner', k)"
        >
          {{ v.name }}
        </button>
      </div>

      <div class="group">
        <div class="group__title">Views</div>
        <button class="nav" :class="{ 'nav--on': compare }" @click="openView('compare')">
          Compare all
        </button>
        <button class="nav" :class="{ 'nav--on': smartDemo }" @click="openView('smart')">
          Smart loader
        </button>
        <button class="nav" :class="{ 'nav--on': progressDemo }" @click="openView('progress')">
          Progress bar
        </button>
        <button class="nav" :class="{ 'nav--on': pageDemo }" @click="openView('page')">
          Page progress
        </button>
      </div>
    </aside>

    <!-- ===================== Main ===================== -->
    <main class="main">
      <!-- Compare view -->
      <SmartLoaderDemo v-if="smartDemo" />
      <ProgressBarDemo v-else-if="progressDemo" />
      <PageProgressDemo v-else-if="pageDemo" />

      <template v-else-if="compare">
        <header class="head">
          <h1>All {{ family === 'skeleton' ? 'skeletons' : 'spinners' }}</h1>
          <p class="sub">
            Every variant side by side, using the current appearance settings.
          </p>
        </header>

        <div class="wall">
          <template v-if="family === 'skeleton'">
            <div v-for="k in skeletonKeys" :key="'sk-' + k" class="wall__cell">
              <div class="wall__name">{{ SKELETONS[k].name }}</div>
              <div class="wall__stage wall__stage--fill">
                <Skeleton
                  :variant="k"
                  :color="g.color"
                  :highlight="g.useHighlight ? g.highlight : undefined"
                  :animation="g.animation"
                  :speed="g.speed"
                  :angle="g.angle"
                  :outlined="outlinedValue"
                />
              </div>
            </div>
          </template>
          <template v-else>
            <div v-for="k in spinnerKeys" :key="'sp-' + k" class="wall__cell">
              <div class="wall__name">{{ SPINNERS[k].name }}</div>
              <div class="wall__stage wall__stage--center">
                <Spinner
                  :variant="k"
                  :color="s.color"
                  :size="s.size"
                  :speed="s.speed"
                  :thickness="s.thickness"
                />
              </div>
            </div>
          </template>
        </div>
      </template>

      <!-- Single-variant view -->
      <template v-else>
        <header class="head">
          <h1>{{ def.name }}</h1>
          <p class="sub">{{ def.blurb }}</p>
          <ul v-if="def.notes?.length" class="notes">
            <li v-for="(n, i) in def.notes" :key="i">{{ n }}</li>
          </ul>
        </header>

        <!-- Stage -->
        <section class="panel">
          <div class="panel__bar">
            <span class="panel__title">Preview</span>
            <div class="chips">
              <input v-model.number="testWidth" type="range" min="140" max="1280" aria-label="Preview container width" title="Preview container width" />
              <span class="px">{{ testWidth }}px</span>
              <button class="chip" @click="dark = !dark">
                {{ dark ? "Light" : "Dark" }}
              </button>
            </div>
          </div>

          <div class="stage">
            <div
              class="stage__box"
              :class="family === 'spinner' ? 'stage__box--center' : 'stage__box--fill'"
              :style="{ width: testWidth + 'px' }"
            >
              <Skeleton v-if="family === 'skeleton'" v-bind="bound" />
              <Spinner v-else v-bind="spinnerBound" />
            </div>
          </div>
        </section>

        <!-- Controls -->
        <section class="cols">
          <div class="panel">
            <div class="panel__bar">
              <span class="panel__title">
                {{ family === "skeleton" ? "Appearance" : "Spinner props" }}
              </span>
            </div>

            <!-- Skeleton global controls -->
            <div v-if="family === 'skeleton'" class="ctls">
              <label class="ctl">
                <span>color</span>
                <input v-model="g.color" type="color" />
              </label>

              <label class="ctl">
                <span>highlight</span>
                <span class="inline">
                  <input v-model="g.useHighlight" type="checkbox" />
                  <input v-model="g.highlight" type="color" :disabled="!g.useHighlight" />
                </span>
              </label>

              <label class="ctl">
                <span>animation</span>
                <select v-model="g.animation">
                  <option value="shimmer">shimmer</option>
                  <option value="pulse">pulse</option>
                  <option value="none">none</option>
                </select>
              </label>

              <label class="ctl">
                <span>speed · {{ g.speed }}</span>
                <input v-model.number="g.speed" type="range" min="0.2" max="4" step="0.1" />
              </label>

              <label class="ctl">
                <span>angle · {{ g.angle }}°</span>
                <input v-model.number="g.angle" type="range" min="0" max="360" />
              </label>

              <label class="ctl">
                <span>outlined</span>
                <input v-model="g.outlined" type="checkbox" />
              </label>

              <template v-if="g.outlined">
                <label class="ctl">
                  <span>outline width · {{ g.outlineWidth }}px</span>
                  <input v-model.number="g.outlineWidth" type="range" min="1" max="8" />
                </label>

                <label class="ctl">
                  <span>outline style</span>
                  <select v-model="g.outlineStyle">
                    <option value="solid">solid</option>
                    <option value="dashed">dashed</option>
                    <option value="dotted">dotted</option>
                    <option value="double">double</option>
                  </select>
                </label>
              </template>

              <label class="ctl ctl--wide">
                <span>label (a11y — announces via role="status")</span>
                <input v-model="g.label" type="text" placeholder="e.g. Loading users" />
              </label>
            </div>

            <!-- Spinner controls -->
            <div v-else class="ctls">
              <label class="ctl">
                <span>color</span>
                <input v-model="s.color" type="color" />
              </label>
              <label class="ctl">
                <span>size · {{ s.size }}</span>
                <input v-model.number="s.size" type="range" min="12" max="160" />
              </label>
              <label class="ctl">
                <span>speed · {{ s.speed }}</span>
                <input v-model.number="s.speed" type="range" min="0.2" max="4" step="0.1" />
              </label>
              <label class="ctl" v-if="showThickness">
                <span>thickness · {{ s.thickness }}</span>
                <input v-model.number="s.thickness" type="range" min="1" max="16" />
              </label>
              <label class="ctl" v-if="showTrack">
                <span>track</span>
                <select v-model="s.track">
                  <option value="default">default</option>
                  <option value="on">on</option>
                  <option value="off">off</option>
                  <option value="custom">custom color</option>
                </select>
              </label>
              <label class="ctl" v-if="showTrack && s.track === 'custom'">
                <span>track color</span>
                <input v-model="s.trackColor" type="color" />
              </label>
              <label class="ctl" v-if="showValue">
                <span>determinate</span>
                <input v-model="s.determinate" type="checkbox" />
              </label>
              <label class="ctl" v-if="showValue && s.determinate">
                <span>value · {{ s.value }}%</span>
                <input v-model.number="s.value" type="range" min="0" max="100" />
              </label>
            </div>
          </div>

          <!-- Per-variant controls -->
          <div v-if="family === 'skeleton' && (def.props?.length || def.options?.length)" class="panel">
            <div class="panel__bar">
              <span class="panel__title">{{ def.name }} options</span>
              <button class="chip" @click="resetCurrent">Reset</button>
            </div>

            <div class="ctls">
              <label
                v-for="c in [...(def.props ?? []), ...(def.options ?? [])]"
                :key="c.key"
                class="ctl"
                :class="{ 'ctl--inert': inert.has(c.key) }"
              >
                <span>
                  {{ c.label }}
                  <em v-if="c.type === 'number'">· {{ live[c.key] }}</em>
                  <i v-if="inert.has(c.key)">not used in this mode</i>
                </span>

                <input
                  v-if="c.type === 'number'"
                  v-model.number="live[c.key]"
                  type="range"
                  :min="c.min"
                  :max="c.max"
                  :step="c.step ?? 1"
                  :disabled="inert.has(c.key)"
                />
                <input
                  v-else-if="c.type === 'bool'"
                  v-model="live[c.key]"
                  type="checkbox"
                  :disabled="inert.has(c.key)"
                />
                <select
                  v-else-if="c.type === 'select'"
                  v-model="live[c.key]"
                  :disabled="inert.has(c.key)"
                >
                  <option v-for="o in c.opts" :key="o" :value="o">{{ o }}</option>
                </select>
                <input
                  v-else
                  v-model="live[c.key]"
                  type="text"
                  :disabled="inert.has(c.key)"
                />
              </label>
            </div>
          </div>
        </section>

        <!-- Snippet -->
        <section class="panel">
          <div class="panel__bar">
            <span class="panel__title">Code</span>
            <button class="chip" @click="copySnippet">
              {{ copied ? "Copied" : "Copy" }}
            </button>
          </div>
          <pre class="code">{{ snippet }}</pre>
        </section>

        <!-- Responsive ladder -->
        <section class="panel">
          <div class="panel__bar">
            <span class="panel__title">Responsive ladder</span>
          </div>
          <div class="ladder">
            <div v-for="w in PRESETS" :key="'lad-' + w" class="ladder__row">
              <span class="ladder__w">{{ w }}px</span>
              <div class="ladder__box" :style="{ width: w + 'px' }">
                <Skeleton v-if="family === 'skeleton'" v-bind="bound" />
                <Spinner v-else v-bind="spinnerBound" />
              </div>
            </div>
          </div>
        </section>

        <!-- Reduced motion reminder -->
        <section class="panel panel--muted">
          <div class="panel__bar"><span class="panel__title">Reduced motion</span></div>
          <p class="note">
            With "reduce motion" turned on in your OS or browser, skeleton
            animations stop and spinners slow to half speed. Turn it on and
            reload to see it.
          </p>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ---------- shell ---------- */
.app {
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #64748b;
  --line: #e2e8f0;
  --panel: #f8fafc;
  --accent: #7c3aed;

  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 100vh;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--fg);
  background: var(--bg);
}

.app--dark {
  --bg: #0b1120;
  --fg: #e2e8f0;
  --muted: #94a3b8;
  --line: #1e293b;
  --panel: #111827;
}

/* ---------- sidebar ---------- */
.side {
  border-right: 1px solid var(--line);
  padding: 20px 12px;
  position: sticky;
  top: 0;
  align-self: start;
  height: 100vh;
  overflow-y: auto;
}

.brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px 16px;
  font-size: 13px;
  line-height: 1.3;
}
.brand span {
  color: var(--muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.brand__links {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
}
.brand__links a {
  color: var(--accent);
  text-decoration: none;
}
.brand__links a:hover {
  text-decoration: underline;
}

.group {
  margin-bottom: 18px;
}
.group__title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  padding: 0 8px 6px;
}

.nav {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 8px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
.nav:hover {
  background: var(--panel);
}
.nav--on,
.nav--on:hover {
  background: var(--accent);
  color: #fff;
}

/* ---------- main ---------- */
.main {
  padding: 28px 32px 64px;
  min-width: 0;
}

.head {
  margin-bottom: 20px;
}
.head h1 {
  margin: 0 0 4px;
  font-size: 22px;
}
.sub {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}
.notes {
  margin: 10px 0 0;
  padding-left: 18px;
  color: var(--muted);
  font-size: 13px;
}
.notes li {
  margin-bottom: 3px;
}

/* ---------- panels ---------- */
.panel {
  border: 1px solid var(--line);
  border-radius: 10px;
  background: var(--panel);
  margin-bottom: 20px;
  overflow: hidden;
}
.panel--muted {
  background: transparent;
}

.panel__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.panel__title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  align-items: start;
}
.cols > .panel {
  margin-bottom: 0;
}

/* ---------- chips ---------- */
.chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.chip {
  border: 1px solid var(--line);
  background: var(--bg);
  color: inherit;
  font: inherit;
  font-size: 12px;
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
}
.chip--on {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.px {
  font-size: 12px;
  color: var(--muted);
  min-width: 52px;
}

/* ---------- stage ---------- */
.stage {
  padding: 24px;
  display: flex;
  justify-content: center;
  overflow-x: auto;
}
.stage__box {
  border: 1px dashed var(--line);
  padding: 14px;
  box-sizing: border-box;
  max-width: 100%;
  min-height: 80px;
}

/* Skeletons must sit in a plain block box with a definite width. As a flex
   item the component root is shrink-to-fit, so every percentage inside it
   (cellWidths, titleWidth, subtitleWidth, width="100%") resolves against an
   indefinite width and collapses. */
.stage__box--fill {
  display: block;
}
.stage__box--fill > :deep(.vslk-skeleton-container) {
  width: 100%;
}

/* Spinners are intrinsically sized, so centering them is fine. */
.stage__box--center {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---------- controls ---------- */
.ctls {
  padding: 14px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px 16px;
}
.ctl {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  min-width: 0;
}
.ctl--wide {
  grid-column: 1 / -1;
}
.ctl > span {
  color: var(--muted);
}
.ctl em {
  font-style: normal;
  color: var(--fg);
}
.ctl i {
  display: block;
  font-style: normal;
  font-size: 10px;
  color: var(--accent);
}
.ctl--inert {
  opacity: 0.45;
}
.ctl input[type="text"],
.ctl select {
  width: 100%;
  box-sizing: border-box;
  padding: 5px 7px;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--bg);
  color: inherit;
  font: inherit;
  font-size: 12px;
}
.ctl input[type="color"] {
  width: 44px;
  height: 26px;
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: var(--bg);
}
.ctl input[type="range"] {
  width: 100%;
}
.inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---------- code ---------- */
.code {
  margin: 0;
  padding: 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.55;
  white-space: pre;
  overflow-x: auto;
  color: var(--fg);
}

/* ---------- ladder ---------- */
.ladder {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-x: auto;
}
.ladder__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.ladder__w {
  flex: 0 0 auto;
  width: 54px;
  font-size: 11px;
  color: var(--muted);
  padding-top: 6px;
}
.ladder__box {
  border: 1px dashed var(--line);
  padding: 8px;
  box-sizing: border-box;
  flex: 0 0 auto;
}

/* ---------- compare wall ---------- */
.wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.wall__cell {
  border: 1px solid var(--line);
  border-radius: 10px;
  overflow: hidden;
  background: var(--panel);
}
.wall__name {
  padding: 8px 12px;
  border-bottom: 1px solid var(--line);
  font-size: 12px;
  color: var(--muted);
}
.wall__stage {
  padding: 16px;
  min-height: 110px;
  overflow: hidden;
}
.wall__stage--fill {
  display: block;
}
.wall__stage--fill > :deep(.vslk-skeleton-container) {
  width: 100%;
}
.wall__stage--center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.note {
  margin: 0;
  padding: 14px;
  font-size: 13px;
  color: var(--muted);
}

/* ---------- small screens ---------- */
@media (max-width: 860px) {
  .app {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 16px 12px 8px;
  }
  /* A 22-item vertical menu would fill the whole first screen on a phone:
     lay each group out as one horizontally scrolling row instead. */
  .group {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
    margin-bottom: 8px;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }
  .group__title {
    flex: none;
    padding: 0 4px 0 8px;
  }
  .nav {
    flex: none;
    width: auto;
    white-space: nowrap;
  }
  .main {
    padding: 20px 16px 48px;
  }
}
</style>