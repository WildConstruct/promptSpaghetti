/**
 * Tabbed Side Panel for Epic 1
 * Combines Preview and Asset Browser in a collapsible tabbed interface
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Edge, Node } from 'reactflow';
import { AssetBrowserLoader } from './AssetBrowserLoader';
import { SuggestedFragmentsPanel } from './SuggestedFragmentsPanel';
import { PreviewPanel } from './preview/PreviewPanel';
import { AssetLibraryErrorBoundary } from './asset-library/AssetLibraryErrorBoundary';
import type { PreviewEngine } from './preview/PreviewEngine';
import type { Preset } from '@prompt/asset-browser';
import type { Asset } from '../../services/assetMatcher';
import type { EditableNodeData } from './nodes';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import { DocumentLibraryPanel, type DocumentSummary } from './DocumentLibraryPanel';
import { GraphOutlinePanel } from './GraphOutlinePanel';
import './TabbedSidePanel.css';
import type {
  ComponentDefinition,
  GraphReferenceEntry
} from './services/ComponentModel';

export type SidePanelTabId =
  | 'preview'
  | 'assets'
  | 'components'
  | 'search'
  | 'relationships';

export interface SidePanelTabDefinition {
  id: SidePanelTabId;
  label: string;
  title: string;
  ariaLabel?: string;
  tier: 'core' | 'advanced';
  availability: 'available' | 'hosted_only' | 'disabled';
  helperText: string;
}

export interface TabbedSidePanelProps {
  previewEngine: PreviewEngine | null;
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  onInsert?: (item: Preset | Asset) => void;
  position?: 'left' | 'right';
  defaultTab?: 'preview' | 'assets' | 'components' | null;
  showAssets?: boolean;
  showPreview?: boolean;
  tabDefinitions?: SidePanelTabDefinition[];
  selectedNode?: Node<EditableNodeData> | null;
  nodes?: Node<EditableNodeData>[];
  edges?: Edge[];
  onSeedChange?: (seeds: Array<string | number>) => void;
  componentDefinitions?: ComponentDefinition[];
  componentReferences?: GraphReferenceEntry[];
  onComponentInsert?: (definition: ComponentDefinition) => void;
  onSaveSelectionAsComponent?: () => void;
  onDetachSelectedComponent?: () => void;
  onRefreshSelectedComponent?: () => void;
  onRefreshOutdatedComponents?: () => void;
  /** Full PSG-document templates surfaced in the Explore tab. */
  exploreDocuments?: DocumentSummary[];
  /** Open a full PSG document by id (host handles confirm-if-dirty + load). */
  onOpenDocument?: (id: string) => void;
  /** Select + center the editor on a node (Graph outline tab). */
  onFocusNode?: (id: string) => void;
}

type TabType = SidePanelTabId | null;

const createDefaultTabDefinitions = (
  showAssets: boolean
): SidePanelTabDefinition[] => {
  const tabs: SidePanelTabDefinition[] = [];

  if (showAssets) {
    tabs.push({
      id: 'assets',
      label: 'Library',
      title: 'Fragment library',
      ariaLabel: 'Fragment library',
      tier: 'core',
      availability: 'available',
      helperText:
        'Use fragments and presets here to keep the graph focused on reusable family logic.'
    });
  }

  tabs.push(
    {
      id: 'components',
      label: 'Linked',
      title: 'Advanced linked components',
      ariaLabel: 'Advanced linked components',
      tier: 'advanced',
      availability: 'available',
      helperText:
        'Linked components are useful, but they are secondary to the first-pass MVP wedge.'
    },
    {
      id: 'search',
      label: 'Explore',
      title: 'Open a full PSG document',
      ariaLabel: 'Explore full PSG documents',
      tier: 'advanced',
      availability: 'available',
      helperText:
        'Explore browses full PSG-document templates — the same examples as the launch screen — and opens them into the editor.'
    },
    {
      id: 'relationships',
      label: 'Graph',
      title: 'Advanced graph relationships',
      ariaLabel: 'Advanced graph relationships',
      tier: 'advanced',
      availability: 'available',
      helperText:
        'Relationship views are informative, but they are not the core MVP authoring loop.'
    }
  );

  return tabs;
};

