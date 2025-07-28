/**
 * Quality Dashboard - Epic 18
 * 
 * Comprehensive quality monitoring dashboard displaying real-time quality metrics,
 * trends, alerts, and recommendations across all quality dimensions including
 * test coverage, code quality, performance, security, documentation, and build health.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  // CardHeader, // Commented out unused import
  // CardTitle // Commented out unused import
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import { QualityMetricsOverview } from './QualityMetricsOverview';
import { QualityTrendsChart } from './QualityTrendsChart';
import { QualityAlertsPanel } from './QualityAlertsPanel';
import { QualityRecommendations } from './QualityRecommendations';
import { TestCoverageChart } from './TestCoverageChart';
import { CodeQualityMetrics } from './CodeQualityMetrics';
import { PerformanceMetrics } from './PerformanceMetrics';
import { SecurityMetrics } from './SecurityMetrics';
import { DocumentationMetrics } from './DocumentationMetrics';
import { BuildHealthMetrics } from './BuildHealthMetrics';
import { useQualityMetrics } from '../../hooks/useQualityMetrics';

// =============================================================================
// Quality Dashboard Component
// =============================================================================

export interface QualityDashboardProps {
  refreshInterval?: number; // milliseconds,
  compact?: boolean;
  className?: string;
}
export const QualityDashboard: React.FC<QualityDashboardProps> = ({)
  refreshInterval = 60000, // 1 minute default
  compact = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Use custom hook for quality metrics
  const {
    metrics,
    trends,
    alerts,
    recommendations,
    isLoading,
    error,
    refreshMetrics
  } = useQualityMetrics({ refreshInterval: autoRefresh ? refreshInterval : 0 });
  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshMetrics();
      setLastRefresh(new Date());
    } catch (error) {
  console.error('Failed to refresh quality metrics:', error);
} finally {
      setIsRefreshing(false);
  }, [refreshMetrics]);
  // Get overall status styling
  const getStatusColor = (status: string) => {
  switch (status) {
  case 'excellent': return 'text-green-600 bg-green-50';
  case 'good': return 'text-blue-600 bg-blue-50';
  case 'fair': return 'text-yellow-600 bg-yellow-50';
  case 'poor': return 'text-orange-600 bg-orange-50';
  case 'critical': return 'text-red-600 bg-red-50';
  default: return 'text-gray-600 bg-gray-50';
};
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade === 'D') return 'text-orange-600';
    return 'text-red-600';
  };
  const getTrendIcon = (direction: 'improving' | 'stable' | 'degrading') => {
  switch (direction) {
  case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
  case 'degrading': return <TrendingDown className="w-4 h-4 text-red-500" />;
  default: return <TrendingUp className="w-4 h-4 text-gray-500" />;
};
  // Loading state
  if (isLoading && !metrics) {
    return;
      <div className={`quality-dashboard ${className} p-6`}>}
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading quality metrics...</span>
        </div>
      </div>
    );
  // Error state
  if (error && !metrics) {
    return;
      <div className={`quality-dashboard ${className} p-6`}>}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h3>Failed to load quality metrics</h3>
            <p className="text-sm mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </Alert>
      </div>
    );
  // No data state
  if (!metrics) {
    return;
      <div className={`quality-dashboard ${className} p-6`}>}
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Quality Metrics Available
              </h3>
              <p className="text-gray-500 mb-4">
                Quality metrics collection may be disabled or not yet initialized.
              </p>
              <Button onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />}
                Check Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  const activeAlerts = alerts?.filter(alert => alert.status === 'active') || [];
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highPriorityRecommendations = recommendations?.filter(rec => rec.priority === 'high' || rec.priority === 'critical') || [];
  return;
    <div className={`quality-dashboard ${className}`}>}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quality Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor code quality, performance, security, and overall system health
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Auto-refresh toggle */}
          <div className="flex items-center space-x-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm text-gray-600">Auto-refresh</span>
          </div>
          {/* Last refresh info */}
          <div className="text-sm text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          {/* Manual refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />}
            Refresh
          </Button>
        </div>
      </div>
      {/* Overall Status Bar */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getGradeColor(metrics.overall.grade)}`}>}
                    {metrics.overall.grade}
                  </div>
                  <div className="text-sm text-gray-600">Grade</div>
                </div>
                <div className="h-12 border-l border-gray-300"></div>
                {/* Score and Status */}
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {metrics.overall.score}/100
                    </span>
                    <Badge className={getStatusColor(metrics.overall.status)}>
                      {metrics.overall.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Overall Quality Score
                  </div>
                </div>
                {/* Improvement indicator */}
                {metrics.overall.improvement !== 0 && ()
                  <>
                    <div className="h-12 border-l border-gray-300"></div>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(metrics.overall.improvement > 0 ? 'improving' : 'degrading')}
                      <span className={`text-sm font-medium ${
  metrics.overall.improvement > 0 ? 'text-green-600' : 'text-red-600',
}`}>
                        {Math.abs(metrics.overall.improvement)}% {metrics.overall.improvement > 0 ? 'improved' : 'declined'}
                      </span>
                    </div>
                  </>
                )}
              </div>
              {/* Critical alerts indicator */}
              {criticalAlerts.length > 0 && ()
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <Badge variant="destructive">
                    {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Critical alerts banner */}
      {criticalAlerts.length > 0 && ()
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <div>
              <h3>Critical Quality Issues Detected</h3>
              <p className="text-sm mt-1">
                {criticalAlerts.length} critical issue{criticalAlerts.length !== 1 ? 's' : ''} require{criticalAlerts.length === 1 ? 's' : ''} immediate attention.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setActiveTab('alerts')}
              >
                View Alerts
              </Button>
            </div>
          </Alert>
        </div>
      )}
      {/* Main Dashboard Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coverage" className="relative">
            Coverage
            {metrics.testCoverage.overall.percentage < 80 && ()
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="quality">Code Quality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security" className="relative">
            Security
            {metrics.security.vulnerabilities.critical > 0 && ()
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
          <TabsTrigger value="builds">Build Health</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QualityMetricsOverview metrics={metrics} compact={compact} />
            <QualityTrendsChart trends={trends} compact={compact} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QualityAlertsPanel 
              alerts={activeAlerts} 
              onAlertAction={(alertId, action) => {
  console.log('Alert action:', alertId, action);
}}
              compact={compact}
            />
            <QualityRecommendations 
              recommendations={highPriorityRecommendations}
              onRecommendationAction={(recId, action) => {
  console.log('Recommendation action:', recId, action);
}}
              compact={compact}
            />
          </div>
        </TabsContent>
        {/* Test Coverage Tab */}
        <TabsContent value="coverage" className="space-y-6 mt-6">
          <TestCoverageChart metrics={metrics.testCoverage} />
        </TabsContent>
        {/* Code Quality Tab */}
        <TabsContent value="quality" className="space-y-6 mt-6">
          <CodeQualityMetrics metrics={metrics.codeQuality} />
        </TabsContent>
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          <PerformanceMetrics metrics={metrics.performance} />
        </TabsContent>
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <SecurityMetrics metrics={metrics.security} />
        </TabsContent>
        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6 mt-6">
          <DocumentationMetrics metrics={metrics.documentation} />
        </TabsContent>
        {/* Build Health Tab */}
        <TabsContent value="builds" className="space-y-6 mt-6">
          <BuildHealthMetrics metrics={metrics.buildHealth} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QualityDashboard;