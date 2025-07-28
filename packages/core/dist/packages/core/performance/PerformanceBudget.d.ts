/**
 * Performance Budget System for Epic 18
 * Establishes performance thresholds and monitoring for technical debt reduction
 */
import { EventEmitter } from 'events';
export interface PerformanceBudgetConfig {
    bundles: {
        main: number;
        vendor: number;
        chunks: number;
        total: number;
    };
    runtime: {
        firstContentfulPaint: number;
        largestContentfulPaint: number;
        firstInputDelay: number;
        cumulativeLayoutShift: number;
        timeToInteractive: number;
    };
    api: {
        graphExecution: number;
        preview: number;
        validation: number;
        authentication: number;
    };
    memory: {
        initialHeap: number;
        peakHeap: number;
        steadyState: number;
        leakThreshold: number;
    };
    network: {
        totalRequests: number;
        totalTransferSize: number;
        thirdPartyRequests: number;
        criticalResourceCount: number;
    };
    build: {
        buildTime: number;
        typeCheckTime: number;
        lintTime: number;
        testTime: number;
    };
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
}
export interface BudgetCheckResult {
    passed: boolean;
    score: number;
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
}
export declare class PerformanceBudgetManager extends EventEmitter {
    private config;
    private violations;
    private snapshots;
    private maxSnapshotHistory;
    constructor(config: PerformanceBudgetConfig);
    private checkBundleBudgets;
    private checkRuntimeBudgets;
    private checkApiBudgets;
    private checkMemoryBudgets;
    private checkNetworkBudgets;
    private checkBuildBudgets;
    private calculateSeverity;
    private calculatePerformanceScore;
    private summarizeViolations;
    private generateRecommendations;
}
//# sourceMappingURL=PerformanceBudget.d.ts.map