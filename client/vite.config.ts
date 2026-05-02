import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
const BUILD_SAFE =
  process.env.BUILD_SAFE === 'true' || process.env.BUILD_SAFE === '1';

function getManualChunk(id: string): string | undefined {
  const normalizedId = id.replace(/\\/g, '/');

  if (normalizedId.includes('node_modules')) {
    if (normalizedId.includes('reactflow')) {
      return 'flow';
    }
    if (normalizedId.includes('/zod/') || normalizedId.includes('/zustand/')) {
      return 'utils';
    }
    if (normalizedId.includes('/react/') || normalizedId.includes('/react-dom/')) {
      return 'vendor';
    }
    if (normalizedId.includes('@supabase/supabase-js')) {
      return 'supabase';
    }
    return undefined;
  }

  if (normalizedId.includes('/client/src/components/LaunchScreen/')) {
    return 'launch-screen';
  }

  if (normalizedId.includes('/client/src/Epic1Editor/')) {
    return 'editor-shell';
  }

  if (normalizedId.includes('/packages/core/components/epic1/')) {
    if (normalizedId.includes('/packages/core/components/epic1/nodes/')) {
      return 'epic1-nodes';
    }
    if (normalizedId.includes('/packages/core/components/epic1/preview/')) {
      return 'epic1-preview';
    }
    if (
      normalizedId.includes('/packages/core/components/epic1/interactions/') ||
      normalizedId.includes('/packages/core/components/epic1/hooks/')
    ) {
      return 'epic1-interactions';
    }
    if (
      normalizedId.includes('/packages/core/components/epic1/asset-browser-integration/') ||
      normalizedId.includes('/packages/core/components/epic1/asset-library/')
    ) {
      return 'epic1-assets';
    }
    return 'epic1-core';
  }

  if (normalizedId.includes('/packages/asset-browser/src/')) {
    return 'asset-browser-ui';
  }

  if (
    normalizedId.includes('/packages/core/services/llm/') ||
    normalizedId.includes('/client/src/lib/simplePromptParser') ||
    normalizedId.includes('/client/src/lib/analysisReconciler')
  ) {
    return 'authoring-tools';
  }

  return undefined;
}

export default defineConfig({
  plugins: [react()],
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
        manualChunks: BUILD_SAFE ? undefined : getManualChunk
      },
      external: [],
      onwarn(warning, warn) {
        if (BUILD_SAFE) {
          if (warning.code === 'CIRCULAR_DEPENDENCY') {
            return;
          }
          if (warning.code === 'EVAL') {
            return;
          }
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
      '@promptscape/core/services/llm': path.resolve(
        __dirname,
        '../packages/core/services/llm/index.ts'
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
    exclude: ['openai']
  },
  // Expose additional prefixes so dynamic lookups like import.meta.env[KEY]
  // work for NEXT_PUBLIC_*, PUBLIC_*, SUPABASE_* in addition to VITE_*
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'PUBLIC_', 'SUPABASE_', 'FEATURE_'],
  define: {
    // Ensure process.env is available for any Node.js checks
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    // Expose Supabase envs to the client even if provided under alternate names in Netlify UI
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
      process.env.VITE_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.PUBLIC_SUPABASE_URL ||
        ''
    ),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
      process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.PUBLIC_SUPABASE_ANON_KEY ||
        ''
    ),
    'import.meta.env.VITE_FEATURE_SUPABASE': JSON.stringify(
      process.env.VITE_FEATURE_SUPABASE ??
        process.env.NEXT_PUBLIC_FEATURE_SUPABASE ??
        process.env.FEATURE_SUPABASE ??
        '1'
    ),
    // Provide a global bag to support dynamic lookups at runtime
    // Our supabaseFeature.ts reads globalThis.__env__ as a final fallback
    'globalThis.__env__': JSON.stringify({
      VITE_SUPABASE_URL:
        process.env.VITE_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.PUBLIC_SUPABASE_URL ||
        '',
      VITE_SUPABASE_ANON_KEY:
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.PUBLIC_SUPABASE_ANON_KEY ||
        '',
      VITE_FEATURE_SUPABASE:
        process.env.VITE_FEATURE_SUPABASE ??
        process.env.NEXT_PUBLIC_FEATURE_SUPABASE ??
        process.env.FEATURE_SUPABASE ??
        '1',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      NEXT_PUBLIC_FEATURE_SUPABASE:
        process.env.NEXT_PUBLIC_FEATURE_SUPABASE ?? ''
    })
  }
});
