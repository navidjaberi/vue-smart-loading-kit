<script setup lang="ts">
interface Props {
  size?: number;
  color?: string;
  speed?: number;
  thickness?: number;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "#3b82f6",
  speed: 1,
  thickness: 4,
});
</script>

<template>
  <div
    class="spinner-ring"
    :style="{
      width: props.size + 'px',
    }"
  >
    <div
      v-for="i in 4"
      :key="i"
      class="segment"
      :style="{
        borderWidth: props.thickness + 'px',
        borderColor: props.color + ' transparent transparent transparent',
        animationDuration: 1 / (props.speed > 0 ? props.speed : 1) + 's',
      }"
    />
  </div>
</template>

<style scoped>
.spinner-ring {
  aspect-ratio: 1 / 1;
  max-width: 100%;

  position: relative;
  display: inline-block;
  box-sizing: border-box;
}

.segment {
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  border-style: solid;
  border-radius: 50%;
  animation: ring-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.segment:nth-child(1) {
  animation-delay: -0.45s;
}
.segment:nth-child(2) {
  animation-delay: -0.3s;
}
.segment:nth-child(3) {
  animation-delay: -0.15s;
}

@keyframes ring-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
