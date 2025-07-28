/**
 * Compliance Security Dashboard
 * Task T-1752989143998-124: Design security dashboard framework
 *
 * Compliance-focused security dashboard for regulatory reporting,
 * audit preparation, and compliance monitoring. Designed for
 * compliance officers, auditors, and regulatory teams.
 *
 * Features:
 * - Multi-framework compliance tracking
 * - Audit trail management
 * - Policy compliance monitoring
 * - Risk assessment and remediation
 * - Regulatory reporting automation
 * - Evidence collection and management
 *
 * Target Users:
 * - Compliance Officers
 * - Internal/External Auditors
 * - Risk Managers
 * - Legal Teams
 * - Regulatory Affairs
 *
 * Supported Frameworks:
 * - SOC 2 Type I/II
 * - ISO 27001
 * - NIST Cybersecurity Framework
 * - GDPR/CCPA Privacy Regulations
 * - HIPAA (Healthcare)
 * - PCI DSS (Payment Card Industry)
 * - FedRAMP (Government)
 *
 * @author Security Engineering Team
 * @version 1.0.0
 * @since 2024-01-22
 */
import React from 'react';
import { DashboardTheme } from './SecurityDashboardFramework';
export declare enum ComplianceFramework {
    SOC2_TYPE1 = "soc2_type1",
    SOC2_TYPE2 = "soc2_type2",
    ISO27001 = "iso27001",
    NIST_CSF = "nist_csf",
    GDPR = "gdpr",
    CCPA = "ccpa",
    HIPAA = "hipaa",
    PCI_DSS = "pci_dss",
    FEDRAMP = "fedramp"
}
export declare enum ComplianceStatus {
    COMPLIANT = "compliant",
    PARTIALLY_COMPLIANT = "partially_compliant",
    NON_COMPLIANT = "non_compliant",
    NOT_ASSESSED = "not_assessed",
    IN_REMEDIATION = "in_remediation"
}
export interface ComplianceRequirement {
    id: string;
    framework: ComplianceFramework;
    category: string;
    requirement: string;
    description: string;
    status: ComplianceStatus;
    lastAssessment: Date;
    nextAssessment?: Date;
    responsible: string;
    evidence: Evidence[];
    findings: Finding[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    businessImpact: string;
}
export interface Evidence {
    id: string;
    type: 'document' | 'screenshot' | 'log' | 'certificate' | 'policy';
    title: string;
    description: string;
    lastUpdated: Date;
    validUntil?: Date;
    location: string;
    owner: string;
    status: 'current' | 'outdated' | 'missing';
}
export interface Finding {
    id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'gap' | 'weakness' | 'deficiency' | 'observation';
    title: string;
    description: string;
    recommendation: string;
    identifiedDate: Date;
    targetResolution: Date;
    status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
    owner: string;
    estimatedEffort: string;
}
export interface AuditCycle {
    id: string;
    framework: ComplianceFramework;
    type: 'internal' | 'external' | 'certification';
    auditor: string;
    plannedStart: Date;
    plannedEnd: Date;
    actualStart?: Date;
    actualEnd?: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
    scope: string[];
    findings: Finding[];
    reportUrl?: string;
}
export interface ComplianceMetrics {
    overallScore: number;
    byFramework: Record<ComplianceFramework, {
        score: number;
        compliantRequirements: number;
        totalRequirements: number;
        criticalGaps: number;
        lastAudit: Date;
        nextAudit?: Date;
    }>;
    riskProfile: {,
        high: number;
        medium: number;
        low: number;
        accepted: number;
    };
    auditStatus: {,
        upcoming: AuditCycle[];
        active: AuditCycle[];
        recentlyCompleted: AuditCycle[];
    };
    evidenceHealth: {,
        current: number;
        outdated: number;
        missing: number;
        expiringWithin30Days: number;
    };
}
export interface ComplianceSecurityDashboardProps {
    metrics: ComplianceMetrics;
    requirements: ComplianceRequirement[];
    frameworks: ComplianceFramework[];
    auditCycles: AuditCycle[];
    theme?: DashboardTheme;
    refreshInterval?: number;
    exportFormats?: ('pdf' | 'excel' | 'csv')[];
    onRequirementUpdate?: (requirementId: string, status: ComplianceStatus) => void;
    onGenerateReport?: (framework: ComplianceFramework, format: string) => void;
    onScheduleAudit?: (framework: ComplianceFramework) => void;
}
/**
 * Compliance Security Dashboard Component
 */
export declare const ComplianceSecurityDashboard: React.FC<ComplianceSecurityDashboardProps>;
export default ComplianceSecurityDashboard;
//# sourceMappingURL=ComplianceSecurityDashboard.d.ts.map