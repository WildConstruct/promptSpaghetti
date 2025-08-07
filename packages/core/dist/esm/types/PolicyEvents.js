/**
 * Policy Events and Notifications - Epic 17 Implementation
 * Task: E17-1753114397367-674DF3 - Design policy interfaces
 *
 * Event-driven policy system interfaces for real-time notifications,
 * workflow automation, and system integration.
 */
import { EvaluationContext } from ComplianceFramework;
from;
'./PolicyInterfaces';
resourceId: string;
resourceVersion ?  : string;
// Change information (for update events)
changes ?  : PolicyEventChange;
previousState ?  : any;
currentState ?  : any;
// Context information
context ?  : EvaluationContext;
// Additional event-specific data
metadata ?  : Record;
'policy.activated' | 'policy.deactivated' | 'policy.deprecated' | 'policy.archived';
data: PolicyLifecycleEventData;
'assignment.activated' | 'assignment.deactivated' |
    'assignment.conflict.detected' | 'assignment.conflict.resolved';
data: PolicyAssignmentEventData;
'evaluation.cached' | 'evaluation.cache.expired';
data: PolicyEvaluationEventData;
'compliance.audit.started' | 'compliance.audit.completed' |
    'compliance.report.generated';
data: ComplianceEventData;
'security.suspicious.activity' | 'security.threat.detected';
data: SecurityEventData;
components: ComponentStatus;
lastCheck: Date;
categories: NotificationCategory;
