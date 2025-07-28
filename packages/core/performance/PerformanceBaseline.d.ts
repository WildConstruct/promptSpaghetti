/**
 * Performance Baseline Measurement System for Epic 18
 * Captures current performance metrics to establish baselines for improvement tracking
 */
import { KPISnapshot } from './PerformanceKPIs';
import { EventEmitter } from 'events';
export interface BaselineSnapshot {
    id: string;
    timestamp: number;
    environment: {,
        userAgent?: string;
        viewport?: {
            width: number;
            height: number;
        };
        connection?: string;
        deviceMemory?: number;
        hardwareConcurrency?: number;
    };
    kpiSnapshots: KPISnapshot[];
    systemInfo: {,
        nodeVersion?: string;
        platform?: string;
        memoryUsage?: NodeJS.MemoryUsage;
    };
    testConditions: {,
        graphComplexity: 'simple' | 'medium' | 'complex';
        dataSize: 'small' | 'medium' | 'large';
        concurrentUsers: number;
    };
}
export interface BaselineSummary {
    capturedAt: number;
    totalKPIs: number;
    criticalKPIs: number;
    kpisByStatus: {,
        excellent: number;
        good: number;
        warning: number;
        critical: number;
    };
    averageScores: {,
        runtime: number;
        api: number;
        bundle: number;
        memory: number;
        network: number;
        build: number;
        userExperience: number;
    };
    recommendations: string[];
}
/**
 * Performance Baseline Measurement System
 * Captures and manages performance baselines for comparison and improvement tracking
 */
export declare class PerformanceBaseline extends EventEmitter {
    private snapshots;
    private performanceTracker;
    private maxSnapshots;
    constructor();
    /**
     * Capture a comprehensive performance baseline
     */
    captureBaseline(testConditions?: Partial<BaselineSnapshot['testConditions']>): Promise<BaselineSnapshot>;
    /**
     * Capture measurements for all defined KPIs
     */
    private captureAllKPIs;
    /**
     * Measure a specific KPI based on its definition
     */
    private measureKPI;
    private measureFCP;
    private measureLCP;
    private measureFID;
    private measureCLS;
    private measureTTI;
    private measureGraphExecution;
    private measurePreviewGeneration;
    private measureValidation;
    private measureThroughput;
    private measureMainBundleSize;
    private measureTotalBundleSize;
    private measurePeakMemoryUsage;
    private measureMemoryLeakRate;
    private measureTransferSize;
    private measureRequestCount;
    private measureBuildTime;
    private measureTestTime;
    private measureGraphCreationTime;
    private measureErrorRate;
    private simulateWebVital;
    private simulateAsyncWork;
    private getEnvironmentInfo;
    private getSystemInfo;
    private getHistoricalKPISnapshots;
    /**
     * Get the latest baseline snapshot
     */
    getLatestBaseline(): BaselineSnapshot | null;
    /**
     * Get baseline history
     */
    getBaselineHistory(limit?: number): BaselineSnapshot[];
    /**
     * Generate baseline summary
     */
    generateBaselineSummary(baseline?: BaselineSnapshot): BaselineSummary;
    private calculateCategoryAverages;
    private generateBaselineRecommendations;
    /**
     * Compare two baselines
     */
    compareBaselines(baseline1: BaselineSnapshot, baseline2: BaselineSnapshot): {
        improved: string[];
        degraded: string[];
        unchanged: string[];
    };
    /**
     * Export baseline data
     */
    exportBaseline(baseline?: BaselineSnapshot): string;
    /**
     * Import baseline data
     */
    importBaseline(data: string): BaselineSnapshot;
    /**
     * Clear all baseline data
     */
    clearBaselines(): void;
}
export default PerformanceBaseline;
//# sourceMappingURL=PerformanceBaseline.d.ts.map