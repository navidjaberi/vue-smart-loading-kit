import SmartLoadingKit from '../../../src/module'

export default defineNuxtConfig({
  modules: [SmartLoadingKit],
  compatibilityDate: '2026-10-01',
  smartLoadingKit: { prefix: 'Lk', css: false },
})
