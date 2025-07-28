import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Button } from '../ui/Button';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
/**
 * Time series chart props
 */
interface TimeSeriesChartProps {
  data: Record<string, unknown>[];
  title: string;
  metric: string;
  unit: string;
  color: string;
  loading: boolean;
  error?: string;
}
/**
 * Time series chart component
 */
const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({)
  data,
  title,
  metric,
  unit,
  color,
  loading,
  error
}) => {
  const formatValue = (value: number) => {
    if (unit === 'ms') {
      return value < 1000 ? `${value}ms` : `${(value / 1000).toFixed(1)}s`;}
    }
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {)
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(value);
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;}
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;}
    }
    return value.toLocaleString();
  };
  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  if (loading) {
    return ()
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return ()
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }
  if (!data || data.length === 0) {
    return ()
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }
  return ()
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis
                tickFormatter={formatValue}
                fontSize={12}
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip
                formatter={(value: number) => [formatValue(value), metric]}
                labelFormatter={(timestamp: number) => formatXAxis(timestamp)}
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
/**
 * Performance charts props
 */
export interface PerformanceChartsProps {
  analyticsClient: AnalyticsClient;
  timeRange: { startTime: number; endTime: number };
  userId?: number;
  organizationId?: number;
}
/**
 * Performance charts state
 */
interface PerformanceChartsState {
  executionsData: unknown[];
  tokensData: unknown[];
  costData: unknown[];
  errorsData: unknown[];
  granularity: 'hour' | 'day';
  loading: {,
    executions: boolean;
    tokens: boolean;
    cost: boolean;
    errors: boolean;
  };
  errors: {,
    executions?: string;
    tokens?: string;
    cost?: string;
    errors?: string;
  };
}
/**
 * Performance charts component
 */
