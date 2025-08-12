/**
 * Asset Browser Integrated Component
 * Directly imports and uses the asset browser components
 */

import React from 'react';
import { TabbedAssetBrowser, UserProvider } from '@prompt/asset-browser';

interface AssetBrowserIntegratedProps {
  onInsert?: (preset: any) => void;
}

export const AssetBrowserIntegrated: React.FC<AssetBrowserIntegratedProps> = ({ onInsert }) => {
  // Debug what we're actually importing
  console.log('[AssetBrowserIntegrated] TabbedAssetBrowser type:', typeof TabbedAssetBrowser);
  console.log('[AssetBrowserIntegrated] TabbedAssetBrowser value:', TabbedAssetBrowser);
  console.log('[AssetBrowserIntegrated] UserProvider type:', typeof UserProvider);
  
  // Check if TabbedAssetBrowser is a valid React component
  if (typeof TabbedAssetBrowser !== 'function') {
    console.error('[AssetBrowserIntegrated] TabbedAssetBrowser is not a function!', TabbedAssetBrowser);
    return <div>Error: TabbedAssetBrowser is not a valid component</div>;
  }
  
  return (
    <UserProvider>
      <TabbedAssetBrowser onInsert={onInsert} />
    </UserProvider>
  );
};