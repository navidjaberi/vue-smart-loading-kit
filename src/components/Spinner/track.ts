/** How a variant's `track` prop resolves:
 *  - `attr` marks the track element (`data-vslk-track`): "auto" or the color;
 *  - `color` is the CSS color to paint it with. */
export function resolveTrack(track: boolean | string | undefined) {
  if (!track) return null;
  return track === true
    ? { attr: "auto", color: "color-mix(in srgb, currentColor 20%, transparent)" }
    : { attr: track, color: track };
}
