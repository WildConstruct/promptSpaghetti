/**
 * Performance Profiler
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 *
 * Advanced state performance analysis and optimization recommendations
 */
import { EventEmitter } from 'events';
export interface PerformanceProfilerConfig {
    sampleRate: number;
    maxSamples: number;
    enableMemoryProfiling: boolean;
    enableNetworkProfiling: boolean;
    enableRenderProfiling: boolean;
    enableCacheProfiling: boolean;
    trackingDuration: number;
    alertThresholds: {
        updateLatency: number;
        memoryUsage: number;
        renderTime: number;
        cacheHitRate: number;
    };
}
export interface PerformanceProfile {
    id: string;
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    samples: PerformanceSample;
    summary: PerformanceSummary;
    analysis: PerformanceAnalysis;
    recommendations: PerformanceRecommendation;
}
export interface PerformanceSample {
    timestamp: number;
    domain: string;
    operation: string;
    metrics: {
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
}
export interface PerformanceSummary {
    totalSamples: number;
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
    domainBreakdown: Map<string, DomainPerformanceStats>;
}
export interface DomainPerformanceStats {
    domain: string;
    sampleCount: number;
    averageDuration: number;
    totalDuration: number;
    memoryUsage: number;
    errorCount: number;
    cacheHitRate: number;
    bottlenecks: string;
}
export interface PerformanceAnalysis {
    bottlenecks: PerformanceBottleneck;
    patterns: PerformancePattern;
    trends: PerformanceTrend;
    anomalies: PerformanceAnomaly;
    correlations: PerformanceCorrelation;
    insights: PerformanceInsight;
}
export interface PerformanceBottleneck {
    id: string;
    type: 'cpu' | 'memory' | 'render' | 'cache' | 'network' | 'dependency';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: {
        domain: string;
        operation: string;
        stackTrace?: string;
    };
    impact: {
        frequency: number;
        averageDelay: number;
        totalTimeWasted: number;
        affectedOperations: string;
    };
    metrics: {
        currentValue: number;
        threshold: number;
        percentileRank: number;
    };
    timeframe: {
        firstOccurrence: number;
        lastOccurrence: number;
        occurrences: number;
    };
}
export interface PerformancePattern {
    id: string;
    name: string;
    type: 'recurring' | 'cyclical' | 'linear' | 'exponential';
    description: string;
    confidence: number;
    samples: PerformanceSample;
    characteristics: {
        frequency: number;
        amplitude: number;
        period?: number;
        trend?: 'increasing' | 'decreasing' | 'stable';
    };
}
export interface PerformanceTrend {
    metric: string;
    direction: 'improving' | 'degrading' | 'stable';
    slope: number;
    confidence: number;
    timespan: number;
    prediction: {
        nextHour: number;
        nextDay: number;
        nextWeek: number;
    };
    inflectionPoints: number;
}
export interface PerformanceAnomaly {
    id: string;
    timestamp: number;
    type: 'spike' | 'drop' | 'outlier' | 'pattern-break';
    severity: 'low' | 'medium' | 'high';
    description: string;
    metrics: Record<string, number>;
    possibleCauses: string;
    sample: PerformanceSample;
}
export interface PerformanceCorrelation {
    metrics: [string, string];
    coefficient: number;
    strength: 'weak' | 'moderate' | 'strong';
    significance: number;
    description: string;
    implications: string;
}
export interface PerformanceInsight {
    id: string;
    category: 'optimization' | 'warning' | 'information' | 'critical';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    evidence: PerformanceSample;
    recommendations: string;
}
export interface PerformanceRecommendation {
    id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'caching' | 'batching' | 'lazy-loading' | 'memoization' | 'architecture';
    title: string;
    description: string;
    implementation: {
        effort: 'low' | 'medium' | 'high';
        risk: 'low' | 'medium' | 'high';
        estimatedImpact: number;
        prerequisites: string;
        steps: string;
        codeExample?: string;
    };
    metrics: {
        expectedSpeedup: number;
        expectedMemoryReduction: number;
        expectedCacheImprovement: number;
    };
}
export interface PerformanceAlert {
    id: string;
    timestamp: number;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    metric: string;
    value: number;
    threshold: number;
    domain: string;
    sample: PerformanceSample;
    suggestions: string;
}
export interface MemorySnapshot {
    timestamp: number;
    totalHeapSize: number;
    usedHeapSize: number;
    heapSizeLimit: number;
    objects: Map<string, number>;
    leaks: MemoryLeak;
}
export interface MemoryLeak {
    object: string;
    count: number;
    sizeBytes: number;
    growthRate: number;
    firstDetected: number;
    locations: string;
}
export interface RenderProfile {
    componentName: string;
    renderTime: number;
    props: any;
    state: any;
    hooks: any;
    children: RenderProfile;
    updates: {
        propsChanged: boolean;
        stateChanged: boolean;
        contextChanged: boolean;
        parentRerender: boolean;
    };
}
export declare class PerformanceProfiler extends EventEmitter {
    private config;
    private activeProfiles;
    private samples;
    private isProfileActive;
    private currentProfileId;
    private sampleTimer;
    private memorySnapshots;
    private renderProfiles;
    private alerts;
    constructor(config?: Partial<PerformanceProfilerConfig>);
}
//# sourceMappingURL=PerformanceProfiler.d.ts.map