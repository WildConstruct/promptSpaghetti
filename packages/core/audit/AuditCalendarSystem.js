/**
 * Comprehensive Audit Calendar and Scheduling System
 *
 * Advanced scheduling and calendar management for audit activities, compliance reviews,
 * security assessments, and automated audit workflows in PromptScape.
 */
import { z } from 'zod';
// Core Scheduling Schema Definitions
export var AuditActivityType;
(function (AuditActivityType) {
    AuditActivityType["COMPLIANCE_REVIEW"] = "compliance_review";
    AuditActivityType["SECURITY_AUDIT"] = "security_audit";
    AuditActivityType["INTERNAL_AUDIT"] = "internal_audit";
    AuditActivityType["EXTERNAL_AUDIT"] = "external_audit";
    AuditActivityType["RISK_ASSESSMENT"] = "risk_assessment";
    AuditActivityType["PENETRATION_TEST"] = "penetration_test";
    AuditActivityType["VULNERABILITY_SCAN"] = "vulnerability_scan";
    AuditActivityType["DATA_REVIEW"] = "data_review";
    AuditActivityType["POLICY_REVIEW"] = "policy_review";
    AuditActivityType["TRAINING_SESSION"] = "training_session";
    AuditActivityType["INCIDENT_REVIEW"] = "incident_review";
    AuditActivityType["RETENTION_CLEANUP"] = "retention_cleanup";
})(AuditActivityType || (AuditActivityType = {}));
export var SchedulePriority;
(function (SchedulePriority) {
    SchedulePriority["LOW"] = "low";
    SchedulePriority["MEDIUM"] = "medium";
    SchedulePriority["HIGH"] = "high";
    SchedulePriority["CRITICAL"] = "critical";
    SchedulePriority["REGULATORY"] = "regulatory";
})(SchedulePriority || (SchedulePriority = {}));
export var RecurrencePattern;
(function (RecurrencePattern) {
    RecurrencePattern["NONE"] = "none";
    RecurrencePattern["DAILY"] = "daily";
    RecurrencePattern["WEEKLY"] = "weekly";
    RecurrencePattern["MONTHLY"] = "monthly";
    RecurrencePattern["QUARTERLY"] = "quarterly";
    RecurrencePattern["SEMI_ANNUAL"] = "semi_annual";
    RecurrencePattern["ANNUAL"] = "annual";
    RecurrencePattern["CUSTOM"] = "custom";
})(RecurrencePattern || (RecurrencePattern = {}));
export var ScheduleStatus;
(function (ScheduleStatus) {
    ScheduleStatus["SCHEDULED"] = "scheduled";
    ScheduleStatus["IN_PROGRESS"] = "in_progress";
    ScheduleStatus["COMPLETED"] = "completed";
    ScheduleStatus["CANCELLED"] = "cancelled";
    ScheduleStatus["DELAYED"] = "delayed";
    ScheduleStatus["FAILED"] = "failed";
    ScheduleStatus["OVERDUE"] = "overdue";
})(ScheduleStatus || (ScheduleStatus = {}));
export var NotificationTiming;
(function (NotificationTiming) {
    NotificationTiming["IMMEDIATE"] = "immediate";
    NotificationTiming["ONE_HOUR"] = "one_hour";
    NotificationTiming["ONE_DAY"] = "one_day";
    NotificationTiming["ONE_WEEK"] = "one_week";
    NotificationTiming["TWO_WEEKS"] = "two_weeks";
})(NotificationTiming || (NotificationTiming = {}));
// Core Audit Schedule Schema
export const AuditScheduleSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(2000),
    activity_type: z.nativeEnum(AuditActivityType),
    priority: z.nativeEnum(SchedulePriority),
    status: z.nativeEnum(ScheduleStatus),
    // Timing Information
    scheduled_start: z.date(),
    scheduled_end: z.date(),
    actual_start: z.date().optional(),
    actual_end: z.date().optional(),
    estimated_duration: z.number().min(0), // minutes
    // Recurrence Configuration
    recurrence_pattern: z.nativeEnum(RecurrencePattern),
    recurrence_config: z.object({
        interval: z.number().min(1).optional(),
        end_date: z.date().optional(),
        max_occurrences: z.number().min(1).optional(),
        days_of_week: z.array(z.number().min(0).max(6)).optional(), // 0-6 (Sunday-Saturday)
        day_of_month: z.number().min(1).max(31).optional(),
        month_of_year: z.number().min(1).max(12).optional()
    }).optional(),
    // Assignment Information
    assignee_id: z.string().optional(),
    assignee_group: z.string().optional(),
    reviewer_id: z.string().optional(),
    approver_id: z.string().optional(),
    // Compliance Context
    compliance_frameworks: z.array(z.string()),
    regulatory_deadline: z.date().optional(),
    mandatory: z.boolean().default(false),
    // Dependencies and Prerequisites
    dependencies: z.array(z.string()).default([]), // Other schedule IDs
    prerequisites: z.array(z.object({
        type: z.enum(['task_completion', 'document_approval', 'system_ready']),
        description: z.string(),
        completed: z.boolean().default(false)
    })).default([]),
    // Notification Configuration
    notifications: z.array(z.object({
        timing: z.nativeEnum(NotificationTiming),
        recipients: z.array(z.string()),
        message_template: z.string().optional(),
        channels: z.array(z.enum(['email', 'slack', 'sms', 'dashboard']))
    })).default([]),
    // Deliverables and Outcomes
    deliverables: z.array(z.object({
        name: z.string(),
        type: z.enum(['report', 'documentation', 'certificate', 'assessment']),
        due_date: z.date().optional(),
        completed: z.boolean().default(false),
        file_path: z.string().optional()
    })).default([]),
    // Resource Requirements
    resources: z.object({
        personnel_count: z.number().min(0).optional(),
        tools_required: z.array(z.string()).optional(),
        external_vendors: z.array(z.string()).optional(),
        budget_allocated: z.number().min(0).optional()
    }).optional(),
    // Progress Tracking
    progress: z.object({
        completion_percentage: z.number().min(0).max(100).default(0),
        milestones: z.array(z.object({
            name: z.string(),
            due_date: z.date(),
            completed: z.boolean().default(false),
            completion_date: z.date().optional()
        })).default([]),
        notes: z.array(z.object({
            timestamp: z.date(),
            author: z.string(),
            content: z.string()
        })).default([])
    }).optional(),
    // Integration Data
    related_audit_events: z.array(z.string()).default([]), // Audit event IDs
    system_components: z.array(z.string()).default([]),
    // Metadata
    created_at: z.date(),
    created_by: z.string(),
    updated_at: z.date(),
    updated_by: z.string(),
    tags: z.array(z.string()).default([]),
    metadata: z.record(z.unknown()).optional()
});
// Calendar View Configuration Schema
export const CalendarViewConfigSchema = z.object({
    view_type: z.enum(['month', 'week', 'day', 'agenda', 'timeline']),
    start_date: z.date(),
    end_date: z.date(),
    filters: z.object({
        activity_types: z.array(z.nativeEnum(AuditActivityType)).optional(),
        priorities: z.array(z.nativeEnum(SchedulePriority)).optional(),
        statuses: z.array(z.nativeEnum(ScheduleStatus)).optional(),
        assignees: z.array(z.string()).optional(),
        compliance_frameworks: z.array(z.string()).optional(),
        mandatory_only: z.boolean().optional()
    }).optional(),
    display_options: z.object({
        show_completed: z.boolean().default(true),
        show_cancelled: z.boolean().default(false),
        color_by: z.enum(['priority', 'status', 'activity_type', 'assignee']).default('priority'),
        group_by: z.enum(['none', 'assignee', 'activity_type', 'compliance_framework']).default('none')
    }).optional()
});
// Scheduling Query Schema
export const SchedulingQuerySchema = z.object({
    start_date: z.date().optional(),
    end_date: z.date().optional(),
    activity_types: z.array(z.nativeEnum(AuditActivityType)).optional(),
    priorities: z.array(z.nativeEnum(SchedulePriority)).optional(),
    statuses: z.array(z.nativeEnum(ScheduleStatus)).optional(),
    assignee_ids: z.array(z.string()).optional(),
    compliance_frameworks: z.array(z.string()).optional(),
    overdue_only: z.boolean().optional(),
    upcoming_only: z.boolean().optional(),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(1000).default(50)
});
/**
 * Advanced Audit Calendar and Scheduling System
 *
 * Manages audit schedules, recurring activities, notifications, and calendar views
 */
