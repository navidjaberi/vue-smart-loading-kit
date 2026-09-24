<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "../Skeleton.vue";
import type { SkeletonBaseProps } from "../types";

type TableOptions = {
  rows?: number;
  columns?: number;
  columnWidths?: number | string | (number | string)[];
  minColumnWidth?: number | string;

  rowHeight?: number | string;

  /** Width of the decorative bar inside each body cell. Default is a
   *  single uniform value applied to every cell (not randomized) —
   *  pass an array to vary it per column, or a single value to change
   *  the uniform width. */
  cellWidths?: number | string | (number | string)[];

  align?: "left" | "center" | "right" | ("left" | "center" | "right")[];

  padding?: number | string;

  gridLines?: boolean;

  borderColor?: string;

  cellColor?: string;
  cellHighlight?: string;

  header?: boolean;
  headerHeight?: number | string;
  headerColor?: string;
  headerHighlight?: string;
  /** Width of each header bar. Defaults to the same as cellWidths. */
  headerWidths?: number | string | (number | string)[];

  /* ---------------- Footer (now more flexible) ---------------- */
  footer?: boolean;
  footerHeight?: number | string;
  footerColor?: string;
  footerHighlight?: string;

  /** Show the label bar on the left side of the footer. Default true. */
  footerLabel?: boolean;
  /** Width of that label bar. Default "110px". */
  footerLabelWidth?: number | string;

  /** Number of control blocks (e.g. pagination buttons) on the right. */
  footerItems?: number;
  /** Width of each control block. Defaults to footerHeight (square). */
  footerControlWidth?: number | string;
  /** Radius of each control block. Default "6px". */
  footerControlRadius?: number | string;
  /** How the label and controls are positioned. Default "between". */
  footerAlign?: "between" | "start" | "end";
};

const props = defineProps<SkeletonBaseProps>();

const options = computed(() => (props.options ?? {}) as TableOptions);

function toUnit(value: number | string) {
  return typeof value === "number" ? `${value}px` : value;
}

/* ---------------- Layout ---------------- */

const rows = computed(() => Math.max(1, options.value.rows ?? 5));
const columns = computed(() => Math.max(1, options.value.columns ?? 4));

const rowHeight = computed(() => toUnit(options.value.rowHeight ?? 16));
const padding = computed(() => toUnit(options.value.padding ?? 12));

const alignments = computed(() => {
  const value = options.value.align ?? "left";
  return Array.from({ length: columns.value }, (_, index) =>
    Array.isArray(value) ? value[index] ?? "left" : value
  );
});

const columnTemplate = computed(() => {
  const custom = options.value.columnWidths;
  const minWidth = options.value.minColumnWidth;
  const defaultTrack =
    minWidth != null ? `minmax(${toUnit(minWidth)}, 1fr)` : "1fr";

  return Array.from({ length: columns.value }, (_, index) => {
    if (Array.isArray(custom)) {
      return custom[index] != null ? toUnit(custom[index]) : defaultTrack;
    }
    if (custom != null) return toUnit(custom);
    return defaultTrack;
  }).join(" ");
});

const gridLines = computed(() => options.value.gridLines ?? true);
const borderColor = computed(
  () => options.value.borderColor ?? "rgba(148,163,184,.18)"
);

/* ---------------- Colors ---------------- */

const cellColor = computed(() => options.value.cellColor ?? props.color);
const cellHighlight = computed(
  () => options.value.cellHighlight ?? props.highlight
);

const forwardedProps = computed(() => {
  const { width, options, ...rest } = props;
  return rest;
});

/* ---------------- Bar widths (now uniform by default) ---------------- */
/* Previously this cycled through a preset array of varying percentages
   (70%, 95%, 60%, ...), which made cells look randomly sized even when
   the user never asked for variety. Now every cell gets the SAME width
   unless cellWidths is explicitly given as an array. */

const DEFAULT_CELL_WIDTH = "80%";

function resolveWidths(
  custom: number | string | (number | string)[] | undefined,
  fallback: string
) {
  return Array.from({ length: columns.value }, (_, index) => {
    if (Array.isArray(custom)) {
      return custom[index] != null ? toUnit(custom[index]) : fallback;
    }
    if (custom != null) return toUnit(custom);
    return fallback;
  });
}

const skeletonWidths = computed(() =>
  resolveWidths(options.value.cellWidths, DEFAULT_CELL_WIDTH)
);

/* ---------------- Header ---------------- */

const showHeader = computed(() => options.value.header ?? false);

const headerHeight = computed(() =>
  toUnit(options.value.headerHeight ?? options.value.rowHeight ?? 14)
);

const headerColor = computed(
  () => options.value.headerColor ?? cellColor.value
);
const headerHighlight = computed(
  () => options.value.headerHighlight ?? cellHighlight.value
);

const headerWidths = computed(() =>
  resolveWidths(options.value.headerWidths ?? options.value.cellWidths, "50%")
);

/* ---------------- Footer ---------------- */

const showFooter = computed(() => options.value.footer ?? false);

const footerHeight = computed(() => toUnit(options.value.footerHeight ?? 28));

const footerColor = computed(
  () => options.value.footerColor ?? cellColor.value
);
const footerHighlight = computed(
  () => options.value.footerHighlight ?? cellHighlight.value
);

const showFooterLabel = computed(() => options.value.footerLabel ?? true);
const footerLabelWidth = computed(() =>
  toUnit(options.value.footerLabelWidth ?? 110)
);

