/**
 * Asset Browser Integrated Component
 * Uses ProAssetBrowser for the nice Logic-like UI
 */

import React from 'react';
import { ProAssetBrowser, UserProvider } from '@prompt/asset-browser';
import type { Preset } from '@prompt/asset-browser';

interface AssetBrowserIntegratedProps {
  onInsert?: (preset: Preset) => void;
}

export const AssetBrowserIntegrated: React.FC<AssetBrowserIntegratedProps> = ({ 
  onInsert,
  
}) => {
  return (
    <UserProvider>
      <ProAssetBrowser onInsert={onInsert} />
    </UserProvider>
  );
};
