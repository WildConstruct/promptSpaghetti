/**
 * Performance Baseline Measurement System for Epic 18
 * Captures current performance metrics to establish baselines for improvement tracking
 */
import { KPISnapshot } from './PerformanceKPIs';
import { EventEmitter } from 'events';
export interface BaselineSnapshot {
    id: string;
    timestamp: number;
    environment: {
        userAgent?: string;
        viewport?: {
            width: number;
            height: number;
        };
        connection?: string;
        deviceMemory?: number;
        hardwareConcurrency?: number;
    };
    kpiSnapshots: KPISnapshot;
    systemInfo: {
        nodeVersion?: string;
        platform?: string;
        memoryUsage?: NodeJS.MemoryUsage;
    };
    testConditions: {
        graphComplexity: 'simple' | 'medium' | 'complex';
        dataSize: 'small' | 'medium' | 'large';
        concurrentUsers: number;
    };
}
export interface BaselineSummary {
    capturedAt: number;
    totalKPIs: number;
    criticalKPIs: number;
    kpisByStatus: {
        excellent: number;
        good: number;
        warning: number;
        critical: number;
    };
    averageScores: {
        runtime: number;
        api: number;
        bundle: number;
        memory: number;
        network: number;
        build: number;
        userExperience: number;
    };
    recommendations: string;
}
export declare class PerformanceBaseline extends EventEmitter {
    private snapshots;
    private performanceTracker;
    private maxSnapshots;
    constructor();
}
//# sourceMappingURL=PerformanceBaseline.d.ts.map