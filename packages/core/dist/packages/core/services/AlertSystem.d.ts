/**
 * Enhanced Alert System - Epic 17
 *
 * Comprehensive alerting service that provides real-time notifications,
 * configurable alert rules, and integration with the existing UI components.
 *
 * Features:
 * - Real-time alert processing
 * - Configurable alert rules and thresholds
 * - Alert escalation and acknowledgment
 * - Integration with existing notification system
 * - Persistent alert history
 * - Alert filtering and prioritization
 */
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    type: AlertType;
    category: AlertCategory;
    severity: AlertSeverity;
    enabled: boolean;
    conditions: AlertCondition[];
    actions: AlertAction[];
    thresholds?: AlertThreshold[];
    cooldownPeriod?: number;
    escalation?: AlertEscalation;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}
export interface AlertCondition {
    id: string;
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
    value: string | number | boolean;
    aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
    timeWindow?: number;
}
export interface AlertAction {
    id: string;
    type: 'notification' | 'email' | 'webhook' | 'script' | 'create_task';
    enabled: boolean;
    configuration: Record<string, any>;
    retryPolicy?: {
        maxRetries: number;
        retryDelay: number;
        backoffMultiplier?: number;
    };
}
export interface AlertThreshold {
    id: string;
    name: string;
    value: number;
    comparison: 'above' | 'below' | 'equals';
    severity: AlertSeverity;
}
export interface AlertEscalation {
    enabled: boolean;
    stages: AlertEscalationStage[];
}
export interface AlertEscalationStage {
    id: string;
    delayMinutes: number;
    severity: AlertSeverity;
    actions: AlertAction[];
    condition?: 'unacknowledged' | 'unresolved' | 'recurring';
}
export interface Alert {
    id: string;
    ruleId: string;
    ruleName: string;
    type: AlertType;
    category: AlertCategory;
    severity: AlertSeverity;
    title: string;
    message: string;
    description?: string;
    source: string;
    sourceId?: string;
    metadata: Record<string, any>;
    status: AlertStatus;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
    resolvedAt?: Date;
    resolvedBy?: string;
    escalatedAt?: Date;
    triggeredAt: Date;
    expiresAt?: Date;
    suppressedUntil?: Date;
    occurrenceCount: number;
    firstOccurrence: Date;
    lastOccurrence: Date;
    affectedResources?: string[];
    relatedAlerts?: string[];
    troubleshootingSteps?: string[];
    documentationUrls?: string[];
    icon?: string;
    color?: string;
    priority: AlertPriority;
    tags: string[];
}
export type AlertType = 'performance' | 'error' | 'security' | 'system' | 'user_action' | 'business' | 'data_quality' | 'compliance' | 'resource_usage' | 'workflow';
export type AlertCategory = 'execution' | 'authentication' | 'authorization' | 'data_processing' | 'ui_interaction' | 'api_request' | 'database' | 'external_service' | 'configuration' | 'maintenance';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'suppressed' | 'expired';
export type AlertPriority = 'urgent' | 'high' | 'normal' | 'low';
export interface AlertFilter {
    types?: AlertType[];
    categories?: AlertCategory[];
    severities?: AlertSeverity[];
    statuses?: AlertStatus[];
    sources?: string[];
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    searchQuery?: string;
}
export interface AlertStats {
    total: number;
    active: number;
    acknowledged: number;
    resolved: number;
    suppressed: number;
    byType: Record<AlertType, number>;
    bySeverity: Record<AlertSeverity, number>;
    byCategory: Record<AlertCategory, number>;
    averageResolutionTime: number;
    escalationRate: number;
    acknowledmentRate: number;
}
/**
 * Enhanced Alert System Service
 */
export declare class AlertSystem {
    private static instance;
    private alerts;
    private rules;
    private listeners;
    private suppressionRules;
    private escalationTimers;
    private constructor();
    static getInstance(): AlertSystem;
    /**
     * Register an alert rule
     */
    registerRule(rule: AlertRule): void;
    /**
     * Trigger an alert based on conditions
     */
    triggerAlert(ruleId: string, context: Record<string, any>, overrides?: Partial<Alert>): Promise<Alert | null>;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string, note?: string): boolean;
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string, resolvedBy: string, resolution?: string): boolean;
    /**
     * Suppress an alert temporarily
     */
    suppressAlert(alertId: string, suppressedBy: string, durationMinutes: number, reason?: string): boolean;
    /**
     * Get alerts with optional filtering
     */
    getAlerts(filter?: AlertFilter): Alert[];
    /**
     * Get alert statistics
     */
    getAlertStats(): AlertStats;
    /**
     * Subscribe to alert events
     */
    subscribe(listenerId: string, callback: (alert: Alert) => void): void;
    /**
     * Unsubscribe from alert events
     */
    unsubscribe(listenerId: string): void;
    private validateRule;
    private isAlertSuppressed;
    private evaluateConditions;
    private evaluateCondition;
    private findExistingAlert;
    private updateExistingAlert;
    private createNewAlert;
    private executeActions;
    private executeAction;
    private scheduleEscalation;
    private shouldEscalate;
    private cancelEscalation;
    private reactivateAlert;
    private notifyListeners;
    private setSuppression;
    private emitSystemEvent;
    private generateAlertId;
    private generateSuppressionKey;
    private generateAlertKey;
    private generateAlertTitle;
    private generateAlertMessage;
    private generateAlertDescription;
    private mapSeverityToPriority;
    private calculateResolutionTime;
    private getNestedValue;
    private groupByField;
    private initializeDefaultRules;
    private startBackgroundProcessing;
    private cleanupExpiredAlerts;
    private cleanupSuppressionRules;
    private sendNotification;
    private sendEmail;
    private callWebhook;
    private executeScript;
    private createTask;
}
export declare const alertSystem: AlertSystem;
export declare const triggerAlert: (ruleId: string, context: Record<string, any>, overrides?: Partial<Alert>) => Promise<Alert>;
export declare const acknowledgeAlert: (alertId: string, acknowledgedBy: string, note?: string) => boolean;
export declare const resolveAlert: (alertId: string, resolvedBy: string, resolution?: string) => boolean;
export declare const getAlerts: (filter?: AlertFilter) => Alert[];
export declare const getAlertStats: () => AlertStats;
export declare const subscribeToAlerts: (listenerId: string, callback: (alert: Alert) => void) => void;
//# sourceMappingURL=AlertSystem.d.ts.map