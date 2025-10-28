import React from 'react';
import '../styles.css';
import { Sidebar } from './Sidebar';
import { PresetGrid } from './PresetGrid';
import { DetailsDrawer } from './DetailsDrawer';
import { KeyboardNavigatorProvider } from '../providers/KeyboardNavigator';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';
import type { AssetBrowserProps } from '../index';

export function AssetBrowser({ onInsert }: AssetBrowserProps) {
  const selectedId = useAssetBrowserStore(s => s.selectedPresetId);
  const open = useAssetBrowserStore(s => s.detailsOpen);
  return (
    <KeyboardNavigatorProvider>
      <div
        className="asset-browser"
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}
      >
        <Sidebar />
        <div>
          <PresetGrid onInsert={onInsert} />
        </div>
        <DetailsDrawer open={open} selectedId={selectedId} />
      </div>
    </KeyboardNavigatorProvider>
  );
}
