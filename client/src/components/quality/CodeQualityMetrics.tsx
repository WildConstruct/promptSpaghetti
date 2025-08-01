/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Code Quality Metrics - Epic 18
 * 
 * Comprehensive code quality visualization component displaying complexity analysis,
 * duplication detection, maintainability index, linting issues, and technical debt.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  Code, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Copy,
  Wrench,
  Bug,
  Clock
 from 'lucide-react';
import { CodeQualityMetrics } from '../../hooks/useQualityMetrics';

// =============================================================================
// Code Quality Metrics Component
// =============================================================================


export interface CodeQualityMetricsProps {
  metrics: CodeQualityMetrics;
  compact?: boolean;
  className?: string;



export const CodeQualityMetrics: React.FC<CodeQualityMetricsProps> = ({)
  metrics,
  compact = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  // Color scheme for charts
  const chartColors = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#ef4444',
  critical: '#dc2626',
  primary: '#6366f1',
};
  // Prepare complexity distribution data
  const complexityData = [
    { range: '1-5 (Simple)', count: metrics.complexity.distribution['1-5'], color: chartColors.excellent },
    { range: '6-10 (Moderate)', count: metrics.complexity.distribution['6-10'], color: chartColors.good },
    { range: '11-20 (Complex)', count: metrics.complexity.distribution['11-20'], color: chartColors.fair },
    { range: '21-50 (Very Complex)', count: metrics.complexity.distribution['21-50'], color: chartColors.poor },
    { range: '50+ (Extremely Complex)', count: metrics.complexity.distribution['50+'], color: chartColors.critical }
  ];
  // Prepare maintainability trend data
  const maintainabilityTrendData = metrics.maintainability.trends.map((index, day) => ({)
  day: `Day ${day + 1}`}
},
  index: Math.round(index);
  }));
  // Prepare linting data
  const lintingTrendData = metrics.linting.trends.map((issues, day) => ({)
  day: `Day ${day + 1}`}
},
  issues: issues;
  }));
  // Prepare rule breakdown data
  const ruleBreakdownData = metrics.linting.ruleBreakdowns;
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(rule => ({)
  ...rule,
  color: rule.severity === 'error' ? chartColors.poor : chartColors.fair,
}));
  // Get maintainability status
  const getMaintainabilityStatus = (index: number) => {
    if (index >= 90) return { status: 'excellent', color: 'text-green-600' };
    if (index >= 80) return { status: 'good', color: 'text-blue-600' };
    if (index >= 70) return { status: 'fair', color: 'text-yellow-600' };
    if (index >= 60) return { status: 'poor', color: 'text-orange-600' };
    return { status: 'critical', color: 'text-red-600' };
  };
  // Get technical debt priority color
  const getTechnicalDebtColor = (priority: string) => {
  switch (priority) {
  case 'critical':,
  return 'destructive';
  case 'high':,
  return 'default';
  case 'medium':,
  return 'secondary';
  case 'low':,
  return 'outline';
  default:,
  return 'outline';
};
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: unknown; label?: string }) => {
    if (active && payload && payload.length) {
      return;
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: unknown, index: number) => ()
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600">{entry.name || entry.dataKey}</span>
              </div>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    return null;
  };
  if (compact) {
    return;
      <div className={`code-quality-metrics-compact ${className}`}>}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Code Quality</span>
              <Badge variant={metrics.maintainability.index >= 80 ? 'default' : 'destructive'}>
                {metrics.maintainability.index}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Avg Complexity</div>
                  <div className="text-lg font-bold">{metrics.complexity.average}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Issues</div>
                  <div className="text-lg font-bold">{metrics.linting.totalIssues}</div>
                </div>
              </div>
              <Progress value={metrics.maintainability.index} className="h-2" />
              <div className="text-xs text-gray-600">
                {metrics.duplication.percentage}% duplication • {metrics.technicalDebt.totalMinutes}min debt
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  const maintainabilityStatus = getMaintainabilityStatus(metrics.maintainability.index);
  return;
    <div className={`code-quality-metrics ${className}`}>}
      {/* Header */}
      <div className="mb-6">
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <Code className="w-8 h-8 text-purple-600" />
                  <div>
                    <h2 className={`text-2xl font-bold ${maintainabilityStatus.color}`}>}
                      {metrics.maintainability.index}/100
                    </h2>
                    <p className="text-gray-600">Maintainability Index</p>
                  </div>
                </div>
                <div className="h-16 border-l border-gray-300"></div>
                <div className="grid grid-cols-4 gap-6 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Avg Complexity</div>
                    <div className="text-lg font-bold">{metrics.complexity.average.toFixed(1)}</div>
                    <div className="text-gray-500">cyclomatic</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Duplication</div>
                    <div className="text-lg font-bold">{metrics.duplication.percentage}%</div>
                    <div className="text-gray-500">{metrics.duplication.duplicatedLines} lines</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Issues</div>
                    <div className="text-lg font-bold">{metrics.linting.totalIssues}</div>
                    <div className="text-red-600">{metrics.linting.errorCount} errors</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Tech Debt</div>
                    <div className="text-lg font-bold">{Math.round(metrics.technicalDebt.totalMinutes / 60)}h</div>
                    <div className="text-gray-500">{metrics.technicalDebt.totalMinutes}min</div>
                  </div>
                </div>
              </div>
              <Badge className={maintainabilityStatus.color} variant="outline" size="lg">
                {maintainabilityStatus.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Code Quality Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="complexity">Complexity</TabsTrigger>
          <TabsTrigger value="duplication">Duplication</TabsTrigger>
          <TabsTrigger value="linting">Linting</TabsTrigger>
          <TabsTrigger value="debt">Tech Debt</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintainability Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Maintainability Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={maintainabilityTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="index"
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
            {/* Issues Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bug className="w-5 h-5" />
                  <span>Issues Trend</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lintingTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="issues"
                        stroke={chartColors.poor}
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
          {/* High Complexity Files */}
          <Card>
            <CardHeader>
              <CardTitle>High Complexity Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.complexity.highComplexityFiles.slice(0, 10).map((file, index) => ()
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="font-mono text-sm">{file}</span>
                    </div>
                    <Badge variant="secondary" size="sm">High Complexity</Badge>
                  </div>
                ))}
                {metrics.complexity.highComplexityFiles.length === 0 && ()
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="text-gray-600">No high complexity files detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Complexity Tab */}
        <TabsContent value="complexity" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Complexity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Complexity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complexityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {complexityData.map((entry, index) => ()
                          <Cell key={`cell-${index}`} fill={entry.color} />}
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Complexity Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Complexity Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {metrics.complexity.average.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Average Complexity</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-600">
                        {metrics.complexity.maximum}
                      </div>
                      <div className="text-sm text-gray-600">Maximum Complexity</div>
                    </div>
                  </div>
                  {complexityData.map((range, index) => ()
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{range.range}</span>
                        <span className="font-medium">{range.count} files</span>
                      </div>
                      <Progress 
                        value={(range.count / complexityData.reduce((sum, r) => sum + r.count, 0)) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Duplication Tab */}
        <TabsContent value="duplication" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Copy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metrics.duplication.percentage}%
                    </div>
                    <div className="text-gray-600">Duplication Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">L</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metrics.duplication.duplicatedLines.toLocaleString()}
                    </div>
                    <div className="text-gray-600">Duplicated Lines</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">B</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metrics.duplication.duplicatedBlocks.length}
                    </div>
                    <div className="text-gray-600">Duplicate Blocks</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Duplicate Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Duplicate Code Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.duplication.duplicatedBlocks.map((block, index) => ()
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Copy className="w-5 h-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">{block.lines} lines duplicated</div>
                          <div className="text-sm text-gray-600">
                            {block.similarity.toFixed(1)}% similarity across {block.files.length} files
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" size="sm">
                        {block.files.length} files
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-700 mb-2">Affected Files:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                        {block.files.map((file, fileIndex) => ()
                          <div key={fileIndex} className="font-mono text-xs text-gray-600 p-1 bg-gray-50 rounded">
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {metrics.duplication.duplicatedBlocks.length === 0 && ()
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Significant Code Duplication
                    </h3>
                    <p className="text-gray-500">
                      Your codebase has minimal duplicate code blocks.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Linting Tab */}
        <TabsContent value="linting" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rule Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Top Linting Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ruleBreakdownData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="rule" type="category" width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill={chartColors.fair} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Issue Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-3xl font-bold text-red-600">
                        {metrics.linting.errorCount}
                      </div>
                      <div className="text-sm text-gray-600">Errors</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {metrics.linting.warningCount}
                      </div>
                      <div className="text-sm text-gray-600">Warnings</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {metrics.linting.totalIssues}
                    </div>
                    <div className="text-sm text-gray-600">Total Issues</div>
                  </div>
                  <Progress 
                    value={((metrics.linting.totalIssues - metrics.linting.errorCount) / metrics.linting.totalIssues) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Rule Details */}
          <Card>
            <CardHeader>
              <CardTitle>Linting Rules Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.linting.ruleBreakdowns.map((rule, index) => ()
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <Bug className={`w-4 h-4 ${rule.severity === 'error' ? 'text-red-500' : 'text-yellow-500'}`} />}
                      <div>
                        <div className="font-medium">{rule.rule}</div>
                        <div className="text-sm text-gray-600">{rule.count} occurrences</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.severity === 'error' ? 'destructive' : 'secondary'} size="sm">
                        {rule.severity}
                      </Badge>
                      {rule.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-red-500" />}
                      {rule.trend === 'decreasing' && <TrendingDown className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Technical Debt Tab */}
        <TabsContent value="debt" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(metrics.technicalDebt.totalMinutes / 60)}h
                    </div>
                    <div className="text-gray-600">Total Debt</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Wrench className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metrics.technicalDebt.breakdown.length}
                    </div>
                    <div className="text-gray-600">Categories</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div>
                    <Badge variant={getTechnicalDebtColor(metrics.technicalDebt.priority)} size="lg">
                      {metrics.technicalDebt.priority}
                    </Badge>
                    <div className="text-gray-600 mt-1">Priority</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Technical Debt Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Debt by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.technicalDebt.breakdown
                  .sort((a, b) => b.minutes - a.minutes)
                  .map((category, index) => ()
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{category.category}</h4>
                          <div className="text-sm text-gray-600">
                            {Math.round(category.minutes / 60)}h {category.minutes % 60}m • {category.files.length} files affected
                          </div>
                        </div>
                        <Badge variant={getTechnicalDebtColor(category.priority)} size="sm">
                          {category.priority}
                        </Badge>
                      </div>
                      <Progress 
                        value={(category.minutes / metrics.technicalDebt.totalMinutes) * 100} 
                        className="h-2 mb-3"
                      />
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 mb-2">Affected Files:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                          {category.files.slice(0, 6).map((file, fileIndex) => ()
                            <div key={fileIndex} className="font-mono text-xs text-gray-600 p-1 bg-gray-50 rounded">
                              {file}
                            </div>
                          ))}
                          {category.files.length > 6 && ()
                            <div className="text-xs text-gray-500 p-1">
                              +{category.files.length - 6} more files
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                {metrics.technicalDebt.breakdown.length === 0 && ()
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Technical Debt Detected
                    </h3>
                    <p className="text-gray-500">
                      Your codebase is well-maintained with minimal technical debt.
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

export default CodeQualityMetrics;