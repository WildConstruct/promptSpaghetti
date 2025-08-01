/**
 * Password Management Dashboard
 * Epic 17.3.1 - User Management Dashboard
 * Task: E17-1753114397015-CD835D
 * 
 * Administrative password management interface integrating with the
 * comprehensive Epic17PasswordManagementService backend.
 */
import React, { useState, useEffect, useCallback } from 'react';

// Password Management Types


export interface PasswordPolicy {
  id: string;,
  name: string,
  description: string;,
  minLength: number,
  maxLength: number;,
  requireUppercase: boolean,
  requireLowercase: boolean;,
  requireNumbers: boolean,
  requireSymbols: boolean;,
  minUniqueChars: number,
  preventCommonPasswords: boolean;,
  preventPasswordReuse: number,
  maxAge: number; // days,
  warningDays: number;,
  isActive: boolean,
  createdAt: string;,
  updatedAt: string;





export interface PasswordStrengthResult {
  score: number; // 0-100,
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';,
  feedback: string,
  suggestions: string;,
  breachDetected: boolean,
  entropy: number;





export interface SecurityEvent {
  id: string;,
  type: 'password_breach' | 'weak_password' | 'policy_violation' | 'credential_rotation' | 'authentication_failure',
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  userEmail?: string,
  description: string;,
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string,
  timestamp: string;,
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;





export interface PasswordManagementStats {
  totalUsers: number;,
  usersWithExpiredPasswords: number,
  usersWithWeakPasswords: number;,
  usersWithBreachedPasswords: number,
  recentSecurityEvents: number;,
  passwordPolicyCompliance: number,
  averagePasswordStrength: number;,
  credentialRotationRate: number,
  mfaAdoptionRate: number;
  interface PasswordManagementDashboardProps {
  userRole: string;
  onExport?: (type: string) => void;



className?: string;


export const PasswordManagementDashboard: React.FC<PasswordManagementDashboardProps> = ({
  userRole,
  onExport,
  className = ''
}) => {
  // State Management
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'security' | 'users'>('overview');
  const [stats, setStats] = useState<PasswordManagementStats | null>(null);
  const [policies, setPolicies] = useState<PasswordPolicy[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ setSelectedPolicy] = useState<PasswordPolicy | null>(null);
  const [ setShowPolicyModal] = useState(false);
  // Permission checks
  const canManagePolicies = ['super_admin', 'admin'].includes(userRole);
  const canViewSecurityEvents = ['super_admin', 'admin', 'security'].includes(userRole);
  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
  setIsLoading(true);
  setError(null);
  try {
  // Simulate API calls - replace with actual endpoints
  const [statsResponse, policiesResponse, eventsResponse] = await Promise.all([)
  fetch('/api/admin/password-management/stats'),
  fetch('/api/admin/password-management/policies'),
  fetch('/api/admin/password-management/security-events?limit=20')
  ]);
  // Mock data for demonstration
  const mockStats: PasswordManagementStats = {,
  totalUsers: 1250,
  usersWithExpiredPasswords: 45,
  usersWithWeakPasswords: 128,
  usersWithBreachedPasswords: 12,
  recentSecurityEvents: 8,
  passwordPolicyCompliance: 87.5,
  averagePasswordStrength: 78.2,
  credentialRotationRate: 92.1,
  mfaAdoptionRate: 68.3
};
      const mockPolicies: PasswordPolicy = [
        {
  id: 'policy-001',
  name: 'Enterprise Standard',
  description: 'Standard enterprise password policy with high security requirements',
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  minUniqueChars: 8,
  preventCommonPasswords: true,
  preventPasswordReuse: 12,
  maxAge: 90,
  warningDays: 14,
  isActive: true,
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-03-01T00:00:00Z'

        {
          id: 'policy-002',
          name: 'High Security',
          description: 'Maximum security policy for privileged accounts',
          minLength: 16,
          maxLength: 256,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          minUniqueChars: 12,
          preventCommonPasswords: true,
          preventPasswordReuse: 24,
          maxAge: 60,
          warningDays: 7,
          isActive: false,
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-15T00:00:00Z'];
      const mockEvents: SecurityEvent = [
        {
          id: 'event-001',
          type: 'password_breach',
          severity: 'high',
          userId: 'user-123',
          userEmail: 'user@example.com',
          description: 'Password found in breach database',
          details: { breachSource: 'HaveIBeenPwned', breachDate: '2023-12-15' },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          resolved: false;

        {
          id: 'event-002',
          type: 'weak_password',
          severity: 'medium',
          userId: 'user-456',
          userEmail: 'another@example.com',
          description: 'User password strength below policy requirements',
          details: { strengthScore: 45, requiredScore: 60 },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          resolved: true,
          resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          resolvedBy: 'admin'];
      setStats(mockStats);
      setPolicies(mockPolicies);
      setSecurityEvents(mockEvents);
 catch (error) {
  console.error('Failed to load dashboard data:', error);
  setError('Failed to load password management data');
 finally {
      setIsLoading(false);
  }, []);
  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);
  // Utility Components
  const StatCard: React.FC<{,
  title: string,
  value: string | number;
  trend?: number;
  status?: 'good' | 'warning' | 'critical',
  icon: string;
  description?: string;
> = ({ title, value, trend, status = 'good', icon, description }) => {
  const statusColors = {
  good: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444'
};
    return;
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: `2px solid ${statusColors[status]}15`}
}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>
            {title}
          </h3>
          <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend !== undefined && ()
            <span style={{
  fontSize: '12px',
  marginLeft: '8px',
  color: trend >= 0 ? '#10b981' : '#ef4444'
}>
              {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
            </span>
          )}
        </div>
        {description && ()
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            {description}
          </p>
        )}
      </div>
    );
  };
  // Overview Tab Content
  const OverviewContent = () => {
    if (!stats) return <div>Loading statistics...</div>;
    return;
      <div>
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <StatCard
            title="Password Compliance"
            value={`${stats.passwordPolicyCompliance.toFixed(1)}%`}
            trend={2.3}
            status={stats.passwordPolicyCompliance >= 85 ? 'good' : stats.passwordPolicyCompliance >= 70 ? 'warning' : 'critical'}
            icon="🔒"
            description="Users meeting password policy requirements"
          />
          <StatCard
            title="Average Password Strength"
            value={`${stats.averagePasswordStrength.toFixed(0)}/100`}
            trend={1.8}
            status={stats.averagePasswordStrength >= 70 ? 'good' : stats.averagePasswordStrength >= 50 ? 'warning' : 'critical'}
            icon="💪"
            description="Overall password strength score"
          />
          <StatCard
            title="Expired Passwords"
            value={stats.usersWithExpiredPasswords}
            status={stats.usersWithExpiredPasswords > 50 ? 'critical' : stats.usersWithExpiredPasswords > 20 ? 'warning' : 'good'}
            icon="⏰"
            description="Users with passwords past expiration"
          />
          <StatCard
            title="Breached Passwords"
            value={stats.usersWithBreachedPasswords}
            status={stats.usersWithBreachedPasswords > 10 ? 'critical' : stats.usersWithBreachedPasswords > 0 ? 'warning' : 'good'}
            icon="🚨"
            description="Passwords found in breach databases"
          />
        </div>
        {/* Additional Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <StatCard
            title="MFA Adoption"
            value={`${stats.mfaAdoptionRate.toFixed(1)}%`}
            trend={5.2}
            status={stats.mfaAdoptionRate >= 80 ? 'good' : stats.mfaAdoptionRate >= 50 ? 'warning' : 'critical'}
            icon="🔐"
            description="Users with multi-factor authentication"
          />
          <StatCard
            title="Credential Rotation"
            value={`${stats.credentialRotationRate.toFixed(1)}%`}
            trend={0.8}
            status="good"
            icon="🔄"
            description="API keys rotated on schedule"
          />
          <StatCard
            title="Weak Passwords"
            value={stats.usersWithWeakPasswords}
            status={stats.usersWithWeakPasswords > 100 ? 'critical' : stats.usersWithWeakPasswords > 50 ? 'warning' : 'good'}
            icon="⚠️"
            description="Users with below-standard passwords"
          />
          <StatCard
            title="Recent Security Events"
            value={stats.recentSecurityEvents}
            status={stats.recentSecurityEvents > 10 ? 'critical' : stats.recentSecurityEvents > 5 ? 'warning' : 'good'}
            icon="🔍"
            description="Security events in last 24 hours"
          />
        </div>
        {/* Quick Actions */}
        <div style={{
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  marginBottom: '24px'
}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {canManagePolicies && ()
              <button
                onClick={() => setShowPolicyModal(true)}
                style={{
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
}
              >
                📋 Update Password Policy
              </button>
            )}
            <button
              onClick={() => onExport?.('expired-passwords')}
              style={{
  padding: '8px 16px',
  backgroundColor: '#f59e0b',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
}
            >
              📊 Export Expired Passwords
            </button>
            <button
              onClick={() => onExport?.('security-report')}
              style={{
  padding: '8px 16px',
  backgroundColor: '#10b981',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
}
            >
              📈 Generate Security Report
            </button>
            {canViewSecurityEvents && ()
              <button
                onClick={() => setActiveTab('security')}
                style={{
  padding: '8px 16px',
  backgroundColor: '#dc2626',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
}
              >
                🚨 View Security Events
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  // Password Policies Tab Content
  const PoliciesContent = () => (;);
    <div>
      <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px'
}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
          Password Policies
        </h3>
        {canManagePolicies && ()
          <button
            onClick={() => {
              setSelectedPolicy(null);
              setShowPolicyModal(true);
}
            style={{
  padding: '8px 16px',
  backgroundColor: '#3b82f6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
}
          >
            + Create Policy
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {policies.map(policy => (
          <div
            key={policy.id}
            style={{
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  padding: '20px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: policy.isActive ? '2px solid #10b981' : '1px solid #e5e7eb'
}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  {policy.name}
                </h4>
                {policy.isActive && ()
                  <span style={{
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '500'
}>
                    ACTIVE
                  </span>
                )}
              </div>
              {canManagePolicies && ()
                <button
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setShowPolicyModal(true);
}
                  style={{
  padding: '4px 8px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer'
}
                >
                  Edit
                </button>
              )}
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
              {policy.description}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13px' }}>
              <div>
                <strong>Length:</strong> {policy.minLength}-{policy.maxLength} characters
              </div>
              <div>
                <strong>Requirements:</strong>{' '}
                {[
                  policy.requireUppercase && 'Uppercase',
                  policy.requireLowercase && 'Lowercase',
                  policy.requireNumbers && 'Numbers',
                  policy.requireSymbols && 'Symbols'
                ].filter(Boolean).join(', ')}
              </div>
              <div>
                <strong>Max Age:</strong> {policy.maxAge} days
              </div>
              <div>
                <strong>History:</strong> {policy.preventPasswordReuse} passwords
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  // Security Events Tab Content
  const SecurityEventsContent = () => (;);
    <div>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
        Security Events
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {securityEvents.map(event => (
          <div
            key={event.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              borderLeft: `4px solid ${}
                event.severity === 'critical' ? '#dc2626' :
                  event.severity === 'high' ? '#ea580c' :
                    event.severity === 'medium' ? '#f59e0b' : '#6b7280'
`

          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
  fontSize: '16px',
  color: event.severity === 'critical' ? '#dc2626' :,
  event.severity === 'high' ? '#ea580c' :,
  event.severity === 'medium' ? '#f59e0b' : '#6b7280'
}>
                  {event.type === 'password_breach' ? '🚨' :
                    event.type === 'weak_password' ? '⚠️' :
                      event.type === 'policy_violation' ? '📋' :
                        event.type === 'credential_rotation' ? '🔄' : '🔍'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {event.description}
                </span>
              </div>
              {event.resolved ? ()
                <span style={{
  backgroundColor: '#dcfce7',
  color: '#166534',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '500'
}>
                  RESOLVED
                </span>
              ) : ()
                <span style={{
  backgroundColor: '#fef3c7',
  color: '#92400e',
  padding: '2px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '500'
}>
                  OPEN
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
              {event.userEmail && `User: ${event.userEmail} • `}
              {new Date(event.timestamp).toLocaleString()}
              {event.resolvedAt && ` • Resolved: ${new Date(event.resolvedAt).toLocaleString()}`}
            </div>
            {Object.keys(event.details).length > 0 && ()
              <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                {JSON.stringify(event.details, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
  // Loading State
  if (isLoading) {
  return;
  <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '400px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px'
}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
  width: '40px',
  height: '40px',
  border: '4px solid #e5e7eb',
  borderTopColor: '#3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '0 auto 16px'
} />
          <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading password management data...</div>
        </div>
      </div>
    );
  // Error State
  if (error) {
  return;
  <div style={{
  padding: '40px',
  textAlign: 'center',
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  border: '1px solid #fecaca'
}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
          Error Loading Password Management
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#991b1b' }}>
          {error}
        </p>
        <button
          onClick={loadDashboardData}
          style={{
  marginTop: '16px',
  padding: '8px 16px',
  backgroundColor: '#dc2626',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer'
}
        >
          Retry
        </button>
      </div>
    );
  return;
    <div className={`password-management-dashboard ${className}`} style={{}},
  backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '20px';
}>
      {/* Header */}
      <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px'
}>
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
            Password Management
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Manage password policies, monitor security, and ensure compliance
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          style={{
  padding: '8px 12px',
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  color: '#374151'
}
        >
          🔄 Refresh
        </button>
      </div>
      {/* Navigation Tabs */}
      <div style={{
  display: 'flex',
  borderBottom: '1px solid #e5e7eb',
  marginBottom: '24px'
}>
        {[
          { key: 'overview', label: '📊 Overview', permission: true },
          { key: 'policies', label: '📋 Policies', permission: canManagePolicies },
          { key: 'security', label: '🚨 Security Events', permission: canViewSecurityEvents }
        ].filter(tab => tab.permission).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'overview' | 'policies' | 'security' | 'users')}
            style={{
  padding: '12px 16px',
  border: 'none',
  backgroundColor: 'transparent',
  color: activeTab === tab.key ? '#3b82f6' : '#6b7280',
  borderBottom: activeTab === tab.key ? '2px solid #3b82f6' : 'none',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer'

          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'policies' && <PoliciesContent />}
        {activeTab === 'security' && <SecurityEventsContent />}
      </div>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
      `}</style>
    </div>
  );
};

export default PasswordManagementDashboard;