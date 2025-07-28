// Epic 9.4 - Workflow History Visualization Component
// Component for displaying workflow history and audit trail
import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  LockClosedIcon,
  LockOpenIcon,
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
interface WorkflowHistoryEntry {
  id: string;,
  workspace_id: string;
  resource_id: string;,
  action_type: string;
  previous_state_id?: string;
  new_state_id?: string;
  actor_id: string;,
  action_timestamp: Date;
  approval_id?: string;
  transition_id?: string;
  comment?: string;
  metadata: Record<string, any>;
  interface WorkflowHistoryVisualizationProps {
  workspaceId: string;
  resourceId?: string;
  maxEntries?: number;
  showFilters?: boolean;
  compact?: boolean;
  export const WorkflowHistoryVisualization: React.FC<WorkflowHistoryVisualizationProps> = ({,)
  workspaceId,
  resourceId,
  maxEntries = 20,
  showFilters = true,
  compact = false
}) => {
  const {
    states,
    history,
    loading,
    error,
    fetchStates,
    fetchHistory
  } = useWorkflowStore();
  const [filters, setFilters] = useState({)
  resource_id: resourceId || '',
  actor_id: '',
  action_type: '',
  date_from: '',
  date_to: '',
});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  // Load data on mount
  useEffect(() => {
    fetchStates(workspaceId);
    fetchHistory(workspaceId, { ...filters, limit: maxEntries });
  }, [workspaceId, fetchStates, fetchHistory, filters, maxEntries]);
  const getStateName = (stateId?: string) => {
  if (!stateId) return 'Unknown';
  const state = states.find(s => s.id === stateId);
  return state ? state.name : 'Unknown';
};
  const getStateColor = (stateId?: string) => {
  if (!stateId) return '#6B7280';
  const state = states.find(s => s.id === stateId);
  return state ? state.color : '#6B7280';
};
  const getActionIcon = (actionType: string) => {
  switch (actionType) {
  case 'state_changed':,
  return <ArrowRightIcon className="h-4 w-4 text-blue-500" />;
  case 'approval_requested':,
  return <ClockIcon className="h-4 w-4 text-yellow-500" />;
  case 'approved':,
  return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
  case 'rejected':,
  return <XCircleIcon className="h-4 w-4 text-red-500" />;
  case 'lock_acquired':,
  return <LockClosedIcon className="h-4 w-4 text-orange-500" />;
  case 'lock_released':,
  return <LockOpenIcon className="h-4 w-4 text-orange-500" />;
  default:,
  return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
};
  const getActionDescription = (entry: WorkflowHistoryEntry) => {
    switch (entry.action_type) {
    case 'state_changed':
      return `Changed state from ${getStateName(entry.previous_state_id)} to ${getStateName(entry.new_state_id)}`;}
    case 'approval_requested':
      return `Requested approval for transition to ${getStateName(entry.new_state_id)}`;}
    case 'approved':
      return `Approved transition to ${getStateName(entry.new_state_id)}`;}
    case 'rejected':
      return `Rejected transition to ${getStateName(entry.new_state_id)}`;}
    case 'lock_acquired':
      return `Acquired ${entry.metadata.lock_type || 'edit'} lock`;}
    case 'lock_released':
      return `Released ${entry.metadata.lock_type || 'edit'} lock`;},}
  default:
      return `Performed ${entry.action_type}`;}
  };
  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;}
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;}
    } else {
      return date.toLocaleDateString();
  };
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  const clearFilters = () => {
  setFilters({)
  resource_id: resourceId || '',
  actor_id: '',
  action_type: '',
  date_from: '',
  date_to: '',
});
  };
  if (loading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) {
    return;
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <XCircleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading history</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  return;
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Workflow History
        </h3>
        {showFilters && ()
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </button>
        )}
      </div>
      {/* Filter Panel */}
      {showFilterPanel && ()
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                value={filters.action_type}
                onChange={(e) => handleFilterChange('action_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All actions</option>
                <option value="state_changed">State Changed</option>
                <option value="approval_requested">Approval Requested</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="lock_acquired">Lock Acquired</option>
                <option value="lock_released">Lock Released</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
      {/* History Timeline */}
      {history.length === 0 ? ()
        <div className="text-center py-8">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No workflow history matches your current filters.
          </p>
        </div>
      ) : ()
        <div className="space-y-4">
          {history.map((entry, index) => ()
            <div
              key={entry.id}
              className={`flex items-start space-x-4 ${compact ? 'py-2' : 'py-4'} ${}
                index < history.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              {/* Timeline indicator */}
              <div className="flex-shrink-0 relative">
                <div className="flex items-center justify-center w-8 h-8 bg-white border-2 border-gray-200 rounded-full">
                  {getActionIcon(entry.action_type)}
                </div>
                {index < history.length - 1 && ()
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
                )}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getActionDescription(entry)}
                    </span>
                    {entry.action_type === 'state_changed' && entry.new_state_id && ()
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getStateColor(entry.new_state_id)}20`}
},
  color: getStateColor(entry.new_state_id);
  }}
                      >
                        {getStateName(entry.new_state_id)}
                      </span>
                    )}
                  </div>
                  <time className="text-xs text-gray-500">
                    {formatTimestamp(entry.action_timestamp)}
                  </time>
                </div>
                <div className="mt-1 flex items-center space-x-2 text-sm text-gray-600">
                  <UserIcon className="h-3 w-3" />
                  <span>{entry.actor_id}</span>
                  <span>•</span>
                  <CalendarIcon className="h-3 w-3" />
                  <span>{new Date(entry.action_timestamp).toLocaleString()}</span>
                </div>
                {entry.comment && ()
                  <div className="mt-2 flex items-start space-x-2">
                    <ChatBubbleLeftIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-700 italic">
                      "{entry.comment}"
                    </p>
                  </div>
                )}
                {/* Metadata */}
                {Object.keys(entry.metadata).length > 0 && !compact && ()
                  <div className="mt-2 text-xs text-gray-500">
                    <details className="cursor-pointer">
                      <summary className="hover:text-gray-700">
                        Additional details
                      </summary>
                      <div className="mt-1 pl-4 border-l-2 border-gray-200">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Load More */}
      {history.length >= maxEntries && ()
        <div className="text-center">
          <button
            onClick={() => fetchHistory(workspaceId, { ...filters, limit: maxEntries * 2 })}
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Load more history
          </button>
        </div>
      )}
    </div>
  );
};