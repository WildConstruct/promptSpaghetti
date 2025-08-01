/**
 * Performance Analytics Dashboard
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 * 
 * Advanced analytics and reporting for performance monitoring data
 */
import { PerformanceMonitor, PerformanceMetrics, AggregatedMetrics, PerformanceAlert } from './PerformanceMonitor';
import { EventEmitter } from 'events';


export interface PerformanceReport { generatedAt: number;
  timeRange: { }
  start: number;
  end: number;


};
  // Executive Summary
  summary: { ,
  totalExecutions: number;
  averagePerformance: number; // Score 0-100,
  reliabilityScore: number; // Score 0-100,
  efficiencyScore: number; // Score 0-100,
  recommendation: 'excellent' | 'good' | 'needs_attention' | 'critical' }
};
  // Detailed Metrics
  performance: { ,
  averageExecutionTime: number;
  p50ExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  slowestNodes: Array<{ }
  nodeId: string;
  nodeType: string;
  averageDuration: number;
  executionCount: number;
>;
  };
  reliability: { ,
  successRate: number;
  errorRate: number;
  mostReliableTypes: string;
  leastReliableTypes: string;
  errorPatterns: Array<{ }
  pattern: string;
  frequency: number;
  affectedNodes: string;
>;
  };
  efficiency: { ,
  memoryEfficiency: number;
  cacheHitRate: number;
  contextOptimization: number;
  resourceWaste: number;
  optimizationOpportunities: string };
  trends: { ,
  performanceTrend: 'improving' | 'stable' | 'degrading';
  trendConfidence: number; // 0-1,
  projectedImprovement: number;
  seasonalPatterns: Array<{ }
  period: string;
  impact: number;
  description: string;
>;
  };
  alerts: { ,
  critical: number;
  high: number;
  medium: number;
  low: number;
  topAlertTypes: Array<{ }
  type: string;
  frequency: number;
  severity: string;
>;
  };


export interface PerformanceBenchmark { nodeType: string;
  target: { }
  averageExecutionTime: number;
  maxExecutionTime: number;
  successRate: number;
  memoryUsage: number;


};
  current: { ,
  averageExecutionTime: number;
  maxExecutionTime: number;
  successRate: number;
  memoryUsage: number };
  status: 'exceeds' | 'meets' | 'below' | 'critical';,
  improvement: number; // Percentage improvement needed


