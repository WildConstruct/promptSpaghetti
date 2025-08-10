/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */

import React, { useState, useCallback, useEffect } from 'react';
import { PreviewPanel } from './preview/PreviewPanel';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import { PreviewEngine } from './preview/PreviewEngine';
import { Preset } from './asset-library/types';
import './TabbedSidePanel.css';

// Dynamic import for the asset browser
let TabbedAssetBrowser: any = null;
let UserProvider: any = null;

// Fallback component alias
const AssetLibraryV2Fallback = AssetLibraryV2;

export interface TabbedSidePanelProps {
  previewEngine: PreviewEngine | null;
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  position?: 'left' | 'right';
  defaultTab?: 'preview' | 'assets' | null;
  showAssets?: boolean;
  showPreview?: boolean;
}

type TabType = 'preview' | 'assets' | null;

export const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
  previewEngine,
  onPresetDrag,
  onPresetSelect,
  position = 'right',
  defaultTab = null,
  showAssets = true,
  showPreview = true
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [hoveredTab, setHoveredTab] = useState<TabType>(null);
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string>('');

  // Load the asset browser components dynamically
  useEffect(() => {
    // Only attempt to load in browser environment
    if (typeof window !== 'undefined') {
      // Skip trying to load asset browser in production for now
      // The package needs to be properly bundled first
      const isProduction = window.location.hostname.includes('netlify.app') || 
                          window.location.hostname.includes('netlify.live') ||
                          window.location.hostname !== 'localhost';
      
      if (isProduction) {
        console.log('[TabbedSidePanel] Production environment detected, using fallback asset library');
        setComponentsLoaded(false);
        setLoadError('Using local asset library');
      } else {
        // Try to load the asset browser package in development
        const loadAssetBrowser = async () => {
          try {
            const moduleName = '@prompt' + '/asset-browser';
            console.log('[TabbedSidePanel] Attempting to load asset browser from:', moduleName);
            const module = await import(/* @vite-ignore */ moduleName);
            console.log('[TabbedSidePanel] Asset browser module loaded:', module);
            TabbedAssetBrowser = module.TabbedAssetBrowser;
            UserProvider = module.UserProvider;
            setComponentsLoaded(true);
            console.log('[TabbedSidePanel] Asset browser components loaded successfully');
          } catch (error) {
            console.error('[TabbedSidePanel] Failed to load asset browser:', error);
            setLoadError('Using local asset library');
            setComponentsLoaded(false);
          }
        };
        loadAssetBrowser();
      }
    }
  }, []);

  const handleTabClick = useCallback((tab: TabType) => {
    setActiveTab(activeTab === tab ? null : tab);
  }, [activeTab]);

  const isExpanded = activeTab !== null;

  return (
    <div 
      className={`tabbed-side-panel ${position} ${isExpanded ? 'expanded' : 'collapsed'}`}
    >
      {/* Tab buttons */}
      <div className="tab-buttons">
        {showPreview && (
          <button
            className={`tab-button ${activeTab === 'preview' ? 'active' : ''} ${hoveredTab === 'preview' ? 'hovered' : ''}`}
            onClick={() => handleTabClick('preview')}
            onMouseEnter={() => setHoveredTab('preview')}
            onMouseLeave={() => setHoveredTab(null)}
            title="Preview"
          >
            <span className="tab-icon">👁️</span>
            <span className="tab-label">Preview</span>
          </button>
        )}
        {showAssets && (
          <button
            className={`tab-button ${activeTab === 'assets' ? 'active' : ''} ${hoveredTab === 'assets' ? 'hovered' : ''}`}
            onClick={() => handleTabClick('assets')}
            onMouseEnter={() => setHoveredTab('assets')}
            onMouseLeave={() => setHoveredTab(null)}
            title="Asset Browser"
          >
            <span className="tab-icon">📚</span>
            <span className="tab-label">Assets</span>
          </button>
        )}
      </div>

      {/* Panel content */}
      <div className="panel-content">
        {activeTab === 'preview' && previewEngine && (
          <div className="preview-container">
            <PreviewPanel
              previewEngine={previewEngine}
              className="embedded-preview"
            />
          </div>
        )}
        
        {activeTab === 'assets' && (
          <div className="assets-container">
            <AssetLibraryErrorBoundary>
              {(() => {
                console.log('[TabbedSidePanel] Rendering assets tab:', {
                  componentsLoaded,
                  hasTabbedAssetBrowser: !!TabbedAssetBrowser,
                  hasUserProvider: !!UserProvider,
                  loadError
                });
                
                if (componentsLoaded && TabbedAssetBrowser && UserProvider) {
                  console.log('[TabbedSidePanel] Rendering new asset browser');
                  return (
                    <UserProvider>
                      <TabbedAssetBrowser 
                        onInsert={(preset: any) => {
                          // Convert the preset format if needed
                          if (preset?.data) {
                            onPresetSelect?.(preset);
                            onPresetDrag?.(preset);
                          }
                        }}
                      />
                    </UserProvider>
                  );
                } else {
                  console.log('[TabbedSidePanel] Falling back to AssetLibraryV2');
                  return (
                    <AssetLibraryV2Fallback 
                      position="right"
                      onPresetDrag={onPresetDrag}
                      onPresetSelect={onPresetSelect}
                      defaultExpanded={true}
                    />
                  );
                }
              })()}
            </AssetLibraryErrorBoundary>
          </div>
        )}
        
        {!activeTab && (
          <div className="panel-hint">
            <div className="hint-arrow">◀</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedSidePanel;