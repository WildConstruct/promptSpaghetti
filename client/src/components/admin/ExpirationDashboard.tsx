/**
 * ExpirationDashboard - Admin interface for authentication resource expiration management
 * 
 * Provides comprehensive expiration management interface:
 * - Real-time expiration statistics and warnings
 * - Resource-specific expiration status
 * - Bulk renewal and revocation operations
 * - Policy management and configuration
 * - Expiration event timeline
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types for expiration management
}
interface ExpirationStats {
  total: number;,
  active: number,
  warning: number;,
  expired: number,
  gracePeriod: number;,
  renewed: number,
  revoked: number;,
  byResourceType: Record<string, number>;
  upcomingExpirations: {
  next24Hours: number;,
  next7Days: number,
  next30Days: number;
}
};
}
interface ExpirationWarning {
  resourceId: string;,
  resourceType: string,
  expiresAt: Date;,
  timeRemaining: number,
  warningLevel: 'info' | 'warning' | 'critical';,
  canRenew: boolean;
  renewalUrl?: string;
  userId?: string;
  organizationId?: string;
  interface ExpirationPolicy {
  id: string;,
  name: string,
  resourceType: string;,
  defaultTtl: number;
  maxTtl?: number;
  minTtl?: number;
  gracePeriod?: number,
  warningThreshold: number;,
  autoRenewal: boolean,
  renewalWindow: number;
  organizationId?: string,
  isActive: boolean;,
  createdAt: Date,
  updatedAt: Date;
  interface ExpirationDashboardProps {
  }

className?: string;
  interface ExpirationDashboardState {
  stats: ExpirationStats | null;,
  warnings: ExpirationWarning,
  policies: ExpirationPolicy;,
  isLoading: boolean,
  error: string | null;,
  selectedResourceType: string,
  refreshInterval: number;,
  autoRefresh: boolean,
  showCreatePolicy: boolean;
  }

const resourceTypeLabels = {
  jwt_token: 'JWT Tokens',
  api_key: 'API Keys',
  session: 'Sessions',
  reset_token: 'Reset Tokens',
  verification_code: 'Verification Codes',
  backup_code: 'Backup Codes',
  refresh_token: 'Refresh Tokens'
}
};
const warningLevelColors = {
  info: '#17a2b8',
  warning: '#ffc107',
  critical: '#dc3545'
};

export const ExpirationDashboard: React.FC<ExpirationDashboardProps> = ({
  className = ''
}) => {
  const { isAuthenticated } = useAuthStore();
  const [state, setState] = useState<ExpirationDashboardState>({
  stats: null,
  warnings: [],
  policies: [],
  isLoading: true,
  error: null,
  selectedResourceType: '',
  refreshInterval: 30000, // 30 seconds,
  autoRefresh: true,
  showCreatePolicy: false
});
  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
  }, [isAuthenticated, loadData]);
  // Auto-refresh
  useEffect(() => {
    if (state.autoRefresh && state.refreshInterval > 0) {
      const interval = setInterval(loadData, state.refreshInterval);
      return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval, loadData]);
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const [statsResponse, warningsResponse, policiesResponse] = await Promise.all([)
        fetch('/api/expiration/stats', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/expiration/warnings?limit=50', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/expiration/policies', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  }
      ]);
      const [stats, warnings, policies] = await Promise.all([)
        statsResponse.json(),
        warningsResponse.json(),
        policiesResponse.json()
      ]);
      setState(prev => ({
  ...prev,
  stats: stats.success ? stats.stats : null,
  warnings: warnings.success ? warnings.warnings.map((w: unknown) => ({
  ...w,
  expiresAt: new Date(w.expiresAt)
})) : [],
        policies: policies.success ? policies.policies : [],
        isLoading: false;
  }));
    } catch (error) {
  setState(prev => ({
  ...prev,
  isLoading: false,
  error: error instanceof Error ? error.message : 'Failed to load data'
}));
  }, []);
  const handleRenewResource = async (resourceId: string, resourceType: string) => {
    try {
      const response = await fetch(`/api/expiration/renew/${resourceType}/${resourceId}`, {)}
  },
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify({
  reason: 'Manual renewal from dashboard'
}
      });
      const result = await response.json();
      if (result.success) {
        // Refresh data to show updated status
        await loadData();
      } else {
        setState(prev => ({ ...prev, error: result.error }));
    } catch (error) {
  setState(prev => ({
  ...prev,
  error: error instanceof Error ? error.message : 'Failed to renew resource'
}));
  };
  const handleRevokeResource = async (resourceId: string, resourceType: string) => {
    if (!confirm(`Are you sure you want to revoke ${resourceType} ${resourceId}? This action cannot be undone.`)) {}
      return;
    try {
      const response = await fetch(`/api/expiration/revoke/${resourceType}/${resourceId}`, {)}
  },
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
  },
  body: JSON.stringify({
  reason: 'Manual revocation from dashboard'
}
      });
      const result = await response.json();
      if (result.success) {
        await loadData();
      } else {
        setState(prev => ({ ...prev, error: result.error }));
    } catch (error) {
  setState(prev => ({
  ...prev,
  error: error instanceof Error ? error.message : 'Failed to revoke resource'
}));
  };
  const handleCleanupExpired = async () => {
    if (!confirm('This will clean up all expired resources. Are you sure?')) {
      return;
    try {
      const response = await fetch('/api/expiration/cleanup', {
  method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
      });
      const result = await response.json();
      if (result.success) {
        alert(`Cleanup completed: ${result.result.cleaned} resources cleaned, ${result.result.errors} errors`);}
        await loadData();
      } else {
        setState(prev => ({ ...prev, error: result.error }));
    } catch (error) {
  setState(prev => ({
  ...prev,
  error: error instanceof Error ? error.message : 'Failed to cleanup expired resources'
}));
  };
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;}
    if (hours > 0) return `${hours}h ${minutes}m`;}
    return `${minutes}m`;}
  };
  const formatTtl = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days} days`;}
    if (hours > 0) return `${hours} hours`;}
    return `${Math.floor(seconds / 60)} minutes`;}
  };
  if (!isAuthenticated) {
    return;
      <div className={`expiration-dashboard ${className}`} style={{ }}
  padding: '20px', 
        textAlign: 'center',
        color: '#666';
  }}>
        Please log in to access the expiration dashboard.
      </div>
    );
  return;
    <div className={`expiration-dashboard ${className}`} style={{}}
  padding: '20px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh';
  }}>
      {/* Header */}
      <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
            Expiration Management
          </h1>
          <p style={{ margin: 0, color: '#666' }}>
            Monitor and manage authentication resource expiration
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={state.autoRefresh}
              onChange={(e) => setState(prev => ({ ...prev, autoRefresh: e.target.checked }))}
            />
            Auto-refresh
          </label>
          <select
            value={state.refreshInterval}
            onChange={(e) => setState(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
            style={{
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px'
}}
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
          </select>
          <button
            onClick={loadData}
            style={{
  padding: '6px 12px',
  border: '1px solid #007bff',
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
}}
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleCleanupExpired}
            style={{
  padding: '6px 12px',
  border: '1px solid #ffc107',
  backgroundColor: '#ffc107',
  color: '#212529',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
}}
          >
            🧹 Cleanup
          </button>
        </div>
      </div>
      {/* Error Display */}
      {state.error && ()
        <div style={{
  padding: '12px',
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  borderRadius: '4px',
  color: '#721c24',
  marginBottom: '16px'
}}>
          {state.error}
        </div>
      )}
      {/* Statistics Cards */}
      {state.stats && ()
        <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '20px',
  marginBottom: '24px'
}}>
          <div style={{
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Overview
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {state.stats.active}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Active</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                  {state.stats.warning}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Warning</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {state.stats.expired}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Expired</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                  {state.stats.gracePeriod}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Grace Period</div>
              </div>
            </div>
          </div>
          <div style={{
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              Upcoming Expirations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Next 24 hours:</span>
                <span style={{ fontWeight: 'bold', color: '#dc3545' }}>
                  {state.stats.upcomingExpirations.next24Hours}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Next 7 days:</span>
                <span style={{ fontWeight: 'bold', color: '#ffc107' }}>
                  {state.stats.upcomingExpirations.next7Days}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Next 30 days:</span>
                <span style={{ fontWeight: 'bold', color: '#17a2b8' }}>
                  {state.stats.upcomingExpirations.next30Days}
                </span>
              </div>
            </div>
          </div>
          <div style={{
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>
              By Resource Type
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(state.stats.byResourceType).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {resourceTypeLabels[type as keyof typeof resourceTypeLabels] || type}:
                  </span>
                  <span style={{ fontWeight: 'bold' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Warnings Table */}
      <div style={{
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  marginBottom: '24px'
}}>
        <div style={{
  padding: '20px',
  borderBottom: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Expiration Warnings ({state.warnings.length})
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={state.selectedResourceType}
              onChange={(e) => setState(prev => ({ ...prev, selectedResourceType: e.target.value }))}
              style={{
  padding: '6px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '14px'
}}
            >
              <option value="">All Types</option>
              {Object.entries(resourceTypeLabels).map(([type, label]) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ overflow: 'auto', maxHeight: '600px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Resource
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Type
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Expires
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Time Remaining
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Level
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {state.warnings
                .filter(w => !state.selectedResourceType || w.resourceType === state.selectedResourceType)
                .map(warning => (
                  <tr key={`${warning.resourceType}-${warning.resourceId}`}>}
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      <code style={{ backgroundColor: '#f8f9fa', padding: '2px 4px', borderRadius: '3px' }}>
                        {warning.resourceId}
                      </code>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      {resourceTypeLabels[warning.resourceType as keyof typeof resourceTypeLabels] || warning.resourceType}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      {warning.expiresAt.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      {formatTimeRemaining(warning.timeRemaining)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      <span style={{
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold',
  backgroundColor: warningLevelColors[warning.warningLevel] + '20',
  color: warningLevelColors[warning.warningLevel]
}}>
                        {warning.warningLevel.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {warning.canRenew && ()
                          <button
                            onClick={() => handleRenewResource(warning.resourceId, warning.resourceType)}
                            style={{
  padding: '4px 8px',
  border: '1px solid #28a745',
  backgroundColor: '#28a745',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
}}
                          >
                            Renew
                          </button>
                        )}
                        <button
                          onClick={() => handleRevokeResource(warning.resourceId, warning.resourceType)}
                          style={{
  padding: '4px 8px',
  border: '1px solid #dc3545',
  backgroundColor: '#dc3545',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px'
}}
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {state.warnings.length === 0 && ()
            <div style={{
  padding: '40px',
  textAlign: 'center',
  color: '#666'
}}>
              No expiration warnings at this time.
            </div>
          )}
        </div>
      </div>
      {/* Policies Section */}
      <div style={{
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
        <div style={{
  padding: '20px',
  borderBottom: '1px solid #eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            Expiration Policies ({state.policies.length})
          </h3>
          <button
            onClick={() => setState(prev => ({ ...prev, showCreatePolicy: true }))}
            style={{
  padding: '6px 12px',
  border: '1px solid #007bff',
  backgroundColor: '#007bff',
  color: 'white',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px'
}}
          >
            + Create Policy
          </button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Policy Name
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Resource Type
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Default TTL
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Warning Threshold
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Auto Renewal
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {state.policies.map(policy => (
                <tr key={policy.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{policy.name}</div>
                      {policy.organizationId && ()
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Org: {policy.organizationId}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {resourceTypeLabels[policy.resourceType as keyof typeof resourceTypeLabels] || policy.resourceType}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {formatTtl(policy.defaultTtl)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    {formatTtl(policy.warningThreshold)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
  padding: '2px 6px',
  borderRadius: '12px',
  fontSize: '12px',
  backgroundColor: policy.autoRenewal ? '#d4edda' : '#f8d7da',
  color: policy.autoRenewal ? '#155724' : '#721c24'
}}>
                      {policy.autoRenewal ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                    <span style={{
  padding: '2px 6px',
  borderRadius: '12px',
  fontSize: '12px',
  backgroundColor: policy.isActive ? '#d4edda' : '#f8d7da',
  color: policy.isActive ? '#155724' : '#721c24'
}}>
                      {policy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Loading Overlay */}
      {state.isLoading && ()
        <div style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}}>
          <div style={{
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
}}>
            <div style={{
  width: '20px',
  height: '20px',
  border: '2px solid #f3f3f3',
  borderTop: '2px solid #007bff',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}} />
            Loading...
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirationDashboard;