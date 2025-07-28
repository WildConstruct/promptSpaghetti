// Epic 9.4.4 - Audit Trail Viewer Component
// UI component for viewing and filtering audit trail records
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardDocumentListIcon,
  FunnelIcon,
  CalendarDaysIcon,
  UserIcon,
  CogIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';
import { useWorkflowStore } from '../stores/workflowStore';
interface AuditTrailViewerProps {
  workspaceId: string;
  resourceId?: string;
  onClose?: () => void;
  interface AuditFilters {
  action_type?: string;
  actor_id?: string;
  resource_id?: string;
  start_date?: Date;
  end_date?: Date;
  search_term?: string;
  export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({,)
  workspaceId,
  resourceId,
  onClose
}) => {
  const {
    auditHistory,
    loading,
    error,
    fetchAuditHistory,
    exportAuditHistory
  } = useWorkflowStore();
  const [filters, setFilters] = useState<AuditFilters>({)
  resource_id: resourceId,
});
  const [showFilters, setShowFilters] = useState(false);
  const [_____selectedEntries, _____setSelectedEntries] = useState<Set<string>>(new Set());
  const [showExportDialog, setShowExportDialog] = useState(false);
  // Load audit history
  useEffect(() => {
    fetchAuditHistory(workspaceId, filters);
  }, [workspaceId, filters, fetchAuditHistory]);
  // Filter audit entries
  const filteredEntries = useMemo(() => {
    let entries = auditHistory;
    if (filters.action_type) {
      entries = entries.filter(entry => entry.action_type === filters.action_type);
    if (filters.actor_id) {
      entries = entries.filter(entry => entry.actor_id === filters.actor_id);
    if (filters.resource_id) {
      entries = entries.filter(entry => entry.resource_id === filters.resource_id);
    if (filters.start_date) {
      entries = entries.filter(entry => )
        new Date(entry.action_timestamp) >= filters.start_date!
      );
    if (filters.end_date) {
      entries = entries.filter(entry => )
        new Date(entry.action_timestamp) <= filters.end_date!
      );
    if (filters.search_term) {
      const searchLower = filters.search_term.toLowerCase();
      entries = entries.filter(entry => )
        entry.action_type.toLowerCase().includes(searchLower) ||
        entry.actor_id.toLowerCase().includes(searchLower) ||
        entry.comment?.toLowerCase().includes(searchLower) ||
        JSON.stringify(entry.metadata).toLowerCase().includes(searchLower)
      );
    return entries.sort((a, b) => 
      new Date(b.action_timestamp).getTime() - new Date(a.action_timestamp).getTime()
    );
  }, [auditHistory, filters]);
  // Get unique action types and actors for filter options
  const actionTypes = useMemo(() => ;
    Array.from(new Set(auditHistory.map(entry => entry.action_type))).sort()
  , [auditHistory]);
  const actors = useMemo(() => ;
    Array.from(new Set(auditHistory.map(entry => entry.actor_id))).sort()
  , [auditHistory]);
  const handleFilterChange = (key: keyof AuditFilters, value: Error) => {
  setFilters(prev => ({)
  ...prev,
  [key]: value,
}));
  };
  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      await exportAuditHistory(workspaceId, filters, format);
      setShowExportDialog(false);
    } catch (error) {
  console.error('Failed to export audit history:', error);
};
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };
  const getActionTypeIcon = (actionType: string) => {
  switch (actionType) {
  case 'state_change':,
  return <CogIcon className="h-4 w-4 text-blue-600" />;
  case 'approval_requested':,
  return <ClockIcon className="h-4 w-4 text-yellow-600" />;
  case 'approved':,
  return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
  case 'rejected':,
  return <XCircleIcon className="h-4 w-4 text-red-600" />;
  case 'locked':,
  return <LockClosedIcon className="h-4 w-4 text-orange-600" />;
  case 'unlocked':,
  return <LockOpenIcon className="h-4 w-4 text-gray-600" />;
  default:,
  return <ClipboardDocumentListIcon className="h-4 w-4 text-gray-600" />;
};
  const getActionTypeColor = (actionType: string) => {
  switch (actionType) {
  case 'state_change': return 'bg-blue-50 text-blue-800';
  case 'approval_requested': return 'bg-yellow-50 text-yellow-800';
  case 'approved': return 'bg-green-50 text-green-800';
  case 'rejected': return 'bg-red-50 text-red-800';
  case 'locked': return 'bg-orange-50 text-orange-800';
  case 'unlocked': return 'bg-gray-50 text-gray-800';
  default: return 'bg-gray-50 text-gray-800';
};
  if (loading) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  if (error) {
    return;
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Failed to load audit history: {error}</span>
        </div>
      </div>
    );
  return;
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClipboardDocumentListIcon className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Audit Trail</h2>
              <p className="text-sm text-gray-500">
                {filteredEntries.length} entries found
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDownIcon className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
            </button>
            <button
              onClick={() => setShowExportDialog(true)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            {onClose && ()
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Filters */}
      {showFilters && ()
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                value={filters.action_type || ''}
                onChange={(e) => handleFilterChange('action_type', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actions</option>
                {actionTypes.map(type => ()
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actor
              </label>
              <select
                value={filters.actor_id || ''}
                onChange={(e) => handleFilterChange('actor_id', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Actors</option>
                {actors.map(actor => ()
                  <option key={actor} value={actor}>
                    {actor}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search_term || ''}
                  onChange={(e) => handleFilterChange('search_term', e.target.value || undefined)}
                  placeholder="Search entries..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={filters.start_date ? filters.start_date.toISOString().slice(0, 16) : ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                value={filters.end_date ? filters.end_date.toISOString().slice(0, 16) : ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
      {/* Audit entries */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? ()
          <div className="p-8 text-center text-gray-500">
            <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No audit entries found matching your criteria.</p>
          </div>
        ) : ()
          filteredEntries.map((entry) => ()
            <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActionTypeIcon(entry.action_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionTypeColor(entry.action_type)}`}>}
                      {entry.action_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(entry.action_timestamp)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-4 w-4" />
                      <span>{entry.actor_id}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>Resource: {entry.resource_id}</span>
                    </div>
                  </div>
                  {entry.comment && ()
                    <p className="mt-2 text-sm text-gray-700">
                      {entry.comment}
                    </p>
                  )}
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && ()
                    <div className="mt-2 text-xs text-gray-500">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-700">
                          Additional metadata ({Object.keys(entry.metadata).length} items)
                        </summary>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(entry.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Export dialog */}
      {showExportDialog && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Export Audit History</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                CSV Format
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                JSON Format
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                PDF Report
              </button>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowExportDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrailViewer;