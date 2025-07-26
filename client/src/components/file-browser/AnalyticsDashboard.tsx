/**
 * File Browser Analytics Dashboard
 * 
 * React component for visualizing file browser usage analytics,
 * download statistics, and developer insights.
 * 
 * Task: T-1752989144373-75 - Integrate usage analytics & download stats for developers
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';

interface DashboardMetrics {
  summary: {
    today: {
      operations: number;
      users: number;
      downloads: number;
      errorRate: number;
    };
    thisWeek: {
      operations: number;
      users: number;
      downloads: number;
      errorRate: number;
    };
    thisMonth: {
      operations: number;
      users: number;
      downloads: number;
      errorRate: number;
    };
  };
  topOperations: Record<string, number>;
  topFileTypes: Record<string, number>;
  performanceMetrics: {
    averageLoadTime: number;
    averageOperationTime: number;
  };
  searchMetrics: {
    totalSearches: number;
    uniqueSearchTerms: number;
    averageResultsClicked: number;
  };
  generatedAt: string;
}

interface DeveloperInsights {
  systemHealth: {
    overallScore: number;
    reliability: number;
    performance: number;
    usability: number;
  };
  recommendations: Array<{
    category: 'performance' | 'usability' | 'features' | 'security';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
    metrics: Record<string, number>;
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    message: string;
    timestamp: string;
    affectedUsers: number;
    suggestedAction: string;
  }>;
  trends: {
    usageGrowth: number;
    errorRateChange: number;
    performanceChange: number;
    userSatisfactionTrend: number;
  };
}

interface AnalyticsDashboardProps {
  className?: string;
  showInsights?: boolean;
}

const REFRESH_INTERVAL = 300000; // 5 minutes

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  showInsights = false
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<DeveloperInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'performance' | 'insights'>('overview');

  // Check if user has admin privileges
  const hasAdminAccess = useMemo(() => {
    return user && user.roles?.includes('admin');
  }, [user]);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/file-browser/analytics/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const result = await response.json();
      setDashboardData(result.data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    }
  };

  // Fetch developer insights
  const fetchInsights = async () => {
    if (!hasAdminAccess || !showInsights) return;

    try {
      const response = await fetch('/api/file-browser/analytics/insights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const result = await response.json();
      setInsights(result.data);
    } catch (err) {
      console.warn('Failed to load developer insights:', err);
    }
  };

  // Initial data load
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      await Promise.all([
        fetchDashboardData(),
        fetchInsights()
      ]);

      setIsLoading(false);
    };

    loadData();
  }, [isAuthenticated, hasAdminAccess, showInsights]);

  // Set up refresh interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchInsights();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, hasAdminAccess, showInsights]);

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const getHealthColor = (score: number): string => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
    case 'critical': return '#dc2626';
    case 'warning': return '#d97706';
    case 'info': return '#2563eb';
    default: return '#6b7280';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={`analytics-dashboard ${className}`} style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to view analytics dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`analytics-dashboard ${className}`} style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading analytics dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`analytics-dashboard ${className}`} style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
        <p>Error: {error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchDashboardData();
            fetchInsights();
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`analytics-dashboard ${className}`} style={{ padding: '20px', textAlign: 'center' }}>
        <p>No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard ${className}`} style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '15px'
      }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>File Browser Analytics</h2>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'operations', label: 'Operations' },
          { id: 'performance', label: 'Performance' },
          ...(hasAdminAccess && showInsights ? [{ id: 'insights', label: 'Insights' }] : [])
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'overview' | 'operations' | 'performance' | 'insights')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '600' : '400'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginBottom: '30px' 
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Today's Operations
              </h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {formatNumber(dashboardData.summary.today.operations)}
              </p>
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                {dashboardData.summary.today.users} unique users
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Downloads Today
              </h3>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {formatNumber(dashboardData.summary.today.downloads)}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Error Rate
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700', 
                color: dashboardData.summary.today.errorRate > 5 ? '#ef4444' : '#22c55e' 
              }}>
                {formatPercentage(dashboardData.summary.today.errorRate)}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                Avg Load Time
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700', 
                color: dashboardData.performanceMetrics.averageLoadTime > 2000 ? '#ef4444' : '#22c55e' 
              }}>
                {formatTime(dashboardData.performanceMetrics.averageLoadTime)}
              </p>
            </div>
          </div>

          {/* Week vs Month Comparison */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '20px', 
            marginBottom: '30px' 
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                This Week
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Operations</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {formatNumber(dashboardData.summary.thisWeek.operations)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Users</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {formatNumber(dashboardData.summary.thisWeek.users)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Downloads</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {formatNumber(dashboardData.summary.thisWeek.downloads)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Error Rate</p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: dashboardData.summary.thisWeek.errorRate > 5 ? '#ef4444' : '#22c55e' 
                  }}>
                    {formatPercentage(dashboardData.summary.thisWeek.errorRate)}
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                This Month
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Operations</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {formatNumber(dashboardData.summary.thisMonth.operations)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Users</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {formatNumber(dashboardData.summary.thisMonth.users)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Downloads</p>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {formatNumber(dashboardData.summary.thisMonth.downloads)}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Error Rate</p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '18px', 
                    fontWeight: '600',
                    color: dashboardData.summary.thisMonth.errorRate > 5 ? '#ef4444' : '#22c55e' 
                  }}>
                    {formatPercentage(dashboardData.summary.thisMonth.errorRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === 'operations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Most Used Operations
            </h3>
            {Object.entries(dashboardData.topOperations)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([operation, count]) => (
                <div key={operation} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151', textTransform: 'capitalize' }}>
                    {operation.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {formatNumber(count)}
                  </span>
                </div>
              ))}
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              Popular File Types
            </h3>
            {Object.entries(dashboardData.topFileTypes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 8)
              .map(([fileType, count]) => (
                <div key={fileType} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151', textTransform: 'uppercase' }}>
                    .{fileType}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                    {formatNumber(count)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Load Time Metrics
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Average Load Time</p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: dashboardData.performanceMetrics.averageLoadTime > 2000 ? '#ef4444' : '#22c55e' 
                }}>
                  {formatTime(dashboardData.performanceMetrics.averageLoadTime)}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Average Operation Time</p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: dashboardData.performanceMetrics.averageOperationTime > 1000 ? '#ef4444' : '#22c55e' 
                }}>
                  {formatTime(dashboardData.performanceMetrics.averageOperationTime)}
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Search Analytics
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Total Searches</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                  {formatNumber(dashboardData.searchMetrics.totalSearches)}
                </p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Unique Search Terms</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  {formatNumber(dashboardData.searchMetrics.uniqueSearchTerms)}
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#6b7280' }}>Avg Results Clicked</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                  {dashboardData.searchMetrics.averageResultsClicked.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && hasAdminAccess && insights && (
        <div>
          {/* System Health Score */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
              System Health Score
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { label: 'Overall', score: insights.systemHealth.overallScore },
                { label: 'Reliability', score: insights.systemHealth.reliability },
                { label: 'Performance', score: insights.systemHealth.performance },
                { label: 'Usability', score: insights.systemHealth.usability }
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: getHealthColor(item.score),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: '700'
                  }}>
                    {item.score}
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {insights.alerts.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Active Alerts
              </h3>
              {insights.alerts.map((alert, index) => (
                <div key={index} style={{
                  padding: '12px',
                  margin: '8px 0',
                  border: `1px solid ${getSeverityColor(alert.severity)}`,
                  borderRadius: '6px',
                  backgroundColor: `${getSeverityColor(alert.severity)}10`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      color: getSeverityColor(alert.severity),
                      textTransform: 'uppercase'
                    }}>
                      {alert.severity} • {alert.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {alert.affectedUsers} users affected
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#374151' }}>
                    {alert.message}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    <strong>Suggested Action:</strong> {alert.suggestedAction}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Recommendations
              </h3>
              {insights.recommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: '15px',
                  margin: '10px 0',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {rec.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px',
                        borderRadius: '12px',
                        backgroundColor: getPriorityColor(rec.priority),
                        color: 'white',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {rec.priority}
                      </span>
                      <span style={{ 
                        fontSize: '10px', 
                        padding: '2px 6px',
                        borderRadius: '12px',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        fontWeight: '500',
                        textTransform: 'uppercase'
                      }}>
                        {rec.effort} effort
                      </span>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>
                    {rec.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    <strong>Impact:</strong> {rec.impact}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;