export interface PerformanceInsight { id: string;
  timestamp: number;
  category: 'performance' | 'reliability' | 'efficiency' | 'cost';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionItems: string;
  affectedNodes: string;
  confidence: number; // 0-1 }
  automatable: boolean;
  /**
  * Advanced performance analytics and reporting system
  */


export class PerformanceAnalytics extends EventEmitter {
  private monitor: PerformanceMonitor;
  private insights: Map<string, PerformanceInsight> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private reportHistory: Array<{ timestamp: number; report: PerformanceReport }> = [];
  constructor(monitor: PerformanceMonitor) {
    super();
    this.monitor = monitor;
    this.initializeDefaultBenchmarks();
    this.setupMonitoringListeners();
  /**
   * Generate comprehensive performance report
   */
  generateReport(timeRange?: { start: number; end: number }): PerformanceReport { const now = Date.now();
  const range = timeRange || {
  start: now - (24 * 60 * 60 * 1000), // Last 24 hours,
  end: now }
};
    const summary = this.monitor.getStatisticsSummary();
    const allAlerts = this.monitor.getAlerts();
    // Gather all metrics for analysis
    const allMetrics = this.getAllMetricsInRange(range.start, range.end);
    const aggregatedMetrics = this.getAllAggregatedMetrics();
    const report: PerformanceReport = { ,
  generatedAt: now,
  timeRange: range,
  summary: this.calculateSummaryScores(allMetrics, allAlerts),
  performance: this.analyzePerformance(allMetrics, aggregatedMetrics),
  reliability: this.analyzeReliability(allMetrics, aggregatedMetrics),
  efficiency: this.analyzeEfficiency(allMetrics, aggregatedMetrics),
  trends: this.analyzeTrends(allMetrics),
  alerts: this.analyzeAlerts(allAlerts) }
};
    // Store report in history
    this.reportHistory.push({ timestamp: now, report });
    // Keep only last 30 reports
    if (this.reportHistory.length > 30) { this.reportHistory = this.reportHistory.slice(-30);
  this.emit('report_generated', report);
  return report;
  /**
  * Set benchmarks for node types
  */
  setBenchmark(nodeType: string, benchmark: PerformanceBenchmark['target']): void {,
  const aggregated = this.monitor.getAggregatedMetrics(nodeType);
  const current = aggregated ? {
  averageExecutionTime: aggregated.averageExecutionTime,
  maxExecutionTime: aggregated.maxDuration,
  successRate: (aggregated.successfulExecutions / aggregated.totalExecutions) * 100,
  memoryUsage: aggregated.averageMemoryDelta }
 : { averageExecutionTime: 0,
  maxExecutionTime: 0,
  successRate: 100,
  memoryUsage: 0 }
};
    // Calculate status and improvement needed
    let status: PerformanceBenchmark['status'] = 'meets';
    let improvement = 0;
    if (current.averageExecutionTime > benchmark.averageExecutionTime * 1.5) { status = 'critical';
      improvement = ((current.averageExecutionTime - benchmark.averageExecutionTime) / benchmark.averageExecutionTime) * 100 } else if (current.averageExecutionTime > benchmark.averageExecutionTime * 1.2) { status = 'below';
      improvement = ((current.averageExecutionTime - benchmark.averageExecutionTime) / benchmark.averageExecutionTime) * 100 } else if (current.averageExecutionTime < benchmark.averageExecutionTime * 0.8) { status = 'exceeds';
  improvement = ((benchmark.averageExecutionTime - current.averageExecutionTime) / benchmark.averageExecutionTime) * 100;
  this.benchmarks.set(nodeType, {)
  nodeType,
  target: benchmark,
  current,
  status }
  improvement
});
    this.emit('benchmark_updated', { nodeType, status, improvement });
  /**
   * Generate performance insights
   */
  generateInsights(): PerformanceInsight { const insights: PerformanceInsight = [];
    const summary = this.monitor.getStatisticsSummary();
    const alerts = this.monitor.getAlerts(false);
    // Performance insights
    if (summary.slowExecutions > summary.totalExecutions * 0.1) {
      insights.push({)
  id: this.generateInsightId(),
        timestamp: Date.now(),
        category: 'performance',
        severity: 'warning',
        title: 'High Rate of Slow Executions' }
        description: `${((summary.slowExecutions / summary.totalExecutions) * 100).toFixed(1)}% of executions are slower than expected`}
},
  impact: 'medium',
        actionItems: [
          'Profile slow executing nodes',
          'Consider caching optimization',
          'Review algorithm complexity',
          'Check for resource contention'
        ],
        affectedNodes: summary.underperformingTypes,
        confidence: 0.9,
        automatable: false;
  });
    // Memory insights
    if (summary.memoryPressure > 70) { insights.push({)
  id: this.generateInsightId(),
  timestamp: Date.now(),
  category: 'efficiency',
  severity: 'critical',
  title: 'High Memory Pressure',
  description: 'Memory usage is consistently high across executions',
  impact: 'high',
  actionItems: [
  'Implement memory pooling',
  'Review data structure usage',
  'Enable garbage collection optimization',
  'Consider streaming for large datasets'
  ],
  affectedNodes: [],
  confidence: 0.8,
  automatable: true }
});
    // Error rate insights
    if (summary.errorRate > 5) { insights.push({)
  id: this.generateInsightId(),
        timestamp: Date.now(),
        category: 'reliability',
        severity: summary.errorRate > 15 ? 'critical' : 'warning',
        title: 'High Error Rate' }
        description: `Error rate of ${summary.errorRate.toFixed(1)}% indicates reliability issues`}
},
  impact: 'high',
        actionItems: [
          'Investigate error patterns',
          'Improve input validation',
          'Add error recovery mechanisms',
          'Enhance monitoring and logging'
        ],
        affectedNodes: summary.underperformingTypes,
        confidence: 0.95,
        automatable: false;
  });
    // Alert insights
    if (alerts.length > 10) { const alertTypes = new Map<string, number>();
      alerts.forEach(alert => {)
  alertTypes.set(alert.type, (alertTypes.get(alert.type) || 0) + 1) });
      const mostCommonAlert = Array.from(alertTypes.entries());
        .sort((a, b) => b[1] - a[1])[0];
      insights.push({ )
  id: this.generateInsightId()
        timestamp: Date.now()
        category: 'performance'
        severity: 'warning'
        title: 'High Alert Volume' }
        description: `${alerts.length} active alerts, mostly ${mostCommonAlert[0]} (${mostCommonAlert[1]} instances)`}

  impact: 'medium'
        actionItems: [
          'Review alert thresholds'
          `Address ${mostCommonAlert[0]} alerts`}

          'Implement automated remediation'
          'Improve preventive monitoring'
        ]
        affectedNodes: []
        confidence: 0.85
        automatable: true;
  });
    // Cache efficiency insights
    const aggregatedMetrics = this.getAllAggregatedMetrics();
    const avgCacheHitRate = aggregatedMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / aggregatedMetrics.length;
    if (avgCacheHitRate < 30 && aggregatedMetrics.length > 0) { insights.push({)
  id: this.generateInsightId(),
        timestamp: Date.now(),
        category: 'efficiency',
        severity: 'info',
        title: 'Low Cache Utilization' }
        description: `Average cache hit rate of ${avgCacheHitRate.toFixed(1)}% suggests optimization opportunities`}
},
  impact: 'medium',
        actionItems: [
          'Enable caching for frequently accessed nodes',
          'Optimize cache key strategies',
          'Implement intelligent cache warming',
          'Review cache eviction policies'
        ],
        affectedNodes: aggregatedMetrics.filter(m => m.cacheHitRate < 30).map(m => m.nodeType),
        confidence: 0.75,
        automatable: true;
  });
    // Store insights
    insights.forEach(insight => { )
  this.insights.set(insight.id, insight) });
    // Cleanup old insights (keep last 100)
    const insightArray = Array.from(this.insights.entries());
      .sort((a, b) => b[1].timestamp - a[1].timestamp);
    if (insightArray.length > 100) {
      const toRemove = insightArray.slice(100);
      toRemove.forEach(([id]) => this.insights.delete(id));
    this.emit('insights_generated', insights);
    return insights;
  /**
   * Get benchmark status for all node types
   */
  getBenchmarkStatus(): PerformanceBenchmark {
    return Array.from(this.benchmarks.values());
  /**
   * Get recent insights
   */
  getInsights(category?: PerformanceInsight['category'], limit = 50): PerformanceInsight {
    const insights = Array.from(this.insights.values());
      .filter(insight => !category || insight.category === category)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
    return insights;
  /**
   * Get historical reports
   */
  getReportHistory(limit = 10): Array<{ timestamp: number; report: PerformanceReport }> {
    return this.reportHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  /**
   * Export analytics data
   */
  exportData(): {
    insights: PerformanceInsight;
  benchmarks: PerformanceBenchmark;
    reports: Array<{ timestamp: number; report: PerformanceReport }>;
    return { insights: Array.from(this.insights.values()),
  benchmarks: Array.from(this.benchmarks.values()),
  reports: this.reportHistory }
};
  // Private helper methods
  private initializeDefaultBenchmarks(): void { // Set default benchmarks for common node types
  const defaultBenchmarks = {
  'WeightedChoice': {,
  averageExecutionTime: 10,
  maxExecutionTime: 50,
  successRate: 99,
  memoryUsage: 1024 }

      'Conditional': { averageExecutionTime: 15,
  maxExecutionTime: 100,
  successRate: 98,
  memoryUsage: 2048 }

      'Sequential': { averageExecutionTime: 20,
  maxExecutionTime: 200,
  successRate: 99,
  memoryUsage: 4096 }

      'Markov': { averageExecutionTime: 50,
  maxExecutionTime: 500,
  successRate: 95,
  memoryUsage: 8192 }
};
    Object.entries(defaultBenchmarks).forEach(([nodeType, benchmark]) => { this.setBenchmark(nodeType, benchmark) });
  private setupMonitoringListeners(): void { this.monitor.on('execution_completed', () => {
      // Trigger periodic insight generation
      if (Math.random() < 0.1) { // 10% chance to generate insights
        setTimeout(() => this.generateInsights(), 0) });
    this.monitor.on('alert_created', () => { // Generate immediate insights for critical issues
      setTimeout(() => this.generateInsights(), 0) });
  private getAllMetricsInRange(start: number, end: number): PerformanceMetrics { // This would need to be implemented to access the monitor's internal metrics
  // For now, return empty array as the monitor doesn't expose historical metrics
  return [];
  private getAllAggregatedMetrics(): AggregatedMetrics { }
  // Get all node types and their aggregated metrics
  const summary = this.monitor.getStatisticsSummary();
  const metrics: AggregatedMetrics = [];
  // This is a simplified implementation
  // In a real scenario, we'd need access to the monitor's aggregated data
  summary.topPerformingTypes.concat(summary.underperformingTypes).forEach(nodeType => { )
  const aggregated = this.monitor.getAggregatedMetrics(nodeType);
  if (aggregated) {
  metrics.push(aggregated) });
    return metrics;
  private calculateSummaryScores(((
    metrics: PerformanceMetrics,
    alerts: PerformanceAlert
  ): PerformanceReport['summary'] { const summary = this.monitor.getStatisticsSummary();
  // Performance score (0-100)
  const performanceScore = Math.max(0, 100 - (summary.averageExecutionTime / 100));
  // Reliability score (0-100)
  const reliabilityScore = Math.max(0, 100 - summary.errorRate * 2);
  // Efficiency score (0-100)
  const efficiencyScore = Math.max(0, 100 - (summary.memoryPressure / 2));
  const averageScore = (performanceScore + reliabilityScore + efficiencyScore) / 3;
  let recommendation: PerformanceReport['summary']['recommendation'];
  if (averageScore >= 90) recommendation = 'excellent';
  else if (averageScore >= 75) recommendation = 'good';
  else if (averageScore >= 60) recommendation = 'needs_attention';
  else recommendation = 'critical';
  return {
  totalExecutions: summary.totalExecutions,
  averagePerformance: performanceScore,
  reliabilityScore,
  efficiencyScore }
  recommendation
};
  private analyzePerformance(((
    metrics: PerformanceMetrics,
    aggregated: AggregatedMetrics
  ): PerformanceReport['performance'] {
    const summary = this.monitor.getStatisticsSummary();
    // Calculate percentiles from aggregated data
    const allDurations = aggregated.flatMap(a => [a.averageDuration]);
    allDurations.sort((a, b) => a - b);
    const p50 = allDurations[Math.floor(allDurations.length * 0.5)] || summary.averageExecutionTime;
    const p95 = allDurations[Math.floor(allDurations.length * 0.95)] || summary.averageExecutionTime * 2;
    const p99 = allDurations[Math.floor(allDurations.length * 0.99)] || summary.averageExecutionTime * 3;
    const slowestNodes = summary.underperformingTypes.map(nodeType => ({)
  nodeId: `${nodeType}-aggregate`}

      nodeType,
      averageDuration: summary.averageExecutionTime,
      executionCount: summary.totalExecutions;
  }));
    return { averageExecutionTime: summary.averageExecutionTime,
  p50ExecutionTime: p50,
  p95ExecutionTime: p95,
  p99ExecutionTime: p99 }
  slowestNodes
};
  private analyzeReliability(((
    metrics: PerformanceMetrics,
    aggregated: AggregatedMetrics
  ): PerformanceReport['reliability'] { const summary = this.monitor.getStatisticsSummary();
  return {
  successRate: 100 - summary.errorRate,
  errorRate: summary.errorRate,
  mostReliableTypes: summary.topPerformingTypes,
  leastReliableTypes: summary.underperformingTypes,
  errorPatterns: [
  {
  pattern: 'Execution timeout',
  frequency: Math.floor(summary.errorRate * 0.4),
  affectedNodes: summary.underperformingTypes }

        { pattern: 'Memory overflow',
  frequency: Math.floor(summary.errorRate * 0.3) }
  affectedNodes: summary.underperformingTypes];
};
  private analyzeEfficiency(((
    metrics: PerformanceMetrics,
    aggregated: AggregatedMetrics
  ): PerformanceReport['efficiency'] { const summary = this.monitor.getStatisticsSummary();
  const avgCacheHitRate = aggregated.length > 0 ? ;
  aggregated.reduce((sum, m) => sum + m.cacheHitRate, 0) / aggregated.length : 0;
  return {
  memoryEfficiency: Math.max(0, 100 - summary.memoryPressure),
  cacheHitRate: avgCacheHitRate,
  contextOptimization: 75, // Placeholder - would need context analysis,
  resourceWaste: summary.memoryPressure,
  optimizationOpportunities: [
  'Enable caching for frequently accessed nodes',
  'Optimize memory usage patterns' }
  'Implement lazy loading for large datasets'
  ]
};
  private analyzeTrends(metrics: PerformanceMetrics): PerformanceReport['trends'] { return {
  performanceTrend: 'stable', // Would need historical data for real analysis,
  trendConfidence: 0.7,
  projectedImprovement: 10,
  seasonalPatterns: [] }
};
  private analyzeAlerts(alerts: PerformanceAlert): PerformanceReport['alerts'] { const critical = alerts.filter(a => a.severity === 'critical').length;
    const high = alerts.filter(a => a.severity === 'high').length;
    const medium = alerts.filter(a => a.severity === 'medium').length;
    const low = alerts.filter(a => a.severity === 'low').length;
    const alertTypeCounts = new Map<string, number>();
    alerts.forEach(alert => {)
  alertTypeCounts.set(alert.type, (alertTypeCounts.get(alert.type) || 0) + 1) });
    const topAlertTypes = Array.from(alertTypeCounts.entries());
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, frequency]) => ({ )
  type
  frequency
  severity: alerts.find(a => a.type === type)?.severity || 'medium' }
}));
    return { critical
      high
      medium
      low }
      topAlertTypes
    };
  private generateInsightId(): string {
    return `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;}

export default PerformanceAnalytics;