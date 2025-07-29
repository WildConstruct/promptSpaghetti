export type ActivityEventType = 'project_created' | 'project_updated' | 'project_deleted' | 'resource_created' | 'resource_updated' | 'resource_deleted' | 'comment_added' | 'comment_updated' | 'comment_deleted' | 'member_added' | 'member_removed' | 'member_role_changed' | 'workflow_state_changed' | 'approval_requested' | 'approval_granted' | 'approval_rejected' | 'version_created' | 'branch_created' | 'branch_merged' | 'template_applied' | 'collaboration_started' | 'collaboration_ended';

export interface ActivityEvent {
    id: string;
    workspace_id?: string;
    project_id?: string;
    resource_id?: string;
    actor_id: string;
    actor_name?: string;
    type: ActivityEventType;
    description: string;
    details?: string | Record<string, any>;
    metadata?: {
        project_name?: string;
        resource_name?: string;
        resource_type?: string;
        old_value?: any;
        new_value?: any;
        [key: string]: any;
    };
    resource_url?: string;
    aggregation_key?: string;
    created_at: string;

export interface ActivityStats {
    total: number;
    by_type: Record<ActivityEventType, number>;
    by_actor: Record<string, {
        name: string;
        count: number;
    }>;
    recent_activity: {
        today: number;
        this_week: number;
        this_month: number;
    };
    trends: {
        daily: Array<{,
            date: string;
            count: number;
        }>;
        hourly: Array<{,
            hour: number;
            count: number;
        }>;
    };

export interface ActivityActor {
    id: string;
    name: string;
    avatar_url?: string;
    activity_count: number;
    last_activity: string;

export interface ActivityFilter {
    search?: string;
    type?: ActivityEventType;
    actor_id?: string;
    date_from?: string;
    date_to?: string;
    project_id?: string;
    resource_id?: string;

export interface ActivityListResponse {
    activities: ActivityEvent[];
    total: number;
    has_more: boolean;
    next_cursor?: string;
    stats?: ActivityStats;
    actors?: ActivityActor[];

export interface ActivityEventCreateRequest {
    workspace_id?: string;
    project_id?: string;
    resource_id?: string;
    actor_id: string;
    type: ActivityEventType;
    description: string;
    details?: string | Record<string, any>;
    metadata?: Record<string, any>;
    resource_url?: string;
    aggregation_key?: string;

export interface ActivityRealTimeConnection {
    status: 'connected' | 'connecting' | 'disconnected' | 'error';
    lastConnected?: Date;
    reconnectAttempts: number;
    error?: string;

export interface ActivityRealTimeEvent {
    type: 'activity_created' | 'activity_updated' | 'activity_deleted';
    activity: ActivityEvent;
    timestamp: string;

export interface UseActivityFeedOptions {
    workspaceId?: string;
    projectId?: string;
    userId?: string;
    searchTerm?: string;
    typeFilter?: ActivityEventType;
    dateFilter?: 'today' | 'week' | 'month';
    actorFilter?: string;
    realTime?: boolean;
    limit?: number;

export interface UseActivityFeedReturn {
    activities: ActivityEvent[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    stats: ActivityStats | null;
    actors: ActivityActor[] | null;
    realTimeConnection: ActivityRealTimeConnection | null;
    refreshActivities: () => Promise<void>;
    loadMore: () => Promise<void>;
    createActivity: (activity: ActivityEventCreateRequest) => Promise<void>;

//# sourceMappingURL=ActivityTypes.d.ts.map