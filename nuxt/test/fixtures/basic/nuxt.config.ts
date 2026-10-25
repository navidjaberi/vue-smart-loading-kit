import SmartLoadingKit from '../../../src/module'

export default defineNuxtConfig({
  modules: [SmartLoadingKit],
  compatibilityDate: '2026-10-01',
  smartLoadingKit: {
    spinner: { color: 'rgb(1, 2, 3)' },
    skeleton: { color: 'rgb(4, 5, 6)' },
    pageProgress: { delay: 0 },
  },
})
