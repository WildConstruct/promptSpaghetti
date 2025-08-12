import React from 'react';
// import { ProAssetBrowser } from './ProAssetBrowser';
import { ProAssetBrowserSimple } from './ProAssetBrowserSimple';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export const TabbedAssetBrowser: React.FC<TabbedAssetBrowserProps> = props => {
  // Temporarily use simple version to debug
  console.log('[TabbedAssetBrowser] Rendering with simple version');
  return <ProAssetBrowserSimple {...props} />;
  // return <ProAssetBrowser {...props} />;
};
