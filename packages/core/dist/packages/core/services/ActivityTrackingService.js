/**
 * Activity Tracking Service
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Service for tracking, storing, and querying activity data across the platform.
 * Provides comprehensive activity monitoring with real-time streaming and analytics.
 */
export class ActivityTrackingService {
    config;
    pendingActivities = [];
    flushTimer;
    subscribers = new Map();
    constructor(config) {
        this.config = {
            enableRealTime: true,
            enableAnalytics: true,
            enableRetention: true,
            maxBatchSize: 100,
            flushInterval: 5000,
            enableCompression: false,
            enableEncryption: false,
            ...config
        };
        this.startFlushTimer();
    }
    // Core Activity Tracking
    async trackActivity(activity) {
        const fullActivity = {
            id: this.generateActivityId(),
            timestamp: new Date().toISOString(),
            severity: 'info',
            status: 'completed',
            environment: this.getEnvironment(),
            metadata: {},
            tags: [],
            createdAt: new Date().toISOString(),
            version: 1,
            ...activity
        };
        // Validate activity
        this.validateActivity(fullActivity);
        // Add to pending batch
        this.pendingActivities.push(fullActivity);
        // Check if we should flush immediately
        if (this.pendingActivities.length >= (this.config.maxBatchSize || 100) ||
            fullActivity.severity === 'critical') {
            await this.flush();
        }
        // Real-time streaming
        if (this.config.enableRealTime && this.config.streaming) {
            await this.config.streaming.publishActivity(fullActivity);
        }
        return fullActivity;
    }
    // User Activity Tracking
    async trackUserAction(params) {
        return this.trackActivity({
            type: 'user_action',
            userId: params.userId,
            userEmail: params.userEmail,
            action: params.action,
            description: params.description,
            category: params.category,
            source: 'user-interface',
            severity: params.severity || 'info',
            metadata: {
                page: params.page,
                component: params.component,
                ...params.metadata
            }
        });
    }
    // System Event Tracking
    async trackSystemEvent(params) {
        return this.trackActivity({
            type: 'system_event',
            source: params.source,
            action: params.action,
            description: params.description,
            category: params.category,
            severity: params.severity || 'info',
            metadata: {
                systemMetrics: params.systemMetrics,
                ...params.metadata
            }
        });
    }
    // Admin Action Tracking
    async trackAdminAction(params) {
        return this.trackActivity({
            type: 'admin_action',
            userId: params.adminUserId,
            action: params.action,
            description: params.description,
            category: 'administration',
            source: 'admin-panel',
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            severity: params.severity || 'medium',
            metadata: {
                adminLevel: params.adminLevel,
                targetUserId: params.targetUserId,
                ...params.metadata
            }
        });
    }
    // Security Event Tracking
    async trackSecurityEvent(params) {
        return this.trackActivity({
            type: 'security_event',
            action: params.action,
            description: params.description,
            category: 'security',
            source: params.source,
            severity: this.mapThreatLevelToSeverity(params.threatLevel),
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            metadata: {
                threatType: params.threatType,
                threatLevel: params.threatLevel,
                blocked: params.blocked,
                forensicData: params.forensicData,
                ...params.metadata
            }
        });
    }
    // API Call Tracking
    async trackApiCall(params) {
        const severity = this.getApiCallSeverity(params.statusCode, params.duration);
        return this.trackActivity({
            type: 'api_call',
            action: `${params.method} ${params.endpoint}`,
            description: `API call to ${params.endpoint} returned ${params.statusCode}`,
            category: 'api',
            source: 'api-gateway',
            userId: params.userId,
            duration: params.duration,
            severity,
            status: params.statusCode < 400 ? 'completed' : 'failed',
            metadata: {
                method: params.method,
                endpoint: params.endpoint,
                statusCode: params.statusCode,
                requestSize: params.requestSize,
                responseSize: params.responseSize,
                ...params.metadata
            }
        });
    }
    // Performance Event Tracking
    async trackPerformanceEvent(params) {
        const severity = params.thresholdViolations?.length ? 'high' : 'info';
        return this.trackActivity({
            type: 'performance_event',
            action: 'performance_measurement',
            description: `Performance metrics collected from ${params.source}`,
            category: 'performance',
            source: params.source,
            severity,
            metadata: {
                metrics: params.metrics,
                thresholdViolations: params.thresholdViolations,
                ...params.metadata
            }
        });
    }
    // Activity Querying
    async queryActivities(query) {
        return this.config.storage.query(query);
    }
    // Get Activity Metrics
    async getMetrics(query) {
        if (!this.config.enableAnalytics) {
            throw new Error('Analytics is disabled');
        }
        return this.config.storage.getMetrics(query);
    }
    // Real-time Streaming
    async createActivityStream(filters) {
        if (!this.config.enableRealTime || !this.config.streaming) {
            throw new Error('Real-time streaming is disabled');
        }
        return this.config.streaming.createStream(filters);
    }
    async subscribeToActivityStream(subscriptionId, callback) {
        if (!this.config.streaming) {
            throw new Error('Streaming is not configured');
        }
        this.subscribers.set(subscriptionId, callback);
        await this.config.streaming.subscribe(subscriptionId, callback);
    }
    async unsubscribeFromActivityStream(subscriptionId) {
        if (!this.config.streaming) {
            throw new Error('Streaming is not configured');
        }
        this.subscribers.delete(subscriptionId);
        await this.config.streaming.unsubscribe(subscriptionId);
    }
    // Activity Management
    async updateActivity(id, updates) {
        const updatedActivity = await this.config.storage.update(id, {
            ...updates,
            updatedAt: new Date().toISOString(),
            version: (updates.version || 1) + 1
        });
        // Notify subscribers of update
        if (this.config.enableRealTime && this.config.streaming) {
            await this.config.streaming.publishActivity(updatedActivity);
        }
        return updatedActivity;
    }
    async getActivity(id) {
        return this.config.storage.findById(id);
    }
    async deleteActivity(id) {
        return this.config.storage.delete(id);
    }
    // Batch Operations
    async trackActivities(activities) {
        const fullActivities = activities.map(activity => ({
            id: this.generateActivityId(),
            timestamp: new Date().toISOString(),
            severity: 'info',
            status: 'completed',
            environment: this.getEnvironment(),
            metadata: {},
            tags: [],
            createdAt: new Date().toISOString(),
            version: 1,
            ...activity
        }));
        // Validate all activities
        fullActivities.forEach(activity => this.validateActivity(activity));
        // Store in batch
        const storedActivities = await this.config.storage.bulkCreate(fullActivities);
        // Real-time streaming for batch
        if (this.config.enableRealTime && this.config.streaming) {
            for (const activity of storedActivities) {
                await this.config.streaming.publishActivity(activity);
            }
        }
        return storedActivities;
    }
    // Flush pending activities
    async flush() {
        if (this.pendingActivities.length === 0)
            return;
        const activitiesToFlush = [...this.pendingActivities];
        this.pendingActivities = [];
        try {
            await this.config.storage.bulkCreate(activitiesToFlush);
        }
        catch (error) {
            // Re-add activities back to pending if flush fails
            this.pendingActivities.unshift(...activitiesToFlush);
            throw error;
        }
    }
    // Cleanup and shutdown
    async shutdown() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        // Flush any remaining activities
        await this.flush();
        // Close all subscriptions
        for (const subscriptionId of this.subscribers.keys()) {
            await this.unsubscribeFromActivityStream(subscriptionId);
        }
    }
    // Private helper methods
    startFlushTimer() {
        if (this.config.flushInterval) {
            this.flushTimer = setInterval(() => {
                this.flush().catch(error => {
                    console.error('Failed to flush pending activities:', error);
                });
            }, this.config.flushInterval);
        }
    }
    generateActivityId() {
        return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getEnvironment() {
        return process.env.NODE_ENV || 'development';
    }
    validateActivity(activity) {
        if (!activity.id)
            throw new Error('Activity ID is required');
        if (!activity.timestamp)
            throw new Error('Activity timestamp is required');
        if (!activity.type)
            throw new Error('Activity type is required');
        if (!activity.action)
            throw new Error('Activity action is required');
        if (!activity.description)
            throw new Error('Activity description is required');
        if (!activity.source)
            throw new Error('Activity source is required');
    }
    mapThreatLevelToSeverity(threatLevel) {
        switch (threatLevel) {
            case 'low': return 'low';
            case 'medium': return 'medium';
            case 'high': return 'high';
            case 'critical': return 'critical';
            default: return 'medium';
        }
    }
    getApiCallSeverity(statusCode, duration) {
        if (statusCode >= 500)
            return 'high';
        if (statusCode >= 400)
            return 'medium';
        if (duration > 5000)
            return 'medium'; // 5 seconds
        if (duration > 2000)
            return 'low'; // 2 seconds
        return 'info';
    }
}
// Factory function for creating activity tracking service
export function createActivityTrackingService(config) {
    return new ActivityTrackingService(config);
}
// Default configuration
export const DEFAULT_ACTIVITY_CONFIG = {
    enableRealTime: true,
    enableAnalytics: true,
    enableRetention: true,
    maxBatchSize: 100,
    flushInterval: 5000,
    enableCompression: false,
    enableEncryption: false
};
export default ActivityTrackingService;
