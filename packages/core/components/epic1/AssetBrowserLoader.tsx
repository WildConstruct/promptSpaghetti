/**
 * Asset Browser Loader Component
 * Conditionally loads the new asset browser or falls back to AssetLibraryV2
 */

import React from 'react';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import type { Preset } from '@prompt/asset-browser';

interface AssetBrowserLoaderProps {
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  onInsert?: (preset: Preset) => void;
}

type LoaderStatus = 'pending' | 'ready' | 'fallback';

export const AssetBrowserLoader: React.FC<AssetBrowserLoaderProps> = props => {
  const { onInsert, onPresetDrag, onPresetSelect } = props;
  const [status, setStatus] = React.useState<LoaderStatus>('pending');
  const [IntegratedComponent, setIntegratedComponent] =
    React.useState<React.ComponentType<{ onInsert?: (preset: Preset) => void }> | null>(null);

  React.useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const module = await import('./AssetBrowserIntegrated');
        if (!active) {
          return;
        }
        console.log('[AssetBrowserLoader] Asset browser module is available');
        setIntegratedComponent(() => module.AssetBrowserIntegrated);
        setStatus('ready');
      } catch (error) {
        console.error('[AssetBrowserLoader] Failed to load integrated asset browser:', error);
        console.log('[AssetBrowserLoader] Asset browser module not available, using fallback');
        if (active) {
          setStatus('fallback');
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const forwardSelect = React.useCallback(
    (preset: Preset) => {
      console.log('[AssetBrowserLoader] forwardSelect insert:', preset?.id, preset?.path);
      onPresetSelect?.(preset);
      onInsert?.(preset);
    },
    [onInsert, onPresetSelect]
  );

  const renderFallback = () => (
    <AssetLibraryV2
      defaultExpanded={true}
      onPresetDrag={preset => onPresetDrag?.(preset as unknown as Preset)}
      onPresetSelect={preset => forwardSelect(preset as unknown as Preset)}
    />
  );

  if (status === 'fallback') {
    return <AssetLibraryErrorBoundary>{renderFallback()}</AssetLibraryErrorBoundary>;
  }

  if (status === 'ready' && IntegratedComponent) {
    return (
      <AssetLibraryErrorBoundary>
        <IntegratedComponent
          onInsert={preset => {
            console.log('[AssetBrowserLoader] Forwarding preset insert:', preset);
            onInsert?.(preset);
          }}
        />
      </AssetLibraryErrorBoundary>
    );
  }

  return (
    <AssetLibraryErrorBoundary>
      <div style={{ padding: 12, color: '#9ca3af' }}>
        Loading Asset Browser…
      </div>
    </AssetLibraryErrorBoundary>
  );
};
