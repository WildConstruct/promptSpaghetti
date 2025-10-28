/**
 * Asset Browser Integrated Component
 * Uses ProAssetBrowser for the nice Logic-like UI
 */

import React from 'react';
import { ProAssetBrowser, UserProvider } from '@prompt/asset-browser';

interface AssetBrowserIntegratedProps {
  onInsert?: (preset: any) => void;
  onNodeReplace?: (nodeId: string, preset: any) => void;
  enableFragmentManifest?: boolean;
}

export const AssetBrowserIntegrated: React.FC<AssetBrowserIntegratedProps> = ({ 
  onInsert,
  onNodeReplace,
  enableFragmentManifest = true
}) => {
  return (
    <UserProvider>
      <ProAssetBrowser 
        onInsert={onInsert}
      />
    </UserProvider>
  );
};