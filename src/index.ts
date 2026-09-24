import type { App } from 'vue'
import Skeleton from './components/Skeleton/Skeleton.vue'
import Spinner from './components/Spinner/Spinner.vue'
export { Skeleton, Spinner }
import './style.css'
export default {
  install(app: App) {
    app.component('Skeleton', Skeleton)
    app.component('Spinner', Spinner)
  }
}
