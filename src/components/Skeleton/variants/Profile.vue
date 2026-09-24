<script setup lang="ts">
import { computed } from "vue";
import Skeleton from "../Skeleton.vue";
import type { SkeletonBaseProps } from "../types";

type ProfileOptions = {
  avatarSize?: number | string;
  lines?: number;
  lineHeight?: number | string;
};

const props = defineProps<SkeletonBaseProps>();

const profileOptions = computed(() => (props.options ?? {}) as ProfileOptions);

const avatarSize = computed(() => profileOptions.value.avatarSize ?? 56);
const lines = computed(() => Math.max(1, profileOptions.value.lines ?? 2));
const lineHeight = computed(() => profileOptions.value.lineHeight ?? 10);

const containerWidth = computed(() =>
  typeof props.width === "number" ? `${props.width}px` : props.width ?? "100%"
);

const forwardedProps = computed(() => {
  const { options, width, height, size, lines: topLevelLines, ...rest } = props;
  return rest;
});

const lineWidths = computed(() =>
  Array.from({ length: lines.value }, (_, i) => {
    if (i === 0) return "72%";
    if (i === lines.value - 1) return "55%";
    return "64%";
  })
);
</script>

<template>
  <div class="vslk-profile" :style="{ width: containerWidth }">
    <Skeleton
      v-bind="forwardedProps"
      variant="avatar"
      :size="avatarSize"
      class="vslk-profile__avatar"
    />

    <div class="vslk-profile__content">
      <Skeleton
        v-for="(w, i) in lineWidths"
        :key="i"
        v-bind="forwardedProps"
        variant="text"
        :width="w"
        :height="lineHeight"
      />
    </div>
  </div>
</template>

<style scoped>
.vslk-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vslk-profile :deep(.vslk-profile__avatar) {
  flex-shrink: 0;
}

.vslk-profile__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
