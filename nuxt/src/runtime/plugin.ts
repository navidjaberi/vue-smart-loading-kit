import VueSmartLoadingKit from 'vue-smart-loading-kit'
import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#app'

export default defineNuxtPlugin({
  name: 'smart-loading-kit',
  setup(nuxtApp) {
    const { config, router } = useRuntimeConfig().public.smartLoadingKit

    nuxtApp.vueApp.use(VueSmartLoadingKit, {
      ...config,
      router: router ? useRouter() : undefined,
      // the module auto-imports them instead (tree-shaken, prefixable)
      components: false,
    })
  },
})
