/**
 * Client Performance Profiler
 * 
 * Comprehensive client-side performance monitoring for React application.
 * Tracks rendering performance, memory usage, network timing, and user interactions.
 * 
 * Task: T-1752989144295-168 - Profile server and client performance under load
 */
interface RenderMetrics {
  componentCount: number;
  renderTime: number;
  reRenderCount: number;
  mountTime: number;
  updateTime: number;
}
interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  heapUtilization: number;
}
interface NetworkMetrics {
  requestCount: number;
  totalTransferSize: number;
  averageResponseTime: number;
  errorCount: number;
  cacheHitRate: number;
}
interface UserInteractionMetrics {
  clickCount: number;
  scrollEvents: number;
  inputEvents: number;
  navigationCount: number;
  averageInteractionTime: number;
}
interface VitalMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}
interface PerformanceSnapshot {
  timestamp: number;
  render: RenderMetrics;
  memory: MemoryMetrics;
  network: NetworkMetrics;
  interactions: UserInteractionMetrics;
  vitals: VitalMetrics;
  customMetrics: Record<string, any>;
}
interface ClientProfilingConfig {
  sampleInterval: number;
  trackRenderMetrics: boolean;
  trackMemoryMetrics: boolean;
  trackNetworkMetrics: boolean;
  trackUserInteractions: boolean;
  trackWebVitals: boolean;
  maxSnapshots: number;
  alertThresholds: {,
    renderTime: number;
    memoryUsage: number;
    responseTime: number;
    layoutShift: number;
  };
}
/**
 * Client Performance Profiler
 */
