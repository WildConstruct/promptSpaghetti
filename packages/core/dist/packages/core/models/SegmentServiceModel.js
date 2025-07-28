 > ;
executionTime: number;
'size_change' | 'performance_degradation' | 'condition_mismatch';
severity: 'low' | 'medium' | 'high';
description: string;
recommendation ?  : string;
 > ;
 > ;
// System metrics
memoryUsage: number; // bytes,
cpuUsage: number; // percentage
cacheUsage: number; // percentage
// Business metrics
conversionImpact: number;
revenueImpact: number;
engagementImpact: number;
 > ;
// Status and lifecycle
status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
startDate: Date;
endDate ?  : Date;
duration ?  : number; // days
// Metrics and goals
primaryMetric: string;
secondaryMetrics: string;
successCriteria: Array < {
    metric: string,
    operator: 'greater_than' | 'less_than' | 'between',
    value: number | [number, number],
    significance: number
} > ;
// Results
results ?  : {
    variants: Array < {
        variantId: string,
        userCount: number,
        metrics: (Record),
        conversionRate: number,
        confidence: number } > ,
    winner: string,
    significance: number,
    liftPercentage: number
};
// Metadata
createdBy: string;
createdAt: Date;
lastUpdated: Date;
 > ;
// Target segments
targetSegments: string;
// Execution settings
schedule: string; // cron expression,
isActive: boolean;
// Status and monitoring
lastRun ?  : Date;
nextRun ?  : Date;
status: 'idle' | 'running' | 'failed' | 'disabled';
// Performance
executionHistory: Array < {
    startTime: Date,
    endTime: Date,
    recordsProcessed: number,
    recordsSuccessful: number,
    recordsFailed: number,
    status: 'success' | 'partial' | 'failed',
    errorMessage: string
} > ;
 > ;
// Consent management
requiresConsent: boolean;
consentTypes: string;
consentValidation: Array < {
    condition: string,
    errorMessage: string
} > ;
// Audit requirements
auditTrail: boolean;
auditRetention: number; // days
complianceReporting: boolean;
 > ;
// Status and monitoring
isActive: boolean;
lastSync ?  : Date;
syncStatus: 'healthy' | 'degraded' | 'failed';
errorCount: number;
// Performance
syncHistory: Array < {
    startTime: Date,
    endTime: Date,
    recordsSynced: number,
    recordsSuccessful: number,
    recordsFailed: number,
    status: 'success' | 'partial' | 'failed',
    errorMessage: string
} > ;
 > ;
// Segment evaluation
evaluateSegment(segmentId, string, options ?  : { userId: string });
Promise;
evaluateUserForSegments(userId, string, segmentIds ?  : string);
Promise;
// Membership management
addUserToSegment(userId, string, segmentId, string, options ?  : { source: string });
Promise;
removeUserFromSegment(userId, string, segmentId, string);
Promise;
getUserSegments(userId, string);
Promise;
getSegmentUsers(segmentId, string, options ?  : { limit: number, offset: number });
Promise < {
    users: SegmentMembership,
    totalCount: number
} > ;
// Analytics and insights
getSegmentAnalytics(segmentId, string, timeRange ?  : { start: Date, end: Date });
Promise;
getSegmentPerformanceMetrics(segmentId, string);
Promise;
generateSegmentRecommendations(segmentId ?  : string);
Promise;
// Bulk operations
bulkEvaluateSegments(segmentIds, string);
Promise;
bulkUpdateSegments(updates, (Array));
Promise;
// Export and import
exportSegment(segmentId, string, format, 'csv' | 'json', options ?  : {});
includeFields ?  : string;
maxRecords ?  : number;
Promise;
importSegmentUsers(segmentId, string, data, any, options ?  : {});
format: 'csv' | 'json';
mergeStrategy: 'replace' | 'append' | 'merge';
Promise;
// A/B testing integration
createExperiment(experiment, (Omit));
Promise;
getExperimentResults(experimentId, string);
Promise;
// System operations
optimizeSegment(segmentId, string);
Promise;
validateSegment(segmentId, string);
Promise < {
    isValid: boolean,
    errors: string,
    warnings: string
} > ;
getSystemHealth();
Promise < {
    status: 'healthy' | 'degraded' | 'unhealthy',
    metrics: (Record),
    issues: string
} > ;
export {};
