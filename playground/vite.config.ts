import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Run from the package root: `npm run dev` / `npm run build:playground`.
export default defineConfig({
  // Relative asset URLs, so the build works under any path (GitHub Pages
  // serves it from /vue-smart-loading-kit/).
  base: './',
  plugins: [vue()],
  resolve: {
    // Import the library straight from source: edits show up instantly,
    // no `npm run build` needed. Component styles come with the SFCs.
    alias: [
      {
        find: /^vue-smart-loading-kit$/,
        replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
      },
    ],
  },
  // PORT lets tooling run a second copy alongside the default 5173
  server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : {},
})
