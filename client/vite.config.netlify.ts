import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom plugin to handle CommonJS modules
const commonjsCompatibility = () => {
  return {
    name: 'commonjs-compatibility',
    transform(code, id) {
      // Handle validation.js
      if (id.endsWith('validation.js') && code.includes('exports.validateConnection')) {
        return code + '\nexport { validateConnection };';
      }
      // Handle usePreviewSeeds.js
      if (id.endsWith('usePreviewSeeds.js') && code.includes('exports.usePreviewSeeds')) {
        return code + '\nexport { usePreviewSeeds };';
      }
      // Handle nodeSchemas.js
      if (id.endsWith('nodeSchemas.js') && code.includes('exports.nodeSchemas')) {
        return code + '\nexport { nodeSchemas };';
      }
      return null;
    }
  };
};

export default defineConfig({
  plugins: [react(), commonjsCompatibility()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
          return;
        }
        warn(warning);
      }
    }
  }
});