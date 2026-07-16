import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'app',
  plugins: [react()],
  server: {
    port: 5273,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:4780',
      '/ws': { target: 'ws://localhost:4780', ws: true },
    },
  },
  build: { outDir: '../dist', emptyOutDir: true },
});
