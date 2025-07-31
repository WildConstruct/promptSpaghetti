/**
 * Deletion Workflow Manager Component (Epic 19)
 * 
 * Advanced workflow management system for automated data deletion processes
 * as part of Epic 19's Data Protection & Privacy Controls.
 * 
 * Features:
 * - Real-time workflow monitoring and control
 * - Workflow creation and scheduling
 * - Progress tracking and error handling
 * - Bulk deletion operations
 * - Rollback and recovery capabilities
 * - Compliance-aware deletion processes
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Square,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  Search,
  Calendar,
  Database,
  FileText,
  Timer,
  BarChart3,
  RefreshCw,
  Plus
} from 'lucide-react';
}
interface DeletionWorkflow {
  id: string;,
  name: string;
  description: string;,
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'critical';
  // Execution details
  progress: number;
  startedAt?: string;
  completedAt?: string;
  estimatedCompletion?: string;
  executionTimeMs?: number;
  // Data processing
  recordsTotal: number;,
  recordsProcessed: number;
  recordsDeleted: number;,
  recordsSkipped: number;
  recordsErrored: number;,
  dataSizeBytes: number;
  deletedSizeBytes: number;
  // Configuration
  retentionPolicyId: string;,
  retentionPolicyName: string;
  dataTypes: string;,
  sourceLocation: string;
  deletionCriteria: string;,
  batchSize: number;
  maxRetries: number;
  // Safety and compliance
  dryRunMode: boolean;,
  requireConfirmation: boolean;
  backupBeforeDelete: boolean;,
  complianceFrameworks: string;
  auditLevel: 'basic' | 'detailed' | 'verbose';
  // Scheduling
  scheduleType: 'immediate' | 'delayed' | 'recurring' | 'conditional';
  scheduledAt?: string;
  cronExpression?: string;
  conditions?: string;
  // Errors and warnings
  errors: WorkflowError;,
  warnings: string;
  // Metadata
  createdAt: string;,
  updatedAt: string;
  createdBy: string;,
  lastModifiedBy: string;
  tags: string;
}
interface WorkflowError {
  id: string;,
  timestamp: string;
  severity: 'warning' | 'error' | 'critical';,
  message: string;
  recordId?: string;
  stackTrace?: string;
  resolution?: string;
  resolved: boolean;
}
interface WorkflowTemplate {
  id: string;,
  name: string;
  description: string;,
  category: 'user_data' | 'system_cleanup' | 'log_rotation' | 'compliance' | 'backup_cleanup';
  recommended: boolean;,
  config: Partial<DeletionWorkflow>;
}
interface WorkflowMetrics {
  totalWorkflows: number;,
  activeWorkflows: number;
  completedToday: number;,
  failedToday: number;
  totalRecordsDeleted: number;,
  totalDataDeleted: number;
  averageExecutionTime: number;,
  successRate: number;
const DeletionWorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<DeletionWorkflow>([]);
  const [ setTemplates] = useState<WorkflowTemplate>([]);
  const [metrics, setMetrics] = useState<WorkflowMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // View and filter states
  const [view, setView] = useState<'active' | 'scheduled' | 'completed' | 'all'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'progress' | 'priority'>('created');
  // Modal and selection states
  const [ setShowCreateModal] = useState(false);
  const [ setShowTemplateModal] = useState(false);
  const [ setSelectedWorkflow] = useState<DeletionWorkflow | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set());
  // Real-time updates
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(5000); // 5 seconds
  // Load workflow data
  const loadWorkflowData = useCallback(async () => {
    try {
      setError(null);
      const [workflowsRes, templatesRes, metricsRes] = await Promise.all([)
        fetch('/api/data-protection/workflows', {)
}
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/data-protection/workflow-templates', {)
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/data-protection/workflow-metrics', {)
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }
      ]);
      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json();
        setWorkflows(workflowsData.workflows || []);
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load workflow data');
} finally {
      setLoading(false);
  }, []);
  useEffect(() => {
    loadWorkflowData();
  }, [loadWorkflowData]);
  // Auto-refresh for real-time updates
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadWorkflowData();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadWorkflowData]);
  // Helper functions
  const formatBytes = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    return `${size.toFixed(1)} ${units[unitIndex]}`;}
  };
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;}
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;}
    return `${seconds}s`;}
  };
  const getStatusBadgeClass = (status: string): string => {
  switch (status) {
  case 'running': return 'bg-blue-100 text-blue-800 animate-pulse';
  case 'completed': return 'bg-green-100 text-green-800';
  case 'failed': return 'bg-red-100 text-red-800';
  case 'scheduled': return 'bg-yellow-100 text-yellow-800';
  case 'paused': return 'bg-orange-100 text-orange-800';
  case 'cancelled': return 'bg-gray-100 text-gray-800';
  case 'draft': return 'bg-purple-100 text-purple-800';
  default: return 'bg-gray-100 text-gray-800';
};
  const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
  case 'critical': return 'bg-red-100 text-red-800 border-red-200';
  case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
  case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
  case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
  default: return 'bg-gray-100 text-gray-800 border-gray-200';
};
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'running': return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
  case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
  case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
  case 'scheduled': return <Clock className="w-4 h-4 text-yellow-600" />;
  case 'paused': return <Pause className="w-4 h-4 text-orange-600" />;
  case 'cancelled': return <Square className="w-4 h-4 text-gray-600" />;
  case 'draft': return <FileText className="w-4 h-4 text-purple-600" />;
  default: return <Activity className="w-4 h-4 text-gray-600" />;
};
  // Workflow control actions
  const handleStartWorkflow = async (workflowId: string) => {
    try {
      await fetch(`/api/data-protection/workflows/${workflowId}/start`, {)}
  },
  method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      await loadWorkflowData();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to start workflow');
};
  const handlePauseWorkflow = async (workflowId: string) => {
    try {
      await fetch(`/api/data-protection/workflows/${workflowId}/pause`, {)}
  },
  method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      await loadWorkflowData();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to pause workflow');
};
  const handleStopWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to stop this workflow? This action cannot be undone.')) {
      return;
    try {
      await fetch(`/api/data-protection/workflows/${workflowId}/stop`, {)}
  },
  method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      await loadWorkflowData();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to stop workflow');
};
  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    try {
      await fetch(`/api/data-protection/workflows/${workflowId}`, {)}
  },
  method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      await loadWorkflowData();
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to delete workflow');
};
  // Filter workflows based on current view and filters
  const filteredWorkflows = workflows;
    .filter(workflow => {)
  // View filter
      if (view === 'active' && !['running', 'scheduled'].includes(workflow.status)) return false;
      if (view === 'scheduled' && workflow.status !== 'scheduled') return false;
      if (view === 'completed' && !['completed', 'failed', 'cancelled'].includes(workflow.status)) return false;
      // Search filter
      if (searchTerm && !workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !workflow.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      // Status filter
      if (statusFilter !== 'all' && workflow.status !== statusFilter) return false;
      // Priority filter
      if (priorityFilter !== 'all' && workflow.priority !== priorityFilter) return false;
      return true;
  }
    .sort((a, b) => {
      switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'progress':
        return b.progress - a.progress;
      case 'priority': {
        const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    });
  if (loading) {
    return;
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 mt-2">Loading deletion workflows...</p>
        </div>
      </div>
    );
  return;
    <div className="deletion-workflow-manager space-y-6">
      {/* Header and Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Trash2 className="w-5 h-5 mr-2 text-red-600" />
              Deletion Workflows
            </h2>
            <p className="text-gray-600 mt-1">
              Monitor and manage automated data deletion processes
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
  autoRefresh ? 'bg-blue-600' : 'bg-gray-200',
}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
  autoRefresh ? 'translate-x-6' : 'translate-x-1',
}`}
                />
              </button>
            </div>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn btn-secondary"
            >
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </button>
          </div>
        </div>
        {/* Metrics Cards */}
        {metrics && ()
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Active Workflows</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.activeWorkflows}</p>
                  <p className="text-xs text-blue-700">of {metrics.totalWorkflows} total</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Completed Today</p>
                  <p className="text-2xl font-bold text-green-900">{metrics.completedToday}</p>
                  <p className="text-xs text-green-700">
                    Success rate: {metrics.successRate.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Data Deleted</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatBytes(metrics.totalDataDeleted)}
                  </p>
                  <p className="text-xs text-purple-700">
                    {metrics.totalRecordsDeleted.toLocaleString()} records
                  </p>
                </div>
                <Database className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Avg. Execution</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatDuration(metrics.averageExecutionTime)}
                  </p>
                  <p className="text-xs text-orange-700">
                    {metrics.failedToday} failed today
                  </p>
                </div>
                <Timer className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* View Tabs and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Workflow Views">
            {[
              { key: 'active', label: 'Active', count: workflows.filter()
                w => ['running',
                'scheduled'].includes(w.status)
              )).length },
              { key: 'scheduled', label: 'Scheduled', count: workflows.filter(w => w.status === 'scheduled').length },
              { key: 'completed', label: 'Completed', count: workflows.filter()
                w => ['completed',
                'failed',
                'cancelled'].includes(w.status)
              )).length },
              { key: 'all', label: 'All', count: workflows.length }
            ].map(({ key, label, count }) => ()
              <button
                key={key}
                onClick={() => setView(key as 'active' | 'scheduled' | 'completed' | 'all')}
                className={`${
  view === key
  ? 'border-blue-500 text-blue-600 bg-blue-50'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
} whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
              >
                <span>{label}</span>
                <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                  {count}
                </span>
              </button>
            ))}
          </nav>
        </div>
        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="running">Running</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'created' | 'progress' | 'priority')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="created">Created Date</option>
                <option value="name">Name</option>
                <option value="progress">Progress</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>
        {/* Workflow List */}
        <div className="divide-y divide-gray-200">
          {filteredWorkflows.map(workflow => ()
            <div key={workflow.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="checkbox"
                      checked={selectedWorkflows.has(workflow.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedWorkflows);
                        if (e.target.checked) {
                          newSelected.add(workflow.id);
                        } else {
                          newSelected.delete(workflow.id);
                        setSelectedWorkflows(newSelected);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {getStatusIcon(workflow.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {workflow.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(workflow.status)}`}>}
                        {workflow.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getPriorityBadgeClass(workflow.priority)}`}>}
                        {workflow.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    {workflow.status === 'running' && ()
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress: {workflow.recordsProcessed.toLocaleString()} / {workflow.recordsTotal.toLocaleString()} records</span>
                          <span>{workflow.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${workflow.progress}%` }}
                          />
                        </div>
                        {workflow.estimatedCompletion && ()
                          <p className="text-xs text-gray-500 mt-1">
                            Estimated completion: {new Date(workflow.estimatedCompletion).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span>
                        <Database className="w-4 h-4 inline mr-1" />
                        {workflow.recordsTotal.toLocaleString()} records
                      </span>
                      <span>
                        <BarChart3 className="w-4 h-4 inline mr-1" />
                        {formatBytes(workflow.dataSizeBytes)}
                      </span>
                      <span>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(workflow.createdAt).toLocaleDateString()}
                      </span>
                      {workflow.errors.length > 0 && ()
                        <span className="text-red-600">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          {workflow.errors.length} errors
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {workflow.status === 'draft' && ()
                    <button
                      onClick={() => handleStartWorkflow(workflow.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Start Workflow"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {workflow.status === 'running' && ()
                    <>
                      <button
                        onClick={() => handlePauseWorkflow(workflow.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                        title="Pause Workflow"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStopWorkflow(workflow.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Stop Workflow"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {workflow.status === 'paused' && ()
                    <button
                      onClick={() => handleStartWorkflow(workflow.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Resume Workflow"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedWorkflow(workflow)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete Workflow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Empty State */}
        {filteredWorkflows.length === 0 && ()
          <div className="text-center py-12">
            <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deletion Workflows Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No workflows match your current filters.'
                : 'Get started by creating your first deletion workflow.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Workflow
            </button>
          </div>
        )}
      </div>
      {/* Error Display */}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
};

export default DeletionWorkflowManager;