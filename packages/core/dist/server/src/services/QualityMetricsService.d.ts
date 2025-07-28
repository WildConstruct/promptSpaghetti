/**
 * Quality Metrics Service - Epic 18
 *
 * Comprehensive service for collecting, aggregating, and providing quality metrics
 * across all aspects of the system including code quality, performance, security,
 * testing coverage, and operational health.
 *
 * Task: E18-1753114562561-695DBB - Create quality dashboards
 */
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { AnalyticsCollector } from '../analytics/AnalyticsCollector';
import { MetricsCollector } from '../metrics/MetricsCollector';
import { EventEmitter } from 'events';
export interface QualityMetricsConfig {
    enabled: boolean;
    collectRealTime: boolean;
    historicalRetention: number;
    metricsInterval: number;
    aggregationInterval: number;
    thresholds: QualityThresholds;
    dataSources: {
        testCoverage: boolean;
        codeQuality: boolean;
        performance: boolean;
        security: boolean;
        documentation: boolean;
        buildHealth: boolean;
    };
}
export interface QualityThresholds {
    testCoverage: {
        minimum: number;
        target: number;
        critical: number;
    };
}
export interface QualityMetrics {
    timestamp: Date;
    overall: OverallQualityScore;
    testCoverage: TestCoverageMetrics;
    codeQuality: CodeQualityMetrics;
    performance: PerformanceQualityMetrics;
    security: SecurityQualityMetrics;
    documentation: DocumentationQualityMetrics;
    buildHealth: BuildHealthMetrics;
    trends: QualityTrends;
    recommendations: QualityRecommendation[];
    alerts: QualityAlert[];
    metadata: {
        collectionDuration: number;
        dataSourcesActive: string[];
        lastUpdated: Date;
        version: string;
    };
}
export interface OverallQualityScore {
    score: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    improvement: number;
    componentScores: {
        testCoverage: number;
        codeQuality: number;
        performance: number;
        security: number;
        documentation: number;
        buildHealth: number;
    };
}
export interface TestCoverageMetrics {
    overall: {
        percentage: number;
        linesTotal: number;
        linesCovered: number;
        branchesTotal: number;
        branchesCovered: number;
        functionsTotal: number;
        functionsCovered: number;
    };
}
export interface CodeQualityMetrics {
    complexity: {
        average: number;
        maximum: number;
        distribution: ComplexityDistribution;
        highComplexityFiles: string[];
    };
}
export interface PerformanceQualityMetrics {
    responseTime: {
        average: number;
        p50: number;
        p90: number;
        p95: number;
        p99: number;
    };
}
export interface SecurityQualityMetrics {
    vulnerabilities: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        trends: number[];
    };
}
export interface DocumentationQualityMetrics {
    coverage: {
        apiDocumentation: number;
        codeDocumentation: number;
        userGuides: number;
        overall: number;
    };
}
export interface BuildHealthMetrics {
    builds: {
        successRate: number;
        averageDuration: number;
        failureReasons: BuildFailureReason[];
        trends: number[];
    };
}
export interface QualityTrends {
    overall: TrendData;
    testCoverage: TrendData;
    codeQuality: TrendData;
    performance: TrendData;
    security: TrendData;
    documentation: TrendData;
    buildHealth: TrendData;
}
export interface TrendData {
    daily: number[];
    weekly: number[];
    monthly: number[];
    direction: 'improving' | 'stable' | 'degrading';
    velocity: number;
    projection: number;
}
export interface QualityRecommendation {
    id: string;
    category: 'testCoverage' | 'codeQuality' | 'performance' | 'security' | 'documentation' | 'buildHealth';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    actions: RecommendationAction[];
    expectedImprovement: {
        metric: string;
        currentValue: number;
        projectedValue: number;
        confidence: number;
    };
}
export interface QualityAlert {
    id: string;
    type: 'threshold_breach' | 'quality_degradation' | 'build_failure' | 'security_issue';
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    metric: string;
    currentValue: number;
    thresholdValue?: number;
    previousValue?: number;
    component?: string;
    file?: string;
    timestamp: Date;
    status: 'active' | 'acknowledged' | 'resolved';
    acknowledgedBy?: string;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
}
interface ComplexityDistribution {
    '1-5': number;
    '6-10': number;
    '11-20': number;
    '21-50': number;
    '50+': number;
}
interface BuildFailureReason {
    reason: string;
    count: number;
    percentage: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}
