/**
 * Performance Monitoring System for AI Models
 * Epic 35.1.6 - Performance Optimization
 *
 * Comprehensive performance monitoring with real-time metrics, alerts, and analytics
 */

}
export interface PerformanceMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    diskIOUsage: number;
    tokensProcessed: number;
    tokensPerSecond: number;
    costPerRequest: number;
    totalCost: number;
    successRate: number;
    errorRate: number;
    timeoutRate: number;
    retryRate: number;
    timestamp: number;
    windowStart: number;
    windowEnd: number;

}
export interface PerformanceAlert {
    id: string;
    type: 'warning' | 'error' | 'critical';
    metric: string;
    threshold: number;
    currentValue: number;
    message: string;
    timestamp: number;
    resolved: boolean;
    resolvedAt?: number;

}
export interface PerformanceThreshold {
    metric: keyof PerformanceMetrics;
    warningThreshold: number;
    errorThreshold: number;
    criticalThreshold: number;
    operator: 'greater_than' | 'less_than' | 'equals';

}
export interface MonitoringConfig {
    enabled: boolean;
    collectionInterval: number;
    retentionPeriod: number;
    alerting: {
        enabled: boolean;
        email?: string[];
        webhook?: string;
        slackChannel?: string;
}
    };
    thresholds: PerformanceThreshold[];
    sampling: {
        enabled: boolean;
        rate: number;
    };
    storage: {
        type: 'memory' | 'disk' | 'database';
        path?: string;
        maxSize?: number;
    };

}
export interface ModelPerformanceData {
    modelId: string;
    modelType: string;
    provider: string;
    metrics: PerformanceMetrics;
    alerts: PerformanceAlert[];
    lastUpdated: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'offline';

}
export interface PerformanceReport {
    summary: {
        totalModels: number;
        healthyModels: number;
        totalRequests: number;
        averageResponseTime: number;
        totalCost: number;
        successRate: number;
}
    };
    trends: {
        responseTimeTrend: Array<{
            timestamp: number;
            value: number;
        }>;
        successRateTrend: Array<{
            timestamp: number;
            value: number;
        }>;
        costTrend: Array<{
            timestamp: number;
            value: number;
        }>;
    };
    topPerformers: Array<{
        modelId: string;
        metric: string;
        value: number;
    }>;
    bottomPerformers: Array<{
        modelId: string;
        metric: string;
        value: number;
    }>;
    activeAlerts: PerformanceAlert[];
    recommendations: string[];
    generatedAt: number;

export declare class PerformanceMonitor {
    private config;
    private models;
    private metricsHistory;
    private alerts;
    private collectionTimer?;
    private isRunning;
    constructor(config: MonitoringConfig);
    start(): void;
    stop(): void;
    registerModel(modelId: string, modelType: string, provider: string): void;
    unregisterModel(modelId: string): void;
    recordRequest(modelId: string, responseTime: number, success: boolean, tokensUsed: {)
        input: number;
        output: number;
    }, cost: number): void;
    recordResourceUsage(modelId: string, resourceMetrics: {)
        memoryUsage?: number;
        cpuUsage?: number;
        networkLatency?: number;
        diskIOUsage?: number;
    }): void;
    getModelMetrics(modelId: string): ModelPerformanceData | null;
    getAllModelsMetrics(): ModelPerformanceData[];
    getActiveAlerts(): PerformanceAlert[];
    getAlertsForModel(modelId: string): PerformanceAlert[];
    generateReport(timeRange?: {)
        start: number;
        end: number;
    }): PerformanceReport;
    exportMetrics(format: 'json' | 'csv' | 'prometheus'): string;
    private initializeDefaultThresholds;
    private createEmptyMetrics;
    private updateHealthStatus;
    private shouldSample;
    private recordHistoricalMetrics;
    private collectMetrics;
    private evaluateAlerts;
    private evaluateModelAlerts;
    private shouldTriggerAlert;
    private determineAlertType;
    private getRelevantThreshold;
    private generateAlertMessage;
    private formatMetricValue;
    private generateTrends;
    private getTopPerformers;
    private getBottomPerformers;
    private generateRecommendations;
    private sendAlert;
    private sendAlertResolution;
    private cleanupOldData;
    private convertToCSV;
    private convertToPrometheus;
    destroy(): void;

export default PerformanceMonitor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map