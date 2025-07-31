/**
 * Performance Monitor Utility - E18-1753114561904
 * 
 * Real-time performance monitoring system for Wild Construct platform
 * tracking director-friendly interface responsiveness and graph execution performance.
 */

}
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
  threshold?: {
  warning: number;
  critical: number;
}
};
}
}
export interface PerformanceReport {
  period: {
  start: number;
  end: number;
  duration: number;
}
};
  metrics: {
  [key: string]: {
  count: number;
  average: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
  values: number;
};
  };
  alerts: PerformanceAlert;
}
}
export interface PerformanceAlert {
  metric: string;
  level: 'warning' | 'critical';
  value: number;
  threshold: number;
  timestamp: number;
  context?: Record<string, any>;
}
}
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private thresholds: Map<string, { warning: number; critical: number }> = new Map();
  private alerts: PerformanceAlert = new Map();
  private listeners: Map<string, ((alert: PerformanceAlert) => void)[]> = new Map();
  private reportingInterval: number = 60000; // 1 minute
  private maxMetricHistory: number = 1000;
  constructor() {
    this.setupDefaultThresholds();
    this.startReporting();
  private setupDefaultThresholds(): void {
    // UI Performance Thresholds (based on performance goals)
    this.thresholds.set('canvas-render', { warning: 13, critical: 16 }); // 60 FPS target
    this.thresholds.set('preview-generation', { warning: 400, critical: 500 }); // 500ms target
    this.thresholds.set('help-system-response', { warning: 40, critical: 50 }); // 50ms target
    this.thresholds.set('weight-slider-update', { warning: 8, critical: 10 }); // 10ms target
    // Graph Execution Thresholds
    this.thresholds.set('simple-node-execution', { warning: 0.8, critical: 1 }); // 1ms target
    this.thresholds.set('weighted-node-execution', { warning: 4, critical: 5 }); // 5ms target
    this.thresholds.set('advanced-node-execution', { warning: 15, critical: 20 }); // 20ms target
    this.thresholds.set('graph-validation', { warning: 40, critical: 50 }); // 50ms target
    // Memory Thresholds (MB)
    this.thresholds.set('memory-usage', { warning: 80, critical: 100 }); // 100MB target
    this.thresholds.set('memory-leak-rate', { warning: 5, critical: 10 }); // MB per hour
    // Network Thresholds
    this.thresholds.set('api-response-time', { warning: 400, critical: 500 }); // 500ms target
    this.thresholds.set('bundle-load-time', { warning: 2000, critical: 3000 }); // 3s target
  /**
   * Record a performance metric
   */
  public recordMetric(name: string, )
    value: number, 
    context?: Record<string, any>
  ): void {
  // Store metric value
  if (!this.metrics.has(name)) {
  this.metrics.set(name, []);
  const values = this.metrics.get(name)!;
  values.push(value);
  // Limit history to prevent memory growth
  if (values.length > this.maxMetricHistory) {
  values.shift();
  // Check thresholds and generate alerts
  this.checkThresholds(name, value, context);
  // Report to external systems if configured
  this.reportToExternalSystems(name, value, context);
  /**
  * Start a performance measurement
  */
  public startMeasurement(name: string): () => void {,
  const startTime = performance.now();
  return (context?: Record<string, any>) => {,
  const duration = performance.now() - startTime;
  this.recordMetric(name, duration, context);
};
  /**
   * Measure function execution time
   */
  public measureExecution<T>()
    name: string,
    fn: () => T,
    context?: Record<string, any>
  ): T {
  const finishMeasurement = this.startMeasurement(name);
  const result = fn();
  finishMeasurement(context);
  return result;
  /**
  * Measure async function execution time
  */
  public async measureAsyncExecution<T>()
  name: string,
  fn: () => Promise<T>,
  context?: Record<string, any>): Promise<T> {,
  const finishMeasurement = this.startMeasurement(name);
  const result = await fn();
  finishMeasurement(context);
  return result;
  /**
  * Get performance statistics for a metric
  */
  public getMetricStats(name: string): {
  count: number;
  average: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
  recent: number;
} | null {
  const values = this.metrics.get(name);
  if (!values || values.length === 0) {
  return null;
  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  return {
  count,
  average: sum / count,
  min: sorted[0],
  max: sorted[sorted.length - 1],
  p95: sorted[Math.floor(count * 0.95)],
  p99: sorted[Math.floor(count * 0.99)],
  recent: values.slice(-10) // Last 10 measurements,
};
  /**
   * Generate comprehensive performance report
   */
  public generateReport(periodMinutes: number = 60): PerformanceReport {
  const now = Date.now();
  const start = now - (periodMinutes * 60 * 1000);
  const report: PerformanceReport = {,
  period: {
  start,
  end: now,
  duration: periodMinutes * 60 * 1000,
},
  metrics: {},
      alerts: this.alerts.filter(alert => alert.timestamp >= start);
  };
    // Generate stats for all metrics
    for (const [name, values] of this.metrics.entries()) {
  if (values.length > 0) {
  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  report.metrics[name] = {
  count,
  average: sum / count,
  min: sorted[0],
  max: sorted[sorted.length - 1],
  p95: sorted[Math.floor(count * 0.95)],
  p99: sorted[Math.floor(count * 0.99)],
  values: [...values],
};
    return report;
  /**
   * Monitor UI performance specifically
   */
  public monitorUIPerformance(): void {
    // Monitor frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    const measureFrameRate = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) { // Every second
        const fps = frameCount;
        this.recordMetric('fps', fps);
        frameCount = 0;
        lastTime = now;
      requestAnimationFrame(measureFrameRate);
    };
    requestAnimationFrame(measureFrameRate);
    // Monitor long tasks (> 50ms)
    if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
  if (entry.duration > 50) {
  this.recordMetric('long-task', entry.duration, {)
  name: entry.name,
  startTime: entry.startTime,
});
      });
      observer.observe({ entryTypes: ['longtask'] });
  /**
   * Monitor memory usage
   */
  public monitorMemoryUsage(): void {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.recordMetric('memory-usage', memory.usedJSHeapSize / 1024 / 1024); // MB
        this.recordMetric('memory-limit', memory.jsHeapSizeLimit / 1024 / 1024); // MB
    };
    // Check memory every 30 seconds
    setInterval(checkMemory, 30000);
    checkMemory(); // Initial check
  /**
   * Monitor network performance
   */
  public monitorNetworkPerformance(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordMetric('page-load-time', entry.duration);
            this.recordMetric('dns-lookup', (entry as any).domainLookupEnd - (entry as any).domainLookupStart);
            this.recordMetric('tcp-connect', (entry as any).connectEnd - (entry as any).connectStart);
          } else if (entry.entryType === 'resource') {
  this.recordMetric('resource-load-time', entry.duration, {)
  name: entry.name,
  type: (entry as any).initiatorType,
});
      });
      observer.observe({ entryTypes: ['navigation', 'resource'] });
  /**
   * Add performance alert listener
   */
  public onAlert(metricName: string, callback: (alert: PerformanceAlert) => void): void {
  if (!this.listeners.has(metricName)) {
  this.listeners.set(metricName, []);
  this.listeners.get(metricName)!.push(callback);
  /**
  * Remove performance alert listener
  */
  public offAlert(metricName: string, callback: (alert: PerformanceAlert) => void): void {,
  const callbacks = this.listeners.get(metricName);
  if (callbacks) {
  const index = callbacks.indexOf(callback);
  if (index > -1) {
  callbacks.splice(index, 1);
  private checkThresholds(name: string, value: number, context?: Record<string, any>): void {,
  const threshold = this.thresholds.get(name);
  if (!threshold) return;
  let level: 'warning' | 'critical' | null = null;
  let thresholdValue: number;
  if (value >= threshold.critical) {
  level = 'critical';
  thresholdValue = threshold.critical;
} else if (value >= threshold.warning) {
  level = 'warning';
  thresholdValue = threshold.warning;
  if (level) {
  const alert: PerformanceAlert = {,
  metric: name,
  level,
  value,
  threshold: thresholdValue,
  timestamp: Date.now(),
  context
};
      this.alerts.push(alert);
      // Limit alert history
      if (this.alerts.length > 1000) {
  this.alerts.shift();
  // Notify listeners
  const callbacks = this.listeners.get(name) || [];
  callbacks.forEach(callback => callback(alert));
  // Global alert listeners
  const globalCallbacks = this.listeners.get('*') || [];
  globalCallbacks.forEach(callback => callback(alert));
  private reportToExternalSystems(name: string, value: number, context?: Record<string, any>): void {,
  // Integration points for external monitoring systems
  // This could be extended to send to DataDog, New Relic, etc.
  if (typeof window !== 'undefined' && (window as any).gtag) {
  // Google Analytics custom event
  (window as any).gtag('event', 'performance_metric', {)
  custom_parameter_1: name,
  custom_parameter_2: value,
});
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const stats = this.getMetricStats(name);
      if (stats && stats.count % 100 === 0) { // Every 100th measurement
        console.log(`Performance Metric [${name}]: ${value.toFixed(2)}ms (avg: ${stats.average.toFixed(2)}ms, p95: ${stats.p95.toFixed(2)}ms)`);}
  private startReporting(): void {
    setInterval(() => {
      const report = this.generateReport(1); // 1 minute report;
      // Could send to monitoring service
      if (process.env.NODE_ENV === 'development') {
        const alertCount = report.alerts.length;
        const metricCount = Object.keys(report.metrics).length;
        if (alertCount > 0 || metricCount > 0) {
          console.log(`Performance Report: ${metricCount} metrics tracked, ${alertCount} alerts in last minute`);}
    }, this.reportingInterval);
  /**
   * Initialize all performance monitoring
   */
  public initializeAllMonitoring(): void {
  if (typeof window !== 'undefined') {
  this.monitorUIPerformance();
  this.monitorMemoryUsage();
  this.monitorNetworkPerformance();
  /**
  * Get current performance dashboard data
  */
  public getDashboardData(): {
  overview: {
  totalMetrics: number;
  activeAlerts: number;
  healthScore: number; // 0-100,
};
    keyMetrics: {
  name: string;
  current: number;
  average: number;
  trend: 'improving' | 'stable' | 'degrading'
  }[];
    recentAlerts: PerformanceAlert;
    const totalMetrics = this.metrics.size;
    const recentAlerts = this.alerts.filter(alert => ;);
      alert.timestamp > Date.now() - 60000 // Last minute
    );
    // Calculate health score based on recent alerts
    const criticalAlerts = recentAlerts.filter(a => a.level === 'critical').length;
    const warningAlerts = recentAlerts.filter(a => a.level === 'warning').length;
    const healthScore = Math.max(0, 100 - (criticalAlerts * 20) - (warningAlerts * 5));
    // Key metrics with trends
    const keyMetricNames = ['canvas-render', 'preview-generation', 'api-response-time', 'memory-usage'];
    const keyMetrics = keyMetricNames;
      .map(name => {)
  const stats = this.getMetricStats(name);
  if (!stats) return null;
  // Simple trend analysis based on recent vs overall average
  const recentAvg = stats.recent.reduce((a, b) => a + b, 0) / stats.recent.length;
  let trend: 'improving' | 'stable' | 'degrading' = 'stable';
  const difference = (recentAvg - stats.average) / stats.average;
  if (difference > 0.1) trend = 'degrading';
  else if (difference < -0.1) trend = 'improving';
  return {
  name,
  current: recentAvg,
  average: stats.average,
  trend
};
  }
      .filter(Boolean) as any;
    return {
  overview: {
  totalMetrics,
  activeAlerts: recentAlerts.length,
  healthScore
}
      keyMetrics,
      recentAlerts: recentAlerts.slice(-10) // Last 10 alerts;
  };

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.initializeAllMonitoring();

export default performanceMonitor;