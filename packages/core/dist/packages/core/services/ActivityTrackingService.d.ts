/**
 * Activity Tracking Service
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Service for tracking, storing, and querying activity data across the platform.
 * Provides comprehensive activity monitoring with real-time streaming and analytics.
 */
import { Activity, ActivityQuery, ActivityQueryResult, ActivityMetrics, ActivityStream, ActivityStreamEvent, ActivityRetentionPolicy } from '../types/ActivityDataModel';
export interface ActivityStorage {
    create(activity: Activity): Promise<Activity>;
    findById(id: string): Promise<Activity | null>;
    query(query: ActivityQuery): Promise<ActivityQueryResult>;
    update(id: string, updates: Partial<Activity>): Promise<Activity>;
    delete(id: string): Promise<boolean>;
    bulkCreate(activities: Activity): Promise<Activity>;
    getMetrics(query: ActivityQuery): Promise<ActivityMetrics>;
}
export interface ActivityStreaming {
    createStream(filters: ActivityQuery): Promise<ActivityStream>;
    destroyStream(subscriptionId: string): Promise<boolean>;
    publishActivity(activity: Activity): Promise<void>;
    subscribe(subscriptionId: string, callback: (event: ActivityStreamEvent) => void): Promise<void>;
    unsubscribe(subscriptionId: string): Promise<void>;
}
export interface ActivityServiceConfig {
    storage: ActivityStorage;
    streaming?: ActivityStreaming;
    enableRealTime?: boolean;
    enableAnalytics?: boolean;
    enableRetention?: boolean;
    retentionPolicies?: ActivityRetentionPolicy;
    maxBatchSize?: number;
    flushInterval?: number;
    enableCompression?: boolean;
    enableEncryption?: boolean;
}
export declare class ActivityTrackingService {
    private config;
    private pendingActivities;
    private flushTimer?;
    private subscribers;
    constructor(config: ActivityServiceConfig);
    description: `API call to ${params.endpoint} returned ${params.statusCode}`;
}
//# sourceMappingURL=ActivityTrackingService.d.ts.map