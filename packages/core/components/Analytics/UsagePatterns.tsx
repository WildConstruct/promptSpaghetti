import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
import { Activity, Calendar, Clock, MousePointer, Route, Eye, Map } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from 'recharts';
/**
 * Heat map component props
 */
}
interface HeatMapProps {
  data: Array<{ x: number; y: number; intensity: number }>;
  width?: number;
  height?: number;
/**
 * Canvas heat map component
 */
const CanvasHeatMap: React.FC<HeatMapProps> = ({ data, width = 600, height = 400 }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    // Find max intensity for normalization
    const maxIntensity = Math.max(...data.map(d => d.intensity));
    const minIntensity = Math.min(...data.map(d => d.intensity));
    // Draw heat map points
    data.forEach(point => {)
  const normalized = (point.intensity - minIntensity) / (maxIntensity - minIntensity);
      const alpha = Math.max(0.1, normalized);
      // Create radial gradient for each point
      const gradient = ctx.createRadialGradient(;);
        point.x, point.y, 0,
        point.x, point.y, 20
      );
      gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`);}
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 20, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [data, width, height]);
  return;
    <div className="heat-map-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded"
      />
      <div className="heat-map-legend">
        <div className="flex items-center justify-between text-sm text-gray-600 mt-2">
          <span>Less Activity</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-200 rounded"></div>
            <div className="w-4 h-4 bg-blue-400 rounded"></div>
            <div className="w-4 h-4 bg-blue-600 rounded"></div>
          </div>
          <span>More Activity</span>
        </div>
      </div>
    </div>
  );
};
/**
 * User journey flow component
 */
const UserJourneyFlow: React.FC<{ journeyData: unknown }> = ({ journeyData }) => {
  if (!journeyData || journeyData.length === 0) {
    return;
      <div className="text-center py-8 text-gray-500">
        No journey data available
      </div>
    );
  return;
    <div className="journey-flow">
      <div className="space-y-4">
        {journeyData.slice(0, 10).map((flow, index) => ()
          <div key={index} className="flow-item">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline">{index + 1}</Badge>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{flow.sourceStep}</span>
                  <Route className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{flow.targetStep}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{flow.userCount} users</div>
                <div className="text-sm text-gray-600">{flow.percentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
/**
 * Usage patterns props
 */

}
export interface UsagePatternsProps {
  analyticsClient: AnalyticsClient;
}
  timeRange: { startTime: number; endTime: number };
  userId?: number;
  organizationId?: number;
/**
 * Usage patterns state
 */
}
interface UsagePatternsState {
  loading: boolean;
  error: string | null;
  heatMapData: unknown;
  hourlyPattern: unknown;
  dailyPattern: unknown;
  weeklyPattern: unknown;
  journeyFlows: unknown;
  selectedPattern: 'hourly' | 'daily' | 'weekly';
  /**
  * Usage patterns component
  */
}
}
export const UsagePatterns: React.FC<UsagePatternsProps> = ({)
  analyticsClient,
  timeRange,
  userId,
  organizationId
}) => {
  const [state, setState] = useState<UsagePatternsState>({)
  loading: true,
  error: null,
  heatMapData: [],
  hourlyPattern: null,
  dailyPattern: null,
  weeklyPattern: null,
  journeyFlows: [],
  selectedPattern: 'hourly',
});
  /**
   * Load usage patterns data
   */
  const loadUsageData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const [heatMapResponse, hourlyResponse, dailyResponse, weeklyResponse] = await Promise.all([)
        analyticsClient.getHeatMap(timeRange),
        analyticsClient.getUsagePatterns('hourly'),
        analyticsClient.getUsagePatterns('daily'),
        analyticsClient.getUsagePatterns('weekly')
      ]);
      if (!heatMapResponse.success) {
        throw new Error('Failed to load heat map data');
      // Generate mock journey flows data
      const mockJourneyFlows = [;
        { sourceStep: 'Landing', targetStep: 'Node Creation', userCount: 150, percentage: 25.5, averageTime: 30000, successRate: 0.85 },
        { sourceStep: 'Node Creation', targetStep: 'Connection', userCount: 120, percentage: 20.4, averageTime: 45000, successRate: 0.92 },
        { sourceStep: 'Connection', targetStep: 'Execution', userCount: 110, percentage: 18.7, averageTime: 60000, successRate: 0.88 },
        { sourceStep: 'Execution', targetStep: 'Results', userCount: 95, percentage: 16.2, averageTime: 15000, successRate: 0.95 },
        { sourceStep: 'Results', targetStep: 'Export', userCount: 40, percentage: 6.8, averageTime: 20000, successRate: 0.98 },
        { sourceStep: 'Node Creation', targetStep: 'Template', userCount: 35, percentage: 5.9, averageTime: 25000, successRate: 0.90 },
        { sourceStep: 'Template', targetStep: 'Execution', userCount: 30, percentage: 5.1, averageTime: 35000, successRate: 0.87 },
        { sourceStep: 'Execution', targetStep: 'Save', userCount: 25, percentage: 4.3, averageTime: 12000, successRate: 0.96 }
      ];
      setState(prev => ({)
  ...prev,
  loading: false,
  heatMapData: heatMapResponse.data || [],
  hourlyPattern: hourlyResponse.success ? hourlyResponse.data : null,
  dailyPattern: dailyResponse.success ? dailyResponse.data : null,
  weeklyPattern: weeklyResponse.success ? weeklyResponse.data : null,
  journeyFlows: mockJourneyFlows,
}));
    } catch (error) {
  console.error('Failed to load usage data:', error);
  setState(prev => ({)
  ...prev,
  loading: false,
  error: error instanceof Error ? error.message : 'Failed to load usage data',
}));
  }, [analyticsClient, timeRange]);
  /**
   * Handle pattern selection change
   */
  const handlePatternChange = useCallback((pattern: 'hourly' | 'daily' | 'weekly') => {
    setState(prev => ({ ...prev, selectedPattern: pattern }));
  }, []);
  /**
   * Get current pattern data
   */
  const getCurrentPatternData = useCallback(() => {
  switch (state.selectedPattern) {
  case 'hourly':,
  return state.hourlyPattern;
  case 'daily':,
  return state.dailyPattern;
  case 'weekly':,
  return state.weeklyPattern;
  default:,
  return null;
}, [state.selectedPattern, state.hourlyPattern, state.dailyPattern, state.weeklyPattern]);
  /**
   * Format pattern data for charts
   */
  const formatPatternData = useCallback((patternData: unknown) => {
  if (!patternData || !patternData.data) return [];
  return patternData.data.map((item: unknown) => ({,)
  period: new Date(item.period).toLocaleDateString(),
  value: item.value,
  timestamp: new Date(item.period).getTime(),
}));
  }, []);
  /**
   * Generate hourly distribution data
   */
  const generateHourlyDistribution = useCallback(() => {
  if (!state.hourlyPattern || !state.hourlyPattern.data) return [];
  const hourlyData = new Array(24).fill(0);
  state.hourlyPattern.data.forEach((item: unknown) => {,
  const hour = new Date(item.period).getHours();
  hourlyData[hour] += item.value;
});
    return hourlyData.map((value, hour) => ({)
  hour: `${hour.toString().padStart(2, '0')}:00`}
}
      value,
      percentage: (value / Math.max(...hourlyData)) * 100;
  }));
  }, [state.hourlyPattern]);
  /**
   * Load data on mount
   */
  useEffect(() => {
    loadUsageData();
  }, [loadUsageData]);
  if (state.loading) {
    return;
      <div className="usage-patterns">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading usage patterns...</p>
        </div>
      </div>
    );
  if (state.error) {
    return;
      <div className="usage-patterns">
        <Alert variant="destructive">
          <AlertDescription>
            {state.error}
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsageData}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  const currentPattern = getCurrentPatternData();
  const patternChartData = formatPatternData(currentPattern);
  const hourlyDistribution = generateHourlyDistribution();
  return;
    <div className="usage-patterns">
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="patterns">Time Patterns</TabsTrigger>
          <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
          <TabsTrigger value="journeys">User Journeys</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="patterns" className="space-y-6">
          {/* Pattern Selection */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Usage Time Patterns</h3>
            <Select value={state.selectedPattern} onValueChange={handlePatternChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly Pattern</SelectItem>
                <SelectItem value="daily">Daily Pattern</SelectItem>
                <SelectItem value="weekly">Weekly Pattern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Pattern Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Trend Direction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold">
                    {currentPattern?.trend || 'stable'}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Change Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {currentPattern?.changePercent?.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Data Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {patternChartData.length}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Pattern Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Series Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {state.selectedPattern.charAt(0).toUpperCase() + state.selectedPattern.slice(1)} Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={patternChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Hourly Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Hourly Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="w-5 h-5" />
                Canvas Interaction Heat Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Heat map shows areas of high user interaction on the canvas. 
                  Brighter areas indicate more frequent interactions.
                </div>
                {state.heatMapData.length > 0 ? ()
                  <CanvasHeatMap data={state.heatMapData} />
                ) : ()
                  <div className="h-64 flex items-center justify-center text-gray-500 border border-gray-200 rounded">
                    No interaction data available for heat map
                  </div>
                )}
                {/* Heat Map Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {state.heatMapData.length}
                    </div>
                    <div className="text-sm text-gray-600">Hot Spots</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {state.heatMapData.reduce((sum, point) => sum + point.intensity, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Interactions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {state.heatMapData.length > 0 ? 
                        (state.heatMapData.reduce((sum, point) => sum + point.intensity, 0) / state.heatMapData.length).toFixed(1) : 
                        '0'
                    </div>
                    <div className="text-sm text-gray-600">Avg Intensity</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="journeys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                User Journey Flows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Most common user flows through the application, showing how users navigate between different actions.
                </div>
                <UserJourneyFlow journeyData={state.journeyFlows} />
              </div>
            </CardContent>
          </Card>
          {/* Journey Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Flows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {state.journeyFlows.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Most Common</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium">
                  {state.journeyFlows[0]?.sourceStep || 'N/A'} → {state.journeyFlows[0]?.targetStep || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">
                  {state.journeyFlows[0]?.userCount || 0} users
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Avg Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {state.journeyFlows.length > 0 ? 
                    (state.journeyFlows.reduce((sum, flow) => sum + flow.successRate, 0) / state.journeyFlows.length * 100).toFixed(1) : 
                    '0'
                  }%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Usage Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900">Peak Usage Hours</div>
                    <div className="text-sm text-blue-700">
                      Most activity occurs between 9 AM - 11 AM and 2 PM - 4 PM
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-900">User Flow Optimization</div>
                    <div className="text-sm text-green-700">
                      85% of users follow the standard creation → connection → execution flow
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-900">Attention Needed</div>
                    <div className="text-sm text-yellow-700">
                      15% drop-off rate between execution and results viewing
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Improvement Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-medium">Reduce Canvas Complexity</div>
                    <div className="text-sm text-gray-600">
                      High interaction density in center areas suggests UI overcrowding
                    </div>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-medium">Optimize for Peak Hours</div>
                    <div className="text-sm text-gray-600">
                      Scale resources during 9-11 AM and 2-4 PM peak periods
                    </div>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="font-medium">Improve Results Display</div>
                    <div className="text-sm text-gray-600">
                      Add better visual feedback for execution completion
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsagePatterns;