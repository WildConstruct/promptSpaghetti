/**
 * API Management Dashboard - Epic 17.4.4
 * 
 * Comprehensive administrative interface for API key lifecycle management.
 * Provides enterprise-grade features for system administrators to monitor,
 * control, and analyze API usage across the entire platform.
 * 
 * Task: E17-1753114397216-ADC6B1 - Design management interfaces
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

// TypeScript interfaces for API management data structures
interface GlobalApiKeyStats {
  totalKeys: number;
  activeKeys: number;
  expiredKeys: number;
  revokedKeys: number;
  suspendedKeys: number;
  keysUsedLast24Hours: number;
  keysUsedLast7Days: number;
  keysUsedLast30Days: number;
  topScopes: Array<{
    scope: string;
    count: number;
    percentage: number;
  }>;
  averageKeyAge: number;
  keysByEnvironment: Record<string, number>;
  apiCallsLast24Hours: number;
  apiCallsLast7Days: number;
  totalApiCalls: number;
  averageCallsPerKey: number;
  errorRate: number;
  rateLimitViolations: number;
}

interface ApiKeyDetail {
  keyId: string;
  userId: string;
  userName: string;
  userEmail: string;
  keyPrefix: string;
  name: string;
  description?: string;
  scopes: string[];
  status: 'active' | 'revoked' | 'expired' | 'suspended';
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  ipWhitelist?: string[];
  metadata: {
    createdBy: string;
    environment: string;
    rotationCount: number;
    totalCalls: number;
    lastMonth: number;
    errorCount: number;
    revokedBy?: string;
    revokedAt?: Date;
    revocationReason?: string;
  };
  recentActivity: Array<{
    timestamp: Date;
    action: 'call' | 'error' | 'rate_limit' | 'creation' | 'rotation' | 'revocation';
    details: string;
    ipAddress?: string;
    endpoint?: string;
  }>;
}

interface UsageMetrics {
  keyId: string;
  callsLast1Hour: number;
  callsLast24Hours: number;
  callsLast7Days: number;
  callsLast30Days: number;
  errorRate: number;
  averageResponseTime: number;
  rateLimitHits: number;
  topEndpoints: Array<{
    endpoint: string;
    calls: number;
    errorRate: number;
  }>;
}

interface RateLimitConfiguration {
  keyId: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  windowSize: number;
}

export const ApiManagementDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'analytics' | 'monitoring' | 'configuration'>('overview');
  
  // State for overview data
  const [globalStats, setGlobalStats] = useState<GlobalApiKeyStats | null>(null);
  
  // State for keys management
  const [apiKeys, setApiKeys] = useState<ApiKeyDetail[]>([]);
  const [selectedKey, setSelectedKey] = useState<ApiKeyDetail | null>(null);
  const [keyFilter, setKeyFilter] = useState<'all' | 'active' | 'expired' | 'revoked' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for analytics
  const [usageMetrics, setUsageMetrics] = useState<Record<string, UsageMetrics>>({});
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  // State for monitoring
  const [realTimeAlerts, setRealTimeAlerts] = useState<Array<{
    id: string;
    type: 'rate_limit' | 'error_spike' | 'unusual_activity' | 'security_threat';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    keyId?: string;
    resolved: boolean;
  }>>([]);
  
  // State for configuration
  const [bulkOperationMode, setBulkOperationMode] = useState<'revoke' | 'suspend' | 'rate_limit' | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [rateLimitConfig, setRateLimitConfig] = useState<RateLimitConfiguration | null>(null);

  // Check if user has admin privileges
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');

  useEffect(() => {
    if (user && isAdmin) {
      fetchGlobalStats();
      fetchApiKeys();
      fetchUsageMetrics();
      fetchRealTimeAlerts();
      
      // Set up real-time updates
      const interval = setInterval(() => {
        fetchGlobalStats();
        fetchRealTimeAlerts();
      }, 30000); // Update every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  const fetchGlobalStats = async () => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch global statistics');
      }

      const data = await response.json();
      setGlobalStats(data.globalStatistics);
    } catch (error) {
      console.error('Error fetching global stats:', error);
      setError('Failed to load global statistics');
    }
  };

  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data.apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageMetrics = async () => {
    try {
      const response = await fetch(`/api/auth/api-keys/admin/metrics?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsageMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching usage metrics:', error);
    }
  };

  const fetchRealTimeAlerts = async () => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRealTimeAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const adminRevokeKey = async (keyId: string, reason: string) => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ keyId, reason })
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      // Refresh data
      await fetchApiKeys();
      await fetchGlobalStats();
      setSelectedKey(null);
    } catch (error) {
      console.error('Error revoking API key:', error);
      setError('Failed to revoke API key');
    }
  };

  const suspendKey = async (keyId: string, reason: string, duration?: string) => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/suspend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ keyId, reason, duration })
      });

      if (!response.ok) {
        throw new Error('Failed to suspend API key');
      }

      await fetchApiKeys();
      await fetchGlobalStats();
    } catch (error) {
      console.error('Error suspending API key:', error);
      setError('Failed to suspend API key');
    }
  };

  const updateRateLimits = async (keyId: string, rateLimits: RateLimitConfiguration) => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/rate-limits', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ keyId, rateLimits })
      });

      if (!response.ok) {
        throw new Error('Failed to update rate limits');
      }

      await fetchApiKeys();
    } catch (error) {
      console.error('Error updating rate limits:', error);
      setError('Failed to update rate limits');
    }
  };

  const performBulkOperation = async (operation: string, keyIds: string[], parameters: any) => {
    try {
      const response = await fetch('/api/auth/api-keys/admin/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ operation, keyIds, parameters })
      });

      if (!response.ok) {
        throw new Error(`Failed to perform bulk ${operation}`);
      }

      await fetchApiKeys();
      await fetchGlobalStats();
      setSelectedKeys([]);
      setBulkOperationMode(null);
    } catch (error) {
      console.error(`Error performing bulk ${operation}:`, error);
      setError(`Failed to perform bulk ${operation}`);
    }
  };

  const getFilteredKeys = () => {
    let filtered = apiKeys;
    
    if (keyFilter !== 'all') {
      filtered = filtered.filter(key => key.status === keyFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(key =>
        key.name.toLowerCase().includes(query) ||
        key.userEmail.toLowerCase().includes(query) ||
        key.keyPrefix.toLowerCase().includes(query) ||
        key.scopes.some(scope => scope.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case 'critical': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-yellow-100 text-yellow-800';
    case 'revoked': return 'bg-red-100 text-red-800';
    case 'suspended': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Administrator privileges required to access API Management</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600">Manage API keys, monitor usage, and configure system-wide settings</p>
        </div>
        <div className="flex space-x-3">
          {selectedKeys.length > 0 && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">{selectedKeys.length} keys selected</span>
              <button
                onClick={() => setBulkOperationMode('revoke')}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Bulk Revoke
              </button>
              <button
                onClick={() => setBulkOperationMode('suspend')}
                className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
              >
                Bulk Suspend
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'keys', label: 'API Keys', icon: '🔑' },
            { key: 'analytics', label: 'Analytics', icon: '📈' },
            { key: 'monitoring', label: 'Monitoring', icon: '👁️' },
            { key: 'configuration', label: 'Configuration', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-700">
            <span className="mr-2">❌</span>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && globalStats && (
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">🔑</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total API Keys</p>
                  <p className="text-2xl font-semibold text-gray-900">{globalStats.totalKeys.toLocaleString()}</p>
                  <p className="text-sm text-green-600">{globalStats.activeKeys} active</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">📞</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">API Calls Today</p>
                  <p className="text-2xl font-semibold text-gray-900">{globalStats.apiCallsLast24Hours.toLocaleString()}</p>
                  <p className="text-sm text-blue-600">Avg: {Math.round(globalStats.averageCallsPerKey)} per key</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⚡</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Error Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{(globalStats.errorRate * 100).toFixed(2)}%</p>
                  <p className="text-sm text-orange-600">{globalStats.rateLimitViolations} rate limit hits</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⏰</div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Avg Key Age</p>
                  <p className="text-2xl font-semibold text-gray-900">{Math.round(globalStats.averageKeyAge)}</p>
                  <p className="text-sm text-gray-600">days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Scopes Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Scopes</h3>
            <div className="space-y-3">
              {globalStats.topScopes.map((scopeData, index) => (
                <div key={scopeData.scope} className="flex items-center">
                  <div className="w-16 text-sm font-medium text-gray-500">#{index + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-gray-900">{scopeData.scope}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{scopeData.count} keys</span>
                        <span className="text-sm font-medium text-blue-600">
                          {scopeData.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scopeData.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Status Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Active
                  </span>
                  <span className="font-medium">{globalStats.activeKeys}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    Expired
                  </span>
                  <span className="font-medium">{globalStats.expiredKeys}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    Revoked
                  </span>
                  <span className="font-medium">{globalStats.revokedKeys}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    Suspended
                  </span>
                  <span className="font-medium">{globalStats.suspendedKeys || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Keys Used (24h)</span>
                  <span className="font-medium">{globalStats.keysUsedLast24Hours}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Keys Used (7d)</span>
                  <span className="font-medium">{globalStats.keysUsedLast7Days}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Keys Used (30d)</span>
                  <span className="font-medium">{globalStats.keysUsedLast30Days}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span>Total API Calls</span>
                  <span className="font-medium">{globalStats.totalApiCalls.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'keys' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
                <select
                  value={keyFilter}
                  onChange={(e) => setKeyFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Keys</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="revoked">Revoked</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keys, users, or scopes..."
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {getFilteredKeys().length} of {apiKeys.length} keys
            </div>
          </div>

          {/* API Keys List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedKeys.length === getFilteredKeys().length && getFilteredKeys().length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKeys(getFilteredKeys().map(key => key.keyId));
                          } else {
                            setSelectedKeys([]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredKeys().map((key) => (
                    <tr key={key.keyId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedKeys.includes(key.keyId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedKeys([...selectedKeys, key.keyId]);
                            } else {
                              setSelectedKeys(selectedKeys.filter(id => id !== key.keyId));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{key.name}</div>
                          <div className="text-sm text-gray-500 font-mono">{key.keyPrefix}...</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {key.scopes.slice(0, 3).map((scope) => (
                              <span
                                key={scope}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {scope}
                              </span>
                            ))}
                            {key.scopes.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{key.scopes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{key.userName}</div>
                          <div className="text-sm text-gray-500">{key.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(key.status)}`}>
                          {key.status.toUpperCase()}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {key.expiresAt && new Date(key.expiresAt) < new Date() ? 'Expired' : 
                            key.expiresAt ? `Expires ${new Date(key.expiresAt).toLocaleDateString()}` : 'No expiry'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Total: {key.metadata.totalCalls.toLocaleString()}</div>
                        <div>This month: {key.metadata.lastMonth.toLocaleString()}</div>
                        <div>Last used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedKey(key)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          {key.status === 'active' && (
                            <>
                              <button
                                onClick={() => suspendKey(key.keyId, 'Admin suspension')}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => adminRevokeKey(key.keyId, 'Admin revocation')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Real-time Alerts */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Real-time Security Alerts</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                realTimeAlerts.filter(alert => !alert.resolved).length === 0
                  ? 'bg-green-100 text-green-800'
                  : realTimeAlerts.some(alert => alert.severity === 'critical' && !alert.resolved)
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
              }`}>
                {realTimeAlerts.filter(alert => !alert.resolved).length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {realTimeAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-green-500 text-4xl mb-2">✅</div>
                  <div className="text-gray-600">No active security alerts</div>
                  <div className="text-sm text-gray-500">System is operating normally</div>
                </div>
              ) : (
                realTimeAlerts
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} ${
                        alert.resolved ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">
                              {alert.timestamp.toLocaleString()}
                            </span>
                            {alert.resolved && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                RESOLVED
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            <p className="font-medium text-gray-900">{alert.message}</p>
                            {alert.keyId && (
                              <p className="text-sm text-gray-600">
                                Related API Key: {alert.keyId}
                              </p>
                            )}
                          </div>
                        </div>
                        {!alert.resolved && (
                          <div className="flex items-center space-x-2">
                            <button
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                              onClick={() => {
                                // Mark alert as resolved
                                setRealTimeAlerts(alerts =>
                                  alerts.map(a => a.id === alert.id ? { ...a, resolved: true } : a)
                                );
                              }}
                            >
                              Resolve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Key Detail Modal */}
      {selectedKey && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                API Key Details: {selectedKey.name}
              </h3>
              <button
                onClick={() => setSelectedKey(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Key Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Key ID:</span>
                      <span className="text-sm font-mono text-gray-900">{selectedKey.keyId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Prefix:</span>
                      <span className="text-sm font-mono text-gray-900">{selectedKey.keyPrefix}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedKey.status)}`}>
                        {selectedKey.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm text-gray-900">{selectedKey.createdAt.toLocaleString()}</span>
                    </div>
                    {selectedKey.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Expires:</span>
                        <span className="text-sm text-gray-900">{selectedKey.expiresAt.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Used:</span>
                      <span className="text-sm text-gray-900">
                        {selectedKey.lastUsedAt ? selectedKey.lastUsedAt.toLocaleString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">User ID:</span>
                      <span className="text-sm text-gray-900">{selectedKey.userId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Name:</span>
                      <span className="text-sm text-gray-900">{selectedKey.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Email:</span>
                      <span className="text-sm text-gray-900">{selectedKey.userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Rate Limits */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Rate Limits</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Per Minute:</span>
                      <span className="text-sm text-gray-900">{selectedKey.rateLimits.requestsPerMinute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Per Hour:</span>
                      <span className="text-sm text-gray-900">{selectedKey.rateLimits.requestsPerHour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Per Day:</span>
                      <span className="text-sm text-gray-900">{selectedKey.rateLimits.requestsPerDay}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage and Activity */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Usage Statistics</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Total Calls:</span>
                      <span className="text-sm text-gray-900">{selectedKey.metadata.totalCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">This Month:</span>
                      <span className="text-sm text-gray-900">{selectedKey.metadata.lastMonth.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Error Count:</span>
                      <span className="text-sm text-gray-900">{selectedKey.metadata.errorCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Rotations:</span>
                      <span className="text-sm text-gray-900">{selectedKey.metadata.rotationCount}</span>
                    </div>
                  </div>
                </div>

                {/* Scopes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Scopes</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedKey.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* IP Whitelist */}
                {selectedKey.ipWhitelist && selectedKey.ipWhitelist.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">IP Whitelist</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-1">
                        {selectedKey.ipWhitelist.map((ip, index) => (
                          <div key={index} className="text-sm font-mono text-gray-900">{ip}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedKey.recentActivity.slice(0, 10).map((activity, index) => (
                        <div key={index} className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">{activity.timestamp.toLocaleString()}</span>
                            <span className={`font-medium ${
                              activity.action === 'error' ? 'text-red-600' :
                                activity.action === 'rate_limit' ? 'text-orange-600' :
                                  'text-blue-600'
                            }`}>
                              {activity.action.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-gray-700">{activity.details}</div>
                          {activity.ipAddress && (
                            <div className="text-gray-500">IP: {activity.ipAddress}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedKey.status === 'active' && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => suspendKey(selectedKey.keyId, 'Admin suspension from detail view')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Suspend Key
                </button>
                <button
                  onClick={() => adminRevokeKey(selectedKey.keyId, 'Admin revocation from detail view')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Revoke Key
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManagementDashboard;