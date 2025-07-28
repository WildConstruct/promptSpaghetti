// Visual Diff Panel - Main component for visual graph comparison
// Story 9.3.2 - Visual Diff Tool
import React, { useState, useCallback, useEffect } from 'react';
import { ReactFlow, Node, Edge, Controls, Background, Panel } from 'reactflow';
import { ComparisonToolbar } from './ComparisonToolbar';
import { DiffLegend } from './DiffLegend';
import { VersionSelector } from './VersionSelector';
import { ComparisonStats } from './ComparisonStats';
import { DiffNodeRenderer } from './DiffNodeRenderer';
import { DiffEdgeRenderer } from './DiffEdgeRenderer';
import { useDiffSession } from '../../hooks/useDiffSession';
import { useGraphVersions } from '../../hooks/useGraphVersions';
import {
  DetailedComparison,
  VisualDiffSession,
  ViewMode,
  HighlightMode,
  NodeChange,
  EdgeChange
} from '../../types/comparison';

export interface VisualDiffPanelProps {
  graphId: string;
  initialSourceVersionId?: string;
  initialTargetVersionId?: string;
  onClose?: () => void;
  className?: string;
  const VisualDiffPanel: React.FC<VisualDiffPanelProps> = ({ ),
  graphId,
  sourceVersionId,
  initialSourceVersionId,
  initialTargetVersionId,
  onClose,
  className = ''
}) => {
  const [targetVersionId, setTargetVersionId] = useState<string>(initialTargetVersionId || '');
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('changes');
  const [showUnchanged, setShowUnchanged] = useState(true);
  const [showMetadata, setShowMetadata] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  // Hooks
  const { versions, loading: versionsLoading } = useGraphVersions(graphId);
  const {
  session,
  comparison,
  loading: sessionLoading,
  error: sessionError,
  createSession,
  updateSession
} = useDiffSession();
  // Effects
  useEffect(() => {
  if (sourceVersionId && targetVersionId && sourceVersionId !== targetVersionId) {
  createSession({)
  graph_id: graphId,
  source_version_id: sourceVersionId,
  target_version_id: targetVersionId,
  view_mode: viewMode,
  highlight_mode: highlightMode,
});
  }, [sourceVersionId, targetVersionId, graphId]);
  useEffect(() => {
  if (session) {
  updateSession(session.id, {)
  view_mode: viewMode,
  highlight_mode: highlightMode,
  show_unchanged: showUnchanged,
  show_metadata: showMetadata,
  zoom_level: zoomLevel,
});
  }, [viewMode, highlightMode, showUnchanged, showMetadata, zoomLevel, session?.id]);
  // Handlers
  const handleVersionChange = useCallback((source: string, target: string) => {
    setSourceVersionId(source);
    setTargetVersionId(target);
  }, []);
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);
  const handleHighlightModeChange = useCallback((mode: HighlightMode) => {
    setHighlightMode(mode);
  }, []);
  const handleZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);
  // Prepare nodes and edges for visualization
  const prepareVisualizationData = useCallback(() => {
    if (!comparison) return { sourceNodes: [], sourceEdges: [], targetNodes: [], targetEdges: [] };
    const sourceNodes = prepareNodes(comparison.source_data.nodes, comparison.node_matches, 'source');
    const sourceEdges = prepareEdges(comparison.source_data.edges, comparison.edge_matches, 'source');
    const targetNodes = prepareNodes(comparison.target_data.nodes, comparison.node_matches, 'target');
    const targetEdges = prepareEdges(comparison.target_data.edges, comparison.edge_matches, 'target');
    return { sourceNodes, sourceEdges, targetNodes, targetEdges };
  }, [comparison, highlightMode, showUnchanged]);
  const prepareNodes = useCallback((;);
    nodes: unknown,
    nodeMatches: unknown,
    side: 'source' | 'target'): Node => {,
    if (!comparison) return [];
    return nodes.map(node => {)
  const match = nodeMatches.find(m => ;);
        side === 'source' ? m.source_node_id === node.id : m.target_node_id === node.id
      );
      let diffState = 'unchanged';
      let changeDetails = {};
      if (match) {
        switch (match.match_type) {
        case 'added':
          diffState = 'added';
          break;
        case 'removed':
          diffState = 'removed';
          break;
        case 'modified':
        case 'similar':
          diffState = 'modified';
          changeDetails = match.property_changes;
          break;
        case 'exact':
          diffState = 'unchanged';
          break;
      // Filter based on highlight mode and show unchanged setting
      if (!showUnchanged && diffState === 'unchanged') {
        return null;
      if (highlightMode !== 'all') {
        switch (highlightMode) {
        case 'changes':
          if (diffState === 'unchanged') return null;
          break;
        case 'additions':
          if (diffState !== 'added') return null;
          break;
        case 'deletions':
          if (diffState !== 'removed') return null;
          break;
      return {
        id: node.id,
        type: 'diffNode',
        position: node.position || { x: 0, y: 0 },
        data: {,
  ...node.data,
  originalNode: node,
  diffState,
  changeDetails,
  showMetadata,
  side
},
  style: getDiffNodeStyle(diffState, highlightMode)
      };
    }).filter(Boolean) as Node;
  }, [comparison, highlightMode, showUnchanged, showMetadata]);
  const prepareEdges = useCallback((;);
    edges: unknown,
    edgeMatches: unknown,
    side: 'source' | 'target'): Edge => {,
    if (!comparison) return [];
    return edges.map(edge => {)
  const match = edgeMatches.find(m => ;);
        side === 'source' ? m.source_edge_id === edge.id : m.target_edge_id === edge.id
      );
      let diffState = 'unchanged';
      let changeDetails = {};
      if (match) {
  switch (match.match_type) {
  case 'added':,
  diffState = 'added';
  break;
  case 'removed':,
  diffState = 'removed';
  break;
  case 'modified':,
  case 'similar':,
  diffState = 'modified';
  changeDetails = match.property_changes;
  break;
  case 'exact':,
  diffState = 'unchanged';
  break;
  // Filter based on highlight mode and show unchanged setting
  if (!showUnchanged && diffState === 'unchanged') {
  return null;
  if (highlightMode !== 'all') {
  switch (highlightMode) {
  case 'changes':,
  if (diffState === 'unchanged') return null;
  break;
  case 'additions':,
  if (diffState !== 'added') return null;
  break;
  case 'deletions':,
  if (diffState !== 'removed') return null;
  break;
  return {
  id: edge.id,
  source: edge.source,
  target: edge.target,
  type: 'diffEdge',
  data: {,
  ...edge.data,
  originalEdge: edge,
  diffState,
  changeDetails,
  side
},
  style: getDiffEdgeStyle(diffState, highlightMode)
      };
    }).filter(Boolean) as Edge;
  }, [comparison, highlightMode, showUnchanged]);
  // Get node styling based on diff state
  const getDiffNodeStyle = (diffState: string, __highlightMode: HighlightMode) => {
  const baseStyle = {
  border: '2px solid',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
};
    switch (diffState) {
    case 'added':
      return { ...baseStyle, borderColor: '#10b981', backgroundColor: '#ecfdf5' };
    case 'removed':
      return { ...baseStyle, borderColor: '#ef4444', backgroundColor: '#fef2f2', opacity: 0.7 };
    case 'modified':
      return { ...baseStyle, borderColor: '#f59e0b', backgroundColor: '#fffbeb' };
    default:
      return { ...baseStyle, borderColor: '#6b7280', backgroundColor: '#f9fafb' };
  };
  // Get edge styling based on diff state
  const getDiffEdgeStyle = (diffState: string, __highlightMode: HighlightMode) => {
  const baseStyle = {
  strokeWidth: 2,
  transition: 'all 0.2s ease',
};
    switch (diffState) {
    case 'added':
      return { ...baseStyle, stroke: '#10b981' };
    case 'removed':
      return { ...baseStyle, stroke: '#ef4444', opacity: 0.7, strokeDasharray: '5,5' };
    case 'modified':
      return { ...baseStyle, stroke: '#f59e0b' };
    default:
      return { ...baseStyle, stroke: '#6b7280' };
  };
  // Render loading state
  if (versionsLoading || sessionLoading) {
    return;
      <div className={`visual-diff-panel ${className}`}>}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading comparison...</span>
        </div>
      </div>
    );
  // Render error state
  if (sessionError) {
    return;
      <div className={`visual-diff-panel ${className}`}>}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Comparison Error</h3>
              <p className="mt-1 text-sm text-red-700">{sessionError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  const { sourceNodes, sourceEdges, targetNodes, targetEdges } = prepareVisualizationData();
  // Custom node types
  const nodeTypes = {
  diffNode: DiffNodeRenderer,
};
  // Custom edge types
  const edgeTypes = {
  diffEdge: DiffEdgeRenderer,
};
  return;
    <div className={`visual-diff-panel ${className}`}>}
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Visual Diff</h2>
          {onClose && ()
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Version Selector */}
        <VersionSelector
          graphId={graphId}
          versions={versions}
          sourceVersionId={sourceVersionId}
          targetVersionId={targetVersionId}
          onVersionChange={handleVersionChange}
          className="mt-3"
        />
        {/* Comparison Stats */}
        {comparison && ()
          <ComparisonStats
            comparison={comparison}
            className="mt-3"
          />
        )}
      </div>
      {/* Toolbar */}
      <ComparisonToolbar
        viewMode={viewMode}
        highlightMode={highlightMode}
        showUnchanged={showUnchanged}
        showMetadata={showMetadata}
        zoomLevel={zoomLevel}
        onViewModeChange={handleViewModeChange}
        onHighlightModeChange={handleHighlightModeChange}
        onShowUnchangedChange={setShowUnchanged}
        onShowMetadataChange={setShowMetadata}
        onZoomChange={handleZoomChange}
        className="border-b border-gray-200"
      />
      {/* Main Content */}
      <div className="flex-1 relative">
        {viewMode === 'side-by-side' && ()
          <div className="flex h-full">
            {/* Source Graph */}
            <div className="flex-1 border-r border-gray-200">
              <div className="h-full relative">
                <div className="absolute top-2 left-2 z-10 bg-white rounded px-2 py-1 shadow-sm text-sm font-medium text-gray-700">
                  Source Version
                </div>
                <ReactFlow
                  nodes={sourceNodes}
                  edges={sourceEdges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  zoomOnScroll={false}
                  panOnScroll
                  defaultZoom={zoomLevel}
                >
                  <Background />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </div>
            </div>
            {/* Target Graph */}
            <div className="flex-1">
              <div className="h-full relative">
                <div className="absolute top-2 left-2 z-10 bg-white rounded px-2 py-1 shadow-sm text-sm font-medium text-gray-700">
                  Target Version
                </div>
                <ReactFlow
                  nodes={targetNodes}
                  edges={targetEdges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  zoomOnScroll={false}
                  panOnScroll
                  defaultZoom={zoomLevel}
                >
                  <Background />
                  <Controls showInteractive={false} />
                </ReactFlow>
              </div>
            </div>
          </div>
        )}
        {viewMode === 'unified' && ()
          <div className="h-full">
            <ReactFlow
              nodes={[...sourceNodes, ...targetNodes]}
              edges={[...sourceEdges, ...targetEdges]}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              zoomOnScroll={false}
              panOnScroll
              defaultZoom={zoomLevel}
            >
              <Background />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        )}
        {viewMode === 'overlay' && ()
          <div className="h-full relative">
            {/* Base layer - source */}
            <div className="absolute inset-0">
              <ReactFlow
                nodes={sourceNodes}
                edges={sourceEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                zoomOnScroll={false}
                panOnScroll
                defaultZoom={zoomLevel}
              >
                <Background />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
            {/* Overlay layer - target */}
            <div className="absolute inset-0 opacity-70">
              <ReactFlow
                nodes={targetNodes}
                edges={targetEdges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                zoomOnScroll={false}
                panOnScroll
                defaultZoom={zoomLevel}
              >
                <Background />
              </ReactFlow>
            </div>
          </div>
        )}
        {/* Legend */}
        <DiffLegend
          highlightMode={highlightMode}
          className="absolute bottom-4 right-4 z-10"
        />
      </div>
    </div>
  );
};
}
export default VisualDiffPanel;