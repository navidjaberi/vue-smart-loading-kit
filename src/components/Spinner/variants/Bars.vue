<script setup lang="ts">
import { computed } from "vue";
import { scaleSize, toCssSize } from "../../../utils/size";

interface Props {
  size?: string | number;
  color?: string;
  speed?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "currentColor",
  speed: 1,
});

const containerHeight = computed(() => toCssSize(props.size));
const barWidth = computed(() => scaleSize(props.size, "/", 8));
// five bars of size/8 plus four gaps of size*3/32 fill exactly one `size`
const gapSize = computed(() => scaleSize(props.size, "*", 3 / 32));

const duration = computed(() => {
  const safeSpeed =
    Number.isFinite(props.speed) && props.speed > 0
      ? props.speed
      : 1;

  return 1 / safeSpeed;
});

const formattedDuration = computed(() => `${duration.value}s`);

const getAnimationDelay = (index: number) => {
  return `${index * duration.value * 0.1}s`;
};
</script>

<template>
  <div
    class="v-spinner-bars"
    :style="{
      width: containerHeight,
      height: containerHeight,
      gap: gapSize,
      color: props.color,
    }"
  >
    <span
      v-for="n in 5"
      :key="n"
      :style="{
        width: barWidth,
        backgroundColor: props.color,
        animationDuration: formattedDuration,
        animationDelay: getAnimationDelay(n - 1),
      }"
    />
  </div>
</template>

<style scoped>
.v-spinner-bars {
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-spinner-bars span {
  height: 100%;
  border-radius: 999px;
  animation-name: vslk-bars;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes vslk-bars {
  0%,
  100% {
    transform: scaleY(0.4);
    opacity: 0.4;
  }

  50% {
    transform: scaleY(1);
    opacity: 1;
  }
}
</style>
