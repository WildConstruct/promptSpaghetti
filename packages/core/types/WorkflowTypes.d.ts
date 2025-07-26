export type WorkflowState = 'draft' | 'review' | 'approved' | 'published' | 'archived' | 'rejected';
export type WorkflowAction = 'submit_for_review' | 'approve' | 'reject' | 'publish' | 'archive' | 'return_to_draft';
export interface WorkflowConfig {
    id: string;
    name: string;
    description?: string;
    workspace_id?: string;
    states: WorkflowStateConfig[];
    transitions: WorkflowTransition[];
    default_state: WorkflowState;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export interface WorkflowStateConfig {
    id: WorkflowState;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    is_initial: boolean;
    is_final: boolean;
    required_permissions: string[];
    auto_actions?: WorkflowAutoAction[];
    metadata?: Record<string, any>;
}
export interface WorkflowTransition {
    id: string;
    from_state: WorkflowState;
    to_state: WorkflowState;
    action: WorkflowAction;
    name: string;
    description?: string;
    required_permissions: string[];
    conditions?: WorkflowCondition[];
    auto_conditions?: WorkflowAutoCondition[];
    metadata?: Record<string, any>;
}
export interface WorkflowCondition {
    type: 'permission' | 'approval_count' | 'custom';
    config: Record<string, any>;
    error_message?: string;
}
export interface WorkflowAutoCondition {
    type: 'time_based' | 'field_based' | 'external';
    config: Record<string, any>;
    delay?: number;
}
export interface WorkflowAutoAction {
    type: 'notification' | 'assignment' | 'field_update' | 'webhook';
    config: Record<string, any>;
    delay?: number;
}
export interface WorkflowInstance {
    id: string;
    resource_id: string;
    resource_type: 'project' | 'resource';
    workflow_config_id: string;
    current_state: WorkflowState;
    current_state_entered_at: string;
    assigned_to?: string[];
    metadata?: Record<string, any>;
    history: WorkflowHistoryEntry[];
    created_at: string;
    updated_at: string;
}
export interface WorkflowHistoryEntry {
    id: string;
    from_state?: WorkflowState;
    to_state: WorkflowState;
    action?: WorkflowAction;
    actor_id: string;
    actor_name?: string;
    comment?: string;
    metadata?: Record<string, any>;
    created_at: string;
}
export interface WorkflowTransitionRequest {
    action: WorkflowAction;
    comment?: string;
    metadata?: Record<string, any>;
}
export interface WorkflowStats {
    total_instances: number;
    by_state: Record<WorkflowState, number>;
    by_resource_type: Record<string, number>;
    average_time_in_state: Record<WorkflowState, number>;
    transition_counts: Record<string, number>;
    recent_activity: {
        today: number;
        this_week: number;
        this_month: number;
    };
}
export interface ApprovalRequest {
    id: string;
    workflow_instance_id: string;
    requested_by: string;
    requested_by_name?: string;
    reviewers: ApprovalReviewer[];
    approval_type: 'any' | 'all' | 'majority';
    due_date?: string;
    message?: string;
    metadata?: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approved_at?: string;
    rejected_at?: string;
    created_at: string;
    updated_at: string;
}
export interface ApprovalReviewer {
    user_id: string;
    user_name?: string;
    user_email?: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    responded_at?: string;
}
export interface ApprovalResponse {
    decision: 'approve' | 'reject';
    comment?: string;
    metadata?: Record<string, any>;
}
export interface ResourceLock {
    id: string;
    resource_id: string;
    resource_type: 'project' | 'resource' | 'node' | 'region';
    lock_type: 'read' | 'write' | 'exclusive';
    locked_by: string;
    locked_by_name?: string;
    reason?: string;
    expires_at?: string;
    auto_release: boolean;
    metadata?: Record<string, any>;
    created_at: string;
}
export interface LockRequest {
    resource_id: string;
    resource_type: 'project' | 'resource' | 'node' | 'region';
    lock_type: 'read' | 'write' | 'exclusive';
    reason?: string;
    duration?: number;
    auto_release?: boolean;
    metadata?: Record<string, any>;
}
export interface AuditLogEntry {
    id: string;
    resource_id?: string;
    resource_type?: string;
    actor_id: string;
    actor_name?: string;
    action: string;
    description: string;
    details?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    categories: string[];
    created_at: string;
}
export interface AuditFilter {
    resource_id?: string;
    resource_type?: string;
    actor_id?: string;
    action?: string;
    risk_level?: string;
    categories?: string[];
    date_from?: string;
    date_to?: string;
    search?: string;
}
export interface WorkflowWebhook {
    id: string;
    workflow_config_id: string;
    name: string;
    url: string;
    secret?: string;
    events: WorkflowWebhookEvent[];
    headers?: Record<string, string>;
    is_active: boolean;
    retry_config: {
        max_retries: number;
        backoff_factor: number;
        max_delay: number;
    };
    created_at: string;
    updated_at: string;
}
export interface WorkflowWebhookEvent {
    event_type: 'state_changed' | 'approval_requested' | 'approved' | 'rejected';
    conditions?: Record<string, any>;
}
export interface WebhookDeliveryLog {
    id: string;
    webhook_id: string;
    event_type: string;
    payload_hash: string;
    response_status?: number;
    response_body?: string;
    error_message?: string;
    delivered_at?: string;
    retry_count: number;
    created_at: string;
}
export interface ScheduledExecution {
    id: string;
    name: string;
    description?: string;
    resource_id: string;
    resource_type: 'project' | 'resource';
    schedule_type: 'cron' | 'interval' | 'one_time';
    schedule_config: {
        cron_expression?: string;
        interval_seconds?: number;
        execute_at?: string;
    };
    action_type: 'workflow_transition' | 'approval_request' | 'custom';
    action_config: Record<string, any>;
    is_active: boolean;
    last_executed_at?: string;
    next_execution_at?: string;
    execution_count: number;
    failure_count: number;
    created_at: string;
    updated_at: string;
}
export interface ExecutionResult {
    id: string;
    scheduled_execution_id: string;
    status: 'success' | 'failure' | 'partial';
    result_data?: Record<string, any>;
    error_message?: string;
    execution_time_ms: number;
    executed_at: string;
}
export interface UseWorkflowReturn {
    instance: WorkflowInstance | null;
    config: WorkflowConfig | null;
    loading: boolean;
    error: Error | null;
    transition: (request: WorkflowTransitionRequest) => Promise<WorkflowInstance>;
    refreshInstance: () => Promise<void>;
    availableTransitions: WorkflowTransition[];
    canTransition: (action: WorkflowAction) => boolean;
    currentStateConfig: WorkflowStateConfig | null;
}
export interface UseWorkflowStatsReturn {
    stats: WorkflowStats | null;
    loading: boolean;
    error: Error | null;
    refreshStats: () => Promise<void>;
}
//# sourceMappingURL=WorkflowTypes.d.ts.map