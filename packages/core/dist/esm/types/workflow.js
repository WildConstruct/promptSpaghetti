// Epic 9.4 - Workflow Types
// TypeScript type definitions for workflow orchestration
schedule_expression: string;
// Execution settings
action_type: string;
action_config: Record;
enabled: boolean;
// Scheduling metadata
next_run_at ?  : Date;
last_run_at ?  : Date;
run_count: number;
max_runs ?  : number;
// Failure handling
retry_count: number;
max_retries: number;
retry_delay: string;
created_by: string;
created_at: Date;
updated_at: Date;
;
// Lock statistics
lock_stats: {
    total_active: number;
    by_type: Record;
    avg_lock_duration_hours: number;
}
;
// Schedule statistics
schedule_stats: {
    total_active: number;
    by_type: Record;
    successful_executions: number;
    failed_executions: number;
}
;
workspace_id: string;
resource_id: string;
actor_id: string;
timestamp: Date;
data: Record;
;
getAvailableTransitions: (currentStateId) => WorkflowTransition;
;
error ?  : string;
// Constants
export const WORKFLOW_ICONS = { DocumentTextIcon: 'DocumentTextIcon',
    EyeIcon: 'EyeIcon',
    CheckCircleIcon: 'CheckCircleIcon',
    GlobeAltIcon: 'GlobeAltIcon',
    ArchiveBoxIcon: 'ArchiveBoxIcon' };
as;
const ;
export const WORKFLOW_COLORS = { draft: '#6B7280',
    review: '#F59E0B',
    approved: '#10B981',
    published: '#3B82F6',
    archived: '#8B5CF6' };
as;
const ;
export const WORKFLOW_ACTIONS = { STATE_CHANGED: 'state_changed',
    APPROVAL_REQUESTED: 'approval_requested',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    LOCK_ACQUIRED: 'lock_acquired',
    LOCK_RELEASED: 'lock_released',
    SCHEDULE_EXECUTED: 'schedule_executed' };
as;
const ;
