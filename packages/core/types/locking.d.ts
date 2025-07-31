export interface WorkflowLock {
    id: string;
    workspace_id: string;
    resource_id: string;
    locked_by: string;
    lock_type: 'edit' | 'state_change' | 'delete' | 'admin' | 'custom';
    lock_reason?: string;
    locked_at: string;
    expires_at?: string;
    auto_release: boolean;
    metadata?: Record<string, any>;

}
export interface LockRequest {
    resource_id: string;
    user_id: string;
    lock_type: 'edit' | 'state_change' | 'delete' | 'admin' | 'custom';
    scope: 'resource' | 'project' | 'workspace';
    reason?: string;
    duration_minutes?: number;
    force?: boolean;
    metadata?: Record<string, any>;

}
export interface LockPolicy {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    max_locks_per_user: number;
    max_locks_per_resource: number;
    default_duration_minutes: number;
    max_duration_minutes: number;
    auto_lock_on_edit: boolean;
    auto_lock_on_state_change: boolean;
    auto_lock_duration_minutes: number;
    allow_lock_breaking: boolean;
    lock_breaking_roles: string[];
    require_justification: boolean;
    conflict_resolution_strategy: 'queue' | 'reject' | 'notify' | 'escalate';
    escalation_timeout_minutes: number;
    created_at: string;
    updated_at: string;

}
export interface LockConflict {
    id: string;
    resource_id: string;
    requesting_user_id: string;
    blocking_lock_id: string;
    conflict_type: 'same_type' | 'incompatible' | 'exclusive';
    resolution_strategy: 'queue' | 'reject' | 'notify' | 'escalate';
    status: 'pending' | 'resolved' | 'rejected';
    created_at: string;
    resolved_at?: string;
    resolution_action?: string;

}
export interface LockQueue {
    id: string;
    resource_id: string;
    user_id: string;
    lock_type: string;
    priority: number;
    queued_at: string;
    estimated_wait_time?: number;
    notification_sent: boolean;

}
export interface LockNotification {
    id: string;
    user_id: string;
    lock_id?: string;
    resource_id: string;
    notification_type: 'acquired' | 'released' | 'broken' | 'conflict' | 'queue_position' | 'expiring';
    title: string;
    message: string;
    action_url?: string;
    sent_at: string;
    read_at?: string;
    metadata: Record<string, any>;

}
export interface LockingStatistics {
    total_locks: number;
    active_locks: number;
    expired_locks: number;
    broken_locks: number;
    by_type: Record<string, number>;
    by_user: Record<string, number>;
    avg_lock_duration_minutes: number;
    conflict_rate: number;
    most_contended_resources: Array<{
        resource_id: string;
        conflict_count: number;
        avg_wait_time: number;
}
    }>;

}
export interface LockingState {
    locks: WorkflowLock[];
    conflicts: LockConflict[];
    queue: LockQueue[];
    notifications: LockNotification[];
    statistics: LockingStatistics;
    policy: LockPolicy | null;
    isLoading: boolean;
    error: string | null;

}
export interface LockingActions {
    fetchLocks: (workspaceId: string) => Promise<void>;
    acquireLock: (request: LockRequest) => Promise<{,
        success: boolean;
        error?: string;
}
    }>;
    releaseLock: (lockId: string, userId: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    breakLock: (lockId: string, userId: string, justification?: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    fetchConflicts: (workspaceId: string, status?: string) => Promise<void>;
    resolveLockConflict: (conflictId: string, resolution: string, userId: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    fetchQueue: (workspaceId: string) => Promise<void>;
    removeFromQueue: (queueId: string, userId: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    fetchNotifications: (userId: string, unreadOnly?: boolean) => Promise<void>;
    markNotificationAsRead: (notificationId: string) => Promise<{,
        success: boolean;
        error?: string;
    }>;
    fetchStatistics: (workspaceId: string) => Promise<void>;
    fetchPolicy: (workspaceId: string) => Promise<void>;
    updatePolicy: (workspaceId: string, policy: Partial<LockPolicy>) => Promise<{
        success: boolean;
        error?: string;
    }>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;

//# sourceMappingURL=locking.d.ts.map