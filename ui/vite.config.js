import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from "url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
    server: {
        port: 3000,
        proxy: {
            '^/graphql': {
                target: 'http://localhost:4001',
                ws: true,
                changeOrigin: true
            }
        }
    }
})