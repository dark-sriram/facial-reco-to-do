import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  "base": "/to-do-app/",
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'face-api': ['face-api.js'],
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['face-api.js']
  }
})
