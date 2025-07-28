/**
 * Security Alerting Workflow System
 * Task T-1752989143998-67: Implement security alerting workflow
 *
 * Advanced security alerting workflow engine with automated threat response,
 * intelligent escalation, and compliance reporting for Wild Construct platform.
 */
import { EventEmitter } from 'events';
import { SecurityEventAnalytics, ThreatCategory } from './SecurityEventAnalytics';
import { SecurityLogger } from './SecurityLogger';
export declare enum AlertSeverity {
    CRITICAL = "critical",// < 5 minutes response
    HIGH = "high",// < 15 minutes response
    MEDIUM = "medium",// < 1 hour response
    LOW = "low",// < 4 hours response
    INFO = "info",// Informational only
    export,
    enum,
    AlertState
}
export interface AutomatedAction {
    id: string;
    name: string;
    description: string;
    type: 'system' | 'network' | 'user' | 'data' | 'notification';
    action: string;
    parameters: Record<string, any>;
    conditions: AlertCondition;
    maxExecutions: number;
    cooldownPeriod: number;
    requiresApproval: boolean;
    approvers?: string;
}
export interface WorkflowExecution {
    alertId: string;
    workflowId: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    startTime: Date;
    endTime?: Date;
    steps: WorkflowStep;
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
    createAlert(): any;
    source: string;
    severity: AlertSeverity;
    category: ThreatCategory;
    title: string;
    description: string;
    context: Partial<SecurityAlert['context']>;
    sourceData: Partial<SecurityAlert['sourceData']>;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(): any;
    alertId: string;
    acknowledgedBy: string;
    estimatedResolution?: Date;
    Promise(): any;
}
//# sourceMappingURL=SecurityAlertingWorkflow.d.ts.map