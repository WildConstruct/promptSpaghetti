/**
 * Security Incident Response and Troubleshooting Service
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263643-4A6D6C
 *
 * Comprehensive incident response automation with standardized procedures,
 * troubleshooting workflows, and integration with monitoring systems.
 */
import { EventEmitter } from 'events';
import { SecurityEvent } from './AlertingSystem';
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
    responderTeam: string;
    triggeringEvents: SecurityEvent;
    relatedAlerts: string;
    affectedSystems: string;
    affectedUsers: string;
    impactAssessment: {
        confidentiality: 'none' | 'low' | 'medium' | 'high' | 'critical';
        integrity: 'none' | 'low' | 'medium' | 'high' | 'critical';
        availability: 'none' | 'low' | 'medium' | 'high' | 'critical';
        estimatedCost: number;
        businessImpact: string;
        dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    };
    timeline: IncidentTimelineEntry;
    actions: IncidentAction;
    evidence: Evidence;
    communications: Communication;
    rootCause?: string;
    lessonsLearned?: string;
    improvementActions?: string;
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
    dependencies?: string;
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
    chainOfCustody: Array<{}, handler>;
    string: any;
    timestamp: number;
    action: 'collected' | 'analyzed' | 'transferred' | 'archived';
    notes?: string;
}
export interface Communication {
    id: string;
    type: 'internal' | 'external' | 'regulatory' | 'customer' | 'media' | 'law_enforcement';
    audience: string;
    subject: string;
    content: string;
    sentBy: string;
    sentAt: number;
    channel: 'email' | 'phone' | 'meeting' | 'document' | 'portal' | 'other';
    acknowledged?: Array<{}, recipient>;
    string: any;
    acknowledgedAt: number;
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
        customRules: string;
    };
    phases: IncidentResponsePhase;
    automatedActions: AutomatedResponseAction;
    communicationTemplates: CommunicationTemplate;
    complianceRequirements: {
        framework: string;
        reportingTimeline: number;
        requiredActions: string;
        documentationRequirements: string;
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
    steps: ResponseStep;
    successCriteria: string;
    timeBounds?: {
        minimum?: number;
        maximum?: number;
        typical?: number;
    };
    dependencies?: string;
    triggers?: string;
}
export interface ResponseStep {
    id: string;
    title: string;
    description: string;
    type: 'manual' | 'automated' | 'decision' | 'verification';
    order: number;
    mandatory: boolean;
    instructions: string;
    checklistItems: string;
    tools: string;
    skills: string;
    automationScript?: string;
    verificationCriteria?: string;
    rollbackInstructions?: string;
    estimatedDuration: number;
    dependencies?: string;
}
export interface AutomatedResponseAction {
    id: string;
    name: string;
    description: string;
    type: 'containment' | 'isolation' | 'blocking' | 'notification' | 'data_collection' | 'analysis';
    trigger: {
        automatic: boolean;
        requiresApproval: boolean;
        conditions: string;
    };
    script: string;
    parameters: Record<string, any>;
    timeout: number;
    rollbackScript?: string;
    safetyChecks: string;
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
    variables: Array<{}, name>;
    string: any;
    description: string;
    required: boolean;
    defaultValue?: string;
}
export interface TroubleshootingWorkflow {
    id: string;
    name: string;
    description: string;
    category: string;
    applicableIncidentTypes: SecurityIncident['category'][];
    diagnosticSteps: DiagnosticStep;
    decisionTree: DecisionNode;
    relatedKnowledgeArticles: string;
    commonSolutions: Solution;
    escalationCriteria: string;
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
    expectedResults: string;
    tools: string;
    automationScript?: string;
    nextSteps: Array<{}, condition>;
    string: any;
    nextStepId: string;
    confidence: number;
}
export interface DecisionNode {
    id: string;
    question: string;
    type: 'boolean' | 'multiple_choice' | 'numeric' | 'text';
    options?: string;
    routes: Array<{}, condition>;
    string: any;
    nextNodeId?: string;
    solutionId?: string;
    escalate?: boolean;
}
export interface Solution {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: SecurityIncident['severity'];
    steps: Array<{}, order>;
    number: any;
    description: string;
    type: 'action' | 'verification' | 'rollback';
    script?: string;
    manual?: boolean;
}
export interface IncidentResponseConfig {
    responseTeams: {
        primary: string;
        secondary: string;
        escalation: string;
        external: string;
    };
    slaTargets: {
        detection: number;
        acknowledgment: number;
        triage: number;
        containment: number;
        resolution: number;
    };
    notifications: {
        immediate: string;
        escalation: string;
        resolution: string;
        external: string;
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
            channels: string;
            platform: 'slack' | 'teams' | 'discord';
        };
    };
    compliance: {
        frameworks: string;
        autoReporting: boolean;
        reportingChannels: string;
        retentionPeriod: number;
    };
}
export declare class SecurityIncidentResponseService extends EventEmitter {
    private config;
    private alertingSystem;
    private securityMonitor;
    private activeIncidents;
    private procedures;
    private workflows;
    private solutions;
    private automationQueue;
    string: any;
    actionId: string;
    timestamp: number;
    approved: boolean;
}
//# sourceMappingURL=SecurityIncidentResponseService.d.ts.map