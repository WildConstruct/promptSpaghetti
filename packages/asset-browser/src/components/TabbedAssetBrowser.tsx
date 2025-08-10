import React from 'react';
import { AssetBrowser } from './AssetBrowser';
import { AssetBrowserTabs } from './AssetBrowserTabs';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export function TabbedAssetBrowser(props: TabbedAssetBrowserProps): JSX.Element {
  return (
    <AssetBrowserTabs libraryView={<AssetBrowser {...props} />} />
  );
}
