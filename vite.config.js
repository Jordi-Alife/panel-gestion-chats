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
    emptyOutDir: true, // limpia el directorio antes de compilar
    lib: {
      entry: 'src/main.jsx', // ajusta si tu entry point es diferente
      name: 'NextLivesChatWidget', // nombre global accesible si se usa <script>
      fileName: (format) => `nextlives-widget.${format}.js`,
      formats: ['iife'] // formato embebible
    },
    rollupOptions: {
      external: [], // si no quieres empaquetar alguna dependencia externa
      output: {
        globals: {} // define nombres globales si tienes externas
      }
    }
  },
  server: {
    host: true, // permite acceso local/red
    port: 3000
  },
  preview: {
    host: true,
    port: 3000
  }
});
