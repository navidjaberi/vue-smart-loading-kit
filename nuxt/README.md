# nuxt-smart-loading-kit

Nuxt module for [vue-smart-loading-kit](https://github.com/navidjaberi/vue-smart-loading-kit): turn your real components into their own skeleton with `v-skeleton`, plus spinners, progress bars and a route progress bar. SSR-safe, auto-imported, works with Nuxt 3 and 4.

[![npm version](https://img.shields.io/npm/v/nuxt-smart-loading-kit)](https://www.npmjs.com/package/nuxt-smart-loading-kit)
[![license](https://img.shields.io/npm/l/nuxt-smart-loading-kit)](https://github.com/navidjaberi/vue-smart-loading-kit/blob/main/LICENSE)

<p align="center">
  <img src="https://raw.githubusercontent.com/navidjaberi/vue-smart-loading-kit/main/docs/v-skeleton.gif" alt="Two user cards switching between their real content and their own skeleton, without moving" width="652">
</p>

**[▶ Live demo](https://navidjaberi.github.io/vue-smart-loading-kit/)**

## Setup

```bash
npx nuxi module add nuxt-smart-loading-kit
```

or by hand:

```bash
npm install nuxt-smart-loading-kit
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-smart-loading-kit'],
})
```

That's it. No plugin file, no CSS import.

## What the module does

- Registers the `v-skeleton` directive, rendered on the server too, so a loading card is a skeleton in the first HTML.
- Auto-imports `<Skeleton>`, `<Spinner>`, `<SmartLoader>`, `<ProgressBar>` and `<PageProgress>`. A page only ships the ones it uses.
- Auto-imports `usePageProgress()`, `useDelayedLoading()`, `useLoadingConfig()` and `provideLoadingConfig()`.
- Connects `<PageProgress>` to the router, so it follows every navigation.
- Adds the stylesheet.

```vue
<script setup lang="ts">
const { data: user, status } = await useFetch('/api/user', { lazy: true })
</script>

<template>
  <PageProgress />
  <UserCard v-skeleton="status === 'pending'" :user="user ?? placeholderUser" />
</template>
```

`<PageProgress>` and Nuxt's own `<NuxtLoadingIndicator>` do the same job; use one of them. `<PageProgress>` also tracks your own tasks through `usePageProgress()`:

```ts
const progress = usePageProgress()
progress.start()
await $fetch('/api/export', { method: 'POST' })
progress.done()
```

## Options

```ts
export default defineNuxtConfig({
  modules: ['nuxt-smart-loading-kit'],
  smartLoadingKit: {
    // module options
    prefix: 'Lk',        // <LkSkeleton>, <LkSpinner>, ... (default '')
    components: true,    // auto-import the components
    composables: true,   // auto-import the composables
    css: true,           // add vue-smart-loading-kit/style.css
    router: true,        // <PageProgress> follows navigation

    // app-wide defaults, same as app.use(VueSmartLoadingKit, { ... })
    skeleton: { animation: 'pulse' },
    spinner: { variant: 'dots', color: '#10b981' },
    pageProgress: { color: '#10b981' },
  },
})
```

Use `prefix` when another library already has a `<Skeleton>` or `<Spinner>`. Every config key and component prop is documented in the [main README](https://github.com/navidjaberi/vue-smart-loading-kit#readme).

## Development

```bash
# from the repository root, build the kit the module uses
npm ci && npm run build && npm pack --pack-destination nuxt

cd nuxt
npm pkg set dependencies.vue-smart-loading-kit="file:./$(ls vue-smart-loading-kit-*.tgz)"
npm install
npm run dev:prepare
npm run dev          # playground
npm test             # SSR + browser tests (fixtures in test/fixtures)
npm run test:types
```

Revert the `file:` dependency before publishing.

## License

MIT
