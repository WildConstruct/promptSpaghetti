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
    FEDRAMP = "fedramp",
    export,
    enum,
    ComplianceStatus
}
export interface ComplianceSecurityDashboardProps {
    metrics: ComplianceMetrics;
    requirements: ComplianceRequirement;
    frameworks: ComplianceFramework;
    auditCycles: AuditCycle;
    theme?: DashboardTheme;
    refreshInterval?: number;
    exportFormats?: ('pdf' | 'excel' | 'csv')[];
    onRequirementUpdate?: (requirementId: string, status: ComplianceStatus) => void;
    onGenerateReport?: (framework: ComplianceFramework, format: string) => void;
    onScheduleAudit?: (framework: ComplianceFramework) => void;
}
export declare const ComplianceSecurityDashboard: React.FC<ComplianceSecurityDashboardProps>;
export default ComplianceSecurityDashboard;
//# sourceMappingURL=ComplianceSecurityDashboard.d.ts.map