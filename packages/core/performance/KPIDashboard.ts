/**
 * KPI Dashboard for Epic 18
 * Real-time visualization and reporting system for performance KPIs
 */
import { EventEmitter } from 'events';
import { corePerformanceKPIs, 
  KPIDefinition, 
  KPISnapshot, 
  calculateKPIStatus,
  getKPIsByCategory }
  getCriticalKPIs
 from './PerformanceKPIs';
import { KPIMonitoringService, KPIAlert, KPITrendAnalysis } from './KPIMonitoringService';
import { PerformanceBaseline, BaselineSnapshot, BaselineSummary } from './PerformanceBaseline';
import { performanceTargets, getAdjustedTargets, PerformanceTargetConfig } from './PerformanceTargets';


export interface DashboardWidget { id: string;
  type: 'chart' | 'metric' | 'alert' | 'trend' | 'gauge' | 'table';
  title: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
  data: any;
  refreshRate: number; // in milliseconds }
  lastUpdated: number;




export interface DashboardLayout { id: string;
  name: string;
  description: string;
  widgets: DashboardWidget;
  columns: number;
  autoRefresh: boolean;
  refreshInterval: number }



export interface DashboardMetrics { overview: { }
  totalKPIs: number;
  monitoredKPIs: number;
  healthyKPIs: number;
  warningKPIs: number;
  criticalKPIs: number;
  averageScore: number;
  trendsImproving: number;
  trendsStable: number;
  trendsDegrading: number;


};
  categories: Record<string, { total: number;
  healthy: number;
  warning: number;
  critical: number;
  averageScore: number }>;
  alerts: { ,
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  acknowledged: number };
  trends: { ,
  improving: KPITrendAnalysis;
  degrading: KPITrendAnalysis;
  stable: KPITrendAnalysis };


export interface DashboardReport { id: string;
  timestamp: number;
  type: 'summary' | 'detailed' | 'trend' | 'alert';
  period: { }
  start: number;
  end: number;
  duration: string;


};
  metrics: DashboardMetrics;
  insights: { ;
  keyFindings: string;
  recommendations: string;
  riskAreas: string;
  improvements: string };
  charts: {,
  performanceScore: Array<{ timestamp: number; score: number }>;
    categoryBreakdown: Record<string, number>;
    alertsOverTime: Array<{ timestamp: number; count: number; severity: string }>;
    topKPIs: Array<{ kpiId: string; name: string; score: number; trend: string }>;
  };
/**
 * KPI Dashboard Service
 * Provides comprehensive dashboard functionality for performance monitoring
 */

export class KPIDashboard extends EventEmitter { private monitoringService: KPIMonitoringService;
  private baseline: PerformanceBaseline;
  private layouts: Map<string, DashboardLayout> = new Map();
  private reports: DashboardReport = [];
  private config: PerformanceTargetConfig;
  private refreshIntervals: Map<string, NodeJS.Timer> = new Map();
  constructor();
    monitoringService: KPIMonitoringService
    baseline: PerformanceBaseline
    config: PerformanceTargetConfig = {
  environment: 'production'
      userSegment: 'general'
      deviceProfile: 'mid-range'
      networkProfile: 'average'
    super();
    this.monitoringService = monitoringService;
    this.baseline = baseline;
    this.config = config;
    this.setupDefaultLayouts();
    this.setupEventHandlers();
  /**
   * Setup default dashboard layouts
   */
  private setupDefaultLayouts(): void {
    // Executive Summary Layout
    const executiveLayout: DashboardLayout = {
  id: 'executive-summary'
      name: 'Executive Summary'
      description: 'High-level performance overview for executives and stakeholders'
      columns: 3
      autoRefresh: true
      refreshInterval: 60000, // 1 minute
      widgets: [
        {
          id: 'performance-score'
          type: 'gauge'
          title: 'Performance Score'
          description: 'Overall system performance score'
          size: 'medium' }
          config: { min: 0, max: 100, thresholds: [50, 70, 90] }
          data: null
          refreshRate: 30000
          lastUpdated: 0;

        { id: 'critical-alerts'
          type: 'metric'
          title: 'Critical Alerts'
          description: 'Number of critical performance alerts'
          size: 'small' }
          config: { format: 'number', color: 'red' }
          data: null
          refreshRate: 30000
          lastUpdated: 0;

        { id: 'user-experience'
          type: 'chart'
          title: 'User Experience Metrics'
          description: 'Core Web Vitals and user experience KPIs'
          size: 'large' }
          config: { chartType: 'line', timeRange: '24h' }
          data: null
          refreshRate: 60000
          lastUpdated: 0;

        { id: 'api-performance'
          type: 'chart'
          title: 'API Performance'
          description: 'API response times and throughput'
          size: 'medium' }
          config: { chartType: 'area', timeRange: '6h' }
          data: null
          refreshRate: 60000
          lastUpdated: 0;

        { id: 'top-issues'
          type: 'table'
          title: 'Top Performance Issues'
          description: 'Most critical performance issues requiring attention'
          size: 'large' }
          config: { maxRows: 5, sortBy: 'severity' }
          data: null
          refreshRate: 60000
          lastUpdated: 0];
  };
    // Technical Detail Layout
    const technicalLayout: DashboardLayout = { 
  id: 'technical-detail'
      name: 'Technical Detail'
      description: 'Detailed technical metrics for developers and engineers'
      columns: 4
      autoRefresh: true
      refreshInterval: 30000, // 30 seconds
      widgets: [
        {
          id: 'all-kpis-table'
          type: 'table'
          title: 'All KPI Status'
          description: 'Complete overview of all performance KPIs'
          size: 'large' }
          config: { sortBy: 'status', groupBy: 'category' }
          data: null
          refreshRate: 30000
          lastUpdated: 0;

        { id: 'memory-usage'
          type: 'chart'
          title: 'Memory Usage'
          description: 'Memory consumption and leak detection'
          size: 'medium' }
          config: { chartType: 'line', timeRange: '2h' }
          data: null
          refreshRate: 30000
          lastUpdated: 0;

        { id: 'bundle-analysis'
          type: 'chart'
          title: 'Bundle Size Analysis'
          description: 'Bundle sizes and optimization opportunities'
          size: 'medium' }
          config: { chartType: 'bar' }
          data: null
          refreshRate: 300000, // 5 minutes
          lastUpdated: 0;

        { id: 'trend-analysis'
          type: 'trend'
          title: 'Performance Trends'
          description: 'Long-term performance trend analysis'
          size: 'large' }
          config: { timeRange: '7d', showProjections: true }
          data: null
          refreshRate: 300000, // 5 minutes
          lastUpdated: 0];
  };
    // Operations Layout
    const operationsLayout: DashboardLayout = { 
  id: 'operations'
      name: 'Operations'
      description: 'Operational metrics for DevOps and infrastructure teams'
      columns: 3
      autoRefresh: true
      refreshInterval: 30000
      widgets: [
        {
          id: 'system-health'
          type: 'gauge'
          title: 'System Health'
          description: 'Overall system health indicator'
          size: 'medium' }
          config: { min: 0, max: 100, thresholds: [70, 85, 95] }
          data: null
          refreshRate: 30000
          lastUpdated: 0;

        { id: 'alert-timeline'
          type: 'chart'
          title: 'Alert Timeline'
          description: 'Performance alerts over time'
          size: 'large' }
          config: { chartType: 'timeline', timeRange: '24h' }
          data: null
          refreshRate: 60000
          lastUpdated: 0;

        { id: 'performance-budget'
          type: 'chart'
          title: 'Performance Budget'
          description: 'Budget compliance and violations'
          size: 'medium' }
          config: { chartType: 'bar', showThresholds: true }
          data: null
          refreshRate: 60000
          lastUpdated: 0;

        { id: 'active-alerts'
          type: 'alert'
          title: 'Active Alerts'
          description: 'Current active performance alerts'
          size: 'large' }
          config: { maxAlerts: 10, groupBy: 'severity' }
          data: null
          refreshRate: 30000
          lastUpdated: 0];
  };
    this.layouts.set('executive-summary', executiveLayout);
    this.layouts.set('technical-detail', technicalLayout);
    this.layouts.set('operations', operationsLayout);
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void { this.monitoringService.on('kpi-snapshot-processed', () => {
      this.refreshDashboardData() });
    this.monitoringService.on('kpi-alert-created', (alert: KPIAlert) => { this.emit('dashboard-alert', alert);
      this.refreshAlertWidgets() });
    this.baseline.on('baseline-captured', () => { this.refreshDashboardData() });
  /**
   * Get dashboard layout
   */
  getDashboardLayout(layoutId: string): DashboardLayout | null { return this.layouts.get(layoutId) || null;
  /**
  * Get all available layouts
  */
  getAvailableLayouts(): DashboardLayout {
  return Array.from(this.layouts.values());
  /**
  * Get dashboard metrics
  */
  getDashboardMetrics(): DashboardMetrics {
  const kpiStatus = this.monitoringService.getCurrentKPIStatus();
  const activeAlerts = this.monitoringService.getActiveAlerts();
  // Calculate overview metrics
  const overview = {
  totalKPIs: corePerformanceKPIs.length
  monitoredKPIs: kpiStatus.length
  healthyKPIs: kpiStatus.filter(k => k.status === 'excellent' || k.status === 'good').length
  warningKPIs: kpiStatus.filter(k => k.status === 'warning').length
  criticalKPIs: kpiStatus.filter(k => k.status === 'critical').length
  averageScore: this.calculateAverageScore(kpiStatus)
  trendsImproving: kpiStatus.filter(k => k.trend === 'improving').length
  trendsStable: kpiStatus.filter(k => k.trend === 'stable').length
  trendsDegrading: kpiStatus.filter(k => k.trend === 'degrading').length }
};
    // Calculate category metrics
    const categories: Record<string, any> = {};
    const categoryNames = ['runtime', 'api', 'bundle', 'memory', 'network', 'build', 'user-experience'];
    for (const category of categoryNames) { const categoryKPIs = getKPIsByCategory(category);
  const categoryStatus = kpiStatus.filter(k => ;);
  categoryKPIs.some(kpi => kpi.id === k.kpiId)
  );
  categories[category] = {
  total: categoryKPIs.length
  healthy: categoryStatus.filter(k => k.status === 'excellent' || k.status === 'good').length
  warning: categoryStatus.filter(k => k.status === 'warning').length
  critical: categoryStatus.filter(k => k.status === 'critical').length
  averageScore: this.calculateAverageScore(categoryStatus) }
};
    // Calculate alert metrics
    const alerts = { total: activeAlerts.length
  critical: activeAlerts.filter(a => a.severity === 'critical').length
  high: activeAlerts.filter(a => a.severity === 'high').length
  medium: activeAlerts.filter(a => a.severity === 'medium').length
  low: activeAlerts.filter(a => a.severity === 'low').length
  acknowledged: 0 // Active alerts are by definition unacknowledged }
};
    // Get trend analyses
    const trendAnalyses = kpiStatus.map(k => this.monitoringService.getKPITrend(k.kpiId));
    const trends = { improving: trendAnalyses.filter(t => t.trend === 'improving')
  degrading: trendAnalyses.filter(t => t.trend === 'degrading')
  stable: trendAnalyses.filter(t => t.trend === 'stable') }
};
    return { overview
      categories
      alerts }
      trends
    };
  /**
   * Generate comprehensive dashboard report
   */
  generateDashboardReport();
    type: DashboardReport['type'] = 'summary'
    periodHours: number = 24): DashboardReport { 
    const now = Date.now();
    const start = now - (periodHours * 60 * 60 * 1000);
    const report: DashboardReport = { }
  id: `report-${now}`}

  timestamp: now
      type
      period: { start
        end: now }
        duration: `${periodHours}h`}

