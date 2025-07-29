/**
 * Epic 9.3.1 - Version History Manager
 * Manages version snapshots, branching, and change tracking for projects
 */

export interface VersionSnapshot {
    id: string;
    project_id: string;
    branch_name: string;
    version_number: number;
    version_tag?: string;
    title?: string;
    description?: string;
    changelog?: string;
    s3_uri: string;
    size_bytes: number;
    checksum: string;
    compression_format: string;
    created_by: string;
    created_at: string;
    snapshot_type: 'manual' | 'auto' | 'milestone' | 'backup';
    trigger_event?: string;
    parent_snapshot_id?: string;
    node_count: number;
    edge_count: number;
    complexity_score?: number;
    workflow_state: string;
    approval_status?: string;

export interface VersionDiff {
    id: string;
    from_snapshot_id: string;
    to_snapshot_id: string;
    diff_type: 'incremental' | 'full' | 'structural';
    diff_format: 'json' | 'binary' | 'text';
    diff_data: any;
    diff_summary: {
        total_changes: number;
        added: number;
        removed: number;
        modified: number;
        complexity: number;
    };
    similarity_score: number;
    created_at: string;

export interface Branch {
    id: string;
    project_id: string;
    name: string;
    description?: string;
    branch_type: 'main' | 'feature' | 'hotfix' | 'experiment' | 'archive';
    head_snapshot_id?: string;
    is_active: boolean;
    is_protected: boolean;
    parent_branch_id?: string;
    merge_base_snapshot_id?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    visibility: 'private' | 'workspace' | 'public';
    total_commits: number;

export interface ChangeEvent {
    id: string;
    project_id: string;
    snapshot_id?: string;
    event_type: string;
    event_data: any;
    event_sequence: number;
    author_id: string;
    author_name: string;
    session_id?: string;
    occurred_at: string;
    recorded_at: string;
    client_info?: any;
    workspace_id?: string;
    affected_nodes: string[];
    affected_properties: string[];
    change_magnitude: number;
    workflow_state?: string;
    approval_required: boolean;

export interface VersionAnnotation {
    id: string;
    snapshot_id: string;
    annotation_type: 'comment' | 'review' | 'approval' | 'flag';
    title?: string;
    content_markdown: string;
    content_html?: string;
    author_id: string;
    created_at: string;
    updated_at: string;
    status: 'active' | 'resolved' | 'archived';
    priority: 'low' | 'normal' | 'high' | 'critical';
    target_element_id?: string;
    target_coordinates?: {
        x: number;
        y: number;
    };
    resolved_by?: string;
    resolved_at?: string;
    resolution_note?: string;

export interface VersionHistoryFilter {
    branch_name?: string;
    author_id?: string;
    start_date?: string;
    end_date?: string;
    snapshot_type?: string;
    limit?: number;
    offset?: number;
    include_annotations?: boolean;

export interface SnapshotCreationOptions {
    title?: string;
    description?: string;
    changelog?: string;
    snapshot_type?: 'manual' | 'auto' | 'milestone' | 'backup';
    trigger_event?: string;
    version_tag?: string;
    workflow_state?: string;
    approval_status?: string;

export declare class VersionHistoryManager {
    private apiClient;
    private projectId;
    private userId;
    private snapshots;
    private branches;
    private changeEvents;
    private currentSessionId;
    constructor(apiClient: any, projectId: string, userId: string);
    createSnapshot(graphData: any, options?: SnapshotCreationOptions): Promise<VersionSnapshot>;
    getSnapshots(filter?: VersionHistoryFilter): Promise<{
        snapshots: VersionSnapshot[];
        total: number;
    }>;
    getSnapshot(snapshotId: string): Promise<VersionSnapshot>;
    getSnapshotData(snapshotId: string): Promise<any>;
    deleteSnapshot(snapshotId: string): Promise<void>;
    compareFreshSnapshots(fromSnapshotId: string, toSnapshotId: string): Promise<VersionDiff>;
    getSnapshotDiff(fromSnapshotId: string, toSnapshotId: string): Promise<VersionDiff>;
    private computeDiff;
    createBranch(name: string, options?: {)
        description?: string;
        branch_type?: 'feature' | 'hotfix' | 'experiment';
        parent_branch_id?: string;
        base_snapshot_id?: string;
        visibility?: 'private' | 'workspace' | 'public'
  }): Promise<Branch>;
    getBranches(): Promise<Branch[]>;
    switchBranch(branchName: string): Promise<Branch>;
    mergeBranch(sourceBranchId: string, targetBranchId: string, options?: {)
        merge_message?: string;
        strategy?: 'merge' | 'squash' | 'rebase';
        delete_source?: boolean;
    }): Promise<VersionSnapshot>;
    recordChangeEvent(event: {)
        event_type: string;
        event_data: any;
        affected_nodes: string[];
        change_magnitude: number;
        workflow_state?: string;
        approval_required?: boolean;
    }): Promise<ChangeEvent>;
    getChangeEvents(filter?: {)
        start_date?: string;
        end_date?: string;
        author_id?: string;
        event_types?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{
        events: ChangeEvent[];
        total: number;
    }>;
    addAnnotation(snapshotId: string, annotation: {)
        annotation_type?: 'comment' | 'review' | 'approval' | 'flag';
        title?: string;
        content_markdown: string;
        priority?: 'low' | 'normal' | 'high' | 'critical';
        target_element_id?: string;
        target_coordinates?: {
            x: number;
            y: number;
        };
    }): Promise<VersionAnnotation>;
    getAnnotations(snapshotId: string): Promise<VersionAnnotation[]>;
    resolveAnnotation(annotationId: string, resolutionNote?: string): Promise<VersionAnnotation>;
    private extractNodeIds;
    private extractAffectedProperties;
    private calculateChangeMagnitude;
    getVersionStatistics(): Promise<{
        total_snapshots: number;
        total_branches: number;
        total_changes: number;
        most_active_authors: Array<{,
            author_id: string;
            change_count: number;
        }>;
        change_frequency: Array<{,
            date: string;
            count: number;
        }>;
        branch_activity: Array<{,
            branch_name: string;
            snapshot_count: number;
        }>;
    }>;
    startNewSession(): void;
    cleanupOldData(options?: {)
        days_old?: number;
        keep_milestones?: boolean;
        keep_tagged_versions?: boolean;
    }): Promise<{
        deleted_snapshots: number;
        deleted_diffs: number;
    }>;

//# sourceMappingURL=VersionHistoryManager.d.ts.map