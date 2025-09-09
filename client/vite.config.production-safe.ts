import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Production config with circular dependency handling
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps to simplify build
    commonjsOptions: {
      include: [/zod/, /node_modules/],
      transformMixedEsModules: true // Help with mixed module formats
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
      },
      // Add onwarn to suppress circular dependency warnings
      onwarn(warning, warn) {
        // Ignore circular dependency warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        // Ignore eval warnings
        if (warning.code === 'EVAL') return;
        // Use default for everything else
        warn(warning);
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
      ),
      openai: path.resolve(__dirname, './src/shims/openai.ts'),
      'openai/shims/node': path.resolve(
        __dirname,
        './src/shims/openai-shim-node.ts'
      ),
      'openai/_shims/node-runtime.mjs': path.resolve(
        __dirname,
        './src/shims/openai-shim-node.ts'
      ),
      '@promptscape/core/services/llm': path.resolve(
        __dirname,
        './src/shims/llm-service.ts'
      ),
      '@promptscape/core/services/llm/LLMService': path.resolve(
        __dirname,
        './src/shims/llm-service.ts'
      ),
      '@promptscape/core/services/SimpleLLMService': path.resolve(
        __dirname,
        './src/shims/llm-service.ts'
      ),
      [path.resolve(__dirname, '../packages/core/services/llm/LLMService.ts')]:
        path.resolve(__dirname, './src/shims/llm-service.ts'),
      [path.resolve(
        __dirname,
        '../packages/core/services/SimpleLLMService.ts'
      )]: path.resolve(__dirname, './src/shims/llm-service.ts')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'reactflow', 'zod', 'zustand'],
    exclude: ['openai'],
    esbuildOptions: {
      // Allow overwriting CommonJS variables
      define: {
        global: 'globalThis'
      }
    }
  }
});
