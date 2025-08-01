/**
 * OAuth Security Dashboard - Epic 19.5
 * 
 * Comprehensive security monitoring and compliance dashboard for OAuth
 * providers with real-time metrics and audit trail visualization.
 * 
 * Task: T-1752989143998-560 - Build OAuth configuration UI
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Types and interfaces


interface SecurityMetrics {
  totalProviders: number;,
  activeProviders: number;,
  inactiveProviders: number;,
  errorProviders: number;,
  totalLogins: number;,
  successfulLogins: number;,
  failedLogins: number;,
  averageResponseTime: number;,
  uptime: number;,
  securityScore: number;,
  complianceScore: number;,
  lastUpdated: Date;



interface SecurityEvent {
  id: string;,
  timestamp: Date;,
  eventType: SecurityEventType;,
  providerId: string;,
  providerName: string;,
  severity: SecurityEventSeverity;,
  description: string;,
  details: Record<string, unknown>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;



interface ComplianceStatus {
  framework: string;,
  status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';,
  score: number;,
  issues: ComplianceIssue;,
  lastAssessment: Date;



interface ComplianceIssue {
  id: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';,
  category: string;,
  description: string;,
  recommendation: string;
  providerId?: string;



interface ThreatDetection {
  threatId: string;,
  timestamp: Date;,
  threatType: ThreatType;,
  severity: 'low' | 'medium' | 'high' | 'critical';,
  description: string;,
  source: string;,
  status: 'active' | 'mitigated' | 'false_positive';,
  affectedProviders: string;,
  indicators: ThreatIndicator;



interface ThreatIndicator {
  type: string;,
  value: string;,
  confidence: number;



interface AuditLogEntry {
  id: string;,
  timestamp: Date;,
  userId: string;,
  userName: string;,
  action: string;,
  resource: string;,
  details: Record<string, unknown>;
  result: 'success' | 'failure' | 'partial';,
  ipAddress: string;,
  userAgent: string;
  enum SecurityEventType {
  LOGIN_FAILURE = 'login_failure',
  TOKEN_EXPIRED = 'token_expired',
  INVALID_SIGNATURE = 'invalid_signature',
  PKCE_VIOLATION = 'pkce_violation',
  REDIRECT_MISMATCH = 'redirect_mismatch',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CERTIFICATE_ERROR = 'certificate_error',
  CONFIGURATION_CHANGE = 'configuration_change',
  PROVIDER_ADDED = 'provider_added',
  PROVIDER_REMOVED = 'provider_removed'
  enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  enum ThreatType {
  BRUTE_FORCE = 'brute_force',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  OAUTH_HIJACKING = 'oauth_hijacking',
  CSRF_ATTACK = 'csrf_attack',
  TOKEN_THEFT = 'token_theft',
  PHISHING = 'phishing',
  MALICIOUS_REDIRECT = 'malicious_redirect'
  export const OAuthSecurityDashboard: React.FC = () => {,
  // State management
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent>([]);
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus>([]);
  const [threats, setThreats] = useState<ThreatDetection>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'compliance' | 'threats' | 'audit'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  // Auth store for API calls


  const { authenticatedFetch } = useAuthStore();
  // Auto-refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadDashboardData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);
  // Load data on mount and time range change
  useEffect(() => {
    loadDashboardData();
  }, [timeRange, loadDashboardData]);
  // API functions
  const loadDashboardData = useCallback(async () => {
    if (!loading) setLoading(true);
    setError(null);
    try {
      await Promise.all([)
        loadSecurityMetrics(),
        loadSecurityEvents(),
        loadComplianceStatus(),
        loadThreatDetection(),
        loadAuditLogs();
      ]);
 catch (err) {
  setError('Failed to load dashboard data');
  console.error('Failed to load dashboard data:', err);
 finally {
      setLoading(false);
  }, [loading, loadAuditLogs, loadComplianceStatus, loadSecurityEvents, loadSecurityMetrics, loadThreatDetection]);
  const loadSecurityMetrics = useCallback(async () => {
    const response = await authenticatedFetch(`/api/oauth-security/metrics?timeRange=${timeRange}`);}
    const data = await response.json();
    if (data.success) {
      setMetrics(data.data.metrics);
  }, [authenticatedFetch, timeRange]);
  const loadSecurityEvents = useCallback(async () => {
    const response = await authenticatedFetch(`/api/oauth-security/events?timeRange=${timeRange}&limit=50`);}
    const data = await response.json();
    if (data.success) {
      setSecurityEvents(data.data.events || []);
  }, [authenticatedFetch, timeRange]);
  const loadComplianceStatus = useCallback(async () => {
    const response = await authenticatedFetch('/api/oauth-security/compliance');
    const data = await response.json();
    if (data.success) {
      setComplianceStatus(data.data.compliance || []);
  }, [authenticatedFetch]);
  const loadThreatDetection = useCallback(async () => {
    const response = await authenticatedFetch(`/api/oauth-security/threats?timeRange=${timeRange}&limit=20`);}
    const data = await response.json();
    if (data.success) {
      setThreats(data.data.threats || []);
  }, [authenticatedFetch, timeRange]);
  const loadAuditLogs = useCallback(async () => {
    const response = await authenticatedFetch(`/api/oauth-security/audit-logs?timeRange=${timeRange}&limit=100`);}
    const data = await response.json();
    if (data.success) {
      setAuditLogs(data.data.logs || []);
  }, [authenticatedFetch, timeRange]);
  // Computed values
  const securityScore = useMemo(() => {
    if (!metrics) return 0;
    return Math.round(metrics.securityScore);
  }, [metrics]);
  const complianceScore = useMemo(() => {
    if (!metrics) return 0;
    return Math.round(metrics.complianceScore);
  }, [metrics]);
  const criticalIssuesCount = useMemo(() => {
    const criticalEvents = securityEvents.filter(e => e.severity === SecurityEventSeverity.CRITICAL && !e.resolved).length;
    const criticalThreats = threats.filter(t => t.severity === 'critical' && t.status === 'active').length;
    return criticalEvents + criticalThreats;
  }, [securityEvents, threats]);
  // Utility functions
  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  const getSeverityColor = (severity: string): string => {
  switch (severity) {
  case 'critical': return 'text-red-600 bg-red-100';
  case 'high': return 'text-orange-600 bg-orange-100';
  case 'medium': return 'text-yellow-600 bg-yellow-100';
  case 'low': return 'text-blue-600 bg-blue-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {)
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(date);
  };
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };
  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;}
  };
  if (loading && !metrics) {
    return;
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading security dashboard...</span>
      </div>
    );
  return;
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">OAuth Security Dashboard</h1>
            <p className="text-gray-600">
              Monitor OAuth security, compliance, and threat detection in real-time
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Auto-refresh toggle */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
            </label>
            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | '7d' | '30d')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            {/* Refresh button */}
            <button
              onClick={() => loadDashboardData()}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 flex items-center"
            >
              {loading ? ()
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : ()
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
          </div>
        </div>
      </div>
      {/* Error Display */}
      {error && ()
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Critical Alerts */}
      {criticalIssuesCount > 0 && ()
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-red-900">
                {criticalIssuesCount} Critical Security Issue{criticalIssuesCount !== 1 ? 's' : ''} Detected
              </h3>
              <p className="text-red-700">
                Immediate attention required for OAuth security and compliance
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Dashboard Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'events', label: 'Security Events', icon: '🔒' },
            { id: 'compliance', label: 'Compliance', icon: '📋' },
            { id: 'threats', label: 'Threats', icon: '⚠️' },
            { id: 'audit', label: 'Audit Logs', icon: '📝' }
          ].map((tab) => ()
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'events' | 'compliance' | 'threats' | 'audit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.id === 'events' && securityEvents.filter(e => !e.resolved).length > 0 && ()
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {securityEvents.filter(e => !e.resolved).length}
                </span>
              )}
              {tab.id === 'threats' && threats.filter(t => t.status === 'active').length > 0 && ()
                <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {threats.filter(t => t.status === 'active').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      {activeTab === 'overview' && metrics && ()
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Metrics Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
                    <div className={`text-3xl font-bold ${getScoreColor(securityScore)}`}>}
                      {securityScore}
                    </div>
                    <p className="text-sm text-gray-600">Overall security posture</p>
                  </div>
                  <div className="text-4xl">🔒</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Compliance Score</h3>
                    <div className={`text-3xl font-bold ${getScoreColor(complianceScore)}`}>}
                      {complianceScore}
                    </div>
                    <p className="text-sm text-gray-600">Regulatory compliance</p>
                  </div>
                  <div className="text-4xl">📋</div>
                </div>
              </div>
            </div>
            {/* Provider Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">OAuth Provider Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{metrics.totalProviders}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.activeProviders}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{metrics.inactiveProviders}</div>
                  <div className="text-sm text-gray-600">Inactive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.errorProviders}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
            </div>
            {/* Login Statistics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Logins</div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalLogins)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercentage((metrics.successfulLogins / metrics.totalLogins) * 100)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                  <div className="text-2xl font-bold text-blue-600">{metrics.averageResponseTime}ms</div>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Events */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
              <div className="space-y-3">
                {securityEvents.slice(0, 5).map((event) => ()
                  <div key={event.id} className="flex items-start">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getSeverityColor(event.severity)}`}>}
                      {event.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-900 truncate">{event.description}</div>
                      <div className="text-xs text-gray-500">{formatDate(event.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('events')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View all events →
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Summary</h3>
              <div className="space-y-3">
                {complianceStatus.map((compliance) => ()
                  <div key={compliance.framework} className="flex justify-between items-center">
                    <span className="text-sm text-gray-900">{compliance.framework}</span>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${getScoreColor(compliance.score)}`}>}
                        {compliance.score}
                      </span>
                      <span className={`ml-2 w-2 h-2 rounded-full ${
  compliance.status === 'compliant' ? 'bg-green-400' :,
  compliance.status === 'partial' ? 'bg-yellow-400' :,
  'bg-red-400'
`}></span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('compliance')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                View compliance details →
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'events' && ()
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Security Events</h2>
            <p className="text-sm text-gray-600 mt-1">OAuth security events and incidents</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {securityEvents.map((event) => ()
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.timestamp)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{event.eventType.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-gray-600">{event.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.providerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>}
                        {event.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  event.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
`}>
                        {event.resolved ? 'Resolved' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'compliance' && ()
        <div className="space-y-6">
          {complianceStatus.map((compliance) => ()
            <div key={compliance.framework} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{compliance.framework} Compliance</h3>
                <div className="flex items-center">
                  <span className={`text-lg font-bold mr-2 ${getScoreColor(compliance.score)}`}>}
                    {compliance.score}
                  </span>
                  <span className={`w-3 h-3 rounded-full ${
  compliance.status === 'compliant' ? 'bg-green-400' :,
  compliance.status === 'partial' ? 'bg-yellow-400' :,
  'bg-red-400'
`}></span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Last assessment: {formatDate(compliance.lastAssessment)}
              </div>
              {compliance.issues.length > 0 && ()
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Issues ({compliance.issues.length})</h4>
                  <div className="space-y-2">
                    {compliance.issues.map((issue) => ()
                      <div key={issue.id} className={`p-3 rounded border ${
  issue.severity === 'critical' ? 'bg-red-50 border-red-200' :,
  issue.severity === 'high' ? 'bg-orange-50 border-orange-200' :,
  issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :,
  'bg-blue-50 border-blue-200'
`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{issue.description}</div>
                            <div className="text-sm text-gray-600 mt-1">{issue.recommendation}</div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>}
                            {issue.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {activeTab === 'threats' && ()
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Threat Detection</h2>
            <p className="text-sm text-gray-600 mt-1">Active threats and security indicators</p>
          </div>
          <div className="p-6">
            {threats.length === 0 ? ()
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.414-4.414L19 4.414A2 2 0 0117.586 3H6.414A2 2 0 005 4.414L8.586 8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Threats</h3>
                <p className="text-gray-600">Your OAuth infrastructure is secure</p>
              </div>
            ) : ()
              <div className="space-y-4">
                {threats.map((threat) => ()
                  <div key={threat.threatId} className={`border rounded-lg p-4 ${
  threat.severity === 'critical' ? 'border-red-300 bg-red-50' :,
  threat.severity === 'high' ? 'border-orange-300 bg-orange-50' :,
  threat.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :,
  'border-blue-300 bg-blue-50'
`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{threat.threatType.replace()
                        /_/g,
                        ' '
                      ).toUpperCase()}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>}
                          {threat.severity}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  threat.status === 'active' ? 'bg-red-100 text-red-800' :,
  threat.status === 'mitigated' ? 'bg-green-100 text-green-800' :,
  'bg-gray-100 text-gray-800'
`}>
                          {threat.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{threat.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Source:</span>
                        <div className="font-medium">{threat.source}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Detection Time:</span>
                        <div className="font-medium">{formatDate(threat.timestamp)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Affected Providers:</span>
                        <div className="font-medium">{threat.affectedProviders.join(', ')}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Indicators:</span>
                        <div className="font-medium">{threat.indicators.length} indicators</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'audit' && ()
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Audit Logs</h2>
            <p className="text-sm text-gray-600 mt-1">OAuth system activity and user actions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => ()
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
  log.result === 'success' ? 'bg-green-100 text-green-800' :,
  log.result === 'partial' ? 'bg-yellow-100 text-yellow-800' :,
  'bg-red-100 text-red-800'
`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAuthSecurityDashboard;