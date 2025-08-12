import React from 'react';
// import { ProAssetBrowser } from './ProAssetBrowser';
import { ProAssetBrowserSimple } from './ProAssetBrowserSimple';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

export function TabbedAssetBrowser(
  props: TabbedAssetBrowserProps
): JSX.Element {
  // Temporarily use simple version to debug
  console.log('[TabbedAssetBrowser] Rendering with simple version');
  return <ProAssetBrowserSimple {...props} />;
  // return <ProAssetBrowser {...props} />;
}
