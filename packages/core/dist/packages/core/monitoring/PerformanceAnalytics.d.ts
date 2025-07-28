/**
 * Performance Analytics Dashboard
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 *
 * Advanced analytics and reporting for performance monitoring data
 */
import { PerformanceMonitor } from './PerformanceMonitor';
import { EventEmitter } from 'events';
export interface PerformanceReport {
    generatedAt: number;
    timeRange: {
        start: number;
        end: number;
    };
    summary: {
        totalExecutions: number;
        averagePerformance: number;
        reliabilityScore: number;
        efficiencyScore: number;
        recommendation: 'excellent' | 'good' | 'needs_attention' | 'critical';
    };
    performance: {
        averageExecutionTime: number;
        p50ExecutionTime: number;
        p95ExecutionTime: number;
        p99ExecutionTime: number;
        slowestNodes: Array<{}, nodeId>;
        string: any;
        nodeType: string;
        averageDuration: number;
        executionCount: number;
    };
}
export interface PerformanceBenchmark {
    nodeType: string;
    target: {
        averageExecutionTime: number;
        maxExecutionTime: number;
        successRate: number;
        memoryUsage: number;
    };
    current: {
        averageExecutionTime: number;
        maxExecutionTime: number;
        successRate: number;
        memoryUsage: number;
    };
    status: 'exceeds' | 'meets' | 'below' | 'critical';
    improvement: number;
}
export interface PerformanceInsight {
    id: string;
    timestamp: number;
    category: 'performance' | 'reliability' | 'efficiency' | 'cost';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionItems: string;
    affectedNodes: string;
    confidence: number;
    automatable: boolean;
}
export declare class PerformanceAnalytics extends EventEmitter {
    private monitor;
    private insights;
    private benchmarks;
    private reportHistory;
    constructor(monitor: PerformanceMonitor);
    if(alerts: any, length: any): any;
}
//# sourceMappingURL=PerformanceAnalytics.d.ts.map