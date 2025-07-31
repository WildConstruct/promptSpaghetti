// Epic 9.4 - Workflow Types
// TypeScript type definitions for workflow orchestration
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
;
// Constants
export const WORKFLOW_ICONS = {
    DocumentTextIcon: 'DocumentTextIcon',
    EyeIcon: 'EyeIcon',
    CheckCircleIcon: 'CheckCircleIcon',
    GlobeAltIcon: 'GlobeAltIcon',
    ArchiveBoxIcon: 'ArchiveBoxIcon',
};
export const WORKFLOW_COLORS = {
    draft: '#6B7280',
    review: '#F59E0B',
    approved: '#10B981',
    published: '#3B82F6',
    archived: '#8B5CF6',
};
export const WORKFLOW_ACTIONS = {
    STATE_CHANGED: 'state_changed',
    APPROVAL_REQUESTED: 'approval_requested',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    LOCK_ACQUIRED: 'lock_acquired',
    LOCK_RELEASED: 'lock_released',
    SCHEDULE_EXECUTED: 'schedule_executed',
};
