import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // allow access from Docker container
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5000', // container-to-container call
        changeOrigin: true
      }
    }
  }
})
