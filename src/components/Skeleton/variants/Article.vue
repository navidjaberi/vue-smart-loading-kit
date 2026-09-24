<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "../Skeleton.vue";
import type { SkeletonBaseProps } from "../types";

type ArticleOptions = {
  paragraphs?: number;
  linesPerParagraph?: number;
  titleWidth?: number | string;
  paragraphGap?: number | string;
  lineGap?: number | string;
};

const props = defineProps<SkeletonBaseProps>();

const options = computed(() => (props.options ?? {}) as ArticleOptions);

const paragraphs = computed(() => Math.max(1, options.value.paragraphs ?? 2));
const linesPerParagraph = computed(() =>
  Math.max(2, options.value.linesPerParagraph ?? 4)
);

const titleWidth = computed(() => options.value.titleWidth ?? "70%");

const paragraphGap = computed(() => {
  const v = options.value.paragraphGap ?? "20px";
  return typeof v === "number" ? `${v}px` : v;
});

const lineGap = computed(() => {
  const v = options.value.lineGap ?? "8px";
  return typeof v === "number" ? `${v}px` : v;
});

const containerWidth = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width ?? "100%"
);

const forwardedProps = computed(() => {
  const { width, options, lines, size, ...rest } = props;
  return rest;
});

function getLineWidth(index: number, total: number) {
  if (index === total - 1) return "60%";
  if (index === total - 2) return "85%";
  return "100%";
}
</script>

<template>
  <div
    class="vslk-article"
    :style="{
      width: containerWidth,
      gap: paragraphGap,
    }"
  >
    <Skeleton
      v-bind="forwardedProps"
      variant="text"
      :width="titleWidth"
      height="20px"
    />

    <div
      v-for="paragraph in paragraphs"
      :key="paragraph"
      class="vslk-article__paragraph"
      :style="{ gap: lineGap }"
    >
      <Skeleton
        v-for="line in linesPerParagraph"
        :key="line"
        v-bind="forwardedProps"
        variant="text"
        :width="getLineWidth(line - 1, linesPerParagraph)"
        height="10px"
      />
    </div>
  </div>
</template>

<style scoped>
.vslk-article {
  display: flex;
  flex-direction: column;
  min-width: 0;
  box-sizing: border-box;
}

.vslk-article__paragraph {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
</style>