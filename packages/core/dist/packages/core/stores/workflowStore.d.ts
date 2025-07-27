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
    conditions: Record<string, unknown>;
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
    created_at: Date;
    updated_at: Date;
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
    metadata: Record<string, unknown>;
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
    metadata: Record<string, unknown>;
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
export interface StateTransitionResult {
    success: boolean;
    new_state_id?: string;
    approval_required?: boolean;
    approval_id?: string;
    error?: string;
    workflow_history_id?: string;
}
export declare const states: any;
//# sourceMappingURL=workflowStore.d.ts.map