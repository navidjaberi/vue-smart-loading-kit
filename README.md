# Vue Smart Loading Kit

A smart, lightweight, and customizable loading UI library for **Vue 3**.

`vue-smart-loading-kit` provides a collection of ready-to-use **Skeleton** and **Spinner** components designed to make loading states simple, consistent, and easy to customize.

[![npm version](https://img.shields.io/npm/v/vue-smart-loading-kit)](https://www.npmjs.com/package/vue-smart-loading-kit)
[![npm downloads](https://img.shields.io/npm/dm/vue-smart-loading-kit)](https://www.npmjs.com/package/vue-smart-loading-kit)
[![license](https://img.shields.io/npm/l/vue-smart-loading-kit)](https://github.com/navidjaberi/vue-smart-loading-kit/blob/main/LICENSE)

---

## ✨ Features

* Built for **Vue 3**
* Lightweight and easy to integrate
* Multiple Skeleton variants
* Multiple Spinner variants, including a determinate progress arc
* `ProgressBar`: a linear progress indicator, determinate or indeterminate
* `SmartLoader`: no flash for fast loads, no blink for slow ones
* Customizable size, radius, colors, animation, and more
* Responsive by default
* TypeScript support
* Works with both local and global component registration
* No runtime dependency on Vue — Vue is provided as a peer dependency
* MIT licensed

---

## 📦 Installation

Install the package using npm:

```bash
npm install vue-smart-loading-kit
```

Or with pnpm:

```bash
pnpm add vue-smart-loading-kit
```

Or with yarn:

```bash
yarn add vue-smart-loading-kit
```

---

## 🚀 Quick Start

### Local registration

Import the components you need:

```vue
<script setup lang="ts">
import { Skeleton, Spinner } from 'vue-smart-loading-kit'
import 'vue-smart-loading-kit/style.css'
</script>

<template>
  <Skeleton variant="text" />
  <Spinner variant="dots" />
</template>
```

### Global registration

You can also install the library globally:

```ts
import { createApp } from 'vue'
import App from './App.vue'
import VueSmartLoadingKit from 'vue-smart-loading-kit'
import 'vue-smart-loading-kit/style.css'

const app = createApp(App)

app.use(VueSmartLoadingKit)

app.mount('#app')
```

After global registration, the components can be used directly:

```vue
<template>
  <Skeleton variant="text" />
  <Spinner variant="dots" />
</template>
```

---

# 🧩 Skeleton

The `Skeleton` component provides predefined loading placeholders for common UI patterns.

## Available Variants

| Variant   | Description                 |
| --------- | --------------------------- |
| `text`    | Text/content placeholder    |
| `block`   | Generic rectangular block   |
| `circle`  | Circular placeholder        |
| `avatar`  | Circular avatar placeholder |
| `button`  | Button-shaped placeholder   |
| `input`   | Input-shaped placeholder    |
| `card`    | Card placeholder            |
| `article` | Article/content placeholder |
| `profile` | Profile layout placeholder  |
| `image`   | Image/media placeholder     |
| `list`    | List-style placeholder      |
| `grid`    | Grid-style placeholder      |
| `table`   | Table-style placeholder     |

### Example

```vue
<template>
  <div class="example">
    <Skeleton variant="text" />
    <Skeleton variant="avatar" />
    <Skeleton variant="card" />
    <Skeleton variant="image" />
  </div>
</template>
```

---

## 🎨 Customization

Skeleton components can be customized through their available props.

### Size

Numeric values are automatically converted to pixels:

```vue
<Skeleton variant="avatar" :size="72" />
```

You can also provide CSS size values:

```vue
<Skeleton variant="avatar" size="4rem" />
```

### Radius

```vue
<Skeleton variant="avatar" :radius="12" />
```

Or use any valid CSS value:

```vue
<Skeleton variant="avatar" radius="50%" />
```

### Animation

Skeleton animations can be changed or disabled:

```vue
<Skeleton variant="avatar" animation="pulse" />
```

Disable animation:

```vue
<Skeleton variant="avatar" animation="none" />
```

### Custom colors

```vue
<Skeleton
  variant="avatar"
  color="#7c3aed"
  highlight="#41B780"
/>
```

### Outlined mode

```vue
<Skeleton
  variant="avatar"
  outlined
/>
```

Pass an object to control the border's thickness and style:

```vue
<Skeleton
  variant="card"
  :outlined="{ width: 2, style: 'dashed' }"
/>
```

| Field     | Type               | Default   | Notes                                              |
| --------- | ------------------ | --------- | -------------------------------------------------- |
| `width`   | `number \| string` | `1`       | Numbers are px; strings accept any CSS length.     |
| `style`   | `string`           | `"solid"` | Any CSS `border-style` (`dashed`, `dotted`, ...).  |
| `enabled` | `boolean`          | `true`    | Set `false` to turn the outline off from a config. |

The outline applies to every shape of composite variants (`card`, `table`, `list`, ...). The border is drawn inside each shape, so a width close to a shape's height — such as the 10px text lines in `profile` — fills the shape completely.

---

# ⏳ Spinner

`Spinner` provides lightweight animated loading indicators for smaller loading states.

## Available Variants

| Variant      | Description          |
| ------------ | -------------------- |
| `circle`     | Spinning circle (default) |
| `dots`       | Dots loader          |
| `pulse`      | Pulse loader         |
| `pulse-dots` | Pulsing dots loader  |
| `orbit`      | Orbit-style loader   |
| `orbit-dots` | Orbiting dots loader |
| `ring`       | Ring loader          |
| `bars`       | Animated bars loader |
| `arc`        | Material-style arc; also a progress indicator via `value` |

### Example

```vue
<template>
  <Spinner variant="dots" />
  <Spinner variant="pulse" />
  <Spinner variant="arc" />
</template>
```

Spinners use the surrounding text color by default (`currentColor`), so they fit buttons and dark mode without any configuration:

```vue
<button :disabled="saving">
  <Spinner v-if="saving" variant="arc" size="1em" :thickness="2" />
  Save
</button>
```

### Progress

Pass `value` (0–100) to `arc` to show determinate progress, for example during an upload:

```vue
<Spinner variant="arc" :value="uploadPercent" track label="Uploading file" />
```

With a `label`, it is announced to screen readers as a `progressbar` with the current percentage. Other variants ignore `value` and log a warning in development. For a linear bar, see `ProgressBar` below.

---

# 📶 ProgressBar

A linear progress indicator. It fills to `value` (0–100), or shows a sliding segment when `value` is left out.

```vue
<!-- determinate: e.g. a file upload -->
<ProgressBar :value="uploadPercent" label="Uploading report.pdf" />

<!-- indeterminate: e.g. a thin bar at the top of the page -->
<ProgressBar :thickness="3" :track="false" />
```

| Prop        | Type                | Default          | Notes                                                        |
| ----------- | ------------------- | ---------------- | ------------------------------------------------------------ |
| `value`     | `number`            | —                | 0–100. Out-of-range values are clamped; omit for indeterminate. |
| `color`     | `string`            | `"currentColor"` | Inherits the text color unless set.                          |
| `track`     | `boolean \| string` | `true`           | The background rail. A string sets its color.                |
| `thickness` | `number`            | `4`              | Bar height in px. The bar always spans the container's width. |
| `speed`     | `number`            | `1`              | Speed of the indeterminate animation.                        |
| `label`     | `string`            | —                | Announced as a `progressbar` with its percentage, or as a live status when indeterminate. |

Like the spinners, it runs at half speed under `prefers-reduced-motion`.

---

# 🧠 SmartLoader

`SmartLoader` wraps content and decides **when** a loader is worth showing:

* a load shorter than `delay` never shows a loader, so fast requests don't flash;
* once shown, the loader stays for at least `minDuration`, so it never just blinks;
* if loading restarts while the loader is still up, it simply stays.

```vue
<SmartLoader :loading="loading" :skeleton="{ variant: 'list' }">
  <UserList :users="users" />
</SmartLoader>
```

## Modes

| Mode                  | While loading                                                                  | Good for                          |
| --------------------- | ------------------------------------------------------------------------------ | --------------------------------- |
| `replace` (default)   | Swaps the content for a skeleton                                               | First load, when there is no data |
| `overlay`             | Keeps the content, dimmed and `inert`, and centers a spinner over it            | Refreshing data, submitting forms |

```vue
<SmartLoader :loading="saving" mode="overlay" :spinner="{ variant: 'arc' }">
  <ProfileForm />
</SmartLoader>
```

## Props

| Prop          | Type                     | Default     | Notes                                                                 |
| ------------- | ------------------------ | ----------- | --------------------------------------------------------------------- |
| `loading`     | `boolean`                | required    |                                                                       |
| `mode`        | `"replace" \| "overlay"` | `"replace"` |                                                                       |
| `delay`       | `number`                 | `200`       | ms a load must last before the loader appears. `0` shows it at once.  |
| `minDuration` | `number`                 | `500`       | ms the loader stays once shown.                                       |
| `skeleton`    | Skeleton props           | 3 text lines | Default loader in `replace` mode.                                    |
| `spinner`     | Spinner props            | `arc`       | Default loader in `overlay` mode.                                     |
| `label`       | `string`                 | —           | Announced to screen readers while the loader is visible.             |

Use the `#loader` slot to render your own loader instead. The wrapper gets `aria-busy="true"` as soon as `loading` starts, even before the loader appears.

## `useDelayedLoading`

The same timing logic is available as a composable, for loaders you render yourself:

```ts
import { useDelayedLoading } from 'vue-smart-loading-kit'

const showLoader = useDelayedLoading(loading, { delay: 200, minDuration: 500 })
```

`loading` and both options may be refs or getters.

---

# 🎯 Usage Examples

### Loading a user profile

```vue
<template>
  <div v-if="loading">
    <Skeleton variant="profile" />
  </div>

  <div v-else>
    <h2>{{ user.name }}</h2>
    <p>{{ user.bio }}</p>
  </div>
</template>
```

### Loading a card list

```vue
<template>
  <div v-if="loading">
    <Skeleton variant="grid" />
  </div>

  <div v-else>
    <!-- Your content -->
  </div>
</template>
```

### Button loading state

```vue
<button :disabled="loading">
  <Spinner v-if="loading" variant="dots" />
  <span v-else>Submit</span>
</button>
```

---

# 🛠️ TypeScript

The library ships with TypeScript declarations out of the box, so component props and public APIs are typed automatically when used in TypeScript projects.

```ts
import { Skeleton, Spinner, ProgressBar, SmartLoader, useDelayedLoading } from 'vue-smart-loading-kit'
import type { SkeletonVariantName, SpinnerProps } from 'vue-smart-loading-kit'
```

---

# 📚 API Overview

## Skeleton

Common customization options include:

* `variant`
* `size`
* `radius`
* `animation`
* `speed`
* `color`
* `highlight`
* `outlined`

Example:

```vue
<Skeleton
  variant="avatar"
  :size="64"
  :radius="12"
  animation="shimmer"
  :speed="1"
  color="#e5e7eb"
  highlight="#f3f4f6"
  outlined
/>
```

## Spinner

Spinner variants provide different loading animations while keeping the component simple to integrate into existing interfaces.

```vue
<Spinner variant="ring" :size="48" color="#7c3aed" :speed="1.5" :thickness="3" label="Loading" />
```

| Prop        | Type                | Default          | Notes                                                        |
| ----------- | ------------------- | ---------------- | ------------------------------------------------------------ |
| `variant`   | see table above     | `"circle"`       |                                                              |
| `size`      | `number \| string`  | `40`             | Every variant renders a `size` x `size` box.                 |
| `color`     | `string`            | `"currentColor"` | Inherits the text color unless set.                          |
| `speed`     | `number`            | `1`              |                                                              |
| `thickness` | `number`            | `4`              | Stroke width in px for `circle`, `ring` and `arc`.           |
| `track`     | `boolean \| string` | variant default  | Faint circle behind `circle` (on by default), `ring`, `arc`. A string sets its color. |
| `value`     | `number`            | —                | 0–100, `arc` only: turns it into a progress indicator.       |
| `label`     | `string`            | —                | Makes the spinner announce itself to screen readers.         |

`size` accepts a number (px) or any CSS length (`"3rem"`, `"50%"`). When the user has `prefers-reduced-motion: reduce` enabled, spinners run at half speed instead of stopping, so the page never looks frozen.

> The `type` prop and camelCase names (`pulseDots`, `orbitDots`) from v0.1.0 still work but are deprecated in favor of `variant`.

---

# 🏗️ Development

Clone the repository:

```bash
git clone https://github.com/navidjaberi/vue-smart-loading-kit.git
cd vue-smart-loading-kit
```

Install dependencies:

```bash
npm install
```

Start the interactive playground, which imports the components straight from `src/` so edits show up live:

```bash
npm run dev
```

Every variant has its own controls and a copyable code snippet, plus a view that compares all variants side by side. The playground lives in `playground/` and is not part of the published package.

Run tests:

```bash
npm test
```

Build the library:

```bash
npm run build
```

---

# 🧪 Testing

The project includes a comprehensive test suite covering Skeleton and Spinner components.

Run all tests with:

```bash
npm test
```

---

# 📦 Build

The package is built with Vite and provides both ESM and UMD/CommonJS-compatible outputs for broader ecosystem compatibility.

```bash
npm run build
```

Generated files are placed in the `dist` directory.

---

# 🤝 Contributing

Contributions, bug reports, feature requests, and pull requests are welcome.

Before submitting a pull request, please make sure your changes pass the test suite:

```bash
npm test
```

---

# 📄 License

MIT © [Navid Jaberi](https://github.com/navidjaberi)

---

## ⭐ Support

If `vue-smart-loading-kit` is useful for your project, consider giving the repository a star on GitHub.

Made with ❤️ for the Vue community.
