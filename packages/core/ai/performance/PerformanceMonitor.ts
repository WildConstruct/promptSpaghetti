/**
 * Performance Monitoring System for AI Models
 * Epic 35.1.6 - Performance Optimization
 * 
 * Comprehensive performance monitoring with real-time metrics, alerts, and analytics
 */

}
export interface PerformanceMetrics {
  // Request metrics
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  // Resource metrics
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  diskIOUsage: number;
  // Model-specific metrics
  tokensProcessed: number;
  tokensPerSecond: number;
  costPerRequest: number;
  totalCost: number;
  // Quality metrics
  successRate: number;
  errorRate: number;
  timeoutRate: number;
  retryRate: number;
  // Temporal metrics
  timestamp: number;
  windowStart: number;
  windowEnd: number;
}
}
}
export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  metric: string;
  threshold: number;
  currentValue: number;
  message: string;
  timestamp: number;
  resolved: boolean;
  resolvedAt?: number;
}
}
}
export interface PerformanceThreshold {
  metric: keyof PerformanceMetrics;
  warningThreshold: number;
  errorThreshold: number;
  criticalThreshold: number;
  operator: 'greater_than' | 'less_than' | 'equals'
}
  }
}
export interface MonitoringConfig {
  enabled: boolean;
  collectionInterval: number; // milliseconds,
  retentionPeriod: number; // milliseconds,
  alerting: {
  enabled: boolean;
  email?: string;
  webhook?: string;
  slackChannel?: string;
}
};
  thresholds: PerformanceThreshold;
  sampling: {;
  enabled: boolean;
  rate: number; // 0-1, percentage of requests to sample,
};
  storage: {
  type: 'memory' | 'disk' | 'database';
  path?: string;
  maxSize?: number;
};
}
}
export interface ModelPerformanceData {
  modelId: string;
  modelType: string;
  provider: string;
  metrics: PerformanceMetrics;
  alerts: PerformanceAlert;
  lastUpdated: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'offline'
}
  }
}
export interface PerformanceReport {
  summary: {
  totalModels: number;
  healthyModels: number;
  totalRequests: number;
  averageResponseTime: number;
  totalCost: number;
  successRate: number;
}
};
  trends: {
  responseTimeTrend: Array<{ timestamp: number; value: number }>;
    successRateTrend: Array<{ timestamp: number; value: number }>;
    costTrend: Array<{ timestamp: number; value: number }>;
  };
  topPerformers: Array<{ modelId: string; metric: string; value: number }>;
  bottomPerformers: Array<{ modelId: string; metric: string; value: number }>;
  activeAlerts: PerformanceAlert;
  recommendations: string;
  generatedAt: number;
}
export class PerformanceMonitor {
  private config: MonitoringConfig;
  private models: Map<string, ModelPerformanceData> = new Map();
  private metricsHistory: Map<string, PerformanceMetrics> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private collectionTimer?: NodeJS.Timeout;
  private isRunning = false;
  constructor(config: MonitoringConfig) {,
  this.config = config;
  this.initializeDefaultThresholds();
  start(): void {,
  if (this.isRunning) return;
  this.isRunning = true;
  if (this.config.enabled && this.config.collectionInterval > 0) {
  this.collectionTimer = setInterval(() => {
  this.collectMetrics();
  this.evaluateAlerts();
  this.cleanupOldData();
}, this.config.collectionInterval);
  stop(): void {
  if (!this.isRunning) return;
  this.isRunning = false;
  if (this.collectionTimer) {
  clearInterval(this.collectionTimer);
  this.collectionTimer = undefined;
  registerModel();
  modelId: string,
  modelType: string,
  provider: string): void {,
  if (!this.models.has(modelId)) {
  this.models.set(modelId, {)
  modelId,
  modelType,
  provider,
  metrics: this.createEmptyMetrics(),
  alerts: [],
  lastUpdated: Date.now(),
  healthStatus: 'healthy',
});
      this.metricsHistory.set(modelId, []);
  unregisterModel(modelId: string): void {
    this.models.delete(modelId);
    this.metricsHistory.delete(modelId);
    // Remove alerts for this model
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alertId.startsWith(modelId)) {
        this.alerts.delete(alertId);
  recordRequest();
    modelId: string,
    responseTime: number,
    success: boolean,
    tokensUsed: { input: number; output: number },
    cost: number): void {,
    const modelData = this.models.get(modelId);
    if (!modelData) return;
    const metrics = modelData.metrics;
    // Update request metrics
    metrics.totalRequests++;
    if (success) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
    // Update response time metrics
    if (metrics.totalRequests === 1) {
      metrics.averageResponseTime = responseTime;
      metrics.minResponseTime = responseTime;
      metrics.maxResponseTime = responseTime;
    } else {
      metrics.averageResponseTime = 
        ((metrics.averageResponseTime * (metrics.totalRequests - 1)) + responseTime) / metrics.totalRequests;
      metrics.minResponseTime = Math.min(metrics.minResponseTime, responseTime);
      metrics.maxResponseTime = Math.max(metrics.maxResponseTime, responseTime);
    // Update token metrics
    const totalTokens = tokensUsed.input + tokensUsed.output;
    metrics.tokensProcessed += totalTokens;
    if (responseTime > 0) {
      metrics.tokensPerSecond = totalTokens / (responseTime / 1000);
    // Update cost metrics
    metrics.totalCost += cost;
    metrics.costPerRequest = metrics.totalCost / metrics.totalRequests;
    // Update quality metrics
    metrics.successRate = metrics.successfulRequests / metrics.totalRequests;
    metrics.errorRate = metrics.failedRequests / metrics.totalRequests;
    // Update timestamp
    metrics.timestamp = Date.now();
    modelData.lastUpdated = Date.now();
    // Update health status
    this.updateHealthStatus(modelId);
    // Store historical data if sampling allows
    if (this.shouldSample()) {
      this.recordHistoricalMetrics(modelId, { ...metrics });
  recordResourceUsage();
    modelId: string,
    resourceMetrics: {
      memoryUsage?: number;
      cpuUsage?: number;
      networkLatency?: number;
      diskIOUsage?: number;
  ): void {
    const modelData = this.models.get(modelId);
    if (!modelData) return;
    const metrics = modelData.metrics;
    if (resourceMetrics.memoryUsage !== undefined) {
      metrics.memoryUsage = resourceMetrics.memoryUsage;
    if (resourceMetrics.cpuUsage !== undefined) {
      metrics.cpuUsage = resourceMetrics.cpuUsage;
    if (resourceMetrics.networkLatency !== undefined) {
      metrics.networkLatency = resourceMetrics.networkLatency;
    if (resourceMetrics.diskIOUsage !== undefined) {
      metrics.diskIOUsage = resourceMetrics.diskIOUsage;
    modelData.lastUpdated = Date.now();
  getModelMetrics(modelId: string): ModelPerformanceData | null {
    return this.models.get(modelId) || null;
  getAllModelsMetrics(): ModelPerformanceData {
    return Array.from(this.models.values());
  getActiveAlerts(): PerformanceAlert {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  getAlertsForModel(modelId: string): PerformanceAlert {
    return Array.from(this.alerts.values())
      .filter(alert => alert.id.startsWith(modelId));
  generateReport(timeRange?: { start: number; end: number }): PerformanceReport {
  const allModels = Array.from(this.models.values());
  const healthyModels = allModels.filter(m => m.healthStatus === 'healthy');
  const totalRequests = allModels.reduce((sum, m) => sum + m.metrics.totalRequests, 0);
  const totalResponseTime = allModels.reduce((sum, m) => ;
  sum + (m.metrics.averageResponseTime * m.metrics.totalRequests), 0);
  const totalCost = allModels.reduce((sum, m) => sum + m.metrics.totalCost, 0);
  const totalSuccessful = allModels.reduce((sum, m) => sum + m.metrics.successfulRequests, 0);
  return {
  summary: {
  totalModels: allModels.length,
  healthyModels: healthyModels.length,
  totalRequests,
  averageResponseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
  totalCost,
  successRate: totalRequests > 0 ? totalSuccessful / totalRequests : 0,
},
  trends: this.generateTrends(timeRange),
      topPerformers: this.getTopPerformers(),
      bottomPerformers: this.getBottomPerformers(),
      activeAlerts: this.getActiveAlerts(),
      recommendations: this.generateRecommendations(),
      generatedAt: Date.now();
  };
  exportMetrics(format: 'json' | 'csv' | 'prometheus'): string {
  const data = this.getAllModelsMetrics();
  switch (format) {
  case 'json':,
  return JSON.stringify(data, null, 2);
  case 'csv':,
  return this.convertToCSV(data);
  case 'prometheus':,
  return this.convertToPrometheus(data);
  default:,
  return JSON.stringify(data, null, 2);
  // Private helper methods
  private initializeDefaultThresholds(): void {,
  if (this.config.thresholds.length === 0) {
  this.config.thresholds = [
  {
  metric: 'averageResponseTime',
  warningThreshold: 5000,
  errorThreshold: 10000,
  criticalThreshold: 20000,
  operator: 'greater_than',
}
        {
  metric: 'errorRate',
  warningThreshold: 0.05,
  errorThreshold: 0.1,
  criticalThreshold: 0.2,
  operator: 'greater_than',
}
        {
  metric: 'memoryUsage',
  warningThreshold: 0.7,
  errorThreshold: 0.85,
  criticalThreshold: 0.95,
  operator: 'greater_than',
}
        {
  metric: 'successRate',
  warningThreshold: 0.95,
  errorThreshold: 0.9,
  criticalThreshold: 0.8,
  operator: 'less_than'];
  private createEmptyMetrics(): PerformanceMetrics {,
  const now = Date.now();
  return {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  minResponseTime: 0,
  maxResponseTime: 0,
  memoryUsage: 0,
  cpuUsage: 0,
  networkLatency: 0,
  diskIOUsage: 0,
  tokensProcessed: 0,
  tokensPerSecond: 0,
  costPerRequest: 0,
  totalCost: 0,
  successRate: 0,
  errorRate: 0,
  timeoutRate: 0,
  retryRate: 0,
  timestamp: now,
  windowStart: now,
  windowEnd: now,
};
  private updateHealthStatus(modelId: string): void {
  const modelData = this.models.get(modelId);
  if (!modelData) return;
  const metrics = modelData.metrics;
  let healthStatus: ModelPerformanceData['healthStatus'] = 'healthy';
  // Check various health indicators
  if (metrics.errorRate > 0.2) {
  healthStatus = 'unhealthy'
  } else if (metrics.errorRate > 0.1 || metrics.averageResponseTime > 10000) {
      healthStatus = 'degraded'
  } else if (metrics.successRate < 0.8) {
      healthStatus = 'unhealthy';
    // Check if model has been inactive
    const timeSinceLastUpdate = Date.now() - modelData.lastUpdated;
    if (timeSinceLastUpdate > 300000) { // 5 minutes
      healthStatus = 'offline';
    modelData.healthStatus = healthStatus;
  private shouldSample(): boolean {
    if (!this.config.sampling.enabled) return true;
    return Math.random() < this.config.sampling.rate;
  private recordHistoricalMetrics(modelId: string, metrics: PerformanceMetrics): void {
    const history = this.metricsHistory.get(modelId);
    if (!history) return;
    history.push(metrics);
    // Limit history size to prevent memory issues
    const maxHistorySize = 1000;
    if (history.length > maxHistorySize) {
      history.splice(0, history.length - maxHistorySize);
  private collectMetrics(): void {
    // This would typically collect system-level metrics
    // For now, we'll update timestamps and perform basic maintenance
    const now = Date.now();
    for (const modelData of this.models.values()) {
      modelData.metrics.timestamp = now;
      this.updateHealthStatus(modelData.modelId);
  private evaluateAlerts(): void {
    if (!this.config.alerting.enabled) return;
    for (const [modelId, modelData] of this.models.entries()) {
      this.evaluateModelAlerts(modelId, modelData);
  private evaluateModelAlerts(modelId: string, modelData: ModelPerformanceData): void {
    for (const threshold of this.config.thresholds) {
      const currentValue = modelData.metrics[threshold.metric] as number;
      const alertId = `${modelId}_${threshold.metric}`;}
      const shouldAlert = this.shouldTriggerAlert(currentValue, threshold);
      const existingAlert = this.alerts.get(alertId);
      if (shouldAlert && !existingAlert) {
  // Create new alert
  const alertType = this.determineAlertType(currentValue, threshold);
  const alert: PerformanceAlert = {,
  id: alertId,
  type: alertType,
  metric: threshold.metric,
  threshold: this.getRelevantThreshold(currentValue, threshold),
  currentValue,
  message: this.generateAlertMessage(modelId, threshold.metric, currentValue, alertType),
  timestamp: Date.now(),
  resolved: false,
};
        this.alerts.set(alertId, alert);
        modelData.alerts.push(alert);
        this.sendAlert(alert);
      } else if (!shouldAlert && existingAlert && !existingAlert.resolved) {
        // Resolve existing alert
        existingAlert.resolved = true;
        existingAlert.resolvedAt = Date.now();
        this.sendAlertResolution(existingAlert);
  private shouldTriggerAlert(value: number, threshold: PerformanceThreshold): boolean {
    switch (threshold.operator) {
      case 'greater_than':
        return value > threshold.warningThreshold;
      case 'less_than':
        return value < threshold.warningThreshold;
      case 'equals':
        return Math.abs(value - threshold.warningThreshold) < 0.001;
      default:
        return false;
  private determineAlertType(value: number, threshold: PerformanceThreshold): PerformanceAlert['type'] {
    const { operator, warningThreshold, errorThreshold, criticalThreshold } = threshold;
    if (operator === 'greater_than') {
      if (value >= criticalThreshold) return 'critical';
      if (value >= errorThreshold) return 'error';
      return 'warning'
  } else if (operator === 'less_than') {
      if (value <= criticalThreshold) return 'critical';
      if (value <= errorThreshold) return 'error';
      return 'warning';
    return 'warning';
  private getRelevantThreshold(value: number, threshold: PerformanceThreshold): number {
    const alertType = this.determineAlertType(value, threshold);
    switch (alertType) {
      case 'critical':
        return threshold.criticalThreshold;
      case 'error':
        return threshold.errorThreshold;
      default:
        return threshold.warningThreshold;
  private generateAlertMessage(modelId: string, )
    metric: string, 
    value: number, 
    type: PerformanceAlert['type']): string {,
    const severity = type.toUpperCase();
    const formattedValue = this.formatMetricValue(metric, value);
    return `${severity}: Model ${modelId} has ${metric} of ${formattedValue}`;}
  private formatMetricValue(metric: string, value: number): string {
    switch (metric) {
      case 'averageResponseTime':
      case 'minResponseTime':
      case 'maxResponseTime':
        return `${value.toFixed(0)}ms`;}
      case 'memoryUsage':
      case 'cpuUsage':
        return `${(value * 100).toFixed(1)}%`;}
      case 'successRate':
      case 'errorRate':
        return `${(value * 100).toFixed(2)}%`;}
      case 'totalCost':
      case 'costPerRequest':
        return `$${value.toFixed(4)}`;},}
  default:
        return value.toString();
  private generateTrends(timeRange?: { start: number; end: number }): PerformanceReport['trends'] {
    // Simplified trend generation - would be more sophisticated in production
    const now = Date.now();
    const points = 10;
    const interval = 300000; // 5 minutes;
    const responseTimeTrend = Array.from({ length: points }, (_, i) => ({)
  timestamp: now - (interval * (points - i)),
  value: Math.random() * 5000 + 1000 // Sample data,
}));
    const successRateTrend = Array.from({ length: points }, (_, i) => ({)
  timestamp: now - (interval * (points - i)),
  value: 0.9 + (Math.random() * 0.1) // 90-100% success rate,
}));
    const costTrend = Array.from({ length: points }, (_, i) => ({)
  timestamp: now - (interval * (points - i)),
  value: Math.random() * 0.1 + 0.01 // $0.01-$0.11 per request,
}));
    return {
      responseTimeTrend,
      successRateTrend,
      costTrend
    };
  private getTopPerformers(): Array<{ modelId: string; metric: string; value: number }> {
    const performers: Array<{ modelId: string; metric: string; value: number }> = [];
    for (const [modelId, modelData] of this.models.entries()) {
      performers.push(
        { modelId, metric: 'successRate', value: modelData.metrics.successRate },
        { modelId, metric: 'tokensPerSecond', value: modelData.metrics.tokensPerSecond }
      );
    return performers.sort((a, b) => b.value - a.value).slice(0, 5);
  private getBottomPerformers(): Array<{ modelId: string; metric: string; value: number }> {
    const performers: Array<{ modelId: string; metric: string; value: number }> = [];
    for (const [modelId, modelData] of this.models.entries()) {
      performers.push(
        { modelId, metric: 'averageResponseTime', value: modelData.metrics.averageResponseTime },
        { modelId, metric: 'errorRate', value: modelData.metrics.errorRate }
      );
    return performers.sort((a, b) => b.value - a.value).slice(0, 5);
  private generateRecommendations(): string {
    const recommendations: string = [];
    const allModels = Array.from(this.models.values());
    // High response time recommendation
    const highLatencyModels = allModels.filter(m => m.metrics.averageResponseTime > 5000);
    if (highLatencyModels.length > 0) {
      recommendations.push(`${highLatencyModels.length} models have high response times. Consider load balancing or caching.`);}
    // High error rate recommendation
    const highErrorModels = allModels.filter(m => m.metrics.errorRate > 0.1);
    if (highErrorModels.length > 0) {
      recommendations.push(`${highErrorModels.length} models have high error rates. Review model health and retry policies.`);}
    // Cost optimization recommendation
    const totalCost = allModels.reduce((sum, m) => sum + m.metrics.totalCost, 0);
    if (totalCost > 100) {
      recommendations.push('Consider implementing request caching to reduce API costs.');
    // Memory usage recommendation
    const highMemoryModels = allModels.filter(m => m.metrics.memoryUsage > 0.8);
    if (highMemoryModels.length > 0) {
      recommendations.push('Some models have high memory usage. Consider memory optimization or scaling.');
    return recommendations;
  private sendAlert(alert: PerformanceAlert): void {
    // In a real implementation, this would send alerts via email, Slack, webhook, etc.
    console.warn(`Performance Alert: ${alert.message}`);}
  private sendAlertResolution(alert: PerformanceAlert): void {
    console.info(`Performance Alert Resolved: ${alert.message}`);}
  private cleanupOldData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    // Clean up historical metrics
    for (const [modelId, history] of this.metricsHistory.entries()) {
      const filteredHistory = history.filter(m => m.timestamp > cutoffTime);
      this.metricsHistory.set(modelId, filteredHistory);
    // Clean up resolved alerts
    for (const [alertId, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoffTime) {
        this.alerts.delete(alertId);
  private convertToCSV(data: ModelPerformanceData): string {
    const headers = [;
      'modelId', 'modelType', 'provider', 'totalRequests', 'successfulRequests',
      'averageResponseTime', 'successRate', 'errorRate', 'totalCost', 'healthStatus'
    ];
    const rows = data.map(model => [);
      model.modelId,
      model.modelType,
      model.provider,
      model.metrics.totalRequests,
      model.metrics.successfulRequests,
      model.metrics.averageResponseTime.toFixed(2),
      (model.metrics.successRate * 100).toFixed(2),
      (model.metrics.errorRate * 100).toFixed(2),
      model.metrics.totalCost.toFixed(4),
      model.healthStatus
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  private convertToPrometheus(data: ModelPerformanceData): string {
    let output = '';
    for (const model of data) {
      const labels = `{model_id="${model.modelId}",model_type="${model.modelType}",provider="${model.provider}"}`;}
      output += `ai_model_requests_total${labels} ${model.metrics.totalRequests}\n`;}
      output += `ai_model_response_time_avg${labels} ${model.metrics.averageResponseTime}\n`;}
      output += `ai_model_success_rate${labels} ${model.metrics.successRate}\n`;}
      output += `ai_model_error_rate${labels} ${model.metrics.errorRate}\n`;}
      output += `ai_model_cost_total${labels} ${model.metrics.totalCost}\n`;}
    return output;
  destroy(): void {
    this.stop();
    this.models.clear();
    this.metricsHistory.clear();
    this.alerts.clear();

export default PerformanceMonitor;