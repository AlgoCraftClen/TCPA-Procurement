import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Form-Flow/' : '/',
  plugins: [react()],
  build: {
    outDir: 'docs' // GitHub Pages looks for docs folder by default
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
