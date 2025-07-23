/**
 * Enhanced Web Vitals Integration for Epic 18
 * Standardized Web Vitals measurement using official web-vitals package
 */

import { getCLS, getFCP, getFID, getLCP, getTTI, onCLS, onFCP, onFID, onLCP, onTTI, Metric } from 'web-vitals';
import { EventEmitter } from 'events';

// Web Vitals Configuration
export interface WebVitalsConfig {
  enabled: boolean;
  reportAllChanges: boolean;
  samplingRate: number;        // 0-1 for sampling percentage
  thresholds: {
    fcp: { good: number; poor: number };      // First Contentful Paint (ms)
    lcp: { good: number; poor: number };      // Largest Contentful Paint (ms)
    fid: { good: number; poor: number };      // First Input Delay (ms)
    cls: { good: number; poor: number };      // Cumulative Layout Shift (score)
    tti: { good: number; poor: number };      // Time to Interactive (ms)
  };
  enableConsoleLogging: boolean;
  enableAnalytics: boolean;
  analyticsEndpoint?: string;
}

// Enhanced Metric with Rating
export interface EnhancedMetric extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceMemory?: number;
  effectiveType?: string;
}

// Web Vitals Analytics Data
export interface WebVitalsAnalytics {
  sessionId: string;
  timestamp: number;
  metrics: EnhancedMetric[];
  summary: {
    fcp: { value: number; rating: string };
    lcp: { value: number; rating: string };
    fid: { value: number; rating: string };
    cls: { value: number; rating: string };
    tti: { value: number; rating: string };
  };
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    devicePixelRatio: number;
    connectionType?: string;
    deviceMemory?: number;
    hardwareConcurrency: number;
  };
  pageInfo: {
    url: string;
    referrer: string;
    title: string;
    loadTime: number;
  };
}

// Default Configuration
const defaultConfig: WebVitalsConfig = {
  enabled: true,
  reportAllChanges: false,
  samplingRate: 1.0, // 100% sampling by default
  thresholds: {
    fcp: { good: 1800, poor: 3000 },      // Core Web Vitals thresholds
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    tti: { good: 3800, poor: 7300 }
  },
  enableConsoleLogging: false,
  enableAnalytics: true
};

/**
 * Enhanced Web Vitals Integration Manager
 * Provides standardized Web Vitals measurement with analytics and reporting
 */
export class WebVitalsIntegration extends EventEmitter {
  private config: WebVitalsConfig;
  private metrics: Map<string, EnhancedMetric> = new Map();
  private sessionId: string;
  private startTime: number;
  private isInitialized = false;

  constructor(config: Partial<WebVitalsConfig> = {}) {
    super();
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  /**
   * Initialize Web Vitals tracking
   */
  initialize(): void {
    if (this.isInitialized || !this.config.enabled) return;
    if (typeof window === 'undefined') {
      console.warn('Web Vitals can only be measured in browser environment');
      return;
    }

    // Check sampling rate
    if (Math.random() > this.config.samplingRate) {
      console.log('Web Vitals tracking skipped due to sampling rate');
      return;
    }

    this.isInitialized = true;
    console.log('🚀 Web Vitals tracking initialized');

    // Set up metric collection with the reportAllChanges option
    const options = { reportAllChanges: this.config.reportAllChanges };

    // Collect Web Vitals metrics
    onFCP(this.handleMetric.bind(this), options);
    onLCP(this.handleMetric.bind(this), options);
    onFID(this.handleMetric.bind(this), options);
    onCLS(this.handleMetric.bind(this), options);
    onTTI(this.handleMetric.bind(this), options);

    // Set up page visibility change handler for final reporting
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Set up beforeunload handler for final reporting
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    this.emit('initialized', { sessionId: this.sessionId });
  }

  /**
   * Get current Web Vitals snapshot
   */
  getCurrentVitals(): Promise<WebVitalsAnalytics> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(this.createEmptyAnalytics());
        return;
      }

      // Force collection of current metrics
      getCLS((metric) => this.handleMetric(metric), { reportAllChanges: false });
      getFCP((metric) => this.handleMetric(metric));
      getFID((metric) => this.handleMetric(metric));
      getLCP((metric) => this.handleMetric(metric), { reportAllChanges: false });
      getTTI((metric) => this.handleMetric(metric));

