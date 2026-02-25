import { defineConfig } from 'vite'
import { reactRouter } from "@react-router/dev/vite"
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    reactRouter()
  ],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
})
