import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/TCPA-Procurement/' : '/',
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
  publicDir: 'public',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    assetsDir: './',
    rollupOptions: {
      output: {
        assetFileNames: '[name].[ext]'
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5176,
    strictPort: false,
    host: true,
    open: true
  }
});
