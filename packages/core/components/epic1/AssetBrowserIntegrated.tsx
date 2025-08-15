/**
 * Asset Browser Integrated Component
 * Uses enhanced asset browser with fragment manifest support
 */

import React from 'react';
import { EnhancedAssetBrowser, UserProvider } from '@prompt/asset-browser';

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
      <EnhancedAssetBrowser 
        onInsert={onInsert}
        onNodeReplace={onNodeReplace}
        enableFragmentManifest={enableFragmentManifest}
      />
    </UserProvider>
  );
};