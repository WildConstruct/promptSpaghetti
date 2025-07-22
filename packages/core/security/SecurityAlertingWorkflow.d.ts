/**
 * Security Alerting Workflow System
 * Task T-1752989143998-67: Implement security alerting workflow
 *
 * Advanced security alerting workflow engine with automated threat response,
 * intelligent escalation, and compliance reporting for Wild Construct platform.
 */
import { EventEmitter } from 'events';
import { SecurityEventAnalytics, SecurityInsight, SecurityPattern, ThreatCategory } from './SecurityEventAnalytics';
import { SecurityLogger, ComplianceFramework } from './SecurityLogger';
export declare enum AlertSeverity {
    CRITICAL = "critical",// < 5 minutes response
    HIGH = "high",// < 15 minutes response
    MEDIUM = "medium",// < 1 hour response
    LOW = "low",// < 4 hours response
    INFO = "info"
}
export declare enum AlertState {
    TRIGGERED = "triggered",
    ACKNOWLEDGED = "acknowledged",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
    CLOSED = "closed",
    SUPPRESSED = "suppressed"
}
export declare enum AlertChannel {
    EMAIL = "email",
    SMS = "sms",
    SLACK = "slack",
    WEBHOOK = "webhook",
    PAGERDUTY = "pagerduty",
    TEAMS = "teams"
}
export interface SecurityAlert {
    id: string;
    timestamp: Date;
    severity: AlertSeverity;
    state: AlertState;
    category: ThreatCategory;
    title: string;
    description: string;
    source: string;
    sourceData: {
        eventIds?: string[];
        patternIds?: string[];
        insightIds?: string[];
        metrics?: Record<string, number>;
    };
    context: {
        affectedSystems: string[];
        affectedUsers: string[];
        ipAddresses: string[];
        geolocation?: {
            country: string;
            region: string;
            confidence: number;
        };
    };
    risk: {
        score: number;
        factors: Array<{
            factor: string;
            impact: number;
        }>;
        likelihood: number;
        impact: number;
    };
    compliance: {
        frameworks: ComplianceFramework[];
        reportingRequired: boolean;
        deadline?: Date;
    };
    escalation: {
        level: number;
        maxLevel: number;
        nextEscalation?: Date;
        assignedTo?: string;
    };
    resolution?: {
        resolvedBy: string;
        resolvedAt: Date;
        solution: string;
        preventionMeasures: string[];
        lessonsLearned: string[];
    };
    metadata: {
        correlationId: string;
        workflowVersion: string;
        processingTime: number;
        checksum: string;
    };
}
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    conditions: AlertCondition[];
    severity: AlertSeverity;
    category: ThreatCategory;
    suppressionRules?: SuppressionRule[];
    escalationPolicy: EscalationPolicy;
    automatedActions: AutomatedAction[];
    compliance: ComplianceFramework[];
}
export interface AlertCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'contains' | 'matches';
    value: any;
    aggregation?: {
        function: 'count' | 'sum' | 'avg' | 'min' | 'max';
        timeWindow: number;
        groupBy?: string;
    };
}
export interface SuppressionRule {
    id: string;
    description: string;
    conditions: AlertCondition[];
    suppressionWindow: number;
    maxSuppressions?: number;
}
export interface EscalationPolicy {
    id: string;
    name: string;
    steps: EscalationStep[];
    requiresAcknowledgment: boolean;
    autoResolve: boolean;
    escalationTimeout: number;
}
export interface EscalationStep {
    level: number;
    delay: number;
    recipients: NotificationRecipient[];
    channels: AlertChannel[];
    actions: string[];
    continueOnFailure: boolean;
}
export interface NotificationRecipient {
    type: 'user' | 'team' | 'role';
    identifier: string;
    contactMethods: Array<{
        channel: AlertChannel;
        address: string;
        priority: number;
    }>;
}
export interface AutomatedAction {
    id: string;
    name: string;
    description: string;
    type: 'system' | 'network' | 'user' | 'data' | 'notification';
    action: string;
    parameters: Record<string, any>;
    conditions: AlertCondition[];
    maxExecutions: number;
    cooldownPeriod: number;
    requiresApproval: boolean;
    approvers?: string[];
}
export interface WorkflowExecution {
    alertId: string;
    workflowId: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    steps: WorkflowStep[];
    error?: {
        message: string;
        stack: string;
        step: string;
    };
}
export interface WorkflowStep {
    id: string;
    name: string;
    type: 'notification' | 'action' | 'escalation' | 'approval';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    result?: any;
    error?: string;
}
/**
 * Advanced security alerting workflow engine
 */
