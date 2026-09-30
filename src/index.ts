import type { App } from 'vue'
import Skeleton from './components/Skeleton/Skeleton.vue'
import Spinner from './components/Spinner/Spinner.vue'
import SmartLoader from './components/SmartLoader.vue'
import ProgressBar from './components/ProgressBar/ProgressBar.vue'
export { Skeleton, Spinner, SmartLoader, ProgressBar }
export { useDelayedLoading } from './utils/useDelayedLoading'
export type { DelayedLoadingOptions } from './utils/useDelayedLoading'
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
    app.component('SmartLoader', SmartLoader)
    app.component('ProgressBar', ProgressBar)
  }
}
