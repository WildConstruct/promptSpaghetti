/**
 * Classification Monitoring Service
 *
 * Monitors data classification activities in real-time, tracks patterns,
 * and provides insights into data classification usage and compliance.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { DataClassificationLevel, OperationContext } from '../types/DataClassification';

export interface MonitoringEvent {
    id: string;
    timestamp: Date;
    eventType: 'CLASSIFICATION' | 'ACCESS' | 'VALIDATION' | 'POLICY_CHANGE' | 'VIOLATION' | 'COMPLIANCE_CHECK';
    classification: DataClassificationLevel;
    userId: string;
    dataId: string;
    operation: string;
    result: 'SUCCESS' | 'FAILURE' | 'WARNING';
    details: Record<string, any>;
    context: OperationContext;
    metrics?: MonitoringMetrics;

export interface MonitoringMetrics {
    processingTimeMs: number;
    dataSize?: number;
    violationCount?: number;
    complianceScore?: number;
    riskScore?: number;

export interface ClassificationStats {
    classification: DataClassificationLevel;
    totalEvents: number;
    successCount: number;
    failureCount: number;
    warningCount: number;
    averageProcessingTime: number;
    violationRate: number;
    complianceRate: number;
    lastUpdated: Date;

export interface UserActivity {
    userId: string;
    totalEvents: number;
    classificationCounts: Record<DataClassificationLevel, number>;
    violationCount: number;
    lastActivity: Date;
    riskScore: number;
    suspiciousActivities: string[];

export interface MonitoringAlert {
    id: string;
    timestamp: Date;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    type: 'THRESHOLD_EXCEEDED' | 'UNUSUAL_PATTERN' | 'COMPLIANCE_VIOLATION' | 'SECURITY_RISK';
    message: string;
    details: Record<string, any>;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;

export interface MonitoringThreshold {
    name: string;
    description: string;
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    enabled: boolean;
    cooldownMinutes: number;
    lastTriggered?: Date;

export interface MonitoringDashboard {
    overallStats: {
        totalEvents: number;
        successRate: number;
        averageProcessingTime: number;
        activeUsers: number;
        violationCount: number;
        complianceScore: number;
    };
    classificationBreakdown: ClassificationStats[];
    topUsers: UserActivity[];
    recentAlerts: MonitoringAlert[];
    trendData: {
        timestamp: Date;
        eventCount: number;
        violationCount: number;
        complianceScore: number;
    }[];

export declare class ClassificationMonitoringService {
    private events;
    private alerts;
    private thresholds;
    private userActivities;
    private classificationStats;
    private realTimeHandlers;
    private alertHandlers;
    constructor();
    /**
     * Initialize default monitoring thresholds
     */
    private initializeDefaultThresholds;
    /**
     * Initialize classification statistics
     */
    private initializeClassificationStats;
    /**
     * Record a monitoring event
     */
    recordEvent(event: Omit<MonitoringEvent, 'id'>): Promise<void>;
    /**
     * Update classification statistics
     */
    private updateStatistics;
    /**
     * Update user activity tracking
     */
    private updateUserActivity;
    /**
     * Detect suspicious activity patterns
     */
    private detectSuspiciousActivity;
    /**
     * Calculate user risk score
     */
    private calculateUserRiskScore;
    /**
     * Check monitoring thresholds
     */
    private checkThresholds;
    /**
     * Get metric value for threshold checking
     */
    private getMetricValue;
    /**
     * Evaluate threshold condition
     */
    private evaluateThreshold;
    /**
     * Create monitoring alert
     */
    private createAlert;
    /**
     * Notify real-time handlers
     */
    private notifyRealTimeHandlers;
    /**
     * Notify alert handlers
     */
    private notifyAlertHandlers;
    /**
     * Register real-time event handler
     */
    onEvent(handler: (event: MonitoringEvent) => void): void;
    /**
     * Register alert handler
     */
    onAlert(handler: (alert: MonitoringAlert) => void): void;
    /**
     * Get monitoring dashboard data
     */
    getDashboard(): MonitoringDashboard;
    /**
     * Calculate average processing time
     */
    private calculateAverageProcessingTime;
    /**
     * Get events by criteria
     */
    getEvents(criteria?: {)
        classification?: DataClassificationLevel;
        userId?: string;
        eventType?: string;
        startDate?: Date;
        endDate?: Date;
        result?: 'SUCCESS' | 'FAILURE' | 'WARNING'
  }): MonitoringEvent[];
    /**
     * Get alerts
     */
    getAlerts(unresolved?: boolean): MonitoringAlert[];
    /**
     * Resolve alert
     */
    resolveAlert(alertId: string, resolvedBy: string): void;
    /**
     * Get or update threshold
     */
    getThreshold(name: string): MonitoringThreshold | undefined;
    updateThreshold(name: string, updates: Partial<MonitoringThreshold>): void;
    /**
     * Get user activity
     */
    getUserActivity(userId: string): UserActivity | undefined;
    /**
     * Get classification statistics
     */
    getClassificationStats(classification?: DataClassificationLevel): ClassificationStats[];
    /**
     * Export monitoring data
     */
    exportData(format: 'json' | 'csv'): string;
    /**
     * Clear monitoring data
     */
    clearData(): void;

export default ClassificationMonitoringService;
//# sourceMappingURL=ClassificationMonitoringService.d.ts.map