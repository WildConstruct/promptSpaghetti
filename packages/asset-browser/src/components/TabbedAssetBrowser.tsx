import * as React from 'react';
// import { ProAssetBrowser } from './ProAssetBrowser';
// import { ProAssetBrowserSimple } from './ProAssetBrowserSimple';
import type { Preset } from '../types';

declare global {
  interface Window {
    React?: typeof React;
  }
}

export type TabbedAssetBrowserProps = {
  onInsert?: (preset: Preset) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const TabbedAssetBrowser: React.FC<TabbedAssetBrowserProps> = props => {
  // Debug React instance
  console.log('[TabbedAssetBrowser] React version:', React.version);
  if (typeof window !== 'undefined' && window.React) {
    console.log(
      '[TabbedAssetBrowser] React === window.React?',
      React === window.React
    );
    console.log(
      '[TabbedAssetBrowser] window.React version:',
      window.React.version
    );
  }

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
