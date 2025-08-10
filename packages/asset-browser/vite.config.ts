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
      fileName: (format) => (format === 'es' ? 'index.esm.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'fuse.js', 'zustand', 'react-window'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    sourcemap: true,
  },
});
