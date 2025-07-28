import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { TrendingUp, TrendingDown, Activity, Users, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
/**
 * Metric card props
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label: string;
  };
  progress?: {
    value: number;
    max: number;
    color?: 'green' | 'yellow' | 'red';
  };
  icon?: React.ReactNode;
  className?: string;
}
/**
 * Metric card component
 */
const MetricCard: React.FC<MetricCardProps> = ({)
  title,
  value,
  subtitle,
  trend,
  progress,
  icon,
  className = ''
}) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;}
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;}
      }
      return val.toLocaleString();
    }
    return val;
  };
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };
  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    switch (trend.direction) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-red-500';
    default:
      return 'text-gray-500';
    }
  };
  const getProgressColor = () => {
    if (!progress) return 'bg-blue-500';
    switch (progress.color) {
    case 'green':
      return 'bg-green-500';
    case 'yellow':
      return 'bg-yellow-500';
    case 'red':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
    }
  };
  return ();
    <Card className={`metric-card ${className}`}>}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">
              {formatValue(value)}
            </div>
            {trend && ()
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>}
                {getTrendIcon()}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              </div>
            )}
          </div>
          {subtitle && ()
            <div className="text-sm text-gray-500">
              {subtitle}
            </div>
          )}
          {trend && ()
            <div className="text-xs text-gray-400">
              {trend.label}
            </div>
          )}
          {progress && ()
            <div className="space-y-1">
              <Progress
                value={(progress.value / progress.max) * 100}
                className={`h-2 ${getProgressColor()}`}
              />
              <div className="text-xs text-gray-500">
                {progress.value} / {progress.max} ({((progress.value / progress.max) * 100).toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
/**
 * Metrics overview props
 */
export interface MetricsOverviewProps {
  summary: unknown;
  dashboardData: unknown;
  conversionData?: unknown;
  performanceData?: unknown;
  loading: boolean;
}
/**
 * Metrics overview component
 */
export const MetricsOverview: React.FC<MetricsOverviewProps> = ({)
  summary,
  dashboardData,
  conversionData,
  performanceData,
  loading
}) => {
  if (loading) {
    return ();
      <div className="metrics-overview">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => ()
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  if (!summary || !dashboardData) {
    return ();
      <div className="metrics-overview">
        <div className="text-center py-8 text-gray-500">
          No metrics data available
        </div>
      </div>
    );
  }
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;}
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;}
    return `${(ms / 60000).toFixed(1)}m`;}
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {)
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  const analytics = dashboardData.analytics || {};
  const executions = analytics.executions || {};
  const usage = analytics.usage || {};
  const costs = analytics.costs || {};
  // Enhanced metrics from conversion and performance data
  const conversionMetrics = conversionData || {};
  const performanceMetrics = performanceData || {};
  const realTimeMetrics = conversionMetrics.realTimeMetrics || {};
  return ();
    <div className="metrics-overview">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Executions */}
        <MetricCard
          title="Total Executions"
          value={executions.total || 0}
          subtitle={`${executions.successful || 0} successful`}
          trend={{
            direction: executions.total > 0 ? 'up' : 'stable',
            value: 12.5,
            label: 'vs last period',
          }}
          progress={{
            value: executions.successful || 0,
            max: executions.total || 1,
            color: executions.total > 0 && (executions.successful / executions.total) > 0.9 ? 'green' : 'yellow',
          }}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        {/* Success Rate */}
        <MetricCard
          title="Success Rate"
          value={`${summary.successRate ? summary.successRate.toFixed(1) : 0}%`}
          subtitle={`${executions.failed || 0} failed`}
          trend={{
            direction: summary.successRate > 90 ? 'up' : summary.successRate < 80 ? 'down' : 'stable',
            value: 2.3,
            label: 'vs last period',
          }}
          icon={summary.successRate > 90 ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        />
        {/* Active Users */}
        <MetricCard
          title="Active Users"
          value={realTimeMetrics.activeUsers || usage.totalUsers || 0}
          subtitle={`${usage.activeSessions || 0} active sessions`}
          trend={{
            direction: 'up',
            value: 8.2,
            label: 'vs last period',
          }}
          icon={<Users className="w-5 h-5" />}
        />
        {/* Conversion Rate */}
        <MetricCard
          title="Conversions (24h)"
          value={realTimeMetrics.conversionsLast24h || 0}
          subtitle="Key user actions"
          trend={{
            direction: realTimeMetrics.conversionsLast24h > 5 ? 'up' : 'stable',
            value: 15.7,
            label: 'vs yesterday',
          }}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        {/* Performance Health */}
        <MetricCard
          title="System Health"
          value={`${performanceMetrics.overview?.healthScore || 100}%`}
          subtitle={`${performanceMetrics.overview?.activeAlerts || 0} active alerts`}
          progress={{
            value: performanceMetrics.overview?.healthScore || 100,
            max: 100,
            color: (performanceMetrics.overview?.healthScore || 100) > 90 ? 'green' : ,
              (performanceMetrics.overview?.healthScore || 100) > 70 ? 'yellow' : 'red'
          }}
          icon={<Activity className="w-5 h-5" />}
        />
        {/* Average Execution Time */}
        <MetricCard
          title="Avg Execution Time"
          value={formatDuration(executions.averageTime || 0)}
          subtitle="Per execution"
          trend={{
            direction: 'down',
            value: -5.1,
            label: 'vs last period',
          }}
          icon={<Clock className="w-5 h-5" />}
        />
        {/* Total Cost */}
        <MetricCard
          title="Total Cost"
          value={formatCurrency(costs.totalSpent || 0)}
          subtitle={`${formatCurrency(costs.dailyAverage || 0)}/day avg`}
          trend={{
            direction: 'up',
            value: 15.3,
            label: 'vs last period',
          }}
          icon={<DollarSign className="w-5 h-5" />}
        />
        {/* Token Usage */}
        <MetricCard
          title="Token Usage"
          value={summary.totalTokenUsage || 0}
          subtitle="Total tokens consumed"
          trend={{
            direction: 'up',
            value: 22.1,
            label: 'vs last period',
          }}
          icon={<Activity className="w-5 h-5" />}
        />
        {/* Top Provider */}
        <MetricCard
          title="Top Provider"
          value={costs.topProviders?.[0]?.provider || 'N/A'}
          subtitle={costs.topProviders?.[0] ? formatCurrency(costs.topProviders[0].cost) : 'No data'}
          icon={<Activity className="w-5 h-5" />}
        />
        {/* Top Converting Funnel */}
        <MetricCard
          title="Top Converting Funnel"
          value={realTimeMetrics.topConvertingFunnel || 'Director Onboarding'}
          subtitle="Best performing flow"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>
      {/* Performance Metrics Section */}
      {performanceMetrics.keyMetrics && performanceMetrics.keyMetrics.length > 0 && ()
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Key Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.keyMetrics.map((metric: unknown, _____index: number) => ()
                <div key={metric.name} className="performance-metric-card">
                  <div className="metric-header">
                    <span className="metric-name">{metric.name.replace('-', ' ')}</span>
                    <Badge variant={metric.trend === 'improving' ? 'default' : 
                      metric.trend === 'degrading' ? 'destructive' : 'secondary'}>
                      {metric.trend}
                    </Badge>
                  </div>
                  <div className="metric-values">
                    <div className="current-value">{metric.current.toFixed(2)}ms</div>
                    <div className="average-value">avg: {metric.average.toFixed(2)}ms</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Popular Nodes Section */}
      {usage.popularNodes && usage.popularNodes.length > 0 && ()
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Popular Node Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usage.popularNodes.slice(0, 5).map((node: Error, index: number) => ()
                <div key={node.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{node.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{node.count} uses</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(),}
                            100,
                            (node.count / Math.max(...usage.popularNodes.map((n: unknown)
                            ) => n.count))) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
/**
 * Metrics overview styles
 */
const styles = `;
  .metrics-overview {
    width: 100%;
  }
  .metric-card {
    transition: all 0.2s ease-in-out;
  }
  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  .performance-metric-card {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  .metric-name {
    font-weight: 500;
    color: #374151;
    text-transform: capitalize;
  }
  .metric-values {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .current-value {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
  }
  .average-value {
    font-size: 0.875rem;
    color: #9ca3af;
  }
  .metric-card .progress {
    transition: all 0.3s ease-in-out;
  }
  @media (max-width: 768px) {
    .metrics-overview .grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default MetricsOverview;