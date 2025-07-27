/**
 * Security Incident Response and Troubleshooting Service
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263643-4A6D6C
 *
 * Comprehensive incident response automation with standardized procedures,
 * troubleshooting workflows, and integration with monitoring systems.
 */
import { EventEmitter } from 'events';
import { SecurityEvent, CrossSystemAlertingSystem } from './AlertingSystem';
import { SecurityAnalyticsMonitor } from '../monitoring/SecurityAnalyticsMonitor';
export interface SecurityIncident {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'data_breach' | 'system_compromise' | 'malware' | 'phishing' | 'ddos' | 'insider_threat' | 'compliance_violation' | 'operational';
    status: 'detected' | 'triaged' | 'investigating' | 'containing' | 'eradicating' | 'recovering' | 'resolved' | 'closed';
    createdAt: number;
    updatedAt: number;
    detectedBy: string;
    assignedTo?: string;
    responderTeam: string[];
    triggeringEvents: SecurityEvent[];
    relatedAlerts: string[];
    affectedSystems: string[];
    affectedUsers: string[];
    impactAssessment: {
        confidentiality: 'none' | 'low' | 'medium' | 'high' | 'critical';
        integrity: 'none' | 'low' | 'medium' | 'high' | 'critical';
        availability: 'none' | 'low' | 'medium' | 'high' | 'critical';
        estimatedCost: number;
        businessImpact: string;
        dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    };
    timeline: IncidentTimelineEntry[];
    actions: IncidentAction[];
    evidence: Evidence[];
    communications: Communication[];
    rootCause?: string;
    lessonsLearned?: string[];
    improvementActions?: string[];
    postIncidentReviewCompleted: boolean;
}
export interface IncidentTimelineEntry {
    id: string;
    timestamp: number;
    type: 'detection' | 'triage' | 'escalation' | 'action' | 'communication' | 'containment' | 'resolution';
    actor: string;
    description: string;
    details?: any;
    automated: boolean;
}
export interface IncidentAction {
    id: string;
    type: 'containment' | 'eradication' | 'recovery' | 'investigation' | 'communication' | 'documentation';
    title: string;
    description: string;
    assignedTo: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: number;
    createdAt: number;
    completedAt?: number;
    result?: string;
    dependencies?: string[];
}
export interface Evidence {
    id: string;
    type: 'log_file' | 'screenshot' | 'network_capture' | 'system_state' | 'forensic_image' | 'document' | 'artifact';
    name: string;
    description: string;
    collectedBy: string;
    collectedAt: number;
    location: string;
    hash?: string;
    chainOfCustody: Array<{
        handler: string;
        timestamp: number;
        action: 'collected' | 'analyzed' | 'transferred' | 'archived';
        notes?: string;
    }>;
}
export interface Communication {
    id: string;
    type: 'internal' | 'external' | 'regulatory' | 'customer' | 'media' | 'law_enforcement';
    audience: string[];
    subject: string;
    content: string;
    sentBy: string;
    sentAt: number;
    channel: 'email' | 'phone' | 'meeting' | 'document' | 'portal' | 'other';
    acknowledged?: Array<{
        recipient: string;
        acknowledgedAt: number;
    }>;
}
export interface IncidentResponseProcedure {
    id: string;
    name: string;
    description: string;
    category: SecurityIncident['category'];
    severity: SecurityIncident['severity'];
    triggerConditions: {
        eventTypes: SecurityEvent['type'][];
        severityThreshold: SecurityEvent['severity'];
        customRules: string[];
    };
    phases: IncidentResponsePhase[];
    automatedActions: AutomatedResponseAction[];
    communicationTemplates: CommunicationTemplate[];
    complianceRequirements: {
        framework: string;
        reportingTimeline: number;
        requiredActions: string[];
        documentationRequirements: string[];
    }[];
    createdBy: string;
    createdAt: number;
    lastUpdated: number;
    version: string;
    approved: boolean;
    approvedBy?: string;
}
export interface IncidentResponsePhase {
    id: string;
    name: string;
    description: string;
    order: number;
    parallelizable: boolean;
    steps: ResponseStep[];
    successCriteria: string[];
    timeBounds?: {
        minimum?: number;
        maximum?: number;
        typical?: number;
    };
    dependencies?: string[];
    triggers?: string[];
}
export interface ResponseStep {
    id: string;
    title: string;
    description: string;
    type: 'manual' | 'automated' | 'decision' | 'verification';
    order: number;
    mandatory: boolean;
    instructions: string;
    checklistItems: string[];
    tools: string[];
    skills: string[];
    automationScript?: string;
    verificationCriteria?: string[];
    rollbackInstructions?: string;
    estimatedDuration: number;
    dependencies?: string[];
}
export interface AutomatedResponseAction {
    id: string;
    name: string;
    description: string;
    type: 'containment' | 'isolation' | 'blocking' | 'notification' | 'data_collection' | 'analysis';
    trigger: {
        automatic: boolean;
        requiresApproval: boolean;
        conditions: string[];
    };
    script: string;
    parameters: Record<string, any>;
    timeout: number;
    rollbackScript?: string;
    safetyChecks: string[];
    approvalRequired: boolean;
    testMode: boolean;
}
export interface CommunicationTemplate {
    id: string;
    name: string;
    type: Communication['type'];
    audience: string;
    subject: string;
    content: string;
    channel: Communication['channel'];
    variables: Array<{
        name: string;
        description: string;
        required: boolean;
        defaultValue?: string;
    }>;
    timing: 'immediate' | 'hourly' | 'daily' | 'milestone' | 'resolution';
    frequency?: 'once' | 'repeating';
    conditions?: string[];
}
export interface TroubleshootingWorkflow {
    id: string;
    name: string;
    description: string;
    category: string;
    applicableIncidentTypes: SecurityIncident['category'][];
    diagnosticSteps: DiagnosticStep[];
    decisionTree: DecisionNode[];
    relatedKnowledgeArticles: string[];
    commonSolutions: Solution[];
    escalationCriteria: string[];
    createdBy: string;
    createdAt: number;
    lastUpdated: number;
    successRate: number;
    averageResolutionTime: number;
}
export interface DiagnosticStep {
    id: string;
    title: string;
    description: string;
    type: 'check' | 'test' | 'query' | 'analysis' | 'measurement';
    order: number;
    instructions: string;
    expectedResults: string[];
    tools: string[];
    automationScript?: string;
    nextSteps: Array<{
        condition: string;
        nextStepId: string;
        confidence: number;
    }>;
    successIndicators: string[];
    failureIndicators: string[];
    timeoutSeconds: number;
}
export interface DecisionNode {
    id: string;
    question: string;
    type: 'boolean' | 'multiple_choice' | 'numeric' | 'text';
    options?: string[];
    routes: Array<{
        condition: string;
        nextNodeId?: string;
        solutionId?: string;
        escalate?: boolean;
    }>;
    helpText?: string;
    examples?: string[];
    automationSupport?: boolean;
}
export interface Solution {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: SecurityIncident['severity'];
    steps: Array<{
        order: number;
        description: string;
        type: 'action' | 'verification' | 'rollback';
        script?: string;
        manual?: boolean;
    }>;
    effectiveness: number;
    riskLevel: 'low' | 'medium' | 'high';
    prerequisites: string[];
    sideEffects: string[];
    rollbackPlan: string;
    timesUsed: number;
    successRate: number;
    averageTimeToResolve: number;
    lastUsed?: number;
}
export interface IncidentResponseConfig {
    responseTeams: {
        primary: string[];
        secondary: string[];
        escalation: string[];
        external: string[];
    };
    slaTargets: {
        detection: number;
        acknowledgment: number;
        triage: number;
        containment: number;
        resolution: number;
    };
    notifications: {
        immediate: string[];
        escalation: string[];
        resolution: string[];
        external: string[];
    };
    integrations: {
        ticketing: {
            enabled: boolean;
            system: 'jira' | 'servicenow' | 'remedy';
            autoCreate: boolean;
            syncUpdates: boolean;
        };
        siem: {
            enabled: boolean;
            endpoint: string;
            autoEnrichment: boolean;
        };
        chatOps: {
            enabled: boolean;
            channels: string[];
            platform: 'slack' | 'teams' | 'discord';
        };
    };
    compliance: {
        frameworks: string[];
        autoReporting: boolean;
        reportingChannels: string[];
        retentionPeriod: number;
    };
}
/**
 * Security Incident Response Service
 */
export declare class SecurityIncidentResponseService extends EventEmitter {
    private config;
    private alertingSystem;
    private securityMonitor;
    private activeIncidents;
    private procedures;
    private workflows;
    private solutions;
    private automationQueue;
    private responseMetrics;
    constructor(config: IncidentResponseConfig, alertingSystem: CrossSystemAlertingSystem, securityMonitor: SecurityAnalyticsMonitor);
    /**
     * Create a new security incident from security events
     */
    createIncident(events: SecurityEvent[], severity: SecurityIncident['severity'], category: SecurityIncident['category'], assignedTo?: string): Promise<string>;
    /**
     * Update incident status and trigger appropriate workflows
     */
    updateIncidentStatus(incidentId: string, newStatus: SecurityIncident['status'], updatedBy: string, notes?: string): Promise<boolean>;
    /**
     * Add action to incident
     */
    addIncidentAction(incidentId: string, action: Omit<IncidentAction, 'id' | 'createdAt'>, createdBy: string): Promise<string>;
    /**
     * Complete an incident action
     */
    completeIncidentAction(incidentId: string, actionId: string, result: string, completedBy: string): Promise<boolean>;
    /**
     * Add evidence to incident
     */
    addEvidence(incidentId: string, evidence: Omit<Evidence, 'id' | 'collectedAt' | 'chainOfCustody'>, collectedBy: string): Promise<string>;
    /**
     * Execute troubleshooting workflow
     */
    executeTroubleshootingWorkflow(incidentId: string, workflowId: string, executedBy: string): Promise<{
        success: boolean;
        solutionId?: string;
        nextSteps: string[];
        recommendations: string[];
    }>;
    /**
     * Get incident details
     */
    getIncident(incidentId: string): SecurityIncident | null;
    /**
     * List incidents with filtering
     */
    listIncidents(filters?: {
        status?: SecurityIncident['status'];
        severity?: SecurityIncident['severity'];
        category?: SecurityIncident['category'];
        assignedTo?: string;
        dateRange?: {
            start: number;
            end: number;
        };
    }): SecurityIncident[];
    /**
     * Generate incident response report
     */
    generateIncidentReport(incidentId: string, reportType?: 'executive' | 'technical' | 'compliance' | 'post_incident'): {
        incident: SecurityIncident;
        summary: {
            timeToDetection: number;
            timeToContainment: number;
            timeToResolution: number;
            actionsCompleted: number;
            evidenceCollected: number;
            communicationsSent: number;
        };
        timeline: IncidentTimelineEntry[];
        recommendations: string[];
        complianceStatus: {
            framework: string;
            compliant: boolean;
            gaps: string[];
        }[];
    };
    /**
     * Get response metrics and analytics
     */
    getResponseMetrics(): typeof this.responseMetrics & {
        activeIncidents: number;
        incidentsByStatus: Record<SecurityIncident['status'], number>;
        incidentsBySeverity: Record<SecurityIncident['severity'], number>;
        incidentsByCategory: Record<SecurityIncident['category'], number>;
        averageMetrics: {
            detectionTime: number;
            responseTime: number;
            resolutionTime: number;
        };
    };
    private setupEventListeners;
    private handleSecurityAlert;
    private shouldCreateIncidentFromAlert;
    private convertAlertToSecurityEvent;
    private determineSeverityFromAlert;
    private determineCategoryFromAlert;
    private generateIncidentId;
    private generateTimelineId;
    private generateActionId;
    private generateEvidenceId;
    private generateEventId;
    private generateIncidentTitle;
    private generateIncidentDescription;
    private assessImpact;
    private estimateIncidentCost;
    private assessBusinessImpact;
    private determineDataClassification;
    private assignResponderTeam;
    private addTimelineEntry;
    private applyIncidentProcedures;
    private executeProcedure;
    private executePhase;
    private mapStepTypeToActionType;
    private mapPriorityFromSeverity;
    private executeAutomatedStep;
    private shouldTriggerAutomatedResponse;
    private triggerAutomatedResponse;
    private executeAutomatedAction;
    private sendIncidentNotifications;
    private determineNotificationRecipients;
    private createNotificationMessage;
    private generateCommunicationId;
    private performTriage;
    private startInvestigation;
    private startContainment;
    private startEradication;
    private startRecovery;
    private resolveIncident;
    private closeIncident;
    private checkPhaseTransitions;
    private executeDiagnosticSteps;
    private executeDiagnosticStep;
    private navigateDecisionTree;
    private evaluateCondition;
    private evaluateDecisionCondition;
    private applySolution;
    private generateTroubleshootingRecommendations;
    private updateWorkflowMetrics;
    private generateIncidentRecommendations;
    private assessComplianceStatus;
    private identifyComplianceGaps;
    private updateResponseMetrics;
    private initializeMetrics;
    private loadDefaultProcedures;
    private loadDefaultWorkflows;
    private startAutomationProcessing;
    private processAutomationQueue;
    private shouldAutoApproveAction;
    /**
     * Shutdown the incident response service
     */
    shutdown(): void;
}
export default SecurityIncidentResponseService;
//# sourceMappingURL=SecurityIncidentResponseService.d.ts.map