export declare class SecurityAlertingWorkflow extends EventEmitter {
    private analytics;
    private securityLogger;
    private alerts;
    private alertRules;
    private executions;
    private suppressionCache;
    private isProcessing;
    constructor(analytics: SecurityEventAnalytics, securityLogger: SecurityLogger);
    /**
     * Create and process a new security alert
     */
    createAlert(source: string, severity: AlertSeverity, category: ThreatCategory, title: string, description: string, context?: Partial<SecurityAlert['context']>, sourceData?: Partial<SecurityAlert['sourceData']>): Promise<string>;
    /**
     * Process alert from security insights
     */
    processSecurityInsight(insight: SecurityInsight): Promise<string | null>;
    /**
     * Process alert from threat patterns
     */
    processSecurityPattern(pattern: SecurityPattern): Promise<string | null>;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string, estimatedResolution?: Date): Promise<void>;
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string, resolvedBy: string, solution: string, preventionMeasures?: string[], lessonsLearned?: string[]): Promise<void>;
    /**
     * Get alerts with filtering and pagination
     */
    getAlerts(options?: {
        severity?: AlertSeverity[];
        state?: AlertState[];
        category?: ThreatCategory[];
        limit?: number;
        offset?: number;
        sortBy?: 'timestamp' | 'severity' | 'risk';
        sortOrder?: 'asc' | 'desc';
    }): {
        alerts: SecurityAlert[];
        total: number;
        hasMore: boolean;
    };
    /**
     * Get alert metrics and statistics
     */
    getAlertMetrics(timeframe: {
        start: Date;
        end: Date;
    }): {
        totalAlerts: number;
        alertsByState: Record<AlertState, number>;
        alertsBySeverity: Record<AlertSeverity, number>;
        alertsByCategory: Record<ThreatCategory, number>;
        averageResponseTime: number;
        averageResolutionTime: number;
        escalationRate: number;
        topAlertSources: Array<{
            source: string;
            count: number;
        }>;
    };
    private processAlertWorkflow;
    private processAlertRule;
    private executeAutomatedActions;
    private startEscalationProcess;
    private executeEscalationStep;
    private sendNotifications;
    private sendNotification;
    private shouldCreateAlertForInsight;
    private mapRiskLevelToAlertSeverity;
    private mapRiskScoreToAlertSeverity;
    private calculateRiskScore;
    private calculateLikelihood;
    private calculateImpact;
    private determineComplianceRequirements;
    private getMaxEscalationLevel;
    private calculateNextEscalation;
    private calculateAlertChecksum;
    private extractUsersFromInsight;
    private extractIPsFromPattern;
    private findApplicableRules;
    private evaluateRuleConditions;
    private evaluateCondition;
    private getFieldValue;
    private isAlertSuppressed;
    private generateSuppressionKey;
    private evaluateActionConditions;
    private canExecuteAction;
    private executeAction;
    private executeSystemAction;
    private executeNetworkAction;
    private executeUserAction;
    private executeDataAction;
    private executeNotificationAction;
    private executeStepAction;
    private formatNotificationContent;
    private formatSlackMessage;
    private formatEmailMessage;
    private sendEmailNotification;
    private sendSlackNotification;
    private sendPagerDutyNotification;
    private createIncidentTicket;
    private notifyManagement;
    private activateIncidentResponse;
    private getResponseTime;
    private getResolutionTime;
    private logAlertEvent;
    private logComplianceEvent;
    private generateResolutionReport;
    private initializeDefaultRules;
    private createDefaultCriticalRules;
    private createDefaultHighRules;
    private createDefaultMediumRules;
    private startContinuousProcessing;
    private processQueuedEvents;
    private processEscalationTimeouts;
    private executeNextEscalation;
    private cleanupOldAlerts;
    private setupAnalyticsIntegration;
}
export declare function createSecurityAlertingWorkflow(analytics: SecurityEventAnalytics, securityLogger: SecurityLogger): SecurityAlertingWorkflow;
export default SecurityAlertingWorkflow;
//# sourceMappingURL=SecurityAlertingWorkflow.d.ts.map