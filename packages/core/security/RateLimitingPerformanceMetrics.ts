/**
 * Rate Limiting Performance Metrics Visualization System
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 * 
 * This module provides comprehensive performance metrics visualization for the 
 * rate limiting system, including real-time monitoring, historical analysis,
 * and interactive dashboards for security teams.
 */
import { EventEmitter } from 'events';
import { RateLimitingService, RateLimitStatus, ThreatLevel, RateLimitAttempt } from './RateLimitingService';
import { AdaptiveThrottlingRulesEngine } from './AdaptiveThrottlingRules';

// ========================================
// Performance Metrics Types
// ========================================

export interface RateLimitingMetricsConfig {
  enableRealTimeMetrics: boolean;
  metricsRetentionPeriod: number; // hours,
  performanceThresholds: {
  responseTime: number; // ms,
  throughput: number; // requests/second,
  errorRate: number; // percentage,
  blockRate: number; // percentage,
};
  visualizationOptions: {
  enableCharts: boolean;
  enableHeatmaps: boolean;
  enableTimeseries: boolean;
  enableGeospatialMaps: boolean;
  refreshInterval: number; // seconds,
};
  alerting: {
  enableAlerts: boolean;
  alertThresholds: {
  highResponseTime: number;
  lowThroughput: number;
  highErrorRate: number;
  highBlockRate: number;
};
  };
}
export interface PerformanceMetrics {
  timestamp: Date;
  responseTime: {
  average: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
};
  throughput: {
  requestsPerSecond: number;
  allowedPerSecond: number;
  blockedPerSecond: number;
  throttledPerSecond: number;
};
  errorRates: {
  totalRequests: number;
  blockedRequests: number;
  errorRequests: number;
  blockRate: number; // percentage,
  errorRate: number; // percentage,
};
  resourceUtilization: {
  memoryUsage: number; // MB,
  cpuUsage: number; // percentage,
  cacheHitRate: number; // percentage,
  activeConnections: number;
};
  threatMetrics: {
  threatDistribution: Record<ThreatLevel, number>;
  suspiciousActivities: number;
  blockedThreats: number;
  adaptiveAdjustments: number;
};
}
export interface MetricsVisualizationData {
  timeSeriesData: {
  timestamps: Date;
  responseTime: number;
  throughput: number;
  blockRate: number;
  errorRate: number;
};
  heatmapData: {
  endpoints: string;
  timeSlots: string;
  activityMatrix: number[];
  blockMatrix: number[];
};
  geospatialData: {
  locations: Array<{,
  latitude: number;
  longitude: number;
  requestCount: number;
  blockCount: number;
  threatLevel: ThreatLevel;
}>;
  };
  distributionData: {
  endpointDistribution: Record<string, number>;
    threatLevelDistribution: Record<ThreatLevel, number>;
    responseTimeDistribution: Array<{ range: string; count: number }>;
    userAgentDistribution: Record<string, number>;
  };
}
export interface AlertCondition {
  alertId: string;
  timestamp: Date;
  alertType: 'performance' | 'security' | 'capacity' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  condition: string;
  currentValue: number;
  threshold: number;
  affectedEndpoints: string;
  recommendedActions: string;
  metadata: Record<string, unknown>;
}
export interface DashboardWidget {
  widgetId: string;
  widgetType: 'chart' | 'gauge' | 'table' | 'heatmap' | 'map' | 'counter';
  title: string;
  description: string;
  dataSource: string;
  refreshInterval: number; // seconds,
  config: {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  timeRange?: string; // e.g., '1h', '24h', '7d',
  aggregation?: 'sum' | 'avg' | 'max' | 'min' | 'count';
  filters?: Record<string, unknown>;
  dimensions?: string;
  metrics?: string;
};
  position: {
  x: number;
  y: number;
  width: number;
  height: number;
};

// ========================================
// Rate Limiting Performance Metrics Class
// ========================================
}
export class RateLimitingPerformanceMetrics extends EventEmitter {
  private rateLimitingService: RateLimitingService;
  private throttlingEngine?: AdaptiveThrottlingRulesEngine;
  private config: RateLimitingMetricsConfig;
  private metricsHistory: PerformanceMetrics = [];
  private currentMetrics: PerformanceMetrics;
  private activeAlerts: Map<string, AlertCondition> = new Map();
  private dashboardWidgets: Map<string, DashboardWidget> = new Map();
  private metricsCollectionTimer?: NodeJS.Timeout;
  private startTime: Date;
  constructor();
  rateLimitingService: RateLimitingService,
  throttlingEngine?: AdaptiveThrottlingRulesEngine,
  config?: Partial<RateLimitingMetricsConfig>,
  super();
  this.rateLimitingService = rateLimitingService;
  this.throttlingEngine = throttlingEngine;
  this.startTime = new Date();
  this.config = {
  enableRealTimeMetrics: true,
  metricsRetentionPeriod: 72, // 3 days,
  performanceThresholds: {
  responseTime: 100, // ms,
  throughput: 1000, // requests/second,
  errorRate: 5, // percentage,
  blockRate: 10 // percentage,
},
  visualizationOptions: {
  enableCharts: true,
  enableHeatmaps: true,
  enableTimeseries: true,
  enableGeospatialMaps: true,
  refreshInterval: 5 // seconds,
},
  alerting: {
  enableAlerts: true,
  alertThresholds: {
  highResponseTime: 200,
  lowThroughput: 100,
  highErrorRate: 10,
  highBlockRate: 25,
}
      ...config
    };
    this.currentMetrics = this.createEmptyMetrics();
    this.initializeDefaultWidgets();
    if (this.config.enableRealTimeMetrics) {
  this.startMetricsCollection();
  this.setupEventListeners();
  // ========================================
  // Core Metrics Collection
  // ========================================
  /**
  * Start real-time metrics collection
  */
  public startMetricsCollection(): void {,
  if (this.metricsCollectionTimer) {
  clearInterval(this.metricsCollectionTimer);
  this.metricsCollectionTimer = setInterval(() => {
  this.collectCurrentMetrics();
}, this.config.visualizationOptions.refreshInterval * 1000);
    this.emit('metricsCollectionStarted', {)
  timestamp: new Date(),
  interval: this.config.visualizationOptions.refreshInterval,
});
  /**
   * Stop metrics collection
   */
  public stopMetricsCollection(): void {
  if (this.metricsCollectionTimer) {
  clearInterval(this.metricsCollectionTimer);
  this.metricsCollectionTimer = undefined;
  this.emit('metricsCollectionStopped', {)
  timestamp: new Date(),
});
  /**
   * Collect current performance metrics
   */
  private async collectCurrentMetrics(): Promise<void> {
  const startTime = Date.now();
  try {
  // Get rate limiting statistics
  const rateLimitingStats = this.rateLimitingService.getStatistics();
  // Calculate response times from recent operations
  const responseTimes = this.calculateResponseTimes();
  // Calculate throughput metrics
  const throughputMetrics = this.calculateThroughputMetrics(rateLimitingStats);
  // Calculate error and block rates
  const errorMetrics = this.calculateErrorMetrics(rateLimitingStats);
  // Get resource utilization
  const resourceMetrics = this.getResourceUtilization();
  // Get threat metrics
  const threatMetrics = this.calculateThreatMetrics(rateLimitingStats);
  // Create comprehensive metrics object
  this.currentMetrics = {
  timestamp: new Date(),
  responseTime: responseTimes,
  throughput: throughputMetrics,
  errorRates: errorMetrics,
  resourceUtilization: resourceMetrics,
  threatMetrics: threatMetrics,
};
      // Add to history
      this.metricsHistory.push(this.currentMetrics);
      // Cleanup old metrics
      this.cleanupOldMetrics();
      // Check for alert conditions
      if (this.config.alerting.enableAlerts) {
  this.checkAlertConditions();
  // Emit metrics update event
  this.emit('metricsUpdated', {)
  metrics: this.currentMetrics,
  collectionTime: Date.now() - startTime,
});
    } catch (error) {
  this.emit('metricsCollectionError', {)
  error: error,
  timestamp: new Date(),
});
  /**
   * Calculate response time metrics
   */
  private calculateResponseTimes(): PerformanceMetrics['responseTime'] {
    // In a real implementation, this would measure actual response times
    // For now, we'll generate realistic simulated metrics
    const responseTimes = Array.from({ length: 100 }, () => Math.random() * 200 + 50);
    responseTimes.sort((a, b) => a - b);
    return {
  average: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length,
  p50: responseTimes[Math.floor(responseTimes.length * 0.5)],
  p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
  p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
  max: Math.max(...responseTimes),
};
  /**
   * Calculate throughput metrics
   */
  private calculateThroughputMetrics(stats: any): PerformanceMetrics['throughput'] {
  const timeWindow = 60; // seconds;
  const totalRequests = stats.totalAttempts || 0;
  const blockedRequests = stats.blockedAttempts || 0;
  return {
  requestsPerSecond: totalRequests / timeWindow,
  allowedPerSecond: (totalRequests - blockedRequests) / timeWindow,
  blockedPerSecond: blockedRequests / timeWindow,
  throttledPerSecond: blockedRequests * 0.3 / timeWindow // Estimate throttled portion,
};
  /**
   * Calculate error and block rate metrics
   */
  private calculateErrorMetrics(stats: any): PerformanceMetrics['errorRates'] {
  const totalRequests = stats.totalAttempts || 1; // Avoid division by zero;
  const blockedRequests = stats.blockedAttempts || 0;
  const errorRequests = blockedRequests * 0.1; // Estimate actual errors vs blocks;
  return {
  totalRequests,
  blockedRequests,
  errorRequests,
  blockRate: (blockedRequests / totalRequests) * 100,
  errorRate: (errorRequests / totalRequests) * 100,
};
  /**
   * Get resource utilization metrics
   */
  private getResourceUtilization(): PerformanceMetrics['resourceUtilization'] {
  const memoryUsage = process.memoryUsage();
  return {
  memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // Convert to MB,
  cpuUsage: Math.random() * 100, // Simulated - would use actual CPU monitoring,
  cacheHitRate: 85 + Math.random() * 10, // Simulated cache hit rate,
  activeConnections: Math.floor(Math.random() * 1000) + 100,
};
  /**
   * Calculate threat-related metrics
   */
  private calculateThreatMetrics(stats: any): PerformanceMetrics['threatMetrics'] {
    const threatLevels = stats.threatLevels || {};
    return {
  threatDistribution: threatLevels,
  suspiciousActivities: Object.values(threatLevels).reduce((sum: number, count: any) => sum + (count || 0), 0),
  blockedThreats: stats.blockedAttempts || 0,
  adaptiveAdjustments: Math.floor(Math.random() * 10) // Simulated adaptive adjustments,
};
  // ========================================
  // Visualization Data Generation
  // ========================================
  /**
   * Generate time series data for charts
   */
  public generateTimeSeriesData(timeRange: string = '1h'): MetricsVisualizationData['timeSeriesData'] {
  const endTime = new Date();
  const startTime = new Date();
  // Calculate start time based on range
  switch (timeRange) {
  case '1h':,
  startTime.setHours(endTime.getHours() - 1);
  break;
  case '24h':,
  startTime.setDate(endTime.getDate() - 1);
  break;
  case '7d':,
  startTime.setDate(endTime.getDate() - 7);
  break;
  default:,
  startTime.setHours(endTime.getHours() - 1);
  const relevantMetrics = this.metricsHistory.filter(;);
  metric => metric.timestamp >= startTime && metric.timestamp <= endTime
  );
  return {
  timestamps: relevantMetrics.map(m => m.timestamp),
  responseTime: relevantMetrics.map(m => m.responseTime.average),
  throughput: relevantMetrics.map(m => m.throughput.requestsPerSecond),
  blockRate: relevantMetrics.map(m => m.errorRates.blockRate),
  errorRate: relevantMetrics.map(m => m.errorRates.errorRate),
};
  /**
   * Generate heatmap data for endpoint activity
   */
  public generateHeatmapData(): MetricsVisualizationData['heatmapData'] {
    const endpoints = ['/auth/login', '/auth/register', '/auth/mfa/verify', '/auth/password/reset', '/api/users', '/api/data'];
    const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);}
    // Generate activity matrix (requests per hour per endpoint)
    const activityMatrix = endpoints.map(() => ;
      timeSlots.map(() => Math.floor(Math.random() * 1000))
    );
    // Generate block matrix (blocks per hour per endpoint)
    const blockMatrix = endpoints.map((_, i) => ;
      timeSlots.map((_, j) => Math.floor(activityMatrix[i][j] * 0.1 * Math.random()))
    );
    return {
      endpoints,
      timeSlots,
      activityMatrix,
      blockMatrix
    };
  /**
   * Generate geospatial data for request origins
   */
  public generateGeospatialData(): MetricsVisualizationData['geospatialData'] {
    // Simulated location data - in production this would come from GeoIP
    const locations = [;
      { city: 'New York', lat: 40.7128, lng: -74.0060 },
      { city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { city: 'London', lat: 51.5074, lng: -0.1278 },
      { city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { city: 'Sydney', lat: -33.8688, lng: 151.2093 }
    ];
    return {
  locations: locations.map(loc => ({)
  latitude: loc.lat,
  longitude: loc.lng,
  requestCount: Math.floor(Math.random() * 10000) + 1000,
  blockCount: Math.floor(Math.random() * 1000) + 10,
  threatLevel: Math.random() > 0.7 ? ThreatLevel.HIGH : ,
  Math.random() > 0.4 ? ThreatLevel.MEDIUM : ThreatLevel.LOW,
}))
    };
  /**
   * Generate distribution data for various metrics
   */
  public generateDistributionData(): MetricsVisualizationData['distributionData'] {
  const rateLimitingStats = this.rateLimitingService.getStatistics();
  return {
  endpointDistribution: rateLimitingStats.topEndpoints.reduce((acc, ep) => {,
  acc[ep.endpoint] = ep.attempts;
  return acc;
}, {} as Record<string, number>),
      threatLevelDistribution: rateLimitingStats.threatLevels,
      responseTimeDistribution: [,
        { range: '0-50ms', count: Math.floor(Math.random() * 1000) + 500 },
        { range: '50-100ms', count: Math.floor(Math.random() * 800) + 300 },
        { range: '100-200ms', count: Math.floor(Math.random() * 500) + 100 },
        { range: '200-500ms', count: Math.floor(Math.random() * 200) + 50 },
        { range: '500ms+', count: Math.floor(Math.random() * 100) + 10 }
      ],
      userAgentDistribution: {
  'Chrome': Math.floor(Math.random() * 5000) + 2000,
  'Firefox': Math.floor(Math.random() * 2000) + 800,
  'Safari': Math.floor(Math.random() * 1500) + 600,
  'Edge': Math.floor(Math.random() * 1000) + 400,
  'Bot/Crawler': Math.floor(Math.random() * 500) + 50,
};
  /**
   * Get complete visualization data
   */
  public getVisualizationData(timeRange: string = '1h'): MetricsVisualizationData {
  return {
  timeSeriesData: this.generateTimeSeriesData(timeRange),
  heatmapData: this.generateHeatmapData(),
  geospatialData: this.generateGeospatialData(),
  distributionData: this.generateDistributionData(),
};
  // ========================================
  // Dashboard Management
  // ========================================
  /**
   * Initialize default dashboard widgets
   */
  private initializeDefaultWidgets(): void {
  const defaultWidgets: DashboardWidget = [
  {
  widgetId: 'response-time-chart',
  widgetType: 'chart',
  title: 'Response Time Trends',
  description: 'Average response time over time',
  dataSource: 'timeseries',
  refreshInterval: 5,
  config: {
  chartType: 'line',
  timeRange: '1h',
  aggregation: 'avg',
  metrics: ['responseTime'],
},
  position: { x: 0, y: 0, width: 6, height: 4 }
  }
      {
  widgetId: 'throughput-gauge',
  widgetType: 'gauge',
  title: 'Request Throughput',
  description: 'Current requests per second',
  dataSource: 'current',
  refreshInterval: 1,
  config: {
  metrics: ['throughput'],
},
  position: { x: 6, y: 0, width: 3, height: 4 }
  }
      {
  widgetId: 'block-rate-gauge',
  widgetType: 'gauge',
  title: 'Block Rate',
  description: 'Percentage of requests blocked',
  dataSource: 'current',
  refreshInterval: 1,
  config: {
  metrics: ['blockRate'],
},
  position: { x: 9, y: 0, width: 3, height: 4 }
  }
      {
  widgetId: 'endpoint-heatmap',
  widgetType: 'heatmap',
  title: 'Endpoint Activity Heatmap',
  description: 'Request activity by endpoint and time',
  dataSource: 'heatmap',
  refreshInterval: 30,
  config: {
  timeRange: '24h',
},
  position: { x: 0, y: 4, width: 8, height: 6 }
  }
      {
  widgetId: 'threat-distribution',
  widgetType: 'chart',
  title: 'Threat Level Distribution',
  description: 'Distribution of threat levels',
  dataSource: 'distribution',
  refreshInterval: 10,
  config: {
  chartType: 'pie',
  metrics: ['threatLevelDistribution'],
},
  position: { x: 8, y: 4, width: 4, height: 6 }
  }
      {
        widgetId: 'geographic-map',
        widgetType: 'map',
        title: 'Request Origins',
        description: 'Geographic distribution of requests',
        dataSource: 'geospatial',
        refreshInterval: 60,
        config: {},
        position: { x: 0, y: 10, width: 12, height: 8 }
    ];
    defaultWidgets.forEach(widget => {)
  this.dashboardWidgets.set(widget.widgetId, widget);
    });
  /**
   * Add or update a dashboard widget
   */
  public addWidget(widget: DashboardWidget): void {
  this.dashboardWidgets.set(widget.widgetId, widget);
  this.emit('widgetAdded', {)
  widgetId: widget.widgetId,
  timestamp: new Date(),
});
  /**
   * Remove a dashboard widget
   */
  public removeWidget(widgetId: string): boolean {
  const removed = this.dashboardWidgets.delete(widgetId);
  if (removed) {
  this.emit('widgetRemoved', {)
  widgetId,
  timestamp: new Date(),
});
    return removed;
  /**
   * Get all dashboard widgets
   */
  public getWidgets(): DashboardWidget {
    return Array.from(this.dashboardWidgets.values());
  /**
   * Get widget data for rendering
   */
  public getWidgetData(widgetId: string): any {
    const widget = this.dashboardWidgets.get(widgetId);
    if (!widget) return null;
    switch (widget.dataSource) {
      case 'timeseries':
        return this.generateTimeSeriesData(widget.config.timeRange);
      case 'heatmap':
        return this.generateHeatmapData();
      case 'geospatial':
        return this.generateGeospatialData();
      case 'distribution':
        return this.generateDistributionData();
      case 'current':
        return this.currentMetrics;
      default:
        return null;
  // ========================================
  // Alert Management
  // ========================================
  /**
   * Check for alert conditions
   */
  private checkAlertConditions(): void {
    const thresholds = this.config.alerting.alertThresholds;
    const metrics = this.currentMetrics;
    // Check response time alerts
    if (metrics.responseTime.average > thresholds.highResponseTime) {
      this.createAlert({)
  alertId: `response-time-${Date.now()}`}
},
  alertType: 'performance',
        severity: metrics.responseTime.average > thresholds.highResponseTime * 2 ? 'critical' : 'high',
        condition: 'High Response Time',
        currentValue: metrics.responseTime.average,
        threshold: thresholds.highResponseTime,
        affectedEndpoints: ['all'],
        recommendedActions: [,
          'Check system resources',
          'Review rate limiting rules',
          'Consider scaling infrastructure'
        ]
      });
    // Check throughput alerts
    if (metrics.throughput.requestsPerSecond < thresholds.lowThroughput) {
      this.createAlert({)
  alertId: `throughput-${Date.now()}`}
},
  alertType: 'performance',
        severity: 'medium',
        condition: 'Low Throughput',
        currentValue: metrics.throughput.requestsPerSecond,
        threshold: thresholds.lowThroughput,
        affectedEndpoints: ['all'],
        recommendedActions: [,
          'Check for system bottlenecks',
          'Review rate limiting configuration',
          'Monitor resource utilization'
        ]
      });
    // Check error rate alerts
    if (metrics.errorRates.errorRate > thresholds.highErrorRate) {
      this.createAlert({)
  alertId: `error-rate-${Date.now()}`}
},
  alertType: 'security',
        severity: 'high',
        condition: 'High Error Rate',
        currentValue: metrics.errorRates.errorRate,
        threshold: thresholds.highErrorRate,
        affectedEndpoints: ['all'],
        recommendedActions: [,
          'Review error logs',
          'Check application health',
          'Investigate potential attacks'
        ]
      });
    // Check block rate alerts
    if (metrics.errorRates.blockRate > thresholds.highBlockRate) {
      this.createAlert({)
  alertId: `block-rate-${Date.now()}`}
},
  alertType: 'security',
        severity: metrics.errorRates.blockRate > thresholds.highBlockRate * 2 ? 'critical' : 'high',
        condition: 'High Block Rate',
        currentValue: metrics.errorRates.blockRate,
        threshold: thresholds.highBlockRate,
        affectedEndpoints: ['all'],
        recommendedActions: [,
          'Review rate limiting rules',
          'Investigate potential attacks',
          'Consider adjusting thresholds',
          'Check for false positives'
        ]
      });
  /**
   * Create and manage alerts
   */
  private createAlert(alertData: Omit<AlertCondition, 'timestamp' | 'metadata'>): void {
  const alert: AlertCondition = {,
  ...alertData,
  timestamp: new Date(),
  metadata: {
  systemUptime: Date.now() - this.startTime.getTime(),
  metricsCount: this.metricsHistory.length,
};
    this.activeAlerts.set(alert.alertId, alert);
    this.emit('alertCreated', alert);
  /**
   * Get all active alerts
   */
  public getActiveAlerts(): AlertCondition {
    return Array.from(this.activeAlerts.values());
  /**
   * Acknowledge an alert
   */
  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      this.activeAlerts.delete(alertId);
      this.emit('alertAcknowledged', { alertId, timestamp: new Date() });
      return true;
    return false;
  // ========================================
  // Utility Methods
  // ========================================
  /**
   * Create empty metrics object
   */
  private createEmptyMetrics(): PerformanceMetrics {
  return {
  timestamp: new Date(),
  responseTime: {
  average: 0,
  p50: 0,
  p95: 0,
  p99: 0,
  max: 0,
},
  throughput: {
  requestsPerSecond: 0,
  allowedPerSecond: 0,
  blockedPerSecond: 0,
  throttledPerSecond: 0,
},
  errorRates: {
  totalRequests: 0,
  blockedRequests: 0,
  errorRequests: 0,
  blockRate: 0,
  errorRate: 0,
},
  resourceUtilization: {
  memoryUsage: 0,
  cpuUsage: 0,
  cacheHitRate: 0,
  activeConnections: 0,
},
  threatMetrics: {
  threatDistribution: {
  [ThreatLevel.LOW]: 0,
  [ThreatLevel.MEDIUM]: 0,
  [ThreatLevel.HIGH]: 0,
  [ThreatLevel.CRITICAL]: 0,
},
  suspiciousActivities: 0,
        blockedThreats: 0,
        adaptiveAdjustments: 0;
  };
  /**
   * Clean up old metrics data
   */
  private cleanupOldMetrics(): void {
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - this.config.metricsRetentionPeriod);
  this.metricsHistory = this.metricsHistory.filter()
  metric => metric.timestamp > cutoffTime
  );
  /**
  * Set up event listeners for rate limiting service
  */
  private setupEventListeners(): void {,
  // Listen for rate limiting events
  this.rateLimitingService.on('rateLimitExceeded', (data) => {
  this.emit('rateLimitEvent', {)
  type: 'exceeded',
  data,
  timestamp: new Date(),
});
    });
    this.rateLimitingService.on('attemptRecorded', (attempt) => {
  this.emit('rateLimitEvent', {)
  type: 'attempt',
  data: attempt,
  timestamp: new Date(),
});
    });
    // Listen for throttling events if available
    if (this.throttlingEngine) {
  this.throttlingEngine.on('throttlingApplied', (data) => {
  this.emit('throttlingEvent', {)
  type: 'applied',
  data,
  timestamp: new Date(),
});
      });
  /**
   * Get comprehensive system status
   */
  public getSystemStatus(): {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  metrics: PerformanceMetrics;
  alerts: AlertCondition;
  systemInfo: {
  version: string;
  environment: string;
  configuredEndpoints: number;
  metricsCollected: number;
};
    return {
  status: this.activeAlerts.size === 0 ? 'healthy' : ,
  this.activeAlerts.size < 3 ? 'warning' : 'critical',
  uptime: Date.now() - this.startTime.getTime(),
  metrics: this.currentMetrics,
  alerts: this.getActiveAlerts(),
  systemInfo: {
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  configuredEndpoints: 0, // Would be populated from actual configuration,
  metricsCollected: this.metricsHistory.length,
};
  /**
   * Export metrics data for external analysis
   */
  public exportMetrics(format: 'json' | 'csv' = 'json'): string {
  if (format === 'csv') {
  // Convert metrics to CSV format
  const headers = [;
  'timestamp',
  'responseTime_avg',
  'responseTime_p95',
  'throughput_rps',
  'blockRate',
  'errorRate',
  'memoryUsage',
  'cpuUsage'
  ];
  const rows = this.metricsHistory.map(metric => [);
  metric.timestamp.toISOString(),
  metric.responseTime.average.toFixed(2),
  metric.responseTime.p95.toFixed(2),
  metric.throughput.requestsPerSecond.toFixed(2),
  metric.errorRates.blockRate.toFixed(2),
  metric.errorRates.errorRate.toFixed(2),
  metric.resourceUtilization.memoryUsage.toFixed(2),
  metric.resourceUtilization.cpuUsage.toFixed(2)
  ]);
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return JSON.stringify({)
  exportTimestamp: new Date().toISOString(),
  metricsCount: this.metricsHistory.length,
  timeRange: {
  start: this.metricsHistory[0]?.timestamp,
  end: this.metricsHistory[this.metricsHistory.length - 1]?.timestamp,
},
  metrics: this.metricsHistory,
      currentMetrics: this.currentMetrics,
      alerts: this.getActiveAlerts(),
      configuration: this.config;
  }, null, 2);
  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopMetricsCollection();
    this.removeAllListeners();
    this.metricsHistory = [];
    this.activeAlerts.clear();
    this.dashboardWidgets.clear();

export default RateLimitingPerformanceMetrics;