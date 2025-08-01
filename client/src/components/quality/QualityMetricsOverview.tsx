/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Quality Metrics Overview - Epic 18
 * 
 * High-level overview component displaying key quality metrics cards
 * with scores, trends, and status indicators for the quality dashboard.
 * 
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
 from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  TestTube, 
  Code, 
  Zap, 
  Shield, 
  FileText, 
  Wrench,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle
 from 'lucide-react';
import { QualityMetrics } from '../../hooks/useQualityMetrics';

// =============================================================================
// Quality Metrics Overview Component
// =============================================================================


export interface QualityMetricsOverviewProps {
  metrics: QualityMetrics;
  compact?: boolean;
  className?: string;



export const QualityMetricsOverview: React.FC<QualityMetricsOverviewProps> = ({)
  metrics,
  compact = false,
  className = ''
}) => {
  // Helper function to get score color
  const getScoreColor = (score: number): string => {,
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  if (score >= 60) return 'text-orange-600';
  return 'text-red-600';
};
  // Helper function to get progress color - commented out as unused
  //   //   if (score >= 80) return 'bg-blue-500';
  //   if (score >= 70) return 'bg-yellow-500';
  //   if (score >= 60) return 'bg-orange-500';
  //   return 'bg-red-500';
  // };
  // Helper function to get status badge variant
  const getStatusVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 60) return 'outline';
    return 'destructive';
  };
  // Helper function to get trend icon
  const getTrendIcon = (current: number, trend?: number) => {
  if (!trend || trend.length < 2) return null;
  const lastValue = trend[trend.length - 2];
  const change = current - lastValue;
  if (Math.abs(change) < 1) return null;
  return change > 0 ? ()
  <TrendingUp className="w-4 h-4 text-green-500" />
  ) : (),
  <TrendingDown className="w-4 h-4 text-red-500" />
  );
};
  // Quality metric card data
  const qualityCards = [
    {
      id: 'testCoverage',
      title: 'Test Coverage',
      icon: TestTube,
      score: metrics.overall.componentScores.testCoverage,
      value: `${metrics.testCoverage.overall.percentage}%`}
},
  target: 80,
      description: `${metrics.testCoverage.overall.linesCovered} / ${metrics.testCoverage.overall.linesTotal} lines covered`}
},
  trend: metrics.testCoverage.trends.last7Days,
      alerts: metrics.testCoverage.overall.percentage < 70 ? 1 : 0,
      color: 'blue';

    {
      id: 'codeQuality',
      title: 'Code Quality',
      icon: Code,
      score: metrics.overall.componentScores.codeQuality,
      value: `${metrics.codeQuality.maintainability.index}/100`}
},
  target: 85,
      description: `${metrics.codeQuality.linting.totalIssues} issues found`}
},
  trend: metrics.codeQuality.maintainability.trends,
      alerts: metrics.codeQuality.linting.errorCount,
      color: 'purple';

    {
      id: 'performance',
      title: 'Performance',
      icon: Zap,
      score: metrics.overall.componentScores.performance,
      value: `${Math.round(metrics.performance.responseTime.average)}ms`}
},
  target: 90,
      description: `${Math.round(metrics.performance.throughput.requestsPerSecond)} req/s`}
},
  trend: metrics.performance.responseTime.average ? [metrics.performance.responseTime.average] : [],
      alerts: metrics.performance.errorRates.overall > 5 ? 1 : 0,
      color: 'green';

    {
      id: 'security',
      title: 'Security',
      icon: Shield,
      score: metrics.overall.componentScores.security,
      value: `${metrics.security.vulnerabilities.total} issues`}
},
  target: 95,
      description: `${metrics.security.vulnerabilities.critical} critical`}
},
  trend: metrics.security.vulnerabilities.trends,
      alerts: metrics.security.vulnerabilities.critical + metrics.security.vulnerabilities.high,
      color: 'red';

    {
      id: 'documentation',
      title: 'Documentation',
      icon: FileText,
      score: metrics.overall.componentScores.documentation,
      value: `${metrics.documentation.coverage.overall}%`}
},
  target: 75,
      description: `${metrics.documentation.accuracy.brokenLinks} broken links`}
},
  trend: [],
      alerts: metrics.documentation.accuracy.brokenLinks > 5 ? 1 : 0,
      color: 'indigo';

    {
      id: 'buildHealth',
      title: 'Build Health',
      icon: Wrench,
      score: metrics.overall.componentScores.buildHealth,
      value: `${metrics.buildHealth.builds.successRate}%`}
},
  target: 95,
      description: `${Math.round(metrics.buildHealth.builds.averageDuration)}min avg`}
},
  trend: metrics.buildHealth.builds.trends,
      alerts: metrics.buildHealth.builds.successRate < 90 ? 1 : 0,
      color: 'orange'];
  if (compact) {
    return;
      <div className={`quality-metrics-overview-compact ${className}`}>}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {qualityCards.map((card) => {
            const IconComponent = card.icon;
            return;
              <Card key={card.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <IconComponent className={`w-5 h-5 text-${card.color}-500`} />}
                    {card.alerts > 0 && ()
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">{card.title}</p>
                    <div className={`text-lg font-bold ${getScoreColor(card.score)}`}>}
                      {card.score}/100
                    </div>
                    <div className="text-xs text-gray-500">{card.value}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  return;
    <div className={`quality-metrics-overview ${className}`}>}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Quality Metrics Overview
            <Badge variant="outline" className="text-xs">
              {metrics.metadata.dataSourcesActive.length} sources active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qualityCards.map((card) => {
              const IconComponent = card.icon;
              const trendIcon = getTrendIcon(card.score, card.trend);
              return;
                <div key={card.id} className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-${card.color}-50`}>}
                        <IconComponent className={`w-5 h-5 text-${card.color}-600`} />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{card.title}</h3>
                        <p className="text-sm text-gray-500">{card.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {trendIcon}
                      {card.alerts > 0 && ()
                        <Badge variant="destructive" size="sm">
                          {card.alerts}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Score */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${getScoreColor(card.score)}`}>}
                        {card.score}/100
                      </span>
                      <span className="text-sm text-gray-500">
                        Target: {card.target}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress 
                        value={card.score} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{card.value}</span>
                        <Badge variant={getStatusVariant(card.score)} size="sm">
                          {card.score >= card.target ? ()
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              On Target
                            </>
                          ) : ()
                            <>
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Below Target
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Summary Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  Last updated: {new Date(metrics.metadata.lastUpdated).toLocaleString()}
                </span>
                <span className="text-gray-600">
                  Collection time: {metrics.metadata.collectionDuration}ms
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  {qualityCards.filter(card => card.score >= card.target).length} of {qualityCards.length} targets met
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityMetricsOverview;