/**
 * Security Dashboard Workflow System
 * Task T-1752989143998-688: Implement security dashboard workflow
 *
 * Advanced security dashboard with integrated workflow management for threat
 * detection, incident response, compliance tracking, and automated remediation.
 *
 * Features:
 * - Real-time security event processing
 * - Automated workflow state transitions
 * - Role-based access control and approvals
 * - Intelligent alert correlation and escalation
 * - Compliance-driven workflow automation
 * - Interactive incident response coordination
 * - Performance monitoring and analytics
 * - Mobile-first responsive design
 *
 * Architecture:
 * - React component with TypeScript
 * - Zustand state management integration
 * - Event-driven workflow orchestration
 * - Security framework integration
 * - Real-time data streaming
 * - Modular widget architecture
 *
 * Security Features:
 * - End-to-end audit logging
 * - Encrypted data transmission
 * - Role-based permission enforcement
 * - Input validation and sanitization
 * - Rate limiting and throttling
 * - XSS and injection protection
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
import React from 'react';
import { DashboardType, SecurityRole } from './SecurityDashboardFramework';
import { StateTransitionResult } from '../stores/workflowStore';
import './SecurityDashboardWorkflow.css';

}
export interface SecurityWorkflowEvent {
    id: string;
    type: SecurityEventType;
    severity: SecuritySeverity;
    source: string;
    timestamp: Date;
    description: string;
    metadata: Record<string, any>;
    workflowState?: string;
    assignedTo?: string;
    escalationLevel: number;
    complianceFrameworks: string[];
    automatedActions: SecurityAction[];

export declare enum SecurityEventType {
    THREAT_DETECTION = "threat_detection",
    AUTHENTICATION_FAILURE = "authentication_failure",
    ACCESS_VIOLATION = "access_violation",
    DATA_BREACH = "data_breach",
    MALWARE_DETECTION = "malware_detection",
    NETWORK_INTRUSION = "network_intrusion",
    POLICY_VIOLATION = "policy_violation",
    COMPLIANCE_VIOLATION = "compliance_violation",
    SYSTEM_ANOMALY = "system_anomaly",
    INSIDER_THREAT = "insider_threat"

export declare enum SecuritySeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"

}
export interface SecurityAction {
    type: SecurityActionType;
    target: string;
    parameters: Record<string, any>;
    timestamp: Date;
    executedBy: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    result?: string;

export declare enum SecurityActionType {
    BLOCK_IP = "block_ip",
    ISOLATE_HOST = "isolate_host",
    DISABLE_ACCOUNT = "disable_account",
    QUARANTINE_FILE = "quarantine_file",
    NOTIFY_TEAM = "notify_team",
    CREATE_TICKET = "create_ticket",
    ESCALATE_ALERT = "escalate_alert",
    COLLECT_EVIDENCE = "collect_evidence"

}
export interface SecurityWorkflowConfig {
    enableAutoTransitions: boolean;
    enableAutomatedActions: boolean;
    enableRealTimeUpdates: boolean;
    escalationThresholds: Record<SecuritySeverity, number>;
    autoApprovalRules: AutoApprovalRule[];
    complianceRequirements: ComplianceRequirement[];


}
export interface AutoApprovalRule {
    id: string;
    name: string;
    conditions: Record<string, any>;
    maxSeverity: SecuritySeverity;
    approvedActions: SecurityActionType[];
    requiredRole?: SecurityRole;


}
export interface ComplianceRequirement {
    framework: string;
    alertTypes: SecurityEventType[];
    responseTimeMinutes: number;
    requiredDocumentation: string[];
    notificationRequired: boolean;


}
export interface SecurityDashboardWorkflowProps {
    workspaceId: string;
    userId: string;
    userRole: SecurityRole;
    dashboardType?: DashboardType;
    config?: Partial<SecurityWorkflowConfig>;
    onSecurityEvent?: (event: SecurityWorkflowEvent) => void;
    onWorkflowTransition?: (result: StateTransitionResult) => void;


/**
 * Main Security Dashboard Workflow Component
 */
export declare export declare const SecurityDashboardWorkflow: React.FC<SecurityDashboardWorkflowProps>;
export default SecurityDashboardWorkflow;
//# sourceMappingURL=SecurityDashboardWorkflow.d.ts.map
}