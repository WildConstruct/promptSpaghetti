import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/zod/, /node_modules/]
    },
    rollupOptions: {
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
    alias: {
      '@promptscape/core': path.resolve(__dirname, '../packages/core'),
      '@prompt/asset-browser': path.resolve(
        __dirname,
        '../packages/asset-browser/src'
      )
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    dedupe: ['react', 'react-dom', 'zod', 'zustand', 'reactflow']
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'reactflow',
      'zod',
      'zustand',
      'seedrandom',
      '@prompt/asset-browser > react',
      '@prompt/asset-browser > react-dom'
    ]
  },
  define: {
    // Ensure process.env is available for any Node.js checks
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
