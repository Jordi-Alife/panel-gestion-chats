import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    port: 3000
  },
  preview: {
    host: true,
    port: 3000
  }
});
