/**
 * Escalation Types - Epic 17 Implementation
 * Task: E17-1753114397261-63A60C - Implement escalation procedures
 *
 * Comprehensive type definitions for the escalation system including
 * enums, interfaces, and validation schemas for all escalation-related
 * data structures and API contracts.
 */
import { z } from 'zod';
// =============================================================================
// Core Enums
// =============================================================================
export var EscalationTriggerType;
(function (EscalationTriggerType) {
    EscalationTriggerType["TIME_BASED"] = "time_based";
    EscalationTriggerType["THRESHOLD_BASED"] = "threshold_based";
    EscalationTriggerType["MANUAL"] = "manual";
    EscalationTriggerType["AUTOMATED"] = "automated";
    EscalationTriggerType["CONDITIONAL"] = "conditional";
    EscalationTriggerType["PRIORITY_BASED"] = "priority_based";
    EscalationTriggerType[EscalationTriggerType["export"] = void 0] = "export";
    EscalationTriggerType[EscalationTriggerType["enum"] = void 0] = "enum";
    EscalationTriggerType[EscalationTriggerType["EscalationStatus"] = void 0] = "EscalationStatus";
})(EscalationTriggerType || (EscalationTriggerType = {}));
{
    PENDING = 'pending',
        IN_PROGRESS = 'in_progress',
        ESCALATED = 'escalated',
        RESOLVED = 'resolved',
        CANCELLED = 'cancelled',
        EXPIRED = 'expired';
    export let EscalationPriority;
    (function (EscalationPriority) {
        EscalationPriority["LOW"] = "low";
        EscalationPriority["MEDIUM"] = "medium";
        EscalationPriority["HIGH"] = "high";
        EscalationPriority["URGENT"] = "urgent";
        EscalationPriority["CRITICAL"] = "critical";
        EscalationPriority[EscalationPriority["export"] = void 0] = "export";
        EscalationPriority[EscalationPriority["enum"] = void 0] = "enum";
        EscalationPriority[EscalationPriority["EscalationCategory"] = void 0] = "EscalationCategory";
    })(EscalationPriority || (EscalationPriority = {}));
    {
        FRAUD_DETECTION = 'fraud_detection',
            APPEAL_PROCESS = 'appeal_process',
            POLICY_VIOLATION = 'policy_violation',
            SYSTEM_INCIDENT = 'system_incident',
            COMPLIANCE_ISSUE = 'compliance_issue',
            SECURITY_ALERT = 'security_alert',
            CUSTOMER_COMPLAINT = 'customer_complaint',
            TECHNICAL_ISSUE = 'technical_issue',
            BUSINESS_CRITICAL = 'business_critical',
            REGULATORY = 'regulatory';
        export let NotificationType;
        (function (NotificationType) {
            NotificationType["EMAIL"] = "email";
            NotificationType["SMS"] = "sms";
            NotificationType["PUSH"] = "push";
            NotificationType["SLACK"] = "slack";
            NotificationType["TEAMS"] = "teams";
            NotificationType["WEBHOOK"] = "webhook";
            NotificationType["DASHBOARD"] = "dashboard";
            NotificationType[NotificationType["export"] = void 0] = "export";
            NotificationType[NotificationType["enum"] = void 0] = "enum";
            NotificationType[NotificationType["EscalationActionType"] = void 0] = "EscalationActionType";
        })(NotificationType || (NotificationType = {}));
        {
            NOTIFICATION = 'notification',
                ASSIGNMENT = 'assignment',
                STATUS_CHANGE = 'status_change',
                DATA_COLLECTION = 'data_collection',
                EXTERNAL_API = 'external_api',
                WORKFLOW = 'workflow',
                CUSTOM = 'custom';
            export let AssignmentType;
            (function (AssignmentType) {
                AssignmentType["INDIVIDUAL"] = "individual";
                AssignmentType["GROUP"] = "group";
                AssignmentType["ROLE"] = "role";
                AssignmentType["QUEUE"] = "queue";
                AssignmentType["AUTOMATIC"] = "automatic";
                // =============================================================================
                // Validation Schemas
                // =============================================================================
                AssignmentType[AssignmentType["export"] = void 0] = "export";
                AssignmentType[AssignmentType["const"] = void 0] = "const";
                AssignmentType[AssignmentType["EscalationConditionSchema"] = AssignmentType.z.object({})] = "EscalationConditionSchema";
                AssignmentType[AssignmentType["conditionId"] = void 0] = "conditionId";
                AssignmentType[AssignmentType["z"] = void 0] = "z";
                AssignmentType[AssignmentType["string"] = void 0] = "string";
            })(AssignmentType || (AssignmentType = {}));
            (),
                type;
            z.enum(['value', 'time', 'count', 'percentage', 'custom']),
                field;
            z.string(),
                operator;
            z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'regex']),
                value;
            z.union([z.string(), z.number(), z.boolean()]),
                logicalOperator;
            z.enum(['AND', 'OR']).optional(),
            ;
        }
        ;
        export const NotificationMethodSchema = z.object({});
        type: z.nativeEnum(NotificationType),
            address;
        z.string(),
            priority;
        z.nativeEnum(EscalationPriority),
            immediateDelivery;
        z.boolean(),
            retryCount;
        z.number().min(0).max(10).optional(),
            retryInterval;
        z.number().min(1).optional(),
        ;
    }
    ;
    export const EscalationActionSchema = z.object({});
    actionId: z.string(),
        type;
    z.nativeEnum(EscalationActionType),
        configuration;
    z.record(z.unknown()),
        executeImmediately;
    z.boolean(),
        rollbackable;
    z.boolean(),
    ;
}
;
export const EscalationLevelSchema = z.object({});
levelId: z.string(),
    level;
