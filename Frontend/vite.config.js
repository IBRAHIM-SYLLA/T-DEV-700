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
    host: true,      // 👈 rend Vite accessible depuis l’extérieur (Docker)
    port: 3000,      // 👈 port exposé par le conteneur
    strictPort: true,
    watch: {
      usePolling: true, // 👈 utile pour que les changements soient détectés dans Docker
    },
  },
  preview: {
    port: 4173,
  },
})
