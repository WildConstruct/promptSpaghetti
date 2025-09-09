import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Epic 1 MVP Build Configuration
// Excludes all non-essential components for clean deployment

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@core': path.resolve(__dirname, './packages/core')
    }
  },

  build: {
    outDir: 'dist-epic1',

    rollupOptions: {
      // Exclude deprecated components from bundle
      external: [
        // Skip all auth-related imports
        /.*\/auth\/.*/,
        /.*\/admin\/.*/,
        /.*\/marketplace\/.*/,
        /.*\/analytics\/.*/,
        /.*\/security\/.*/,
        /.*\/consent\/.*/,
        /.*\/collaboration\/.*/,
        /.*\/payment\/.*/,
        /.*\/revenue\/.*/,
        /.*\/moderation\/.*/,
        /.*\/deprecated\/.*/
      ],

      input: {
        main: path.resolve(__dirname, 'client/index.html')
      },

      output: {
        // Smaller chunks for faster loading
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-flow-renderer'],
          'core-engine': ['@core/runtime'],
          'ui-components': ['@core/GraphEditor', '@core/PreviewModal']
        }
      }
    },

    // Aggressive tree-shaking
    treeshake: {
      preset: 'recommended',
      moduleSideEffects: false
    },

    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    }
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-flow-renderer',
      'zustand',
      'zod',
      'seedrandom'
    ],
    exclude: [
      // Exclude all non-MVP packages
      '@sentry/react',
      'firebase',
      '@stripe/stripe-js',
      'analytics'
    ]
  },

  server: {
    port: 3000
  }
});
