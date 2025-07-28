/**
 * Comprehensive Audit Calendar and Scheduling System
 *
 * Advanced scheduling and calendar management for audit activities, compliance reviews,
 * security assessments, and automated audit workflows in PromptScape.
 */
import { z } from 'zod';
export declare enum AuditActivityType {
    COMPLIANCE_REVIEW = "compliance_review",
    SECURITY_AUDIT = "security_audit",
    INTERNAL_AUDIT = "internal_audit",
    EXTERNAL_AUDIT = "external_audit",
    RISK_ASSESSMENT = "risk_assessment",
    PENETRATION_TEST = "penetration_test",
    VULNERABILITY_SCAN = "vulnerability_scan",
    DATA_REVIEW = "data_review",
    POLICY_REVIEW = "policy_review",
    TRAINING_SESSION = "training_session",
    INCIDENT_REVIEW = "incident_review",
    RETENTION_CLEANUP = "retention_cleanup",
    export,
    enum,
    SchedulePriority
}
export type AuditSchedule = z.infer<typeof AuditScheduleSchema>;
export declare const CalendarViewConfigSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type CalendarViewConfig = z.infer<typeof CalendarViewConfigSchema>;
export declare const SchedulingQuerySchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SchedulingQuery = z.infer<typeof SchedulingQuerySchema>;
/**
 * Advanced Audit Calendar and Scheduling System
 *
 * Manages audit schedules, recurring activities, notifications, and calendar views
 */
export declare class AuditCalendarSystem {
    private schedules;
    private recurringSchedules;
    private notificationQueue;
    constructor();
    private initializeSystem;
    private setupRecurringSchedule;
    private setupScheduleNotifications;
    private validateScheduleDependencies;
    private applyScheduleFilters;
    private applyCalendarFilters;
    private getEventColor;
    if(colorBy: any): any;
}
//# sourceMappingURL=AuditCalendarSystem.d.ts.map