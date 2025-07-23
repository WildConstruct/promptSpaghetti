/**
 * Quality Trends Chart - Epic 18
 * 
 * Interactive chart component displaying quality trends over time using Recharts.
 * Shows trends for all quality dimensions with customizable time ranges.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */

import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { QualityTrends } from '../../hooks/useQualityMetrics';

// =============================================================================
// Quality Trends Chart Component
// =============================================================================

export interface QualityTrendsChartProps {
  trends: QualityTrends | null;
  compact?: boolean;
  className?: string;
  onTimeRangeChange?: (timeRange: string) => void;
}

export const QualityTrendsChart: React.FC<QualityTrendsChartProps> = ({
  trends,
  compact = false,
  className = '',
  onTimeRangeChange
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'overall' | 'testCoverage' | 'codeQuality' | 'performance' | 'security' | 'documentation' | 'buildHealth'>('all');
  const [chartType, setChartType] = useState<'line' | 'area'>('line');
  
  // Transform trends data for chart
  const chartData = useMemo(() => {
    if (!trends) return [];
    
    const getDataForRange = (trendData: unknown) => {
      switch (selectedTimeRange) {
      case 'daily':
        return trendData.daily || [];
      case 'weekly':
        return trendData.weekly || [];
      case 'monthly':
        return trendData.monthly || [];
      default:
        return trendData.daily || [];
      }
    };
    
    // Get the maximum length to ensure all series have the same number of points
    const maxLength = Math.max(
      getDataForRange(trends.overall).length,
      getDataForRange(trends.testCoverage).length,
      getDataForRange(trends.codeQuality).length,
      getDataForRange(trends.performance).length,
      getDataForRange(trends.security).length,
      getDataForRange(trends.documentation).length,
      getDataForRange(trends.buildHealth).length
    );
    
    return Array.from({ length: maxLength }, (_, index) => {
      const getValueAtIndex = (trendData: unknown, idx: number) => {
        const data = getDataForRange(trendData);
        return data[idx] || data[data.length - 1] || 0;
      };
      
      // Generate date labels based on time range
      const getDateLabel = (idx: number) => {
        const now = new Date();
        switch (selectedTimeRange) {
        case 'daily':
          const daysAgo = maxLength - idx - 1;
          const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        case 'weekly':
          const weeksAgo = maxLength - idx - 1;
          const weekDate = new Date(now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
          return `Week of ${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        case 'monthly':
          const monthsAgo = maxLength - idx - 1;
          const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
          return monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        default:
          return `Point ${idx + 1}`;
        }
      };
      
      return {
        date: getDateLabel(index),
        overall: Math.round(getValueAtIndex(trends.overall, index)),
        testCoverage: Math.round(getValueAtIndex(trends.testCoverage, index)),
        codeQuality: Math.round(getValueAtIndex(trends.codeQuality, index)),
        performance: Math.round(getValueAtIndex(trends.performance, index)),
        security: Math.round(getValueAtIndex(trends.security, index)),
        documentation: Math.round(getValueAtIndex(trends.documentation, index)),
        buildHealth: Math.round(getValueAtIndex(trends.buildHealth, index))
      };
    });
  }, [trends, selectedTimeRange]);
  
  // Chart color configuration
  const chartColors = {
    overall: '#3b82f6',
    testCoverage: '#06b6d4',
    codeQuality: '#8b5cf6',
    performance: '#10b981',
    security: '#ef4444',
    documentation: '#6366f1',
    buildHealth: '#f59e0b'
  };
  
  // Get chart lines based on selected metric
  const getChartLines = () => {
    if (selectedMetric === 'all') {
      return Object.entries(chartColors).map(([key, color]) => ({
        key,
        color,
        name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      }));
    } else if (selectedMetric === 'overall') {
      return [{ key: 'overall', color: chartColors.overall, name: 'Overall' }];
    } else {
      return [{ 
        key: selectedMetric, 
        color: chartColors[selectedMetric as keyof typeof chartColors], 
        name: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1).replace(/([A-Z])/g, ' $1')
      }];
    }
  };
  
  // Get trend direction for a metric
  const getTrendDirection = (metricKey: string) => {
    if (!trends) return 'stable';
    return trends[metricKey as keyof QualityTrends]?.direction || 'stable';
  };
  
  // Get trend velocity for a metric
  const getTrendVelocity = (metricKey: string) => {
    if (!trends) return 0;
    return trends[metricKey as keyof QualityTrends]?.velocity || 0;
  };
  
  // Handle time range change
  const handleTimeRangeChange = (timeRange: string) => {
    setSelectedTimeRange(timeRange as 'daily' | 'weekly' | 'monthly');
    if (onTimeRangeChange) {
      onTimeRangeChange(timeRange);
    }
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: unknown, index: number) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
              <span className="font-medium text-gray-900">{entry.value}/100</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  if (!trends || chartData.length === 0) {
    return (
      <div className={`quality-trends-chart ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Trend Data Available
              </h3>
              <p className="text-gray-500">
                Trend data will appear once enough historical metrics are collected.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className={`quality-trends-chart-compact ${className}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quality Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="overall"
                    stroke={chartColors.overall}
                    strokeWidth={2}
                    dot={false}
                  />
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`quality-trends-chart ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Quality Trends</span>
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Chart Type Toggle */}
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('area')}
              >
                Area
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Metric Selector */}
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="overall">Overall</SelectItem>
                <SelectItem value="testCoverage">Test Coverage</SelectItem>
                <SelectItem value="codeQuality">Code Quality</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="documentation">Documentation</SelectItem>
                <SelectItem value="buildHealth">Build Health</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Trend Summary */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(chartColors).map(([key, color]) => {
              const direction = getTrendDirection(key);
              const velocity = getTrendVelocity(key);
              
              return (
                <div key={key} className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-medium text-gray-600">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-1">
                    {direction === 'improving' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {direction === 'degrading' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    <Badge variant={direction === 'improving' ? 'default' : direction === 'degrading' ? 'destructive' : 'outline'} size="sm">
                      {Math.abs(velocity).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {selectedMetric === 'all' && <Legend />}
                  
                  {getChartLines().map(({ key, color, name }) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={2}
                      name={name}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  ))}
                </LineChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {selectedMetric === 'all' && <Legend />}
                  
                  {getChartLines().map(({ key, color, name }) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      fill={color}
                      fillOpacity={0.3}
                      strokeWidth={2}
                      name={name}
                    />
                  ))}
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div>
                Showing {selectedTimeRange} trends for {selectedMetric === 'all' ? 'all metrics' : selectedMetric}
              </div>
              <div className="flex items-center space-x-4">
                <span>
                  {chartData.length} data points
                </span>
                <span>
                  Latest: {chartData[chartData.length - 1]?.date}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityTrendsChart;