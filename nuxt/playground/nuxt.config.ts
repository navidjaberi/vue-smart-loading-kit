export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2026-10-01',
  smartLoadingKit: {
    spinner: { color: '#10b981' },
    pageProgress: { color: '#10b981' },
  },
})
