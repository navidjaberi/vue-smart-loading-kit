import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Reactive `prefers-reduced-motion: reduce`. Always false where
 *  matchMedia doesn't exist (SSR, jsdom, very old browsers). */
export function usePrefersReducedMotion(): Ref<boolean> {
  const media =
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(QUERY)
      : null;

  const reduced = ref(media?.matches ?? false);
  const onChange = (event: { matches: boolean }) => {
    reduced.value = event.matches;
  };

  onMounted(() => media?.addEventListener("change", onChange));
  onBeforeUnmount(() => media?.removeEventListener("change", onChange));

  return reduced;
}
