import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
const BUILD_SAFE =
  process.env.BUILD_SAFE === 'true' || process.env.BUILD_SAFE === '1';

function getManualChunk(id) {
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
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/zod/, /node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks: BUILD_SAFE ? undefined : getManualChunk
      }
    }
  },
  server: {
    port: 3000,
    strictPort: false
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
