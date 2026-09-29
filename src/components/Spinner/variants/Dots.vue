<script setup lang="ts">
import { computed } from "vue";
import { scaleSize } from "../../../utils/size";

interface Props {
  size?: string | number;
  color?: string;
  speed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "#3b82f6",
  speed: 1,
});

const dotSize = computed(() => scaleSize(props.size, "/", 4));
const gapSize = computed(() => scaleSize(props.size, "/", 5.5));

const duration = computed(() => {
  return props.speed > 0 ? 1 / props.speed : 1;
});

const formattedDuration = computed(() => `${duration.value}s`);

const getAnimationDelay = (index: number) => {
  return `${index * duration.value * 0.15}s`;
};
</script>

<template>
  <div class="vslk-spinner-dots" :style="{ gap: gapSize }" >
    <span
      v-for="n in 3"
      :key="n"
      :style="{
        width: dotSize,
        height: dotSize,
        backgroundColor: props.color,
        animationDuration: formattedDuration,
        animationDelay: getAnimationDelay(n - 1),
      }"
    />
  </div>
</template>

<style scoped>
.vslk-spinner-dots {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vslk-spinner-dots span {
  border-radius: 999px;
  animation-name: vslk-bounce;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes vslk-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.5);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
