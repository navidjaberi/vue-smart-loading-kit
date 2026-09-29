<script setup lang="ts">
import { computed } from "vue";
import { toCssSize } from "../../../utils/size";
import { resolveTrack } from "../track";

interface Props {
  size?: number | string;
  color?: string;
  speed?: number;
  thickness?: number;
  track?: boolean | string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 40,
  color: "currentColor",
  speed: 1,
  thickness: 4,
  track: false,
});

const trackInfo = computed(() => resolveTrack(props.track));

const duration = computed(() => 1 / (props.speed > 0 ? props.speed : 1));

/* Each segment starts a fixed FRACTION of the cycle behind the next;
   that ordering is what makes the arcs gather and chase. (Delays in
   absolute seconds only lined up at one speed.) */
const PHASES = [0.45, 0.3, 0.15, 0];
const delayOf = (i: number) => `${-PHASES[i - 1]! * duration.value}s`;
</script>

<template>
  <div
    class="spinner-ring"
    :style="{
      width: toCssSize(props.size),
      height: toCssSize(props.size),
      color: props.color,
    }"
  >
    <div
      v-if="trackInfo"
      class="vslk-ring-track"
      :data-vslk-track="trackInfo.attr"
      :style="{ borderWidth: props.thickness + 'px', borderColor: trackInfo.color }"
    />
    <div
      v-for="i in 4"
      :key="i"
      class="segment"
      :style="{
        borderWidth: props.thickness + 'px',
        borderColor: props.color + ' transparent transparent transparent',
        animationDuration: duration + 's',
        animationDelay: delayOf(i),
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

.vslk-ring-track {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border-style: solid;
  border-radius: 50%;
}

.segment {
  box-sizing: border-box;
  position: absolute;
  inset: 0;
  border-style: solid;
  border-radius: 50%;
  animation: ring-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
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
