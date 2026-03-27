import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    // Proxy API ke backend FastAPI saat dev — tidak perlu CORS config manual
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  // Force pre-bundle semua deck.gl packages BERSAMA-SAMA agar
  // Vite menggabungkan CJS deps (earcut dll) dan menghasilkan satu instance luma.gl
  optimizeDeps: {
    include: [
      'deck.gl',
      '@deck.gl/core',
      '@deck.gl/layers',
      '@deck.gl/mapbox',
      'earcut',
    ]
  }
});
