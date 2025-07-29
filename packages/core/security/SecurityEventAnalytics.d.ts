/**
 * Security Event Analytics System
 * Task T-1752989143998-695: Design security event logging analytics
 *
 * Advanced analytics engine for security event logging with machine learning-powered
 * threat detection, behavioral analysis, and predictive security insights.
 *
 * Features:
 * - Real-time security event analytics
 * - Behavioral anomaly detection
 * - Threat pattern recognition
 * - Risk scoring and assessment
 * - Predictive security insights
 * - Executive security dashboards
 * - Automated threat response recommendations
 */
import { EventEmitter } from 'events';
import { SecurityLogger, SecurityEventType, ComplianceFramework } from './SecurityLogger';
export declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"

export declare enum ThreatCategory {
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    DATA_ACCESS = "data_access",
    PRIVILEGE_ESCALATION = "privilege_escalation",
    DATA_EXFILTRATION = "data_exfiltration",
    INSIDER_THREAT = "insider_threat",
    EXTERNAL_ATTACK = "external_attack",
    SYSTEM_COMPROMISE = "system_compromise",
    COMPLIANCE_VIOLATION = "compliance_violation"

export interface SecurityPattern {
    id: string;
    name: string;
    category: ThreatCategory;
    description: string;
    indicators: string[];
    riskScore: number;
    confidence: number;
    firstSeen: Date;
    lastSeen: Date;
    occurrences: number;
    relatedEvents: string[];
    mitigationStrategies: string[];

export interface BehavioralBaseline {
    userId: string;
    normalPatterns: {
        loginTimes: {
            hour: number;
            frequency: number;
        }[];
        ipAddresses: {
            ip: string;
            frequency: number;
        }[];
        devices: {
            deviceId: string;
            frequency: number;
        }[];
        actions: {
            action: string;
            frequency: number;
        }[];
    };
    riskProfile: {
        baselineRisk: number;
        recentDeviations: number;
        trustedScore: number;
    };
    lastUpdated: Date;

export interface SecurityInsight {
    id: string;
    type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
    category: ThreatCategory;
    title: string;
    description: string;
    severity: RiskLevel;
    confidence: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    timeframe: {
        start: Date;
        end: Date;
    };
    evidence: {
        eventIds: string[];
        patterns: string[];
        metrics: Record<string, number>;
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    generatedAt: Date;

export interface SecurityMetricsSummary {
    period: {
        start: Date;
        end: Date;
    };
    overallRisk: {
        level: RiskLevel;
        score: number;
        trend: 'increasing' | 'decreasing' | 'stable';
        contributors: Array<{,
            factor: string;
            impact: number;
        }>;
    };
    eventVolume: {
        total: number;
        byType: Record<SecurityEventType, number>;
        bySeverity: Record<string, number>;
        hourlyDistribution: number[];
        trends: {
            weekOverWeek: number;
            monthOverMonth: number;
        };
    };
    threatLandscape: {
        activeThreats: number;
        newPatterns: number;
        topCategories: Array<{,
            category: ThreatCategory;
            count: number;
        }>;
        geographicHotspots: Array<{,
            location: string;
            riskScore: number;
        }>;
    };
    userBehavior: {
        anomalousUsers: number;
        highRiskUsers: Array<{,
            userId: string;
            riskScore: number;
        }>;
        behavioralDeviations: number;
    };
    systemHealth: {
        securityPosture: number;
        vulnerabilityExposure: number;
        complianceScore: number;
        incidentResponseTime: number;
    };

export interface AlertConfiguration {
    id: string;
    name: string;
    description: string;
    conditions: {
        eventTypes?: SecurityEventType[];
        thresholds?: Record<string, number>;
        timeWindow?: number;
        userScope?: string[];
        riskLevel?: RiskLevel;
    };
    actions: {
        notify: string[];
        escalate: boolean;
        autoResponse: string[];
    };
    enabled: boolean;
/**
 * Advanced security analytics engine
 */
export declare class SecurityEventAnalytics extends EventEmitter {
    private securityLogger;
    private patterns;
    private baselines;
    private insights;
    private alertConfigs;
    private isAnalyzing;
    constructor(securityLogger: SecurityLogger);
    /**
     * Analyze security events and generate insights
     */
    analyzeSecurityEvents(timeframe?: {)
        start: Date;
        end: Date;
    }): Promise<SecurityMetricsSummary>;
    /**
     * Get real-time security insights
     */
    getSecurityInsights(category?: ThreatCategory, severity?: RiskLevel, limit?: number): SecurityInsight[];
    /**
     * Get detected security patterns
     */
    getSecurityPatterns(category?: ThreatCategory): SecurityPattern[];
    /**
     * Get user behavioral analysis
     */
    getUserBehaviorAnalysis(userId: string): {
        baseline: BehavioralBaseline | null;
        currentRisk: number;
        recentAnomalies: Array<{,
            type: string;
            severity: RiskLevel;
            timestamp: Date;
        }>;
        recommendations: string[];
    };
    /**
     * Generate executive security report
     */
    generateExecutiveReport(period: {)
        start: Date;
        end: Date;
    }): {
        executiveSummary: string;
        keyMetrics: Record<string, string | number>;
        topThreats: Array<{,
            threat: string;
            impact: string;
            status: string;
        }>;
        recommendations: Array<{,
            priority: string;
            action: string;
            timeline: string;
        }>;
        complianceStatus: Record<ComplianceFramework, string>;
        riskTrend: Array<{,
            date: Date;
            riskScore: number;
        }>;
    };
    /**
     * Configure security alerts
     */
    configureAlert(config: AlertConfiguration): void;
    private calculateOverallRisk;
    private analyzeEventVolume;
    private analyzeThreatLandscape;
    private analyzeUserBehavior;
    private assessSystemHealth;
    private detectSecurityPatterns;
    private detectBruteForcePatterns;
    private detectPrivilegeEscalationPatterns;
    private detectDataExfiltrationPatterns;
    private detectInsiderThreatPatterns;
    private generateSecurityInsights;
    private generateTrendInsights;
    private generateAnomalyInsights;
    private generatePredictiveInsights;
    private generateRecommendationInsights;
    private scoreToRiskLevel;
    private calculateRiskTrend;
    private calculateWeekOverWeekTrend;
    private calculateMonthOverMonthTrend;
    private calculateGeoRisk;
    private calculateUserRisk;
    private calculateUserCurrentRisk;
    private getUserRecentAnomalies;
    private generateUserRecommendations;
    private getLatestSecuritySummary;
    private generateExecutiveSummary;
    private formatRiskLevel;
    private generateExecutiveRecommendations;
    private getComplianceStatus;
    private getRiskTrend;
    private calculateAverageResponseTime;
    private updateBehavioralBaselines;
    private updateUserPatterns;
    private calculateBehavioralDeviations;
    private initializePatternDetection;
    private startContinuousAnalysis;
    private setupDefaultAlerts;

export default SecurityEventAnalytics;
//# sourceMappingURL=SecurityEventAnalytics.d.ts.map