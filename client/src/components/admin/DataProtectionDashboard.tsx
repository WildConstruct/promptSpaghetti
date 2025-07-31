/**
import { Activity, TrendingUp } from 'lucide-react';
 * Data Protection & Privacy Controls Dashboard (Epic 19)
 * 
 * Comprehensive dashboard for managing data retention automation, deletion workflows,
 * and compliance reporting as part of Epic 19's Data Protection & Privacy Controls.
 * 
 * Features:
 * - Data retention automation management
 * - Deletion workflow monitoring
 * - Compliance reporting and audit trails
 * - Archive toggle management integration
 * - Real-time status monitoring
 * - GDPR/HIPAA/SOX compliance tracking
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Database,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  Plus,
  Activity,
  TrendingUp
} from 'lucide-react';
}
interface DataProtectionMetrics {
  retentionPolicies: {
  total: number;,
  active: number;
  expired: number;,
  violations: number;
}
};
  deletionWorkflows: {
  total: number;
  running: number;,
  completed: number;
  failed: number;,
  scheduled: number;
};
  dataVolume: {
  totalSize: number;
  archivedSize: number;,
  pendingDeletion: number;
  recentlyDeleted: number;
};
  compliance: {
  gdprScore: number;
  hipaaScore: number;,
  soxScore: number;
  overallScore: number;,
  violations: number;
  lastAudit: string;
};
}
interface RetentionPolicy {
  id: string;,
  name: string;
  description: string;,
  dataType: string;
  retentionPeriod: number;,
  retentionUnit: 'days' | 'months' | 'years';
  status: 'active' | 'inactive' | 'expired';,
  autoDelete: boolean;
  complianceFrameworks: string;,
  createdAt: string;
  updatedAt: string;,
  nextExecution: string;
  affectedRecords: number;
}
interface DeletionWorkflow {
  id: string;,
  name: string;
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';,
  progress: number;
  startedAt?: string;
  completedAt?: string;
  recordsProcessed: number;,
  recordsDeleted: number;
  recordsSkipped: number;
  estimatedCompletion?: string;
  policyId: string;,
  errors: string;
}
interface ComplianceViolation {
  id: string;,
  type: 'retention_exceeded' | 'deletion_failed' | 'access_violation' | 'audit_failed';
  severity: 'low' | 'medium' | 'high' | 'critical';,
  description: string;
  affectedRecords: number;,
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';,
  framework: string;
  remediation?: string;
type DashboardTab = 'overview' | 'policies' | 'workflows' | 'compliance' | 'analytics' | 'audit';
const DataProtectionDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [metrics, setMetrics] = useState<DataProtectionMetrics | null>(null);
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy>([]);
  const [deletionWorkflows, setDeletionWorkflows] = useState<DeletionWorkflow>([]);
  const [complianceViolations, setComplianceViolations] = useState<ComplianceViolation>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  // Filters and search
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchTerm, _setSearchTerm] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_statusFilter, _setStatusFilter] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_frameworkFilter, _setFrameworkFilter] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
}
  const [_dateRange, _setDateRange] = useState<{ start: string; end: string }>({)
  start: '',
  end: '',
});
  // Modal states
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showCreatePolicy, _setShowCreatePolicy] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showCreateWorkflow, _setShowCreateWorkflow] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedPolicy, _setSelectedPolicy] = useState<RetentionPolicy | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedWorkflow, _setSelectedWorkflow] = useState<DeletionWorkflow | null>(null);
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [metricsRes, policiesRes, workflowsRes, violationsRes] = await Promise.all([)
        fetch('/api/data-protection/metrics', {)
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/data-protection/policies', {)
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/data-protection/workflows', {)
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/data-protection/violations', {)
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }
      ]);
      if (!metricsRes.ok || !policiesRes.ok || !workflowsRes.ok || !violationsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      const [metricsData, policiesData, workflowsData, violationsData] = await Promise.all([)
        metricsRes.json(),
        policiesRes.json(),
        workflowsRes.json(),
        violationsRes.json()
      ]);
      setMetrics(metricsData);
      setRetentionPolicies(policiesData.policies || []);
      setDeletionWorkflows(workflowsData.workflows || []);
      setComplianceViolations(violationsData.violations || []);
      setLastRefresh(new Date());
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
} finally {
      setLoading(false);
  }, []);
  useEffect(() => {
    fetchDashboardData();
    // Set up auto-refresh for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // 30 seconds;
    return () => clearInterval(interval);
  }, [fetchDashboardData]);
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
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;}
    if (diffHours < 24) return `${diffHours}h ago`;}
    return `${diffDays}d ago`;}
  };
  const getComplianceScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };
  const getSeverityBadgeClass = (severity: string): string => {
  switch (severity) {
  case 'critical': return 'bg-red-100 text-red-800 border-red-200';
  case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
  case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
  default: return 'bg-gray-100 text-gray-800 border-gray-200';
};
  const getStatusBadgeClass = (status: string): string => {
  switch (status) {
  case 'active':,
  case 'running':,
  case 'completed':,
  return 'bg-green-100 text-green-800';
  case 'failed':,
  case 'expired':,
  return 'bg-red-100 text-red-800';
  case 'scheduled':,
  case 'inactive':,
  return 'bg-yellow-100 text-yellow-800';
  case 'paused':,
  return 'bg-orange-100 text-orange-800';
  default:,
  return 'bg-gray-100 text-gray-800';
};
  if (loading && !metrics) {
    return;
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Data Protection Dashboard...</p>
        </div>
      </div>
    );
  if (error) {
    return;
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Dashboard Error</h3>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="btn btn-primary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  return;
    <div className="data-protection-dashboard space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Protection & Privacy Controls</h1>
              <p className="text-gray-600 mt-1">
                Automated data retention, deletion workflows, and compliance monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last Updated</p>
              <p className="text-sm font-medium text-gray-900">
                {formatTimeAgo(lastRefresh.toISOString())}
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="btn btn-secondary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />}
              Refresh
            </button>
          </div>
        </div>
        {/* Key Metrics Summary */}
        {metrics && ()
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Retention Policies</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.retentionPolicies.active}</p>
                  <p className="text-xs text-blue-700">of {metrics.retentionPolicies.total} total</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Workflows</p>
                  <p className="text-2xl font-bold text-green-900">{metrics.deletionWorkflows.running}</p>
                  <p className="text-xs text-green-700">
                    {metrics.deletionWorkflows.scheduled} scheduled
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Data Volume</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatBytes(metrics.dataVolume.totalSize)}
                  </p>
                  <p className="text-xs text-purple-700">
                    {formatBytes(metrics.dataVolume.archivedSize)} archived
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Compliance Score</p>
                  <p className={`text-2xl font-bold ${getComplianceScoreColor(metrics.compliance.overallScore)}`}>}
                    {metrics.compliance.overallScore}%
                  </p>
                  <p className="text-xs text-orange-700">
                    {metrics.compliance.violations} violations
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Data Protection Tabs">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'policies', label: 'Retention Policies', icon: Database },
              { key: 'workflows', label: 'Deletion Workflows', icon: Trash2 },
              { key: 'compliance', label: 'Compliance', icon: Shield },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
              { key: 'audit', label: 'Audit Trail', icon: FileText }
            ].map(({ key, label, icon: Icon }) => ()
              <button
                key={key}
                onClick={() => setActiveTab(key as DashboardTab)}
                className={`${
  activeTab === key
  ? 'border-blue-500 text-blue-600 bg-blue-50'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
} whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && ()
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                    Recent Policy Activities
                  </h3>
                  <div className="space-y-3">
                    {retentionPolicies.slice(0, 5).map(policy => ()
                      <div key={policy.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusBadgeClass(policy.status).includes('green') ? 'bg-green-400' : 'bg-gray-400'}`} />}
                          <div>
                            <p className="font-medium text-gray-900">{policy.name}</p>
                            <p className="text-sm text-gray-600">
                              {policy.retentionPeriod} {policy.retentionUnit} • {policy.affectedRecords} records
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(policy.status)}`}>}
                          {policy.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-gray-600" />
                    Active Workflows
                  </h3>
                  <div className="space-y-3">
                    {deletionWorkflows.slice(0, 5).map(workflow => ()
                      <div key={workflow.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${workflow.status === 'running' ? 'bg-blue-400' : 'bg-gray-400'}`} />}
                            <p className="font-medium text-gray-900">{workflow.name}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(workflow.status)}`}>}
                            {workflow.status}
                          </span>
                        </div>
                        {workflow.progress > 0 && ()
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{workflow.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${workflow.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Compliance Violations */}
              {complianceViolations.length > 0 && ()
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Recent Compliance Violations
                  </h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="space-y-3">
                      {complianceViolations.slice(0, 3).map(violation => ()
                        <div key={violation.id} className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityBadgeClass(violation.severity)}`}>}
                                {violation.severity}
                              </span>
                              <span className="text-sm text-gray-600">{violation.framework}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{violation.description}</p>
                            <p className="text-xs text-gray-600">
                              {violation.affectedRecords} records affected • {formatTimeAgo(violation.detectedAt)}
                            </p>
                          </div>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Investigate
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Placeholder content for other tabs */}
          {activeTab !== 'overview' && ()
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  {activeTab === 'policies' && <Database className="w-8 h-8 text-gray-600" />}
                  {activeTab === 'workflows' && <Trash2 className="w-8 h-8 text-gray-600" />}
                  {activeTab === 'compliance' && <Shield className="w-8 h-8 text-gray-600" />}
                  {activeTab === 'analytics' && <TrendingUp className="w-8 h-8 text-gray-600" />}
                  {activeTab === 'audit' && <FileText className="w-8 h-8 text-gray-600" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 capitalize">
                  {activeTab} Management
                </h3>
                <p className="text-gray-600 mb-4">
                  This section will contain the {activeTab} management interface with full functionality 
                  for data protection and privacy controls.
                </p>
                <div className="flex justify-center space-x-3">
                  <button className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                  </button>
                  <button className="btn btn-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataProtectionDashboard;