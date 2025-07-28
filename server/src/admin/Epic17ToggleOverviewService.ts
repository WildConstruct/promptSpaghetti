/**
 * Epic 17 Toggle Overview Service - API Management System
 * Task: E17-1753114396748-B93794 - Develop toggle overview
 * 
 * Comprehensive toggle overview system for Epic 17 API Management System that provides
 * real-time dashboards, analytics visualizations, health monitoring, trend analysis,
 * and comprehensive reporting capabilities for toggle management and operations.
 */

import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

// =============================================================================
// Toggle Overview Types and Interfaces
// =============================================================================

}
export interface ToggleOverviewConfig {
  // General settings
  enabled: boolean;
  refreshInterval: number; // seconds
  maxDataPoints: number;
  defaultTimeRange: TimeRange;
  
  // Dashboard configuration
  dashboard: {
    autoRefresh: boolean;
    refreshRate: number; // seconds
    enableRealTime: boolean;
    maxWidgets: number;
    defaultLayout: string;
}
  };
  
  // Analytics settings
  analytics: {
    enableTrendAnalysis: boolean;
    trendPeriods: number[]; // days
    enablePredictiveAnalytics: boolean;
    baselineCalculationDays: number;
    anomalyDetectionEnabled: boolean;
  };
  
  // Reporting configuration
  reporting: {
    enableScheduledReports: boolean;
    defaultReportFormats: ReportFormat[];
    maxReportHistory: number;
    enableEmailReports: boolean;
    reportingFrequencies: ReportFrequency[];
  };
  
  // Performance settings
  performance: {
    enableCaching: boolean;
    cacheTTL: number; // seconds
    enableCompression: boolean;
    maxConcurrentQueries: number;
    queryTimeout: number; // milliseconds
  };
  
  // Visualization settings
  visualization: {
    enableCharts: boolean;
    chartTypes: ChartType[];
    colorSchemes: string[];
    enableExport: boolean;
    maxChartDataPoints: number;
  };
  
  // Health monitoring
  healthMonitoring: {
    enabled: boolean;
    healthCheckInterval: number; // seconds
    alertThresholds: HealthThreshold[];
    enableAutoRecovery: boolean;
  };
}

export enum TimeRange {
  LAST_HOUR = 'last_hour',
  LAST_4_HOURS = 'last_4_hours',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  CUSTOM = 'custom'
}

export enum ReportFormat {
  HTML = 'html',
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel'
}

export enum ReportFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export enum ChartType {
  LINE_CHART = 'line_chart',
  BAR_CHART = 'bar_chart',
  PIE_CHART = 'pie_chart',
  HEATMAP = 'heatmap',
  GAUGE = 'gauge',
  TREEMAP = 'treemap',
  SCATTER_PLOT = 'scatter_plot'
}

export enum MetricType {
  USAGE_COUNT = 'usage_count',
  RESPONSE_TIME = 'response_time',
  ERROR_RATE = 'error_rate',
  SUCCESS_RATE = 'success_rate',
  TOGGLE_CHANGES = 'toggle_changes',
  DEPENDENCY_VIOLATIONS = 'dependency_violations',
  APPROVAL_RATE = 'approval_rate',
  ROLLBACK_RATE = 'rollback_rate'
}

}
export interface HealthThreshold {
  metric: MetricType;
  warningThreshold: number;
  criticalThreshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
}
}

}
export interface DashboardWidget {
  widgetId: string;
  widgetType: 'metric' | 'chart' | 'table' | 'alert' | 'status';
  title: string;
  description: string;
  
  // Position and sizing
}
  position: { x: number; y: number; width: number; height: number };
  
  // Data configuration
  dataSource: string;
  metrics: MetricType[];
  timeRange: TimeRange;
  filters: Record<string, any>;
  
  // Visualization settings
  chartType?: ChartType;
  colorScheme?: string;
  displayOptions: Record<string, any>;
  
  // Update settings
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Interactivity
  drillDownEnabled: boolean;
  clickActions: WidgetAction[];
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

}
export interface WidgetAction {
  actionType: 'drill_down' | 'navigate' | 'filter' | 'export';
  actionConfig: Record<string, any>;
  enabled: boolean;
}
}

}
export interface ToggleOverviewSummary {
  // Basic statistics
  totalToggles: number;
  activeToggles: number;
  disabledToggles: number;
  maintenanceToggles: number;
  experimentalToggles: number;
  
  // Category breakdown
  categoryStats: Record<string, CategorySummary>;
  
  // Priority breakdown
  priorityStats: Record<string, PrioritySummary>;
  
  // Health metrics
  healthScore: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  activeIssues: Issue[];
  
  // Recent activity
  recentChanges: number;
  pendingApprovals: number;
  scheduledChanges: number;
  failedOperations: number;
  
  // Performance metrics
  avgResponseTime: number;
  totalRequests: number;
  errorRate: number;
  uptimePercentage: number;
  
  // Trend indicators
  trends: Record<MetricType, TrendIndicator>;
  
  // System status
  systemStatus: 'operational' | 'degraded' | 'maintenance' | 'outage';
  lastUpdated: Date;
}
}

}
export interface CategorySummary {
  category: string;
  totalToggles: number;
  activeToggles: number;
  healthScore: number;
  avgResponseTime: number;
  errorRate: number;
  lastChanged: Date;
  changeFrequency: number;
}
}

}
export interface PrioritySummary {
  priority: string;
  totalToggles: number;
  activeToggles: number;
  pendingApprovals: number;
  recentFailures: number;
  avgTimeToApproval: number;
}
}

}
export interface Issue {
  issueId: string;
  issueType: 'performance' | 'dependency' | 'validation' | 'security' | 'operational';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedToggles: string[];
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolutionNotes?: string;
}
}

}
export interface TrendIndicator {
  metric: MetricType;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  direction: 'up' | 'down' | 'stable';
  significance: 'none' | 'low' | 'medium' | 'high';
}
}

}
export interface AnalyticsData {
  timeRange: TimeRange;
  dataPoints: DataPoint[];
  aggregatedMetrics: Record<MetricType, AggregatedMetric>;
  trends: TrendAnalysis[];
  correlations: Correlation[];
  anomalies: Anomaly[];
  insights: Insight[];
}
}

}
export interface DataPoint {
  timestamp: Date;
  metrics: Record<MetricType, number>;
  metadata: Record<string, any>;
}
}

}
export interface AggregatedMetric {
  metric: MetricType;
  total: number;
  average: number;
  minimum: number;
  maximum: number;
  percentiles: Record<string, number>;
  variance: number;
  standardDeviation: number;
}
}

}
export interface TrendAnalysis {
  metric: MetricType;
  trendType: 'linear' | 'exponential' | 'seasonal' | 'cyclical';
  direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  strength: number; // 0-1 scale
  confidence: number; // 0-1 scale
  forecast: ForecastPoint[];
}
}

}
export interface ForecastPoint {
  timestamp: Date;
  predictedValue: number;
}
  confidenceInterval: { lower: number; upper: number };
}

}
export interface Correlation {
  metric1: MetricType;
  metric2: MetricType;
  correlationCoefficient: number;
  significance: number;
  relationship: 'positive' | 'negative' | 'none';
}
}

}
export interface Anomaly {
  timestamp: Date;
  metric: MetricType;
  actualValue: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  possibleCauses: string[];
}
}

}
export interface Insight {
  insightId: string;
  insightType: 'recommendation' | 'warning' | 'optimization' | 'trend';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  suggestedActions: string[];
  relatedMetrics: MetricType[];
}
}

}
export interface ToggleReport {
  reportId: string;
  reportType: 'summary' | 'detailed' | 'trend' | 'health' | 'compliance';
  title: string;
  description: string;
  
  // Report configuration
  timeRange: TimeRange;
  filters: Record<string, any>;
  metrics: MetricType[];
  format: ReportFormat;
  
  // Report content
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  dataAnalysis: AnalyticsData;
  
  // Report metadata
  generatedBy: string;
  generatedAt: Date;
}
  reportPeriod: { start: Date; end: Date };
  version: string;
  
  // Distribution
  recipients: string[];
  scheduledDelivery?: Date;
  deliveryMethods: string[];
}

// =============================================================================
// Toggle Overview Service Implementation
// =============================================================================

export class Epic17ToggleOverviewService extends EventEmitter {
  private config: ToggleOverviewConfig;
  private database: DatabaseService;
  private redis: RedisService;
  private auditService: AuditService;
  private dashboardCache: Map<string, DashboardWidget[]> = new Map();
  private metricsCache: Map<string, any> = new Map();
  private refreshInterval?: NodeJS.Timeout;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(
    config: ToggleOverviewConfig,
    database: DatabaseService,
    redis: RedisService,
    auditService: AuditService
  ) {
    super();
    
    this.config = config;
    this.database = database;
    this.redis = redis;
    this.auditService = auditService;
    
    this.initializeService();
  }

  /**
   * Initialize the toggle overview service
   */
  private async initializeService(): Promise<void> {

    try {
      // Set up periodic data refresh
      if (this.config.dashboard.autoRefresh) {
        this.setupDataRefresh();
      }
      
      // Set up health monitoring
      if (this.config.healthMonitoring.enabled) {
        this.setupHealthMonitoring();
      }
      
      // Load default dashboard configuration
      await this.loadDashboardConfiguration();
      
      this.emit('service:initialized', { timestamp: new Date() });
      
    } catch (error) {
      this.emit('service:error', { error: error.message, timestamp: new Date() });
      throw error;
    }
  }

  /**
   * Get comprehensive toggle overview summary
   */
  async getToggleOverviewSummary(
    timeRange: TimeRange = TimeRange.LAST_24_HOURS
  ): Promise<ToggleOverviewSummary> {

    try {
      const cacheKey = `overview:summary:${timeRange}`;
      
      // Check cache first
      if (this.config.performance.enableCaching && this.metricsCache.has(cacheKey)) {
        return this.metricsCache.get(cacheKey);
      }
      
      // Get basic toggle statistics
      const basicStats = await this.getBasicToggleStatistics();
      
      // Get category breakdown
      const categoryStats = await this.getCategoryStatistics();
      
      // Get priority breakdown
      const priorityStats = await this.getPriorityStatistics();
      
      // Calculate health score and detect issues
      const { healthScore, healthStatus, issues } = await this.calculateHealthMetrics();
      
      // Get recent activity metrics
      const recentActivity = await this.getRecentActivityMetrics(timeRange);
      
      // Get performance metrics
      const performanceMetrics = await this.getPerformanceMetrics(timeRange);
      
      // Calculate trend indicators
      const trends = await this.calculateTrendIndicators(timeRange);
      
      // Determine system status
      const systemStatus = this.determineSystemStatus(healthStatus, issues);
      
      const summary: ToggleOverviewSummary = {
        ...basicStats,
        categoryStats,
        priorityStats,
        healthScore,
        healthStatus,
        activeIssues: issues,
        ...recentActivity,
        ...performanceMetrics,
        trends,
        systemStatus,
        lastUpdated: new Date()
      };
      
      // Cache the result
      if (this.config.performance.enableCaching) {
        this.metricsCache.set(cacheKey, summary);
        setTimeout(() => this.metricsCache.delete(cacheKey), this.config.performance.cacheTTL * 1000);
      }
      
      this.emit('overview:summary_generated', { timeRange, summary });
      
      return summary;
      
    } catch (error) {
      this.emit('overview:error', { error: error.message, timeRange });
      throw new Error(`Failed to get toggle overview summary: ${error.message}`);
    }
  }

  /**
   * Generate analytics data for specified metrics and time range
   */
  async generateAnalyticsData(
    metrics: MetricType[],
    timeRange: TimeRange,
    customRange?: { start: Date; end: Date }
  ): Promise<AnalyticsData> {

    try {
      // Get time range boundaries
      const { startTime, endTime } = this.getTimeRangeBoundaries(timeRange, customRange);
      
      // Collect data points for the specified time range
      const dataPoints = await this.collectDataPoints(metrics, startTime, endTime);
      
      // Calculate aggregated metrics
      const aggregatedMetrics = this.calculateAggregatedMetrics(dataPoints, metrics);
      
      // Perform trend analysis
      const trends = await this.performTrendAnalysis(dataPoints, metrics);
      
      // Calculate correlations between metrics
      const correlations = this.calculateCorrelations(dataPoints, metrics);
      
      // Detect anomalies
      const anomalies = await this.detectAnomalies(dataPoints, metrics);
      
      // Generate insights
      const insights = await this.generateInsights(dataPoints, trends, correlations, anomalies);
      
      const analyticsData: AnalyticsData = {
        timeRange,
        dataPoints,
        aggregatedMetrics,
        trends,
        correlations,
        anomalies,
        insights
      };
      
      this.emit('analytics:data_generated', { metrics, timeRange, analyticsData });
      
      return analyticsData;
      
    } catch (error) {
      this.emit('analytics:error', { error: error.message, metrics, timeRange });
      throw new Error(`Failed to generate analytics data: ${error.message}`);
    }
  }

