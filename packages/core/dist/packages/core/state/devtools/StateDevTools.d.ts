/**
 * State Dev Tools
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools
 *
 * Advanced state inspection with time-travel debugging and performance analysis
 */
import { EventEmitter } from 'events';
import { StateSnapshot, StateChange } from '../containers/BaseStateContainer';
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
    nodes: DependencyNode[];
    edges: DependencyEdge[];
    metadata: {
        totalNodes: number;
        totalEdges: number;
        circularDependencies: string[];
        criticalPaths: string[][];
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
        dependencies: string[];
        dependents: string[];
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
    bottlenecks: PerformanceBottleneck[];
    recommendations: PerformanceRecommendation[];
    trends: PerformanceTrend[];
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
    suggestions: string[];
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
    dependencies: string[];
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
        domains: string[];
    };
}
export interface StateValidationResult {
    valid: boolean;
    errors: StateValidationError[];
    warnings: StateValidationWarning[];
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
    recordStateChange<T>(snapshot: StateSnapshot<T>, domain: string): void;
    replayStateChanges(fromTimestamp: number, toTimestamp: number, options?: {
        stepDelay?: number;
        highlightChanges?: boolean;
        showDiff?: boolean;
        domains?: string[];
        speed?: number;
    }): ReplayEnvironment;
    private executeReplay;
    stopReplay(): void;
    visualizeStateDependencies(options?: {
        domains?: string[];
        includeComponents?: boolean;
        includeSelectors?: boolean;
        includeCrossDomainLinks?: boolean;
        layout?: 'hierarchical' | 'force' | 'circular' | 'tree';
        depth?: number;
    }): DependencyGraph;
    detectStateBottlenecks(timeRange?: {
        start: number;
        end: number;
    }): PerformanceReport;
    validateStateIntegrity<T>(state: T, domain: string, options?: {
        deep?: boolean;
        checkReferences?: boolean;
        validateSchema?: boolean;
        checkMemoryLeaks?: boolean;
    }): StateValidationResult;
    startRecording(): void;
    stopRecording(): void;
    getRecordingStatus(): {
        isRecording: boolean;
        isReplaying: boolean;
        historySize: number;
        memoryUsage: number;
        uptime: number;
    };
    private getStateChangesBetween;
    private createReplayEnvironment;
    private getBaseStateForReplay;
    private getReplayState;
    private applyChangeToReplayState;
    private calculateStateDiff;
    private highlightStateChanges;
    private delay;
    private buildDependencyGraph;
    private applyLayout;
    private analyzeGraphComplexity;
    private detectCircularDependencies;
    private dfsCircularDetection;
    private identifyCriticalPaths;
    private generatePerformanceSummary;
    private identifyBottlenecks;
    private generateRecommendations;
    private analyzeTrends;
    private analyzeDomainPerformance;
    private validateStateStructure;
    private validateStateReferences;
    private validateStateSchema;
    private detectMemoryLeaks;
    private getDependencyCount;
    private setupTracking;
    private collectPerformanceMetrics;
    private generateEnvironmentId;
    getStateHistory(): StateSnapshot<any>[];
    getDependencyGraph(): DependencyGraph;
    getPerformanceMetrics(): Map<string, number[]>;
    clearHistory(): void;
    exportSession(): {
        config: StateInspectionConfig;
        history: StateSnapshot<any>[];
        metrics: any;
        dependencyGraph: DependencyGraph;
    };
    importSession(sessionData: any): void;
}
export declare const globalStateDevTools: StateDevTools;
//# sourceMappingURL=StateDevTools.d.ts.map