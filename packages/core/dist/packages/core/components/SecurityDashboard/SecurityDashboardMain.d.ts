/**
 * Main Security Dashboard Component
 * Task T-1752989143998-955: Implement security dashboard
 *
 * Unified security dashboard entry point that integrates the comprehensive
 * security dashboard framework with real-time data streaming, role-based
 * access control, and workflow management.
 *
 * Features:
 * - Unified dashboard entry point and routing
 * - Real-time security event streaming
 * - Role-based dashboard views
 * - Data service layer integration
 * - Mobile-responsive design
 * - Professional Cinema 4D-inspired theming
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2025-07-22
 */
import React from 'react';
import { DashboardType, SecurityRole, DashboardTheme } from '../../security/dashboard/SecurityDashboardFramework';
export interface SecurityDashboardMainProps {
    workspaceId: string;
    userId: string;
    userRole: SecurityRole;
    initialDashboardType?: DashboardType;
    theme?: DashboardTheme;
    enableRealTimeUpdates?: boolean;
    refreshInterval?: number;
}
export interface SecurityMetrics {
    securityScore: number;
    activeThreats: number;
    blockedThreats: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastScanTime: Date;
}
export interface SecurityAlert {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'malware' | 'intrusion' | 'data_exfiltration' | 'policy_violation' | 'anomaly';
    title: string;
    description: string;
    source: string;
    timestamp: Date;
    status: 'new' | 'investigating' | 'escalated' | 'resolved' | 'false_positive';
    assignee?: string;
    affectedAssets: string;
    indicators: string;
    responseActions: ResponseAction;
}
export interface ResponseAction {
    id: string;
    type: 'isolate' | 'block' | 'quarantine' | 'investigate' | 'escalate';
    description: string;
    automated: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    performer?: string;
    timestamp?: Date;
}
export interface ComplianceStatus {
    framework: string;
    status: 'compliant' | 'non_compliant' | 'partial';
    score: number;
    violations: ComplianceViolation;
    lastAssessment: Date;
}
export interface ComplianceViolation {
    id: string;
    type: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    remediation: string;
    dueDate: Date;
}
export declare const SecurityDashboardMain: React.FC<SecurityDashboardMainProps>;
export default SecurityDashboardMain;
//# sourceMappingURL=SecurityDashboardMain.d.ts.map