import * as React from 'react';
// import { ProAssetBrowser } from './ProAssetBrowser';
// import { ProAssetBrowserSimple } from './ProAssetBrowserSimple';
import type { Preset } from '../types';

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TabbedAssetBrowser: React.FC<TabbedAssetBrowserProps> = props => {
  // Temporarily return a simple div to test if React is working
  console.log('[TabbedAssetBrowser] Rendering test div');
  return React.createElement(
    'div',
    { style: { padding: '20px' } },
    'Test Asset Browser'
  );
  // return <ProAssetBrowserSimple {...props} />;
  // return <ProAssetBrowser {...props} />;
};
