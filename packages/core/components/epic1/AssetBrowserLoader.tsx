/**
 * Asset Browser Loader Component
 * Conditionally loads the new asset browser or falls back to AssetLibraryV2
 */

import React, { lazy, Suspense } from 'react';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import { Preset } from './asset-library/types';

// Try to lazy load the asset browser components
let AssetBrowserComponent: React.ComponentType<any> | null = null;
let isAssetBrowserAvailable = false;

// Check if we're in development and the package might be available
if (process.env.NODE_ENV === 'development') {
  try {
    // This will only work if the package is properly linked
    AssetBrowserComponent = lazy(() => 
      import('@prompt/asset-browser').then(module => ({
        default: () => {
          const { TabbedAssetBrowser, UserProvider } = module;
          return (props: any) => (
            <UserProvider>
              <TabbedAssetBrowser {...props} />
            </UserProvider>
          );
        }
      }))
    );
    isAssetBrowserAvailable = true;
  } catch (e) {
    console.log('[AssetBrowserLoader] Asset browser not available in development');
  }
}

interface AssetBrowserLoaderProps {
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
}

export const AssetBrowserLoader: React.FC<AssetBrowserLoaderProps> = ({
  onPresetDrag,
  onPresetSelect
}) => {
  // In production or if asset browser not available, use AssetLibraryV2
  if (!isAssetBrowserAvailable || !AssetBrowserComponent) {
    return (
      <AssetLibraryV2
        position="right"
        onPresetDrag={onPresetDrag}
        onPresetSelect={onPresetSelect}
        defaultExpanded={true}
      />
    );
  }

  // In development with asset browser available
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
        <AssetBrowserComponent
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