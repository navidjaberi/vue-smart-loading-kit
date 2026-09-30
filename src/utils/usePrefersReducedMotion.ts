import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

const QUERY = "(prefers-reduced-motion: reduce)";

/** Reactive `prefers-reduced-motion: reduce`.
 *
 *  Starts as false and reads the real preference only once mounted: the
 *  server cannot know it, so reading it during setup would make the first
 *  client render differ from the server HTML (a hydration mismatch).
 *  Stays false where matchMedia doesn't exist (SSR, jsdom, old browsers). */
export function usePrefersReducedMotion(): Ref<boolean> {
  const reduced = ref(false);
  let media: MediaQueryList | null = null;
  const onChange = (event: { matches: boolean }) => {
    reduced.value = event.matches;
  };

  onMounted(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    media = window.matchMedia(QUERY);
    reduced.value = media.matches;
    media.addEventListener("change", onChange);
  });
  onBeforeUnmount(() => media?.removeEventListener("change", onChange));

  return reduced;
}
