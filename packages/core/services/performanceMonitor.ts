// Drag Operation Performance Monitor
// Story 2.5a: Asset Browser Integration MVP

export interface PerformanceMetric {
  dragId: string;
  event: 'start' | 'hover' | 'validate' | 'drop';
  timestamp: number;
  duration: number;
  exceeded: boolean;
}

export interface PerformanceReport {
  dragId: string;
  totalDuration: number;
  events: PerformanceMetric[];
  violations: string[];
  fps: number;
}

export class DragPerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private frameTimestamps: number[] = [];
  private analyticsEnabled: boolean = true;
  
  // Performance targets (in milliseconds)
  private static readonly TARGETS = {
    dragInitiation: 16,    // Single frame
    hoverValidation: 50,   // 3 frames
    dropCompletion: 100,   // 6 frames
    visualFeedback: 16.67  // 60fps
  };

  startDragOperation(dragId: string): void {
    const startTime = performance.now();
    this.metrics.set(dragId, [{
      dragId,
      event: 'start',
      timestamp: startTime,
      duration: 0,
      exceeded: false
    }]);
    
    // Start FPS monitoring
    this.startFPSMonitoring();
  }

  recordDragEvent(dragId: string, event: 'hover' | 'validate' | 'drop'): void {
    const metrics = this.metrics.get(dragId);
    if (!metrics) return;
    
    const now = performance.now();
    const startTime = metrics[0].timestamp;
    const duration = now - (metrics[metrics.length - 1]?.timestamp || startTime);
    
    // Check if performance target is exceeded
    const target = this.getTargetForEvent(event);
    const exceeded = duration > target;
    
    const metric: PerformanceMetric = {
      dragId,
      event,
      timestamp: now,
      duration,
      exceeded
    };
    
    metrics.push(metric);
    
    // Alert if target exceeded
    if (exceeded) {
      this.handlePerformanceViolation(dragId, event, duration, target);
    }
    
    // Complete operation tracking for drop event
    if (event === 'drop') {
      this.completeDragOperation(dragId);
    }
  }

  private getTargetForEvent(event: 'hover' | 'validate' | 'drop'): number {
    switch (event) {
      case 'hover':
        return DragPerformanceMonitor.TARGETS.hoverValidation;
      case 'validate':
        return DragPerformanceMonitor.TARGETS.hoverValidation;
      case 'drop':
        return DragPerformanceMonitor.TARGETS.dropCompletion;
      default:
        return DragPerformanceMonitor.TARGETS.visualFeedback;
    }
  }

  private handlePerformanceViolation(
    dragId: string,
    event: string,
    duration: number,
    target: number
  ): void {
    const message = `Performance degradation: ${event} took ${duration.toFixed(2)}ms (target: ${target}ms)`;
    console.warn(message);
    
    // Report to analytics
    this.reportToAnalytics(dragId, event, duration, true);
    
    // Store violation for reporting
    const metrics = this.metrics.get(dragId);
    if (metrics) {
      const lastMetric = metrics[metrics.length - 1];
      lastMetric.exceeded = true;
    }
  }

  private completeDragOperation(dragId: string): void {
    const metrics = this.metrics.get(dragId);
    if (!metrics) return;
    
    // Calculate total duration
    const totalDuration = metrics[metrics.length - 1].timestamp - metrics[0].timestamp;
    
    // Calculate average FPS during operation
    const avgFPS = this.calculateAverageFPS();
    
    // Generate report
    const report = this.generateReport(dragId);
    
    // Log summary
    if (totalDuration > 200) {
      console.warn(`Drag operation ${dragId} exceeded 200ms total: ${totalDuration.toFixed(2)}ms`);
    }
    
    // Clean up old metrics after 1 minute
    setTimeout(() => {
      this.metrics.delete(dragId);
    }, 60000);
  }

  generateReport(dragId: string): PerformanceReport | null {
    const metrics = this.metrics.get(dragId);
    if (!metrics || metrics.length === 0) return null;
    
    const totalDuration = metrics[metrics.length - 1].timestamp - metrics[0].timestamp;
    const violations: string[] = [];
    
    metrics.forEach(metric => {
      if (metric.exceeded) {
        violations.push(`${metric.event}: ${metric.duration.toFixed(2)}ms`);
      }
    });
    
    return {
      dragId,
      totalDuration,
      events: metrics,
      violations,
      fps: this.calculateAverageFPS()
    };
  }

  reportToAnalytics(dragId: string, event: string, duration: number, exceeded: boolean): void {
    if (!this.analyticsEnabled) return;
    
    // Integration point for analytics service
    if (typeof window !== 'undefined' && (window as any).analyticsReporter) {
      (window as any).analyticsReporter.track('drag_performance', {
        dragId,
        event,
        duration,
        exceeded,
        timestamp: Date.now()
      });
    }
  }

  // FPS Monitoring
  private startFPSMonitoring(): void {
    const measureFPS = () => {
      const now = performance.now();
      this.frameTimestamps.push(now);
      
      // Keep only last 60 frames (1 second at 60fps)
      if (this.frameTimestamps.length > 60) {
        this.frameTimestamps.shift();
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  private calculateAverageFPS(): number {
    if (this.frameTimestamps.length < 2) return 60;
    
    const durations: number[] = [];
    for (let i = 1; i < this.frameTimestamps.length; i++) {
      durations.push(this.frameTimestamps[i] - this.frameTimestamps[i - 1]);
    }
    
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(1000 / avgDuration);
  }

  // Get current performance status
  getCurrentStatus(): {
    activeDrags: number;
    averageFPS: number;
    recentViolations: number;
  } {
    const now = performance.now();
    const recentMetrics = Array.from(this.metrics.values())
      .flat()
      .filter(m => now - m.timestamp < 5000); // Last 5 seconds
    
    const violations = recentMetrics.filter(m => m.exceeded).length;
    
    return {
      activeDrags: this.metrics.size,
      averageFPS: this.calculateAverageFPS(),
      recentViolations: violations
    };
  }

  // Enable/disable analytics reporting
  setAnalyticsEnabled(enabled: boolean): void {
    this.analyticsEnabled = enabled;
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics.clear();
    this.frameTimestamps = [];
  }

  // Export metrics for debugging
  exportMetrics(): Record<string, PerformanceMetric[]> {
    return Object.fromEntries(this.metrics);
  }
}

// Singleton instance for global access
export const dragPerformanceMonitor = new DragPerformanceMonitor();