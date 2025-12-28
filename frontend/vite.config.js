import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite Configuration
 * ------------------
 * - React plugin for JSX support
 * - Tailwind CSS plugin for styling
 * - Proxy for API calls to backend
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true, // Listen on all network interfaces (allows access from other devices)
    // Proxy API calls to Spring Boot backend
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
