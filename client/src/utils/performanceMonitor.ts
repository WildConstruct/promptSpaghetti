/**
 * Performance Monitor - Client-side performance tracking and optimization
 * 
 * Provides utilities for monitoring React component performance, API calls,
 * and user interactions with minimal overhead.
 */


interface PerformanceMetric {
  name: string;,
  duration: number;,
  timestamp: number;,
  type: 'component' | 'api' | 'user_interaction' | 'custom';
  metadata?: Record<string, unknown>;



interface PerformanceConfig {
  enableLogging: boolean;,
  sampleRate: number; // 0-1, percentage of operations to monitor,
  bufferSize: number;,
  flushInterval: number; // ms,
  class PerformanceMonitor {
  private metrics: PerformanceMetric = [];
  private config: PerformanceConfig;
  private flushTimer?: number;
  private observers: Map<string, PerformanceObserver> = new Map();


  constructor(config: Partial<PerformanceConfig> = {}) {
  this.config = {
  enableLogging: process.env.NODE_ENV === 'development',
  sampleRate: 0.1, // Monitor 10% of operations in production,
  bufferSize: 1000,
  flushInterval: 30000, // 30 seconds,
  ...config
};
    this.initializeObservers();
    this.startPeriodicFlush();
  /**
   * Initialize native Performance API observers
   */
  private initializeObservers(): void {
  if (typeof PerformanceObserver === 'undefined') {
  console.warn('PerformanceObserver not supported in this browser');
  return;
  // Monitor navigation timing
  try {
  const navObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
  this.addMetric({)
  name: 'page_load',
  duration: entry.duration,
  timestamp: entry.startTime,
  type: 'custom',
  metadata: {,
  entryType: entry.entryType,
  name: entry.name,
});
        });
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navObserver);
 catch (error) {
  console.warn('Failed to initialize navigation observer:', error);
  // Monitor resource loading
  try {
  const resourceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
  if (entry.duration > 100) { // Only track slow resources
  this.addMetric({)
  name: 'resource_load',
  duration: entry.duration,
  timestamp: entry.startTime,
  type: 'custom',
  metadata: {,
  name: entry.name,
  transferSize: (entry as PerformanceResourceTiming).transferSize,
  type: (entry as PerformanceResourceTiming).initiatorType,
});
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
 catch (error) {
      console.warn('Failed to initialize resource observer:', error);
  /**
   * Measure execution time of a function
   */
  measureExecution<T>()
    name: string,
    fn: () => T | Promise<T>,
    type: PerformanceMetric['type'] = 'custom',
    metadata?: Record<string, unknown>
  ): T | Promise<T> {
    if (!this.shouldSample()) {
      return fn();
    const startTime = performance.now();
    try {
      const result = fn();
      // Handle both sync and async functions
      if (result instanceof Promise) {
        return result.finally(() => {
          const duration = performance.now() - startTime;
          this.addMetric({ name, duration, timestamp: startTime, type, metadata });
        });
 else {
        const duration = performance.now() - startTime;
        this.addMetric({ name, duration, timestamp: startTime, type, metadata });
        return result;
 catch (error) {
      const duration = performance.now() - startTime;
      this.addMetric({)
  name: `${name}_error`}

        duration,
        timestamp: startTime,
        type,
        metadata: { ...metadata, error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
  /**
   * Start timing an operation
   */
  startTiming(name: string): () => void {
    if (!this.shouldSample()) {
      return () => {}; // No-op function
    const startTime = performance.now();
    return (metadata?: Record<string, unknown>) => {
  const duration = performance.now() - startTime;
  this.addMetric({)
  name,
  duration,
  timestamp: startTime,
  type: 'custom',
  metadata
});
    };
  /**
   * Track API call performance
   */
  trackApiCall<T>()
    url: string,
    method: string,
    apiCall: () => Promise<T>): Promise<T> {,
    return this.measureExecution()
      'api_call',
      apiCall,
      'api',
      { url, method }
    ) as Promise<T>;
  /**
   * Track user interaction performance
   */
  trackInteraction<T>()
    action: string,
    handler: () => T | Promise<T>,
    metadata?: Record<string, unknown>
  ): T | Promise<T> {
    return this.measureExecution()
      `interaction_${action}`}

      handler,
      'user_interaction',
      metadata
    );
  /**
   * Add a custom metric
   */
  addMetric(metric: Omit<PerformanceMetric, 'timestamp'> & { timestamp?: number }): void {
  if (!this.shouldSample()) {
  return;
  const fullMetric: PerformanceMetric = {,
  ...metric,
  timestamp: metric.timestamp ?? performance.now(),
};
    this.metrics.push(fullMetric);
    if (this.config.enableLogging && fullMetric.duration > 100) {
      console.log(`[Performance] ${fullMetric.name}: ${fullMetric.duration.toFixed(2)}ms`, fullMetric.metadata);}
    // Auto-flush if buffer is full
    if (this.metrics.length >= this.config.bufferSize) {
      this.flush();
  /**
   * Get performance statistics
   */
  getStats(): {
    total: number;,
  byType: Record<string, number>;
    averages: Record<string, number>;
    slowest: PerformanceMetric;
    const byType: Record<string, number> = {};
    const durations: Record<string, number> = {};
    this.metrics.forEach(metric => {)
  byType[metric.type] = (byType[metric.type] || 0) + 1;
      if (!durations[metric.name]) {
        durations[metric.name] = [];
      durations[metric.name].push(metric.duration);
    });
    const averages: Record<string, number> = {};
    Object.entries(durations).forEach(([name, values]) => {
      averages[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
    });
    const slowest = [...this.metrics];
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
    return {
  total: this.metrics.length,
  byType,
  averages,
  slowest
};
  /**
   * Flush metrics to storage or analytics service
   */
  flush(): void {
  if (this.metrics.length === 0) {
  return;
  const metricsToFlush = [...this.metrics];
  this.metrics = [];
  if (this.config.enableLogging) {
  console.log('[Performance] Flushing metrics:', metricsToFlush.length);
  // In a real implementation, you would send these to an analytics service
  // For now, we'll store them in sessionStorage as a fallback
  try {
  const existingMetrics = sessionStorage.getItem('performance_metrics');
  const allMetrics = existingMetrics ? JSON.parse(existingMetrics) : [];
  allMetrics.push(...metricsToFlush);
  // Keep only the most recent 5000 metrics
  const recentMetrics = allMetrics.slice(-5000);
  sessionStorage.setItem('performance_metrics', JSON.stringify(recentMetrics));
 catch (error) {
  console.warn('Failed to store performance metrics:', error);
  /**
  * Start periodic flushing
  */
  private startPeriodicFlush(): void {,
  this.flushTimer = window.setInterval(() => {
  this.flush();
}, this.config.flushInterval);
  /**
   * Determine if this operation should be sampled
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  /**
   * Clean up observers and timers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    this.flush(); // Final flush

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React Hook for component performance monitoring
export function usePerformanceTracking(componentName: string, dependencies: unknown = []): void {
  const renderStart = performance.now();
  React.useEffect(() => {
    const renderEnd = performance.now();
    const renderDuration = renderEnd - renderStart;
    performanceMonitor.addMetric({)
  name: `${componentName}_render`}
},
  duration: renderDuration,
      timestamp: renderStart,
      type: 'component',
      metadata: {
  componentName,
  dependencyCount: dependencies.length,
});
  });

// Higher-order component for performance tracking
export function withPerformanceTracking<P extends object>(WrappedComponent: React.ComponentType<P>)
  componentName?: string
): React.ComponentType<P> {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  const MemoizedComponent = React.memo(WrappedComponent);
  const WithPerformanceTracking: React.FC<P> = (props) => {,
  usePerformanceTracking(displayName);
  return React.createElement(MemoizedComponent, props);
};
  WithPerformanceTracking.displayName = `withPerformanceTracking(${displayName})`;}
  return WithPerformanceTracking;

// Utility functions
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        performanceMonitor.measureExecution()
          name || 'debounced_function',
          () => func(...args),
          'custom'
        );
      }, delay);
    };

  /**
   * Throttle function with performance tracking
   */
  throttle<T extends (...args: unknown) => unknown>(func: T);
  delay: number,
    name?: string
  ): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {,
  const now = Date.now();
  if (now - lastCall >= delay) {
  lastCall = now;
  performanceMonitor.measureExecution()
  name || 'throttled_function',
  () => func(...args),
  'custom'
  );
};
};

// Type exports
export type { PerformanceMetric, PerformanceConfig };

// Import React at the top of the file for the hooks
import React from 'react';