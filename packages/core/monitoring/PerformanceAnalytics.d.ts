/**
 * Performance Analytics Dashboard
 * Epic 18 - Add Performance Monitoring (E18-1753114562040-37A1F1)
 *
 * Advanced analytics and reporting for performance monitoring data
 */
import { PerformanceMonitor } from './PerformanceMonitor';
import { EventEmitter } from 'events';

}
}
export interface PerformanceReport { generatedAt: number;
    timeRange: {
        start: number;
        end: number }
}
    };
    summary: {
        totalExecutions: number;
        averagePerformance: number;
        reliabilityScore: number;
        efficiencyScore: number;
        recommendation: 'excellent' | 'good' | 'needs_attention' | 'critical'
  };
    performance: { averageExecutionTime: number;
        p50ExecutionTime: number;
        p95ExecutionTime: number;
        p99ExecutionTime: number;
        slowestNodes: Array<{
            nodeId: string;
            nodeType: string;
            averageDuration: number;
            executionCount: number }>;
    };
    reliability: { successRate: number;
        errorRate: number;
        mostReliableTypes: string[];
        leastReliableTypes: string[];
        errorPatterns: Array<{
            pattern: string;
            frequency: number;
            affectedNodes: string[] }>;
    };
    efficiency: { memoryEfficiency: number;
        cacheHitRate: number;
        contextOptimization: number;
        resourceWaste: number;
        optimizationOpportunities: string[] };
    trends: { performanceTrend: 'improving' | 'stable' | 'degrading';
        trendConfidence: number;
        projectedImprovement: number;
        seasonalPatterns: Array<{
            period: string;
            impact: number;
            description: string }>;
    };
    alerts: { critical: number;
        high: number;
        medium: number;
        low: number;
        topAlertTypes: Array<{
            type: string;
            frequency: number;
            severity: string }>;
    };

}
}
export interface PerformanceBenchmark { nodeType: string;
    target: {
        averageExecutionTime: number;
        maxExecutionTime: number;
        successRate: number;
        memoryUsage: number }
}
    };
    current: { averageExecutionTime: number;
        maxExecutionTime: number;
        successRate: number;
        memoryUsage: number };
    status: 'exceeds' | 'meets' | 'below' | 'critical';
    improvement: number;

}
}
export interface PerformanceInsight { id: string;
    timestamp: number;
    category: 'performance' | 'reliability' | 'efficiency' | 'cost';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    actionItems: string[];
    affectedNodes: string[];
    confidence: number;
    automatable: boolean;
/**
 * Advanced performance analytics and reporting system
 */
export declare class PerformanceAnalytics extends EventEmitter {
    private monitor;
    private insights;
    private benchmarks;
    private reportHistory;
    constructor(monitor: PerformanceMonitor);
    /**
     * Generate comprehensive performance report
     */
    generateReport(timeRange?: {)
        start: number;
        end: number }
}
    }): PerformanceReport;
    /**
     * Set benchmarks for node types
     */
    setBenchmark(nodeType: string, benchmark: PerformanceBenchmark['target']): void;
    /**
     * Generate performance insights
     */
    generateInsights(): PerformanceInsight[];
    /**
     * Get benchmark status for all node types
     */
    getBenchmarkStatus(): PerformanceBenchmark[];
    /**
     * Get recent insights
     */
    getInsights(category?: PerformanceInsight['category'], limit?: number): PerformanceInsight[];
    /**
     * Get historical reports
     */
    getReportHistory(limit?: number): Array<{ timestamp: number;
        report: PerformanceReport }>;
    /**
     * Export analytics data
     */
    exportData(): { insights: PerformanceInsight[];
        benchmarks: PerformanceBenchmark[];
        reports: Array<{
            timestamp: number;
            report: PerformanceReport }>;
    };
    private initializeDefaultBenchmarks;
    private setupMonitoringListeners;
    private getAllMetricsInRange;
    private getAllAggregatedMetrics;
    private calculateSummaryScores;
    private analyzePerformance;
    private analyzeReliability;
    private analyzeEfficiency;
    private analyzeTrends;
    private analyzeAlerts;
    private generateInsightId;

export default PerformanceAnalytics;
//# sourceMappingURL=PerformanceAnalytics.d.ts.map