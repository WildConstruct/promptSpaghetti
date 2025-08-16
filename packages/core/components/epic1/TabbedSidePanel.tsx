/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */

import React, { useState, useCallback } from 'react';
import { PreviewPanel } from './preview/PreviewPanel';
import { AssetBrowserLoader } from './AssetBrowserLoader';
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
}

type TabType = 'preview' | 'assets' | null;

export const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
  previewEngine,
  onPresetDrag,
  onPresetSelect,
  onInsert,
  position = 'right',
  defaultTab = null,
  showAssets = true,
  showPreview = true
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [hoveredTab, setHoveredTab] = useState<TabType>(null);

  const handleTabClick = useCallback((tab: TabType) => {
    setActiveTab(activeTab === tab ? null : tab);
  }, [activeTab]);

  const isExpanded = activeTab !== null;

  return (
    <div 
      className={`tabbed-side-panel ${position} ${isExpanded ? 'expanded' : 'collapsed'}`}
    >
      {/* Tab buttons - Only show Assets since Preview is now in bottom tray */}
      <div className="tab-buttons">
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

      {/* Panel content - Only Assets now */}
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