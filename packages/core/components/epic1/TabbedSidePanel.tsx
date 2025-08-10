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
}

type TabType = 'preview' | 'assets' | null;

export const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
  previewEngine,
  onPresetDrag,
  onPresetSelect,
  position = 'right',
  defaultTab = null
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [hoveredTab, setHoveredTab] = useState<TabType>(null);
  const [componentsLoaded, setComponentsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string>('');

  // Load the asset browser components dynamically
  useEffect(() => {
    import('@prompt/asset-browser')
      .then((module) => {
        TabbedAssetBrowser = module.TabbedAssetBrowser;
        UserProvider = module.UserProvider;
        setComponentsLoaded(true);
      })
      .catch((error) => {
        console.warn('Failed to load asset browser:', error);
        setLoadError('Asset browser module not available');
        // Fall back to AssetLibraryV2 if needed
      });
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
              {componentsLoaded && TabbedAssetBrowser && UserProvider ? (
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
              ) : loadError ? (
                <div style={{ padding: '16px', color: '#999' }}>
                  {loadError}
                  {/* Fall back to local AssetLibraryV2 */}
                  <AssetLibraryV2Fallback 
                    onPresetDrag={onPresetDrag}
                    onPresetSelect={onPresetSelect}
                  />
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  Loading asset browser...
                </div>
              )}
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