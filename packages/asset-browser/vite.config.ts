import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Use classic runtime to avoid JSX transform issues
      jsxRuntime: 'classic'
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'AssetBrowser',
      formats: ['es'],
      fileName: () => 'index.esm.js'
    },
    rollupOptions: {
      // Externalize all React-related packages
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
        // Use interop for better compatibility
        interop: 'auto',
        // Ensure imports are preserved
        preserveModules: false,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true
  }
});
