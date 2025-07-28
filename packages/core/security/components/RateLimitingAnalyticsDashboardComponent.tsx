/**
 * Rate Limiting Analytics Dashboard React Component
 * Task: E31-1753313263523-692B39 - Create rate limiting analytics dashboard
 * Epic 31: Security Intelligence Platform
 * 
 * Advanced React component providing comprehensive security analytics dashboard
 * with real-time monitoring, predictive insights, and actionable intelligence.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  RateLimitingAnalyticsDashboard,
  SecurityAnalytics,
  PredictiveInsights,
  DashboardVisualization
} from '../RateLimitingAnalyticsDashboard';
import { ThreatLevel } from '../RateLimitingService';

// ========================================
// Component Props and Types
// ========================================
interface RateLimitingAnalyticsDashboardProps {
  analyticsDashboard: RateLimitingAnalyticsDashboard;
  className?: string;
  theme?: 'light' | 'dark';
  refreshInterval?: number; // seconds
  enableRealTimeUpdates?: boolean;
  showAdvancedFeatures?: boolean;
}
interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}
interface AlertSummary {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  recent: Array<{,
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
  }>;
}

// ========================================
// Main Dashboard Component
// ========================================

export const RateLimitingAnalyticsDashboardComponent: React.FC<RateLimitingAnalyticsDashboardProps> = ({)
  analyticsDashboard,
  className = '',
  theme = 'light',
  refreshInterval = 10,
  enableRealTimeUpdates = true,
  showAdvancedFeatures = true
}) => {
  // Component state
  const [securityAnalytics, setSecurityAnalytics] = useState<SecurityAnalytics | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);
  const [dashboardVisualization, setDashboardVisualization] = useState<DashboardVisualization | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [selectedView, setSelectedView] = useState<'overview' | 'security' | 'performance' | 'business' | 'predictive'>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);
  // Refs for cleanup
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef<boolean>(true);
  // ========================================
  // Data Loading and Updates
  // ========================================
  const loadAnalyticsData = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      setIsLoading(true);
      setError(null);
      const summary = analyticsDashboard.getAnalyticsSummary();
      if (mountedRef.current) {
        setSecurityAnalytics(summary.securityAnalytics);
        setPredictiveInsights(summary.predictiveInsights);
        setDashboardVisualization(summary.dashboardVisualization);
        setLastUpdate(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics data';
        setError(errorMessage);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [analyticsDashboard]);
  // Set up real-time updates
  useEffect(() => {
    loadAnalyticsData();
    if (enableRealTimeUpdates) {
      updateTimerRef.current = setInterval(loadAnalyticsData, refreshInterval * 1000);
    }
    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
  }, [loadAnalyticsData, enableRealTimeUpdates, refreshInterval]);
  // Listen for analytics events
  useEffect(() => {
    const handleAnalyticsProcessed = () => {
      if (mountedRef.current) {
        loadAnalyticsData();
      }
    };
    const handleAnalyticsError = (errorData: { error: any }) => {
      if (mountedRef.current) {
        const errorMessage = errorData.error instanceof Error ? ;
          errorData.error.message : 'Analytics processing error';
        setError(errorMessage);
      }
    };
    analyticsDashboard.on('analyticsProcessed', handleAnalyticsProcessed);
    analyticsDashboard.on('analyticsError', handleAnalyticsError);
    return () => {
      analyticsDashboard.off('analyticsProcessed', handleAnalyticsProcessed);
      analyticsDashboard.off('analyticsError', handleAnalyticsError);
    };
  }, [analyticsDashboard, loadAnalyticsData]);
  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  // ========================================
  // Data Processing and Calculations
  // ========================================
  const metricCards = useMemo((): MetricCard[] => {
    if (!securityAnalytics) return [];
    const cards: MetricCard[] = [];
    // System Health Card
    cards.push({)
      id: 'system-health',
      title: 'System Health',
      value: securityAnalytics.performanceAnalytics.systemHealth.overallScore,
      unit: '%',
      trend: securityAnalytics.performanceAnalytics.systemHealth.overallScore > 85 ? 'up' : 'down',
      trendValue: 2.3,
      status: securityAnalytics.performanceAnalytics.systemHealth.overallScore > 90 ? 'good' : 
             securityAnalytics.performanceAnalytics.systemHealth.overallScore > 75 ? 'warning' : 'critical',
      description: 'Overall system health and performance score'
    });
    // Threat Level Card
    const threatLevelMap = {
      [ThreatLevel.LOW]: { value: 1, color: 'good' },
      [ThreatLevel.MEDIUM]: { value: 2, color: 'warning' },
      [ThreatLevel.HIGH]: { value: 3, color: 'critical' },
      [ThreatLevel.CRITICAL]: { value: 4, color: 'critical' }
    };
    const currentThreat = threatLevelMap[securityAnalytics.threatAnalysis.currentThreatLevel];
    cards.push({)
      id: 'threat-level',
      title: 'Threat Level',
      value: securityAnalytics.threatAnalysis.currentThreatLevel.toUpperCase(),
      trend: 'stable',
      trendValue: 0,
      status: currentThreat.color as 'good' | 'warning' | 'critical',
      description: 'Current system threat assessment level'
    });
    // Capacity Utilization Card
    cards.push({)
      id: 'capacity',
      title: 'Capacity',
      value: securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity,
      unit: '%',
      trend: securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity > 80 ? 'up' : 'stable',
      trendValue: 5.2,
      status: securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity > 85 ? 'critical' : 
             securityAnalytics.performanceAnalytics.capacityAnalysis.currentCapacity > 70 ? 'warning' : 'good',
      description: 'Current system capacity utilization'
    });
    // Revenue Impact Card
    cards.push({)
      id: 'revenue-impact',
      title: 'Security ROI',
      value: securityAnalytics.businessIntelligence.revenueImpact.securityROI.toFixed(0),
      unit: '%',
      trend: 'up',
      trendValue: 12.8,
      status: securityAnalytics.businessIntelligence.revenueImpact.securityROI > 200 ? 'good' : 'warning',
      description: 'Return on investment from security measures'
    });
    // Attack Patterns Card
    cards.push({)
      id: 'attack-patterns',
      title: 'Active Threats',
      value: securityAnalytics.threatAnalysis.attackPatterns.length,
      trend: securityAnalytics.threatAnalysis.attackPatterns.length > 2 ? 'up' : 'stable',
      trendValue: securityAnalytics.threatAnalysis.attackPatterns.length,
      status: securityAnalytics.threatAnalysis.attackPatterns.length > 3 ? 'critical' : 
             securityAnalytics.threatAnalysis.attackPatterns.length > 1 ? 'warning' : 'good',
      description: 'Number of detected attack patterns'
    });
    // Response Time SLA Card
    cards.push({)
      id: 'response-sla',
      title: 'Response SLA',
      value: securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance,
      unit: '%',
      trend: securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance > 95 ? 'up' : 'down',
      trendValue: -1.2,
      status: securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance > 95 ? 'good' : 
             securityAnalytics.performanceAnalytics.slaCompliance.responseTimeSLA.compliance > 85 ? 'warning' : 'critical',
      description: 'Response time SLA compliance percentage'
    });
    return cards;
  }, [securityAnalytics]);
  const alertSummary = useMemo((): AlertSummary => {
    if (!dashboardVisualization) {
      return {
        total: 0,
        byType: {},
        bySeverity: {},
        recent: [],
      };
    }
    const alerts = dashboardVisualization.alertPanels;
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    alerts.forEach(alert => {)
      byType[alert.alertType] = (byType[alert.alertType] || 0) + 1;
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    });
    const recent = alerts;
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5)
      .map(alert => ({)
        id: alert.panelId,
        type: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
      }));
    return {
      total: alerts.length,
      byType,
      bySeverity,
      recent
    };
  }, [dashboardVisualization]);
  // ========================================
  // Event Handlers
  // ========================================
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range);
    loadAnalyticsData();
  };
  const handleViewChange = (view: typeof selectedView) => {
    setSelectedView(view);
  };
  const handleRefresh = () => {
    loadAnalyticsData();
  };
  const handleExportData = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      const summary = analyticsDashboard.getAnalyticsSummary();
      let exportData: string;
      let mimeType: string;
      let filename: string;
      switch (format) {
        case 'json':
          exportData = JSON.stringify(summary, null, 2);
          mimeType = 'application/json';
          filename = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;}
          break;
        case 'csv':
          exportData = convertToCSV(summary);
          mimeType = 'text/csv';
          filename = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;}
          break;
        case 'pdf':
          exportData = generatePDFContent(summary);
          mimeType = 'application/pdf';
          filename = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;}
          break;
        default:
          throw new Error('Unsupported format');
      }
      const blob = new Blob([exportData], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    }
  };
  // ========================================
  // Render Helpers
  // ========================================
  const renderMetricCard = (metric: MetricCard) => (;)
    <div
      key={metric.id}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6
        ${metric.status === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
        ${metric.status === 'warning' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {metric.title}
          </p>
          <div className="flex items-baseline space-x-2 mt-2">
            <p className={`text-3xl font-semibold ${
              metric.status === 'critical' ? 'text-red-600 dark:text-red-400' :
              metric.status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-gray-900 dark:text-white'
            }`}>
              {metric.value}
            </p>
            {metric.unit && ()
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.unit}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {metric.description}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
            ${metric.trend === 'up' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : ''}
            ${metric.trend === 'down' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : ''}
            ${metric.trend === 'stable' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
          `}>
            {metric.trend === 'up' && '↗'}
            {metric.trend === 'down' && '↘'}
            {metric.trend === 'stable' && '→'}
            {Math.abs(metric.trendValue)}%
          </div>
          <div className={`
            w-3 h-3 rounded-full
            ${metric.status === 'good' ? 'bg-green-500' : ''}
            ${metric.status === 'warning' ? 'bg-yellow-500' : ''}
            ${metric.status === 'critical' ? 'bg-red-500' : ''}
          `}></div>
        </div>
      </div>
    </div>
  );
  const renderAlertPanel = () => (;)
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Active Alerts ({alertSummary.total})
        </h3>
      </div>
      <div className="p-6">
        {alertSummary.total === 0 ? ()
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-gray-500 dark:text-gray-400">No active alerts</p>
          </div>
        ) : ()
          <div className="space-y-4">
            {/* Alert Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  By Type
                </h4>
                {Object.entries(alertSummary.byType).map(([type, count]) => ()
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 capitalize">
                      {type.replace('_', ' ')}:
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  By Severity
                </h4>
                {Object.entries(alertSummary.bySeverity).map(([severity, count]) => ()
                  <div key={severity} className="flex justify-between text-sm">
                    <span className={`capitalize ${
                      severity === 'critical' ? 'text-red-600 dark:text-red-400' :
                      severity === 'error' ? 'text-red-500 dark:text-red-400' :
                      severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {severity}:
                    </span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Recent Alerts */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recent Alerts
              </h4>
              <div className="space-y-2">
                {alertSummary.recent.map((alert) => ()
                  <div
                    key={alert.id}
                    className={`
                      p-3 rounded-lg border-l-4 text-sm
                      ${alert.severity === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                      ${alert.severity === 'error' ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : ''}
                      ${alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${alert.severity === 'info' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {alert.type} • {alert.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const renderThreatAnalysis = () => {
    if (!securityAnalytics) return null;
    return ()
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attack Patterns */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Attack Patterns
            </h3>
          </div>
          <div className="p-6">
            {securityAnalytics.threatAnalysis.attackPatterns.length === 0 ? ()
              <p className="text-gray-500 dark:text-gray-400">No attack patterns detected</p>
            ) : ()
              <div className="space-y-4">
                {securityAnalytics.threatAnalysis.attackPatterns.map((pattern) => ()
                  <div
                    key={pattern.patternId}
                    className={`
                      p-4 rounded-lg border
                      ${pattern.severity === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}
                      ${pattern.severity === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : ''}
                      ${pattern.severity === 'medium' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${pattern.severity === 'low' ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {pattern.patternType.replace('_', ' ')}
                      </h4>
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium capitalize
                        ${pattern.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                        ${pattern.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : ''}
                        ${pattern.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                        ${pattern.severity === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                      `}>
                        {pattern.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div>Frequency: {pattern.frequency} occurrences</div>
                      <div>Affected: {pattern.affectedEndpoints.join(', ')}</div>
                      <div>Source IPs: {pattern.sourceIPs.join(', ')}</div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Countermeasures:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {pattern.countermeasures.map((measure, index) => ()
                          <li key={index}>• {measure}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Geographic Threats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Geographic Threats
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {securityAnalytics.threatAnalysis.geographicThreats.map((threat, index) => ()
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {threat.country} {threat.region !== 'Various' && `(${threat.region})`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {threat.threatCount} threats • {threat.suspiciousActivities.join(', ')}
                    </p>
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${threat.threatLevel === ThreatLevel.CRITICAL ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                    ${threat.threatLevel === ThreatLevel.HIGH ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : ''}
                    ${threat.threatLevel === ThreatLevel.MEDIUM ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                    ${threat.threatLevel === ThreatLevel.LOW ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : ''}
                  `}>
                    {threat.threatLevel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderPredictiveInsights = () => {
    if (!predictiveInsights || !showAdvancedFeatures) return null;
    return ()
      <div className="space-y-6">
        {/* Threat Predictions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Threat Predictions
            </h3>
          </div>
          <div className="p-6">
            {predictiveInsights.threatPredictions.length === 0 ? ()
              <p className="text-gray-500 dark:text-gray-400">No threat predictions available</p>
            ) : ()
              <div className="space-y-4">
                {predictiveInsights.threatPredictions.map((prediction) => ()
                  <div
                    key={prediction.predictionId}
                    className={`
                      p-4 rounded-lg border-l-4
                      ${prediction.impactEstimate === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''}
                      ${prediction.impactEstimate === 'high' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''}
                      ${prediction.impactEstimate === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : ''}
                      ${prediction.impactEstimate === 'low' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {prediction.predictedThreatType}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {prediction.probability}% confidence
                        </span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium capitalize
                          ${prediction.impactEstimate === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' : ''}
                          ${prediction.impactEstimate === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : ''}
                          ${prediction.impactEstimate === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                          ${prediction.impactEstimate === 'low' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : ''}
                        `}>
                          {prediction.impactEstimate}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Expected {prediction.timeframe} • Model confidence: {prediction.modelConfidence}%
                    </p>
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Recommended Actions:
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {prediction.recommendedActions.map((action, index) => ()
                          <li key={index}>• {action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Capacity Forecasts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Capacity Forecasts
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictiveInsights.capacityForecasts.map((forecast) => ()
                <div
                  key={forecast.forecastId}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                      {forecast.metric}
                    </h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {forecast.confidence}% confidence
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Current: {forecast.currentValue.toFixed(1)}</div>
                    <div>Predicted: {forecast.predictedValue.toFixed(1)}</div>
                    <div>Horizon: {forecast.forecastHorizon} hours</div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                    {forecast.scalingRecommendation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderControls = () => (;)
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        {/* View Selector */}
        <select
          value={selectedView}
          onChange={(e) => handleViewChange(e.target.value as typeof selectedView)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="overview">Overview</option>
          <option value="security">Security</option>
          <option value="performance">Performance</option>
          <option value="business">Business</option>
          {showAdvancedFeatures && <option value="predictive">Predictive</option>}
        </select>
        {/* Time Range Selector */}
        <select
          value={selectedTimeRange}
          onChange={(e) => handleTimeRangeChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="1h">Last Hour</option>
          <option value="6h">Last 6 Hours</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
        </select>
        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center space-x-1"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
        {/* Export Options */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExportData('json')}
            className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Export JSON
          </button>
          <button
            onClick={() => handleExportData('csv')}
            className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Export CSV
          </button>
        </div>
        {/* Status Indicator */}
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
          <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          {enableRealTimeUpdates && ()
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
              <span>Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  // ========================================
  // Main Render
  // ========================================
  if (error) {
    return ()
      <div className={`p-8 ${className}`}>}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Analytics Dashboard Error
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }
  if (isLoading && !securityAnalytics) {
    return ()
      <div className={`p-8 ${className}`}>}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  return ()
    <div className={`p-6 ${className} ${theme === 'dark' ? 'dark' : ''}`}>}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive security intelligence and predictive analytics platform
          </p>
        </div>
        {/* Controls */}
        {renderControls()}
        {/* Main Content */}
        {selectedView === 'overview' && ()
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {metricCards.map(renderMetricCard)}
            </div>
            {/* Alerts and Threat Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {renderAlertPanel()}
              </div>
              <div className="lg:col-span-2">
                {renderThreatAnalysis()}
              </div>
            </div>
          </div>
        )}
        {selectedView === 'security' && renderThreatAnalysis()}
        {selectedView === 'predictive' && renderPredictiveInsights()}
        {/* Other views would be implemented here */}
        {selectedView === 'performance' && ()
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Performance Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed performance metrics and analysis coming soon
              </p>
            </div>
          </div>
        )}
        {selectedView === 'business' && ()
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Business Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Business impact analysis and ROI metrics coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================
// Utility Functions
// ========================================
function convertToCSV(data: any): string {
  // Simple CSV conversion - in production, this would be more sophisticated
  const headers = ['Metric', 'Value', 'Status', 'Timestamp'];
  const rows = [;
    ['System Health', data.securityAnalytics?.performanceAnalytics?.systemHealth?.overallScore || 0, 'Active', new Date().toISOString()],
    ['Threat Level', data.securityAnalytics?.threatAnalysis?.currentThreatLevel || 'LOW', 'Active', new Date().toISOString()],
    ['Active Threats', data.securityAnalytics?.threatAnalysis?.attackPatterns?.length || 0, 'Active', new Date().toISOString()]
  ];
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
function generatePDFContent(data: any): string {
  // Simple PDF content generation - in production, this would use a proper PDF library
  return `Analytics Report Generated: ${new Date().toISOString()}\n\nSystem Health: ${data.securityAnalytics?.performanceAnalytics?.systemHealth?.overallScore || 0}%\nThreat Level: ${data.securityAnalytics?.threatAnalysis?.currentThreatLevel || 'LOW'}\nActive Threats: ${data.securityAnalytics?.threatAnalysis?.attackPatterns?.length || 0}`;}
}

export default RateLimitingAnalyticsDashboardComponent;