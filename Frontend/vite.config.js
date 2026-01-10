import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true,
    port: Number(process.env.FRONTEND_PORT) || 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: `http://backend:${process.env.BACKEND_PORT || 5001}`,
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    },
  },
  preview: {
    port: 4173,
  },
  base: '/'
})
