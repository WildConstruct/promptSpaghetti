/**
 * Asset Browser Loader Component
 * Conditionally loads the new asset browser or falls back to AssetLibraryV2
 */

import React, { lazy, Suspense } from 'react';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import { Preset } from './asset-library/types';

// Try to lazy load the integrated asset browser
const AssetBrowserIntegrated = lazy(() => 
  import('./AssetBrowserIntegrated')
    .then(module => ({ default: module.AssetBrowserIntegrated }))
    .catch(() => {
      console.log('[AssetBrowserLoader] Failed to load integrated asset browser');
      // Return a component that renders the fallback
      return {
        default: () => null
      };
    })
);

interface AssetBrowserLoaderProps {
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
}

export const AssetBrowserLoader: React.FC<AssetBrowserLoaderProps> = ({
  onPresetDrag,
  onPresetSelect
}) => {
  return (
    <AssetLibraryErrorBoundary>
      <Suspense fallback={
        <AssetLibraryV2
          position="right"
          onPresetDrag={onPresetDrag}
          onPresetSelect={onPresetSelect}
          defaultExpanded={true}
        />
      }>
        <AssetBrowserIntegrated
          onInsert={(preset: any) => {
            if (preset?.data) {
              onPresetSelect?.(preset);
              onPresetDrag?.(preset);
            }
          }}
        />
      </Suspense>
    </AssetLibraryErrorBoundary>
  );
};