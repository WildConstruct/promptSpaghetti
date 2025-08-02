/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PreviewPanel } from './preview/PreviewPanel';
import { AssetLibraryV2 } from './asset-library/AssetLibraryV2';
import { PreviewEngine } from './preview/PreviewEngine';
import { Preset } from './asset-library/types';
import './TabbedSidePanel.css';

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
            <DndProvider backend={HTML5Backend}>
              <AssetLibraryV2
                position="right"
                onPresetDrag={onPresetDrag}
                onPresetSelect={onPresetSelect}
                defaultExpanded={true}
              />
            </DndProvider>
          </div>
        )}
        
        {!activeTab && !isHovered && (
          <div className="panel-hint">
            <div className="hint-arrow">◀</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedSidePanel;