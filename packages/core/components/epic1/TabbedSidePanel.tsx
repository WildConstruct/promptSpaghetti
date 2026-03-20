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
import AssetSearchPanel from '../AssetBrowser/AssetSearchPanel';
import RelationshipView from './components/RelationshipView';
import { ComponentLibraryPanel } from './ComponentLibraryPanel';
import './TabbedSidePanel.css';
import type { ComponentDefinition, GraphReferenceEntry } from './services/ComponentModel';

export interface TabbedSidePanelProps {
  previewEngine: PreviewEngine | null;
  onPresetDrag?: (preset: Preset) => void;
  onPresetSelect?: (preset: Preset) => void;
  onInsert?: (item: Preset | Asset) => void;
  position?: 'left' | 'right';
  defaultTab?: 'preview' | 'assets' | 'components' | null;
  showTabRail?: boolean;
  showAssets?: boolean;
  showPreview?: boolean;
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
}

type TabType = 'preview' | 'assets' | 'components' | 'search' | 'relationships' | null;

export const TabbedSidePanel: React.FC<TabbedSidePanelProps> = ({
  previewEngine,
  onPresetDrag,
  onPresetSelect,
  onInsert,
  position = 'left',
  defaultTab = null,
  showTabRail = true,
  showAssets = true,
  showPreview = true,
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
  onRefreshOutdatedComponents
}: TabbedSidePanelProps) => {
  const defaultWidth = 520;
  const minWidth = 360;
  const maxWidth = 760;
  const hasPreviewTab = showPreview && !!previewEngine;
  const showSuggestedFragments = Boolean(selectedNode);

  const initialTab = useMemo<TabType>(() => {
    if (!showTabRail) {
      return defaultTab ?? (showAssets ? 'assets' : hasPreviewTab ? 'preview' : null);
    }

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
  }, [defaultTab, hasPreviewTab, showAssets, showTabRail]);

  const availableTabs = useMemo<TabType[]>(() => {
    if (!showTabRail) {
      return initialTab ? [initialTab] : [];
    }

    return [
      showAssets ? 'assets' : null,
      hasPreviewTab ? 'preview' : null,
      'components',
      'search',
      'relationships'
    ].filter((tab): tab is Exclude<TabType, null> => tab !== null);
  }, [hasPreviewTab, initialTab, showAssets, showTabRail]);

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [hoveredTab, setHoveredTab] = useState<TabType>(null);
  const [panelWidth, setPanelWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setActiveTab((current: TabType) => {
      if (current && availableTabs.includes(current)) {
        return current;
      }

      return availableTabs[0] ?? null;
    });
  }, [availableTabs]);

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
    if (!showTabRail) {
      setActiveTab(tab);
      return;
    }

    setActiveTab(prev => (prev === tab ? null : tab));
  }, [showTabRail]);

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
      className={`relative h-full flex flex-col w-full overflow-hidden ${isResizing ? 'pointer-events-none' : ''}`}
    >
      {showTabRail && isExpanded && (
        <div
          className={`absolute top-0 bottom-0 w-2 z-20 cursor-ew-resize hover:bg-white/10 transition-colors ${position === 'right' ? 'left-0' : 'right-0'}`}
          onMouseDown={handleResizeStart}
          title="Drag to resize panel"
        />
      )}
      {showTabRail && (
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0 pl-4">
          {availableTabs.includes('assets') && (
            <button
              className={`text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'assets' ? 'text-text hover:text-white' : 'text-text-muted hover:text-white'}`}
              onClick={() => handleTabClick('assets')}
              onMouseEnter={() => setHoveredTab('assets')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Assets"
            >
              Assets
              {activeTab === 'assets' && (
                <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
              )}
            </button>
          )}

          {hasPreviewTab && (
            <button
              className={`text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'preview' ? 'text-text hover:text-white' : 'text-text-muted hover:text-white'}`}
              onClick={() => handleTabClick('preview')}
              onMouseEnter={() => setHoveredTab('preview')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Preview"
            >
              Preview
              {activeTab === 'preview' && (
                <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
              )}
            </button>
          )}

          {availableTabs.includes('components') && (
            <button
              className={`text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'components' ? 'text-text hover:text-white' : 'text-text-muted hover:text-white'}`}
              onClick={() => handleTabClick('components')}
              onMouseEnter={() => setHoveredTab('components')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Components"
            >
              Components
              {activeTab === 'components' && (
                <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
              )}
            </button>
          )}

          {availableTabs.includes('search') && (
            <button
              className={`text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'search' ? 'text-text hover:text-white' : 'text-text-muted hover:text-white'}`}
              onClick={() => handleTabClick('search')}
              onMouseEnter={() => setHoveredTab('search')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Search"
            >
              Search
              {activeTab === 'search' && (
                <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
              )}
            </button>
          )}

          {availableTabs.includes('relationships') && (
            <button
              className={`text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'relationships' ? 'text-text hover:text-white' : 'text-text-muted hover:text-white'}`}
              onClick={() => handleTabClick('relationships')}
              onMouseEnter={() => setHoveredTab('relationships')}
              onMouseLeave={() => setHoveredTab(null)}
              title="Relationships"
            >
              Relationships
              {activeTab === 'relationships' && (
                <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-primary rounded-t-sm"></span>
              )}
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-3 min-h-0 bg-transparent relative">
        {activeTab === 'assets' && (
          <div className="flex-1 min-h-0 relative flex flex-col">
            {showSuggestedFragments && (
              <AssetLibraryErrorBoundary>
                <div className="mb-4">
                  <SuggestedFragmentsPanel
                    selectedNode={selectedNode}
                    nodes={nodes}
                    edges={edges}
                    onInsert={handlePresetInsert}
                  />
                </div>
              </AssetLibraryErrorBoundary>
            )}
            <div className="flex-1 min-h-0 relative">
              <AssetBrowserLoader
                onPresetDrag={onPresetDrag}
                onPresetSelect={onPresetSelect}
                onInsert={handlePresetInsert}
              />
            </div>
          </div>
        )}
        {activeTab === 'search' && (
          <div className="flex-1 min-h-0 relative flex flex-col">
            <AssetSearchPanel
              assets={[]}
              onInsert={handleAssetInsert}
              graphContext={selectedNode?.data || undefined}
              selectedNode={selectedNode as Node<{ label?: string }> | null}
            />
          </div>
        )}
        {activeTab === 'components' && (
          <div className="flex-1 min-h-0 relative flex flex-col">
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
          <div className="flex-1 min-h-0 relative flex flex-col">
            <RelationshipView />
          </div>
        )}
        {activeTab === 'preview' && hasPreviewTab && previewEngine && (
          <div className="flex-1 min-h-0 relative flex flex-col p-2">
            <PreviewPanel previewEngine={previewEngine} onSeedChange={onSeedChange} />
          </div>
        )}
        {!activeTab && (
          <div className="flex-1 flex items-center justify-center text-text-muted opacity-50">
            <div>Select a tab</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabbedSidePanel;
