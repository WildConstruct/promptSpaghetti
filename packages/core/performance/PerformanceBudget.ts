/**
 * Performance Budget System for Epic 18
 * Establishes performance thresholds and monitoring for technical debt reduction
 */
import { EventEmitter } from 'events';
import { ExecutionMetrics } from '../utils/performance';

// Performance Budget Configuration Types

export interface PerformanceBudgetConfig {
  // Bundle Size Budgets
  bundles: {
  main: number;        // Main bundle size in KB,
  vendor: number;      // Vendor bundle size in KB,
  chunks: number;      // Individual chunk size in KB,
  total: number;       // Total bundle size in KB,
};
  // Runtime Performance Budgets
  runtime: {
  firstContentfulPaint: number;   // FCP in ms,
  largestContentfulPaint: number; // LCP in ms,
  firstInputDelay: number;        // FID in ms,
  cumulativeLayoutShift: number;  // CLS score,
  timeToInteractive: number;      // TTI in ms,
};
  // API Performance Budgets
  api: {
  graphExecution: number;         // Graph execution time in ms,
  preview: number;                // Preview generation time in ms,
  validation: number;             // Graph validation time in ms,
  authentication: number;         // Auth response time in ms,
};
  // Memory Budgets
  memory: {
  initialHeap: number;           // Initial heap size in MB,
  peakHeap: number;              // Peak heap size in MB,
  steadyState: number;           // Steady state heap in MB,
  leakThreshold: number;         // Memory leak threshold in MB/hour,
};
  // Network Budgets
  network: {
  totalRequests: number;         // Max requests for initial load,
  totalTransferSize: number;     // Total transfer size in KB,
  thirdPartyRequests: number;    // Max third-party requests,
  criticalResourceCount: number; // Critical resource count,
};
  // Build Performance Budgets
  build: {
  buildTime: number;             // Build time in seconds,
  typeCheckTime: number;         // TypeScript check time in seconds,
  lintTime: number;              // Linting time in seconds,
  testTime: number;              // Test execution time in seconds,
};

// Performance Budget Violation Types
}
export interface BudgetViolation {
  category: string;
  metric: string;
  budget: number;
  actual: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
  suggestions: string;
  timestamp: number;
  // Performance Budget Results
}
export interface BudgetCheckResult {
  passed: boolean;
  score: number;          // 0-100 performance score,
  violations: BudgetViolation;
  summary: {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};
  recommendations: string;
  timestamp: number;

// Real-time Performance Metrics
}
export interface PerformanceSnapshot {
  timestamp: number;
  bundles: {
  main: number;
  vendor: number;
  chunks: number;
  total: number;
};
  runtime: {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  tti?: number;
};
  api: Record<string, number>;
  memory: {
  used: number;
  total: number;
  peak: number;
  gc: number;
};
  network: {
  requestCount: number;
  transferSize: number;
  thirdParty: number;
};
  build?: {
  buildTime: number;
  typeCheckTime: number;
  lintTime: number;
  testTime: number;
};
/**
 * Performance Budget Manager
 * Enforces performance budgets and tracks violations
 */
}
export class PerformanceBudgetManager extends EventEmitter {
  private config: PerformanceBudgetConfig;
  private violations: BudgetViolation = [];
  private snapshots: PerformanceSnapshot = [];
  private maxSnapshotHistory = 100;
  constructor(config: PerformanceBudgetConfig) {,
  super();
  this.config = config;
  /**
  * Check current performance against budget
  */
  checkBudget(snapshot: PerformanceSnapshot): BudgetCheckResult {,
  const violations: BudgetViolation = [];
  const timestamp = Date.now();
  // Check bundle size budgets
  violations.push(...this.checkBundleBudgets(snapshot));
  // Check runtime performance budgets
  violations.push(...this.checkRuntimeBudgets(snapshot));
  // Check API performance budgets
  violations.push(...this.checkApiBudgets(snapshot));
  // Check memory budgets
  violations.push(...this.checkMemoryBudgets(snapshot));
  // Check network budgets
  violations.push(...this.checkNetworkBudgets(snapshot));
  // Check build performance budgets
  if (snapshot.build) {
  violations.push(...this.checkBuildBudgets(snapshot));
  // Calculate performance score
  const score = this.calculatePerformanceScore(violations);
  // Generate summary
  const summary = this.summarizeViolations(violations);
  // Generate recommendations
  const recommendations = this.generateRecommendations(violations);
  const result: BudgetCheckResult = {,
  passed: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
  score,
  violations,
  summary,
  recommendations,
  timestamp
};
    // Store violations and emit events
    this.violations.push(...violations);
    this.snapshots.push(snapshot);
    // Limit history
    if (this.snapshots.length > this.maxSnapshotHistory) {
  this.snapshots = this.snapshots.slice(-this.maxSnapshotHistory);
  // Emit events for violations
  if (violations.length > 0) {
  this.emit('budget-violations', violations);
  const criticalViolations = violations.filter(v => v.severity === 'critical');
  if (criticalViolations.length > 0) {
  this.emit('critical-violations', criticalViolations);
  return result;
  private checkBundleBudgets(snapshot: PerformanceSnapshot): BudgetViolation {,
  const violations: BudgetViolation = [];
  // Main bundle size
  if (snapshot.bundles.main > this.config.bundles.main) {
  violations.push({)
  category: 'bundle',
  metric: 'main-bundle-size',
  budget: this.config.bundles.main,
  actual: snapshot.bundles.main,
  threshold: this.config.bundles.main * 1.1, // 10% tolerance,
  severity: this.calculateSeverity(snapshot.bundles.main, this.config.bundles.main),
  impact: 'Increased initial load time and delayed First Contentful Paint',
  suggestions: [,
  'Enable code splitting for non-critical modules',
  'Use dynamic imports for route-based code splitting',
  'Remove unused dependencies and dead code',
  'Enable tree shaking in build configuration'
  ],
  timestamp: Date.now(),
});
    // Vendor bundle size
    if (snapshot.bundles.vendor > this.config.bundles.vendor) {
  violations.push({)
  category: 'bundle',
  metric: 'vendor-bundle-size',
  budget: this.config.bundles.vendor,
  actual: snapshot.bundles.vendor,
  threshold: this.config.bundles.vendor * 1.1,
  severity: this.calculateSeverity(snapshot.bundles.vendor, this.config.bundles.vendor),
  impact: 'Large vendor bundle increases initial load time',
  suggestions: [,
  'Audit dependencies for size and necessity',
  'Replace large libraries with lighter alternatives',
  'Use CDN for common libraries',
  'Enable vendor chunk splitting'
  ],
  timestamp: Date.now(),
});
    // Total bundle size
    if (snapshot.bundles.total > this.config.bundles.total) {
  violations.push({)
  category: 'bundle',
  metric: 'total-bundle-size',
  budget: this.config.bundles.total,
  actual: snapshot.bundles.total,
  threshold: this.config.bundles.total * 1.1,
  severity: this.calculateSeverity(snapshot.bundles.total, this.config.bundles.total),
  impact: 'Excessive total bundle size impacts all performance metrics',
  suggestions: [,
  'Implement aggressive code splitting strategy',
  'Lazy load non-critical features',
  'Compress assets with Brotli/Gzip',
  'Optimize images and other static assets'
  ],
  timestamp: Date.now(),
});
    // Individual chunk sizes
    const oversizedChunks = snapshot.bundles.chunks.filter(size => size > this.config.bundles.chunks);
    if (oversizedChunks.length > 0) {
  violations.push({)
  category: 'bundle',
  metric: 'chunk-size',
  budget: this.config.bundles.chunks,
  actual: Math.max(...oversizedChunks),
  threshold: this.config.bundles.chunks * 1.1,
  severity: this.calculateSeverity(Math.max(...oversizedChunks), this.config.bundles.chunks),
  impact: 'Large chunks delay loading of specific features',
  suggestions: [,
  'Split large chunks into smaller modules',
  'Move common code to shared chunks',
  'Use webpack splitChunks optimization',
  'Analyze chunk composition with bundle analyzer'
  ],
  timestamp: Date.now(),
});
    return violations;
  private checkRuntimeBudgets(snapshot: PerformanceSnapshot): BudgetViolation {
  const violations: BudgetViolation = [];
  // First Contentful Paint
  if (snapshot.runtime.fcp && snapshot.runtime.fcp > this.config.runtime.firstContentfulPaint) {
  violations.push({)
  category: 'runtime',
  metric: 'first-contentful-paint',
  budget: this.config.runtime.firstContentfulPaint,
  actual: snapshot.runtime.fcp,
  threshold: this.config.runtime.firstContentfulPaint * 1.1,
  severity: this.calculateSeverity(snapshot.runtime.fcp, this.config.runtime.firstContentfulPaint),
  impact: 'Slow FCP makes the app feel unresponsive to users',
  suggestions: [,
  'Optimize critical rendering path',
  'Minimize render-blocking resources',
  'Use server-side rendering or static generation',
  'Optimize web fonts loading'
  ],
  timestamp: Date.now(),
});
    // Largest Contentful Paint
    if (snapshot.runtime.lcp && snapshot.runtime.lcp > this.config.runtime.largestContentfulPaint) {
  violations.push({)
  category: 'runtime',
  metric: 'largest-contentful-paint',
  budget: this.config.runtime.largestContentfulPaint,
  actual: snapshot.runtime.lcp,
  threshold: this.config.runtime.largestContentfulPaint * 1.1,
  severity: this.calculateSeverity(snapshot.runtime.lcp, this.config.runtime.largestContentfulPaint),
  impact: 'Slow LCP indicates main content takes too long to load',
  suggestions: [,
  'Optimize largest element loading (images, text)',
  'Use responsive images with proper sizing',
  'Preload critical resources',
  'Minimize server response times'
  ],
  timestamp: Date.now(),
});
    // First Input Delay
    if (snapshot.runtime.fid && snapshot.runtime.fid > this.config.runtime.firstInputDelay) {
  violations.push({)
  category: 'runtime',
  metric: 'first-input-delay',
  budget: this.config.runtime.firstInputDelay,
  actual: snapshot.runtime.fid,
  threshold: this.config.runtime.firstInputDelay * 1.1,
  severity: this.calculateSeverity(snapshot.runtime.fid, this.config.runtime.firstInputDelay),
  impact: 'High FID makes the app feel unresponsive to user interactions',
  suggestions: [,
  'Reduce JavaScript execution time',
  'Break up long-running tasks',
  'Use web workers for heavy computations',
  'Implement code splitting and lazy loading'
  ],
  timestamp: Date.now(),
});
    // Cumulative Layout Shift
    if (snapshot.runtime.cls && snapshot.runtime.cls > this.config.runtime.cumulativeLayoutShift) {
  violations.push({)
  category: 'runtime',
  metric: 'cumulative-layout-shift',
  budget: this.config.runtime.cumulativeLayoutShift,
  actual: snapshot.runtime.cls,
  threshold: this.config.runtime.cumulativeLayoutShift * 1.1,
  severity: this.calculateSeverity(snapshot.runtime.cls * 1000, this.config.runtime.cumulativeLayoutShift * 1000),
  impact: 'High CLS causes visual instability and poor user experience',
  suggestions: [,
  'Set explicit dimensions for images and videos',
  'Reserve space for dynamic content',
  'Avoid inserting content above existing content',
  'Use font-display: swap for web fonts'],
  timestamp: Date.now(),
});
    // Time to Interactive
    if (snapshot.runtime.tti && snapshot.runtime.tti > this.config.runtime.timeToInteractive) {
  violations.push({)
  category: 'runtime',
  metric: 'time-to-interactive',
  budget: this.config.runtime.timeToInteractive,
  actual: snapshot.runtime.tti,
  threshold: this.config.runtime.timeToInteractive * 1.1,
  severity: this.calculateSeverity(snapshot.runtime.tti, this.config.runtime.timeToInteractive),
  impact: 'High TTI delays when users can interact with the app',
  suggestions: [,
  'Minimize main thread work',
  'Reduce JavaScript parse and execution time',
  'Remove unused JavaScript',
  'Implement progressive loading strategies'
  ],
  timestamp: Date.now(),
});
    return violations;
  private checkApiBudgets(snapshot: PerformanceSnapshot): BudgetViolation {
  const violations: BudgetViolation = [];
  // Graph execution performance
  if (snapshot.api.graphExecution && snapshot.api.graphExecution > this.config.api.graphExecution) {
  violations.push({)
  category: 'api',
  metric: 'graph-execution-time',
  budget: this.config.api.graphExecution,
  actual: snapshot.api.graphExecution,
  threshold: this.config.api.graphExecution * 1.2,
  severity: this.calculateSeverity(snapshot.api.graphExecution, this.config.api.graphExecution),
  impact: 'Slow graph execution affects user workflow and productivity',
  suggestions: [,
  'Optimize graph traversal algorithms',
  'Implement caching for repeated operations',
  'Use background processing for complex graphs',
  'Add graph complexity limits'
  ],
  timestamp: Date.now(),
});
    // Preview generation performance
    if (snapshot.api.preview && snapshot.api.preview > this.config.api.preview) {
  violations.push({)
  category: 'api',
  metric: 'preview-generation-time',
  budget: this.config.api.preview,
  actual: snapshot.api.preview,
  threshold: this.config.api.preview * 1.2,
  severity: this.calculateSeverity(snapshot.api.preview, this.config.api.preview),
  impact: 'Slow preview generation reduces iteration speed',
  suggestions: [,
  'Implement preview result caching',
  'Optimize template rendering pipeline',
  'Use streaming for large previews',
  'Implement progressive preview loading'
  ],
  timestamp: Date.now(),
});
    return violations;
  private checkMemoryBudgets(snapshot: PerformanceSnapshot): BudgetViolation {
  const violations: BudgetViolation = [];
  // Peak heap usage
  if (snapshot.memory.peak > this.config.memory.peakHeap) {
  violations.push({)
  category: 'memory',
  metric: 'peak-heap-usage',
  budget: this.config.memory.peakHeap,
  actual: snapshot.memory.peak,
  threshold: this.config.memory.peakHeap * 1.1,
  severity: this.calculateSeverity(snapshot.memory.peak, this.config.memory.peakHeap),
  impact: 'High memory usage can cause browser slowdowns and crashes',
  suggestions: [,
  'Implement object pooling for frequently created objects',
  'Add memory cleanup in component unmount',
  'Use weak references where appropriate',
  'Implement lazy loading for large datasets'
  ],
  timestamp: Date.now(),
});
    // Memory leak detection (simplified)
    const recentSnapshots = this.snapshots.slice(-10);
    if (recentSnapshots.length >= 5) {
  const memoryTrend = this.calculateMemoryTrend(recentSnapshots);
  if (memoryTrend > this.config.memory.leakThreshold) {
  violations.push({)
  category: 'memory',
  metric: 'memory-leak-trend',
  budget: this.config.memory.leakThreshold,
  actual: memoryTrend,
  threshold: this.config.memory.leakThreshold,
  severity: 'high',
  impact: 'Memory leaks cause progressive performance degradation',
  suggestions: [,
  'Audit event listeners for proper cleanup',
  'Check for circular references',
  'Use browser memory profiling tools',
  'Implement memory monitoring alerts'
  ],
  timestamp: Date.now(),
});
    return violations;
  private checkNetworkBudgets(snapshot: PerformanceSnapshot): BudgetViolation {
  const violations: BudgetViolation = [];
  // Total request count
  if (snapshot.network.requestCount > this.config.network.totalRequests) {
  violations.push({)
  category: 'network',
  metric: 'total-request-count',
  budget: this.config.network.totalRequests,
  actual: snapshot.network.requestCount,
  threshold: this.config.network.totalRequests * 1.1,
  severity: this.calculateSeverity(snapshot.network.requestCount, this.config.network.totalRequests),
  impact: 'Too many requests slow down initial page load',
  suggestions: [,
  'Combine multiple small requests',
  'Use HTTP/2 server push for critical resources',
  'Implement resource bundling',
  'Add request deduplication'
  ],
  timestamp: Date.now(),
});
    // Transfer size
    if (snapshot.network.transferSize > this.config.network.totalTransferSize) {
  violations.push({)
  category: 'network',
  metric: 'total-transfer-size',
  budget: this.config.network.totalTransferSize,
  actual: snapshot.network.transferSize,
  threshold: this.config.network.totalTransferSize * 1.1,
  severity: this.calculateSeverity(snapshot.network.transferSize, this.config.network.totalTransferSize),
  impact: 'Large transfer size increases load time especially on slow connections',
  suggestions: [,
  'Enable compression for all text-based resources',
  'Optimize images and use modern formats',
  'Remove unnecessary assets',
  'Implement resource caching strategies'
  ],
  timestamp: Date.now(),
});
    return violations;
  private checkBuildBudgets(snapshot: PerformanceSnapshot): BudgetViolation {
  const violations: BudgetViolation = [];
  if (!snapshot.build) return violations;
  // Build time
  if (snapshot.build.buildTime > this.config.build.buildTime) {
  violations.push({)
  category: 'build',
  metric: 'build-time',
  budget: this.config.build.buildTime,
  actual: snapshot.build.buildTime,
  threshold: this.config.build.buildTime * 1.2,
  severity: this.calculateSeverity(snapshot.build.buildTime, this.config.build.buildTime),
  impact: 'Slow builds reduce developer productivity',
  suggestions: [,
  'Enable build caching',
  'Use incremental TypeScript compilation',
  'Optimize webpack configuration',
  'Consider build parallelization'
  ],
  timestamp: Date.now(),
});
    return violations;
  private calculateSeverity(actual: number, budget: number): 'low' | 'medium' | 'high' | 'critical' {
  const ratio = actual / budget;
  if (ratio >= 2.0) return 'critical';
  if (ratio >= 1.5) return 'high';
  if (ratio >= 1.2) return 'medium';
  return 'low';
  private calculatePerformanceScore(violations: BudgetViolation): number {,
  let score = 100;
  violations.forEach(violation => {)
  switch (violation.severity) {
  case 'critical':,
  score -= 25;
  break;
  case 'high':,
  score -= 15;
  break;
  case 'medium':,
  score -= 10;
  break;
  case 'low':,
  score -= 5;
  break;
});
    return Math.max(0, score);
  private summarizeViolations(violations: BudgetViolation) {
  return {
  total: violations.length,
  critical: violations.filter(v => v.severity === 'critical').length,
  high: violations.filter(v => v.severity === 'high').length,
  medium: violations.filter(v => v.severity === 'medium').length,
  low: violations.filter(v => v.severity === 'low').length,
};
  private generateRecommendations(violations: BudgetViolation): string {
    const recommendations = new Set<string>();
    violations.forEach(violation => {)
  violation.suggestions.forEach(suggestion => {)
  recommendations.add(suggestion);
      });
    });
    return Array.from(recommendations);
  private calculateMemoryTrend(snapshots: PerformanceSnapshot): number {
  if (snapshots.length < 2) return 0;
  const first = snapshots[0];
  const last = snapshots[snapshots.length - 1];
  const timeDiff = (last.timestamp - first.timestamp) / (1000 * 60 * 60); // hours;
  const memoryDiff = last.memory.used - first.memory.used;
  return memoryDiff / timeDiff; // MB per hour
  /**
  * Get performance trend analysis
  */
  getPerformanceTrends(): {
  bundleSize: number;
  memoryUsage: number;
  apiLatency: number;
  violations: number;
  const recent = this.snapshots.slice(-20);
  return {
  bundleSize: recent.map(s => s.bundles.total),
  memoryUsage: recent.map(s => s.memory.used),
  apiLatency: recent.map(s => s.api.graphExecution || 0),
  violations: recent.map((_, i) =>,
  this.violations.filter(v => )
  v.timestamp >= (recent[i]?.timestamp || 0) &&
  v.timestamp < (recent[i + 1]?.timestamp || Infinity)
  ).length
};
  /**
   * Update budget configuration
   */
  updateBudget(newConfig: Partial<PerformanceBudgetConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('budget-updated', this.config);
  /**
   * Get current budget configuration
   */
  getBudgetConfig(): PerformanceBudgetConfig {
    return { ...this.config };
  /**
   * Clear violation history
   */
  clearHistory(): void {
  this.violations = [];
  this.snapshots = [];
  // Default performance budget configuration for Epic 18
  export const defaultPerformanceBudget: PerformanceBudgetConfig = {,
  bundles: {
  main: 250,      // 250KB main bundle,
  vendor: 500,    // 500KB vendor bundle,
  chunks: 100,    // 100KB max chunk size,
  total: 1000     // 1MB total bundle size,
},
  runtime: {
  firstContentfulPaint: 1500,    // 1.5s FCP,
  largestContentfulPaint: 2500,  // 2.5s LCP,
  firstInputDelay: 100,          // 100ms FID,
  cumulativeLayoutShift: 0.1,    // 0.1 CLS,
  timeToInteractive: 3000        // 3s TTI,
},
  api: {
  graphExecution: 1000,    // 1s graph execution,
  preview: 500,            // 500ms preview generation,
  validation: 100,         // 100ms validation,
  authentication: 200      // 200ms auth,
},
  memory: {
  initialHeap: 50,         // 50MB initial heap,
  peakHeap: 150,           // 150MB peak heap,
  steadyState: 75,         // 75MB steady state,
  leakThreshold: 5         // 5MB/hour leak threshold,
},
  network: {
  totalRequests: 25,           // 25 total requests,
  totalTransferSize: 1500,     // 1.5MB transfer size,
  thirdPartyRequests: 5,       // 5 third-party requests,
  criticalResourceCount: 10    // 10 critical resources,
},
  build: {
  buildTime: 60,          // 60s build time,
  typeCheckTime: 15,      // 15s type check,
  lintTime: 10,           // 10s linting,
  testTime: 30            // 30s test execution,
};

export {
  PerformanceBudgetManager,
  defaultPerformanceBudget
};