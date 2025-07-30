import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure unique file names to prevent caching issues
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Clear the dist folder before each build
    emptyOutDir: true,
    // Generate source maps for debugging
    sourcemap: true
  },
  // Prevent caching during development
  server: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  }
})
