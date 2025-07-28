/**
 * State Dev Tools
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 *
 * Advanced state inspection with time-travel debugging and performance analysis
 */
import { EventEmitter } from 'events';
import { StateChange } from '../containers/BaseStateContainer';
export interface StateInspectionConfig {
    enableTimeTravel: boolean;
    enablePerformanceTracking: boolean;
    enableDependencyVisualization: boolean;
    maxHistorySize: number;
    trackingInterval: number;
    enableStateValidation: boolean;
    enableMemoryTracking: boolean;
    enableNetworkTracking: boolean;
}
export interface DependencyGraph {
    nodes: DependencyNode;
    edges: DependencyEdge;
    metadata: {
        totalNodes: number;
        totalEdges: number;
        circularDependencies: string;
        criticalPaths: string[];
        lastUpdated: number;
        complexity: number;
    };
}
export interface DependencyNode {
    id: string;
    type: 'state' | 'component' | 'selector' | 'middleware' | 'domain';
    label: string;
    domain: string;
    position: {
        x: number;
        y: number;
    };
    size: number;
    color: string;
    metadata: {
        lastModified: number;
        accessCount: number;
        dependencies: string;
        dependents: string;
        performance: {
            averageExecutionTime: number;
            totalExecutions: number;
            errorCount: number;
        };
    };
}
export interface DependencyEdge {
    id: string;
    from: string;
    to: string;
    type: 'depends_on' | 'triggers' | 'subscribes_to' | 'validates';
    weight: number;
    label?: string;
    metadata: {
        frequency: number;
        lastTriggered: number;
        latency: number;
    };
}
export interface PerformanceReport {
    summary: {
        totalStateUpdates: number;
        averageUpdateLatency: number;
        memoryUsage: number;
        renderSkipRate: number;
        cacheEfficiency: number;
        networkLatency: number;
    };
    bottlenecks: PerformanceBottleneck;
    recommendations: PerformanceRecommendation;
    trends: PerformanceTrend;
    domainAnalysis: Map<string, DomainPerformance>;
}
export interface PerformanceBottleneck {
    id: string;
    type: 'memory' | 'cpu' | 'network' | 'render' | 'cache';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location: string;
    impact: number;
    frequency: number;
    suggestions: string;
    timeframe: {
        start: number;
        end: number;
        duration: number;
    };
}
export interface PerformanceRecommendation {
    id: string;
    category: 'optimization' | 'refactoring' | 'caching' | 'batching';
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    implementation: string;
    estimatedImpact: number;
    difficulty: 'easy' | 'medium' | 'hard';
    codeExample?: string;
}
export interface PerformanceTrend {
    metric: string;
    values: {
        timestamp: number;
        value: number;
    }[];
    trend: 'improving' | 'degrading' | 'stable';
    changeRate: number;
    prediction: {
        timestamp: number;
        value: number;
    }[];
}
export interface DomainPerformance {
    domain: string;
    updateFrequency: number;
    averageLatency: number;
    memoryUsage: number;
    errorRate: number;
    cacheHitRate: number;
    dependencies: string;
    criticalPath: boolean;
}
export interface ReplayEnvironment {
    id: string;
    baseState: any;
    changes: StateChange<any>[];
    currentIndex: number;
    metadata: {
        created: number;
        totalChanges: number;
        timespan: number;
        domains: string;
    };
}
export interface StateValidationResult {
    valid: boolean;
    errors: StateValidationError;
    warnings: StateValidationWarning;
    performance: {
        validationTime: number;
        memoryImpact: number;
    };
}
export interface StateValidationError {
    path: string;
    message: string;
    value: any;
    expected: any;
    severity: 'error' | 'warning';
    code: string;
}
export interface StateValidationWarning {
    path: string;
    message: string;
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
}
export declare class StateDevTools extends EventEmitter {
    private config;
    private stateHistory;
    private performanceData;
    private dependencyGraph;
    private replayEnvironments;
    private performanceMetrics;
    private isRecording;
    private isReplaying;
    private memoryTracker;
    private networkTracker;
    constructor(config?: Partial<StateInspectionConfig>);
    private executeReplay;
    stepDelay: number;
    highlightChanges: boolean;
    showDiff: boolean;
}
//# sourceMappingURL=StateDevTools.d.ts.map