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
    cacheEnabled: boolean;
    cacheTTL: number;
    maxCacheEntries: number;
    alerting: {
        enabled: boolean;
        channels: string[];
        thresholdBreaches: boolean;
        qualityDegradation: boolean;
    };
}
export interface QualityThresholds {
    testCoverage: {
        minimum: number;
        target: number;
        critical: number;
    };
    codeQuality: {
        maxComplexity: number;
        maxDuplication: number;
        minMaintainabilityIndex: number;
    };
    performance: {
        maxResponseTime: number;
        maxMemoryUsage: number;
        maxCpuUsage: number;
    };
    security: {
        maxVulnerabilities: number;
        maxCriticalVulnerabilities: number;
        requiresSecurityScan: boolean;
    };
    buildHealth: {
        maxFailureRate: number;
        maxBuildTime: number;
        requiresAllTestsPassing: boolean;
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
    weights: {
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
    byPackage: PackageCoverageMetrics[];
    byComponent: ComponentCoverageMetrics[];
    trends: {
        last7Days: number[];
        last30Days: number[];
        changeFromLastWeek: number;
        changeFromLastMonth: number;
    };
    uncoveredCriticalPaths: string[];
    coverageHotspots: CoverageHotspot[];
}
export interface CodeQualityMetrics {
    complexity: {
        average: number;
        maximum: number;
        distribution: ComplexityDistribution;
        highComplexityFiles: string[];
    };
    duplication: {
        percentage: number;
        duplicatedLines: number;
        totalLines: number;
        duplicatedBlocks: DuplicationBlock[];
    };
    maintainability: {
        index: number;
        byFile: FileMaintainability[];
        trends: number[];
    };
    linting: {
        totalIssues: number;
        errorCount: number;
        warningCount: number;
        ruleBreakdowns: LintRuleBreakdown[];
        trends: number[];
    };
    technicalDebt: {
        totalMinutes: number;
        breakdown: TechnicalDebtBreakdown[];
        priority: 'low' | 'medium' | 'high' | 'critical';
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
    throughput: {
        requestsPerSecond: number;
        peakRps: number;
        trends: number[];
    };
    resourceUtilization: {
        cpu: {
            average: number;
            peak: number;
            trends: number[];
        };
        memory: {
            average: number;
            peak: number;
            trends: number[];
        };
        disk: {
            usage: number;
            iops: number;
        };
    };
    errorRates: {
        overall: number;
        by4xx: number;
        by5xx: number;
        trends: number[];
    };
    loadTestResults: LoadTestResult[];
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
    dependencies: {
        total: number;
        outdated: number;
        vulnerable: number;
        licenses: LicenseBreakdown[];
    };
    codeSecurityIssues: {
        total: number;
        byCategory: SecurityCategoryBreakdown[];
        highRiskFiles: string[];
    };
    compliance: {
        frameworks: ComplianceFrameworkStatus[];
        overallScore: number;
        gaps: ComplianceGap[];
    };
    accessControl: {
        privilegedAccounts: number;
        dormantAccounts: number;
        lastSecurityReview: Date;
    };
}
export interface DocumentationQualityMetrics {
    coverage: {
        apiDocumentation: number;
        codeDocumentation: number;
        userGuides: number;
        overall: number;
    };
    accuracy: {
        validCodeExamples: number;
        validApiExamples: number;
        brokenLinks: number;
        outdatedSections: string[];
    };
    completeness: {
        missingApiDocs: string[];
        missingUserGuides: string[];
        incompleteSections: string[];
    };
    maintenance: {
        lastUpdated: Date;
        staleSections: string[];
        maintenanceScore: number;
    };
}
export interface BuildHealthMetrics {
    builds: {
        successRate: number;
        averageDuration: number;
        failureReasons: BuildFailureReason[];
        trends: number[];
    };
    tests: {
        passRate: number;
        totalTests: number;
        flakyTests: string[];
        slowTests: SlowTest[];
        trends: number[];
    };
    deployments: {
        successRate: number;
        frequency: number;
        rollbackRate: number;
        averageDeployTime: number;
    };
    pipeline: {
        stages: PipelineStage[];
        bottlenecks: string[];
        healthScore: number;
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
    relatedFiles: string[];
    relatedComponents: string[];
    status: 'new' | 'acknowledged' | 'in_progress' | 'completed' | 'dismissed';
    createdAt: Date;
    updatedAt: Date;
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
interface PackageCoverageMetrics {
    name: string;
    percentage: number;
    linesTotal: number;
    linesCovered: number;
}
interface ComponentCoverageMetrics {
    name: string;
    type: 'component' | 'service' | 'utility';
    percentage: number;
    criticalPaths: number;
    uncoveredPaths: number;
}
interface CoverageHotspot {
    file: string;
    function: string;
    coverage: number;
    importance: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
}
interface ComplexityDistribution {
    '1-5': number;
    '6-10': number;
    '11-20': number;
    '21-50': number;
    '50+': number;
}
interface DuplicationBlock {
    lines: number;
    files: string[];
    similarity: number;
}
interface FileMaintainability {
    file: string;
    index: number;
    complexity: number;
    size: number;
    issues: string[];
}
interface LintRuleBreakdown {
    rule: string;
    count: number;
    severity: 'error' | 'warning';
    trend: 'increasing' | 'stable' | 'decreasing';
}
interface TechnicalDebtBreakdown {
    category: string;
    minutes: number;
    files: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}
interface LoadTestResult {
    timestamp: Date;
    duration: number;
    virtualUsers: number;
    requestsPerSecond: number;
    averageResponseTime: number;
    errorRate: number;
    passed: boolean;
}
interface LicenseBreakdown {
    license: string;
    count: number;
    compatible: boolean;
    risk: 'low' | 'medium' | 'high';
}
interface SecurityCategoryBreakdown {
    category: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}
interface ComplianceFrameworkStatus {
    framework: string;
    score: number;
    status: 'compliant' | 'non_compliant' | 'partial';
    lastAssessed: Date;
}
interface ComplianceGap {
    framework: string;
    requirement: string;
    status: 'missing' | 'partial' | 'outdated';
    priority: 'low' | 'medium' | 'high' | 'critical';
}
interface BuildFailureReason {
    reason: string;
    count: number;
    percentage: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}
interface SlowTest {
    name: string;
    duration: number;
    file: string;
    trend: 'improving' | 'stable' | 'degrading';
}
interface PipelineStage {
    name: string;
    averageDuration: number;
    successRate: number;
    bottleneck: boolean;
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
    constructor(
      config: QualityMetricsConfig,
      databaseService: DatabaseService,
      redisService: RedisService,
      auditService: AuditService,
      analyticsCollector: AnalyticsCollector,
      metricsCollector: MetricsCollector
    );
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
    getHistoricalMetrics(
      startDate: Date,
      endDate: Date,
      granularity?: 'hour' | 'day' | 'week'
    ): Promise<QualityMetrics[]>;
    /**
     * Get quality trends for dashboard
     */
    getQualityTrends(timeframe?: 'week' | 'month' | 'quarter'): Promise<QualityTrends>;
    /**
     * Get quality recommendations
     */
    getRecommendations(
      category?: string,
      priority?: 'low' | 'medium' | 'high' | 'critical'
    ): Promise<QualityRecommendation[]>;
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
    updateRecommendationStatus(
      recommendationId: string,
      status: 'acknowledged' | 'in_progress' | 'completed' | 'dismissed',
      updatedBy: string
    ): Promise<void>;
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