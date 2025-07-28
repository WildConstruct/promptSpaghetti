/**
 * Epic 9.3.3 - Version Restore Manager
 * Handles version restoration with conflict detection, preview, and selective restore capabilities
 */
export interface RestoreOptions {
    create_backup?: boolean;
    backup_title?: string;
    restore_mode?: 'full' | 'selective' | 'merge';
    conflict_resolution?: 'abort' | 'overwrite' | 'merge' | 'prompt';
    preserve_current_changes?: boolean;
    restore_metadata?: boolean;
    restore_workflow_state?: boolean;
    notify_collaborators?: boolean;
}
export interface RestoreConflict {
    id: string;
    type: 'data_conflict' | 'workflow_conflict' | 'permission_conflict' | 'dependency_conflict';
    element_id: string;
    element_type: 'node' | 'edge' | 'property' | 'metadata';
    description: string;
    current_value: any;
    restore_value: any;
    suggested_resolution: 'keep_current' | 'use_restore' | 'merge' | 'manual';
    severity: 'low' | 'medium' | 'high' | 'critical';
    auto_resolvable: boolean;
}
export interface RestorePreview {
    restore_id: string;
    snapshot_id: string;
    conflicts: RestoreConflict;
    changes_summary: {
        nodes_to_add: number;
        nodes_to_remove: number;
        nodes_to_modify: number;
        edges_to_add: number;
        edges_to_remove: number;
        edges_to_modify: number;
        properties_to_change: number;
    };
    estimated_duration: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    backup_required: boolean;
    collaborator_impact: {
        active_users: string;
        potential_conflicts: string;
        recommended_actions: string;
    };
}
export interface RestoreResult {
    success: boolean;
    restore_id: string;
    backup_snapshot_id?: string;
    conflicts_resolved: number;
    conflicts_remaining: number;
    changes_applied: {
        nodes_added: number;
        nodes_removed: number;
        nodes_modified: number;
        edges_added: number;
        edges_removed: number;
        edges_modified: number;
        properties_changed: number;
    };
    duration_ms: number;
    warnings: string;
    errors: string;
}
export interface RestoreState {
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    current_step: string;
    total_steps: number;
    completed_steps: number;
    started_at: string;
    completed_at?: string;
    error_message?: string;
}
export declare class VersionRestoreManager {
    private activeRestores;
    private restoreHistory;
    constructor();
    private apiClient;
    private projectId;
    private userId;
    private versionHistoryManager;
}
//# sourceMappingURL=VersionRestoreManager.d.ts.map