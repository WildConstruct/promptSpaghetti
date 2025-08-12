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
  return (
    <UserProvider>
      <TabbedAssetBrowser onInsert={onInsert} />
    </UserProvider>
  );
};