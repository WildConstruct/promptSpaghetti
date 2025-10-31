/**
 * Asset Browser Loader Component
 * Conditionally loads the new asset browser or falls back to AssetLibraryV2
 */

import React, { lazy, Suspense } from 'react';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import type { Preset } from '@prompt/asset-browser';

// Try to lazy load the integrated asset browser
const AssetBrowserIntegrated = lazy(() => 
  import('./AssetBrowserIntegrated')
    .then(module => {
      console.log('[AssetBrowserLoader] Successfully loaded asset browser module:', module);
      return { default: module.AssetBrowserIntegrated };
    })
    .catch((error) => {
      console.error('[AssetBrowserLoader] Failed to load integrated asset browser:', error);
      // Return a component that renders the fallback
      return {
        default: () => null
      };
    })
);

interface AssetBrowserLoaderProps {
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  onInsert?: (preset: Preset) => void;
}

export const AssetBrowserLoader: React.FC<AssetBrowserLoaderProps> = props => {
  const { onInsert } = props;
  const [loadFailed, setLoadFailed] = React.useState(false);

  const LoadingPlaceholder = () => (
    <div style={{ padding: 12, color: '#9ca3af' }}>
      Loading Asset Browser…
    </div>
  );

  React.useEffect(() => {
    // Check if the component actually loaded
    import('./AssetBrowserIntegrated')
      .then(() => {
        console.log('[AssetBrowserLoader] Asset browser module is available');
      })
      .catch(() => {
        console.log('[AssetBrowserLoader] Asset browser module not available, using fallback');
        setLoadFailed(true);
      });
  }, []);

  // If load failed, use fallback directly
  if (loadFailed) {
    return (
      <div style={{ padding: 12 }}>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>Asset Browser failed to load</div>
        <div style={{ color: '#6b7280', marginBottom: 8 }}>Please reload the page or try again.</div>
        <button onClick={() => {
          setLoadFailed(false);
          // Re-trigger dynamic import check
          import('./AssetBrowserIntegrated').catch(() => setLoadFailed(true));
        }}>Retry</button>
      </div>
    );
  }

  return (
    <AssetLibraryErrorBoundary>
      <Suspense fallback={<LoadingPlaceholder />}>
        <AssetBrowserIntegrated
          onInsert={preset => {
            console.log('[AssetBrowserLoader] Forwarding preset insert:', preset);
            onInsert?.(preset);
          }}
        />
      </Suspense>
    </AssetLibraryErrorBoundary>
  );
};
