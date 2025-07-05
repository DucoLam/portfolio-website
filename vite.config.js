import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
  ],
  server: {
    port: 80,
    host: true,
    allowedHosts: 'all',
  },
  build: {
    target: 'es2015',
  }
})