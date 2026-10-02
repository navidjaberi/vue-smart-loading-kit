// Stryker ignorer: never mutate inside Vue's <script setup> compiler macros.
// Vue hoists their arguments out of setup(), so a mutant there references
// Stryker's helpers before they exist and the component fails to compile.
// Prop defaults are covered by the component tests instead.
import { PluginKind, declareValuePlugin } from '@stryker-mutator/api/plugin'

const MACROS = new Set(['defineProps', 'withDefaults', 'defineEmits', 'defineModel', 'defineSlots', 'defineOptions'])

export const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'vue-macros', {
    shouldIgnore(path) {
      if (path.isCallExpression() && MACROS.has(path.node.callee.name)) {
        return 'Vue compiler macro: arguments are hoisted out of setup()'
      }
    },
  }),
]
