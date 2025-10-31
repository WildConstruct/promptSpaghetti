/**
 * Enhanced Asset Browser Integration
 * Provides full integration with fragment manifest and drag-to-replace
 */

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { EnhancedAssetBrowser, UserProvider } from '@prompt/asset-browser';
import { NodeReplacementHandler } from './asset-library/NodeReplacementHandler';
import type { Preset } from '@prompt/asset-browser';

interface AssetBrowserEnhancedProps {
  onInsert?: (preset: Preset) => void;
  onNodeReplace?: (nodeId: string, preset: Preset) => void;
  enableFragmentManifest?: boolean;
  children?: React.ReactNode;
}

export const AssetBrowserEnhanced: React.FC<AssetBrowserEnhancedProps> = ({ 
  onInsert,
  onNodeReplace,
  enableFragmentManifest = true,
  children
}) => {
  return (
    <UserProvider>
      <EnhancedAssetBrowser
        onInsert={onInsert}
        onNodeReplace={onNodeReplace}
        enableFragmentManifest={enableFragmentManifest}
      />
      {children}
    </UserProvider>
  );
};

/**
 * Wrapper component for graph editors with asset browser drag-to-replace
 */
export const GraphEditorWithAssetSupport: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactFlowProvider>
      <NodeReplacementHandler>
        {children}
      </NodeReplacementHandler>
    </ReactFlowProvider>
  );
};
