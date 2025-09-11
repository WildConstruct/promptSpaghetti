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
  position = 'left',
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
              <span className="tab-icon">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.94 1.475l-.64 6.038A1.5 1.5 0 0 1 13.81 15H2.19a1.5 1.5 0 0 1-1.49-1.347l-.64-6.038c0-.599.37-1.21.94-1.475V5.5A1.5 1.5 0 0 1 1 3.5zm1.5 0v2.695a.5.5 0 0 1-.336.473 1.4 1.4 0 0 0-.64.644l.64 6.038a.5.5 0 0 0 .496.45h11.18a.5.5 0 0 0 .496-.45l.64-6.038a1.4 1.4 0 0 0-.64-.644.5.5 0 0 1-.336-.473V5.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.76-.56-2.311-1.184C6.279 3.352 5.784 3 5.264 3H2.5a.5.5 0 0 0-.5.5z"/>
                </svg>
              </span>
              <span className="tab-label">Assets</span>
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
