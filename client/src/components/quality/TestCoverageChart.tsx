/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Test Coverage Chart - Epic 18
 * 
 * Comprehensive test coverage visualization component displaying overall coverage,
 * package-level breakdown, component analysis, and coverage hotspots.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend, // Commented out unused import
  ResponsiveContainer
 from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
 from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  TestTube, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Target,
  FileText,
  BarChart3
 from 'lucide-react';
import { TestCoverageMetrics } from '../../hooks/useQualityMetrics';

// =============================================================================
// Test Coverage Chart Component
// =============================================================================


export interface TestCoverageChartProps {
  metrics: TestCoverageMetrics;
  compact?: boolean;
  className?: string;



export const TestCoverageChart: React.FC<TestCoverageChartProps> = ({)
  metrics,
  compact = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  // Color scheme for charts
  const chartColors = {
  covered: '#10b981',
  uncovered: '#ef4444',
  partial: '#f59e0b',
  primary: '#3b82f6',
};
  // Prepare pie chart data for overall coverage
  const overallCoverageData = [
    {
  name: 'Covered',
  value: metrics.overall.linesCovered,
  color: chartColors.covered,

    {
  name: 'Uncovered',
  value: metrics.overall.linesTotal - metrics.overall.linesCovered,
  color: chartColors.uncovered];
  // Prepare bar chart data for packages
  const packageData = metrics.byPackage;
  .sort((a, b) => b.percentage - a.percentage)
  .slice(0, 10);
  // Prepare component data with criticality
  const componentData = metrics.byComponent;
  .map(comp => ({)
  ...comp,
  criticalityScore: comp.criticalPaths / (comp.criticalPaths + comp.uncoveredPaths) * 100,
}))
    .sort((a, b) => b.criticalityScore - a.criticalityScore)
    .slice(0, 15);
  // Prepare trend data
  const trendData = metrics.trends.last7Days.map((percentage, index) => ({)
  day: `Day ${index + 1}`}
},
  percentage: Math.round(percentage);
  }));
  // Get coverage status
  const getCoverageStatus = (percentage: number) => {
    if (percentage >= 90) return { status: 'excellent', color: 'text-green-600' };
    if (percentage >= 80) return { status: 'good', color: 'text-blue-600' };
    if (percentage >= 70) return { status: 'fair', color: 'text-yellow-600' };
    if (percentage >= 60) return { status: 'poor', color: 'text-orange-600' };
    return { status: 'critical', color: 'text-red-600' };
  };
  // Get component type icon
  const getComponentTypeIcon = (type: string) => {
  switch (type) {
  case 'component':,
  return '🧩';
  case 'service':,
  return '⚙️';
  case 'utility':,
  return '🔧';
  default:,
  return '📄';
};
  // Custom tooltip for charts
  interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  const CustomTooltip = (;);
  { active,
  payload,


    label }: { active?: boolean; payload?: TooltipEntry; label?: string }
  ) => {
    if (active && payload && payload.length) {
      return;
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: TooltipEntry, index: number) => ()
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
              <span className="font-medium text-gray-900">
                {typeof entry.value === 'number' ? `${entry.value.toFixed(1)}%` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    return null;
  };
  if (compact) {
    return;
      <div className={`test-coverage-chart-compact ${className}`}>}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Test Coverage</span>
              <Badge variant={metrics.overall.percentage >= 80 ? 'default' : 'destructive'}>
                {metrics.overall.percentage}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  {metrics.overall.percentage}%
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{metrics.overall.linesCovered} / {metrics.overall.linesTotal} lines</div>
                  <div>{metrics.overall.functionsCovered} / {metrics.overall.functionsTotal} functions</div>
                </div>
              </div>
              <Progress value={metrics.overall.percentage} className="h-2" />
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overallCoverageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {overallCoverageData.map((entry, index) => ()
                        <Cell key={`cell-${index}`} fill={entry.color} />}
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`test-coverage-chart ${className}`}>}
      {/* Header */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <TestTube className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {metrics.overall.percentage}%
                    </h2>
                    <p className="text-gray-600">Overall Coverage</p>
                  </div>
                </div>
                <div className="h-16 border-l border-gray-300"></div>
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Lines</div>
                    <div>{metrics.overall.linesCovered} / {metrics.overall.linesTotal}</div>
                    <div className="text-gray-500">{metrics.overall.percentage}%</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Branches</div>
                    <div>{metrics.overall.branchesCovered} / {metrics.overall.branchesTotal}</div>
                    <div className="text-gray-500">
                      {((metrics.overall.branchesCovered / metrics.overall.branchesTotal) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Functions</div>
                    <div>{metrics.overall.functionsCovered} / {metrics.overall.functionsTotal}</div>
                    <div className="text-gray-500">
                      {((metrics.overall.functionsCovered / metrics.overall.functionsTotal) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              {/* Trend Indicator */}
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  {metrics.trends.changeFromLastWeek > 0 ? ()
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : ()
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-medium ${
  metrics.trends.changeFromLastWeek > 0 ? 'text-green-600' : 'text-red-600',
`}>
                    {Math.abs(metrics.trends.changeFromLastWeek).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">vs last week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Coverage Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">By Package</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="hotspots">Critical Paths</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coverage Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Coverage Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={overallCoverageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {overallCoverageData.map((entry, index) => ()
                          <Cell key={`cell-${index}`} fill={entry.color} />}
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Coverage Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Coverage Trend (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke={chartColors.primary}
                        strokeWidth={3}
                        dot={{ r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Coverage by Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={packageData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="percentage" fill={chartColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Coverage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {componentData.map((component, index) => {
                  const { status, color } = getCoverageStatus(component.percentage);
                  return;
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{getComponentTypeIcon(component.type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{component.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <Badge variant="outline" size="sm">{component.type}</Badge>
                              <span>{component.criticalPaths} critical paths</span>
                              <span>{component.uncoveredPaths} uncovered paths</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${color}`}>}
                            {component.percentage}%
                          </div>
                          <Badge variant={component.percentage >= 80 ? 'default' : 'destructive'} size="sm">
                            {status}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={component.percentage} className="h-2" />
                      {component.uncoveredPaths > 0 && ()
                        <div className="mt-2 flex items-center space-x-2 text-sm text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{component.uncoveredPaths} critical paths need coverage</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Critical Paths Tab */}
        <TabsContent value="hotspots" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Coverage Hotspots</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.coverageHotspots.map((hotspot, index) => ()
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-gray-900">{hotspot.function}</h4>
                          <p className="text-sm text-gray-600">{hotspot.file}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={
                            hotspot.importance === 'critical' ? 'destructive' :
                              hotspot.importance === 'high' ? 'default' :
                                hotspot.importance === 'medium' ? 'secondary' : 'outline'
                          size="sm"
                        >
                          {hotspot.importance}
                        </Badge>
                        <div className={`text-xl font-bold ${getCoverageStatus(hotspot.coverage).color}`}>}
                          {hotspot.coverage}%
                        </div>
                      </div>
                    </div>
                    <Progress value={hotspot.coverage} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">{hotspot.reason}</p>
                  </div>
                ))}
                {metrics.coverageHotspots.length === 0 && ()
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Critical Coverage Issues
                    </h3>
                    <p className="text-gray-500">
                      All critical code paths have adequate test coverage.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestCoverageChart;