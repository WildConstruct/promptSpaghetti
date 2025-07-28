/**
 * Epic 14 Story 14.3 - Results Analysis & Visualization
 * Experiment Results Dashboard Component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  DollarSign,
  Activity,
  Target,
  Lightbulb,
  Download,
  Refresh,
  Filter
} from 'lucide-react';
import {
  ExperimentResults as ExperimentResultsType,
  VariantResults,
  MetricResult,
  StatisticalResults,
  ExperimentInsight,
  Experiment,
  ExperimentMetric
} from '../../types/experiment';

export interface ExperimentResultsProps {
  experiment: Experiment;
  results: ExperimentResultsType;
  onRefresh: () => Promise<void>;
  onExport: (format: 'csv' | 'json' | 'pdf') => Promise<void>;
  onStopExperiment: () => Promise<void>;
  onImplementWinner: (variantId: string) => Promise<void>;
  className?: string;
}
interface ResultsState {
  selectedSegment: string;
  selectedMetric: string;
  timeRange: '1h' | '24h' | '7d' | '30d';
  refreshing: boolean;
  showDetails: boolean;
}
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

export const ExperimentResults: React.FC<ExperimentResultsProps> = ({)
  experiment,
  results,
  onRefresh,
  onExport,
  onStopExperiment,
  onImplementWinner,
  className = ''
}) => {
  const [state, setState] = useState<ResultsState>({)
    selectedSegment: 'all',
    selectedMetric: 'primary',
    timeRange: '7d',
    refreshing: false,
    showDetails: false,
  });
  const primaryMetric = experiment.metrics.find(m => m.isPrimary);
  const controlVariant = results.variants[0]; // Assume first variant is control;
  const winningVariant = results.statistical.primaryMetric.winningVariant;
  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true }));
    try {
      await onRefresh();
    } finally {
      setState(prev => ({ ...prev, refreshing: false }));
    }
  }, [onRefresh]);
  /**
   * Get variant performance data for charts
   */
  const getVariantComparisonData = useCallback(() => {
    if (!primaryMetric) return [];
    return results.variants.map(variant => {)
      const metricResult = variant.metrics.find(m => m.metricId === primaryMetric.id);
      const controlMetricResult = controlVariant.metrics.find(m => m.metricId === primaryMetric.id);
      const improvement = controlMetricResult && metricResult ;
        ? ((metricResult.value - controlMetricResult.value) / controlMetricResult.value) * 100
        : 0;
      return {
        variant: variant.variantId,
        value: metricResult?.value || 0,
        improvement: variant.variantId === controlVariant.variantId ? 0 : improvement,
        sampleSize: variant.sampleSize,
        confidenceInterval: metricResult?.confidenceInterval || [0, 0]
      };
    });
  }, [results.variants, primaryMetric, controlVariant]);
  /**
   * Get time series data for trend chart
   */
  const getTimeSeriesData = useCallback(() => {
    // Mock time series data - in practice, this would come from the results
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayData: Record<string, unknown> = {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
      results.variants.forEach(variant => {)
        const metricResult = variant.metrics.find(m => m.metricId === primaryMetric?.id);
        // Add some realistic variance
        const baseValue = metricResult?.value || 0;
        const variance = 0.1 * baseValue * (Math.random() - 0.5);
        dayData[variant.variantId] = Math.max(0, baseValue + variance);
      });
      data.push(dayData);
    }
    return data;
  }, [results.variants, primaryMetric]);
  /**
   * Get funnel data for conversion analysis
   */
    }, [results.variants]);
  /**
   * Format metric value
   */
  const formatMetricValue = useCallback((value: number, metricType: string) => {
    switch (metricType) {
      case 'conversion':
        return `${(value * 100).toFixed(2)}%`;}
      case 'latency':
        return `${value.toFixed(0)}ms`;}
      case 'cost':
        return `$${value.toFixed(4)}`;}
      default:
        return value.toFixed(2);
    }
  }, []);
  /**
   * Get confidence interval display
   */
  const getConfidenceInterval = useCallback((ci: [number, number], metricType: string) => {
    const [lower, upper] = ci;
    return `[${formatMetricValue(lower, metricType)}, ${formatMetricValue(upper, metricType)}]`;}
  }, [formatMetricValue]);
  return ();
    <div className={`experiment-results ${className}`}>}
      {/* Header */}
      <div className="results-header">
        <div className="header-info">
          <h1 className="text-2xl font-bold">{experiment.name} - Results</h1>
          <div className="flex items-center space-x-2">
            <Badge variant={experiment.status === 'running' ? 'default' : 'secondary'}>
              {experiment.status}
            </Badge>
            {winningVariant && ()
              <Badge variant="default" className="bg-green-500">
                <Award className="w-3 h-3 mr-1" />
                Winner Detected
              </Badge>
            )}
          </div>
        </div>
        <div className="header-actions">
          <Select value={state.timeRange} onValueChange={(value: Error) => setState(prev => ({ ...prev, timeRange: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={state.refreshing}>
            <Refresh className="w-4 h-4 mr-2" />
            {state.refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={() => onExport('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {experiment.status === 'running' && ()
            <Button variant="outline" onClick={onStopExperiment}>
              Stop Experiment
            </Button>
          )}
          {winningVariant && ()
            <Button onClick={() => onImplementWinner(winningVariant)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Implement Winner
            </Button>
          )}
        </div>
      </div>
      {/* Winner Detection Alert */}
      {winningVariant && ()
        <Alert className="mb-4 border-green-200 bg-green-50">
          <Award className="h-4 w-4" />
          <AlertDescription>
            <strong>Statistical Winner Detected!</strong> Variant "{winningVariant}" shows statistically significant improvement with {((1 - results.statistical.primaryMetric.pValue) * 100).toFixed(1)}% confidence.
          </AlertDescription>
        </Alert>
      )}
      {/* Key Insights */}
      {results.insights.length > 0 && ()
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.insights.slice(0, 3).map((insight, index) => ()
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    insight.severity === 'high' ? 'bg-red-500' :
                    insight.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium">{insight.title}</div>
                    <div className="text-sm text-gray-600">{insight.description}</div>
                    {insight.recommendations && insight.recommendations.length > 0 && ()
                      <div className="text-xs text-gray-500 mt-1">
                        💡 {insight.recommendations[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Total Sample Size</div>
                <div className="text-2xl font-bold">
                  {results.variants.reduce((sum, v) => sum + v.sampleSize, 0).toLocaleString()}
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Statistical Significance</div>
                <div className="text-2xl font-bold">
                  {((1 - results.statistical.primaryMetric.pValue) * 100).toFixed(1)}%
                </div>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Experiment Duration</div>
                <div className="text-2xl font-bold">
                  {Math.ceil((Date.now() - experiment.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Guardrail Metrics</div>
                <div className="text-2xl font-bold">
                  {results.statistical.guardrailMetrics.filter(g => g.passed).length}/
                  {results.statistical.guardrailMetrics.length}
                </div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Results */}
      <Tabs defaultValue="overview" className="results-tabs">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="statistical">Statistical</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variant Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Variant Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getVariantComparisonData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="variant" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Improvement Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Relative Improvement vs Control</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getVariantComparisonData().filter(d => d.variant !== controlVariant.variantId)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="variant" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)}%`, 'Improvement']} />}
                    <Bar dataKey="improvement" fill={(entry: unknown) => entry > 0 ? '#82ca9d' : '#ff7c7c'} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          {/* Detailed Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Variant</th>
                      <th className="text-left p-2">Sample Size</th>
                      <th className="text-left p-2">{primaryMetric?.name}</th>
                      <th className="text-left p-2">Confidence Interval</th>
                      <th className="text-left p-2">vs Control</th>
                      <th className="text-left p-2">Significance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.variants.map((variant) => {
                      const metricResult = variant.metrics.find(m => m.metricId === primaryMetric?.id);
                      const controlMetricResult = controlVariant.metrics.find(m => m.metricId === primaryMetric?.id);
                      const improvement = controlMetricResult && metricResult && variant.variantId !== controlVariant.variantId;
                        ? ((metricResult.value - controlMetricResult.value) / controlMetricResult.value) * 100
                        : null;
                      return ();
                        <tr key={variant.variantId} className="border-b">
                          <td className="p-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{variant.variantId}</span>
                              {variant.variantId === controlVariant.variantId && ()
                                <Badge variant="secondary" className="text-xs">Control</Badge>
                              )}
                              {variant.variantId === winningVariant && ()
                                <Badge variant="default" className="text-xs bg-green-500">Winner</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-2">{variant.sampleSize.toLocaleString()}</td>
                          <td className="p-2">
                            {metricResult && formatMetricValue(metricResult.value, primaryMetric?.type || 'conversion')}
                          </td>
                          <td className="p-2 text-xs text-gray-600">
                            {metricResult && getConfidenceInterval()
                              metricResult.confidenceInterval,
                              primaryMetric?.type || 'conversion'
                            )}
                          </td>
                          <td className="p-2">
                            {improvement !== null && ()
                              <div className={`flex items-center ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>}
                                {improvement > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                {improvement.toFixed(2)}%
                              </div>
                            )}
                          </td>
                          <td className="p-2">
                            {variant.variantId === winningVariant && ()
                              <Badge variant="default" className="bg-green-500">Significant</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Variants Tab */}
        <TabsContent value="variants" className="space-y-4">
          <div className="grid gap-4">
            {results.variants.map((variant) => ()
              <Card key={variant.variantId}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      {variant.variantId}
                      {variant.variantId === controlVariant.variantId && ()
                        <Badge variant="secondary" className="ml-2">Control</Badge>
                      )}
                      {variant.variantId === winningVariant && ()
                        <Badge variant="default" className="ml-2 bg-green-500">Winner</Badge>
                      )}
                    </CardTitle>
                    <div className="text-sm text-gray-600">
                      {variant.sampleSize.toLocaleString()} participants
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Conversion Rate</div>
                      <div className="text-lg font-semibold">
                        {((variant.conversionRate || 0) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Avg Latency</div>
                      <div className="text-lg font-semibold">
                        {variant.averageLatency?.toFixed(0) || 0}ms
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                      <div className="text-lg font-semibold">
                        ${variant.totalCost?.toFixed(2) || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Error Rate</div>
                      <div className="text-lg font-semibold">
                        {((variant.errorRate || 0) * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getTimeSeriesData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {results.variants.map((variant, index) => ()
                    <Line
                      key={variant.variantId}
                      type="monotone"
                      dataKey={variant.variantId}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Segments Tab */}
        <TabsContent value="segments" className="space-y-6">
          {results.segments.length > 0 ? ()
            results.segments.map((segment, index) => ()
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Segment: {segment.segment.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 mb-4">
                    Sample Size: {segment.sampleSize.toLocaleString()} | 
                    Significant: {segment.significance ? 'Yes' : 'No'}
                  </div>
                  {/* Segment-specific results would go here */}
                </CardContent>
              </Card>
            ))
          ) : ()
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">No segment analysis available</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Statistical Tab */}
        <TabsContent value="statistical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Statistical Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Statistical Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">P-Value</div>
                  <div className="text-lg font-semibold">
                    {results.statistical.primaryMetric.pValue.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Confidence Level</div>
                  <div className="text-lg font-semibold">
                    {(results.statistical.primaryMetric.confidenceLevel * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Statistical Significance</div>
                  <div className="text-lg font-semibold">
                    {results.statistical.primaryMetric.statisticalSignificance ? ()
                      <Badge variant="default" className="bg-green-500">Significant</Badge>
                    ) : ()
                      <Badge variant="secondary">Not Significant</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Practical Significance</div>
                  <div className="text-lg font-semibold">
                    {results.statistical.primaryMetric.practicalSignificance ? ()
                      <Badge variant="default" className="bg-green-500">Yes</Badge>
                    ) : ()
                      <Badge variant="secondary">No</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Guardrail Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Guardrail Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.statistical.guardrailMetrics.map((guardrail, index) => ()
                    <div key={index} className="flex items-center justify-between">
                      <div className="text-sm">{guardrail.metricId}</div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-600">
                          {(guardrail.actualValue * 100).toFixed(2)}%
                        </div>
                        {guardrail.passed ? ()
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : ()
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentResults;