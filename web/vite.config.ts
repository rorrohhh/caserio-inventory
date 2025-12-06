import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Importante: Rutas relativas para que funcione en NUI
  build: {
    outDir: 'dist', // <--- AQUÍ ESTABA EL ERROR (antes decía '../html')
    emptyOutDir: true, // Esto borra la carpeta dist vieja antes de crear la nueva
  },
})