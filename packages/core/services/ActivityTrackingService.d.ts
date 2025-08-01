/**
 * Activity Tracking Service
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Service for tracking, storing, and querying activity data across the platform.
 * Provides comprehensive activity monitoring with real-time streaming and analytics.
 */
import { Activity, ActivityQuery, ActivityQueryResult, ActivityMetrics, ActivityStream, ActivityStreamEvent, ActivityRetentionPolicy, ActivitySeverity, BaseActivity } from '../types/ActivityDataModel';

}
}
export interface ActivityStorage { create(activity: Activity): Promise<Activity>;
    findById(id: string): Promise<Activity | null>;
    query(query: ActivityQuery): Promise<ActivityQueryResult>;
    update(id: string, updates: Partial<Activity>): Promise<Activity>;
    delete(id: string): Promise<boolean>;
    bulkCreate(activities: Activity[]): Promise<Activity[]>;
    getMetrics(query: ActivityQuery): Promise<ActivityMetrics> }
}
}
export interface ActivityStreaming { createStream(filters: ActivityQuery): Promise<ActivityStream>;
    destroyStream(subscriptionId: string): Promise<boolean>;
    publishActivity(activity: Activity): Promise<void>;
    subscribe(subscriptionId: string, callback: (event: ActivityStreamEvent) => void): Promise<void>;
    unsubscribe(subscriptionId: string): Promise<void> }
}
}
export interface ActivityServiceConfig { storage: ActivityStorage;
    streaming?: ActivityStreaming;
    enableRealTime?: boolean;
    enableAnalytics?: boolean;
    enableRetention?: boolean;
    retentionPolicies?: ActivityRetentionPolicy[];
    maxBatchSize?: number;
    flushInterval?: number;
    enableCompression?: boolean;
    enableEncryption?: boolean;

export declare class ActivityTrackingService {
    private config;
    private pendingActivities;
    private flushTimer?;
    private subscribers;
    constructor(config: ActivityServiceConfig);
    trackActivity(activity: Partial<BaseActivity>): Promise<Activity>;
    trackUserAction(params: {)
        userId: string;
        userEmail?: string;
        action: string;
        description: string;
        category: string;
        page?: string;
        component?: string;
        metadata?: Record<string, any>;
        severity?: ActivitySeverity }
}
    }): Promise<Activity>;
    trackSystemEvent(params: { )
        source: string;
        action: string;
        description: string;
        category: string;
        severity?: ActivitySeverity;
        systemMetrics?: any;
        metadata?: Record<string, any> }): Promise<Activity>;
    trackAdminAction(params: { )
        adminUserId: string;
        adminLevel: 'super_admin' | 'admin' | 'moderator' | 'support';
        action: string;
        description: string;
        targetUserId?: string;
        resourceType?: string;
        resourceId?: string;
        metadata?: Record<string, any>;
        severity?: ActivitySeverity }): Promise<Activity>;
    trackSecurityEvent(params: { )
        threatType: string;
        threatLevel: 'low' | 'medium' | 'high' | 'critical';
        source: string;
        action: string;
        description: string;
        blocked?: boolean;
        ipAddress?: string;
        userAgent?: string;
        forensicData?: any;
        metadata?: Record<string, any> }): Promise<Activity>;
    trackApiCall(params: { )
        method: string;
        endpoint: string;
        statusCode: number;
        duration: number;
        userId?: string;
        requestSize?: number;
        responseSize?: number;
        metadata?: Record<string, any> }): Promise<Activity>;
    trackPerformanceEvent(params: { )
        source: string;
        metrics: Record<string, number>;
        thresholdViolations?: string[];
        metadata?: Record<string, any> }): Promise<Activity>;
    queryActivities(query: ActivityQuery): Promise<ActivityQueryResult>;
    getMetrics(query: ActivityQuery): Promise<ActivityMetrics>;
    createActivityStream(filters: ActivityQuery): Promise<ActivityStream>;
    subscribeToActivityStream(subscriptionId: string, callback: (event: ActivityStreamEvent) => void): Promise<void>;
    unsubscribeFromActivityStream(subscriptionId: string): Promise<void>;
    updateActivity(id: string, updates: Partial<Activity>): Promise<Activity>;
    getActivity(id: string): Promise<Activity | null>;
    deleteActivity(id: string): Promise<boolean>;
    trackActivities(activities: Partial<BaseActivity>[]): Promise<Activity[]>;
    flush(): Promise<void>;
    shutdown(): Promise<void>;
    private startFlushTimer;
    private generateActivityId;
    private getEnvironment;
    private validateActivity;
    private mapThreatLevelToSeverity;
    private getApiCallSeverity;

export declare function createActivityTrackingService(config: ActivityServiceConfig): ActivityTrackingService;
export declare const DEFAULT_ACTIVITY_CONFIG: Partial<ActivityServiceConfig>;
export default ActivityTrackingService;
//# sourceMappingURL=ActivityTrackingService.d.ts.map