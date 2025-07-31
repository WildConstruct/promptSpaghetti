import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Production config for Netlify builds
// Assumes core files are copied to src/core
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/zod/, /node_modules/],
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          flow: ['reactflow'],
          utils: ['zod', 'zustand'],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    // No alias needed in production - core files are local
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', 'zod', 'zustand'],
  },
});