export class ClientPerformanceProfiler {
  private config: ClientProfilingConfig;
  private snapshots: PerformanceSnapshot[] = [];
  private isRunning = false;
  private intervalId: number | null = null;
  private startTime: number = 0;
  private observers: PerformanceObserver[] = [];
  private renderMetrics: RenderMetrics = {
    componentCount: 0,
    renderTime: 0,
    reRenderCount: 0,
    mountTime: 0,
    updateTime: 0,
  };
  private networkRequests: PerformanceNavigationTiming[] = [];
  private userInteractions = {
    clickCount: 0,
    scrollEvents: 0,
    inputEvents: 0,
    navigationCount: 0,
    interactionTimes: [] as number[],
  };
  constructor(config: Partial<ClientProfilingConfig> = {}) {
    this.config = {
      sampleInterval: 1000, // 1 second
      trackRenderMetrics: true,
      trackMemoryMetrics: true,
      trackNetworkMetrics: true,
      trackUserInteractions: true,
      trackWebVitals: true,
      maxSnapshots: 3600, // 1 hour
      alertThresholds: {,
        renderTime: 16.67, // 60fps threshold
        memoryUsage: 80, // %
        responseTime: 2000, // ms
        layoutShift: 0.1 // CLS threshold,
      },
      ...config
    };
    this.initializeObservers();
    this.setupEventListeners();
  }
  /**
   * Start client performance profiling
   */
  startProfiling(): void {
    if (this.isRunning) {
      console.warn('Client performance profiling is already running');
      return;
    }
    console.log('🔍 Starting client performance profiling...');
    this.isRunning = true;
    this.startTime = performance.now();
    this.snapshots = [];
    // Reset counters
    this.resetCounters();
    // Start periodic sampling
    this.intervalId = window.setInterval(() => {
      this.collectSnapshot();
    }, this.config.sampleInterval);
    // Take initial snapshot
    this.collectSnapshot();
    console.log(`✅ Client performance profiling started (sampling every ${this.config.sampleInterval}ms)`);}
  }
  /**
   * Stop client performance profiling
   */
  stopProfiling(): PerformanceSnapshot[] {
    if (!this.isRunning) {
      console.warn('Client performance profiling is not running');
      return this.snapshots;
    }
    console.log('⏹️  Stopping client performance profiling...');
    this.isRunning = false;
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Take final snapshot
    this.collectSnapshot();
    // Cleanup observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    console.log(`✅ Client performance profiling stopped (${this.snapshots.length} snapshots collected over ${Math.round(duration / 1000)}s)`);}
    // Generate and save report
    this.generateReport();
    return this.snapshots;
  }
  /**
   * Collect performance snapshot
   */
  private collectSnapshot(): void {
    try {
      const timestamp = performance.now();
      const snapshot: PerformanceSnapshot = {
        timestamp,
        render: this.collectRenderMetrics(),
        memory: this.collectMemoryMetrics(),
        network: this.collectNetworkMetrics(),
        interactions: this.collectUserInteractionMetrics(),
        vitals: this.collectWebVitals(),
        customMetrics: {}
      };
      this.snapshots.push(snapshot);
      // Trim snapshots if exceeding max
      if (this.snapshots.length > this.config.maxSnapshots) {
        this.snapshots = this.snapshots.slice(-this.config.maxSnapshots);
      }
      // Check for performance alerts
      this.checkPerformanceAlerts(snapshot);
    } catch (error) {
      console.error('Failed to collect client performance snapshot:', error);
    }
  }
  /**
   * Collect render metrics
   */
  private collectRenderMetrics(): RenderMetrics {
    if (!this.config.trackRenderMetrics) {
      return {
        componentCount: 0,
        renderTime: 0,
        reRenderCount: 0,
        mountTime: 0,
        updateTime: 0,
      };
    }
    // Get React DevTools data if available
    let componentCount = 0;
    try {
      // This would integrate with React DevTools profiler
      componentCount = document.querySelectorAll('[data-reactroot] *').length;
    } catch (error) {
      // Fallback to DOM element count
      componentCount = document.getElementsByTagName('*').length;
    }
    return {
      ...this.renderMetrics,
      componentCount
    };
  }
  /**
   * Collect memory metrics
   */
  private collectMemoryMetrics(): MemoryMetrics {
    if (!this.config.trackMemoryMetrics || !(performance as any).memory) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        heapUtilization: 0,
      };
    }
    const memory = (performance as any).memory;
    const heapUtilization = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      heapUtilization
    };
  }
  /**
   * Collect network metrics
   */
  private collectNetworkMetrics(): NetworkMetrics {
    if (!this.config.trackNetworkMetrics) {
      return {
        requestCount: 0,
        totalTransferSize: 0,
        averageResponseTime: 0,
        errorCount: 0,
        cacheHitRate: 0,
      };
    }
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    let totalSize = 0;
    let totalResponseTime = 0;
    let cacheHits = 0;
    const errorCount = 0;
    resources.forEach(resource => {)
      totalSize += resource.transferSize || 0;
      totalResponseTime += resource.responseEnd - resource.responseStart;
      if (resource.transferSize === 0 && resource.decodedBodySize > 0) {
        cacheHits++;
      }
    });
    const averageResponseTime = resources.length > 0 ? totalResponseTime / resources.length : 0;
    const cacheHitRate = resources.length > 0 ? (cacheHits / resources.length) * 100 : 0;
    return {
      requestCount: resources.length,
      totalTransferSize: totalSize,
      averageResponseTime,
      errorCount,
      cacheHitRate
    };
  }
  /**
   * Collect user interaction metrics
   */
  private collectUserInteractionMetrics(): UserInteractionMetrics {
    if (!this.config.trackUserInteractions) {
      return {
        clickCount: 0,
        scrollEvents: 0,
        inputEvents: 0,
        navigationCount: 0,
        averageInteractionTime: 0,
      };
    }
    const averageInteractionTime = this.userInteractions.interactionTimes.length > 0;
      ? this.userInteractions.interactionTimes.reduce()
        (a,)
          b
        ) => a + b, 0) / this.userInteractions.interactionTimes.length
      : 0;
    return {
      clickCount: this.userInteractions.clickCount,
      scrollEvents: this.userInteractions.scrollEvents,
      inputEvents: this.userInteractions.inputEvents,
      navigationCount: this.userInteractions.navigationCount,
      averageInteractionTime
    };
  }
  /**
   * Collect Web Vitals metrics
   */
  private collectWebVitals(): VitalMetrics {
    if (!this.config.trackWebVitals) {
      return {
        FCP: 0,
        LCP: 0,
        FID: 0,
        CLS: 0,
        TTFB: 0,
      };
    }
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByName('first-contentful-paint')[0];
    return {
      FCP: paint ? paint.startTime : 0,
      LCP: this.getLargestContentfulPaint(),
      FID: this.getFirstInputDelay(),
      CLS: this.getCumulativeLayoutShift(),
      TTFB: navigation ? navigation.responseStart - navigation.requestStart : 0,
    };
  }
  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (!window.PerformanceObserver) return;
    // Layout shift observer
    if (this.config.trackWebVitals) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              this.cumulativeLayoutShift += (entry as any).value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('Failed to initialize layout-shift observer:', error);
      }
    }
    // Paint observer
    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'largest-contentful-paint') {
            this.largestContentfulPaint = entry.startTime;
          }
        }
      });
      paintObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Failed to initialize paint observer:', error);
    }
  }
  /**
   * Setup event listeners for user interactions
   */
  private setupEventListeners(): void {
    if (!this.config.trackUserInteractions) return;
    // Click events
    document.addEventListener('click', (event) => {
      this.userInteractions.clickCount++;
      this.trackInteractionTime(event);
    });
    // Scroll events  
    let scrollTimeout: number;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.userInteractions.scrollEvents++;
      }, 100);
    });
    // Input events
    document.addEventListener('input', (event) => {
      this.userInteractions.inputEvents++;
      this.trackInteractionTime(event);
    });
    // Navigation events
    window.addEventListener('popstate', () => {
      this.userInteractions.navigationCount++;
    });
  }
  /**
   * Track interaction timing
   */
  private trackInteractionTime(event: Event): void {
    const start = performance.now();
    requestAnimationFrame(() => {
      const duration = performance.now() - start;
      this.userInteractions.interactionTimes.push(duration);
    });
  }
  /**
   * React component lifecycle tracking
   */
  trackComponentRender(componentName: string, renderTime: number, isMount: boolean = false): void {
    if (!this.config.trackRenderMetrics) return;
    this.renderMetrics.renderTime += renderTime;
    if (isMount) {
      this.renderMetrics.mountTime += renderTime;
    } else {
      this.renderMetrics.updateTime += renderTime;
      this.renderMetrics.reRenderCount++;
    }
  }
  /**
   * Custom metric tracking
   */
  addCustomMetric(key: string, value: unknown): void {
    if (this.snapshots.length > 0) {
      const lastSnapshot = this.snapshots[this.snapshots.length - 1];
      lastSnapshot.customMetrics[key] = value;
    }
  }
  /**
   * Check for performance alerts
   */
  private checkPerformanceAlerts(snapshot: PerformanceSnapshot): void {
    const alerts: string[] = [];
    // Render time alert
    if (snapshot.render.renderTime > this.config.alertThresholds.renderTime) {
      alerts.push(`Slow rendering detected: ${snapshot.render.renderTime.toFixed(2)}ms`);}
    }
    // Memory usage alert
    if (snapshot.memory.heapUtilization > this.config.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${snapshot.memory.heapUtilization.toFixed(1)}%`);}
    }
    // Response time alert
    if (snapshot.network.averageResponseTime > this.config.alertThresholds.responseTime) {
      alerts.push(`Slow network responses: ${snapshot.network.averageResponseTime.toFixed(0)}ms`);}
    }
    // Layout shift alert
    if (snapshot.vitals.CLS > this.config.alertThresholds.layoutShift) {
      alerts.push(`High layout shift: ${snapshot.vitals.CLS.toFixed(3)}`);}
    }
    if (alerts.length > 0) {
      console.warn('🚨 Client Performance Alerts:', alerts);
    }
  }
  /**
   * Generate performance report
   */
  private generateReport(): void {
    if (this.snapshots.length === 0) {
      console.warn('No client snapshots to generate report');
      return;
    }
    const report = {
      metadata: {,
        userAgent: navigator.userAgent,
        startTime: this.startTime,
        endTime: performance.now(),
        duration: performance.now() - this.startTime,
        snapshotCount: this.snapshots.length,
        sampleInterval: this.config.sampleInterval,
      },
      summary: this.generateSummaryMetrics(),
      snapshots: this.snapshots,
      recommendations: this.generateRecommendations(),
    };
    // Store in localStorage for retrieval
    const reportKey = `client-performance-${Date.now()}`;}
    localStorage.setItem(reportKey, JSON.stringify(report));
    console.log(`📊 Client performance report saved to localStorage: ${reportKey}`);}
    // Also send to server if available
    this.sendReportToServer(report);
  }
  /**
   * Send report to server
   */
  private async sendReportToServer(report: PerformanceSnapshot): Promise<void> {
    try {
      await fetch('/api/performance/client-report', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report),
      });
      console.log('📤 Client performance report sent to server');
    } catch (error) {
      console.warn('Failed to send client performance report to server:', error);
    }
  }
  /**
   * Generate summary metrics
   */
  private generateSummaryMetrics(): Record<string, unknown> {
    if (this.snapshots.length === 0) return null;
    const renderTimes = this.snapshots.map(s => s.render.renderTime);
    const memoryUsage = this.snapshots.map(s => s.memory.heapUtilization);
    const responseTimes = this.snapshots.map(s => s.network.averageResponseTime);
    return {
      render: {,
        average: this.average(renderTimes),
        max: Math.max(...renderTimes),
        min: Math.min(...renderTimes),
        totalReRenders: this.renderMetrics.reRenderCount,
      },
      memory: {,
        average: this.average(memoryUsage),
        max: Math.max(...memoryUsage),
        peak: Math.max(...this.snapshots.map(s => s.memory.usedJSHeapSize)),
      },
      network: {,
        average: this.average(responseTimes),
        totalRequests: this.snapshots.reduce((sum, s) => sum + s.network.requestCount, 0),
        totalTransfer: this.snapshots.reduce((sum, s) => sum + s.network.totalTransferSize, 0)
      },
      interactions: {,
        totalClicks: this.userInteractions.clickCount,
        totalScrolls: this.userInteractions.scrollEvents,
        totalInputs: this.userInteractions.inputEvents,
      }
    };
  }
  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const summary = this.generateSummaryMetrics();
    if (!summary) return recommendations;
    if (summary.render.average > 16.67) {
      recommendations.push('Consider React.memo() or useMemo() for expensive components');
    }
    if (summary.memory.average > 70) {
      recommendations.push('Optimize memory usage: implement component cleanup and avoid memory leaks');
    }
    if (summary.network.average > 1000) {
      recommendations.push('Optimize network requests: implement caching and request deduplication');
    }
    if (summary.render.totalReRenders > 100) {
      recommendations.push('Reduce unnecessary re-renders: optimize state management and prop passing');
    }
    return recommendations;
  }
  // Helper properties for Web Vitals
  private largestContentfulPaint = 0;
  private firstInputDelay = 0;
  private cumulativeLayoutShift = 0;
  private getLargestContentfulPaint(): number {
    return this.largestContentfulPaint;
  }
  private getFirstInputDelay(): number {
    return this.firstInputDelay;
  }
  private getCumulativeLayoutShift(): number {
    return this.cumulativeLayoutShift;
  }
  private average(values: number[]): number {
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }
  private resetCounters(): void {
    this.renderMetrics = {
      componentCount: 0,
      renderTime: 0,
      reRenderCount: 0,
      mountTime: 0,
      updateTime: 0,
    };
    this.userInteractions = {
      clickCount: 0,
      scrollEvents: 0,
      inputEvents: 0,
      navigationCount: 0,
      interactionTimes: [],
    };
    this.largestContentfulPaint = 0;
    this.firstInputDelay = 0;
    this.cumulativeLayoutShift = 0;
  }
  /**
   * Get current performance stats
   */
  getCurrentStats(): PerformanceSnapshot {
    if (this.snapshots.length === 0) return null;
    const latest = this.snapshots[this.snapshots.length - 1];
    return {
      timestamp: latest.timestamp,
      renderTime: latest.render.renderTime,
      memoryUsage: latest.memory.heapUtilization,
      networkResponseTime: latest.network.averageResponseTime,
      layoutShift: latest.vitals.CLS,
      interactionCount: latest.interactions.clickCount + latest.interactions.inputEvents,
    };
  }
}

// Global instance for easy access
export const clientProfiler = new ClientPerformanceProfiler();