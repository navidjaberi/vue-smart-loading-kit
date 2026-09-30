import type { App } from 'vue'
import { LOADING_CONFIG, type LoadingKitConfig } from './config'
import { PAGE_PROGRESS, bindRouter, createPageProgress, type RouterLike } from './utils/pageProgress'
import Skeleton from './components/Skeleton/Skeleton.vue'
import Spinner from './components/Spinner/Spinner.vue'
import SmartLoader from './components/SmartLoader.vue'
import ProgressBar from './components/ProgressBar/ProgressBar.vue'
import PageProgress from './components/PageProgress/PageProgress.vue'
export { Skeleton, Spinner, SmartLoader, ProgressBar, PageProgress }
export { usePageProgress } from './utils/pageProgress'
export type { PageProgress as PageProgressController, RouterLike } from './utils/pageProgress'
export { useDelayedLoading } from './utils/useDelayedLoading'
export { provideLoadingConfig, useLoadingConfig } from './config'
export type { LoadingKitConfig } from './config'

export interface LoadingKitOptions extends LoadingKitConfig {
  /** A vue-router instance: <PageProgress> then follows every navigation. */
  router?: RouterLike
}
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
  install(app: App, options: LoadingKitOptions = {}) {
    const { router, ...config } = options
    app.provide(LOADING_CONFIG, config)

    // one page progress per app (not a module singleton, so SSR requests
    // never share it), driven by the router and by usePageProgress()
    const progress = createPageProgress()
    app.provide(PAGE_PROGRESS, progress)
    if (router) bindRouter(progress, router)

    app.component('Skeleton', Skeleton)
    app.component('Spinner', Spinner)
    app.component('SmartLoader', SmartLoader)
    app.component('ProgressBar', ProgressBar)
    app.component('PageProgress', PageProgress)
  }
}
