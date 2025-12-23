import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Importante: Rutas relativas para que funcione en NUI
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})