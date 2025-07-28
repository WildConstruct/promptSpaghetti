/**
 * Audit Management API Layer
 *
 * RESTful API interface for audit management operations, integrating with existing
 * PromptScape audit infrastructure and providing enhanced management capabilities.
 */
import { z } from 'zod';
import { AuditEvent } from './AuditManagementSystem';
export declare const CreateAuditEventRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AuditQueryRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ComplianceReportRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const AuditAnalyticsRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const UpdateAuditEventRequest: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CreateAuditEventRequestType = z.infer<typeof CreateAuditEventRequest>;
export type AuditQueryRequestType = z.infer<typeof AuditQueryRequest>;
export type ComplianceReportRequestType = z.infer<typeof ComplianceReportRequest>;
export type AuditAnalyticsRequestType = z.infer<typeof AuditAnalyticsRequest>;
export type UpdateAuditEventRequestType = z.infer<typeof UpdateAuditEventRequest>;
/**
 * Audit Management API Service
 *
 * Provides RESTful API interface for audit management operations
 */
export declare class AuditManagementAPI {
    private auditSystem;
    /**
    * Create a new audit event
    * POST /api/audit/events
    */
    createAuditEvent(request: CreateAuditEventRequestType): Promise<{}, success>;
    boolean: any;
    event?: AuditEvent;
    error?: string;
}
//# sourceMappingURL=AuditManagementAPI.d.ts.map