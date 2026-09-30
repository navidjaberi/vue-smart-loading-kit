import { createApp } from 'vue'
import VueSmartLoadingKit from 'vue-smart-loading-kit'
import App from './App.vue'

createApp(App)
  // app-wide defaults (see "Global config" in the README)
  .use(VueSmartLoadingKit, { pageProgress: { color: '#7c3aed', thickness: 3 } })
  .mount('#app')