z.number().min(0),
    name;
z.string().min(1).max(100),
    description;
z.string().max(500),
    assignmentType;
z.nativeEnum(AssignmentType),
    assignmentTarget;
z.string(),
    notificationMethods;
z.array(NotificationMethodSchema),
    notificationTemplate;
z.string().optional(),
    responseTimeLimit;
z.number().min(1),
    resolutionTimeLimit;
z.number().min(1),
    automaticActions;
z.array(EscalationActionSchema).optional(),
    requiredActions;
z.array(z.string()).optional(),
    escalationCriteria;
z.array(EscalationConditionSchema).optional(),
;
;
export const EscalationRuleSchema = z.object({});
ruleId: z.string(),
    name;
z.string().min(1).max(255),
    description;
z.string().max(1000),
    category;
z.nativeEnum(EscalationCategory),
    enabled;
z.boolean(),
    triggerType;
z.nativeEnum(EscalationTriggerType),
    conditions;
z.array(EscalationConditionSchema),
    escalationPath;
z.array(EscalationLevelSchema).min(1),
    initialDelay;
z.number().min(1).optional(),
    escalationInterval;
z.number().min(1).optional(),
    maxEscalationTime;
z.number().min(1).optional(),
    businessHoursOnly;
z.boolean().optional(),
    allowWeekends;
z.boolean().optional(),
    timeZone;
z.string().optional(),
    createdBy;
z.string(),
    createdAt;
z.date(),
    lastModified;
z.date(),
    version;
z.number().min(1),
;
;
export var EscalationEventType;
(function (EscalationEventType) {
    EscalationEventType["CASE_CREATED"] = "case_created";
    EscalationEventType["CASE_ESCALATED"] = "case_escalated";
    EscalationEventType["CASE_RESOLVED"] = "case_resolved";
    EscalationEventType["LEVEL_TIMEOUT"] = "level_timeout";
    EscalationEventType["SLA_BREACH"] = "sla_breach";
    EscalationEventType["ASSIGNMENT_CHANGED"] = "assignment_changed";
    EscalationEventType["NOTIFICATION_SENT"] = "notification_sent";
    EscalationEventType["ACTION_EXECUTED"] = "action_executed";
    EscalationEventType[EscalationEventType["export"] = void 0] = "export";
    EscalationEventType[EscalationEventType["interface"] = void 0] = "interface";
    EscalationEventType[EscalationEventType["EscalationEvent"] = void 0] = "EscalationEvent";
})(EscalationEventType || (EscalationEventType = {}));
{
    eventId: string;
    type: EscalationEventType;
    caseId: string;
    timestamp: Date;
    data: Record;
    triggeredBy: string;
    integrations ?  : string; // Integration IDs that should receive this event,
    // =============================================================================
    // Configuration Types
    // =============================================================================
}
export default {
    // Export all enums and interfaces
    EscalationTriggerType,
    EscalationStatus,
    EscalationPriority,
    EscalationCategory,
    NotificationType,
    EscalationActionType,
    AssignmentType,
    EscalationEventType,
    // Export all schemas
    EscalationConditionSchema,
    NotificationMethodSchema,
    EscalationActionSchema,
    EscalationLevelSchema,
    EscalationRuleSchema
};
