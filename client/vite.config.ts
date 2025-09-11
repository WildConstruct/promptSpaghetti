import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

// https://vitejs.dev/config/
const BUILD_SAFE =
  process.env.BUILD_SAFE === 'true' || process.env.BUILD_SAFE === '1';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Include polyfills needed by OpenAI SDK
      include: ['stream', 'fs', 'path', 'http', 'https', 'zlib', 'url', 'util'],
      globals: {
        process: true,
        Buffer: true,
        global: true
      }
    })
  ],
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js'
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: !BUILD_SAFE,
    commonjsOptions: {
      include: [/zod/, /node_modules/, /@prompt\/asset-browser/]
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          flow: ['reactflow'],
          utils: ['zod', 'zustand']
        }
      },
      external: [],
      onwarn(warning, warn) {
        if (BUILD_SAFE) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') return;
          if (warning.code === 'EVAL') return;
        }
        // Suppress warnings about unresolved dynamic imports for asset-browser
        if (
          warning.code === 'UNRESOLVED_IMPORT' &&
          warning.source === '@prompt/asset-browser'
        ) {
          return;
        }
        warn(warning);
      }
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true
        // leave path as-is
      }
    }
  },
  resolve: {
    alias: {
      '@promptscape/core': path.resolve(__dirname, '../packages/core'),
      '@prompt/asset-browser': path.resolve(
        __dirname,
        '../packages/asset-browser/src'
      ),
      // Redirect OpenAI to use web runtime instead of node runtime
      'openai/_shims/node-runtime.mjs': 'openai/_shims/web-runtime.mjs',
      'openai/_shims/node-runtime': 'openai/_shims/web-runtime',
      'openai/shims/node': 'openai/shims/web',
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
      )
    },
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'zod',
      'zustand',
      'reactflow'
    ]
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
    ],
    exclude: ['openai'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  define: {
    // Ensure process.env is available for any Node.js checks
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
