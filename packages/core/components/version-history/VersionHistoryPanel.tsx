/**
 * Epic 9.3.1 - Version History Panel Component
 * UI for browsing, comparing, and managing version snapshots and branches
 */

import React, { useState, useEffect, useMemo } from 'react';
import { VersionHistoryManager, VersionSnapshot, Branch, ChangeEvent, VersionAnnotation } from '../../version-history/VersionHistoryManager';

interface VersionHistoryPanelProps {
  versionManager: VersionHistoryManager;
  currentGraphData: any;
  onRestoreVersion: (snapshotId: string) => void;
  onCompareVersions: (fromId: string, toId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

type ViewMode = 'timeline' | 'branches' | 'changes' | 'annotations';

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  versionManager,
  currentGraphData,
  onRestoreVersion,
  onCompareVersions,
  isOpen,
  onClose,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [changeEvents, setChangeEvents] = useState<ChangeEvent[]>([]);
  const [annotations, setAnnotations] = useState<VersionAnnotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [selectedSnapshots, setSelectedSnapshots] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [authorFilter, setAuthorFilter] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, viewMode, selectedBranch]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (viewMode) {
      case 'timeline':
        await loadSnapshots();
        break;
      case 'branches':
        await loadBranches();
        await loadSnapshots();
        break;
      case 'changes':
        await loadChangeEvents();
        break;
      case 'annotations':
        await loadAnnotations();
        break;
      }
    } catch (error) {
      console.error('Failed to load version history data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async () => {
    const filter = {
      branch_name: selectedBranch,
      limit: 50,
      include_annotations: true
    };

    // Apply date filter
    if (dateFilter !== 'all') {
      const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      filter.start_date = startDate.toISOString();
    }

    if (authorFilter) {
      filter.author_id = authorFilter;
    }

    const result = await versionManager.getSnapshots(filter);
    setSnapshots(result.snapshots);
  };

  const loadBranches = async () => {
    const branchList = await versionManager.getBranches();
    setBranches(branchList);
  };

  const loadChangeEvents = async () => {
    const filter = {
      limit: 100,
      author_id: authorFilter || undefined
    };

    if (dateFilter !== 'all') {
      const days = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      filter.start_date = startDate.toISOString();
    }

    const result = await versionManager.getChangeEvents(filter);
    setChangeEvents(result.events);
  };

  const loadAnnotations = async () => {
    // Load annotations for all snapshots
    const allAnnotations: VersionAnnotation[] = [];
    for (const snapshot of snapshots.slice(0, 20)) { // Limit to recent snapshots
      try {
        const snapshotAnnotations = await versionManager.getAnnotations(snapshot.id);
        allAnnotations.push(...snapshotAnnotations);
      } catch (error) {
        console.error(`Failed to load annotations for snapshot ${snapshot.id}:`, error);
      }
    }
    setAnnotations(allAnnotations);
  };

  const handleCreateSnapshot = async () => {
    try {
      setLoading(true);
      const title = prompt('Enter snapshot title:');
      if (!title) return;

      const description = prompt('Enter snapshot description (optional):') || undefined;

      await versionManager.createSnapshot(currentGraphData, {
        title,
        description,
        snapshot_type: 'manual'
      });

      await loadSnapshots();
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      alert('Failed to create snapshot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSnapshotSelect = (snapshotId: string, selected: boolean) => {
    const newSelection = new Set(selectedSnapshots);
    if (selected) {
      newSelection.add(snapshotId);
    } else {
      newSelection.delete(snapshotId);
    }
    setSelectedSnapshots(newSelection);
  };

  const handleCompareSelected = () => {
    const selected = Array.from(selectedSnapshots);
    if (selected.length === 2) {
      onCompareVersions(selected[0], selected[1]);
    } else {
      alert('Please select exactly 2 snapshots to compare.');
    }
  };

  const filteredSnapshots = useMemo(() => {
    if (!searchQuery) return snapshots;
    
    const query = searchQuery.toLowerCase();
    return snapshots.filter(snapshot => 
      snapshot.title?.toLowerCase().includes(query) ||
      snapshot.description?.toLowerCase().includes(query) ||
      snapshot.changelog?.toLowerCase().includes(query) ||
      snapshot.version_tag?.toLowerCase().includes(query)
    );
  }, [snapshots, searchQuery]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getSnapshotTypeIcon = (type: string): string => {
    switch (type) {
    case 'manual': return '📝';
    case 'auto': return '🤖';
    case 'milestone': return '🏆';
    case 'backup': return '💾';
    default: return '📄';
    }
  };

  const getSnapshotTypeColor = (type: string): string => {
    switch (type) {
    case 'manual': return 'bg-blue-100 text-blue-800';
    case 'auto': return 'bg-gray-100 text-gray-800';
    case 'milestone': return 'bg-yellow-100 text-yellow-800';
    case 'backup': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`version-history-panel ${className} fixed right-0 top-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { key: 'timeline', label: 'Timeline', icon: '📋' },
            { key: 'branches', label: 'Branches', icon: '🌿' },
            { key: 'changes', label: 'Changes', icon: '📝' },
            { key: 'annotations', label: 'Notes', icon: '💭' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setViewMode(tab.key as ViewMode)}
              className={`flex-1 flex items-center justify-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Search versions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex space-x-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All time</option>
              <option value="week">Past week</option>
              <option value="month">Past month</option>
              <option value="quarter">Past quarter</option>
            </select>
            
            {viewMode === 'timeline' && (
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="main">Main branch</option>
                {branches.filter(b => b.name !== 'main').map(branch => (
                  <option key={branch.id} value={branch.name}>{branch.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleCreateSnapshot}
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Create Snapshot
          </button>
          
          {selectedSnapshots.size === 2 && (
            <button
              onClick={handleCompareSelected}
              className="px-3 py-2 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Compare
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {viewMode === 'timeline' && (
              <SnapshotTimeline
                snapshots={filteredSnapshots}
                selectedSnapshots={selectedSnapshots}
                onSnapshotSelect={handleSnapshotSelect}
                onRestore={onRestoreVersion}
                formatTimeAgo={formatTimeAgo}
                getSnapshotTypeIcon={getSnapshotTypeIcon}
                getSnapshotTypeColor={getSnapshotTypeColor}
              />
            )}

            {viewMode === 'branches' && (
              <BranchView
                branches={branches}
                snapshots={snapshots}
                selectedBranch={selectedBranch}
                onBranchSelect={setSelectedBranch}
                formatTimeAgo={formatTimeAgo}
              />
            )}

            {viewMode === 'changes' && (
              <ChangeEventsList
                events={changeEvents}
                formatTimeAgo={formatTimeAgo}
              />
            )}

            {viewMode === 'annotations' && (
              <AnnotationsList
                annotations={annotations}
                formatTimeAgo={formatTimeAgo}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Sub-components

interface SnapshotTimelineProps {
  snapshots: VersionSnapshot[];
  selectedSnapshots: Set<string>;
  onSnapshotSelect: (id: string, selected: boolean) => void;
  onRestore: (id: string) => void;
  formatTimeAgo: (date: string) => string;
  getSnapshotTypeIcon: (type: string) => string;
  getSnapshotTypeColor: (type: string) => string;
}

const SnapshotTimeline: React.FC<SnapshotTimelineProps> = ({
  snapshots,
  selectedSnapshots,
  onSnapshotSelect,
  onRestore,
  formatTimeAgo,
  getSnapshotTypeIcon,
  getSnapshotTypeColor
}) => {
  return (
    <div className="p-4">
      {snapshots.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📋</div>
          <h3 className="font-medium text-gray-900 mb-1">No snapshots yet</h3>
          <p className="text-sm">Create your first snapshot to track changes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map(snapshot => (
            <div
              key={snapshot.id}
              className={`border rounded-lg p-3 transition-colors ${
                selectedSnapshots.has(snapshot.id)
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedSnapshots.has(snapshot.id)}
                  onChange={(e) => onSnapshotSelect(snapshot.id, e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getSnapshotTypeColor(snapshot.snapshot_type)}`}>
                      {getSnapshotTypeIcon(snapshot.snapshot_type)} {snapshot.snapshot_type}
                    </span>
                    {snapshot.version_tag && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        {snapshot.version_tag}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {snapshot.title || `Version ${snapshot.version_number}`}
                  </h4>
                  
                  {snapshot.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {snapshot.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>{formatTimeAgo(snapshot.created_at)}</span>
                    <span>{snapshot.node_count} nodes</span>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => onRestore(snapshot.id)}
                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Restore this version"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface BranchViewProps {
  branches: Branch[];
  snapshots: VersionSnapshot[];
  selectedBranch: string;
  onBranchSelect: (branchName: string) => void;
  formatTimeAgo: (date: string) => string;
}

const BranchView: React.FC<BranchViewProps> = ({
  branches,
  snapshots,
  selectedBranch,
  onBranchSelect,
  formatTimeAgo
}) => {
  const getBranchIcon = (type: string): string => {
    switch (type) {
    case 'main': return '🌳';
    case 'feature': return '🌿';
    case 'hotfix': return '🔥';
    case 'experiment': return '🧪';
    case 'archive': return '📦';
    default: return '🌿';
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-3">
        {branches.map(branch => (
          <div
            key={branch.id}
            className={`border rounded-lg p-3 cursor-pointer transition-colors ${
              selectedBranch === branch.name
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onBranchSelect(branch.name)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getBranchIcon(branch.branch_type)}</span>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{branch.name}</h4>
                  <p className="text-xs text-gray-500">{branch.branch_type}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-500">{branch.total_commits} commits</div>
                <div className="text-xs text-gray-400">{formatTimeAgo(branch.updated_at)}</div>
              </div>
            </div>
            
            {branch.description && (
              <p className="text-xs text-gray-600 mb-2">{branch.description}</p>
            )}
            
            <div className="flex items-center space-x-2">
              {branch.is_protected && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Protected
                </span>
              )}
              {!branch.is_active && (
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Archived
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ChangeEventsListProps {
  events: ChangeEvent[];
  formatTimeAgo: (date: string) => string;
}

const ChangeEventsList: React.FC<ChangeEventsListProps> = ({ events, formatTimeAgo }) => {
  const getEventIcon = (eventType: string): string => {
    if (eventType.includes('node')) return '🔵';
    if (eventType.includes('edge')) return '🔗';
    if (eventType.includes('property')) return '⚙️';
    if (eventType.includes('snapshot')) return '📸';
    if (eventType.includes('branch')) return '🌿';
    return '📝';
  };

  const getEventDescription = (event: ChangeEvent): string => {
    const { event_type, event_data } = event;
    
    switch (event_type) {
    case 'node_added':
      return `Added ${event_data.node_count || 1} node(s)`;
    case 'node_removed':
      return `Removed ${event_data.node_count || 1} node(s)`;
    case 'node_modified':
      return `Modified ${event_data.node_count || 1} node(s)`;
    case 'property_changed':
      return `Changed ${event_data.property_name || 'properties'}`;
    case 'snapshot_created':
      return `Created snapshot: ${event_data.snapshot_type || 'manual'}`;
    case 'branch_created':
      return `Created branch: ${event_data.branch_name}`;
    case 'branch_switched':
      return `Switched to branch: ${event_data.branch_name}`;
    case 'branch_merged':
      return 'Merged branches';
    default:
      return event_type.replace(/_/g, ' ');
    }
  };

  return (
    <div className="p-4">
      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📝</div>
          <h3 className="font-medium text-gray-900 mb-1">No changes recorded</h3>
          <p className="text-sm">Changes will appear here as you work.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map(event => (
            <div key={event.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
              <span className="text-lg mt-0.5">{getEventIcon(event.event_type)}</span>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{getEventDescription(event)}</p>
                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                  <span>by {event.author_name || event.author_id}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(event.occurred_at)}</span>
                  {event.change_magnitude > 0 && (
                    <>
                      <span>•</span>
                      <span>Impact: {Math.round(event.change_magnitude)}/10</span>
                    </>
                  )}
                </div>
                
                {event.affected_nodes.length > 0 && (
                  <div className="mt-1 text-xs text-gray-400">
                    Affected {event.affected_nodes.length} node(s)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface AnnotationsListProps {
  annotations: VersionAnnotation[];
  formatTimeAgo: (date: string) => string;
}

const AnnotationsList: React.FC<AnnotationsListProps> = ({ annotations, formatTimeAgo }) => {
  const getAnnotationIcon = (type: string): string => {
    switch (type) {
    case 'comment': return '💬';
    case 'review': return '👀';
    case 'approval': return '✅';
    case 'flag': return '🚩';
    default: return '💭';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
    case 'critical': return 'text-red-600';
    case 'high': return 'text-orange-600';
    case 'normal': return 'text-gray-600';
    case 'low': return 'text-gray-400';
    default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-4">
      {annotations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💭</div>
          <h3 className="font-medium text-gray-900 mb-1">No annotations yet</h3>
          <p className="text-sm">Add comments and reviews to collaborate.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {annotations.map(annotation => (
            <div key={annotation.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start space-x-2 mb-2">
                <span className="text-lg">{getAnnotationIcon(annotation.annotation_type)}</span>
                <div className="flex-1">
                  {annotation.title && (
                    <h5 className="text-sm font-medium text-gray-900 mb-1">{annotation.title}</h5>
                  )}
                  <p className="text-sm text-gray-700">{annotation.content_markdown}</p>
                </div>
                <span className={`text-xs ${getPriorityColor(annotation.priority)}`}>
                  {annotation.priority}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>by {annotation.author_id}</span>
                <span>{formatTimeAgo(annotation.created_at)}</span>
              </div>
              
              {annotation.status === 'resolved' && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ Resolved {annotation.resolved_at && `on ${formatTimeAgo(annotation.resolved_at)}`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};