  /**
   * Create or update dashboard widget
   */
  async createDashboardWidget(
    widgetData: Partial<DashboardWidget>,
    createdBy: string
  ): Promise<{ widgetId: string; widget: DashboardWidget }> {

    try {
      const widgetId = crypto.randomUUID();
      
      const widget: DashboardWidget = {
        widgetId,
        widgetType: widgetData.widgetType!,
        title: widgetData.title!,
        description: widgetData.description || '',
        position: widgetData.position || { x: 0, y: 0, width: 4, height: 3 },
        dataSource: widgetData.dataSource!,
        metrics: widgetData.metrics || [],
        timeRange: widgetData.timeRange || TimeRange.LAST_24_HOURS,
        filters: widgetData.filters || {},
        chartType: widgetData.chartType,
        colorScheme: widgetData.colorScheme,
        displayOptions: widgetData.displayOptions || {},
        autoRefresh: widgetData.autoRefresh !== false,
        refreshInterval: widgetData.refreshInterval || this.config.dashboard.refreshRate,
        drillDownEnabled: widgetData.drillDownEnabled !== false,
        clickActions: widgetData.clickActions || [],
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: widgetData.isPublic !== false,
        tags: widgetData.tags || []
      };
      
      // Save to database
      await this.database.query(`
        INSERT INTO epic17_dashboard_widgets (
          widget_id, widget_type, title, description, position, data_source,
          metrics, time_range, filters, chart_type, color_scheme, display_options,
          auto_refresh, refresh_interval, drill_down_enabled, click_actions,
          created_by, created_at, updated_at, is_public, tags
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW(), $18, $19

      `, [
        widget.widgetId, widget.widgetType, widget.title, widget.description,
        JSON.stringify(widget.position), widget.dataSource,
        JSON.stringify(widget.metrics), widget.timeRange, JSON.stringify(widget.filters),
        widget.chartType, widget.colorScheme, JSON.stringify(widget.displayOptions),
        widget.autoRefresh, widget.refreshInterval, widget.drillDownEnabled,
        JSON.stringify(widget.clickActions), widget.createdBy, widget.isPublic,
        JSON.stringify(widget.tags)
      ]);
      
      // Clear dashboard cache
      this.dashboardCache.clear();
      
      // Audit the creation
      await this.auditService.logAction('dashboard_widget_created', createdBy, {
        widgetId,
        widgetType: widget.widgetType,
        title: widget.title
      });
      
      this.emit('widget:created', { widgetId, widget, createdBy });
      
      return { widgetId, widget };
      
    } catch (error) {
      this.emit('widget:creation_error', { error: error.message, widgetData, createdBy });
      throw new Error(`Failed to create dashboard widget: ${error.message}`);
    }
  }

  /**
   * Get dashboard widgets for user
   */
  async getDashboardWidgets(
    userId: string,
    dashboardId?: string
  ): Promise<DashboardWidget[]> {

    try {
      const cacheKey = `dashboard:${userId}:${dashboardId || 'default'}`;
      
      // Check cache
      if (this.dashboardCache.has(cacheKey)) {
        return this.dashboardCache.get(cacheKey)!;
      }
      
      let query = `
        SELECT * FROM epic17_dashboard_widgets 
        WHERE (created_by = $1 OR is_public = true)
      `;
      const params: any[] = [userId];
      
      if (dashboardId) {
        query += ' AND dashboard_id = $2';
        params.push(dashboardId);
      }
      
      query += ' ORDER BY position->>\'x\', position->>\'y\'';
      
      const result = await this.database.query(query, params);
      
      const widgets = result.rows.map(row => this.parseWidgetFromDatabase(row));
      
      // Cache the result
      this.dashboardCache.set(cacheKey, widgets);
      
      return widgets;
      
    } catch (error) {
      this.emit('dashboard:fetch_error', { error: error.message, userId, dashboardId });
      throw new Error(`Failed to get dashboard widgets: ${error.message}`);
    }
  }

