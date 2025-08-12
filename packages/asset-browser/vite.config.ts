import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'AssetBrowser',
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es' ? 'index.esm.js' : 'index.cjs')
    },
    rollupOptions: {
      // Also externalize the JSX runtime to prevent bundling
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'fuse.js',
        'zustand',
        'react-window'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React',
          'react/jsx-dev-runtime': 'React'
        }
      }
    },
    sourcemap: true
  }
});
