// Data Access Dashboard - Epic 19.4
// User interface for managing data access permissions and requests

import React, { useState, useEffect } from 'react';
import './DataAccessDashboard.css';

// Types
interface DataAccessGrant {
  id: string;
  resourceId: string;
  resourceType: string;
  operations: string[];
  classification: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt: Date;
  reason: string;
  restrictions: AccessRestriction[];
}

interface AccessRestriction {
  type: string;
  value: string;
  description: string;
}

interface AccessHistoryEvent {
  id: string;
  userId: string;
  resourceId: string;
  operation: string;
  allowed: boolean;
  reason: string;
  classification: string;
  accessLevel: string;
  timestamp: Date;
  riskScore: number;
}

interface AccessRequest {
  resourceId: string;
  resourceType: string;
  operation: string;
  reason: string;
  expiresAt?: Date;
}

interface AccessPermissions {
  allowed: boolean;
  reason: string;
  classification: string;
  accessLevel: string;
  requiredPermissions: string[];
  actualPermissions: string[];
  restrictions: AccessRestriction[];
  auditId: string;
}

interface DataAccessDashboardProps {
  userId: string;
  apiBaseUrl?: string;
}

const DataAccessDashboard: React.FC<DataAccessDashboardProps> = ({
  userId,
  apiBaseUrl = '/api'
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'permissions' | 'requests' | 'history'>('permissions');
  const [grants, setGrants] = useState<DataAccessGrant[]>([]);
  const [history, setHistory] = useState<AccessHistoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState<AccessRequest>({
    resourceId: '',
    resourceType: '',
    operation: 'READ',
    reason: ''
  });

  // Filters
  const [historyFilter, setHistoryFilter] = useState({
    operation: '',
    allowed: '',
    startDate: '',
    endDate: ''
  });

  // API helpers
  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken'); // Adjust based on your auth system
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  };

  // Load data
  const loadGrants = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/data-access/grants/${userId}`);
      setGrants(response.grants || []);
    } catch (err) {
      setError(`Failed to load access grants: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: '50',
        offset: '0',
        ...(historyFilter.operation && { operation: historyFilter.operation }),
        ...(historyFilter.allowed && { allowed: historyFilter.allowed }),
        ...(historyFilter.startDate && { startDate: historyFilter.startDate }),
        ...(historyFilter.endDate && { endDate: historyFilter.endDate })
      });

      const response = await apiRequest(`/data-access/audit/${userId}?${queryParams}`);
      setHistory(response.data || []);
    } catch (err) {
      setError(`Failed to load access history: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit access request
  const submitAccessRequest = async () => {
    try {
      setLoading(true);
      await apiRequest('/data-access/request', {
        method: 'POST',
        body: JSON.stringify(requestForm)
      });

      setShowRequestForm(false);
      setRequestForm({
        resourceId: '',
        resourceType: '',
        operation: 'READ',
        reason: ''
      });
      
      // Reload grants to show any auto-approved requests
      await loadGrants();
      
      alert('Access request submitted successfully!');
    } catch (err) {
      setError(`Failed to submit access request: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Check specific resource access
        if (!response.ok) throw new Error('Failed to check access');
      const data = await response.json();
      return data as AccessPermissions;
    } catch (err) {
      console.error('Failed to check resource access:', err);
      return null;
    }
  };

  // Effects
  useEffect(() => {
    if (activeTab === 'permissions') {
      loadGrants();
    } else if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, historyFilter]);

  // Render helpers
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
    case 'PUBLIC': return '#28a745';
    case 'INTERNAL': return '#ffc107';
    case 'CONFIDENTIAL': return '#fd7e14';
    case 'RESTRICTED': return '#dc3545';
    default: return '#6c757d';
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
    case 'GRANTED': return '✅';
    case 'DENIED': return '❌';
    case 'PENDING': return '⏳';
    case 'EXPIRED': return '⏰';
    default: return '❓';
    }
  };

  // Render current grants
  const renderGrantsTab = () => (
    <div className="grants-tab">
      <div className="tab-header">
        <h3>Your Access Permissions</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowRequestForm(true)}
          disabled={loading}
        >
          Request Access
        </button>
      </div>

      {grants.length === 0 ? (
        <div className="empty-state">
          <p>No active access grants found.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRequestForm(true)}
          >
            Request Your First Access
          </button>
        </div>
      ) : (
        <div className="grants-grid">
          {grants.map(grant => (
            <div key={grant.id} className="grant-card">
              <div className="grant-header">
                <div className="resource-info">
                  <span className="resource-id">{grant.resourceId}</span>
                  <span className="resource-type">{grant.resourceType}</span>
                </div>
                <div 
                  className="classification-badge"
                  style={{ backgroundColor: getClassificationColor(grant.classification) }}
                >
                  {grant.classification}
                </div>
              </div>

              <div className="grant-operations">
                <h4>Allowed Operations:</h4>
                <div className="operations-list">
                  {grant.operations.map(op => (
                    <span key={op} className="operation-tag">{op}</span>
                  ))}
                </div>
              </div>

              <div className="grant-details">
                <div className="detail-row">
                  <span className="label">Granted by:</span>
                  <span className="value">{grant.grantedBy}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Granted at:</span>
                  <span className="value">{formatDate(grant.grantedAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Expires at:</span>
                  <span className="value">{formatDate(grant.expiresAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Reason:</span>
                  <span className="value">{grant.reason}</span>
                </div>
              </div>

              {grant.restrictions.length > 0 && (
                <div className="grant-restrictions">
                  <h4>Restrictions:</h4>
                  {grant.restrictions.map((restriction, index) => (
                    <div key={index} className="restriction-item">
                      <span className="restriction-type">{restriction.type}:</span>
                      <span className="restriction-description">{restriction.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render access history
  const renderHistoryTab = () => (
    <div className="history-tab">
      <div className="tab-header">
        <h3>Access History</h3>
        <div className="history-filters">
          <select 
            value={historyFilter.operation}
            onChange={e => setHistoryFilter({...historyFilter, operation: e.target.value})}
          >
            <option value="">All Operations</option>
            <option value="READ">Read</option>
            <option value="WRITE">Write</option>
            <option value="DELETE">Delete</option>
            <option value="EXPORT">Export</option>
          </select>
          
          <select 
            value={historyFilter.allowed}
            onChange={e => setHistoryFilter({...historyFilter, allowed: e.target.value})}
          >
            <option value="">All Results</option>
            <option value="true">Allowed</option>
            <option value="false">Denied</option>
          </select>

          <input
            type="date"
            value={historyFilter.startDate}
            onChange={e => setHistoryFilter({...historyFilter, startDate: e.target.value})}
            placeholder="Start Date"
          />

          <input
            type="date"
            value={historyFilter.endDate}
            onChange={e => setHistoryFilter({...historyFilter, endDate: e.target.value})}
            placeholder="End Date"
          />
        </div>
      </div>

      <div className="history-list">
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No access history found for the selected filters.</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Resource</th>
                <th>Operation</th>
                <th>Result</th>
                <th>Classification</th>
                <th>Risk Score</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {history.map(event => (
                <tr key={event.id} className={event.allowed ? 'allowed' : 'denied'}>
                  <td className="timestamp">{formatDate(event.timestamp)}</td>
                  <td className="resource">{event.resourceId}</td>
                  <td className="operation">{event.operation}</td>
                  <td className="result">
                    {getAccessLevelIcon(event.accessLevel)} {event.accessLevel}
                  </td>
                  <td className="classification">
                    <span 
                      className="classification-badge"
                      style={{ backgroundColor: getClassificationColor(event.classification) }}
                    >
                      {event.classification}
                    </span>
                  </td>
                  <td className="risk-score">
                    <span className={`risk-badge ${event.riskScore > 70 ? 'high' : event.riskScore > 30 ? 'medium' : 'low'}`}>
                      {event.riskScore}
                    </span>
                  </td>
                  <td className="reason">{event.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  // Render request form modal
  const renderRequestForm = () => {
    if (!showRequestForm) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Request Data Access</h3>
            <button 
              className="close-btn"
              onClick={() => setShowRequestForm(false)}
            >
              ×
            </button>
          </div>

          <div className="modal-body">
            <div className="form-group">
              <label>Resource ID</label>
              <input
                type="text"
                value={requestForm.resourceId}
                onChange={e => setRequestForm({...requestForm, resourceId: e.target.value})}
                placeholder="e.g., customer-123, document-456"
                required
              />
            </div>

            <div className="form-group">
              <label>Resource Type</label>
              <select
                value={requestForm.resourceType}
                onChange={e => setRequestForm({...requestForm, resourceType: e.target.value})}
                required
              >
                <option value="">Select resource type</option>
                <option value="customer_data">Customer Data</option>
                <option value="financial_records">Financial Records</option>
                <option value="employee_records">Employee Records</option>
                <option value="system_logs">System Logs</option>
                <option value="reports">Reports</option>
                <option value="documents">Documents</option>
              </select>
            </div>

            <div className="form-group">
              <label>Operation</label>
              <select
                value={requestForm.operation}
                onChange={e => setRequestForm({...requestForm, operation: e.target.value})}
                required
              >
                <option value="READ">Read</option>
                <option value="WRITE">Write</option>
                <option value="DELETE">Delete</option>
                <option value="EXPORT">Export</option>
                <option value="SHARE">Share</option>
              </select>
            </div>

            <div className="form-group">
              <label>Business Justification</label>
              <textarea
                value={requestForm.reason}
                onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
                placeholder="Please provide a detailed business justification for this access request..."
                rows={4}
                required
                minLength={10}
              />
            </div>

            <div className="form-group">
              <label>Access Duration (Optional)</label>
              <input
                type="datetime-local"
                value={requestForm.expiresAt ? new Date(requestForm.expiresAt).toISOString().slice(0, 16) : ''}
                onChange={e => setRequestForm({
                  ...requestForm, 
                  expiresAt: e.target.value ? new Date(e.target.value) : undefined
                })}
              />
              <small>Leave empty for standard duration</small>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowRequestForm(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={submitAccessRequest}
              disabled={loading || !requestForm.resourceId || !requestForm.resourceType || !requestForm.reason}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="data-access-dashboard">
      <div className="dashboard-header">
        <h2>Data Access Dashboard</h2>
        <p>Manage your data access permissions and view your access history</p>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissions')}
        >
          Current Permissions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Access History
        </button>
      </div>

      <div className="dashboard-content">
        {loading && <div className="loading-spinner">Loading...</div>}
        
        {activeTab === 'permissions' && renderGrantsTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>

      {renderRequestForm()}
    </div>
  );
};

export default DataAccessDashboard;