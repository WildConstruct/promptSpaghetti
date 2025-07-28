export interface UnifiedDashboardConfig {
    enableRealTimeUpdates: boolean;
    autoRefreshInterval: number;
    maxQueueItems: number;
    enableAdvancedFiltering: boolean;
    enablePerformanceTracking: boolean;
    enableMobileModerator: boolean;
    defaultModerationMode: 'manual' | 'assisted' | 'automated';
    escalationThreshold: number;
    workloadDistributionMode: 'round_robin' | 'expertise_based' | 'workload_balanced';
}
export interface DashboardOverview {
    timestamp: Date;
    summary: {
        totalItems: number;
        pendingReview: number;
        autoApproved: number;
        autoRejected: number;
        escalated: number;
        appealed: number;
    };
    queues: {
        highPriority: number;
        mediumPriority: number;
        lowPriority: number;
        automated: number;
    };
    performance: {
        avgProcessingTime: number;
        throughputLast24h: number;
        moderatorEfficiency: number;
        slaCompliance: number;
    };
    alerts: ModerationAlert;
    trends: {
        volumeTrend: 'increasing' | 'decreasing' | 'stable';
        violationTrend: 'increasing' | 'decreasing' | 'stable';
        performanceTrend: 'improving' | 'declining' | 'stable';
    };
}
export interface ModerationAlert {
    id: string;
    type: 'queue_backlog' | 'sla_breach' | 'policy_violation' | 'system_error' | 'performance_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    data?: Record<string, unknown>;
    acknowledged: boolean;
    assignedTo?: string;
}
export interface ModerationWorkload {
    moderatorId: string;
    currentLoad: number;
    capacity: number;
    utilization: number;
    averageResolutionTime: number;
    accuracy: number;
    specializations: string;
    performanceRating: number;
    availabilityWindow: {
        start: string;
        end: string;
        timezone: string;
    };
}
export interface AdvancedSearchQuery {
    contentTypes?: string;
    statuses?: string;
    priorities?: string;
    dateRange?: {
        start: Date;
        end: Date;
    };
    moderators?: string;
    policies?: string;
    confidence?: {
        min: number;
        max: number;
    };
    keywords?: string;
    riskLevel?: string;
    sortBy?: 'date' | 'priority' | 'confidence' | 'risk';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}
export interface BulkModerationAction {
    actionType: 'approve' | 'reject' | 'flag' | 'escalate' | 'assign' | 'prioritize';
    itemIds: string;
    reason?: string;
    assignTo?: string;
    metadata?: Record<string, unknown>;
    scheduledFor?: Date;
}
export interface DashboardMetrics {
    realTime: {
        activeModerators: number;
        itemsBeingReviewed: number;
        averageWaitTime: number;
        systemLoad: number;
    };
    historical: {
        dailyVolume: Array<{
            date: string;
            volume: number;
        }>;
        resolutionTimes: Array<{
            date: string;
            avgTime: number;
        }>;
        accuracyTrends: Array<{
            date: string;
            accuracy: number;
        }>;
        violationTypes: Record<string, number>;
    };
    predictions: {
        expectedVolume24h: number;
        estimatedBacklog: number;
        resourceNeeds: {
            additionalModerators: number;
            peakHours: string;
        };
    };
}
export declare class UnifiedModerationDashboard {
    private config;
    private workflowService;
    private automatedService;
    private statesService;
    private rbacService;
    private analyticsService;
    private realTimeSubscriptions;
    private performanceMetrics;
    private alertQueue;
    constructor(config?: Partial<UnifiedDashboardConfig>);
    /**
     * Initialize all integrated services
     */
    private initializeServices;
    console: any;
    log(: any, this: any, config: any, enableRealTimeUpdates?: any, : any, : any): any;
}
//# sourceMappingURL=UnifiedModerationDashboard.d.ts.map