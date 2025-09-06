// Performance Monitoring System for Story 2.4
// Tracks metrics, latencies, and generates performance reports

export interface Metric {
  duration: number;
  timestamp: number;
  operation?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  p95Latency: number;
  p50Latency: number;
  p99Latency: number;
  averageLatency: number;
  maxLatency: number;
  minLatency: number;
  totalOperations: number;
  operationBreakdown: Record<string, OperationStats>;
  cacheHitRate: number;
  costPerOperation: number;
  recommendations: string[];
  bottlenecks: Bottleneck[];
}

export interface OperationStats {
  count: number;
  totalDuration: number;
  averageDuration: number;
  p95Duration: number;
  failures: number;
}

export interface Bottleneck {
  operation: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
}

export class PerformanceMonitor {
  private metrics: Map<string, Metric[]> = new Map();
  private startTime: number;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;
  private totalCost: number = 0;
  private operationCosts: Map<string, number> = new Map();
  
  constructor() {
    this.startTime = Date.now();
  }
  
  // Track a metric
  track(operation: string, duration: number, metadata?: any): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    this.metrics.get(operation)!.push({
      duration,
      timestamp: Date.now(),
      operation,
      metadata
    });
  }
  
  // Track cache hit/miss
  trackCache(hit: boolean): void {
    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
  }
  
  // Track cost
  trackCost(operation: string, cost: number): void {
    this.totalCost += cost;
    this.operationCosts.set(
      operation,
      (this.operationCosts.get(operation) || 0) + cost
    );
  }
  
  // Calculate percentile
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }
  
  // Get percentile latency for an operation
  getP95(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    const durations = metrics.map(m => m.duration);
    return this.calculatePercentile(durations, 95);
  }
  
  getP50(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    const durations = metrics.map(m => m.duration);
    return this.calculatePercentile(durations, 50);
  }
  
  getP99(operation: string): number {
    const metrics = this.metrics.get(operation) || [];
    const durations = metrics.map(m => m.duration);
    return this.calculatePercentile(durations, 99);
  }
  
  // Calculate cache hit rate
  calculateCacheRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    if (total === 0) return 0;
    return this.cacheHits / total;
  }
  
  // Calculate average cost per operation
  calculateCostPerOperation(): number {
    const totalOps = Array.from(this.metrics.values())
      .reduce((sum, metrics) => sum + metrics.length, 0);
    
    if (totalOps === 0) return 0;
    return this.totalCost / totalOps;
  }
  
  // Analyze bottlenecks
  analyzeBottlenecks(): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    
    for (const [operation, metrics] of this.metrics.entries()) {
      const p95 = this.getP95(operation);
      const avg = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      
      // Check for high latency
      if (p95 > 2000) {
        bottlenecks.push({
          operation,
          severity: p95 > 5000 ? 'high' : 'medium',
          description: `P95 latency is ${p95}ms (target: <2000ms)`,
          recommendation: 'Consider caching or optimizing this operation'
        });
      }
      
      // Check for high variance
      const variance = p95 / avg;
      if (variance > 3) {
        bottlenecks.push({
          operation,
          severity: 'medium',
          description: `High variance in latency (P95/avg = ${variance.toFixed(1)})`,
          recommendation: 'Investigate inconsistent performance'
        });
      }
      
      // Check for failures
      const failures = metrics.filter(m => m.metadata?.failed).length;
      const failureRate = failures / metrics.length;
      if (failureRate > 0.1) {
        bottlenecks.push({
          operation,
          severity: 'high',
          description: `High failure rate: ${(failureRate * 100).toFixed(1)}%`,
          recommendation: 'Add retry logic or investigate root cause'
        });
      }
    }
    
    // Check cache effectiveness
    const cacheRate = this.calculateCacheRate();
    if (cacheRate < 0.4 && this.cacheMisses > 100) {
      bottlenecks.push({
        operation: 'caching',
        severity: 'medium',
        description: `Low cache hit rate: ${(cacheRate * 100).toFixed(1)}%`,
        recommendation: 'Increase cache TTL or improve cache key strategy'
      });
    }
    
    // Check cost efficiency
    const costPerOp = this.calculateCostPerOperation();
    if (costPerOp > 0.01) {
      bottlenecks.push({
        operation: 'cost',
        severity: 'medium',
        description: `High cost per operation: $${costPerOp.toFixed(4)}`,
        recommendation: 'Use cheaper models or increase caching'
      });
    }
    
    return bottlenecks;
  }
  
  // Generate recommendations
  generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const bottlenecks = this.analyzeBottlenecks();
    
    // Add bottleneck recommendations
    for (const bottleneck of bottlenecks) {
      if (bottleneck.severity === 'high') {
        recommendations.push(`⚠️ ${bottleneck.recommendation}`);
      }
    }
    
    // Cache recommendations
    const cacheRate = this.calculateCacheRate();
    if (cacheRate < 0.3) {
      recommendations.push('Enable caching to improve performance');
    } else if (cacheRate < 0.5) {
      recommendations.push('Consider increasing cache TTL for better hit rate');
    }
    
    // Cost recommendations
    const costPerOp = this.calculateCostPerOperation();
    if (costPerOp > 0.005) {
      recommendations.push('Consider using cheaper models for non-critical operations');
    }
    
    // Latency recommendations
    const allMetrics = Array.from(this.metrics.values()).flat();
    const globalP95 = this.calculatePercentile(
      allMetrics.map(m => m.duration),
      95
    );
    
    if (globalP95 > 3000) {
      recommendations.push('Implement request batching to reduce latency');
    }
    
    // Concurrency recommendations
    const totalDuration = Date.now() - this.startTime;
    const totalOps = allMetrics.length;
    const opsPerSecond = totalOps / (totalDuration / 1000);
    
    if (opsPerSecond < 5 && totalOps > 100) {
      recommendations.push('Increase concurrency for bulk operations');
    }
    
    return recommendations;
  }
  
  // Generate comprehensive report
  generateReport(): PerformanceReport {
    const allMetrics = Array.from(this.metrics.values()).flat();
    const durations = allMetrics.map(m => m.duration);
    
    // Calculate global percentiles
    const p95Latency = this.calculatePercentile(durations, 95);
    const p50Latency = this.calculatePercentile(durations, 50);
    const p99Latency = this.calculatePercentile(durations, 99);
    
    // Calculate averages
    const averageLatency = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 0;
    
    const maxLatency = durations.length > 0 ? Math.max(...durations) : 0;
    const minLatency = durations.length > 0 ? Math.min(...durations) : 0;
    
    // Build operation breakdown
    const operationBreakdown: Record<string, OperationStats> = {};
    
    for (const [operation, metrics] of this.metrics.entries()) {
      const opDurations = metrics.map(m => m.duration);
      const failures = metrics.filter(m => m.metadata?.failed).length;
      
      operationBreakdown[operation] = {
        count: metrics.length,
        totalDuration: opDurations.reduce((sum, d) => sum + d, 0),
        averageDuration: opDurations.reduce((sum, d) => sum + d, 0) / opDurations.length,
        p95Duration: this.calculatePercentile(opDurations, 95),
        failures
      };
    }
    
    return {
      p95Latency,
      p50Latency,
      p99Latency,
      averageLatency,
      maxLatency,
      minLatency,
      totalOperations: allMetrics.length,
      operationBreakdown,
      cacheHitRate: this.calculateCacheRate(),
      costPerOperation: this.calculateCostPerOperation(),
      recommendations: this.generateRecommendations(),
      bottlenecks: this.analyzeBottlenecks()
    };
  }
  
  // Export metrics to JSON
  exportMetrics(): string {
    const report = this.generateReport();
    const exportData = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      report,
      rawMetrics: Array.from(this.metrics.entries()).map(([op, metrics]) => ({
        operation: op,
        metrics: metrics.slice(0, 100) // Limit to first 100 for size
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  // Generate performance summary
  generateSummary(): string {
    const report = this.generateReport();
    
    return `
Performance Summary
==================
Total Operations: ${report.totalOperations}
P50 Latency: ${report.p50Latency.toFixed(0)}ms
P95 Latency: ${report.p95Latency.toFixed(0)}ms
P99 Latency: ${report.p99Latency.toFixed(0)}ms
Average Latency: ${report.averageLatency.toFixed(0)}ms
Cache Hit Rate: ${(report.cacheHitRate * 100).toFixed(1)}%
Cost per Operation: $${report.costPerOperation.toFixed(4)}

Top Operations by Count:
${Object.entries(report.operationBreakdown)
  .sort((a, b) => b[1].count - a[1].count)
  .slice(0, 5)
  .map(([op, stats]) => `  - ${op}: ${stats.count} ops (avg: ${stats.averageDuration.toFixed(0)}ms)`)
  .join('\n')}

Bottlenecks Detected: ${report.bottlenecks.length}
${report.bottlenecks
  .filter(b => b.severity === 'high')
  .map(b => `  ⚠️ ${b.description}`)
  .join('\n')}

Recommendations:
${report.recommendations.map(r => `  • ${r}`).join('\n')}
    `.trim();
  }
  
  // Reset all metrics
  reset(): void {
    this.metrics.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.totalCost = 0;
    this.operationCosts.clear();
    this.startTime = Date.now();
  }
}