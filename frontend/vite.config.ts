import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    // Em desenvolvimento o Vite repassa /api para o Django, como o Nginx faz em produção.
    proxy: { '/api': 'http://localhost:8000' },
  },
})
