/**
 * Performance Profiler
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 * 
 * Advanced state performance analysis and optimization recommendations
 */
import { EventEmitter } from 'events';

// Performance profiling types


export interface PerformanceProfilerConfig { sampleRate: number;
  maxSamples: number;
  enableMemoryProfiling: boolean;
  enableNetworkProfiling: boolean;
  enableRenderProfiling: boolean;
  enableCacheProfiling: boolean;
  trackingDuration: number;
  alertThresholds: { }
  updateLatency: number;
  memoryUsage: number;
  renderTime: number;
  cacheHitRate: number;


};


export interface PerformanceProfile { id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  samples: PerformanceSample;
  summary: PerformanceSummary;
  analysis: PerformanceAnalysis;
  recommendations: PerformanceRecommendation }



export interface PerformanceSample { timestamp: number;
  domain: string;
  operation: string;
  metrics: { }
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  cpuUsage: number;
  renderTime?: number;
  cacheHits?: number;
  cacheMisses?: number;
  networkRequests?: number;
  errorCount: number;


};
  stackTrace?: string;
  metadata?: Record<string, any>;


export interface PerformanceSummary { totalSamples: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  totalMemoryUsed: number;
  peakMemoryUsage: number;
  memoryLeaks: number;
  totalRenderTime: number;
  cacheEfficiency: number;
  errorRate: number;
  throughput: number;
  domainBreakdown: Map<string, DomainPerformanceStats> }



export interface DomainPerformanceStats { domain: string;
  sampleCount: number;
  averageDuration: number;
  totalDuration: number;
  memoryUsage: number;
  errorCount: number;
  cacheHitRate: number;
  bottlenecks: string }



export interface PerformanceAnalysis { bottlenecks: PerformanceBottleneck;
  patterns: PerformancePattern;
  trends: PerformanceTrend;
  anomalies: PerformanceAnomaly;
  correlations: PerformanceCorrelation;
  insights: PerformanceInsight }



export interface PerformanceBottleneck { id: string;
  type: 'cpu' | 'memory' | 'render' | 'cache' | 'network' | 'dependency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: { }
  domain: string;
  operation: string;
  stackTrace?: string;


};
  impact: { ,
  frequency: number;
  averageDelay: number;
  totalTimeWasted: number;
  affectedOperations: string };
  metrics: { ,
  currentValue: number;
  threshold: number;
  percentileRank: number };
  timeframe: { ,
  firstOccurrence: number;
  lastOccurrence: number;
  occurrences: number };


export interface PerformancePattern { id: string;
  name: string;
  type: 'recurring' | 'cyclical' | 'linear' | 'exponential';
  description: string;
  confidence: number;
  samples: PerformanceSample;
  characteristics: {;
  frequency: number;
  amplitude: number;
  period?: number;
  trend?: 'increasing' | 'decreasing' | 'stable' }


  };


export interface PerformanceTrend { metric: string;
  direction: 'improving' | 'degrading' | 'stable';
  slope: number;
  confidence: number;
  timespan: number;
  prediction: { }
  nextHour: number;
  nextDay: number;
  nextWeek: number;


};
  inflectionPoints: number;


export interface PerformanceAnomaly { id: string;
  timestamp: number;
  type: 'spike' | 'drop' | 'outlier' | 'pattern-break' }
  severity: 'low' | 'medium' | 'high';
  description: string;
  metrics: Record<string, number>;
  possibleCauses: string;
  sample: PerformanceSample;




export interface PerformanceCorrelation { metrics: [string, string];
  coefficient: number;
  strength: 'weak' | 'moderate' | 'strong';
  significance: number;
  description: string;
  implications: string }



