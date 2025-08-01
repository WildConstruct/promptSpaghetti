/**
 * Data Retention Manager Component (Epic 19)
 * 
 * Comprehensive component for managing data retention policies, automation schedules,
 * and retention compliance as part of Epic 19's Data Protection & Privacy Controls.
 * 
 * Features:
 * - Retention policy creation and management
 * - Automated retention schedules
 * - Policy templates and presets
 * - Compliance framework integration
 * - Bulk policy operations
 * - Real-time policy monitoring
 */
import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Shield,
  AlertTriangle,
  Play,
  Pause,
  Search,
  MoreVertical,
  Settings,
  FileText,
  Zap,
  BarChart3
 from 'lucide-react';


interface RetentionPolicy {
  id: string;,
  name: string,
  description: string;,
  dataType: string,
  dataCategory: 'user_data' | 'system_data' | 'log_data' | 'analytics_data' | 'backup_data';,
  retentionPeriod: number,
  retentionUnit: 'days' | 'months' | 'years';,
  autoDelete: boolean,
  status: 'active' | 'inactive' | 'expired' | 'draft';
},
  complianceFrameworks: string;}


  // Scheduling
  scheduleType: 'immediate' | 'daily' | 'weekly' | 'monthly' | 'custom';
  cronExpression?: string,
  nextExecution: string;
  lastExecution?: string;
  // Metrics
  affectedRecords: number;,
  totalSizeBytes: number,
  deletedRecords: number;,
  executionCount: number;
  // Metadata
  createdAt: string;,
  updatedAt: string,
  createdBy: string;,
  tags: string;
  // Configuration
  notifyBeforeExpiry: boolean;,
  notificationDays: number,
  exemptionRules: string;,
  cascadeDelete: boolean,
  backupBeforeDelete: boolean;
  interface PolicyTemplate {
  id: string;,
  name: string,
  description: string;,
  category: string,
  retentionPeriod: number;,
  retentionUnit: 'days' | 'months' | 'years',
  complianceFrameworks: string;,
  recommended: boolean,
  config: Partial<RetentionPolicy>;
  interface PolicyExecutionResult {
  id: string;,
  policyId: string,
  status: 'success' | 'partial' | 'failed';,
  executedAt: string,
  recordsProcessed: number;,
  recordsDeleted: number,
  recordsSkipped: number;,
  executionTimeMs: number,
  errors: string;,
  warnings: string;



const DataRetentionManager = () => { return null; }),
        fetch('/api/data-retention/templates', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/data-retention/executions', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }

      ]);
      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(policiesData.policies || []);
      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTemplates(templatesData.templates || []);
      if (executionsRes.ok) {
        const executionsData = await executionsRes.json();
        setExecutionResults(executionsData.executions || []);
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load retention data');
 finally {
      setLoading(false);
  };
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
  const formatRetentionPeriod = (period: number, unit: string): string => {
    return `${period} ${unit}${period !== 1 ? '' : ''}`;}
  };
  const getStatusBadgeClass = (status: string): string => {
  switch (status) {
  case 'active': return 'bg-green-100 text-green-800';
  case 'inactive': return 'bg-yellow-100 text-yellow-800';
  case 'expired': return 'bg-red-100 text-red-800';
  case 'draft': return 'bg-gray-100 text-gray-800',
  default: return 'bg-gray-100 text-gray-800';
};
  const getCategoryIcon = (category: string) => {
  switch (category) {
  case 'user_data': return <Shield className="w-4 h-4" />;
  case 'system_data': return <Settings className="w-4 h-4" />;
  case 'log_data': return <FileText className="w-4 h-4" />;
  case 'analytics_data': return <BarChart3 className="w-4 h-4" />;
  case 'backup_data': return <Database className="w-4 h-4" />,
  default: return <Database className="w-4 h-4" />;
};
  const filteredPolicies = policies;
    .filter(policy => {
  if (searchTerm && !policy.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !policy.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      if (statusFilter !== 'all' && policy.status !== statusFilter) {
        return false;
      if (frameworkFilter !== 'all' && !policy.complianceFrameworks.includes(frameworkFilter)) {
        return false;
      return true;

    .sort((a, b) => {
  let aValue, bValue;
  switch (sortBy) {
  case 'name':,
  aValue = a.name;
  bValue = b.name;
  break;
  case 'created':,
  aValue = a.createdAt;
  bValue = b.createdAt;
  break;
  case 'execution':,
  aValue = a.nextExecution;
  bValue = b.nextExecution;
  break;
  case 'affected':,
  aValue = a.affectedRecords;
  bValue = b.affectedRecords;
  break;
  default:,
  return 0;
  if (sortOrder === 'asc') {
  return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
 else {
  return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
});
  // TODO: Connect this function to the create policy modal
  // 
  //     if (response.ok) {
  //       await loadRetentionData();
  //       setShowCreateModal(false);
  //       setPolicyForm({
  //         name: '',
  //         description: '',
  //         dataType: '',
  //         dataCategory: 'user_data',
  //         retentionPeriod: 30,
  //         retentionUnit: 'days',
  //         autoDelete: false,
  //         status: 'draft'
  //       });
  //     }
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to create policy');
  //   }
  // };
  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this retention policy?')) {
      return;
    try {
      const response = await fetch(`/api/data-retention/policies/${policyId}`, {)}
  },
  method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        await loadRetentionData();
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to delete policy');
};
  const handleTogglePolicy = async (policyId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const response = await fetch(`/api/data-retention/policies/${policyId}/status`, {)}
  },
  method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}

          'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        await loadRetentionData();
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to update policy status');
};
  const handleExecutePolicy = async (policyId: string) => {
    try {
      const response = await fetch(`/api/data-retention/policies/${policyId}/execute`, {)}
  },
  method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        await loadRetentionData();
 catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to execute policy');
};
  if (loading) {
    return;
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading retention policies...</p>
        </div>
      </div>
    );
  return;
    <div className="data-retention-manager space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-600" />
            Data Retention Policies
          </h2>
          <p className="text-gray-600 mt-1">
            Manage automated data retention and deletion policies
          </p>
        </div>
        <div className="flex items-center space-x-3">
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
            Create Policy
          </button>
        </div>
      </div>
      {/* Filters and View Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search policies..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Frameworks</option>
              <option value="GDPR">GDPR</option>
              <option value="HIPAA">HIPAA</option>
              <option value="SOX">SOX</option>
              <option value="CCPA">CCPA</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView('cards')}
              className={`p-2 rounded-lg ${view === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-lg ${view === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Policy Cards View */}
      {view === 'cards' && ()
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map(policy => (
            <div key={policy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getCategoryIcon(policy.dataCategory)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{policy.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{policy.dataCategory.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{policy.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Retention Period</span>
                    <span className="font-medium">{formatRetentionPeriod()
                      policy.retentionPeriod,
                      policy.retentionUnit
                    )}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Affected Records</span>
                    <span className="font-medium">{policy.affectedRecords.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Data Size</span>
                    <span className="font-medium">{formatBytes(policy.totalSizeBytes)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(policy.status)}`}>}
                      {policy.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      {policy.complianceFrameworks.map(framework => (
                        <span key={framework} className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                          {framework}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTogglePolicy(policy.id, policy.status)}
                      className={`p-1 rounded ${policy.status === 'active' ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                      title={policy.status === 'active' ? 'Pause Policy' : 'Activate Policy'}
                    >
                      {policy.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleExecutePolicy(policy.id)}
                      className="p-1 rounded text-blue-600 hover:bg-blue-50"
                      title="Execute Now"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedPolicy(policy)}
                      className="p-1 rounded text-gray-600 hover:bg-gray-50"
                      title="Edit Policy"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeletePolicy(policy.id)}
                    className="p-1 rounded text-red-600 hover:bg-red-50"
                    title="Delete Policy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Empty State */}
      {filteredPolicies.length === 0 && ()
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Retention Policies Found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || frameworkFilter !== 'all'
              ? 'No policies match your current filters.'
              : 'Get started by creating your first data retention policy.'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Policy
          </button>
        </div>
      )}
      {error && ()
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}
    </div>
  );
};

export default DataRetentionManager;