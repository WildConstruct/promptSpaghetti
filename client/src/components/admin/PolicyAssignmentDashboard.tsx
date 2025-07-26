/**
 * Policy Assignment Dashboard
 * 
 * Administrative interface for managing data protection policy assignments
 * with bulk operations, conflict resolution, and inheritance management
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  PolicyAssignment, 
  BulkPolicyAssignment,
  AssignmentTargetType,
  AssignmentStatus,
  ConflictResolutionStrategy,
  PolicyConflict
} from '../../types/PolicyAssignmentTypes';
import { PolicyAssignmentForm } from './PolicyAssignmentForm';
import { BulkAssignmentWizard } from './BulkAssignmentWizard';
import { AssignmentConflictResolver } from './AssignmentConflictResolver';
import { AssignmentAnalytics } from './AssignmentAnalytics';
import { InheritanceVisualization } from './InheritanceVisualization';
import './PolicyAssignmentDashboard.css';

interface DashboardFilters {
  targetType?: AssignmentTargetType;
  targetId?: string;
  policyType?: string;
  status?: AssignmentStatus;
  includeInherited?: boolean;
}

interface DashboardStats {
  totalAssignments: number;
  activeAssignments: number;
  pendingApprovals: number;
  conflicts: number;
  inheritanceChains: number;
}

export const PolicyAssignmentDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<PolicyAssignment[]>([]);
  const [bulkAssignments, setBulkAssignments] = useState<BulkPolicyAssignment[]>([]);
  const [conflicts, setConflicts] = useState<PolicyConflict[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssignments: 0,
    activeAssignments: 0,
    pendingApprovals: 0,
    conflicts: 0,
    inheritanceChains: 0
  });
  
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [selectedAssignments, setSelectedAssignments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'assignments' | 'bulk' | 'conflicts' | 'analytics' | 'inheritance'>('assignments');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBulkWizard, setShowBulkWizard] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [filters, loadDashboardData]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadAssignments(),
        loadBulkAssignments(),
        loadConflicts(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadAssignments]);

  const loadAssignments = useCallback(async () => {
    try {
      const response = await fetch('/api/policy-assignments/assignments?' + new URLSearchParams({
        ...filters,
        includeInherited: filters.includeInherited?.toString() || 'false'
      }));
      const data = await response.json();
      setAssignments(data.data?.assignments || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  }, [filters, setAssignments]);

  const loadBulkAssignments = async () => {
    try {
      const response = await fetch('/api/policy-assignments/assignments/bulk');
      const data = await response.json();
      setBulkAssignments(data.data || []);
    } catch (error) {
      console.error('Error loading bulk assignments:', error);
    }
  };

  const loadConflicts = async () => {
    try {
      const response = await fetch('/api/policy-assignments/conflicts');
      const data = await response.json();
      setConflicts(data.data || []);
    } catch (error) {
      console.error('Error loading conflicts:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/policy-assignments/assignments/analytics');
      const data = await response.json();
      if (data.success) {
        setStats({
          totalAssignments: data.data.totalAssignments,
          activeAssignments: data.data.assignmentsByStatus?.ACTIVE || 0,
          pendingApprovals: data.data.assignmentsByStatus?.PENDING_APPROVAL || 0,
          conflicts: data.data.conflictsDetected?.length || 0,
          inheritanceChains: data.data.inheritanceChains?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleCreateAssignment = async (assignmentData: Partial<PolicyAssignment>) => {
    try {
      const response = await fetch('/api/policy-assignments/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData)
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleBulkAssignment = async (bulkData: unknown) => {
    try {
      const response = await fetch('/api/policy-assignments/assignments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData)
      });
      
      if (response.ok) {
        setShowBulkWizard(false);
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error creating bulk assignment:', error);
    }
  };

  const handleRevokeAssignment = async (assignmentId: string, reason: string) => {
    try {
      const response = await fetch(`/api/policy-assignments/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      
      if (response.ok) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Error revoking assignment:', error);
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedAssignments.length === 0) return;
    
    const reason = prompt('Enter reason for bulk revocation:');
    if (!reason) return;

    try {
      await Promise.all(
        selectedAssignments.map(id => handleRevokeAssignment(id, reason))
      );
      setSelectedAssignments([]);
    } catch (error) {
      console.error('Error bulk revoking assignments:', error);
    }
  };

  const renderStatsCards = () => (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{stats.totalAssignments}</div>
        <div className="stat-label">Total Assignments</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.activeAssignments}</div>
        <div className="stat-label">Active Assignments</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.pendingApprovals}</div>
        <div className="stat-label">Pending Approvals</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.conflicts}</div>
        <div className="stat-label">Conflicts</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{stats.inheritanceChains}</div>
        <div className="stat-label">Inheritance Chains</div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="dashboard-filters">
      <div className="filter-group">
        <label>Target Type:</label>
        <select 
          value={filters.targetType || ''} 
          onChange={(e) => setFilters({...filters, targetType: e.target.value as AssignmentTargetType})}
        >
          <option value="">All Types</option>
          <option value="USER">User</option>
          <option value="ROLE">Role</option>
          <option value="TEAM">Team</option>
          <option value="ORG_UNIT">Org Unit</option>
          <option value="DEPARTMENT">Department</option>
          <option value="LOCATION">Location</option>
          <option value="DATA_TYPE">Data Type</option>
          <option value="SYSTEM">System</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Status:</label>
        <select 
          value={filters.status || ''} 
          onChange={(e) => setFilters({...filters, status: e.target.value as AssignmentStatus})}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="EXPIRED">Expired</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>
      
      <div className="filter-group">
        <label>Target ID:</label>
        <input 
          type="text" 
          value={filters.targetId || ''} 
          onChange={(e) => setFilters({...filters, targetId: e.target.value})}
          placeholder="Enter target ID"
        />
      </div>
      
      <div className="filter-group">
        <label>Policy Type:</label>
        <input 
          type="text" 
          value={filters.policyType || ''} 
          onChange={(e) => setFilters({...filters, policyType: e.target.value})}
          placeholder="Enter policy type"
        />
      </div>
      
      <div className="filter-group">
        <label>
          <input 
            type="checkbox" 
            checked={filters.includeInherited || false}
            onChange={(e) => setFilters({...filters, includeInherited: e.target.checked})}
          />
          Include Inherited
        </label>
      </div>
    </div>
  );

  const renderAssignmentsList = () => (
    <div className="assignments-section">
      <div className="section-header">
        <h3>Policy Assignments</h3>
        <div className="section-actions">
          <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
            Create Assignment
          </button>
          <button onClick={() => setShowBulkWizard(true)} className="btn btn-secondary">
            Bulk Assignment
          </button>
          {selectedAssignments.length > 0 && (
            <button onClick={handleBulkRevoke} className="btn btn-danger">
              Revoke Selected ({selectedAssignments.length})
            </button>
          )}
        </div>
      </div>
      
      {renderFilters()}
      
      <div className="assignments-table">
        <table>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAssignments(assignments.map(a => a.assignmentId));
                    } else {
                      setSelectedAssignments([]);
                    }
                  }}
                />
              </th>
              <th>Policy</th>
              <th>Target</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Effective Date</th>
              <th>Expiration</th>
              <th>Risk Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment.assignmentId}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedAssignments.includes(assignment.assignmentId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssignments([...selectedAssignments, assignment.assignmentId]);
                      } else {
                        setSelectedAssignments(selectedAssignments.filter(id => id !== assignment.assignmentId));
                      }
                    }}
                  />
                </td>
                <td>
                  <div className="policy-info">
                    <div className="policy-type">{assignment.policyType}</div>
                    <div className="policy-id">{assignment.policyId}</div>
                  </div>
                </td>
                <td>
                  <div className="target-info">
                    <div className="target-type">{assignment.targetType}</div>
                    <div className="target-name">{assignment.targetDisplayName}</div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${assignment.status.toLowerCase()}`}>
                    {assignment.status}
                  </span>
                </td>
                <td>{assignment.priority}</td>
                <td>{assignment.effectiveDate.toLocaleDateString()}</td>
                <td>{assignment.expirationDate?.toLocaleDateString() || 'Never'}</td>
                <td>
                  <span className={`risk-badge risk-${assignment.metadata.riskLevel.toLowerCase()}`}>
                    {assignment.metadata.riskLevel}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleRevokeAssignment(assignment.assignmentId, 'Manual revocation')}
                      className="btn btn-sm btn-danger"
                    >
                      Revoke
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBulkAssignments = () => (
    <div className="bulk-assignments-section">
      <h3>Bulk Assignments</h3>
      <div className="bulk-assignments-list">
        {bulkAssignments.map(bulk => (
          <div key={bulk.bulkAssignmentId} className="bulk-assignment-card">
            <div className="bulk-header">
              <h4>{bulk.title}</h4>
              <span className={`status-badge status-${bulk.status.toLowerCase()}`}>
                {bulk.status}
              </span>
            </div>
            <p>{bulk.description}</p>
            <div className="bulk-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${(bulk.progress.processedAssignments / bulk.progress.totalAssignments) * 100}%`
                  }}
                />
              </div>
              <div className="progress-text">
                {bulk.progress.processedAssignments} / {bulk.progress.totalAssignments} processed
              </div>
            </div>
            <div className="bulk-stats">
              <span>✅ {bulk.progress.successfulAssignments} successful</span>
              <span>❌ {bulk.progress.failedAssignments} failed</span>
              <span>⏭️ {bulk.progress.skippedAssignments} skipped</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="policy-assignment-dashboard">
      <div className="dashboard-header">
        <h1>Policy Assignment Management</h1>
        <div className="dashboard-actions">
          <button onClick={loadDashboardData} className="btn btn-outline" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {renderStatsCards()}

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Assignments
        </button>
        <button 
          className={`tab ${activeTab === 'bulk' ? 'active' : ''}`}
          onClick={() => setActiveTab('bulk')}
        >
          Bulk Operations
        </button>
        <button 
          className={`tab ${activeTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveTab('conflicts')}
        >
          Conflicts ({conflicts.length})
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'inheritance' ? 'active' : ''}`}
          onClick={() => setActiveTab('inheritance')}
        >
          Inheritance
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'assignments' && renderAssignmentsList()}
        {activeTab === 'bulk' && renderBulkAssignments()}
        {activeTab === 'conflicts' && (
          <AssignmentConflictResolver 
            conflicts={conflicts} 
            onResolve={() => loadDashboardData()}
          />
        )}
        {activeTab === 'analytics' && (
          <AssignmentAnalytics />
        )}
        {activeTab === 'inheritance' && (
          <InheritanceVisualization assignments={assignments} />
        )}
      </div>

      {showCreateForm && (
        <PolicyAssignmentForm 
          onSubmit={handleCreateAssignment}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {showBulkWizard && (
        <BulkAssignmentWizard 
          onSubmit={handleBulkAssignment}
          onCancel={() => setShowBulkWizard(false)}
        />
      )}
    </div>
  );
};