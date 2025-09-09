/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */

import React, { useState, useCallback } from 'react';
import { AssetBrowserLoader } from './AssetBrowserLoader';
import AssetSearchPanel from '../AssetBrowser/AssetSearchPanel';
import { PreviewEngine } from './preview/PreviewEngine';
import { Preset } from './asset-library/types';
import './TabbedSidePanel.css';

export interface TabbedSidePanelProps {
  previewEngine: PreviewEngine | null;
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  onInsert?: (preset: any) => void;
  position?: 'left' | 'right';
  defaultTab?: 'preview' | 'assets' | null;
  showAssets?: boolean;
  showPreview?: boolean;
  selectedNode?: any;
}

type TabType = 'preview' | 'assets' | 'search' | 'relationships' | null;

export const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
  previewEngine,
  onPresetDrag,
  onPresetSelect,
  onInsert,
  position = 'right',
  defaultTab = null,
  showAssets = true,
  showPreview = true,
  selectedNode
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [hoveredTab, setHoveredTab] = useState<TabType>(null);

  const handleTabClick = useCallback((tab: TabType) => {
    setActiveTab(activeTab === tab ? null : tab);
  }, [activeTab]);

  const isExpanded = activeTab !== null;

  return (
    <div className={`tabbed-side-panel ${position} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="tab-buttons">
        {showAssets && (
          <>
            <button
              className={`tab-button ${activeTab === 'assets' ? 'active' : ''} ${hoveredTab === 'assets' ? 'hovered' : ''}`}
              onClick={() => handleTabClick('assets')}
              onMouseEnter={() => setHoveredTab('assets')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Asset Browser"
            >
              <span className="tab-icon">📦</span>
              <span className="tab-label">Assets</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'search' ? 'active' : ''} ${hoveredTab === 'search' ? 'hovered' : ''}`}
              onClick={() => handleTabClick('search')}
              onMouseEnter={() => setHoveredTab('search')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Search"
            >
              <span className="tab-icon">🔎</span>
              <span className="tab-label">Search</span>
          </button>
            <button
              className={`tab-button ${activeTab === 'relationships' ? 'active' : ''} ${hoveredTab === 'relationships' ? 'hovered' : ''}`}
              onClick={() => handleTabClick('relationships')}
              onMouseEnter={() => setHoveredTab('relationships')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Relationships"
            >
              <span className="tab-icon">🕸️</span>
              <span className="tab-label">Relations</span>
            </button>
          </>
        )}
      </div>

      <div className="panel-content">
        {activeTab === 'assets' && (
          <div className="assets-container">
            <AssetBrowserLoader
              onPresetDrag={onPresetDrag}
              onPresetSelect={onPresetSelect}
              onInsert={onInsert}
            />
          </div>
        )}
        {activeTab === 'search' && (
          <div className="assets-container">
            <AssetSearchPanel assets={[]} onInsert={(a) => onInsert?.(a)} graphContext={selectedNode} selectedNode={selectedNode} />
          </div>
        )}
        {activeTab === 'relationships' && (
          <div className="assets-container">
            {/** RelationshipView listens to assetRegistry events for assets */}
            {require('./components/RelationshipView').default({ assets: [] })}
          </div>
        )}
        {!activeTab && (
          <div className="panel-hint">
            <div className="hint-arrow">⇦</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedSidePanel;