  /**
   * Generate toggle report
   */
  async generateReport(
    reportConfig: {
      reportType: 'summary' | 'detailed' | 'trend' | 'health' | 'compliance';
      timeRange: TimeRange;
      filters?: Record<string, any>;
      metrics?: MetricType[];
      format?: ReportFormat;
      recipients?: string[];
  }
    generatedBy: string
  ): Promise<{ reportId: string; report: ToggleReport }> {

    try {
      const reportId = crypto.randomUUID();
      
      // Get analytics data for the report
      const analyticsData = await this.generateAnalyticsData(
        reportConfig.metrics || [MetricType.USAGE_COUNT, MetricType.RESPONSE_TIME, MetricType.ERROR_RATE],
        reportConfig.timeRange
      );
      
      // Generate executive summary
      const executiveSummary = this.generateExecutiveSummary(analyticsData, reportConfig.reportType);
      
      // Extract key findings
      const keyFindings = this.extractKeyFindings(analyticsData);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(analyticsData);
      
      // Determine report period
      const { startTime, endTime } = this.getTimeRangeBoundaries(reportConfig.timeRange);
      
      const report: ToggleReport = {
        reportId,
        reportType: reportConfig.reportType,
        title: this.generateReportTitle(reportConfig.reportType, reportConfig.timeRange),
        description: this.generateReportDescription(reportConfig.reportType, reportConfig.timeRange),
        timeRange: reportConfig.timeRange,
        filters: reportConfig.filters || {},
        metrics: reportConfig.metrics || [],
        format: reportConfig.format || ReportFormat.HTML,
        executiveSummary,
        keyFindings,
        recommendations,
        dataAnalysis: analyticsData,
        generatedBy,
        generatedAt: new Date(),
        reportPeriod: { start: startTime, end: endTime },
        version: '1.0.0',
        recipients: reportConfig.recipients || [],
        deliveryMethods: ['download']
      };
      
      // Save report to database
      await this.saveReport(report);
      
      // Audit the report generation
      await this.auditService.logAction('toggle_report_generated', generatedBy, {
        reportId,
        reportType: reportConfig.reportType,
        timeRange: reportConfig.timeRange
      });
      
      this.emit('report:generated', { reportId, report, generatedBy });
      
      return { reportId, report };
      
    } catch (error) {
      this.emit('report:generation_error', { error: error.message, reportConfig, generatedBy });
      throw new Error(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Get real-time toggle metrics
   */
  async getRealTimeMetrics(
    metrics: MetricType[] = [MetricType.USAGE_COUNT, MetricType.RESPONSE_TIME, MetricType.ERROR_RATE]
  ): Promise<Record<MetricType, number>> {
    try {
      const realTimeMetrics: Record<MetricType, number> = {} as any;
      
      // Query recent data for each metric
      for (const metric of metrics) {
        const value = await this.getCurrentMetricValue(metric);
        realTimeMetrics[metric] = value;
      }
      
      this.emit('metrics:real_time_updated', { metrics: realTimeMetrics });
      
      return realTimeMetrics;
      
    } catch (error) {
      this.emit('metrics:real_time_error', { error: error.message, metrics });
      throw new Error(`Failed to get real-time metrics: ${error.message}`);
    }
  }

  // =============================================================================
  // Private Helper Methods
  // =============================================================================

  private async getBasicToggleStatistics(): Promise<{
    totalToggles: number;
    activeToggles: number;
    disabledToggles: number;
    maintenanceToggles: number;
    experimentalToggles: number;
  }> {

    const result = await this.database.query(`
      SELECT 
        COUNT(*) as total_toggles,
        COUNT(CASE WHEN current_status = 'enabled' THEN 1 END) as active_toggles,
        COUNT(CASE WHEN current_status = 'disabled' THEN 1 END) as disabled_toggles,
        COUNT(CASE WHEN current_status = 'maintenance' THEN 1 END) as maintenance_toggles,
        COUNT(CASE WHEN current_status = 'experimental' THEN 1 END) as experimental_toggles
      FROM epic17_toggle_definitions
    `);
    
    const row = result.rows[0];
    return {
      totalToggles: parseInt(row.total_toggles),
      activeToggles: parseInt(row.active_toggles),
      disabledToggles: parseInt(row.disabled_toggles),
      maintenanceToggles: parseInt(row.maintenance_toggles),
      experimentalToggles: parseInt(row.experimental_toggles)
    };
  }

  private async getCategoryStatistics(): Promise<Record<string, CategorySummary>> {
    const result = await this.database.query(`
      SELECT 
        td.category,
        COUNT(*) as total_toggles,
        COUNT(CASE WHEN td.is_enabled = true THEN 1 END) as active_toggles,
        AVG(tua.average_response_time) as avg_response_time,
        AVG(tua.error_rate) as error_rate,
        MAX(td.last_modified) as last_changed,
        COUNT(th.toggle_id) as change_frequency
      FROM epic17_toggle_definitions td
      LEFT JOIN epic17_toggle_usage_analytics tua ON td.toggle_id = tua.toggle_id
      LEFT JOIN epic17_toggle_history th ON td.toggle_id = th.toggle_id 
        AND th.changed_at >= NOW() - INTERVAL '7 days'
      GROUP BY td.category
    `);
    
    const categoryStats: Record<string, CategorySummary> = {};
    
    for (const row of result.rows) {
      categoryStats[row.category] = {
        category: row.category,
        totalToggles: parseInt(row.total_toggles),
        activeToggles: parseInt(row.active_toggles),
        healthScore: this.calculateCategoryHealthScore(row),
        avgResponseTime: parseFloat(row.avg_response_time) || 0,
        errorRate: parseFloat(row.error_rate) || 0,
        lastChanged: row.last_changed,
        changeFrequency: parseInt(row.change_frequency) || 0
      };
    }
    
    return categoryStats;
  }

  private async getPriorityStatistics(): Promise<Record<string, PrioritySummary>> {
    const result = await this.database.query(`
      SELECT 
        td.priority,
        COUNT(*) as total_toggles,
        COUNT(CASE WHEN td.is_enabled = true THEN 1 END) as active_toggles,
        COUNT(tcr.change_id) as pending_approvals,
        COUNT(th.toggle_id) as recent_failures,
        AVG(EXTRACT(EPOCH FROM (tcr.approved_at - tcr.requested_at))/3600) as avg_time_to_approval
      FROM epic17_toggle_definitions td
      LEFT JOIN epic17_toggle_change_requests tcr ON td.toggle_id = tcr.toggle_id 
        AND tcr.approval_status = 'pending'
      LEFT JOIN epic17_toggle_history th ON td.toggle_id = th.toggle_id 
        AND th.changed_at >= NOW() - INTERVAL '24 hours' 
        AND th.validation_passed = false
      GROUP BY td.priority
    `);
    
    const priorityStats: Record<string, PrioritySummary> = {};
    
    for (const row of result.rows) {
      priorityStats[row.priority] = {
        priority: row.priority,
        totalToggles: parseInt(row.total_toggles),
        activeToggles: parseInt(row.active_toggles),
        pendingApprovals: parseInt(row.pending_approvals) || 0,
        recentFailures: parseInt(row.recent_failures) || 0,
        avgTimeToApproval: parseFloat(row.avg_time_to_approval) || 0
      };
    }
    
    return priorityStats;
  }

  private async calculateHealthMetrics(): Promise<{
    healthScore: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
    issues: Issue[];
  }> {

    const issues: Issue[] = [];
    let healthScore = 100;
    
    // Check for performance issues
    const performanceIssues = await this.detectPerformanceIssues();
    issues.push(...performanceIssues);
    
    // Check for dependency violations
    const dependencyIssues = await this.detectDependencyIssues();
    issues.push(...dependencyIssues);
    
    // Check for validation failures
    const validationIssues = await this.detectValidationIssues();
    issues.push(...validationIssues);
    
    // Calculate health score based on issues
    for (const issue of issues) {
      switch (issue.severity) {
      case 'critical':
        healthScore -= 20;
        break;
      case 'high':
        healthScore -= 10;
        break;
      case 'medium':
        healthScore -= 5;
        break;
      case 'low':
        healthScore -= 2;
        break;
      }
    }
    
    healthScore = Math.max(0, healthScore);
    
    // Determine health status
    let healthStatus: 'healthy' | 'warning' | 'critical';
    if (healthScore >= 80) {
      healthStatus = 'healthy';
    } else if (healthScore >= 60) {
      healthStatus = 'warning';
    } else {
      healthStatus = 'critical';
    }
    
    return { healthScore, healthStatus, issues };
  }

  private async getRecentActivityMetrics(timeRange: TimeRange): Promise<{
    recentChanges: number;
    pendingApprovals: number;
    scheduledChanges: number;
    failedOperations: number;
  }> {

    const { startTime } = this.getTimeRangeBoundaries(timeRange);
    
    const result = await this.database.query(`
      SELECT 
        COUNT(CASE WHEN th.changed_at >= $1 THEN 1 END) as recent_changes,
        COUNT(CASE WHEN tcr.approval_status = 'pending' THEN 1 END) as pending_approvals,
        COUNT(CASE WHEN tcr.scheduled_execution IS NOT NULL AND tcr.scheduled_execution > NOW() THEN 1 END) as scheduled_changes,
        COUNT(CASE WHEN th.validation_passed = false AND th.changed_at >= $1 THEN 1 END) as failed_operations
      FROM epic17_toggle_history th
      LEFT JOIN epic17_toggle_change_requests tcr ON th.toggle_id = tcr.toggle_id
    `, [startTime]);
    
    const row = result.rows[0];
    return {
      recentChanges: parseInt(row.recent_changes) || 0,
      pendingApprovals: parseInt(row.pending_approvals) || 0,
      scheduledChanges: parseInt(row.scheduled_changes) || 0,
      failedOperations: parseInt(row.failed_operations) || 0
    };
  }

  private async getPerformanceMetrics(timeRange: TimeRange): Promise<{
    avgResponseTime: number;
    totalRequests: number;
    errorRate: number;
    uptimePercentage: number;
  }> {

    const { startTime } = this.getTimeRangeBoundaries(timeRange);
    
    const result = await this.database.query(`
      SELECT 
        AVG(average_response_time) as avg_response_time,
        SUM(total_requests) as total_requests,
        AVG(error_rate) as error_rate,
        AVG(CASE WHEN error_rate < 5 THEN 100 ELSE 100 - error_rate END) as uptime_percentage
      FROM epic17_toggle_usage_analytics
      WHERE measurement_timestamp >= $1
    `, [startTime]);
    
    const row = result.rows[0];
    return {
      avgResponseTime: parseFloat(row.avg_response_time) || 0,
      totalRequests: parseInt(row.total_requests) || 0,
      errorRate: parseFloat(row.error_rate) || 0,
      uptimePercentage: parseFloat(row.uptime_percentage) || 100
    };
  }

  private async calculateTrendIndicators(timeRange: TimeRange): Promise<Record<MetricType, TrendIndicator>> {
    const trends: Record<MetricType, TrendIndicator> = {} as any;
    
    const metrics = [MetricType.USAGE_COUNT, MetricType.RESPONSE_TIME, MetricType.ERROR_RATE];
    
    for (const metric of metrics) {
      const trendData = await this.calculateMetricTrend(metric, timeRange);
      trends[metric] = trendData;
    }
    
    return trends;
  }

  private async calculateMetricTrend(metric: MetricType, timeRange: TimeRange): Promise<TrendIndicator> {

    const { startTime } = this.getTimeRangeBoundaries(timeRange);
    const midPoint = new Date((startTime.getTime() + Date.now()) / 2);
    
    // Get current and previous period values
    const currentResult = await this.database.query(`
      SELECT AVG(${this.getMetricColumn(metric)}) as current_value
      FROM epic17_toggle_usage_analytics
      WHERE measurement_timestamp >= $1
    `, [midPoint]);
    
    const previousResult = await this.database.query(`
      SELECT AVG(${this.getMetricColumn(metric)}) as previous_value
      FROM epic17_toggle_usage_analytics
      WHERE measurement_timestamp >= $1 AND measurement_timestamp < $2
    `, [startTime, midPoint]);
    
    const currentValue = parseFloat(currentResult.rows[0]?.current_value) || 0;
    const previousValue = parseFloat(previousResult.rows[0]?.previous_value) || 0;
    
    const changePercentage = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    let direction: 'up' | 'down' | 'stable';
    if (Math.abs(changePercentage) < 5) {
      direction = 'stable';
    } else if (changePercentage > 0) {
      direction = 'up';
    } else {
      direction = 'down';
    }
    
    const significance = Math.abs(changePercentage) > 20 ? 'high' : 
      Math.abs(changePercentage) > 10 ? 'medium' :
        Math.abs(changePercentage) > 5 ? 'low' : 'none';
    
    return {
      metric,
      currentValue,
      previousValue,
      changePercentage,
      direction,
      significance
    };
  }

  private determineSystemStatus(
    healthStatus: 'healthy' | 'warning' | 'critical',
    issues: Issue[]
  ): 'operational' | 'degraded' | 'maintenance' | 'outage' {
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const maintenanceIssues = issues.filter(i => i.issueType === 'operational').length;
    
    if (criticalIssues > 2) {
      return 'outage';
    } else if (maintenanceIssues > 0) {
      return 'maintenance';
    } else if (healthStatus === 'critical') {
      return 'degraded';
    } else {
      return 'operational';
    }
  }

  private getTimeRangeBoundaries(timeRange: TimeRange, customRange?: { start: Date; end: Date }): { startTime: Date; endTime: Date } {
    const endTime = new Date();
    let startTime: Date;
    
    if (timeRange === TimeRange.CUSTOM && customRange) {
      return { startTime: customRange.start, endTime: customRange.end };
    }
    
    switch (timeRange) {
    case TimeRange.LAST_HOUR:
      startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
      break;
    case TimeRange.LAST_4_HOURS:
      startTime = new Date(endTime.getTime() - 4 * 60 * 60 * 1000);
      break;
    case TimeRange.LAST_24_HOURS:
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
      break;
    case TimeRange.LAST_7_DAYS:
      startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case TimeRange.LAST_30_DAYS:
      startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case TimeRange.LAST_90_DAYS:
      startTime = new Date(endTime.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    }
    
    return { startTime, endTime };
  }

  private async collectDataPoints(
    metrics: MetricType[],
    startTime: Date,
    endTime: Date
  ): Promise<DataPoint[]> {

    const result = await this.database.query(`
      SELECT 
        measurement_timestamp,
        total_requests,
        average_response_time,
        error_rate,
        success_rate,
        access_count
      FROM epic17_toggle_usage_analytics
      WHERE measurement_timestamp >= $1 AND measurement_timestamp <= $2
      ORDER BY measurement_timestamp
    `, [startTime, endTime]);
    
    return result.rows.map(row => ({
      timestamp: row.measurement_timestamp,
      metrics: {
        [MetricType.USAGE_COUNT]: row.access_count || 0,
        [MetricType.RESPONSE_TIME]: row.average_response_time || 0,
        [MetricType.ERROR_RATE]: row.error_rate || 0,
        [MetricType.SUCCESS_RATE]: row.success_rate || 0
      } as Record<MetricType, number>,
      metadata: {}
    }));
  }

  private calculateAggregatedMetrics(dataPoints: DataPoint[], metrics: MetricType[]): Record<MetricType, AggregatedMetric> {
    const aggregated: Record<MetricType, AggregatedMetric> = {} as any;
    
    for (const metric of metrics) {
      const values = dataPoints.map(dp => dp.metrics[metric]).filter(v => v !== undefined);
      
      if (values.length === 0) {
        continue;
      }
      
      const total = values.reduce((sum, val) => sum + val, 0);
      const average = total / values.length;
      const minimum = Math.min(...values);
      const maximum = Math.max(...values);
      
      // Calculate percentiles
      const sortedValues = [...values].sort((a, b) => a - b);
      const percentiles = {
        '50': sortedValues[Math.floor(sortedValues.length * 0.5)],
        '90': sortedValues[Math.floor(sortedValues.length * 0.9)],
        '95': sortedValues[Math.floor(sortedValues.length * 0.95)],
        '99': sortedValues[Math.floor(sortedValues.length * 0.99)]
      };
      
      // Calculate variance and standard deviation
      const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
      const standardDeviation = Math.sqrt(variance);
      
      aggregated[metric] = {
        metric,
        total,
        average,
        minimum,
        maximum,
        percentiles,
        variance,
        standardDeviation
      };
    }
    
    return aggregated;
  }

  private async performTrendAnalysis(dataPoints: DataPoint[], metrics: MetricType[]): Promise<TrendAnalysis[]> {

    const trends: TrendAnalysis[] = [];
    
    for (const metric of metrics) {
      const values = dataPoints.map(dp => dp.metrics[metric]).filter(v => v !== undefined);
      
      if (values.length < 3) {
        continue; // Need at least 3 points for trend analysis
      }
      
      // Simple linear trend calculation
      const n = values.length;
      const xValues = Array.from({ length: n }, (_, i) => i);
      const xMean = (n - 1) / 2;
      const yMean = values.reduce((sum, val) => sum + val, 0) / n;
      
      const slope = xValues.reduce((sum, x, i) => sum + (x - xMean) * (values[i] - yMean), 0) / 
                   xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
      
      const direction = Math.abs(slope) < 0.1 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing';
      const strength = Math.min(1, Math.abs(slope) / Math.max(...values));
      
      trends.push({
        metric,
        trendType: 'linear',
        direction,
        strength,
        confidence: 0.8, // Simplified confidence calculation
        forecast: [] // Would implement actual forecasting
      });
    }
    
    return trends;
  }

  private calculateCorrelations(dataPoints: DataPoint[], metrics: MetricType[]): Correlation[] {
    const correlations: Correlation[] = [];
    
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const values1 = dataPoints.map(dp => dp.metrics[metric1]).filter(v => v !== undefined);
        const values2 = dataPoints.map(dp => dp.metrics[metric2]).filter(v => v !== undefined);
        
        if (values1.length !== values2.length || values1.length < 3) {
          continue;
        }
        
        const correlation = this.calculatePearsonCorrelation(values1, values2);
        
        correlations.push({
          metric1,
          metric2,
          correlationCoefficient: correlation,
          significance: Math.abs(correlation),
          relationship: correlation > 0.3 ? 'positive' : correlation < -0.3 ? 'negative' : 'none'
        });
      }
    }
    
    return correlations;
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    const sumYY = y.reduce((sum, val) => sum + val * val, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  private async detectAnomalies(dataPoints: DataPoint[], metrics: MetricType[]): Promise<Anomaly[]> {

    const anomalies: Anomaly[] = [];
    
    for (const metric of metrics) {
      const values = dataPoints.map(dp => dp.metrics[metric]).filter(v => v !== undefined);
      
      if (values.length < 10) {
        continue; // Need sufficient data for anomaly detection
      }
      
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
      
      // Simple anomaly detection using standard deviation
      for (let i = 0; i < dataPoints.length; i++) {
        const value = dataPoints[i].metrics[metric];
        if (value === undefined) continue;
        
        const deviation = Math.abs(value - mean) / stdDev;
        
        if (deviation > 3) { // 3 standard deviations
          anomalies.push({
            timestamp: dataPoints[i].timestamp,
            metric,
            actualValue: value,
            expectedValue: mean,
            deviation,
            severity: deviation > 4 ? 'high' : deviation > 3.5 ? 'medium' : 'low',
            possibleCauses: this.generateAnomalyCauses(metric, value, mean)
          });
        }
      }
    }
    
    return anomalies;
  }

  private generateAnomalyCauses(metric: MetricType, actualValue: number, expectedValue: number): string[] {
    const causes: string[] = [];
    
    switch (metric) {
    case MetricType.RESPONSE_TIME:
      if (actualValue > expectedValue) {
        causes.push('High system load', 'Database performance issues', 'Network latency');
      } else {
        causes.push('Caching effectiveness', 'System optimization');
      }
      break;
    case MetricType.ERROR_RATE:
      if (actualValue > expectedValue) {
        causes.push('System errors', 'Configuration issues', 'Dependency failures');
      }
      break;
    case MetricType.USAGE_COUNT:
      if (actualValue > expectedValue) {
        causes.push('Traffic spike', 'Marketing campaign', 'System issue causing retries');
      } else {
        causes.push('System downtime', 'User behavior change', 'Feature deprecation');
      }
      break;
    }
    
    return causes;
  }

  private async generateInsights(
    dataPoints: DataPoint[],
    trends: TrendAnalysis[],
    correlations: Correlation[],
    anomalies: Anomaly[]
  ): Promise<Insight[]> {

    const insights: Insight[] = [];
    
    // Generate trend-based insights
    for (const trend of trends) {
      if (trend.direction === 'increasing' && trend.metric === MetricType.ERROR_RATE) {
        insights.push({
          insightId: crypto.randomUUID(),
          insightType: 'warning',
          title: 'Increasing Error Rate Detected',
          description: `Error rate has been ${trend.direction} with ${(trend.strength * 100).toFixed(1)}% strength`,
          confidence: trend.confidence,
          impact: trend.strength > 0.5 ? 'high' : 'medium',
          actionRequired: true,
          suggestedActions: ['Investigate error causes', 'Review recent changes', 'Monitor system health'],
          relatedMetrics: [trend.metric]
        });
      }
    }
    
    // Generate anomaly-based insights
    const criticalAnomalies = anomalies.filter(a => a.severity === 'high');
    if (criticalAnomalies.length > 0) {
      insights.push({
        insightId: crypto.randomUUID(),
        insightType: 'warning',
        title: 'Critical Anomalies Detected',
        description: `${criticalAnomalies.length} critical anomalies detected across metrics`,
        confidence: 0.9,
        impact: 'high',
        actionRequired: true,
        suggestedActions: ['Investigate anomalies', 'Check system status', 'Review alerts'],
        relatedMetrics: [...new Set(criticalAnomalies.map(a => a.metric))]
      });
    }
    
    // Generate correlation-based insights
    const strongCorrelations = correlations.filter(c => Math.abs(c.correlationCoefficient) > 0.7);
    for (const correlation of strongCorrelations) {
      insights.push({
        insightId: crypto.randomUUID(),
        insightType: 'recommendation',
        title: 'Strong Metric Correlation Found',
        description: `Strong ${correlation.relationship} correlation (${(correlation.correlationCoefficient * 100).toFixed(1)}%) between ${correlation.metric1} and ${correlation.metric2}`,
        confidence: correlation.significance,
        impact: 'medium',
        actionRequired: false,
        suggestedActions: ['Monitor correlated metrics together', 'Consider optimization opportunities'],
        relatedMetrics: [correlation.metric1, correlation.metric2]
      });
    }
    
    return insights;
  }

  private generateExecutiveSummary(analyticsData: AnalyticsData, reportType: string): string {
    const keyMetrics = Object.keys(analyticsData.aggregatedMetrics);
    const criticalAnomalies = analyticsData.anomalies.filter(a => a.severity === 'high').length;
    const strongTrends = analyticsData.trends.filter(t => t.strength > 0.5).length;
    
    return `This ${reportType} report analyzes ${keyMetrics.length} key metrics across the toggle management system. ` +
           `During the reporting period, ${criticalAnomalies} critical anomalies and ${strongTrends} significant trends were identified. ` +
           `The analysis includes ${analyticsData.insights.length} actionable insights for system optimization.`;
  }

  private extractKeyFindings(analyticsData: AnalyticsData): string[] {
    const findings: string[] = [];
    
    // Extract findings from aggregated metrics
    for (const [metric, data] of Object.entries(analyticsData.aggregatedMetrics)) {
      if (data.average > data.percentiles['95']) {
        findings.push(`${metric} showing elevated average above 95th percentile`);
      }
    }
    
    // Extract findings from trends
    const increasingTrends = analyticsData.trends.filter(t => t.direction === 'increasing' && t.strength > 0.3);
    if (increasingTrends.length > 0) {
      findings.push(`${increasingTrends.length} metrics showing increasing trends`);
    }
    
    // Extract findings from anomalies
    const recentAnomalies = analyticsData.anomalies.filter(a => 
      new Date(a.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    );
    if (recentAnomalies.length > 0) {
      findings.push(`${recentAnomalies.length} anomalies detected in the last 24 hours`);
    }
    
    return findings;
  }

  private generateRecommendations(analyticsData: AnalyticsData): string[] {
    return analyticsData.insights
      .filter(insight => insight.actionRequired)
      .flatMap(insight => insight.suggestedActions);
  }

  private generateReportTitle(reportType: string, timeRange: TimeRange): string {
    const timeRangeText = timeRange.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `Toggle ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${timeRangeText}`;
  }

  private generateReportDescription(reportType: string, timeRange: TimeRange): string {
    return `Comprehensive ${reportType} analysis of toggle system performance and usage for ${timeRange} period`;
  }

  private async saveReport(report: ToggleReport): Promise<void> {

    await this.database.query(`
      INSERT INTO epic17_toggle_reports (
        report_id, report_type, title, description, time_range, filters,
        metrics, format, executive_summary, key_findings, recommendations,
        data_analysis, generated_by, generated_at, report_period, version,
        recipients, delivery_methods
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18

    `, [
      report.reportId, report.reportType, report.title, report.description,
      report.timeRange, JSON.stringify(report.filters), JSON.stringify(report.metrics),
      report.format, report.executiveSummary, JSON.stringify(report.keyFindings),
      JSON.stringify(report.recommendations), JSON.stringify(report.dataAnalysis),
      report.generatedBy, report.generatedAt, JSON.stringify(report.reportPeriod),
      report.version, JSON.stringify(report.recipients), JSON.stringify(report.deliveryMethods)
    ]);
  }

  private async getCurrentMetricValue(metric: MetricType): Promise<number> {

    const column = this.getMetricColumn(metric);
    const result = await this.database.query(`
      SELECT AVG(${column}) as current_value
      FROM epic17_toggle_usage_analytics
      WHERE measurement_timestamp >= NOW() - INTERVAL '5 minutes'
    `);
    
    return parseFloat(result.rows[0]?.current_value) || 0;
  }

  private getMetricColumn(metric: MetricType): string {
    switch (metric) {
    case MetricType.USAGE_COUNT:
      return 'access_count';
    case MetricType.RESPONSE_TIME:
      return 'average_response_time';
    case MetricType.ERROR_RATE:
      return 'error_rate';
    case MetricType.SUCCESS_RATE:
      return '(100 - error_rate)';
    default:
      return 'total_requests';
    }
  }

  private calculateCategoryHealthScore(row: any): number {
    let score = 100;
    
    // Penalize high error rates
    const errorRate = parseFloat(row.error_rate) || 0;
    score -= Math.min(50, errorRate * 2);
    
    // Penalize slow response times
    const responseTime = parseFloat(row.avg_response_time) || 0;
    if (responseTime > 1000) {
      score -= Math.min(30, (responseTime - 1000) / 100);
    }
    
    // Penalize frequent changes
    const changeFrequency = parseInt(row.change_frequency) || 0;
    if (changeFrequency > 10) {
      score -= Math.min(20, (changeFrequency - 10) * 2);
    }
    
    return Math.max(0, Math.round(score));
  }

  private async detectPerformanceIssues(): Promise<Issue[]> {

    const issues: Issue[] = [];
    
    const result = await this.database.query(`
      SELECT td.toggle_id, td.name, tua.average_response_time, tua.error_rate
      FROM epic17_toggle_definitions td
      JOIN epic17_toggle_usage_analytics tua ON td.toggle_id = tua.toggle_id
      WHERE tua.measurement_timestamp >= NOW() - INTERVAL '1 hour'
        AND (tua.average_response_time > 2000 OR tua.error_rate > 10)
    `);
    
    for (const row of result.rows) {
      if (row.average_response_time > 2000) {
        issues.push({
          issueId: crypto.randomUUID(),
          issueType: 'performance',
          severity: row.average_response_time > 5000 ? 'critical' : 'high',
          title: `High Response Time: ${row.name}`,
          description: `Toggle ${row.name} has response time of ${row.average_response_time}ms`,
          affectedToggles: [row.toggle_id],
          detectedAt: new Date(),
          resolved: false
        });
      }
      
      if (row.error_rate > 10) {
        issues.push({
          issueId: crypto.randomUUID(),
          issueType: 'performance',
          severity: row.error_rate > 25 ? 'critical' : 'high',
          title: `High Error Rate: ${row.name}`,
          description: `Toggle ${row.name} has error rate of ${row.error_rate}%`,
          affectedToggles: [row.toggle_id],
          detectedAt: new Date(),
          resolved: false
        });
      }
    }
    
    return issues;
  }

  private async detectDependencyIssues(): Promise<Issue[]> {

    const issues: Issue[] = [];
    
    const result = await this.database.query(`
      SELECT td1.toggle_id, td1.name, td1.current_status,
             td2.toggle_id as dependent_id, td2.name as dependent_name, td2.current_status as dependent_status,
             dep.dependency_type
      FROM epic17_toggle_definitions td1
      JOIN epic17_toggle_dependencies dep ON td1.toggle_id = dep.source_toggle_id
      JOIN epic17_toggle_definitions td2 ON dep.dependent_toggle_id = td2.toggle_id
      WHERE dep.is_active = true AND dep.enforced = true
        AND ((dep.dependency_type = 'requires' AND td1.current_status = 'enabled' AND td2.current_status != 'enabled')
         OR (dep.dependency_type = 'conflicts' AND td1.current_status = 'enabled' AND td2.current_status = 'enabled'))
    `);
    
    for (const row of result.rows) {
      issues.push({
        issueId: crypto.randomUUID(),
        issueType: 'dependency',
        severity: 'high',
        title: `Dependency Violation: ${row.name}`,
        description: `Toggle ${row.name} ${row.dependency_type} ${row.dependent_name} but dependency is not satisfied`,
        affectedToggles: [row.toggle_id, row.dependent_id],
        detectedAt: new Date(),
        resolved: false
      });
    }
    
    return issues;
  }

  private async detectValidationIssues(): Promise<Issue[]> {

    const issues: Issue[] = [];
    
    const result = await this.database.query(`
      SELECT th.toggle_id, td.name, COUNT(*) as failure_count
      FROM epic17_toggle_history th
      JOIN epic17_toggle_definitions td ON th.toggle_id = td.toggle_id
      WHERE th.changed_at >= NOW() - INTERVAL '1 hour'
        AND th.validation_passed = false
      GROUP BY th.toggle_id, td.name
      HAVING COUNT(*) > 2
    `);
    
    for (const row of result.rows) {
      issues.push({
        issueId: crypto.randomUUID(),
        issueType: 'validation',
        severity: 'medium',
        title: `Validation Failures: ${row.name}`,
        description: `Toggle ${row.name} has ${row.failure_count} validation failures in the last hour`,
        affectedToggles: [row.toggle_id],
        detectedAt: new Date(),
        resolved: false
      });
    }
    
    return issues;
  }

  private parseWidgetFromDatabase(row: any): DashboardWidget {
    return {
      widgetId: row.widget_id,
      widgetType: row.widget_type,
      title: row.title,
      description: row.description,
      position: JSON.parse(row.position),
      dataSource: row.data_source,
      metrics: JSON.parse(row.metrics),
      timeRange: row.time_range,
      filters: JSON.parse(row.filters || '{}'),
      chartType: row.chart_type,
      colorScheme: row.color_scheme,
      displayOptions: JSON.parse(row.display_options || '{}'),
      autoRefresh: row.auto_refresh,
      refreshInterval: row.refresh_interval,
      drillDownEnabled: row.drill_down_enabled,
      clickActions: JSON.parse(row.click_actions || '[]'),
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isPublic: row.is_public,
      tags: JSON.parse(row.tags || '[]')
    };
  }

  private async loadDashboardConfiguration(): Promise<void> {

    // Load default dashboard widgets if needed
    // This would typically load from configuration or database
  }

  private setupDataRefresh(): void {
    this.refreshInterval = setInterval(async () => {
      try {
        // Clear caches to force refresh
        this.metricsCache.clear();
        this.dashboardCache.clear();
        
        this.emit('data:refreshed', { timestamp: new Date() });
      } catch (error) {
        this.emit('data:refresh_error', { error: error.message });
      }
    }, this.config.dashboard.refreshRate * 1000);
  }

  private setupHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const { healthScore, healthStatus, issues } = await this.calculateHealthMetrics();
        
        // Check if health status has changed significantly
        const previousHealth = this.metricsCache.get('previous_health_score') || 100;
        if (Math.abs(healthScore - previousHealth) > 10) {
          this.emit('health:status_changed', { 
            previousScore: previousHealth,
            currentScore: healthScore,
            status: healthStatus,
            issues
          });
        }
        
        this.metricsCache.set('previous_health_score', healthScore);
        
      } catch (error) {
        this.emit('health:check_error', { error: error.message });
      }
    }, this.config.healthMonitoring.healthCheckInterval * 1000);
  }

  /**
   * Cleanup service resources
   */
  async cleanup(): Promise<void> {

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.dashboardCache.clear();
    this.metricsCache.clear();
    this.removeAllListeners();
  }
}

// Export service for Epic 17 implementation
export default Epic17ToggleOverviewService;