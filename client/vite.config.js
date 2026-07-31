import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api to Express so the browser only ever talks to one
// origin - keeps the auth cookie same-origin without extra CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'http://localhost:3000', changeOrigin: true } },
  },
  build: { outDir: 'dist' },
});