const footerItems = computed(() =>
  Math.max(0, options.value.footerItems ?? 3)
);
const footerControlWidth = computed(() =>
  toUnit(options.value.footerControlWidth ?? options.value.footerHeight ?? 28)
);
const footerControlRadius = computed(() =>
  toUnit(options.value.footerControlRadius ?? 6)
);

const footerJustify = computed(() => {
  const align = options.value.footerAlign ?? "between";
  return align === "between"
    ? "space-between"
    : align === "end"
    ? "flex-end"
    : "flex-start";
});

/* ---------------- Styles ---------------- */

const tableStyle = computed(() => ({
  width:
    props.width != null
      ? typeof props.width === "number"
        ? `${props.width}px`
        : props.width
      : undefined,
  "--vslk-border-color": borderColor.value,
}));

const rowStyle = computed(() => ({
  gridTemplateColumns: columnTemplate.value,
}));
</script>

<template>
  <div class="vslk-table-wrapper">
    <div class="vslk-table" :style="tableStyle">
      <!-- Header -->
      <div
        v-if="showHeader"
        class="vslk-table__row vslk-table__row--header"
        :class="{ 'vslk-table__row--grid': gridLines }"
        :style="rowStyle"
      >
        <div
          v-for="(width, col) in headerWidths"
          :key="col"
          class="vslk-table__cell"
          :class="`vslk-table__cell--${alignments[col]}`"
          :style="{ padding }"
        >
          <Skeleton
            v-bind="forwardedProps"
            variant="text"
            :width="width"
            :height="headerHeight"
            :color="headerColor"
            :highlight="headerHighlight"
            class="vslk-table__skeleton"
          />
        </div>
      </div>

      <!-- Body -->
      <div
        v-for="row in rows"
        :key="row"
        class="vslk-table__row"
        :class="{ 'vslk-table__row--grid': gridLines }"
        :style="rowStyle"
      >
        <div
          v-for="(width, col) in skeletonWidths"
          :key="col"
          class="vslk-table__cell"
          :class="`vslk-table__cell--${alignments[col]}`"
          :style="{ padding }"
        >
          <Skeleton
            v-bind="forwardedProps"
            variant="text"
            :width="width"
            :height="rowHeight"
            :color="cellColor"
            :highlight="cellHighlight"
            class="vslk-table__skeleton"
          />
        </div>
      </div>

      <!-- Footer -->
      <div
        v-if="showFooter"
        class="vslk-table__footer"
        :style="{ padding, justifyContent: footerJustify }"
      >
        <Skeleton
          v-if="showFooterLabel"
          v-bind="forwardedProps"
          variant="text"
          :width="footerLabelWidth"
          :height="footerHeight"
          :color="footerColor"
          :highlight="footerHighlight"
          class="vslk-table__skeleton"
        />
        <div v-if="footerItems > 0" class="vslk-table__footer-controls">
          <Skeleton
            v-for="item in footerItems"
            :key="item"
            v-bind="forwardedProps"
            variant="block"
            :width="footerControlWidth"
            :height="footerHeight"
            :radius="footerControlRadius"
            :color="footerColor"
            :highlight="footerHighlight"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vslk-table-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.vslk-table {
  display: flex;
  flex-direction: column;
  width: max-content;
  min-width: 100%;
  border: 1px solid var(--vslk-border-color);
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.vslk-table__row {
  display: grid;
}

.vslk-table__row:not(:last-child) {
  border-bottom: 1px solid var(--vslk-border-color);
}

.vslk-table__row--header {
  background: rgba(148, 163, 184, 0.08);
  border-bottom-width: 2px;
}

.vslk-table__cell {
  display: flex;
  align-items: center;
  min-width: 0;
  box-sizing: border-box;
}

/* Required so percentage cellWidths resolve against the cell's real
   width instead of an indefinite flex-item size (see Table debugging
   history) — this necessarily makes the wrapper fill the cell, so
   alignment can no longer be done via justify-content on the cell
   (there's no free space left to justify). Alignment is instead
   applied directly on the inner shape via auto margins below, which
   works correctly even at 100% wrapper width. */
.vslk-table__cell :deep(.vslk-skeleton-container) {
  width: 100%;
}

.vslk-table__skeleton {
  max-width: 100%;
}

.vslk-table__cell:not(:last-child) {
  border-right: 1px solid var(--vslk-border-color);
}

/* Alignment: margin-auto on the actual bar, not justify-content on the
   cell — this is what makes a less-than-100%-wide bar visibly shift
   left/center/right within the full-width wrapper. */
.vslk-table__cell--left :deep(.vslk-sk-shape) {
  margin-right: auto;
}
.vslk-table__cell--center :deep(.vslk-sk-shape) {
  margin-left: auto;
  margin-right: auto;
}
.vslk-table__cell--right :deep(.vslk-sk-shape) {
  margin-left: auto;
}

.vslk-table__row:not(.vslk-table__row--grid) {
  gap: 12px;
}

.vslk-table__row:not(.vslk-table__row--grid) .vslk-table__cell {
  border: none;
}

.vslk-table__row:not(.vslk-table__row--grid):not(:last-child) {
  border-bottom: none;
}

.vslk-table__footer {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--vslk-border-color);
  gap: 12px;
}

.vslk-table__footer-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vslk-table-wrapper::-webkit-scrollbar {
  height: 8px;
}

.vslk-table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.35);
  border-radius: 9999px;
}

.vslk-table-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
</style>