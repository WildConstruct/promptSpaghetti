import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Production config for Netlify builds
// Assumes core files are copied to src/core
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Include crypto and events for browser compatibility
      include: ['crypto', 'events'],
      // Enable globals for better compatibility
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/zod/, /node_modules/]
    },
    rollupOptions: {
      external: [
        'uuid',
        '@juliuste/react-vimeo',
        'vite-plugin-node-polyfills/shims/process'
      ],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          flow: ['reactflow'],
          utils: ['zod', 'zustand']
        }
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true
  },
  resolve: {
    // No alias needed in production - core files are local
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', 'zod', 'zustand']
  }
});
