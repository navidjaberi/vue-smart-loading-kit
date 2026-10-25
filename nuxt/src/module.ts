import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import type { LoadingKitConfig } from 'vue-smart-loading-kit'

export interface ModuleOptions extends LoadingKitConfig {
  /**
   * Auto-import the components, so only the ones a page uses reach its
   * bundle. Set false to import them yourself from 'vue-smart-loading-kit'.
   * @default true
   */
  components?: boolean
  /**
   * Prefix for the auto-imported component names, e.g. 'Lk' gives
   * <LkSkeleton> and <LkSpinner>. Useful when another library already
   * has a <Skeleton>.
   * @default ''
   */
  prefix?: string
  /**
   * Auto-import usePageProgress, useDelayedLoading, useLoadingConfig and
   * provideLoadingConfig.
   * @default true
   */
  composables?: boolean
  /**
   * Add 'vue-smart-loading-kit/style.css' to the app.
   * @default true
   */
  css?: boolean
  /**
   * Have <PageProgress> follow every route navigation.
   * @default true
   */
  router?: boolean
}

const COMPONENTS = ['Skeleton', 'Spinner', 'SmartLoader', 'ProgressBar', 'PageProgress'] as const
const COMPOSABLES = ['usePageProgress', 'useDelayedLoading', 'useLoadingConfig', 'provideLoadingConfig'] as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-smart-loading-kit',
    configKey: 'smartLoadingKit',
    compatibility: {
      nuxt: '>=3.21.0',
    },
  },
  defaults: {
    components: true,
    prefix: '',
    composables: true,
    css: true,
    router: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const { components, prefix, composables, css, router, ...config } = options

    // Read by the runtime plugin. Public runtime config, so a deploy can
    // still override a value with NUXT_PUBLIC_SMART_LOADING_KIT_* env vars.
    nuxt.options.runtimeConfig.public.smartLoadingKit = defu(
      nuxt.options.runtimeConfig.public.smartLoadingKit as Record<string, unknown> | undefined,
      { config, router },
    )

    if (css) nuxt.options.css.push('vue-smart-loading-kit/style.css')

    if (components) {
      for (const name of COMPONENTS) {
        addComponent({ name: `${prefix}${name}`, export: name, filePath: 'vue-smart-loading-kit' })
      }
    }

    if (composables) {
      addImports(COMPOSABLES.map(name => ({ name, from: 'vue-smart-loading-kit' })))
    }

    // Provides the config and the page progress, and registers v-skeleton
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    smartLoadingKit: {
      config: LoadingKitConfig
      router: boolean
    }
  }
}
