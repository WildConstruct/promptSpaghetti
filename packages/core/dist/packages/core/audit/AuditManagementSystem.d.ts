/**
 * Comprehensive Audit Management System
 *
 * Enhanced audit management tools built on PromptScape's existing enterprise-grade audit infrastructure.
 * Provides advanced audit analytics, compliance management, and automated reporting capabilities.
 */
import { z } from 'zod';
export declare enum AuditEventType {
    USER_ACTION = "user_action",
    SYSTEM_EVENT = "system_event",
    SECURITY_INCIDENT = "security_incident",
    COMPLIANCE_CHECK = "compliance_check",
    DATA_ACCESS = "data_access",
    CONFIGURATION_CHANGE = "configuration_change",
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    DATA_MODIFICATION = "data_modification",
    EXPORT_IMPORT = "export_import",
    export,
    enum,
    AuditSeverity
}
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export declare const AuditQuerySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type AuditQuery = z.infer<typeof AuditQuerySchema>;
export declare const AuditAnalyticsSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type AuditAnalytics = z.infer<typeof AuditAnalyticsSchema>;
/**
 * Enhanced Audit Management System
 *
 * Builds upon existing EvidenceAccessAuditService with advanced management capabilities
 */
export declare class AuditManagementSystem {
    private events;
    private indexedData;
    constructor();
    const privilegeEvents: any;
    e: any;
    risk_factors: any;
    some(factor: any, factor: any, includes: any): any;
}
//# sourceMappingURL=AuditManagementSystem.d.ts.map