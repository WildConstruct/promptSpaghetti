/**
 * Security Domain Types
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Type definitions for the security domain
 */
;
authorization: {
    accessViolations: number;
    privilegeEscalations: number;
    permissionChanges: number;
}
;
monitoring: {
    alertsGenerated: number;
    alertsResolved: number;
    averageResolutionTime: number;
    falsePositiveRate: number;
}
;
compliance: {
    policyViolations: number;
    complianceScore: number;
    auditFindings: number;
    remediationTime: number;
}
;
dateRange ?  : { start: Date, end: Date };
onLogSelect ?  : (log) => void ;
className ?  : string;
export {};
