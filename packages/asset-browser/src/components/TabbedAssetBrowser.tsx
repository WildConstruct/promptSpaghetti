import React from 'react';
import { ProAssetBrowser } from './ProAssetBrowser';
import { AssetBrowserTabs } from './AssetBrowserTabs';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export const TabbedAssetBrowser: React.FC<TabbedAssetBrowserProps> = ({
  onInsert
}) => {
  // Compose the current Asset Browser inside tabs (Library + Server)
  return (
    <AssetBrowserTabs libraryView={<ProAssetBrowser onInsert={onInsert} />} />
  );
};