      // Allow time for metrics collection
      setTimeout(() => {
        resolve(this.generateAnalytics());
      }, 100);
    });
  }

  /**
   * Get metric by name
   */
  getMetric(name: string): EnhancedMetric | undefined {
    return this.metrics.get(name);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): EnhancedMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear collected metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.emit('metrics-cleared');
  }

  /**
   * Send analytics data to endpoint
   */
  async sendAnalytics(data?: WebVitalsAnalytics): Promise<boolean> {
    if (!this.config.enableAnalytics || !this.config.analyticsEndpoint) {
      return false;
    }

    const analyticsData = data || await this.getCurrentVitals();

    try {
      const response = await fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analyticsData)
      });

      if (response.ok) {
        this.emit('analytics-sent', analyticsData);
        return true;
      } else {
        console.warn('Failed to send Web Vitals analytics:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending Web Vitals analytics:', error);
      this.emit('analytics-error', error);
      return false;
    }
  }

  private handleMetric(metric: Metric): void {
    const enhancedMetric = this.enhanceMetric(metric);
    this.metrics.set(metric.name, enhancedMetric);

    if (this.config.enableConsoleLogging) {
      console.log(`📊 ${metric.name}:`, {
        value: metric.value,
        rating: enhancedMetric.rating,
        delta: metric.delta,
        id: metric.id
      });
    }

    this.emit('metric-collected', enhancedMetric);

    // Check for poor performance and emit warnings
    if (enhancedMetric.rating === 'poor') {
      this.emit('poor-performance', enhancedMetric);
    }
  }

  private enhanceMetric(metric: Metric): EnhancedMetric {
    const rating = this.calculateRating(metric);
    const connectionInfo = this.getConnectionInfo();

    return {
      ...metric,
      rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: connectionInfo.type,
      deviceMemory: connectionInfo.deviceMemory,
      effectiveType: connectionInfo.effectiveType
    };
  }

  private calculateRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = this.config.thresholds[metric.name as keyof typeof this.config.thresholds];
    if (!thresholds) return 'good';

    if (metric.value <= thresholds.good) return 'good';
    if (metric.value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  private getConnectionInfo(): { type?: string; deviceMemory?: number; effectiveType?: string } {
    // Type assertion for experimental APIs
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    return {
      type: connection?.type,
      deviceMemory: nav.deviceMemory,
      effectiveType: connection?.effectiveType
    };
  }

  private generateSessionId(): string {
    return `wv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAnalytics(): WebVitalsAnalytics {
    const metrics = this.getAllMetrics();
    
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metrics,
      summary: {
        fcp: this.getMetricSummary('FCP'),
        lcp: this.getMetricSummary('LCP'),
        fid: this.getMetricSummary('FID'),
        cls: this.getMetricSummary('CLS'),
        tti: this.getMetricSummary('TTI')
      },
      deviceInfo: this.getDeviceInfo(),
      pageInfo: this.getPageInfo()
    };
  }

  private createEmptyAnalytics(): WebVitalsAnalytics {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      metrics: [],
      summary: {
        fcp: { value: 0, rating: 'good' },
        lcp: { value: 0, rating: 'good' },
        fid: { value: 0, rating: 'good' },
        cls: { value: 0, rating: 'good' },
        tti: { value: 0, rating: 'good' }
      },
      deviceInfo: {
        userAgent: 'Node.js',
        viewport: { width: 0, height: 0 },
        devicePixelRatio: 1,
        hardwareConcurrency: 1
      },
      pageInfo: {
        url: '',
        referrer: '',
        title: '',
        loadTime: 0
      }
    };
  }

  private getMetricSummary(name: string): { value: number; rating: string } {
    const metric = this.getMetric(name);
    return {
      value: metric?.value || 0,
      rating: metric?.rating || 'good'
    };
  }

  private getDeviceInfo() {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'Node.js',
        viewport: { width: 0, height: 0 },
        devicePixelRatio: 1,
        hardwareConcurrency: 1
      };
    }

    const connectionInfo = this.getConnectionInfo();

    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      devicePixelRatio: window.devicePixelRatio,
      connectionType: connectionInfo.type,
      deviceMemory: connectionInfo.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency
    };
  }

  private getPageInfo() {
    if (typeof window === 'undefined') {
      return {
        url: '',
        referrer: '',
        title: '',
        loadTime: 0
      };
    }

    const loadTime = Date.now() - this.startTime;

    return {
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      loadTime
    };
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      this.sendFinalReport();
    }
  }

  private handleBeforeUnload(): void {
    this.sendFinalReport();
  }

  private async sendFinalReport(): Promise<void> {
    const analytics = await this.getCurrentVitals();
    this.emit('final-report', analytics);
    
    if (this.config.enableAnalytics) {
      await this.sendAnalytics(analytics);
    }
  }

  /**
   * Create a performance observer for custom metrics
   */
  createPerformanceObserver(entryTypes: string[], callback: (entries: PerformanceEntry[]) => void): PerformanceObserver | null {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return null;
    }

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      observer.observe({ entryTypes });
      return observer;
    } catch (error) {
      console.warn('Failed to create PerformanceObserver:', error);
      return null;
    }
  }

  /**
   * Get Web Vitals configuration
   */
  getConfig(): WebVitalsConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<WebVitalsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config-updated', this.config);
  }
}

// Default instance for easy usage
export const webVitals = new WebVitalsIntegration();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => webVitals.initialize());
  } else {
    webVitals.initialize();
  }
}

export default WebVitalsIntegration;