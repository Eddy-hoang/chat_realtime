import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react','react-dom','react-router','react-router-dom'],
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
