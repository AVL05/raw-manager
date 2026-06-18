import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    // Proxy API calls to Laravel backend (avoids CORS issues in dev)
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
      },
    },

    // Required for Docker volume file watching
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          router: ['react-router-dom'],
        },
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
