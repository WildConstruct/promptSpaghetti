/**
 * Enhanced Asset Browser Component
 * Implements fragment manifest integration, improved previews, and drag-to-replace
 */

import React, { useEffect, useState, useCallback } from 'react';
import '../styles-enhanced.css';
import { Sidebar } from './Sidebar';
import { EnhancedPresetGrid } from './EnhancedPresetGrid';
import { DetailsDrawer } from './DetailsDrawer';
import { KeyboardNavigatorProvider } from '../providers/KeyboardNavigator';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';
import { FragmentManifestLoader } from '../services/FragmentManifestLoader';
import type { AssetBrowserProps } from '../index';

export interface EnhancedAssetBrowserProps extends AssetBrowserProps {
  onNodeReplace?: (nodeId: string, preset: any) => void;
  enableFragmentManifest?: boolean;
}

export function EnhancedAssetBrowser({ 
  onInsert, 
  onNodeReplace,
  enableFragmentManifest = true  // Enabled to load fragment assets
}: EnhancedAssetBrowserProps) {
  const selectedId = useAssetBrowserStore((s) => s.selectedPresetId);
  const open = useAssetBrowserStore((s) => s.detailsOpen);
  const scan = useAssetBrowserStore((s) => s.scan);
  const [manifestLoaded, setManifestLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load fragment manifest on mount
  useEffect(() => {
    if (!enableFragmentManifest) return;

    let isMounted = true;
    const loadFragmentManifest = async () => {
      try {
        console.log('Loading fragment manifest...');
        const manifest = await FragmentManifestLoader.loadManifest();
        
        if (!isMounted) return; // Component unmounted
        
        const presets = FragmentManifestLoader.convertToPresets(manifest);
        
        // Directly set presets in store instead of using scan
        // This avoids the manifest format incompatibility issue
        const tags = Array.from(new Set(presets.flatMap((p) => p.tags))).sort();
        
        useAssetBrowserStore.setState({ 
          presets: presets,
          filteredPresets: presets,
          availableTags: tags,
          scanStatus: 'done',
          error: null
        });
        
        if (isMounted) {
          setManifestLoaded(true);
          console.log(`Fragment manifest loaded: ${presets.length} fragments`);
        }
      } catch (error) {
        if (isMounted) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to load fragment manifest:', errorMsg);
          setLoadError(errorMsg);
          useAssetBrowserStore.setState({ 
            scanStatus: 'error',
            error: errorMsg
          });
        }
      }
    };

    loadFragmentManifest();
    
    return () => {
      isMounted = false;
    };
  }, [enableFragmentManifest]);

  // Handle drag over for node replacement
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Handle drop for node replacement
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const presetData = e.dataTransfer.getData('application/x-preset');
      if (!presetData) return;

      const preset = JSON.parse(presetData);
      
      // Check if drop is on a node
      const target = e.target as HTMLElement;
      const nodeElement = target.closest('.react-flow__node');
      
      if (nodeElement && onNodeReplace) {
        const nodeId = nodeElement.getAttribute('data-id');
        if (nodeId) {
          // Add visual feedback
          nodeElement.classList.add('node-replacement-success');
          setTimeout(() => {
            nodeElement.classList.remove('node-replacement-success');
          }, 500);
          
          onNodeReplace(nodeId, preset);
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [onNodeReplace]);

  return (
    <KeyboardNavigatorProvider>
      <div 
        className="asset-browser enhanced-asset-browser" 
        style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Sidebar />
        <div>
          <EnhancedPresetGrid onInsert={onInsert} onNodeReplace={onNodeReplace} />
        </div>
        <DetailsDrawer open={open} selectedId={selectedId} />
      </div>
    </KeyboardNavigatorProvider>
  );
}