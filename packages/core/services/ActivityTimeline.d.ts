/**
 * Enhanced User Activity Timeline System - Epic 17
 *
 * Comprehensive activity tracking service that captures user interactions,
 * system events, and collaborative activities with advanced filtering,
 * analytics, and real-time updates.
 *
 * Features:
 * - Real-time activity capture and streaming
 * - Rich activity context and metadata
 * - Advanced filtering and search capabilities
 * - Activity aggregation and analytics
 * - Collaborative activity tracking
 * - Performance monitoring integration
 * - Export and reporting capabilities
 */

export interface ActivityEvent {
    id: string;
    timestamp: Date;
    userId: string;
    userDisplayName?: string;
    userRole?: string;
    type: ActivityType;
    category: ActivityCategory;
    action: string;
    resource?: string;
    resourceId?: string;
    title: string;
    description?: string;
    details: ActivityDetails;
    sessionId?: string;
    workspaceId?: string;
    projectId?: string;
    graphId?: string;
    nodeId?: string;
    source: ActivitySource;
    clientInfo?: ClientInfo;
    location?: GeolocationInfo;
    impact: ActivityImpact;
    duration?: number;
    success: boolean;
    errorMessage?: string;
    parentEventId?: string;
    relatedEventIds?: string[];
    causedByEventId?: string;
    collaborators?: string[];
    visibility: ActivityVisibility;
    icon?: string;
    color?: string;
    tags: string[];
    acknowledged?: boolean;
    bookmarked?: boolean;
    archived?: boolean;

export interface ActivityDetails {
    nodeChanges?: NodeChange[];
    connectionChanges?: ConnectionChange[];
    variableChanges?: VariableChange[];
    beforeValue?: unknown;
    afterValue?: unknown;
    diff?: string;
    executionTime?: number;
    memoryUsage?: number;
    cacheHit?: boolean;
    mousePosition?: [number, number];
    keyboardShortcut?: string;
    clickCount?: number;
    fileName?: string;
    fileSize?: number;
    filePath?: string;
    externalId?: string;
    externalSource?: string;
    externalUrl?: string;
    customData?: Record<string, unknown>;

export interface NodeChange {
    nodeId: string;
    nodeType: string;
    changeType: 'created' | 'updated' | 'deleted' | 'moved';
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
    position?: [number, number];

export interface ConnectionChange {
    connectionId: string;
    changeType: 'created' | 'deleted';
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string;
    targetHandle?: string;

export interface VariableChange {
    variableName: string;
    oldValue?: string;
    newValue?: string;
    scope: 'global' | 'local' | 'session';

export interface ClientInfo {
    userAgent: string;
    platform: string;
    browser: string;
    browserVersion: string;
    screenResolution: [number, number];
    viewport: [number, number];
    timezone: string;
    language: string;

export interface GeolocationInfo {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: [number, number];
    timezone: string;

export type ActivityType = 'user_interaction' | 'system_event' | 'graph_operation' | 'file_operation' | 'collaboration' | 'authentication' | 'performance' | 'error' | 'admin' | 'integration';
export type ActivityCategory = 'graph_editing' | 'node_manipulation' | 'execution' | 'file_management' | 'user_management' | 'collaboration' | 'system_health' | 'security' | 'performance' | 'configuration';
export type ActivitySource = 'web_ui' | 'mobile_app' | 'api' | 'cli' | 'webhook' | 'system' | 'background_task' | 'integration';
export type ActivityImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type ActivityVisibility = 'private' | 'team' | 'workspace' | 'public';

export interface ActivityFilter {
    userIds?: string[];
    types?: ActivityType[];
    categories?: ActivityCategory[];
    sources?: ActivitySource[];
    workspaceIds?: string[];
    projectIds?: string[];
    graphIds?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    impactLevels?: ActivityImpact[];
    successOnly?: boolean;
    errorsOnly?: boolean;
    searchQuery?: string;
    tags?: string[];
    hasCollaborators?: boolean;
    hasParent?: boolean;
    hasChildren?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'impact' | 'duration';
    sortDirection?: 'asc' | 'desc';

export interface ActivityStats {
    totalEvents: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    byType: Record<ActivityType, number>;
    byCategory: Record<ActivityCategory, number>;
    bySource: Record<ActivitySource, number>;
    byImpact: Record<ActivityImpact, number>;
    eventsPerHour: Record<string, number>;
    eventsPerDay: Record<string, number>;
    peakActivity: {,
        hour: number;
        count: number;
    };
    mostActiveUsers: Array<{,
        userId: string;
        displayName: string;
        eventCount: number;
        lastActivity: Date;
    }>;
    averageExecutionTime: number;
    errorRate: number;
    cacheHitRate: number;
    collaborativeEvents: number;
    teamsActive: number;
    sharingEvents: number;

export interface ActivitySession {
    id: string;
    userId: string;
    workspaceId?: string;
    projectId?: string;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    eventCount: number;
    uniqueResources: string[];
    clientInfo: ClientInfo;
    location?: GeolocationInfo;
    type: 'work' | 'exploration' | 'collaboration' | 'admin';
    productivity: 'high' | 'medium' | 'low';
    primaryActivities: ActivityType[];
    keyEvents: string[];
    goalsAchieved?: string[];
    tasksCompleted?: string[];
    errorsEncountered?: number;
/**
 * Enhanced Activity Timeline Service
 */
export declare class ActivityTimelineService {
    private static instance;
    private activities;
    private sessions;
    private listeners;
    private currentSession;
    private constructor();
    static getInstance(): ActivityTimelineService;
    /**
     * Track a new activity event
     */
    trackActivity(event: Partial<ActivityEvent>): Promise<ActivityEvent>;
    /**
     * Track a graph operation
     */
    trackGraphOperation(action: string, details: Partial<ActivityDetails> & {)
        nodeChanges?: NodeChange[];
        connectionChanges?: ConnectionChange[];
        variableChanges?: VariableChange[];
    }, userId: string, context?: {
        workspaceId?: string;
        projectId?: string;
        graphId?: string;
    }): Promise<ActivityEvent>;
    /**
     * Track user interaction
     */
    trackUserInteraction(action: string, element: string, details: Partial<ActivityDetails> | undefined, userId: string, context?: Record<string, unknown>): Promise<ActivityEvent>;
    /**
     * Track performance event
     */
    trackPerformance(operation: string, duration: number, success: boolean, details?: Partial<ActivityDetails>, userId?: string): Promise<ActivityEvent>;
    /**
     * Track collaboration event
     */
    trackCollaboration(action: string, collaborators: string[], resource: string, details: Partial<ActivityDetails> | undefined, userId: string, context?: Record<string, unknown>): Promise<ActivityEvent>;
    /**
     * Get activities with filtering
     */
    getActivities(filter?: ActivityFilter): ActivityEvent[];
    /**
     * Get activity statistics
     */
    getActivityStats(filter?: ActivityFilter): ActivityStats;
    /**
     * Get user activity timeline
     */
    getUserTimeline(userId: string, filter?: Partial<ActivityFilter>): ActivityEvent[];
    /**
     * Get collaborative activities
     */
    getCollaborativeActivities(workspaceId?: string, filter?: Partial<ActivityFilter>): ActivityEvent[];
    /**
     * Subscribe to activity events
     */
    subscribe(listenerId: string, callback: (event: ActivityEvent) => void): void;
    /**
     * Unsubscribe from activity events
     */
    unsubscribe(listenerId: string): void;
    /**
     * Start a new user session
     */
    startSession(userId: string, clientInfo: ClientInfo, context?: {)
        workspaceId?: string;
        projectId?: string;
        location?: GeolocationInfo;
    }): ActivitySession;
    /**
     * End current user session
     */
    endSession(): ActivitySession | null;
    private generateEventId;
    private generateSessionId;
    private initializeSession;
    private updateCurrentSession;
    private processEventInsights;
    private analyzeSession;
    private notifyListeners;
    private emitActivity;
    private generateGraphOperationTitle;
    private generateGraphOperationDescription;
    private calculateGraphOperationImpact;
    private generateGraphOperationTags;
    private categorizeUserInteraction;
    private calculatePerformanceImpact;
    private groupByField;
    private startBackgroundProcessing;
    private cleanupOldActivities;
    private processSessionAnalytics;

export declare const activityTimeline: ActivityTimelineService;
export declare const trackActivity: (event: Partial<ActivityEvent>) => Promise<ActivityEvent>;
export declare const trackGraphOperation: (action: string, details: Partial<ActivityDetails>, userId: string, context?: {)
    workspaceId?: string;
    projectId?: string;
    graphId?: string;
}) => Promise<ActivityEvent>;
export declare const trackUserInteraction: (action: string, element: string, details: Partial<ActivityDetails>, userId: string, context?: Record<string, unknown>) => Promise<ActivityEvent>;
export declare const trackPerformance: (operation: string, duration: number, success: boolean, details?: Partial<ActivityDetails>, userId?: string) => Promise<ActivityEvent>;
export declare const getActivities: (filter?: ActivityFilter) => ActivityEvent[];
export declare const getActivityStats: (filter?: ActivityFilter) => ActivityStats;
export declare const getUserTimeline: (userId: string, filter?: Partial<ActivityFilter>) => ActivityEvent[];
//# sourceMappingURL=ActivityTimeline.d.ts.map