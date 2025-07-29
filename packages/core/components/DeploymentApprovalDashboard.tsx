/**
 * Deployment Approval Dashboard
 * Extension of the approval dashboard specifically for deployment approvals
 */
import React, { useState, useEffect } from 'react';
import { 
  RocketLaunchIcon,
  ShieldCheckIcon,
  BoltIcon,
  BuildingOfficeIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ComputerDesktopIcon,
  ServerStackIcon,
  GlobeAltIcon,
  BellIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
interface DeploymentApprovalRequest {
  id: string;
  deployment_id: string;
  sha: string;
  environment: 'production' | 'staging' | 'preview' | 'development';
  title: string;
  description: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'auto_approved';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  requested_by: string;
  requested_at: Date;
  approved_at?: Date;
  auto_approved?: boolean;
  deployment_url?: string;
  github_url: string;
  // Deployment-specific metadata
  metadata: {
  repository: string;
  ref: string;
  changed_files: number;
  lines_changed: number;
  breaking_changes: boolean;
  test_coverage: number;
  security_scan_status: 'passed' | 'warning' | 'failed';
  performance_regression: number;
  deployment_type: 'github_actions' | 'manual' | 'auto'
  };
  // Approval criteria and progress
  criteria: DeploymentCriterion;
  approvals: DeploymentApproval;
  current_approvals: number;
  required_approvals: number;
interface DeploymentCriterion {
  type: 'security-review' | 'performance-impact' | 'business-approval';
  status: 'pending' | 'approved' | 'rejected';
  weight: number;
  assigned_reviewers: string;
  description: string;
  validation_steps?: ValidationStep;
  interface DeploymentApproval {
  id: string;
  criterion_type: string;
  reviewer_name: string;
  reviewer_email: string;
  decision: 'approved' | 'rejected';
  comments: string;
  reviewed_at: Date;
  interface ValidationStep {
  name: string;
  status: 'passed' | 'failed' | 'pending';
  result?: unknown;
  automated: boolean;
  interface DeploymentApprovalDashboardProps {
  workspaceId: string;
  currentUserId: string;
  mode?: 'reviewer' | 'requester' | 'admin';
  environment?: string;
  export const DeploymentApprovalDashboard: React.FC<DeploymentApprovalDashboardProps> = ({,)
  workspaceId,
  currentUserId,
  mode = 'reviewer',
  environment
}) => {
  const [deploymentRequests, setDeploymentRequests] = useState<DeploymentApprovalRequest>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DeploymentApprovalRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [filters, setFilters] = useState({)
  environment: environment || '',
  status: '',
  urgency: '',
  auto_approved: false,
  search: '',
});
  useEffect(() => {
    fetchDeploymentRequests();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDeploymentRequests, 30000);
    return () => clearInterval(interval);
  }, [workspaceId, currentUserId, mode, filters, activeTab]);
  const fetchDeploymentRequests = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('workspace_id', workspaceId);
      queryParams.append('deployment_type', 'true');
      if (filters.environment) queryParams.append('environment', filters.environment);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.urgency) queryParams.append('urgency', filters.urgency);
      if (filters.auto_approved) queryParams.append('auto_approved', 'true');
      if (filters.search) queryParams.append('search', filters.search);
      const response = await fetch(`/api/approval/deployment-requests?${queryParams}`);}
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch deployment requests');
      setDeploymentRequests(data.requests || []);
      setError(null);
    } catch (err) {
  console.error('Error fetching deployment requests:', err);
  setError(err instanceof Error ? err.message : 'Unknown error');
} finally {
      setLoading(false);
  };
  const _____getEnvironmentIcon = (env: string) => {
  switch (env) {
  case 'production': return <ServerStackIcon className="h-4 w-4 text-red-500" />;
  case 'staging': return <ComputerDesktopIcon className="h-4 w-4 text-yellow-500" />;
  case 'preview': return <EyeIcon className="h-4 w-4 text-blue-500" />;
  case 'development': return <CodeBracketIcon className="h-4 w-4 text-green-500" />;
  default: return <GlobeAltIcon className="h-4 w-4 text-gray-500" />;
};
  const _____getEnvironmentBadgeColor = (env: string) => {
  switch (env) {
  case 'production': return 'bg-red-100 text-red-800 border-red-200';
  case 'staging': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  case 'preview': return 'bg-blue-100 text-blue-800 border-blue-200';
  case 'development': return 'bg-green-100 text-green-800 border-green-200';
  default: return 'bg-gray-100 text-gray-800 border-gray-200';
};
  const _____getStatusIcon = (status: string) => {
  switch (status) {
  case 'approved':,
  case 'auto_approved':,
  return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
  case 'rejected':,
  return <XCircleIcon className="h-5 w-5 text-red-500" />;
  case 'pending':,
  case 'in_review':,
  return <ClockIcon className="h-5 w-5 text-yellow-500" />;
  default: ,
  return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
};
  const _____getCriterionIcon = (type: string) => {
  switch (type) {
  case 'security-review': return <ShieldCheckIcon className="h-4 w-4 text-blue-500" />;
  case 'performance-impact': return <BoltIcon className="h-4 w-4 text-yellow-500" />;
  case 'business-approval': return <BuildingOfficeIcon className="h-4 w-4 text-purple-500" />;
  default: return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
};
  const filteredRequests = deploymentRequests.filter(request => {)
  if (activeTab === 'pending' && !['pending', 'in_review'].includes(request.status)) return false;
    if (activeTab === 'approved' && !['approved', 'auto_approved'].includes(request.status)) return false;
    if (activeTab === 'rejected' && request.status !== 'rejected') return false;
    if (filters.search && !request.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !request.deployment_id.includes(filters.search)) return false;
    return true;
  });
  if (loading && deploymentRequests.length === 0) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600">
          <ArrowTopRightOnSquareIcon className="h-5 w-5 animate-spin" />
          <span>Loading deployment approvals...</span>
        </div>
      </div>
    );
  if (error) {
    return;
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">Error loading deployment approvals: {error}</span>
        </div>
      </div>
    );
  return;
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-semibold text-gray-900">Deployment Approvals</h2>
          {loading && ()
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 animate-spin" />
          )}
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {filteredRequests.length} requests
          </span>
          <button
            onClick={fetchDeploymentRequests}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh"
          >
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pending', label: 'Pending', icon: ClockIcon },
            { id: 'approved', label: 'Approved', icon: CheckCircleIcon },
            { id: 'rejected', label: 'Rejected', icon: XCircleIcon },
            { id: 'all', label: 'All', icon: EyeIcon }
          ].map(tab => {)
  const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = deploymentRequests.filter(req => {)
  if (tab.id === 'pending') return ['pending', 'in_review'].includes(req.status);
              if (tab.id === 'approved') return ['approved', 'auto_approved'].includes(req.status);
              if (tab.id === 'rejected') return req.status === 'rejected';
              return true;
            }).length;
            return;
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-1 transition-colors ${
  isActive
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600',
}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <select
              value={filters.environment}
              onChange={(e) => setFilters(prev => ({ ...prev, environment: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="preview">Preview</option>
              <option value="development">Development</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="auto_approved">Auto Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select
              value={filters.urgency}
              onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Urgencies</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search deployments..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      {/* Deployment Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? ()
          <div className="text-center py-12">
            <RocketLaunchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deployment requests</h3>
            <p className="text-gray-600">
              {activeTab === 'pending' 
                ? 'No pending deployments require approval at this time.'
                : `No ${activeTab} deployment requests found.`}
            </p>
          </div>
        ) : ()
          filteredRequests.map(request => ()
            <DeploymentRequestCard
              key={request.id}
              request={request}
              onSelect={setSelectedRequest}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
      {/* Detailed View Modal */}
      {selectedRequest && ()
        <DeploymentRequestDetail
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          currentUserId={currentUserId}
          onUpdate={fetchDeploymentRequests}
        />
      )}
    </div>
  );
};

// Component for individual deployment request cards
const DeploymentRequestCard: React.FC<{,
  request: DeploymentApprovalRequest;
  onSelect: (request: DeploymentApprovalRequest) => void;
  currentUserId: string;
}> = ({ request, onSelect, currentUserId }) => {
  const getEnvironmentIcon = (env: string) => {,
  switch (env) {
  case 'production': return <ServerStackIcon className="h-4 w-4 text-red-500" />;
  case 'staging': return <ComputerDesktopIcon className="h-4 w-4 text-yellow-500" />;
  case 'preview': return <EyeIcon className="h-4 w-4 text-blue-500" />;
  case 'development': return <CodeBracketIcon className="h-4 w-4 text-green-500" />;
  default: return <GlobeAltIcon className="h-4 w-4 text-gray-500" />;
};
  const getEnvironmentBadgeColor = (env: string) => {
  switch (env) {
  case 'production': return 'bg-red-100 text-red-800 border-red-200';
  case 'staging': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  case 'preview': return 'bg-blue-100 text-blue-800 border-blue-200';
  case 'development': return 'bg-green-100 text-green-800 border-green-200';
  default: return 'bg-gray-100 text-gray-800 border-gray-200';
};
  const getStatusIcon = (status: string) => {
  switch (status) {
  case 'approved':,
  case 'auto_approved':,
  return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
  case 'rejected':,
  return <XCircleIcon className="h-5 w-5 text-red-500" />;
  case 'pending':,
  case 'in_review':,
  return <ClockIcon className="h-5 w-5 text-yellow-500" />;
  default: ,
  return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
};
  const getCriterionIcon = (type: string) => {
  switch (type) {
  case 'security-review': return <ShieldCheckIcon className="h-4 w-4 text-blue-500" />;
  case 'performance-impact': return <BoltIcon className="h-4 w-4 text-yellow-500" />;
  case 'business-approval': return <BuildingOfficeIcon className="h-4 w-4 text-purple-500" />;
  default: return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
};
  const urgencyColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};
  return;
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(request.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
            <p className="text-sm text-gray-600">
              Deployment {request.deployment_id.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${urgencyColors[request.urgency]}`}>}
            {request.urgency.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getEnvironmentBadgeColor(request.environment)}`}>}
            <div className="flex items-center space-x-1">
              {getEnvironmentIcon(request.environment)}
              <span>{request.environment.toUpperCase()}</span>
            </div>
          </span>
          {request.auto_approved && ()
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
              AUTO
            </span>
          )}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-gray-700 mb-2">{request.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>By {request.requested_by}</span>
          <span>•</span>
          <span>{new Date(request.requested_at).toLocaleString()}</span>
          <span>•</span>
          <span>{request.metadata.changed_files} files, {request.metadata.lines_changed} lines</span>
        </div>
      </div>
      {/* Approval Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Approval Progress
          </span>
          <span className="text-sm text-gray-600">
            {request.current_approvals}/{request.required_approvals}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(100, (request.current_approvals / request.required_approvals) * 100)}%`}
            }}
          />
        </div>
      </div>
      {/* Criteria Status */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {request.criteria.map(criterion => ()
            <div
              key={criterion.type}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
  criterion.status === 'approved'
  ? 'bg-green-100 text-green-800 border border-green-200'
  : criterion.status === 'rejected',
  ? 'bg-red-100 text-red-800 border border-red-200'
  : 'bg-gray-100 text-gray-800 border border-gray-200',
}`}
            >
              {getCriterionIcon(criterion.type)}
              <span>{criterion.type.replace('-', ' ').toUpperCase()}</span>
              {criterion.status === 'approved' && <CheckCircleIcon className="h-3 w-3" />}
              {criterion.status === 'rejected' && <XCircleIcon className="h-3 w-3" />}
            </div>
          ))}
        </div>
      </div>
      {/* Quality Metrics */}
      <div className="flex items-center justify-between text-xs text-gray-600 border-t pt-3">
        <div className="flex items-center space-x-4">
          <span>Coverage: {request.metadata.test_coverage}%</span>
          <span>Security: {request.metadata.security_scan_status}</span>
          {request.metadata.breaking_changes && ()
            <span className="text-orange-600">⚠ Breaking Changes</span>
          )}
        </div>
        <button
          onClick={() => onSelect(request)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
        >
          <span>View Details</span>
          <ChevronRightIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

// Detailed view component (placeholder - would be expanded with full details)
const DeploymentRequestDetail: React.FC<{,
  request: DeploymentApprovalRequest;
  onClose: () => void;
  currentUserId: string;
  onUpdate: () => void;
}> = ({ request, onClose, currentUserId, onUpdate }) => {
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Deployment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600">
            Detailed deployment approval interface would be implemented here with:
          </p>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600">
            <li>Full deployment metadata and change details</li>
            <li>Approval workflow progress and history</li>
            <li>Individual reviewer assignments and status</li>
            <li>Validation step results and automated checks</li>
            <li>Comments and discussion thread</li>
            <li>Action buttons for approve/reject/escalate</li>
            <li>Real-time updates and notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DeploymentApprovalDashboard;