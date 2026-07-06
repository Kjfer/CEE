import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Evita que Vite congele una versión vieja del generador en caché.
    exclude: ['@cee/certificate-generator'],
  },
  server: {
    watch: {
      ignored: ['**/node_modules/**', '!**/packages/certificate-generator/**'],
    },
  },
});
