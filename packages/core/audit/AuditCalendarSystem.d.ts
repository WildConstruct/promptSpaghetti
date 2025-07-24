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
    RETENTION_CLEANUP = "retention_cleanup"
}
export declare enum SchedulePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical",
    REGULATORY = "regulatory"
}
export declare enum RecurrencePattern {
    NONE = "none",
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    SEMI_ANNUAL = "semi_annual",
    ANNUAL = "annual",
    CUSTOM = "custom"
}
export declare enum ScheduleStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    DELAYED = "delayed",
    FAILED = "failed",
    OVERDUE = "overdue"
}
export declare enum NotificationTiming {
    IMMEDIATE = "immediate",
    ONE_HOUR = "one_hour",
    ONE_DAY = "one_day",
    ONE_WEEK = "one_week",
    TWO_WEEKS = "two_weeks"
}
export declare const AuditScheduleSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    activity_type: z.ZodNativeEnum<typeof AuditActivityType>;
    priority: z.ZodNativeEnum<typeof SchedulePriority>;
    status: z.ZodNativeEnum<typeof ScheduleStatus>;
    scheduled_start: z.ZodDate;
    scheduled_end: z.ZodDate;
    actual_start: z.ZodOptional<z.ZodDate>;
    actual_end: z.ZodOptional<z.ZodDate>;
    estimated_duration: z.ZodNumber;
    recurrence_pattern: z.ZodNativeEnum<typeof RecurrencePattern>;
    recurrence_config: z.ZodOptional<z.ZodObject<{
        interval: z.ZodOptional<z.ZodNumber>;
        end_date: z.ZodOptional<z.ZodDate>;
        max_occurrences: z.ZodOptional<z.ZodNumber>;
        days_of_week: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        day_of_month: z.ZodOptional<z.ZodNumber>;
        month_of_year: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        interval?: number | undefined;
        end_date?: Date | undefined;
        max_occurrences?: number | undefined;
        days_of_week?: number[] | undefined;
        day_of_month?: number | undefined;
        month_of_year?: number | undefined;
    }, {
        interval?: number | undefined;
        end_date?: Date | undefined;
        max_occurrences?: number | undefined;
        days_of_week?: number[] | undefined;
        day_of_month?: number | undefined;
        month_of_year?: number | undefined;
    }>>;
    assignee_id: z.ZodOptional<z.ZodString>;
    assignee_group: z.ZodOptional<z.ZodString>;
    reviewer_id: z.ZodOptional<z.ZodString>;
    approver_id: z.ZodOptional<z.ZodString>;
    compliance_frameworks: z.ZodArray<z.ZodString, "many">;
    regulatory_deadline: z.ZodOptional<z.ZodDate>;
    mandatory: z.ZodDefault<z.ZodBoolean>;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    prerequisites: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["task_completion", "document_approval", "system_ready"]>;
        description: z.ZodString;
        completed: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        type: "task_completion" | "document_approval" | "system_ready";
        completed: boolean;
    }, {
        description: string;
        type: "task_completion" | "document_approval" | "system_ready";
        completed?: boolean | undefined;
    }>, "many">>;
    notifications: z.ZodDefault<z.ZodArray<z.ZodObject<{
        timing: z.ZodNativeEnum<typeof NotificationTiming>;
        recipients: z.ZodArray<z.ZodString, "many">;
        message_template: z.ZodOptional<z.ZodString>;
        channels: z.ZodArray<z.ZodEnum<["email", "slack", "sms", "dashboard"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        channels: ("email" | "sms" | "slack" | "dashboard")[];
        timing: NotificationTiming;
        recipients: string[];
        message_template?: string | undefined;
    }, {
        channels: ("email" | "sms" | "slack" | "dashboard")[];
        timing: NotificationTiming;
        recipients: string[];
        message_template?: string | undefined;
    }>, "many">>;
    deliverables: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["report", "documentation", "certificate", "assessment"]>;
        due_date: z.ZodOptional<z.ZodDate>;
        completed: z.ZodDefault<z.ZodBoolean>;
        file_path: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        type: "documentation" | "assessment" | "report" | "certificate";
        completed: boolean;
        due_date?: Date | undefined;
        file_path?: string | undefined;
    }, {
        name: string;
        type: "documentation" | "assessment" | "report" | "certificate";
        completed?: boolean | undefined;
        due_date?: Date | undefined;
        file_path?: string | undefined;
    }>, "many">>;
    resources: z.ZodOptional<z.ZodObject<{
        personnel_count: z.ZodOptional<z.ZodNumber>;
        tools_required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        external_vendors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        budget_allocated: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        personnel_count?: number | undefined;
        tools_required?: string[] | undefined;
        external_vendors?: string[] | undefined;
        budget_allocated?: number | undefined;
    }, {
        personnel_count?: number | undefined;
        tools_required?: string[] | undefined;
        external_vendors?: string[] | undefined;
        budget_allocated?: number | undefined;
    }>>;
    progress: z.ZodOptional<z.ZodObject<{
        completion_percentage: z.ZodDefault<z.ZodNumber>;
        milestones: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            due_date: z.ZodDate;
            completed: z.ZodDefault<z.ZodBoolean>;
            completion_date: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            completed: boolean;
            due_date: Date;
            completion_date?: Date | undefined;
        }, {
            name: string;
            due_date: Date;
            completed?: boolean | undefined;
            completion_date?: Date | undefined;
        }>, "many">>;
        notes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodDate;
            author: z.ZodString;
            content: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            author: string;
            timestamp: Date;
            content: string;
        }, {
            author: string;
            timestamp: Date;
            content: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        notes: {
            author: string;
            timestamp: Date;
            content: string;
        }[];
        completion_percentage: number;
        milestones: {
            name: string;
            completed: boolean;
            due_date: Date;
            completion_date?: Date | undefined;
        }[];
    }, {
        notes?: {
            author: string;
            timestamp: Date;
            content: string;
        }[] | undefined;
        completion_percentage?: number | undefined;
        milestones?: {
            name: string;
            due_date: Date;
            completed?: boolean | undefined;
            completion_date?: Date | undefined;
        }[] | undefined;
    }>>;
    related_audit_events: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    system_components: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    created_at: z.ZodDate;
    created_by: z.ZodString;
    updated_at: z.ZodDate;
    updated_by: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    priority: SchedulePriority;
    status: ScheduleStatus;
    tags: string[];
    title: string;
    mandatory: boolean;
    notifications: {
        channels: ("email" | "sms" | "slack" | "dashboard")[];
        timing: NotificationTiming;
        recipients: string[];
        message_template?: string | undefined;
    }[];
    dependencies: string[];
    created_at: Date;
    created_by: string;
    updated_at: Date;
    prerequisites: {
        description: string;
        type: "task_completion" | "document_approval" | "system_ready";
        completed: boolean;
    }[];
    activity_type: AuditActivityType;
    scheduled_start: Date;
    scheduled_end: Date;
    estimated_duration: number;
    recurrence_pattern: RecurrencePattern;
    compliance_frameworks: string[];
    deliverables: {
        name: string;
        type: "documentation" | "assessment" | "report" | "certificate";
        completed: boolean;
        due_date?: Date | undefined;
        file_path?: string | undefined;
    }[];
    related_audit_events: string[];
    system_components: string[];
    updated_by: string;
    metadata?: Record<string, unknown> | undefined;
    progress?: {
        notes: {
            author: string;
            timestamp: Date;
            content: string;
        }[];
        completion_percentage: number;
        milestones: {
            name: string;
            completed: boolean;
            due_date: Date;
            completion_date?: Date | undefined;
        }[];
    } | undefined;
    resources?: {
        personnel_count?: number | undefined;
        tools_required?: string[] | undefined;
        external_vendors?: string[] | undefined;
        budget_allocated?: number | undefined;
    } | undefined;
    reviewer_id?: string | undefined;
    actual_start?: Date | undefined;
    actual_end?: Date | undefined;
    recurrence_config?: {
        interval?: number | undefined;
        end_date?: Date | undefined;
        max_occurrences?: number | undefined;
        days_of_week?: number[] | undefined;
        day_of_month?: number | undefined;
        month_of_year?: number | undefined;
    } | undefined;
    assignee_id?: string | undefined;
    assignee_group?: string | undefined;
    approver_id?: string | undefined;
    regulatory_deadline?: Date | undefined;
}, {
    id: string;
    description: string;
    priority: SchedulePriority;
    status: ScheduleStatus;
    title: string;
    created_at: Date;
    created_by: string;
    updated_at: Date;
    activity_type: AuditActivityType;
    scheduled_start: Date;
    scheduled_end: Date;
    estimated_duration: number;
    recurrence_pattern: RecurrencePattern;
    compliance_frameworks: string[];
    updated_by: string;
    tags?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
    progress?: {
        notes?: {
            author: string;
            timestamp: Date;
            content: string;
        }[] | undefined;
        completion_percentage?: number | undefined;
        milestones?: {
            name: string;
            due_date: Date;
            completed?: boolean | undefined;
            completion_date?: Date | undefined;
        }[] | undefined;
    } | undefined;
    resources?: {
        personnel_count?: number | undefined;
        tools_required?: string[] | undefined;
        external_vendors?: string[] | undefined;
        budget_allocated?: number | undefined;
    } | undefined;
    mandatory?: boolean | undefined;
    notifications?: {
        channels: ("email" | "sms" | "slack" | "dashboard")[];
        timing: NotificationTiming;
        recipients: string[];
        message_template?: string | undefined;
    }[] | undefined;
    dependencies?: string[] | undefined;
    prerequisites?: {
        description: string;
        type: "task_completion" | "document_approval" | "system_ready";
        completed?: boolean | undefined;
    }[] | undefined;
    reviewer_id?: string | undefined;
    actual_start?: Date | undefined;
    actual_end?: Date | undefined;
    recurrence_config?: {
        interval?: number | undefined;
        end_date?: Date | undefined;
        max_occurrences?: number | undefined;
        days_of_week?: number[] | undefined;
        day_of_month?: number | undefined;
        month_of_year?: number | undefined;
    } | undefined;
    assignee_id?: string | undefined;
    assignee_group?: string | undefined;
    approver_id?: string | undefined;
    regulatory_deadline?: Date | undefined;
    deliverables?: {
        name: string;
        type: "documentation" | "assessment" | "report" | "certificate";
        completed?: boolean | undefined;
        due_date?: Date | undefined;
        file_path?: string | undefined;
    }[] | undefined;
    related_audit_events?: string[] | undefined;
    system_components?: string[] | undefined;
}>;
export type AuditSchedule = z.infer<typeof AuditScheduleSchema>;
export declare const CalendarViewConfigSchema: z.ZodObject<{
    view_type: z.ZodEnum<["month", "week", "day", "agenda", "timeline"]>;
    start_date: z.ZodDate;
    end_date: z.ZodDate;
    filters: z.ZodOptional<z.ZodObject<{
        activity_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditActivityType>, "many">>;
        priorities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof SchedulePriority>, "many">>;
        statuses: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ScheduleStatus>, "many">>;
        assignees: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        compliance_frameworks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        mandatory_only: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        compliance_frameworks?: string[] | undefined;
        activity_types?: AuditActivityType[] | undefined;
        priorities?: SchedulePriority[] | undefined;
        statuses?: ScheduleStatus[] | undefined;
        assignees?: string[] | undefined;
        mandatory_only?: boolean | undefined;
    }, {
        compliance_frameworks?: string[] | undefined;
        activity_types?: AuditActivityType[] | undefined;
        priorities?: SchedulePriority[] | undefined;
        statuses?: ScheduleStatus[] | undefined;
        assignees?: string[] | undefined;
        mandatory_only?: boolean | undefined;
    }>>;
    display_options: z.ZodOptional<z.ZodObject<{
        show_completed: z.ZodDefault<z.ZodBoolean>;
        show_cancelled: z.ZodDefault<z.ZodBoolean>;
        color_by: z.ZodDefault<z.ZodEnum<["priority", "status", "activity_type", "assignee"]>>;
        group_by: z.ZodDefault<z.ZodEnum<["none", "assignee", "activity_type", "compliance_framework"]>>;
    }, "strip", z.ZodTypeAny, {
        show_completed: boolean;
        show_cancelled: boolean;
        color_by: "priority" | "status" | "assignee" | "activity_type";
        group_by: "none" | "assignee" | "activity_type" | "compliance_framework";
    }, {
        show_completed?: boolean | undefined;
        show_cancelled?: boolean | undefined;
        color_by?: "priority" | "status" | "assignee" | "activity_type" | undefined;
        group_by?: "none" | "assignee" | "activity_type" | "compliance_framework" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    start_date: Date;
    end_date: Date;
    view_type: "month" | "week" | "day" | "agenda" | "timeline";
    filters?: {
        compliance_frameworks?: string[] | undefined;
        activity_types?: AuditActivityType[] | undefined;
        priorities?: SchedulePriority[] | undefined;
        statuses?: ScheduleStatus[] | undefined;
        assignees?: string[] | undefined;
        mandatory_only?: boolean | undefined;
    } | undefined;
    display_options?: {
        show_completed: boolean;
        show_cancelled: boolean;
        color_by: "priority" | "status" | "assignee" | "activity_type";
        group_by: "none" | "assignee" | "activity_type" | "compliance_framework";
    } | undefined;
}, {
    start_date: Date;
    end_date: Date;
    view_type: "month" | "week" | "day" | "agenda" | "timeline";
    filters?: {
        compliance_frameworks?: string[] | undefined;
        activity_types?: AuditActivityType[] | undefined;
        priorities?: SchedulePriority[] | undefined;
        statuses?: ScheduleStatus[] | undefined;
        assignees?: string[] | undefined;
        mandatory_only?: boolean | undefined;
    } | undefined;
    display_options?: {
        show_completed?: boolean | undefined;
        show_cancelled?: boolean | undefined;
        color_by?: "priority" | "status" | "assignee" | "activity_type" | undefined;
        group_by?: "none" | "assignee" | "activity_type" | "compliance_framework" | undefined;
    } | undefined;
}>;
export type CalendarViewConfig = z.infer<typeof CalendarViewConfigSchema>;
export declare const SchedulingQuerySchema: z.ZodObject<{
    start_date: z.ZodOptional<z.ZodDate>;
    end_date: z.ZodOptional<z.ZodDate>;
    activity_types: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof AuditActivityType>, "many">>;
    priorities: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof SchedulePriority>, "many">>;
    statuses: z.ZodOptional<z.ZodArray<z.ZodNativeEnum<typeof ScheduleStatus>, "many">>;
    assignee_ids: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    compliance_frameworks: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    overdue_only: z.ZodOptional<z.ZodBoolean>;
    upcoming_only: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    compliance_frameworks?: string[] | undefined;
    activity_types?: AuditActivityType[] | undefined;
    priorities?: SchedulePriority[] | undefined;
    statuses?: ScheduleStatus[] | undefined;
    assignee_ids?: string[] | undefined;
    overdue_only?: boolean | undefined;
    upcoming_only?: boolean | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    start_date?: Date | undefined;
    end_date?: Date | undefined;
    compliance_frameworks?: string[] | undefined;
    activity_types?: AuditActivityType[] | undefined;
    priorities?: SchedulePriority[] | undefined;
    statuses?: ScheduleStatus[] | undefined;
    assignee_ids?: string[] | undefined;
    overdue_only?: boolean | undefined;
    upcoming_only?: boolean | undefined;
}>;
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
    /**
     * Create a new audit schedule
     */
    createSchedule(scheduleData: Omit<AuditSchedule, 'id' | 'created_at' | 'updated_at'>): AuditSchedule;
    /**
     * Query schedules with advanced filtering
     */
    querySchedules(query: SchedulingQuery): {
        schedules: AuditSchedule[];
        totalCount: number;
        upcomingDeadlines: AuditSchedule[];
        overdueSchedules: AuditSchedule[];
    };
    /**
     * Update an existing schedule
     */
    updateSchedule(scheduleId: string, updates: Partial<AuditSchedule>): AuditSchedule;
    /**
     * Complete a schedule and update progress
     */
    completeSchedule(scheduleId: string, completionData: {
        actual_end?: Date;
        completion_notes?: string;
        deliverables_completed?: string[];
        final_report_path?: string;
    }): AuditSchedule;
    /**
     * Generate calendar view data
     */
    generateCalendarView(config: CalendarViewConfig): {
        events: Array<{
            id: string;
            title: string;
            start: Date;
            end: Date;
            type: AuditActivityType;
            priority: SchedulePriority;
            status: ScheduleStatus;
            assignee?: string;
            color: string;
            description?: string;
        }>;
        summary: {
            total_events: number;
            by_status: Record<ScheduleStatus, number>;
            by_priority: Record<SchedulePriority, number>;
            overdue_count: number;
            upcoming_deadlines: number;
        };
    };
    /**
     * Get upcoming deadlines and alerts
     */
    getUpcomingDeadlines(days?: number): AuditSchedule[];
    /**
     * Get overdue schedules
     */
    getOverdueSchedules(): AuditSchedule[];
    /**
     * Generate recurring schedule instances
     */
    generateRecurringInstances(scheduleId: string, endDate: Date): AuditSchedule[];
    /**
     * Automated schedule monitoring and alerts
     */
    processScheduleMonitoring(): {
        alerts: Array<{
            type: 'overdue' | 'upcoming' | 'dependency' | 'resource';
            schedule_id: string;
            message: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            action_required: string;
        }>;
        notifications_sent: number;
        schedules_updated: number;
    };
    /**
     * Generate audit schedule analytics
     */
    generateScheduleAnalytics(dateRange: {
        start: Date;
        end: Date;
    }): {
        summary: {
            total_schedules: number;
            completed_schedules: number;
            overdue_schedules: number;
            completion_rate: number;
            average_duration: number;
        };
        activity_breakdown: Record<AuditActivityType, number>;
        priority_distribution: Record<SchedulePriority, number>;
        timeline_analysis: Array<{
            date: string;
            scheduled: number;
            completed: number;
            overdue: number;
        }>;
        resource_utilization: {
            by_assignee: Record<string, number>;
            by_activity_type: Record<AuditActivityType, number>;
        };
    };
    private initializeSystem;
    private setupRecurringSchedule;
    private setupScheduleNotifications;
    private validateScheduleDependencies;
    private applyScheduleFilters;
    private applyCalendarFilters;
    private getEventColor;
    private generateCalendarSummary;
    private calculateNextOccurrence;
    private calculateNotificationDate;
    private updateRecurringSchedule;
    private updateScheduleNotifications;
    private clearScheduleNotifications;
    private generateNextOccurrence;
    private processScheduleNotifications;
    private getDaysUntil;
    private generateTimelineAnalysis;
    private getWeekStart;
    private calculateResourceUtilization;
}
export declare const auditCalendarSystem: AuditCalendarSystem;
export declare const generateCalendarView: (config: CalendarViewConfig) => {
    events: Array<{
        id: string;
        title: string;
        start: Date;
        end: Date;
        type: AuditActivityType;
        priority: SchedulePriority;
        status: ScheduleStatus;
        assignee?: string;
        color: string;
        description?: string;
    }>;
    summary: {
        total_events: number;
        by_status: Record<ScheduleStatus, number>;
        by_priority: Record<SchedulePriority, number>;
        overdue_count: number;
        upcoming_deadlines: number;
    };
};
export default AuditCalendarSystem;
//# sourceMappingURL=AuditCalendarSystem.d.ts.map