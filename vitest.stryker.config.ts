import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Unit tests only, for Stryker (mutation testing). Browser tests are too
// slow to rerun for every mutant.
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/browser/**'],
  },
})
