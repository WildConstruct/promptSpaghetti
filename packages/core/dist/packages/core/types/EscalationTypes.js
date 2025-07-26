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
})(EscalationTriggerType || (EscalationTriggerType = {}));
export var EscalationStatus;
(function (EscalationStatus) {
    EscalationStatus["PENDING"] = "pending";
    EscalationStatus["IN_PROGRESS"] = "in_progress";
    EscalationStatus["ESCALATED"] = "escalated";
    EscalationStatus["RESOLVED"] = "resolved";
    EscalationStatus["CANCELLED"] = "cancelled";
    EscalationStatus["EXPIRED"] = "expired";
})(EscalationStatus || (EscalationStatus = {}));
export var EscalationPriority;
(function (EscalationPriority) {
    EscalationPriority["LOW"] = "low";
    EscalationPriority["MEDIUM"] = "medium";
    EscalationPriority["HIGH"] = "high";
    EscalationPriority["URGENT"] = "urgent";
    EscalationPriority["CRITICAL"] = "critical";
})(EscalationPriority || (EscalationPriority = {}));
export var EscalationCategory;
(function (EscalationCategory) {
    EscalationCategory["FRAUD_DETECTION"] = "fraud_detection";
    EscalationCategory["APPEAL_PROCESS"] = "appeal_process";
    EscalationCategory["POLICY_VIOLATION"] = "policy_violation";
    EscalationCategory["SYSTEM_INCIDENT"] = "system_incident";
    EscalationCategory["COMPLIANCE_ISSUE"] = "compliance_issue";
    EscalationCategory["SECURITY_ALERT"] = "security_alert";
    EscalationCategory["CUSTOMER_COMPLAINT"] = "customer_complaint";
    EscalationCategory["TECHNICAL_ISSUE"] = "technical_issue";
    EscalationCategory["BUSINESS_CRITICAL"] = "business_critical";
    EscalationCategory["REGULATORY"] = "regulatory";
})(EscalationCategory || (EscalationCategory = {}));
export var NotificationType;
(function (NotificationType) {
    NotificationType["EMAIL"] = "email";
    NotificationType["SMS"] = "sms";
    NotificationType["PUSH"] = "push";
    NotificationType["SLACK"] = "slack";
    NotificationType["TEAMS"] = "teams";
    NotificationType["WEBHOOK"] = "webhook";
    NotificationType["DASHBOARD"] = "dashboard";
})(NotificationType || (NotificationType = {}));
export var EscalationActionType;
(function (EscalationActionType) {
    EscalationActionType["NOTIFICATION"] = "notification";
    EscalationActionType["ASSIGNMENT"] = "assignment";
    EscalationActionType["STATUS_CHANGE"] = "status_change";
    EscalationActionType["DATA_COLLECTION"] = "data_collection";
    EscalationActionType["EXTERNAL_API"] = "external_api";
    EscalationActionType["WORKFLOW"] = "workflow";
    EscalationActionType["CUSTOM"] = "custom";
})(EscalationActionType || (EscalationActionType = {}));
export var AssignmentType;
(function (AssignmentType) {
    AssignmentType["INDIVIDUAL"] = "individual";
    AssignmentType["GROUP"] = "group";
    AssignmentType["ROLE"] = "role";
    AssignmentType["QUEUE"] = "queue";
    AssignmentType["AUTOMATIC"] = "automatic";
})(AssignmentType || (AssignmentType = {}));
// =============================================================================
// Validation Schemas
// =============================================================================
export const EscalationConditionSchema = z.object({
    conditionId: z.string(),
    type: z.enum(['value', 'time', 'count', 'percentage', 'custom']),
    field: z.string(),
    operator: z.enum(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'regex']),
    value: z.union([z.string(), z.number(), z.boolean()]),
    logicalOperator: z.enum(['AND', 'OR']).optional()
});
export const NotificationMethodSchema = z.object({
    type: z.nativeEnum(NotificationType),
    address: z.string(),
    priority: z.nativeEnum(EscalationPriority),
    immediateDelivery: z.boolean(),
    retryCount: z.number().min(0).max(10).optional(),
    retryInterval: z.number().min(1).optional()
});
export const EscalationActionSchema = z.object({
    actionId: z.string(),
    type: z.nativeEnum(EscalationActionType),
    configuration: z.record(z.unknown()),
    executeImmediately: z.boolean(),
    rollbackable: z.boolean()
});
export const EscalationLevelSchema = z.object({
    levelId: z.string(),
    level: z.number().min(0),
    name: z.string().min(1).max(100),
    description: z.string().max(500),
    assignmentType: z.nativeEnum(AssignmentType),
    assignmentTarget: z.string(),
    notificationMethods: z.array(NotificationMethodSchema),
    notificationTemplate: z.string().optional(),
    responseTimeLimit: z.number().min(1),
    resolutionTimeLimit: z.number().min(1),
    automaticActions: z.array(EscalationActionSchema).optional(),
    requiredActions: z.array(z.string()).optional(),
    escalationCriteria: z.array(EscalationConditionSchema).optional()
});
export const EscalationRuleSchema = z.object({
    ruleId: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().max(1000),
    category: z.nativeEnum(EscalationCategory),
    enabled: z.boolean(),
    triggerType: z.nativeEnum(EscalationTriggerType),
    conditions: z.array(EscalationConditionSchema),
    escalationPath: z.array(EscalationLevelSchema).min(1),
    initialDelay: z.number().min(1).optional(),
    escalationInterval: z.number().min(1).optional(),
    maxEscalationTime: z.number().min(1).optional(),
    businessHoursOnly: z.boolean().optional(),
    allowWeekends: z.boolean().optional(),
    timeZone: z.string().optional(),
    createdBy: z.string(),
    createdAt: z.date(),
    lastModified: z.date(),
    version: z.number().min(1)
});
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
})(EscalationEventType || (EscalationEventType = {}));
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
