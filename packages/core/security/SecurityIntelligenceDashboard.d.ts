/**
 * Epic 31.4.1 - Security Intelligence Dashboard and Analysis
 *
 * Executive-level security posture analytics dashboard with comprehensive
 * threat intelligence visualization, automated reporting, and ad-hoc analysis
 * capabilities. Integrates with Epic 1 analytics and Epic 17 security systems.
 *
 * Task: E31-1753313263567-6A500F
 */
import { EventEmitter } from 'events';
import { SecurityIntelligence } from './MLSecurityAnalyticsFramework';
import { SecurityAnomaly } from './SecurityAnomalyDetector';
import { ThreatForecast } from './SecurityThreatForecasting';

export interface SecurityDashboardConfig {
    refreshInterval: number;
    enableRealTimeUpdates: boolean;
    retentionPeriodDays: number;
    enableExecutiveReports: boolean;
    enableThreatIntelligence: boolean;
    enableComplianceReporting: boolean;
    alertThresholds: DashboardAlertThresholds;
    reportingSchedules: ReportingSchedule[];

export interface DashboardAlertThresholds {
    criticalThreatCount: number;
    anomalyVolumeThreshold: number;
    responseTimeThresholdMs: number;
    systemHealthThreshold: number;
    complianceScoreThreshold: number;

export interface ReportingSchedule {
    reportType: ReportType;
    frequency: ReportFrequency;
    recipients: string[];
    nextExecution: Date;
    enabled: boolean;

export declare enum ReportType {
    EXECUTIVE_SUMMARY = "executive_summary",
    THREAT_INTELLIGENCE = "threat_intelligence",
    SECURITY_POSTURE = "security_posture",
    COMPLIANCE_STATUS = "compliance_status",
    INCIDENT_ANALYSIS = "incident_analysis",
    TREND_ANALYSIS = "trend_analysis",
    OPERATIONAL_METRICS = "operational_metrics"

export declare enum ReportFrequency {
    REAL_TIME = "real_time",
    HOURLY = "hourly",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly"

export interface SecurityPosture {
    overallScore: number;
    threatLevel: ThreatLevel;
    complianceScore: number;
    systemHealth: number;
    lastUpdated: Date;
    trends: PostureTrend[];
    riskFactors: RiskFactor[];
    recommendations: SecurityRecommendation[];

export declare enum ThreatLevel {
    MINIMAL = "minimal",
    LOW = "low",
    MODERATE = "moderate",
    ELEVATED = "elevated",
    HIGH = "high",
    SEVERE = "severe"

export interface PostureTrend {
    metric: string;
    direction: 'improving' | 'declining' | 'stable';
    changePercent: number;
    timeframe: string;
    significance: 'high' | 'medium' | 'low';

export interface RiskFactor {
    id: string;
    category: RiskCategory;
    severity: 'critical' | 'high' | 'medium' | 'low';
    impact: number;
    likelihood: number;
    description: string;
    mitigationStatus: 'pending' | 'in_progress' | 'completed';
    estimatedResolutionTime: number;

export declare enum RiskCategory {
    TECHNICAL = "technical",
    OPERATIONAL = "operational",
    COMPLIANCE = "compliance",
    THREAT_INTELLIGENCE = "threat_intelligence",
    HUMAN_FACTOR = "human_factor",
    INFRASTRUCTURE = "infrastructure"

export interface SecurityRecommendation {
    id: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    expectedBenefit: string;
    estimatedEffort: string;
    implementationCost: number;
    riskReduction: number;
    dependencies: string[];
    timeline: string;

export interface ThreatIntelligenceData {
    activeThreatCount: number;
    highSeverityThreats: ThreatSummary[];
    threatsByCategory: Record<string, number>;
    geographicalThreats: GeographicalThreat[];
    attackVectors: AttackVector[];
    threatTrends: ThreatTrend[];
    indicators: ThreatIndicator[];

export interface ThreatSummary {
    id: string;
    type: string;
    severity: string;
    confidence: number;
    firstSeen: Date;
    lastSeen: Date;
    affectedSystems: string[];
    description: string;
    status: 'active' | 'mitigated' | 'resolved';

export interface GeographicalThreat {
    country: string;
    region: string;
    threatCount: number;
    severityDistribution: Record<string, number>;
    primaryThreatTypes: string[];

export interface AttackVector {
    vector: string;
    frequency: number;
    successRate: number;
    averageDamage: number;
    trend: 'increasing' | 'decreasing' | 'stable';

export interface ThreatTrend {
    timeframe: string;
    threatType: string;
    volumeChange: number;
    severityChange: number;
    newVariants: number;

export interface ThreatIndicator {
    type: 'ip' | 'domain' | 'hash' | 'pattern';
    value: string;
    confidence: number;
    sources: string[];
    firstSeen: Date;
    associatedThreats: string[];

export interface DashboardMetrics {
    securityEvents: {,
        total: number;
        critical: number;
        resolved: number;
        averageResponseTime: number;
    };
    anomalies: {,
        detected: number;
        falsePositives: number;
        accuracy: number;
    };
    systemHealth: {,
        availability: number;
        performance: number;
        errors: number;
    };
    compliance: {,
        overallScore: number;
        violations: number;
        auditReadiness: number;
    };
    threats: {,
        active: number;
        mitigated: number;
        severity: Record<string, number>;
    };

export interface ExecutiveReport {
    id: string;
    reportType: ReportType;
    generatedAt: Date;
    period: {,
        start: Date;
        end: Date;
    };
    summary: ExecutiveSummary;
    keyMetrics: KeyMetric[];
    findings: Finding[];
    recommendations: SecurityRecommendation[];
    appendices: ReportAppendix[];

export interface ExecutiveSummary {
    overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    keyHighlights: string[];
    majorConcerns: string[];
    actionItems: string[];
    budgetImpact: string;

export interface KeyMetric {
    name: string;
    value: number | string;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    context: string;
    benchmark: number | string;

export interface Finding {
    id: string;
    category: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    title: string;
    description: string;
    evidence: string[];
    impact: string;
    recommendation: string;

export interface ReportAppendix {
    title: string;
    type: 'chart' | 'table' | 'text' | 'image';
    content: unknown;
    description: string;

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    position: WidgetPosition;
    size: WidgetSize;
    config: WidgetConfig;
    dataSource: string;
    refreshRate: number;
    isVisible: boolean;

export declare enum WidgetType {
    METRIC_CARD = "metric_card",
    LINE_CHART = "line_chart",
    BAR_CHART = "bar_chart",
    PIE_CHART = "pie_chart",
    HEAT_MAP = "heat_map",
    TABLE = "table",
    GAUGE = "gauge",
    TREND_INDICATOR = "trend_indicator",
    ALERT_LIST = "alert_list",
    THREAT_MAP = "threat_map"

export interface WidgetPosition {
    x: number;
    y: number;

export interface WidgetSize {
    width: number;
    height: number;

export interface WidgetConfig {
    theme: 'light' | 'dark';
    colors: string[];
    showLegend: boolean;
    showLabels: boolean;
    animation: boolean;
    customOptions: Record<string, unknown>;

export declare class SecurityIntelligenceDashboard extends EventEmitter {
    private config;
    private securityPosture;
    private threatIntelligence;
    private dashboardMetrics;
    private widgets;
    private reportingScheduler?;
    private updateInterval?;
    private isUpdating;
    constructor(config?: Partial<SecurityDashboardConfig>);
    private initializeDashboard;
    private initializeDefaultWidgets;
    /**
     * Process security intelligence data for dashboard
     */
    processSecurityIntelligence(intelligence: SecurityIntelligence[]): Promise<void>;
    /**
     * Process security anomalies for dashboard
     */
    processSecurityAnomalies(anomalies: SecurityAnomaly[]): Promise<void>;
    /**
     * Process threat forecasts for dashboard
     */
    processThreatForecasts(forecasts: ThreatForecast[]): Promise<void>;
    private updateSecurityPosture;
    private updateThreatIntelligence;
    private updateDashboardMetrics;
    /**
     * Generate executive report
     */
    generateExecutiveReport(reportType: ReportType, period: {)
        start: Date;
        end: Date;
    }): Promise<ExecutiveReport>;
    private generateExecutiveSummary;
    private generateKeyMetrics;
    private generateFindings;
    private generateRiskFactors;
    private generateRecommendations;
    private updateRiskFactorsFromAnomalies;
    private updatePostureTrends;
    private checkAlertThresholds;
    private startRealTimeUpdates;
    private performScheduledUpdate;
    private startReportingScheduler;
    private checkReportingSchedules;
    private calculateReportPeriod;
    private calculateNextExecution;
    private distributeReport;
    private generateReportId;
    getSecurityPosture(): SecurityPosture;
    getThreatIntelligence(): ThreatIntelligenceData;
    getDashboardMetrics(): DashboardMetrics;
    getWidgets(): DashboardWidget[];
    getWidget(widgetId: string): DashboardWidget | undefined;
    addWidget(widget: DashboardWidget): void;
    removeWidget(widgetId: string): boolean;
    updateWidget(widgetId: string, updates: Partial<DashboardWidget>): boolean;
    generateAdHocReport(analysisType: string, parameters: Record<string, unknown>): Promise<ExecutiveReport>;
    updateConfiguration(newConfig: Partial<SecurityDashboardConfig>): void;
    destroy(): void;

export default SecurityIntelligenceDashboard;
//# sourceMappingURL=SecurityIntelligenceDashboard.d.ts.map