export class AuditCalendarSystem {
    schedules = new Map();
    recurringSchedules = new Map();
    notificationQueue = new Map();
    constructor() {
        // Initialize system with default configurations
        this.initializeSystem();
    }
    /**
     * Create a new audit schedule
     */
    createSchedule(scheduleData) {
        const schedule = {
            id: crypto.randomUUID(),
            created_at: new Date(),
            updated_at: new Date(),
            ...scheduleData
        };
        // Validate the schedule
        const validatedSchedule = AuditScheduleSchema.parse(schedule);
        // Store the schedule
        this.schedules.set(validatedSchedule.id, validatedSchedule);
        // Handle recurring schedules
        if (validatedSchedule.recurrence_pattern !== RecurrencePattern.NONE) {
            this.setupRecurringSchedule(validatedSchedule);
        }
        // Setup notifications
        this.setupScheduleNotifications(validatedSchedule);
        // Validate dependencies
        this.validateScheduleDependencies(validatedSchedule);
        return validatedSchedule;
    }
    /**
     * Query schedules with advanced filtering
     */
    querySchedules(query) {
        const validatedQuery = SchedulingQuerySchema.parse(query);
        // Apply filters
        const filteredSchedules = this.applyScheduleFilters(Array.from(this.schedules.values()), validatedQuery);
        // Calculate metrics
        const upcomingDeadlines = this.getUpcomingDeadlines(7); // Next 7 days
        const overdueSchedules = this.getOverdueSchedules();
        // Apply pagination
        const totalCount = filteredSchedules.length;
        const startIndex = (validatedQuery.page - 1) * validatedQuery.limit;
        const paginatedSchedules = filteredSchedules.slice(startIndex, startIndex + validatedQuery.limit);
        return {
            schedules: paginatedSchedules,
            totalCount,
            upcomingDeadlines,
            overdueSchedules
        };
    }
    /**
     * Update an existing schedule
     */
    updateSchedule(scheduleId, updates) {
        const existingSchedule = this.schedules.get(scheduleId);
        if (!existingSchedule) {
            throw new Error(`Schedule not found: ${scheduleId}`);
        }
        const updatedSchedule = {
            ...existingSchedule,
            ...updates,
            updated_at: new Date()
        };
        // Validate the updated schedule
        const validatedSchedule = AuditScheduleSchema.parse(updatedSchedule);
        // Update storage
        this.schedules.set(scheduleId, validatedSchedule);
        // Handle recurrence changes
        if (updates.recurrence_pattern || updates.recurrence_config) {
            this.updateRecurringSchedule(validatedSchedule);
        }
        // Update notifications if needed
        if (updates.notifications || updates.scheduled_start || updates.scheduled_end) {
            this.updateScheduleNotifications(validatedSchedule);
        }
        return validatedSchedule;
    }
    /**
     * Complete a schedule and update progress
     */
    completeSchedule(scheduleId, completionData) {
        const schedule = this.schedules.get(scheduleId);
        if (!schedule) {
            throw new Error(`Schedule not found: ${scheduleId}`);
        }
        const updatedSchedule = {
            ...schedule,
            status: ScheduleStatus.COMPLETED,
            actual_end: completionData.actual_end || new Date(),
            updated_at: new Date(),
            progress: {
                ...schedule.progress,
                completion_percentage: 100,
                notes: [
                    ...(schedule.progress?.notes || []),
                    {
                        timestamp: new Date(),
                        author: 'system',
                        content: completionData.completion_notes || 'Schedule completed'
                    }
                ]
            }
        };
        // Mark deliverables as completed
        if (completionData.deliverables_completed) {
            updatedSchedule.deliverables = schedule.deliverables.map(deliverable => ({
                ...deliverable,
                completed: completionData.deliverables_completed.includes(deliverable.name)
            }));
        }
        this.schedules.set(scheduleId, updatedSchedule);
        // Generate next occurrence if recurring
        if (schedule.recurrence_pattern !== RecurrencePattern.NONE) {
            this.generateNextOccurrence(schedule);
        }
        return updatedSchedule;
    }
    /**
     * Generate calendar view data
     */
    generateCalendarView(config) {
        const validatedConfig = CalendarViewConfigSchema.parse(config);
        // Filter schedules for the date range
        const schedules = Array.from(this.schedules.values()).filter(schedule => {
            const startInRange = schedule.scheduled_start >= validatedConfig.start_date &&
                schedule.scheduled_start <= validatedConfig.end_date;
            const endInRange = schedule.scheduled_end >= validatedConfig.start_date &&
                schedule.scheduled_end <= validatedConfig.end_date;
            const spanRange = schedule.scheduled_start <= validatedConfig.start_date &&
                schedule.scheduled_end >= validatedConfig.end_date;
            return startInRange || endInRange || spanRange;
        });
        // Apply filters
        const filteredSchedules = this.applyCalendarFilters(schedules, validatedConfig);
        // Generate calendar events
        const events = filteredSchedules.map(schedule => ({
            id: schedule.id,
            title: schedule.title,
            start: schedule.scheduled_start,
            end: schedule.scheduled_end,
            type: schedule.activity_type,
            priority: schedule.priority,
            status: schedule.status,
            assignee: schedule.assignee_id,
            color: this.getEventColor(schedule, validatedConfig.display_options?.color_by || 'priority'),
            description: schedule.description
        }));
        // Generate summary statistics
        const summary = this.generateCalendarSummary(filteredSchedules);
        return { events, summary };
    }
    /**
     * Get upcoming deadlines and alerts
     */
    getUpcomingDeadlines(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        return Array.from(this.schedules.values()).filter(schedule => schedule.status === ScheduleStatus.SCHEDULED &&
            schedule.scheduled_start <= cutoffDate &&
            schedule.scheduled_start >= new Date()).sort((a, b) => a.scheduled_start.getTime() - b.scheduled_start.getTime());
    }
    /**
     * Get overdue schedules
     */
    getOverdueSchedules() {
        const now = new Date();
        return Array.from(this.schedules.values()).filter(schedule => schedule.status === ScheduleStatus.SCHEDULED &&
            schedule.scheduled_end < now).map(schedule => ({
            ...schedule,
            status: ScheduleStatus.OVERDUE
        }));
    }
    /**
     * Generate recurring schedule instances
     */
    generateRecurringInstances(scheduleId, endDate) {
        const baseSchedule = this.schedules.get(scheduleId);
        if (!baseSchedule || baseSchedule.recurrence_pattern === RecurrencePattern.NONE) {
            return [];
        }
        const instances = [];
        let currentDate = new Date(baseSchedule.scheduled_start);
        const duration = baseSchedule.scheduled_end.getTime() - baseSchedule.scheduled_start.getTime();
        while (currentDate <= endDate) {
            // Calculate next occurrence based on pattern
            const nextDate = this.calculateNextOccurrence(currentDate, baseSchedule.recurrence_pattern, baseSchedule.recurrence_config);
            if (nextDate > endDate)
                break;
            // Create new instance
            const instance = {
                ...baseSchedule,
                id: crypto.randomUUID(),
                scheduled_start: new Date(nextDate),
                scheduled_end: new Date(nextDate.getTime() + duration),
                status: ScheduleStatus.SCHEDULED,
                created_at: new Date(),
                updated_at: new Date(),
                metadata: {
                    ...baseSchedule.metadata,
                    recurring_parent_id: scheduleId,
                    occurrence_number: instances.length + 1
                }
            };
            instances.push(instance);
            currentDate = nextDate;
        }
        return instances;
    }
    /**
     * Automated schedule monitoring and alerts
     */
    processScheduleMonitoring() {
        const alerts = [];
        let notificationsSent = 0;
        let schedulesUpdated = 0;
        // Check for overdue schedules
        const overdueSchedules = this.getOverdueSchedules();
        overdueSchedules.forEach(schedule => {
            alerts.push({
                type: 'overdue',
                schedule_id: schedule.id,
                message: `Schedule "${schedule.title}" is overdue`,
                severity: schedule.priority === SchedulePriority.CRITICAL ? 'critical' : 'high',
                action_required: 'Immediate attention required'
            });
            // Update status
            if (schedule.status !== ScheduleStatus.OVERDUE) {
                this.updateSchedule(schedule.id, { status: ScheduleStatus.OVERDUE });
                schedulesUpdated++;
            }
        });
        // Check for upcoming deadlines
        const upcomingDeadlines = this.getUpcomingDeadlines(3); // Next 3 days
        upcomingDeadlines.forEach(schedule => {
            alerts.push({
                type: 'upcoming',
                schedule_id: schedule.id,
                message: `Schedule "${schedule.title}" due in ${this.getDaysUntil(schedule.scheduled_start)} days`,
                severity: schedule.priority === SchedulePriority.REGULATORY ? 'critical' : 'medium',
                action_required: 'Prepare for upcoming audit activity'
            });
        });
        // Process notifications
        const notifications = this.processScheduleNotifications();
        notificationsSent = notifications.length;
        return {
            alerts,
            notifications_sent: notificationsSent,
            schedules_updated: schedulesUpdated
        };
    }
    /**
     * Generate audit schedule analytics
     */
    generateScheduleAnalytics(dateRange) {
        const schedules = Array.from(this.schedules.values()).filter(schedule => schedule.scheduled_start >= dateRange.start && schedule.scheduled_start <= dateRange.end);
        // Summary statistics
        const totalSchedules = schedules.length;
        const completedSchedules = schedules.filter(s => s.status === ScheduleStatus.COMPLETED).length;
        const overdueSchedules = schedules.filter(s => s.status === ScheduleStatus.OVERDUE).length;
        const completionRate = totalSchedules > 0 ? (completedSchedules / totalSchedules) * 100 : 0;
        // Calculate average duration
        const completedWithDuration = schedules.filter(s => s.actual_start && s.actual_end);
        const avgDuration = completedWithDuration.length > 0
            ? completedWithDuration.reduce((sum, s) => sum + (s.actual_end.getTime() - s.actual_start.getTime()), 0) / completedWithDuration.length / (1000 * 60 * 60) // hours
            : 0;
        // Activity breakdown
        const activityBreakdown = {};
        Object.values(AuditActivityType).forEach(type => {
            activityBreakdown[type] = schedules.filter(s => s.activity_type === type).length;
        });
        // Priority distribution
        const priorityDistribution = {};
        Object.values(SchedulePriority).forEach(priority => {
            priorityDistribution[priority] = schedules.filter(s => s.priority === priority).length;
        });
        // Timeline analysis (weekly buckets)
        const timelineAnalysis = this.generateTimelineAnalysis(schedules, dateRange);
        // Resource utilization
        const resourceUtilization = this.calculateResourceUtilization(schedules);
        return {
            summary: {
                total_schedules: totalSchedules,
                completed_schedules: completedSchedules,
                overdue_schedules: overdueSchedules,
                completion_rate: Math.round(completionRate * 100) / 100,
                average_duration: Math.round(avgDuration * 100) / 100
            },
            activity_breakdown: activityBreakdown,
            priority_distribution: priorityDistribution,
            timeline_analysis: timelineAnalysis,
            resource_utilization: resourceUtilization
        };
    }
    // Private helper methods
    initializeSystem() {
        // Set up periodic monitoring
        setInterval(() => {
            this.processScheduleMonitoring();
        }, 3600000); // Every hour
    }
    setupRecurringSchedule(schedule) {
        this.recurringSchedules.set(schedule.id, schedule);
        // Generate next few instances
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1); // Next year
        const instances = this.generateRecurringInstances(schedule.id, endDate);
        instances.slice(0, 5).forEach(instance => {
            this.schedules.set(instance.id, instance);
        });
    }
    setupScheduleNotifications(schedule) {
        schedule.notifications.forEach(notification => {
            const notificationDate = this.calculateNotificationDate(schedule.scheduled_start, notification.timing);
            if (!this.notificationQueue.has(notificationDate.toDateString())) {
                this.notificationQueue.set(notificationDate.toDateString(), []);
            }
            this.notificationQueue.get(notificationDate.toDateString()).push({
                schedule_id: schedule.id,
                notification,
                send_date: notificationDate
            });
        });
    }
    validateScheduleDependencies(schedule) {
        schedule.dependencies.forEach(depId => {
            const dependency = this.schedules.get(depId);
            if (dependency && dependency.scheduled_end >= schedule.scheduled_start) {
                console.warn(`Schedule dependency conflict: ${schedule.id} depends on ${depId} which ends after this schedule starts`);
            }
        });
    }
    applyScheduleFilters(schedules, query) {
        return schedules.filter(schedule => {
            if (query.start_date && schedule.scheduled_start < query.start_date)
                return false;
            if (query.end_date && schedule.scheduled_start > query.end_date)
                return false;
            if (query.activity_types && !query.activity_types.includes(schedule.activity_type))
                return false;
            if (query.priorities && !query.priorities.includes(schedule.priority))
                return false;
            if (query.statuses && !query.statuses.includes(schedule.status))
                return false;
            if (query.assignee_ids && schedule.assignee_id && !query.assignee_ids.includes(schedule.assignee_id))
                return false;
            if (query.compliance_frameworks && !query.compliance_frameworks.some(cf => schedule.compliance_frameworks.includes(cf)))
                return false;
            if (query.overdue_only && schedule.status !== ScheduleStatus.OVERDUE)
                return false;
            if (query.upcoming_only && schedule.scheduled_start <= new Date())
                return false;
            return true;
        });
    }
    applyCalendarFilters(schedules, config) {
        if (!config.filters)
            return schedules;
        return schedules.filter(schedule => {
            if (config.filters.activity_types && !config.filters.activity_types.includes(schedule.activity_type))
                return false;
            if (config.filters.priorities && !config.filters.priorities.includes(schedule.priority))
                return false;
            if (config.filters.statuses && !config.filters.statuses.includes(schedule.status))
                return false;
            if (config.filters.assignees && schedule.assignee_id && !config.filters.assignees.includes(schedule.assignee_id))
                return false;
            if (config.filters.compliance_frameworks && !config.filters.compliance_frameworks.some(cf => schedule.compliance_frameworks.includes(cf)))
                return false;
            if (config.filters.mandatory_only && !schedule.mandatory)
                return false;
            return true;
        });
    }
    getEventColor(schedule, colorBy) {
        const colors = {
            priority: {
                [SchedulePriority.LOW]: '#52c41a',
                [SchedulePriority.MEDIUM]: '#faad14',
                [SchedulePriority.HIGH]: '#fa8c16',
                [SchedulePriority.CRITICAL]: '#f5222d',
                [SchedulePriority.REGULATORY]: '#722ed1'
            },
            status: {
                [ScheduleStatus.SCHEDULED]: '#1890ff',
                [ScheduleStatus.IN_PROGRESS]: '#faad14',
                [ScheduleStatus.COMPLETED]: '#52c41a',
                [ScheduleStatus.CANCELLED]: '#bfbfbf',
                [ScheduleStatus.DELAYED]: '#fa8c16',
                [ScheduleStatus.FAILED]: '#f5222d',
                [ScheduleStatus.OVERDUE]: '#f5222d'
            }
        };
        if (colorBy === 'priority') {
            return colors.priority[schedule.priority] || '#1890ff';
        }
        else if (colorBy === 'status') {
            return colors.status[schedule.status] || '#1890ff';
        }
        return '#1890ff'; // Default blue
    }
    generateCalendarSummary(schedules) {
        const statusCounts = {};
        const priorityCounts = {};
        Object.values(ScheduleStatus).forEach(status => {
            statusCounts[status] = schedules.filter(s => s.status === status).length;
        });
        Object.values(SchedulePriority).forEach(priority => {
            priorityCounts[priority] = schedules.filter(s => s.priority === priority).length;
        });
        const now = new Date();
        const upcomingDeadlines = schedules.filter(s => s.scheduled_start > now &&
            s.scheduled_start <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)).length;
        return {
            total_events: schedules.length,
            by_status: statusCounts,
            by_priority: priorityCounts,
            overdue_count: statusCounts[ScheduleStatus.OVERDUE] || 0,
            upcoming_deadlines: upcomingDeadlines
        };
    }
    calculateNextOccurrence(currentDate, pattern, config) {
        const nextDate = new Date(currentDate);
        switch (pattern) {
            case RecurrencePattern.DAILY:
                nextDate.setDate(nextDate.getDate() + (config?.interval || 1));
                break;
            case RecurrencePattern.WEEKLY:
                nextDate.setDate(nextDate.getDate() + 7 * (config?.interval || 1));
                break;
            case RecurrencePattern.MONTHLY:
                nextDate.setMonth(nextDate.getMonth() + (config?.interval || 1));
                break;
            case RecurrencePattern.QUARTERLY:
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case RecurrencePattern.SEMI_ANNUAL:
                nextDate.setMonth(nextDate.getMonth() + 6);
                break;
            case RecurrencePattern.ANNUAL:
                nextDate.setFullYear(nextDate.getFullYear() + (config?.interval || 1));
                break;
        }
        return nextDate;
    }
    calculateNotificationDate(scheduleDate, timing) {
        const notificationDate = new Date(scheduleDate);
        switch (timing) {
            case NotificationTiming.IMMEDIATE:
                return notificationDate;
            case NotificationTiming.ONE_HOUR:
                notificationDate.setHours(notificationDate.getHours() - 1);
                break;
            case NotificationTiming.ONE_DAY:
                notificationDate.setDate(notificationDate.getDate() - 1);
                break;
            case NotificationTiming.ONE_WEEK:
                notificationDate.setDate(notificationDate.getDate() - 7);
                break;
            case NotificationTiming.TWO_WEEKS:
                notificationDate.setDate(notificationDate.getDate() - 14);
                break;
        }
        return notificationDate;
    }
    updateRecurringSchedule(schedule) {
        // Update the recurring schedule configuration
        this.recurringSchedules.set(schedule.id, schedule);
    }
    updateScheduleNotifications(schedule) {
        // Clear existing notifications for this schedule
        this.clearScheduleNotifications(schedule.id);
        // Setup new notifications
        this.setupScheduleNotifications(schedule);
    }
    clearScheduleNotifications(scheduleId) {
        this.notificationQueue.forEach((notifications, date) => {
            this.notificationQueue.set(date, notifications.filter(n => n.schedule_id !== scheduleId));
        });
    }
    generateNextOccurrence(schedule) {
        if (schedule.recurrence_pattern === RecurrencePattern.NONE)
            return;
        const nextStart = this.calculateNextOccurrence(schedule.scheduled_start, schedule.recurrence_pattern, schedule.recurrence_config);
        const duration = schedule.scheduled_end.getTime() - schedule.scheduled_start.getTime();
        const nextEnd = new Date(nextStart.getTime() + duration);
        const nextInstance = {
            ...schedule,
            id: crypto.randomUUID(),
            scheduled_start: nextStart,
            scheduled_end: nextEnd,
            status: ScheduleStatus.SCHEDULED,
            actual_start: undefined,
            actual_end: undefined,
            created_at: new Date(),
            updated_at: new Date(),
            progress: undefined,
            metadata: {
                ...schedule.metadata,
                recurring_parent_id: schedule.id
            }
        };
        this.schedules.set(nextInstance.id, nextInstance);
    }
    processScheduleNotifications() {
        const today = new Date().toDateString();
        const notifications = this.notificationQueue.get(today) || [];
        // Process notifications (would integrate with notification service)
        notifications.forEach(notification => {
            console.log(`Sending notification for schedule: ${notification.schedule_id}`);
        });
        // Clear processed notifications
        this.notificationQueue.delete(today);
        return notifications;
    }
    getDaysUntil(date) {
        const now = new Date();
        const diffTime = date.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    generateTimelineAnalysis(schedules, dateRange) {
        const weeks = new Map();
        schedules.forEach(schedule => {
            const weekStart = this.getWeekStart(schedule.scheduled_start);
            const weekKey = weekStart.toISOString().split('T')[0];
            if (!weeks.has(weekKey)) {
                weeks.set(weekKey, { scheduled: 0, completed: 0, overdue: 0 });
            }
            const weekData = weeks.get(weekKey);
            weekData.scheduled++;
            if (schedule.status === ScheduleStatus.COMPLETED) {
                weekData.completed++;
            }
            else if (schedule.status === ScheduleStatus.OVERDUE) {
                weekData.overdue++;
            }
        });
        return Array.from(weeks.entries()).map(([date, data]) => ({
            date,
            ...data
        })).sort((a, b) => a.date.localeCompare(b.date));
    }
    getWeekStart(date) {
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day;
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }
    calculateResourceUtilization(schedules) {
        const byAssignee = {};
        const byActivityType = {};
        schedules.forEach(schedule => {
            if (schedule.assignee_id) {
                byAssignee[schedule.assignee_id] = (byAssignee[schedule.assignee_id] || 0) + 1;
            }
            byActivityType[schedule.activity_type] = (byActivityType[schedule.activity_type] || 0) + 1;
        });
        return {
            by_assignee: byAssignee,
            by_activity_type: byActivityType
        };
    }
}
// Global calendar system instance
export const auditCalendarSystem = new AuditCalendarSystem();
// Utility functions
export export export const generateCalendarView = (config) => auditCalendarSystem.generateCalendarView(config);
export default AuditCalendarSystem;
