import type { App } from 'vue'
import Skeleton from './components/Skeleton/Skeleton.vue'
import Spinner from './components/Spinner/Spinner.vue'
export { Skeleton, Spinner }
export type {
  SkeletonBaseProps,
  SkeletonVariantName,
  SkeletonAnimationName,
  SkeletonOutline,
} from './components/Skeleton/types'
export type {
  SpinnerProps,
  SpinnerVariantName,
  SpinnerType,
} from './components/Spinner/spinner.types'
export default {
  install(app: App) {
    app.component('Skeleton', Skeleton)
    app.component('Spinner', Spinner)
  }
}
