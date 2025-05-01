// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // importante para rutas relativas en producción
  plugins: [react()],
  css: {
    preprocessorOptions: {
      css: {
        charset: false // evita conflictos por doble declaración @charset
      }
    }
  },
  build: {
    outDir: 'dist', // asegura que la salida va a dist/
    emptyOutDir: true // limpia el directorio antes de compilar (opcional, pero recomendado)
  },
  server: {
    host: true, // permite acceder desde red local
    port: 3000
  },
  preview: {
    host: true,
    port: 3000
  }
});