  metrics: this.getDashboardMetrics()
      insights: this.generateInsights()
      charts: this.generateChartData(start, now)
    };
    this.reports.push(report);
    if (this.reports.length > 50) { this.reports = this.reports.slice(-50); // Keep last 50 reports
  this.emit('report-generated', report);
  return report;
  /**
  * Generate insights for dashboard report
  */
  private generateInsights(): DashboardReport['insights'] { }
  const metrics = this.getDashboardMetrics();
  const keyFindings: string = [];
  const recommendations: string = [];
  const riskAreas: string = [];
  const improvements: string = [];
  // Key findings
  if (metrics.overview.averageScore >= 90) { keyFindings.push('🎉 Excellent overall performance with 90+ average score') } else if (metrics.overview.averageScore >= 70) { keyFindings.push('✅ Good performance with room for optimization') } else {
      keyFindings.push('⚠️ Performance needs attention - below 70 average score');
    if (metrics.overview.criticalKPIs > 0) {
      keyFindings.push(`🚨 ${metrics.overview.criticalKPIs} critical performance issues detected`);}
    if (metrics.overview.trendsDegrading > metrics.overview.trendsImproving) {
      keyFindings.push('📉 More KPIs are degrading than improving');
    // Recommendations
    if (metrics.alerts.critical > 0) {
      recommendations.push('Address critical alerts immediately');
    if (metrics.categories.runtime?.critical > 0) {
      recommendations.push('Focus on frontend performance optimization');
    if (metrics.categories.api?.warning > 0 || metrics.categories.api?.critical > 0) {
      recommendations.push('Review API performance and implement caching');
    if (metrics.categories.memory?.warning > 0) {
      recommendations.push('Investigate memory usage patterns');
    // Risk areas
    const highRiskCategories = Object.entries(metrics.categories);
      .filter(([_, cat]) => (cat.critical + cat.warning) / cat.total > 0.5)
      .map(([name]) => name);
    if (highRiskCategories.length > 0) {
      riskAreas.push(`High risk categories: ${highRiskCategories.join(', ')}`);}
    if (metrics.trends.degrading.length > 3) {
      riskAreas.push('Multiple KPIs showing degrading trends');
    // Improvements
    if (metrics.trends.improving.length > 0) {
      improvements.push(`${metrics.trends.improving.length} KPIs showing improvement`);}
    const healthyCategories = Object.entries(metrics.categories);
      .filter(([_, cat]) => cat.healthy / cat.total > 0.8)
      .map(([name]) => name);
    if (healthyCategories.length > 0) {
      improvements.push(`Strong performance in: ${healthyCategories.join(', ')}`);}
    return { keyFindings
      recommendations
      riskAreas }
      improvements
    };
  /**
   * Generate chart data for dashboard report
   */
  private generateChartData(startTime: number, endTime: number): DashboardReport['charts'] { const baselineHistory = this.baseline.getBaselineHistory();
  const periodBaselines = baselineHistory.filter(b => ;);
  b.timestamp >= startTime && b.timestamp <= endTime
  );
  // Performance score over time
  const performanceScore = periodBaselines.map(baseline => ({)
  timestamp: baseline.timestamp,
  score: this.calculateBaselineScore(baseline) }
}));
    // Category breakdown (current state)
    const metrics = this.getDashboardMetrics();
    const categoryBreakdown: Record<string, number> = {};
    Object.entries(metrics.categories).forEach(([category, data]) => { categoryBreakdown[category] = data.averageScore });
    // Alerts over time (simulated data)
    const alertsOverTime = this.generateAlertTimelineData(startTime, endTime);
    // Top KPIs by performance
    const kpiStatus = this.monitoringService.getCurrentKPIStatus();
    const topKPIs = kpiStatus;
      .map(k => ({ )
  kpiId: k.kpiId
  name: corePerformanceKPIs.find(kpi => kpi.id === k.kpiId)?.name || k.kpiId
  score: this.statusToScore(k.status)
  trend: k.trend }
}))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    return { performanceScore
      categoryBreakdown
      alertsOverTime }
      topKPIs
    };
  /**
   * Calculate score for a baseline
   */
  private calculateBaselineScore(baseline: BaselineSnapshot): number {
    const scores = baseline.kpiSnapshots.map(snapshot => ;);
      this.statusToScore(snapshot.status)
    );
    return scores.length > 0 ? 
      Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  /**
   * Convert status to numeric score
   */
  private statusToScore(status: string): number {
    switch (status) {
    case 'excellent': return 100;
    case 'good': return 80;
    case 'warning': return 60;
    case 'critical': return 30;
    default: return 70;
  /**
   * Generate alert timeline data
   */
  private generateAlertTimelineData(startTime: number, endTime: number): Array<{ timestamp: number; count: number; severity: string }> {
    // This would be implemented to query actual alert history
    // For now, return simulated data
    const points: Array<{ timestamp: number; count: number; severity: string }> = [];
    const intervalMs = (endTime - startTime) / 20; // 20 data points;
    for (let i = 0; i < 20; i++) { const timestamp = startTime + (i * intervalMs);
  points.push({)
  timestamp,
  count: Math.floor(Math.random() * 5),
  severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] }
});
    return points;
  /**
   * Calculate average score from KPI status array
   */
  private calculateAverageScore(kpiStatus: Array<{ status: string }>): number { if (kpiStatus.length === 0) return 0;
  const scores = kpiStatus.map(k => this.statusToScore(k.status));
  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  /**
  * Refresh dashboard data for all widgets
  */
  private refreshDashboardData(): void {,
  this.emit('dashboard-refresh-requested');
  /**
  * Refresh alert-specific widgets
  */
  private refreshAlertWidgets(): void {,
  this.emit('alert-widgets-refresh-requested');
  /**
  * Get widget data
  */
  getWidgetData(layoutId: string, widgetId: string): any {,
  const layout = this.layouts.get(layoutId);
  if (!layout) return null;
  const widget = layout.widgets.find(w => w.id === widgetId);
  if (!widget) return null;
  return this.generateWidgetData(widget);
  /**
  * Generate data for a specific widget
  */
  private generateWidgetData(widget: DashboardWidget): any {,
  switch (widget.type) {
  case 'gauge':,
  return this.generateGaugeData(widget);
  case 'metric':,
  return this.generateMetricData(widget);
  case 'chart':,
  return this.generateChartData(widget);
  case 'table':,
  return this.generateTableData(widget);
  case 'alert':,
  return this.generateAlertData(widget);
  case 'trend':,
  return this.generateTrendData(widget);
  default:,
  return null;
  private generateGaugeData(widget: DashboardWidget): any {,
  const metrics = this.getDashboardMetrics();
  switch (widget.id) {
  case 'performance-score':,
  return {
  value: metrics.overview.averageScore,
  min: 0,
  max: 100,
  thresholds: [50, 70, 90],
  status: metrics.overview.averageScore >= 90 ? 'excellent' : ,
  metrics.overview.averageScore >= 70 ? 'good' :,
  metrics.overview.averageScore >= 50 ? 'warning' : 'critical' }
};
    case 'system-health':
      const healthScore = (metrics.overview.healthyKPIs / metrics.overview.monitoredKPIs) * 100;
      return { value: Math.round(healthScore),
  min: 0,
  max: 100,
  thresholds: [70, 85, 95] }
};
    default:
      return { value: 0, min: 0, max: 100 };
  private generateMetricData(widget: DashboardWidget): any { const metrics = this.getDashboardMetrics();
  switch (widget.id) {
  case 'critical-alerts':,
  return {
  value: metrics.alerts.critical,
  format: 'number',
  color: metrics.alerts.critical > 0 ? 'red' : 'green',
  change: 0 // Would calculate from historical data }
};
    default:
      return { value: 0 };
  private generateChartData(widget: DashboardWidget): any { // Chart data generation would be implemented based on widget configuration
  return {
  labels: [],
  datasets: [],
  type: widget.config.chartType || 'line' }
};
  private generateTableData(widget: DashboardWidget): any { switch (widget.id) {
    case 'all-kpis-table':
      const kpiStatus = this.monitoringService.getCurrentKPIStatus();
      return {
        headers: ['KPI', 'Category', 'Status', 'Value', 'Trend'],
        rows: kpiStatus.map(k => {),
          const kpi = corePerformanceKPIs.find(kpi => kpi.id === k.kpiId);
          return [
            kpi?.name || k.kpiId,
            kpi?.category || 'unknown',
            k.status }
            `${k.value}${kpi?.unit || ''}`}

            k.trend
          ];

      };
    case 'top-issues':
      const alerts = this.monitoringService.getActiveAlerts();
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];

        .slice(0, 5);
      return { headers: ['Issue', 'Severity', 'KPI', 'Value', 'Target'],
        rows: alerts.map(alert => [),
          alert.message,
          alert.severity,
          alert.kpiName }
          `${alert.value}`}

          `${alert.target}`}
        ])
      };
    default:
      return { headers: [], rows: [] };
  private generateAlertData(widget: DashboardWidget): any { const activeAlerts = this.monitoringService.getActiveAlerts();
  return {
  alerts: activeAlerts.slice(0, widget.config.maxAlerts || 10),
  groupedBySeverity: {,
  critical: activeAlerts.filter(a => a.severity === 'critical'),
  high: activeAlerts.filter(a => a.severity === 'high'),
  medium: activeAlerts.filter(a => a.severity === 'medium'),
  low: activeAlerts.filter(a => a.severity === 'low') }
};
  private generateTrendData(widget: DashboardWidget): any { const kpiStatus = this.monitoringService.getCurrentKPIStatus();
  const trends = kpiStatus.map(k => this.monitoringService.getKPITrend(k.kpiId));
  return {
  improving: trends.filter(t => t.trend === 'improving'),
  stable: trends.filter(t => t.trend === 'stable'),
  degrading: trends.filter(t => t.trend === 'degrading'),
  projections: trends.filter(t => t.significance !== 'minor') }
};
  /**
   * Start auto-refresh for a layout
   */
  startAutoRefresh(layoutId: string): void { const layout = this.layouts.get(layoutId);
    if (!layout || !layout.autoRefresh) return;
    // Clear existing interval
    this.stopAutoRefresh(layoutId);
    const interval = setInterval(() => {
      this.emit('layout-refresh', layoutId) }, layout.refreshInterval);
    this.refreshIntervals.set(layoutId, interval);
  /**
   * Stop auto-refresh for a layout
   */
  stopAutoRefresh(layoutId: string): void { const interval = this.refreshIntervals.get(layoutId);
  if (interval) {
  clearInterval(interval);
  this.refreshIntervals.delete(layoutId);
  /**
  * Export dashboard configuration
  */
  exportDashboardConfig(): string {,
  return JSON.stringify({)
  layouts: Array.from(this.layouts.entries()),
  config: this.config }
}, null, 2);
  /**
   * Import dashboard configuration
   */
  importDashboardConfig(configJson: string): void { try {
  const data = JSON.parse(configJson);
  if (data.layouts) {
  this.layouts.clear();
  data.layouts.forEach(([id, layout]: [string, DashboardLayout]) => { }
  this.layouts.set(id, layout);
});
      if (data.config) {
        this.config = { ...this.config, ...data.config };
      this.emit('dashboard-config-imported');
 catch (error) {
      throw new Error(`Failed to import dashboard config: ${error}`);}
  /**
   * Get dashboard reports
   */
  getDashboardReports(limit?: number): DashboardReport {
    const reports = [...this.reports].reverse(); // Most recent first;
    return limit ? reports.slice(0, limit) : reports;
  /**
   * Get specific dashboard report
   */
  getDashboardReport(reportId: string): DashboardReport | null {
    return this.reports.find(r => r.id === reportId) || null;
  /**
   * Clear old reports
   */
  clearOldReports(retentionDays: number = 30): number {
    const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    const initialCount = this.reports.length;
    this.reports = this.reports.filter(r => r.timestamp > cutoff);
    return initialCount - this.reports.length;

export default KPIDashboard;