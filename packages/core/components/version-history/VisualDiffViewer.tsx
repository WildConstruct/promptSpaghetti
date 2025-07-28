/**
 * Epic 9.3.2 - Visual Diff Viewer Component
 * Advanced visual comparison of graph versions with side-by-side and overlay views
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GraphDiffEngine, GraphDiff, DiffChange, GraphData } from './GraphDiffEngine';
interface VisualDiffViewerProps {
  fromGraphData: GraphData;,
  toGraphData: GraphData;
  diff?: GraphDiff;
  isOpen: boolean;,
  onClose: () => void;
  onApplyChange?: (changeId: string) => void;
  onRejectChange?: (changeId: string) => void;
  className?: string;
  type ViewMode = 'side-by-side' | 'overlay' | 'changes-only';
  type FilterMode = 'all' | 'structural' | 'properties' | 'positions' | 'significant';
  export const VisualDiffViewer: React.FC<VisualDiffViewerProps> = ({,)
  fromGraphData,
  toGraphData,
  diff: externalDiff,
  isOpen,
  onClose,
  onApplyChange,
  onRejectChange,
  className = ''
}) => {
  const [diff, setDiff] = useState<GraphDiff | null>(externalDiff || null);
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [selectedChange, setSelectedChange] = useState<string | null>(null);
  const [highlightSimilar, setHighlightSimilar] = useState(false);
  const [showRegions, setShowRegions] = useState(true);
  const [showPaths, setShowPaths] = useState(true);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const diffEngine = useRef(new GraphDiffEngine({)
  ignore_position_changes: false,
  ignore_style_changes: false,
  deep_property_comparison: true,
}));
  useEffect(() => {
    if (isOpen && !diff) {
      computeDiff();
  }, [isOpen, fromGraphData, toGraphData]);
  const computeDiff = async () => {
    try {
      setLoading(true);
      const computedDiff = await diffEngine.current.computeDiff(fromGraphData, toGraphData);
      setDiff(computedDiff);
    } catch (error) {
  console.error('Failed to compute diff:', error);
} finally {
      setLoading(false);
  };
  const filteredChanges = useMemo(() => {
  if (!diff) return [];
  switch (filterMode) {
  case 'structural':,
  return GraphDiffEngine.filterChanges(diff, {)
  change_types: ['added', 'removed'],
  element_types: ['node', 'edge'],
});
    case 'properties':
      return GraphDiffEngine.filterChanges(diff, {)
  element_types: ['property'],
});
    case 'positions':
      return GraphDiffEngine.filterChanges(diff, {)
  change_types: ['moved'],
});
    case 'significant':
      return GraphDiffEngine.getSignificantChanges(diff, 0.6);
    default:
      return diff.changes;
  }, [diff, filterMode]);
  const getChangeColor = (change: DiffChange): string => {
  switch (change.type) {
  case 'added': return '#10B981'; // green,
  case 'removed': return '#EF4444'; // red,
  case 'modified': return '#F59E0B'; // yellow,
  case 'moved': return '#8B5CF6'; // purple,
  default: return '#6B7280'; // gray,
};
  const getChangeIcon = (change: DiffChange): string => {
  switch (change.type) {
  case 'added': return '+';
  case 'removed': return '−';
  case 'modified': return '~';
  case 'moved': return '↔';
  default: return '?';
};
  const getSignificanceLevel = (significance: number): string => {
    if (significance >= 0.8) return 'High';
    if (significance >= 0.5) return 'Medium';
    if (significance >= 0.2) return 'Low';
    return 'Minimal';
  };
  const getSignificanceColor = (significance: number): string => {
    if (significance >= 0.8) return 'text-red-600';
    if (significance >= 0.5) return 'text-orange-600';
    if (significance >= 0.2) return 'text-yellow-600';
    return 'text-gray-600';
  };
  const handleChangeClick = (changeId: string) => {
  setSelectedChange(selectedChange === changeId ? null : changeId);
  if (highlightSimilar && diff) {
  // Highlight similar changes
  const selectedChangeData = diff.changes.find(c => c.element_id === changeId);
  if (selectedChangeData) {
  // Find and highlight similar changes (same type, similar element)
  // This would integrate with the graph visualization
};
  const renderChangesList = () => (;);
    <div className="h-full flex flex-col">
      {/* Changes Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Changes</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {filteredChanges.length} of {diff?.changes.length || 0}
            </span>
          </div>
        </div>
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { key: 'all', label: 'All Changes', count: diff?.changes.length || 0 },
            { key: 'structural', label: 'Structural', count: diff?.summary.added_nodes + diff?.summary.removed_nodes + diff?.summary.added_edges + diff?.summary.removed_edges || 0 },
            { key: 'properties', label: 'Properties', count: diff?.summary.property_changes || 0 },
            { key: 'positions', label: 'Positions', count: diff?.summary.moved_nodes || 0 },
            { key: 'significant', label: 'Significant', count: GraphDiffEngine.getSignificantChanges(diff || { changes: [] } as GraphDiff, 0.6).length }
          ].map(filter => ()
            <button
              key={filter.key}
              onClick={() => setFilterMode(filter.key as FilterMode)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
  filterMode === filter.key
  ? 'bg-blue-500 text-white'
  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
        {/* View Options */}
        <div className="flex items-center space-x-4 text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={highlightSimilar}
              onChange={(e) => setHighlightSimilar(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            />
            Highlight similar
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showRegions}
              onChange={(e) => setShowRegions(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            />
            Show regions
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showPaths}
              onChange={(e) => setShowPaths(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
            />
            Show paths
          </label>
        </div>
      </div>
      {/* Changes List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? ()
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredChanges.length === 0 ? ()
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <h4 className="font-medium text-gray-900 mb-1">No changes found</h4>
            <p className="text-sm">Try adjusting your filters to see different types of changes.</p>
          </div>
        ) : ()
          <div className="divide-y divide-gray-100">
            {filteredChanges.map((change, index) => ()
              <ChangeItem
                key={`${change.element_id}-${index}`}
                change={change}
                isSelected={selectedChange === change.element_id}
                onClick={() => handleChangeClick(change.element_id)}
                onApply={onApplyChange ? () => onApplyChange(change.element_id) : undefined}
                onReject={onRejectChange ? () => onRejectChange(change.element_id) : undefined}
                getChangeColor={getChangeColor}
                getChangeIcon={getChangeIcon}
                getSignificanceLevel={getSignificanceLevel}
                getSignificanceColor={getSignificanceColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
  const renderSummaryStats = () => {
    if (!diff) return null;
    const stats = [;
      { label: 'Similarity', value: `${Math.round(diff.summary.similarity_score * 100)}%`, color: 'text-green-600' }
}
      { label: 'Complexity', value: `${diff.summary.complexity_score.toFixed(1)}/10`, color: 'text-blue-600' }
}
      { label: 'Total Changes', value: diff.summary.total_changes.toString(), color: 'text-gray-900' },
      { label: 'Nodes Added', value: diff.summary.added_nodes.toString(), color: 'text-green-600' },
      { label: 'Nodes Removed', value: diff.summary.removed_nodes.toString(), color: 'text-red-600' },
      { label: 'Nodes Modified', value: diff.summary.modified_nodes.toString(), color: 'text-orange-600' },
      { label: 'Nodes Moved', value: diff.summary.moved_nodes.toString(), color: 'text-purple-600' },
      { label: 'Edges Added', value: diff.summary.added_edges.toString(), color: 'text-green-600' },
      { label: 'Edges Removed', value: diff.summary.removed_edges.toString(), color: 'text-red-600' },
      { label: 'Properties Changed', value: diff.summary.property_changes.toString(), color: 'text-blue-600' }
    ];
    return;
      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 border-b border-gray-200">
        {stats.map(stat => ()
          <div key={stat.label} className="text-center">
            <div className={`text-lg font-semibold ${stat.color}`}>{stat.value}</div>}
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  };
  if (!isOpen) return null;
  return;
    <div className={`visual-diff-viewer ${className} fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>}
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Visual Diff Viewer</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* View Mode Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'side-by-side', label: 'Side by Side', icon: '⫸' },
              { key: 'overlay', label: 'Overlay', icon: '⬚' },
              { key: 'changes-only', label: 'Changes Only', icon: '📝' }
            ].map(mode => ()
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key as ViewMode)}
                className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded transition-colors ${
  viewMode === mode.key
  ? 'bg-white text-gray-900 shadow-sm'
  : 'text-gray-600 hover:text-gray-900',
}`}
              >
                <span className="mr-2">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        </div>
        {/* Summary Stats */}
        {renderSummaryStats()}
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Changes Panel */}
          <div className="w-80 border-r border-gray-200 bg-white">
            {renderChangesList()}
          </div>
          {/* Diff Visualization */}
          <div className="flex-1 bg-gray-50 relative">
            {viewMode === 'side-by-side' && ()
              <SideBySideView
                fromGraph={fromGraphData}
                toGraph={toGraphData}
                diff={diff}
                selectedChange={selectedChange}
                showRegions={showRegions}
                showPaths={showPaths}
                zoom={zoom}
                pan={pan}
                onZoomChange={setZoom}
                onPanChange={setPan}
              />
            )}
            {viewMode === 'overlay' && ()
              <OverlayView
                fromGraph={fromGraphData}
                toGraph={toGraphData}
                diff={diff}
                selectedChange={selectedChange}
                showRegions={showRegions}
                showPaths={showPaths}
                zoom={zoom}
                pan={pan}
                onZoomChange={setZoom}
                onPanChange={setPan}
              />
            )}
            {viewMode === 'changes-only' && ()
              <ChangesOnlyView
                diff={diff}
                filteredChanges={filteredChanges}
                selectedChange={selectedChange}
                getChangeColor={getChangeColor}
                getChangeIcon={getChangeIcon}
              />
            )}
            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
              <button
                onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
                className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.2, prev / 1.2))}
                className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <button
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="bg-white border border-gray-300 rounded p-2 hover:bg-gray-50 transition-colors text-xs"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components (simplified versions - would need full implementations)
interface ChangeItemProps {
  change: DiffChange;,
  isSelected: boolean;
  onClick: () => void;
  onApply?: () => void;
  onReject?: () => void;
  getChangeColor: (change: DiffChange) => string;,
  getChangeIcon: (change: DiffChange) => string;,
  getSignificanceLevel: (significance: number) => string;,
  getSignificanceColor: (significance: number) => string;
  const ChangeItem: React.FC<ChangeItemProps> = ({,)
  change,
  isSelected,
  onClick,
  onApply,
  onReject,
  getChangeColor,
  getChangeIcon,
  getSignificanceLevel,
  getSignificanceColor
}) => {
  const renderChangeDescription = () => {
    const baseDesc = `${change.type} ${change.element_type}`;}
    if (change.property_path) {
      return `${baseDesc}: ${change.property_path}`;}
    if (change.type === 'moved' && change.position_change) {
      return `${baseDesc} (moved ${Math.round(change.position_change.distance)}px)`;}
    return baseDesc;
  };
  return;
    <div
      className={`p-3 cursor-pointer transition-colors ${
  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50',
}`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: getChangeColor(change) }}
        >
          {getChangeIcon(change)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {change.element_id}
            </h4>
            <span className={`text-xs ${getSignificanceColor(change.significance)}`}>}
              {getSignificanceLevel(change.significance)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {renderChangeDescription()}
          </p>
          {change.old_value !== undefined && change.new_value !== undefined && ()
            <div className="text-xs space-y-1">
              <div className="text-red-600">
                − {JSON.stringify(change.old_value).slice(0, 50)}
              </div>
              <div className="text-green-600">
                + {JSON.stringify(change.new_value).slice(0, 50)}
              </div>
            </div>
          )}
          {(onApply || onReject) && isSelected && ()
            <div className="flex space-x-2 mt-2">
              {onApply && ()
                <button
                  onClick={(e) => { e.stopPropagation(); onApply(); }}
                  className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Apply
                </button>
              )}
              {onReject && ()
                <button
                  onClick={(e) => { e.stopPropagation(); onReject(); }}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Reject
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for different view modes
const SideBySideView: React.FC<unknown> = ({ _____fromGraph, _____toGraph, _____diff, _____selectedChange, _____showRegions, _____showPaths, _____zoom, _____pan, _____onZoomChange, _____onPanChange }) => ()
  <div className="h-full flex">
    <div className="flex-1 border-r border-gray-300 bg-white">
      <div className="h-8 bg-gray-100 border-b border-gray-300 flex items-center px-3 text-sm font-medium text-gray-700">
        Original Version
      </div>
      <div className="h-full bg-gray-50 flex items-center justify-center text-gray-500">
        Graph Visualization (Original)
      </div>
    </div>
    <div className="flex-1 bg-white">
      <div className="h-8 bg-gray-100 border-b border-gray-300 flex items-center px-3 text-sm font-medium text-gray-700">
        New Version
      </div>
      <div className="h-full bg-gray-50 flex items-center justify-center text-gray-500">
        Graph Visualization (New)
      </div>
    </div>
  </div>
);
const OverlayView: React.FC<unknown> = ({ _____fromGraph, _____toGraph, _____diff, _____selectedChange, _____showRegions, _____showPaths, _____zoom, _____pan, _____onZoomChange, _____onPanChange }) => ()
  <div className="h-full bg-white">
    <div className="h-8 bg-gray-100 border-b border-gray-300 flex items-center px-3 text-sm font-medium text-gray-700">
      Overlay View
    </div>
    <div className="h-full bg-gray-50 flex items-center justify-center text-gray-500">
      Graph Visualization (Overlay with Changes)
    </div>
  </div>
);
const ChangesOnlyView: React.FC<unknown> = ({ _____diff, filteredChanges, _____selectedChange, getChangeColor, getChangeIcon }) => ()
  <div className="h-full bg-white p-4">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Changes Summary</h3>
    <div className="space-y-4">
      {filteredChanges.map((change, index) => ()
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: getChangeColor(change) }}
            >
              {getChangeIcon(change)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{change.element_id}</h4>
              <p className="text-sm text-gray-600">{change.type} {change.element_type}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);