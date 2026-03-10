/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import { AssetBrowserLoader } from './AssetBrowserLoader';
import { SuggestedFragmentsPanel } from './SuggestedFragmentsPanel';
import AssetSearchPanel from '../AssetBrowser/AssetSearchPanel';
import type { PreviewEngine } from './preview/PreviewEngine';
import { PreviewPanel } from './preview/PreviewPanel';
import type { Preset } from '@prompt/asset-browser';
import type { Asset } from '../../services/assetMatcher';
import type { EditableNodeData } from './nodes';
import RelationshipView from './components/RelationshipView';
import './TabbedSidePanel.css';

export interface TabbedSidePanelProps {
  previewEngine: PreviewEngine | null;
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  onInsert?: (item: Preset | Asset) => void;
  position?: 'left' | 'right';
  defaultTab?: 'preview' | 'assets' | null;
  showAssets?: boolean;
  showPreview?: boolean;
  selectedNode?: Node<EditableNodeData> | null;
  nodes?: Node<EditableNodeData>[];
  edges?: Edge[];
  onSeedChange?: (seeds: Array<string | number>) => void;
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
  selectedNode,
  nodes = [],
  edges = [],
  onSeedChange
}) => {
  const defaultWidth = 520;
  const minWidth = 360;
  const maxWidth = 760;
  const hasPreviewTab = showPreview && !!previewEngine;

  const initialTab = useMemo<TabType>(() => {
    if (defaultTab) {
      return defaultTab;
    }
    if (showAssets) {
      return 'assets';
    }
    if (hasPreviewTab) {
      return 'preview';
    }
    return null;
  }, [defaultTab, showAssets, hasPreviewTab]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [hoveredTab, setHoveredTab] = useState<TabType>(null);
  const [panelWidth, setPanelWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const clampWidth = () => {
      const viewportCap = Math.max(minWidth, window.innerWidth - 80);
      setPanelWidth(prev => Math.min(Math.max(prev, minWidth), Math.min(maxWidth, viewportCap)));
    };

    clampWidth();
    window.addEventListener('resize', clampWidth);
    return () => window.removeEventListener('resize', clampWidth);
  }, []);

  const handleTabClick = useCallback((tab: TabType) => {
    setActiveTab(prev => (prev === tab ? null : tab));
  }, []);

  const handlePresetInsert = useCallback(
    (preset: Preset) => {
      console.log('[TabbedSidePanel] Forwarding preset insert', preset?.id);
      onInsert?.(preset);
    },
    [onInsert]
  );

  const handleAssetInsert = useCallback(
    (asset: Asset) => {
      onInsert?.(asset);
    },
    [onInsert]
  );

  const isExpanded = activeTab !== null;

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const startX = event.clientX;
      const startWidth = panelWidth;
      setIsResizing(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'ew-resize';

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta =
          position === 'right'
            ? startX - moveEvent.clientX
            : moveEvent.clientX - startX;
        const viewportCap = Math.max(minWidth, window.innerWidth - 80);
        const nextWidth = Math.min(
          Math.max(startWidth + delta, minWidth),
          Math.min(maxWidth, viewportCap)
        );
        setPanelWidth(nextWidth);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [panelWidth, position]
  );

  return (
    <div
      className={`tabbed-side-panel ${position} ${isExpanded ? 'expanded' : 'collapsed'} ${isResizing ? 'resizing' : ''}`}
      style={
        {
          '--tabbed-side-panel-width': `${panelWidth}px`
        } as React.CSSProperties
      }
    >
      {isExpanded && (
        <div
          className={`tabbed-side-panel-resize-handle ${position}`}
          onMouseDown={handleResizeStart}
          title="Drag to resize panel"
        />
      )}
      <div className="tab-buttons">
        {showAssets && (
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
        )}

        {hasPreviewTab && (
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

        <button
          className={`tab-button ${activeTab === 'search' ? 'active' : ''} ${hoveredTab === 'search' ? 'hovered' : ''}`}
          onClick={() => handleTabClick('search')}
          onMouseEnter={() => setHoveredTab('search')}
          onMouseLeave={() => setHoveredTab(null)}
          title="Search"
        >
          <span className="tab-icon">🔍</span>
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
          <span className="tab-label">Relationships</span>
        </button>
      </div>

      <div className="panel-content">
        {activeTab === 'assets' && (
          <div className="assets-container">
            <SuggestedFragmentsPanel
              selectedNode={selectedNode}
              nodes={nodes}
              edges={edges}
              onInsert={handlePresetInsert}
            />
            <div className="assets-browser-panel">
              <AssetBrowserLoader
                onPresetDrag={onPresetDrag}
                onPresetSelect={onPresetSelect}
                onInsert={handlePresetInsert}
              />
            </div>
          </div>
        )}
        {activeTab === 'search' && (
          <div className="assets-container">
            <AssetSearchPanel
              assets={[]}
              onInsert={handleAssetInsert}
              graphContext={selectedNode?.data || undefined}
              selectedNode={selectedNode as Node<{ label?: string }> | null}
            />
          </div>
        )}
        {activeTab === 'relationships' && (
          <div className="assets-container">
            <RelationshipView />
          </div>
        )}
        {activeTab === 'preview' && hasPreviewTab && previewEngine && (
          <div className="preview-container">
            <PreviewPanel previewEngine={previewEngine} onSeedChange={onSeedChange} />
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
