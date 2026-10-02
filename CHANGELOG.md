# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `v-skeleton` restores an aria attribute bound to `false` as `"false"`,
  the way Vue renders it, instead of removing it.
- The automatic highlight no longer treats a malformed hex color such as
  `#12345z` as valid.

## [0.3.0] - 2026-10-02

### Added

- **`v-skeleton`**: turns real rendered content into a skeleton with the
  identical layout (one bar per text line, solid images and controls,
  container borders kept) using CSS only, so nothing moves. It supports
  `delay` and `minDuration`, is `inert` and `aria-hidden` while shown,
  restores your own aria attributes, renders in SSR for `delay: 0`, and
  offers `data-skeleton="ignore"`, `"block"` and `"text"` for per-element
  control.
- `SmartLoader` `mode="skeletonize"`: keeps the content and skeletonizes it,
  with SmartLoader's timing, error state and `label` announcement.

## [0.2.0] - 2026-09-30

### Added

- **`SmartLoader`**: wraps content and shows a loader only when a load lasts
  longer than `delay` (default 200ms), then keeps it for at least `minDuration`
  (default 500ms). `mode="replace"` swaps the content for a skeleton, and
  `mode="overlay"` dims the content and centers a spinner over it. It also
  supports a `#loader` slot, a `label`, and `aria-busy` from the moment loading
  starts.
- `SmartLoader` error state: an `error` prop shows a message with a **Try
  again** button (`retry` event, `role="alert"`), customizable via the
  `#error` slot. During a retry the error stays until the loader appears.
- `SmartLoader` keeps the content's height while the loader stands in for it
  (`replace` mode, `preserveHeight`, on by default), so the page below doesn't
  jump.
- **`useDelayedLoading`**: the timing logic behind `SmartLoader`, exported for
  loaders you render yourself.
- **`PageProgress`**: a bar pinned to the top of the page for route changes
  and requests. It follows a vue-router passed to the plugin (vue-router is
  not a dependency) and any task started with `usePageProgress()`. It counts
  parallel tasks, skips tasks shorter than `delay`, eases toward 90%, and
  fills and fades out on completion.
- **Global config**: `app.use(VueSmartLoadingKit, { skeleton, spinner,
  progressBar, smartLoader, pageProgress })` sets app-wide defaults (an
  explicit prop still wins). `provideLoadingConfig()` overrides them for a
  subtree, or configures the kit without the plugin.
- **`ProgressBar`**: a linear progress indicator, determinate (`value`) or
  indeterminate.
- **Spinner `arc` variant**: a Material-style arc. With `value` (0–100) it
  shows determinate progress, announced as a `progressbar` when labelled.
- Spinner `track` prop for `circle`, `ring` and `arc`.
- Spinner `variant` prop with kebab-case names (`pulse-dots`), matching
  Skeleton.
- TypeScript declarations are now shipped, with exported prop types
  (`SkeletonBaseProps`, `SkeletonOutline`, `SpinnerProps`, ...).
- `SkeletonOutline` type and documentation for the outline's `width` and
  `style`.
- An unknown Skeleton `variant` falls back to `block` and warns in
  development.
- Spinners and `ProgressBar` run at half speed under `prefers-reduced-motion`.
- Server-side rendering support (e.g. Nuxt). Components render without a DOM,
  schedule no timers on the server, and hydrate without mismatches.
- An interactive playground in the repository (`npm run dev`).

### Changed

- **The default Spinner `color` is now `currentColor`** (was `#3b82f6`), so
  spinners inherit the surrounding text color, including in buttons and dark
  mode. Pass `color="#3b82f6"` to keep the previous look.
- Every spinner now renders a `size` × `size` box. The spacing of `dots` and
  `bars` is slightly tighter as a result.
- The Skeleton shimmer now travels along its `angle`, so `90` sweeps left to
  right, and it is visible for most of each cycle instead of a brief flash.

### Deprecated

- The Spinner `type` prop and the camelCase names `pulseDots` and `orbitDots`.
  Use `variant` with `pulse-dots` / `orbit-dots`. Both still work.

### Fixed

- `style.css` shipped the Vite starter's global styles, which restyled the host
  app's `body`, headings, `:root` and `#app`.
- `package.json` pointed `types` at a file that was never built.
- String sizes such as `"3rem"` broke the `ring`, `pulse-dots` and `orbit-dots`
  spinners, and shrank `dots`, `bars` and `orbit` to a few pixels.
- The Skeleton `circle` ignored string sizes.
- Props leaked into the DOM as HTML attributes (e.g. `variant="avatar"` on
  skeleton shapes, `thickness` on spinners that don't use it).
- The Skeleton `image` announced itself with `role="img"` inside a container
  hidden from assistive tech.
- The shimmer was cut off by a hard edge at some angles (e.g. 45° and 236°).
- The `circle` spinner's track was invisible on dark backgrounds, and `orbit`
  always drew a green track.
- The `ring` spinner's segments fell out of order at speeds other than 1.
- An unknown Skeleton variant rendered an empty, zero-height box.
- `SmartLoader` failed to import and could not be used.

## [0.1.0] - 2026-09-24

- Initial release: `Skeleton` (13 variants) and `Spinner` (8 variants).

[Unreleased]: https://github.com/navidjaberi/vue-smart-loading-kit/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/navidjaberi/vue-smart-loading-kit/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/navidjaberi/vue-smart-loading-kit/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/navidjaberi/vue-smart-loading-kit/releases/tag/v0.1.0