interface RecommendationAction {
    description: string;
    type: 'code_change' | 'configuration' | 'process' | 'tooling';
    effort: 'low' | 'medium' | 'high';
    automated: boolean;
}
export declare class QualityMetricsService extends EventEmitter {
    private config;
    private databaseService;
    private redisService;
    private auditService;
    private analyticsCollector;
    private metricsCollector;
    private collectionTimer?;
    private aggregationTimer?;
    constructor(config: QualityMetricsConfig, databaseService: DatabaseService, redisService: RedisService, auditService: AuditService, analyticsCollector: AnalyticsCollector, metricsCollector: MetricsCollector);
    /**
     * Start the quality metrics collection service
     */
    start(): Promise<void>;
    /**
     * Stop the quality metrics collection service
     */
    stop(): Promise<void>;
    /**
     * Collect comprehensive quality metrics
     */
    collectQualityMetrics(): Promise<QualityMetrics>;
    /**
     * Get current quality metrics (from cache if available)
     */
    getCurrentMetrics(): Promise<QualityMetrics | null>;
    /**
     * Get historical quality metrics
     */
    getHistoricalMetrics(startDate: Date, endDate: Date, granularity?: 'hour' | 'day' | 'week'): Promise<QualityMetrics[]>;
    /**
     * Get quality trends for dashboard
     */
    getQualityTrends(timeframe?: 'week' | 'month' | 'quarter'): Promise<QualityTrends>;
    /**
     * Get quality recommendations
     */
    getRecommendations(category?: string, priority?: 'low' | 'medium' | 'high' | 'critical'): Promise<QualityRecommendation[]>;
    /**
     * Get active quality alerts
     */
    getActiveAlerts(): Promise<QualityAlert[]>;
    /**
     * Acknowledge a quality alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void>;
    /**
     * Update recommendation status
     */
    updateRecommendationStatus(recommendationId: string, status: 'acknowledged' | 'in_progress' | 'completed' | 'dismissed', updatedBy: string): Promise<void>;
    private collectTestCoverageMetrics;
    private collectCodeQualityMetrics;
    private collectPerformanceMetrics;
    private collectSecurityMetrics;
    private collectDocumentationMetrics;
    private collectBuildHealthMetrics;
    private calculateOverallQualityScore;
    private calculatePerformanceScore;
    private calculateSecurityScore;
    private scoreToGrade;
    private scoreToStatus;
    private initializeDatabase;
    private startRealTimeCollection;
    private collectAndEmitMetrics;
    private performAggregation;
    private storeMetrics;
    private cacheMetrics;
    private getCachedMetrics;
    private getActiveDataSources;
    private mapRowToRecommendation;
    private mapRowToAlert;
    private readCoverageData;
    private extractPackageCoverage;
    private extractComponentCoverage;
    private getCoverageTrends;
    private identifyUncoveredCriticalPaths;
    private identifyCoverageHotspots;
    private getDefaultTestCoverageMetrics;
    private getDefaultCodeQualityMetrics;
    private getDefaultPerformanceMetrics;
    private getDefaultSecurityMetrics;
    private getDefaultDocumentationMetrics;
    private getDefaultBuildHealthMetrics;
    private calculateTrends;
    private generateRecommendations;
    private checkForAlerts;
    private aggregateMetricsByGranularity;
    private calculateTrendsFromHistorical;
    private getEmptyTrends;
}
/**
 * Default configuration for Quality Metrics Service
 */
export declare const DEFAULT_QUALITY_METRICS_CONFIG: QualityMetricsConfig;
export default QualityMetricsService;
//# sourceMappingURL=QualityMetricsService.d.ts.map