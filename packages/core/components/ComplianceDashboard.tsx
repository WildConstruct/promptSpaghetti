/**
 * Compliance Baseline Dashboard Component
 * Provides comprehensive compliance monitoring with baseline tracking for directors
 */

import React, { useState, useEffect } from 'react';
import { enhancedComplianceMonitor, EnhancedComplianceDashboard } from '../services/ComplianceMonitor';
import { complianceBaselineTracker, BaselineTrend } from '../services/ComplianceBaselineTracker';
import { complianceHistoricalAnalyzer, ComplianceTrendReport } from '../services/ComplianceHistoricalAnalyzer';

interface ComplianceDashboardProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  className = '',
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}) => {
  const [dashboardData, setDashboardData] = useState<EnhancedComplianceDashboard | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [frameworkTrends, setFrameworkTrends] = useState<Record<string, ComplianceTrendReport | null>>({});

  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    if (selectedFramework !== 'overview') {
      loadFrameworkTrends(selectedFramework);
    }
  }, [selectedFramework, selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await enhancedComplianceMonitor.generateEnhancedDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadFrameworkTrends = async (framework: string) => {
    try {
      const trends = await enhancedComplianceMonitor.getFrameworkTrendAnalysis(framework, selectedTimeRange);
      setFrameworkTrends(prev => ({ ...prev, [framework]: trends }));
    } catch (err) {
      console.error('Failed to load framework trends:', err);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
    case 'healthy':
    case 'ready':
    case 'compliant':
      return 'text-green-600 bg-green-100';
    case 'warning':
    case 'needs_preparation':
      return 'text-yellow-600 bg-yellow-100';
    case 'critical':
    case 'not_ready':
    case 'non_compliant':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`compliance-dashboard ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`compliance-dashboard ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Dashboard Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <button
                  onClick={loadDashboardData}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  return (
    <div className={`compliance-dashboard ${className} space-y-6`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
          <p className="text-sm text-gray-600">
            Real-time compliance monitoring with baseline tracking
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overall Health</p>
              <p className={`text-2xl font-bold ${getHealthScoreColor(dashboardData.overallScore)}`}>
                {dashboardData.overallScore}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Baseline Health</p>
              <p className={`text-2xl font-bold ${getHealthScoreColor(dashboardData.baselineTracking.overallBaselineHealth)}`}>
                {dashboardData.baselineTracking.overallBaselineHealth}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Baselines Met</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.baselineTracking.baselinesMet} / {dashboardData.baselineTracking.totalBaselines}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">🚨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className={`text-2xl font-bold ${dashboardData.baselineTracking.criticalDeviations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {dashboardData.baselineTracking.criticalDeviations}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'GDPR', 'SOC2', 'MPA', 'INTERNAL'].map((framework) => (
            <button
              key={framework}
              onClick={() => setSelectedFramework(framework)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                selectedFramework === framework
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {framework === 'overview' ? 'Overview' : framework}
            </button>
          ))}
        </nav>
      </div>

      {/* Content based on selected framework */}
      {selectedFramework === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Framework Health */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Framework Health</h3>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(dashboardData.baselineTracking.frameworkBaselines).map(([framework, data]) => (
                <div key={framework} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 w-20">{framework}</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.status)}`}>
                      {data.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {data.baselinesMet}/{data.totalBaselines} baselines
                    </span>
                    <span className={`font-semibold ${getHealthScoreColor(data.averagePerformance)}`}>
                      {data.averagePerformance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Trend Analysis</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Improving Metrics</span>
                <span className="text-green-600 font-semibold">
                  ↗️ {dashboardData.historicalTrends.improvingMetrics}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stable Metrics</span>
                <span className="text-blue-600 font-semibold">
                  ➡️ {dashboardData.historicalTrends.stableMetrics}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Declining Metrics</span>
                <span className="text-red-600 font-semibold">
                  ↘️ {dashboardData.historicalTrends.decliningMetrics}
                </span>
              </div>
            </div>
          </div>

          {/* Forecast Alerts */}
          {dashboardData.historicalTrends.forecastAlerts.length > 0 && (
            <div className="bg-white rounded-lg shadow lg:col-span-2">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Forecast Alerts</h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData.historicalTrends.forecastAlerts.map((alert, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    alert.risk === 'high' ? 'bg-red-50 border-red-200' :
                      alert.risk === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{alert.metric} ({alert.framework})</p>
                        <p className="text-sm text-gray-600 mt-1">{alert.predictedIssue}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.risk === 'high' ? 'text-red-800 bg-red-100' :
                            alert.risk === 'medium' ? 'text-yellow-800 bg-yellow-100' :
                              'text-blue-800 bg-blue-100'
                        }`}>
                          {alert.risk} risk
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{alert.timeframe}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Readiness */}
          <div className="bg-white rounded-lg shadow lg:col-span-2">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Audit Readiness</h3>
              <p className="text-sm text-gray-600 mt-1">
                Overall readiness: {dashboardData.auditReadiness.overallReadiness}%
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(dashboardData.auditReadiness.frameworkReadiness).map(([framework, readiness]) => (
                  <div key={framework} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{framework}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(readiness.status)}`}>
                        {readiness.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Readiness Score</span>
                      <span className={`font-semibold ${getHealthScoreColor(readiness.score)}`}>
                        {readiness.score}%
                      </span>
                    </div>
                    {readiness.nextAuditDue && (
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Next Audit</span>
                        <span className="text-sm text-gray-900">
                          {formatDate(new Date(readiness.nextAuditDue))}
                        </span>
                      </div>
                    )}
                    {readiness.missingEvidence.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-1">Missing Evidence:</p>
                        <div className="flex flex-wrap gap-1">
                          {readiness.missingEvidence.slice(0, 2).map((evidence, idx) => (
                            <span key={idx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {evidence}
                            </span>
                          ))}
                          {readiness.missingEvidence.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{readiness.missingEvidence.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Framework-specific view */
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{selectedFramework} Detailed Analysis</h3>
          </div>
          <div className="p-6">
            {frameworkTrends[selectedFramework] ? (
              <div className="space-y-6">
                {/* Framework Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {frameworkTrends[selectedFramework]!.summary.averageCompliance}%
                    </p>
                    <p className="text-sm text-gray-600">Average Compliance</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {frameworkTrends[selectedFramework]!.summary.totalDataPoints}
                    </p>
                    <p className="text-sm text-gray-600">Data Points</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className={`text-2xl font-bold ${
                      frameworkTrends[selectedFramework]!.summary.improvementTrend === 'positive' ? 'text-green-600' :
                      frameworkTrends[selectedFramework]!.summary.improvementTrend === 'negative' ? 'text-red-600' :
                        'text-blue-600'
                    }`}>
                      {frameworkTrends[selectedFramework]!.summary.improvementTrend === 'positive' ? '↗️' :
                       frameworkTrends[selectedFramework]!.summary.improvementTrend === 'negative' ? '↘️' : '➡️'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {frameworkTrends[selectedFramework]!.summary.improvementTrend.charAt(0).toUpperCase() + 
                       frameworkTrends[selectedFramework]!.summary.improvementTrend.slice(1)} Trend
                    </p>
                  </div>
                </div>

                {/* Metrics Performance */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Metrics Performance</h4>
                  <div className="space-y-3">
                    {frameworkTrends[selectedFramework]!.metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{metric.name}</p>
                          <p className="text-sm text-gray-600">
                            Current: {metric.currentValue}% | Average: {metric.historicalAverage}%
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg ${
                              metric.trendDirection === 'up' ? 'text-green-600' :
                                metric.trendDirection === 'down' ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {metric.trendDirection === 'up' ? '↗️' :
                                metric.trendDirection === 'down' ? '↘️' : '➡️'}
                            </span>
                            <span className="text-sm text-gray-600">
                              {metric.complianceRate}% compliant
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading {selectedFramework} analysis...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceDashboard;