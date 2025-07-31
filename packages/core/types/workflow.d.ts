export interface WorkflowState {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    is_initial: boolean;
    is_final: boolean;
    is_locked: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;

}
export interface WorkflowTransition {
    id: string;
    workspace_id: string;
    from_state_id?: string;
    to_state_id: string;
    name: string;
    description?: string;
    requires_approval: boolean;
    required_permissions: bigint;
    conditions: Record<string, any>;
    created_at: Date;

}
export interface WorkflowApproval {
    id: string;
    workspace_id: string;
    resource_id: string;
    transition_id: string;
    requester_id: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    requested_at: Date;
    due_date?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    approved_by?: string;
    approved_at?: Date;
    rejection_reason?: string;
    approval_comment?: string;
    auto_approve_after?: string;
    auto_approve_conditions: Record<string, any>;
    created_at: Date;
    updated_at: Date;

}
export interface WorkflowApprovalReviewer {
    id: string;
    approval_id: string;
    reviewer_id: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_at?: Date;
    review_comment?: string;
    created_at: Date;

}
export interface WorkflowLock {
    id: string;
    workspace_id: string;
    resource_id: string;
    locked_by: string;
    lock_type: 'edit' | 'state_change' | 'delete' | 'custom';
    lock_reason?: string;
    locked_at: Date;
    expires_at?: Date;
    auto_release: boolean;
    metadata: Record<string, any>;

}
export interface WorkflowHistoryEntry {
    id: string;
    workspace_id: string;
    resource_id: string;
    action_type: string;
    previous_state_id?: string;
    new_state_id?: string;
    actor_id: string;
    action_timestamp: Date;
    approval_id?: string;
    transition_id?: string;
    comment?: string;
    metadata: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;

}
export interface WorkflowSchedule {
    id: string;
    workspace_id: string;
    resource_id: string;
    schedule_name: string;
    schedule_type: 'cron' | 'interval' | 'once';
    schedule_expression: string;
    action_type: string;
    action_config: Record<string, any>;
    enabled: boolean;
    next_run_at?: Date;
    last_run_at?: Date;
    run_count: number;
    max_runs?: number;
    retry_count: number;
    max_retries: number;
    retry_delay: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;

}
export interface WorkflowExecutionLog {
    id: string;
    schedule_id: string;
    execution_id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    started_at: Date;
    completed_at?: Date;
    result_data: Record<string, any>;
    error_message?: string;
    execution_time_ms?: number;
    retry_attempt: number;
    next_retry_at?: Date;

}
export interface WorkflowStatistics {
    total_states: number;
    total_transitions: number;
    pending_approvals: number;
    active_locks: number;
    scheduled_executions: number;
    resources_by_state: Record<string, number>;
    approval_stats: {
        pending: number;
        approved: number;
        rejected: number;
        cancelled: number;
        avg_approval_time_hours: number;
}
    };
    lock_stats: {
        total_active: number;
        by_type: Record<string, number>;
        avg_lock_duration_hours: number;
    };
    schedule_stats: {
        total_active: number;
        by_type: Record<string, number>;
        successful_executions: number;
        failed_executions: number;
    };

}
export interface StateTransitionRequest {
    resource_id: string;
    to_state_id: string;
    comment?: string;
    metadata?: Record<string, any>;
    force?: boolean;

}
export interface StateTransitionResult {
    success: boolean;
    new_state_id?: string;
    approval_required?: boolean;
    approval_id?: string;
    error?: string;
    workflow_history_id?: string;

}
export interface WorkflowEvent {
    type: 'state_changed' | 'approval_requested' | 'approval_completed' | 'lock_acquired' | 'lock_released' | 'schedule_executed';
    workspace_id: string;
    resource_id: string;
    actor_id: string;
    timestamp: Date;
    data: Record<string, any>;

}
export interface WorkflowConfiguration {
    auto_lock_on_state_change: boolean;
    auto_release_locks_on_completion: boolean;
    require_approval_for_final_states: boolean;
    default_approval_timeout_hours: number;
    max_concurrent_locks_per_resource: number;
    audit_retention_days: number;
    notification_settings: {
        approval_requested: boolean;
        approval_completed: boolean;
        lock_acquired: boolean;
        schedule_failed: boolean;
}
    };

}
export interface WorkflowStateFilter {
    workspace_id?: string;
    is_initial?: boolean;
    is_final?: boolean;
    is_locked?: boolean;
    name_contains?: string;

}
export interface WorkflowApprovalFilter {
    workspace_id?: string;
    resource_id?: string;
    requester_id?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    overdue?: boolean;

}
export interface WorkflowHistoryFilter {
    workspace_id?: string;
    resource_id?: string;
    actor_id?: string;
    action_type?: string;
    date_from?: Date;
    date_to?: Date;
    limit?: number;
    offset?: number;

}
export interface WorkflowLockFilter {
    workspace_id?: string;
    resource_id?: string;
    locked_by?: string;
    lock_type?: 'edit' | 'state_change' | 'delete' | 'custom';
    expired?: boolean;

}
export interface WorkflowScheduleFilter {
    workspace_id?: string;
    resource_id?: string;
    schedule_type?: 'cron' | 'interval' | 'once';
    enabled?: boolean;
    overdue?: boolean;

}
export interface WorkflowComponentProps {
    workspaceId: string;
    currentUserId: string;
    onStateChange?: (newStateId: string) => void;
    onApprovalRequested?: (approvalId: string) => void;
    onLockAcquired?: (lockId: string) => void;
    onLockReleased?: (lockId: string) => void;

}
export interface UseWorkflowReturn {
    states: WorkflowState[];
    transitions: WorkflowTransition[];
    approvals: WorkflowApproval[];
    locks: WorkflowLock[];
    history: WorkflowHistoryEntry[];
    statistics: WorkflowStatistics | null;
    loading: boolean;
    error: string | null;
    transitionState: (resourceId: string, toStateId: string, options?: any) => Promise<StateTransitionResult>;
    approveWorkflow: (approvalId: string, comment?: string) => Promise<StateTransitionResult>;
    rejectWorkflow: (approvalId: string, reason: string) => Promise<boolean>;
    acquireLock: (resourceId: string, lockType?: string, options?: any) => Promise<WorkflowLock>;
    releaseLock: (lockId: string) => Promise<boolean>;
    canTransitionState: (resourceId: string, toStateId: string) => Promise<boolean>;
    isResourceLocked: (resourceId: string, lockType?: string) => Promise<boolean>;
    getResourceState: (resourceId: string) => WorkflowState | null;
    getAvailableTransitions: (currentStateId: string) => WorkflowTransition[];

}
export interface WorkflowApiResponse<T> {
    data: T;
    meta?: {
        total: number;
        page: number;
        limit: number;
        has_more: boolean;
}
    };
    error?: string;

}
export interface WorkflowValidationResult {
    valid: boolean;
    transition?: WorkflowTransition;
    error?: string;
    can_transition?: boolean;
    is_locked?: boolean;

export type WorkflowActionType = 'state_changed' | 'approval_requested' | 'approved' | 'rejected' | 'lock_acquired' | 'lock_released' | 'schedule_executed';
export type WorkflowLockType = 'edit' | 'state_change' | 'delete' | 'custom';
export type WorkflowApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type WorkflowPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkflowScheduleType = 'cron' | 'interval' | 'once';
export type WorkflowExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';
export declare const WORKFLOW_ICONS: {
    readonly DocumentTextIcon: "DocumentTextIcon";
    readonly EyeIcon: "EyeIcon";
    readonly CheckCircleIcon: "CheckCircleIcon";
    readonly GlobeAltIcon: "GlobeAltIcon";
    readonly ArchiveBoxIcon: "ArchiveBoxIcon"
}
  };
export declare const WORKFLOW_COLORS: {
    readonly draft: "#6B7280";
    readonly review: "#F59E0B";
    readonly approved: "#10B981";
    readonly published: "#3B82F6";
    readonly archived: "#8B5CF6";
};
export declare const WORKFLOW_ACTIONS: {
    readonly STATE_CHANGED: "state_changed";
    readonly APPROVAL_REQUESTED: "approval_requested";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly LOCK_ACQUIRED: "lock_acquired";
    readonly LOCK_RELEASED: "lock_released";
    readonly SCHEDULE_EXECUTED: "schedule_executed"
  };
//# sourceMappingURL=workflow.d.ts.map