export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({)
  analyticsClient,
  timeRange,
  userId,
  organizationId
}) => {
  const [state, setState] = useState<PerformanceChartsState>({)
    executionsData: [],
    tokensData: [],
    costData: [],
    errorsData: [],
    granularity: 'hour',
    loading: {,
      executions: true,
      tokens: true,
      cost: true,
      errors: true,
    },
    errors: {}
  });
  /**
   * Load chart data
   */
  const loadChartData = useCallback(async () => {
    const metrics = ['executions', 'tokens', 'cost', 'errors'] as const;
    setState(prev => ({)
      ...prev,
      loading: {,
        executions: true,
        tokens: true,
        cost: true,
        errors: true,
      },
      errors: {}
    }));
    // Load all metrics in parallel
    const results = await Promise.allSettled(;)
      metrics.map(metric =>)
        analyticsClient.getTimeSeries(metric, {)
          ...timeRange,
          granularity: state.granularity,
        })
      )
    );
    const newState = {
      executionsData: [],
      tokensData: [],
      costData: [],
      errorsData: [],
      loading: {,
        executions: false,
        tokens: false,
        cost: false,
        errors: false,
      },
      errors: {}
    };
    results.forEach((result, index) => {
      const metric = metrics[index];
      if (result.status === 'fulfilled' && result.value.success) {
        const data = result.value.data.dataPoints || [];
        switch (metric) {
        case 'executions':
          newState.executionsData = data;
          break;
        case 'tokens':
          newState.tokensData = data;
          break;
        case 'cost':
          newState.costData = data;
          break;
        case 'errors':
          newState.errorsData = data;
          break;
        }
      } else {
        const error = result.status === 'rejected' ;
          ? result.reason.message 
          : 'Failed to load data';
        newState.errors[metric] = error;
      }
    });
    setState(prev => ({)
      ...prev,
      ...newState
    }));
  }, [analyticsClient, timeRange, state.granularity]);
  /**
   * Handle granularity change
   */
  const handleGranularityChange = useCallback((newGranularity: 'hour' | 'day') => {
    setState(prev => ({ ...prev, granularity: newGranularity }));
  }, []);
  /**
   * Calculate trend
   */
  const calculateTrend = useCallback((data: Record<string, unknown>[]) => {
    if (data.length < 2) return null;
    const recent = data.slice(-Math.floor(data.length / 2));
    const earlier = data.slice(0, Math.floor(data.length / 2));
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.value, 0) / earlier.length;
    if (earlierAvg === 0) return null;
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
      value: Math.abs(change),
      isPositive: change > 0
    };
  }, []);
  /**
   * Refresh data
   */
  const handleRefresh = useCallback(() => {
    loadChartData();
  }, [loadChartData]);
  /**
   * Load data on mount and dependency changes
   */
  useEffect(() => {
    loadChartData();
  }, [loadChartData]);
  const executionsTrend = calculateTrend(state.executionsData);
  const tokensTrend = calculateTrend(state.tokensData);
  const costTrend = calculateTrend(state.costData);
  const errorsTrend = calculateTrend(state.errorsData);
  return ()
    <div className="performance-charts">
      {/* Charts Header */}
      <div className="charts-header">
        <h2 className="text-lg font-semibold text-gray-900">Performance Metrics</h2>
        <div className="header-controls">
          <Select value={state.granularity} onValueChange={handleGranularityChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Hourly</SelectItem>
              <SelectItem value="day">Daily</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>
      {/* Trend Summary */}
      <div className="trend-summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="trend-card">
            <div className="trend-label">Executions</div>
            <div className="trend-value">
              {state.executionsData.length > 0 && ()
                <>
                  {executionsTrend && ()
                    <div className={`trend-indicator ${executionsTrend.direction}`}>}
                      {executionsTrend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                        executionsTrend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                          <Activity className="w-4 h-4" />}
                      <span>{executionsTrend.value.toFixed(1)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-label">Token Usage</div>
            <div className="trend-value">
              {state.tokensData.length > 0 && ()
                <>
                  {tokensTrend && ()
                    <div className={`trend-indicator ${tokensTrend.direction}`}>}
                      {tokensTrend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                        tokensTrend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                          <Activity className="w-4 h-4" />}
                      <span>{tokensTrend.value.toFixed(1)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-label">Cost</div>
            <div className="trend-value">
              {state.costData.length > 0 && ()
                <>
                  {costTrend && ()
                    <div className={`trend-indicator ${costTrend.direction}`}>}
                      {costTrend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                        costTrend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                          <Activity className="w-4 h-4" />}
                      <span>{costTrend.value.toFixed(1)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="trend-card">
            <div className="trend-label">Errors</div>
            <div className="trend-value">
              {state.errorsData.length > 0 && ()
                <>
                  {errorsTrend && ()
                    <div className={`trend-indicator ${errorsTrend.direction === 'up' ? 'up-bad' : errorsTrend.direction === 'down' ? 'down-good' : 'stable'}`}>}
                      {errorsTrend.direction === 'up' ? <TrendingUp className="w-4 h-4" /> : 
                        errorsTrend.direction === 'down' ? <TrendingDown className="w-4 h-4" /> : 
                          <Activity className="w-4 h-4" />}
                      <span>{errorsTrend.value.toFixed(1)}%</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Charts Grid */}
      <div className="charts-grid">
        <TimeSeriesChart
          data={state.executionsData}
          title="Graph Executions"
          metric="Executions"
          unit="count"
          color="#3B82F6"
          loading={state.loading.executions}
          error={state.errors.executions}
        />
        <TimeSeriesChart
          data={state.tokensData}
          title="Token Usage"
          metric="Tokens"
          unit="count"
          color="#10B981"
          loading={state.loading.tokens}
          error={state.errors.tokens}
        />
        <TimeSeriesChart
          data={state.costData}
          title="Cost Tracking"
          metric="Cost"
          unit="currency"
          color="#F59E0B"
          loading={state.loading.cost}
          error={state.errors.cost}
        />
        <TimeSeriesChart
          data={state.errorsData}
          title="Error Rate"
          metric="Errors"
          unit="count"
          color="#EF4444"
          loading={state.loading.errors}
          error={state.errors.errors}
        />
      </div>
    </div>
  );
};
/**
 * Performance charts styles
 */
const styles = `;
  .performance-charts {
    space-y: 1.5rem;
  }
  .charts-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .trend-summary {
    margin-bottom: 1.5rem;
  }
  .trend-card {
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .trend-label {
    font-size: 0.875rem;
    color: #6B7280;
    margin-bottom: 0.5rem;
  }
  .trend-value {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .trend-indicator {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .trend-indicator.up {
    color: #10B981;
  }
  .trend-indicator.down {
    color: #EF4444;
  }
  .trend-indicator.down-good {
    color: #10B981;
  }
  .trend-indicator.up-bad {
    color: #EF4444;
  }
  .trend-indicator.stable {
    color: #6B7280;
  }
  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }
  @media (max-width: 768px) {
    .charts-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }
    .charts-grid {
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

export default PerformanceCharts;