export interface PerformanceInsight { id: string;
  category: 'optimization' | 'warning' | 'information' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' }
  effort: 'low' | 'medium' | 'high';
  evidence: PerformanceSample;
  recommendations: string;




export interface PerformanceRecommendation { id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'caching' | 'batching' | 'lazy-loading' | 'memoization' | 'architecture';
  title: string;
  description: string;
  implementation: {;
  effort: 'low' | 'medium' | 'high' }
  risk: 'low' | 'medium' | 'high';
  estimatedImpact: number;
  prerequisites: string;
  steps: string;
  codeExample?: string;


};
  metrics: { ,
  expectedSpeedup: number;
  expectedMemoryReduction: number;
  expectedCacheImprovement: number };


export interface PerformanceAlert { id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error' | 'critical' }
  message: string;
  metric: string;
  value: number;
  threshold: number;
  domain: string;
  sample: PerformanceSample;
  suggestions: string;
  // Memory profiling types




export interface MemorySnapshot { timestamp: number;
  totalHeapSize: number;
  usedHeapSize: number;
  heapSizeLimit: number;
  objects: Map<string, number>;
  leaks: MemoryLeak }



export interface MemoryLeak {
  object: string;
  count: number;
  sizeBytes: number;
  growthRate: number;
  firstDetected: number;
  locations: string;
  // Render profiling types




export interface RenderProfile { componentName: string;
  renderTime: number;
  props: any;
  state: any;
  hooks: any;
  children: RenderProfile;
  updates: { }
  propsChanged: boolean;
  stateChanged: boolean;
  contextChanged: boolean;
  parentRerender: boolean;


};

// Main PerformanceProfiler class

export class PerformanceProfiler extends EventEmitter {
  private config: PerformanceProfilerConfig;
  private activeProfiles: Map<string, PerformanceProfile> = new Map();
  private samples: PerformanceSample = [];
  private isProfileActive = false;
  private currentProfileId: string | null = null;
  private sampleTimer: NodeJS.Timeout | null = null;
  private memorySnapshots: MemorySnapshot = [];
  private renderProfiles: Map<string, RenderProfile> = new Map();
  private alerts: PerformanceAlert = [];
  constructor(config: Partial<PerformanceProfilerConfig> = {}) { super();
  this.config = {
  sampleRate: 100, // 100ms
  maxSamples: 10000
  enableMemoryProfiling: true
  enableNetworkProfiling: true
  enableRenderProfiling: true
  enableCacheProfiling: true
  trackingDuration: 300000, // 5 minutes
  alertThresholds: {
  updateLatency: 100, // 100ms
  memoryUsage: 100 * 1024 * 1024, // 100MB
  renderTime: 16, // 16ms for 60fps
  cacheHitRate: 0.8 // 80% }

      ...config
    };
  // Profile management
  startProfile(name: string, options: { )
  duration?: number;
  domains?: string;
  operations?: string } = {}): string { const profileId = this.generateProfileId();
  const startTime = performance.now();
  const profile: PerformanceProfile = {
  id: profileId
  name
  startTime
  endTime: 0
  duration: 0
  samples: []
  summary: this.createEmptySummary()
  analysis: this.createEmptyAnalysis()
  recommendations: [] }
};
    this.activeProfiles.set(profileId, profile);
    this.currentProfileId = profileId;
    this.isProfileActive = true;
    // Start sampling
    this.startSampling(options.domains, options.operations);
    // Auto-stop after duration
    const duration = options.duration || this.config.trackingDuration;
    setTimeout(() => { if (this.currentProfileId === profileId) {
        this.stopProfile(profileId) }, duration);
    this.emit('profileStarted', { profileId, name, options });
    return profileId;
  stopProfile(profileId: string): PerformanceProfile | null {
    const profile = this.activeProfiles.get(profileId);
    if (!profile) return null;
    const endTime = performance.now();
    profile.endTime = endTime;
    profile.duration = endTime - profile.startTime;
    profile.samples = [...this.samples];
    // Stop sampling if this was the current profile
    if (this.currentProfileId === profileId) {
      this.stopSampling();
      this.currentProfileId = null;
      this.isProfileActive = false;
    // Analyze the profile
    this.analyzeProfile(profile);
    this.emit('profileCompleted', { profile });
    return profile;
  pauseProfile(profileId: string): boolean {
    if (this.currentProfileId !== profileId) return false;
    this.stopSampling();
    this.emit('profilePaused', { profileId });
    return true;
  resumeProfile(profileId: string): boolean {
    if (!this.activeProfiles.has(profileId)) return false;
    this.currentProfileId = profileId;
    this.isProfileActive = true;
    this.startSampling();
    this.emit('profileResumed', { profileId });
    return true;
  // Sampling
  private startSampling(domains?: string, operations?: string): void { if (this.sampleTimer) {
      clearInterval(this.sampleTimer);
    this.sampleTimer = setInterval(() => {
      this.collectSample(domains, operations) }, this.config.sampleRate);
  private stopSampling(): void { if (this.sampleTimer) {
  clearInterval(this.sampleTimer);
  this.sampleTimer = null;
  private collectSample(domains?: string, operations?: string): void {
  if (!this.isProfileActive) return;
  const timestamp = performance.now();
  const memoryInfo = this.getMemoryInfo();
  // This would be called by the state management system during operations
  // For now, create a basic sample structure
  const sample: PerformanceSample = {
  timestamp
  domain: 'unknown'
  operation: 'unknown'
  metrics: {
  duration: 0
  memoryBefore: memoryInfo.used
  memoryAfter: memoryInfo.used
  memoryDelta: 0
  cpuUsage: this.getCPUUsage()
  errorCount: 0 }
};
    this.samples.push(sample);
    // Maintain sample limit
    if (this.samples.length > this.config.maxSamples) {
      this.samples = this.samples.slice(-this.config.maxSamples);
    // Check for alerts
    this.checkAlerts(sample);
    this.emit('sampleCollected', { sample });
  // Sample a specific operation
  sampleOperation<T>()
    domain: string
    operation: string
    fn: () => T
    metadata?: Record<string, any>
  ): T { if (!this.isProfileActive) {
  return fn();
  const startTime = performance.now();
  const memoryBefore = this.getMemoryInfo();
  const stackTrace = this.captureStackTrace();
  let result: T;
  let errorCount = 0;
  try {
  result = fn() } catch (error) { errorCount = 1;
      throw error } finally { const endTime = performance.now();
  const memoryAfter = this.getMemoryInfo();
  const sample: PerformanceSample = {
  timestamp: startTime
  domain
  operation
  metrics: {
  duration: endTime - startTime
  memoryBefore: memoryBefore.used
  memoryAfter: memoryAfter.used
  memoryDelta: memoryAfter.used - memoryBefore.used
  cpuUsage: this.getCPUUsage() }
  errorCount

        stackTrace
        metadata
      };
      this.samples.push(sample);
      this.checkAlerts(sample);
      this.emit('operationSampled', { sample });
    return result!;
  // Memory profiling
  takeMemorySnapshot(): MemorySnapshot { const timestamp = performance.now();
  const memoryInfo = this.getMemoryInfo();
  const snapshot: MemorySnapshot = {
  timestamp
  totalHeapSize: memoryInfo.total
  usedHeapSize: memoryInfo.used
  heapSizeLimit: memoryInfo.limit
  objects: new Map()
  leaks: [] }
};
    if (this.config.enableMemoryProfiling) {
      this.detectMemoryLeaks(snapshot);
    this.memorySnapshots.push(snapshot);
    // Keep only recent snapshots
    if (this.memorySnapshots.length > 100) {
      this.memorySnapshots = this.memorySnapshots.slice(-50);
    this.emit('memorySnapshotTaken', { snapshot });
    return snapshot;
  // Render profiling
  profileRender(componentName: string, renderFn: () => any): any { if (!this.config.enableRenderProfiling) {
  return renderFn();
  const startTime = performance.now();
  let result: any;
  try {
  result = renderFn() } finally { const endTime = performance.now();
      const renderTime = endTime - startTime;
      const profile: RenderProfile = {
        componentName
        renderTime }
        props: {}
        state: {}
        hooks: []
        children: []
        updates: { 
  propsChanged: false
  stateChanged: false
  contextChanged: false
  parentRerender: false }
};
      if (!this.renderProfiles.has(componentName)) {
        this.renderProfiles.set(componentName, []);
      this.renderProfiles.get(componentName)!.push(profile);
      // Check render performance threshold
      if (renderTime > this.config.alertThresholds.renderTime) {
        this.createAlert('warning', `Slow render in ${componentName}`, 'renderTime', renderTime);}
      this.emit('renderProfiled', { profile });
    return result;
  // Analysis
  private analyzeProfile(profile: PerformanceProfile): void { profile.summary = this.generateSummary(profile.samples);
  profile.analysis = this.performAnalysis(profile.samples);
  profile.recommendations = this.generateRecommendations(profile.analysis);
  private generateSummary(samples: PerformanceSample): PerformanceSummary {
  if (samples.length === 0) {
  return this.createEmptySummary();
  const durations = samples.map(s => s.metrics.duration);
  const memoryUsages = samples.map(s => s.metrics.memoryAfter);
  const renderTimes = samples.filter(s => s.metrics.renderTime).map(s => s.metrics.renderTime!);
  const domainBreakdown = new Map<string, DomainPerformanceStats>();
  const domainGroups = this.groupSamplesByDomain(samples);
  for (const [domain, domainSamples] of domainGroups) {
  const stats: DomainPerformanceStats = {
  domain
  sampleCount: domainSamples.length
  averageDuration: this.average(domainSamples.map(s => s.metrics.duration))
  totalDuration: this.sum(domainSamples.map(s => s.metrics.duration))
  memoryUsage: this.average(domainSamples.map(s => s.metrics.memoryAfter))
  errorCount: this.sum(domainSamples.map(s => s.metrics.errorCount))
  cacheHitRate: this.calculateCacheHitRate(domainSamples)
  bottlenecks: [] }
};
      domainBreakdown.set(domain, stats);
    return { totalSamples: samples.length
  averageDuration: this.average(durations)
  minDuration: Math.min(...durations)
  maxDuration: Math.max(...durations)
  totalMemoryUsed: this.sum(memoryUsages)
  peakMemoryUsage: Math.max(...memoryUsages)
  memoryLeaks: this.countMemoryLeaks(samples)
  totalRenderTime: this.sum(renderTimes)
  cacheEfficiency: this.calculateOverallCacheEfficiency(samples)
  errorRate: this.sum(samples.map(s => s.metrics.errorCount)) / samples.length
  throughput: samples.length / (samples[samples.length - 1].timestamp - samples[0].timestamp) * 1000 }
  domainBreakdown
};
  private performAnalysis(samples: PerformanceSample): PerformanceAnalysis { return {
  bottlenecks: this.identifyBottlenecks(samples)
  patterns: this.detectPatterns(samples)
  trends: this.analyzeTrends(samples)
  anomalies: this.detectAnomalies(samples)
  correlations: this.findCorrelations(samples)
  insights: this.generateInsights(samples) }
};
  private identifyBottlenecks(samples: PerformanceSample): PerformanceBottleneck { const bottlenecks: PerformanceBottleneck = [];
    // Identify slow operations
    const slowSamples = samples.filter(s => s.metrics.duration > this.config.alertThresholds.updateLatency);
    const operationGroups = this.groupSamplesByOperation(slowSamples);
    for (const [operation, operationSamples] of operationGroups) {
      if (operationSamples.length >= 3) { // At least 3 occurrences
        const bottleneck: PerformanceBottleneck = {
  id: this.generateBottleneckId()
          type: 'cpu'
          severity: this.calculateSeverity(operationSamples) }
          description: `Slow operation: ${operation}`}

  location: { 
  domain: operationSamples[0].domain
  operation
  stackTrace: operationSamples[0].stackTrace }

  impact: { 
  frequency: operationSamples.length
  averageDelay: this.average(operationSamples.map(s => s.metrics.duration))
  totalTimeWasted: this.sum(operationSamples.map(s => s.metrics.duration))
  affectedOperations: [operation] }

  metrics: { 
  currentValue: this.average(operationSamples.map(s => s.metrics.duration))
  threshold: this.config.alertThresholds.updateLatency
  percentileRank: this.calculatePercentile(operationSamples.map(s => s.metrics.duration), 0.95) }

  timeframe: { 
  firstOccurrence: operationSamples[0].timestamp
  lastOccurrence: operationSamples[operationSamples.length - 1].timestamp
  occurrences: operationSamples.length }
};
        bottlenecks.push(bottleneck);
    return bottlenecks;
  private detectPatterns(samples: PerformanceSample): PerformancePattern {
    // Simplified pattern detection
    return [];
  private analyzeTrends(samples: PerformanceSample): PerformanceTrend {
    const trends: PerformanceTrend = [];
    // Analyze duration trend
    const durations = samples.map((s, i) => ({ x: i, y: s.metrics.duration }));
    const durationTrend = this.calculateLinearTrend(durations);
    trends.push({ )
  metric: 'duration'
  direction: durationTrend.slope > 0 ? 'degrading' : durationTrend.slope < 0 ? 'improving' : 'stable',
  slope: durationTrend.slope,
  confidence: durationTrend.rSquared,
  timespan: samples[samples.length - 1].timestamp - samples[0].timestamp,
  prediction: {,
  nextHour: durationTrend.slope * 3600 + durationTrend.intercept,
  nextDay: durationTrend.slope * 86400 + durationTrend.intercept,
  nextWeek: durationTrend.slope * 604800 + durationTrend.intercept }
},
  inflectionPoints: [];
  });
    return trends;
  private detectAnomalies(samples: PerformanceSample): PerformanceAnomaly { const anomalies: PerformanceAnomaly = [];
    // Use statistical methods to detect outliers
    const durations = samples.map(s => s.metrics.duration);
    const mean = this.average(durations);
    const stdDev = this.standardDeviation(durations);
    const threshold = mean + 3 * stdDev; // 3-sigma rule;
    samples.forEach(sample => {)
  if (sample.metrics.duration > threshold) {
        anomalies.push({)
  id: this.generateAnomalyId(),
          timestamp: sample.timestamp,
          type: 'spike',
          severity: sample.metrics.duration > threshold * 2 ? 'high' : 'medium' }
          description: `Performance spike in ${sample.operation}`}
},
  metrics: { ,
  duration: sample.metrics.duration,
  threshold,
  deviationFactor: sample.metrics.duration / mean }
},
  possibleCauses: [
            'Large data processing',
            'Memory pressure',
            'External dependency delay',
            'Inefficient algorithm'
          ],
          sample
        });
    });
    return anomalies;
  private findCorrelations(samples: PerformanceSample): PerformanceCorrelation { const correlations: PerformanceCorrelation = [];
    // Calculate correlation between duration and memory usage
    const durations = samples.map(s => s.metrics.duration);
    const memoryDeltas = samples.map(s => s.metrics.memoryDelta);
    const correlation = this.calculateCorrelation(durations, memoryDeltas);
    if (Math.abs(correlation) > 0.3) { // Meaningful correlation
      correlations.push({)
  metrics: ['duration', 'memoryDelta'],
        coefficient: correlation,
        strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.5 ? 'moderate' : 'weak',
        significance: Math.abs(correlation) }
        description: `${correlation > 0 ? 'Positive' : 'Negative'} correlation between execution time and memory allocation`}
},
  implications: correlation > 0 ? ,
          ['Memory allocation may be causing performance overhead', 'Consider object pooling or reuse'] :
          ['Memory efficiency may be improving performance', 'Current memory management is effective']
      });
    return correlations;
  private generateInsights(samples: PerformanceSample): PerformanceInsight { const insights: PerformanceInsight = [];
  // Memory growth insight
  const memoryTrend = this.calculateMemoryTrend(samples);
  if (memoryTrend.slope > 1000) { // Growing by 1KB per sample
  insights.push({)
  id: this.generateInsightId(),
  category: 'warning',
  title: 'Memory Usage Trending Upward',
  description: 'Memory usage is consistently increasing, which may indicate a memory leak',
  impact: 'high',
  effort: 'medium',
  evidence: samples.filter(s => s.metrics.memoryDelta > 0),
  recommendations: [
  'Review object lifecycle management',
  'Check for event listener cleanup',
  'Analyze large object retention' }
  'Implement memory profiling in development'
  ]
});
    // Performance variability insight
    const durationVariability = this.calculateVariability(samples.map(s => s.metrics.duration));
    if (durationVariability > 0.5) { // High variability
      insights.push({)
  id: this.generateInsightId(),
  category: 'optimization',
  title: 'High Performance Variability',
  description: 'Operation performance varies significantly, indicating potential optimization opportunities',
  impact: 'medium',
  effort: 'low',
  evidence: samples,
  recommendations: [
  'Implement operation caching',
  'Add performance monitoring',
  'Identify and optimize slow paths' }
  'Consider batch processing'
  ]
});
    return insights;
  private generateRecommendations(analysis: PerformanceAnalysis): PerformanceRecommendation { const recommendations: PerformanceRecommendation = [];
    // Recommendations based on bottlenecks
    analysis.bottlenecks.forEach(bottleneck => {)
  if (bottleneck.type === 'cpu' && bottleneck.severity === 'high') {
        recommendations.push({)
  id: this.generateRecommendationId(),
          priority: 'high',
          category: 'memoization' }
          title: `Optimize ${bottleneck.location.operation}`}
},
  description: `The operation ${bottleneck.location.operation} is consuming significant CPU time`}
},
  implementation: { ,
  effort: 'medium',
  risk: 'low',
  estimatedImpact: 0.3, // 30% improvement,
  prerequisites: ['Performance profiling setup'],
  steps: [
  'Identify computation-heavy sections',
  'Implement memoization for expensive calculations',
  'Add result caching where appropriate',
  'Measure performance improvement'
  ],
  codeExample: `,
  // Example: Memoize expensive calculations }
  const memoizedCalculation = useMemo(() => { return expensiveCalculation(inputs) }, [inputs]);
            `
  },
  metrics: { ,
  expectedSpeedup: 2.0,
  expectedMemoryReduction: 0.1,
  expectedCacheImprovement: 0.2 }
});
    });
    return recommendations;
  // Alert management
  private checkAlerts(sample: PerformanceSample): void { const thresholds = this.config.alertThresholds;
    // Duration alert
    if (sample.metrics.duration > thresholds.updateLatency) {
      this.createAlert()
        'warning' }
        `Slow operation: ${sample.operation} took ${sample.metrics.duration.toFixed(2)}ms`}

        'duration',
        sample.metrics.duration,
        sample
      );
    // Memory alert
    if (sample.metrics.memoryAfter > thresholds.memoryUsage) { this.createAlert()
        'error' }
        `High memory usage: ${(sample.metrics.memoryAfter / 1024 / 1024).toFixed(2)}MB`}

        'memory',
        sample.metrics.memoryAfter,
        sample
      );
    // Render time alert
    if (sample.metrics.renderTime && sample.metrics.renderTime > thresholds.renderTime) { this.createAlert()
        'warning' }
        `Slow render: ${sample.metrics.renderTime.toFixed(2)}ms`}

        'renderTime',
        sample.metrics.renderTime,
        sample
      );
  private createAlert(level: PerformanceAlert['level']),
  message: string,
    metric: string,
    value: number,
    sample?: PerformanceSample
  ): void { const alert: PerformanceAlert = {,
  id: this.generateAlertId(),
      timestamp: performance.now(),
      level,
      message,
      metric,
      value,
      threshold: this.config.alertThresholds[metric as keyof typeof this.config.alertThresholds] || 0,
      domain: sample?.domain || 'unknown' }
      sample: sample || {} as PerformanceSample,
      suggestions: this.getSuggestions(metric, level)
    };
    this.alerts.push(alert);
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50);
    this.emit('alertCreated', { alert });
  private getSuggestions(metric: string, level: string): string { const suggestionMap: Record<string, string> = {
  duration: [
  'Consider memoization for expensive calculations'
  'Implement result caching'
  'Optimize algorithm complexity'
  'Use batch processing for multiple operations'
  ]
  memory: [
  'Check for memory leaks'
  'Implement object pooling'
  'Review large object retention'
  'Add memory cleanup in lifecycle hooks'
  ]
  renderTime: [
  'Use React.memo for component optimization'
  'Implement virtual scrolling for large lists'
  'Optimize re-render cycles' }
  'Consider component splitting'
  ]
};
    return suggestionMap[metric] || ['Profile the specific operation for optimization opportunities'];
  // Utility methods
  private getMemoryInfo(): { total: number; used: number; limit: number } { if (typeof performance !== 'undefined' && performance.memory) {
  return {
  total: performance.memory.totalJSHeapSize
  used: performance.memory.usedJSHeapSize
  limit: performance.memory.jsHeapSizeLimit }
};
    return { total: 0, used: 0, limit: 0 };
  private getCPUUsage(): number { // Simplified CPU usage calculation
  // In a real implementation, this would measure actual CPU time
  return Math.random() * 100;
  private captureStackTrace(): string {
  const error = new Error();
  return error.stack?.split('\n').slice(2, 10) || [];
  private detectMemoryLeaks(snapshot: MemorySnapshot): void {
  // Simplified memory leak detection
  // In a real implementation, this would analyze object retention
  private calculateCacheHitRate(samples: PerformanceSample): number {
  const cacheHits = samples.reduce((sum, s) => sum + (s.metrics.cacheHits || 0), 0);
  const cacheMisses = samples.reduce((sum, s) => sum + (s.metrics.cacheMisses || 0), 0);
  const total = cacheHits + cacheMisses;
  return total > 0 ? cacheHits / total : 0;
  private groupSamplesByDomain(samples: PerformanceSample): Map<string, PerformanceSample> { }
  const groups = new Map<string, PerformanceSample>();
  samples.forEach(sample => { )
  if (!groups.has(sample.domain)) {
  groups.set(sample.domain, []);
  groups.get(sample.domain)!.push(sample) });
    return groups;
  private groupSamplesByOperation(samples: PerformanceSample): Map<string, PerformanceSample> { const groups = new Map<string, PerformanceSample>();
    samples.forEach(sample => {)
  if (!groups.has(sample.operation)) {
        groups.set(sample.operation, []);
      groups.get(sample.operation)!.push(sample) });
    return groups;
  private calculateSeverity(samples: PerformanceSample): PerformanceBottleneck['severity'] {
    const avgDuration = this.average(samples.map(s => s.metrics.duration));
    const threshold = this.config.alertThresholds.updateLatency;
    if (avgDuration > threshold * 5) return 'critical';
    if (avgDuration > threshold * 2) return 'high';
    if (avgDuration > threshold * 1.5) return 'medium';
    return 'low';
  private calculateLinearTrend(points: { x: number; y: number }[]): { slope: number; intercept: number; rSquared: number } {
    const n = points.length;
    if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 };
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    // Calculate R-squared
    const yMean = sumY / n;
    const ssReg = points.reduce((sum, p) => { const predicted = slope * p.x + intercept;
      return sum + Math.pow(predicted - yMean, 2) }, 0);
    const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const rSquared = ssTot === 0 ? 1 : ssReg / ssTot;
    return { slope, intercept, rSquared };
  private calculateMemoryTrend(samples: PerformanceSample): { slope: number; intercept: number } {
    const points = samples.map((s, i) => ({ x: i, y: s.metrics.memoryAfter }));
    return this.calculateLinearTrend(points);
  private calculateCorrelation(x: number, y: number): number { if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const sumX = this.sum(x);
  const sumY = this.sum(y);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  return denominator === 0 ? 0 : numerator / denominator;
  private calculateVariability(values: number): number {,
  if (values.length === 0) return 0;
  const mean = this.average(values);
  const stdDev = this.standardDeviation(values);
  return stdDev / mean; // Coefficient of variation
  private average(values: number): number {,
  return values.length > 0 ? this.sum(values) / values.length : 0;
  private sum(values: number): number {,
  return values.reduce((sum, val) => sum + val, 0);
  private standardDeviation(values: number): number {,
  if (values.length === 0) return 0;
  const mean = this.average(values);
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(this.average(squaredDiffs));
  private calculatePercentile(values: number, percentile: number): number {,
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * percentile) - 1;
  return sorted[Math.max(0, index)];
  private countMemoryLeaks(samples: PerformanceSample): number {,
  // Simplified memory leak detection
  return samples.filter(s => s.metrics.memoryDelta > 1024 * 1024).length; // 1MB+ allocations
  private calculateOverallCacheEfficiency(samples: PerformanceSample): number {,
  const totalHits = samples.reduce((sum, s) => sum + (s.metrics.cacheHits || 0), 0);
  const totalMisses = samples.reduce((sum, s) => sum + (s.metrics.cacheMisses || 0), 0);
  const total = totalHits + totalMisses;
  return total > 0 ? totalHits / total : 0;
  private createEmptySummary(): PerformanceSummary {,
  return {
  totalSamples: 0,
  averageDuration: 0,
  minDuration: 0,
  maxDuration: 0,
  totalMemoryUsed: 0,
  peakMemoryUsage: 0,
  memoryLeaks: 0,
  totalRenderTime: 0,
  cacheEfficiency: 0,
  errorRate: 0,
  throughput: 0,
  domainBreakdown: new Map() }
};
  private createEmptyAnalysis(): PerformanceAnalysis { return {
  bottlenecks: [],
  patterns: [],
  trends: [],
  anomalies: [],
  correlations: [],
  insights: [] }
};
  // ID generators
  private generateProfileId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateBottleneckId(): string {
    return `bottleneck_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateAnomalyId(): string {
    return `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateInsightId(): string {
    return `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateRecommendationId(): string {
    return `recommendation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // Public API methods
  getActiveProfiles(): PerformanceProfile {
    return Array.from(this.activeProfiles.values());
  getProfile(profileId: string): PerformanceProfile | null {
    return this.activeProfiles.get(profileId) || null;
  getAlerts(): PerformanceAlert {
    return [...this.alerts];
  clearAlerts(): void {
    this.alerts = [];
    this.emit('alertsCleared');
  getMemorySnapshots(): MemorySnapshot {
    return [...this.memorySnapshots];
  getRenderProfiles(): Map<string, RenderProfile> {
    return new Map(this.renderProfiles);
  isProfilingActive(): boolean {
    return this.isProfileActive;
  getCurrentProfileId(): string | null {
    return this.currentProfileId;
  updateConfig(config: Partial<PerformanceProfilerConfig>): void {
    this.config = { ...this.config, ...config };
    this.emit('configUpdated', { config: this.config });
  exportProfile(profileId: string): any { const profile = this.activeProfiles.get(profileId);
  if (!profile) return null;
  return {
  ...profile
  memorySnapshots: this.memorySnapshots
  renderProfiles: Object.fromEntries(this.renderProfiles)
  alerts: this.alerts.filter(a => a.timestamp >= profile.startTime && a.timestamp <= profile.endTime) }
};

// Global PerformanceProfiler instance
export const globalPerformanceProfiler = new PerformanceProfiler();