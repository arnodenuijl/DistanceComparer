import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// T092: Production build optimization
export default defineConfig({
  plugins: [vue()],
  build: {
    // Target modern browsers
    target: 'es2020',
    // Minification
    minify: 'esbuild',
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          'leaflet': ['leaflet'],
          'vue-vendor': ['vue'],
        },
      },
    },
    // Bundle size warnings
    chunkSizeWarningLimit: 500, // 500KB target
    // Source maps for debugging (optional)
    sourcemap: false,
  },
  // Development optimizations
  server: {
    hmr: true,
  },
})