const renderTabIcon = (tabId: SidePanelTabId) => {
  switch (tabId) {
    case 'assets':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1 3.5A1.5 1.5 0 0 1 2.5 2h2.764c.958 0 1.76.56 2.311 1.184C7.985 3.648 8.48 4 9 4h4.5A1.5 1.5 0 0 1 15 5.5v.64c.57.265.94.876.94 1.475l-.64 6.038A1.5 1.5 0 0 1 13.81 15H2.19a1.5 1.5 0 0 1-1.49-1.347l-.64-6.038c0-.599.37-1.21.94-1.475V5.5A1.5 1.5 0 0 1 1 3.5zm1.5 0v2.695a.5.5 0 0 1-.336.473 1.4 1.4 0 0 0-.64.644l.64 6.038a.5.5 0 0 0 .496.45h11.18a.5.5 0 0 0 .496-.45l.64-6.038a1.4 1.4 0 0 0-.64-.644.5.5 0 0 1-.336-.473V5.5a.5.5 0 0 0-.5-.5H9c-.964 0-1.76-.56-2.311-1.184C6.279 3.352 5.784 3 5.264 3H2.5a.5.5 0 0 0-.5.5z" />
        </svg>
      );
    case 'preview':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.12 12.5 8 12.5s-3.879-1.168-5.168-2.457A13.133 13.133 0 0 1 1.172 8z" />
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z" />
        </svg>
      );
    case 'components':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.5 1A1.5 1.5 0 0 0 4 2.5v2A1.5 1.5 0 0 0 5.5 6h2A1.5 1.5 0 0 0 9 4.5v-2A1.5 1.5 0 0 0 7.5 1h-2zm0 1h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5zm5 4A1.5 1.5 0 0 0 9 7.5v2A1.5 1.5 0 0 0 10.5 11h2A1.5 1.5 0 0 0 14 9.5v-2A1.5 1.5 0 0 0 12.5 6h-2zm0 1h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5zm-5 4A1.5 1.5 0 0 0 4 12.5v2A1.5 1.5 0 0 0 5.5 16h2A1.5 1.5 0 0 0 9 14.5v-2A1.5 1.5 0 0 0 7.5 11h-2zm0 1h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 1 .5-.5z" />
        </svg>
      );
    case 'search':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.25a6.75 6.75 0 1 0 0 13.5a6.75 6.75 0 0 0 0-13.5zm0 1.1a5.65 5.65 0 1 1 0 11.3a5.65 5.65 0 0 1 0-11.3z" />
          <path d="M10.92 4.72L9.55 9.05a.78.78 0 0 1-.5.5l-4.33 1.37a.24.24 0 0 1-.3-.3l1.37-4.33a.78.78 0 0 1 .5-.5l4.33-1.37a.24.24 0 0 1 .3.3zM7.18 7.18l-.66 2.08l2.08-.66l.66-2.08l-2.08.66z" />
        </svg>
      );
    case 'relationships':
      return (
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6.354 5.5H4a2.5 2.5 0 0 0 0 5h2.354a2.5 2.5 0 0 1 0-1H4a1.5 1.5 0 0 1 0-3h2.354a2.5 2.5 0 0 1 0-1zm3.292 0a2.5 2.5 0 0 1 0 1H12a1.5 1.5 0 0 1 0 3H9.646a2.5 2.5 0 0 1 0 1H12a2.5 2.5 0 0 0 0-5H9.646z" />
          <path d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H6A.5.5 0 0 1 5.5 8z" />
        </svg>
      );
  }
};

export const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
  previewEngine,
  onPresetDrag,
  onPresetSelect,
  onInsert,
  position = 'left',
  defaultTab = null,
  showAssets = true,
  showPreview = true,
  tabDefinitions,
  selectedNode,
  nodes = [],
  edges = [],
  onSeedChange,
  componentDefinitions = [],
  componentReferences = [],
  onComponentInsert,
  onSaveSelectionAsComponent,
  onDetachSelectedComponent,
  onRefreshSelectedComponent,
  onRefreshOutdatedComponents,
  exploreDocuments = [],
  onOpenDocument,
  onFocusNode
}: TabbedSidePanelProps) => {
  const defaultWidth = 520;
  const minWidth = 360;
  const maxWidth = 760;
  const hasPreviewTab = showPreview && !!previewEngine;

  const resolvedTabDefinitions = useMemo(() => {
    const provided =
      tabDefinitions ?? createDefaultTabDefinitions(showAssets);

    return provided.filter(tab => {
      if (tab.availability === 'disabled') {
        return false;
      }
      if (tab.id === 'preview') {
        return hasPreviewTab;
      }
      if (tab.id === 'assets') {
        return showAssets;
      }
      return true;
    });
  }, [hasPreviewTab, showAssets, tabDefinitions]);

  const initialTab = useMemo<TabType>(() => {
    if (
      defaultTab &&
      resolvedTabDefinitions.some(tab => tab.id === defaultTab)
    ) {
      return defaultTab;
    }

    return resolvedTabDefinitions[0]?.id ?? null;
  }, [defaultTab, resolvedTabDefinitions]);

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
      setPanelWidth(prev =>
        Math.min(Math.max(prev, minWidth), Math.min(maxWidth, viewportCap))
      );
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
        {resolvedTabDefinitions.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${hoveredTab === tab.id ? 'hovered' : ''}`}
            onClick={() => handleTabClick(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            title={tab.title}
            aria-label={tab.ariaLabel ?? tab.label}
          >
            <span className="tab-icon">{renderTabIcon(tab.id)}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeTab === 'assets' && (
          <div className="assets-container">
            <AssetLibraryErrorBoundary>
              <SuggestedFragmentsPanel
                selectedNode={selectedNode}
                nodes={nodes}
                edges={edges}
                onInsert={handlePresetInsert}
              />
            </AssetLibraryErrorBoundary>
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
            <DocumentLibraryPanel
              documents={exploreDocuments}
              onOpenDocument={onOpenDocument}
            />
          </div>
        )}
        {activeTab === 'components' && (
          <div className="assets-container">
            <ComponentLibraryPanel
              definitions={componentDefinitions}
              references={componentReferences}
              onInsert={onComponentInsert}
              onSaveSelection={onSaveSelectionAsComponent}
              onDetachSelected={onDetachSelectedComponent}
              onRefreshSelected={onRefreshSelectedComponent}
              onRefreshOutdated={onRefreshOutdatedComponents}
              selectedNode={selectedNode}
            />
          </div>
        )}
        {activeTab === 'relationships' && (
          <div className="assets-container">
            <GraphOutlinePanel
              nodes={nodes}
              edges={edges}
              onFocusNode={onFocusNode}
            />
          </div>
        )}
        {activeTab === 'preview' && hasPreviewTab && previewEngine && (
          <div className="preview-container">
            <PreviewPanel
              previewEngine={previewEngine}
              onSeedChange={onSeedChange}
            />
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
