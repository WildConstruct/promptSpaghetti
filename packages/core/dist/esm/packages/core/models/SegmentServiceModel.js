 > ;
executionTime: number;
 > ;
;
// Evaluation metrics
totalEvaluations: number;
averageEvaluationTime: number;
evaluationSuccessRate: number;
// User metrics
peakUserCount: number;
averageUserCount: number;
userChurnRate: number;
userGrowthRate: number;
// Condition performance
conditionPerformance: Array;
// System metrics
memoryUsage: number; // bytes,
cpuUsage: number; // percentage
cacheUsage: number; // percentage
// Business metrics
conversionImpact: number;
revenueImpact: number;
engagementImpact: number;
;
// Implementation
actionable: boolean;
automatable: boolean;
estimatedEffort: 'low' | 'medium' | 'high';
// Supporting data
supportingSegments ?  : string;
supportingMetrics ?  : Record;
confidence: number; // 0-1
// Metadata
generatedAt: Date;
generatedBy: 'system' | 'ml_model' | 'user_request';
modelVersion ?  : string;
 > ;
// Status and lifecycle
status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
startDate: Date;
endDate ?  : Date;
duration ?  : number; // days
// Metrics and goals
primaryMetric: string;
secondaryMetrics: string;
successCriteria: Array;
// Results
results ?  : {
    variants: (Array),
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
executionHistory: Array;
 > ;
// Consent management
requiresConsent: boolean;
consentTypes: string;
consentValidation: Array;
// Audit requirements
auditTrail: boolean;
auditRetention: number; // days
complianceReporting: boolean;
;
// Sync settings
syncDirection: 'outbound' | 'inbound' | 'bidirectional';
syncFrequency: 'realtime' | 'batch' | 'scheduled';
batchSize ?  : number;
schedule ?  : string; // cron expression
// Data mapping
fieldMappings: Array;
// Status and monitoring
isActive: boolean;
lastSync ?  : Date;
syncStatus: 'healthy' | 'degraded' | 'failed';
errorCount: number;
// Performance
syncHistory: Array;
deleteSegment(id, string, options ?  : { force: boolean });
Promise;
getSegment(id, string, options ?  : { includeAnalytics: boolean });
Promise;
querySegments(query, SegmentQuery);
Promise < {
    segments: UserSegment,
    totalCount: number,
    hasMore: boolean
} > ;
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
Promise;
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
Promise;
export {};
