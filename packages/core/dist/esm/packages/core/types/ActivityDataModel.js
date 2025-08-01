/**
 * Activity Data Model
 * Epic 17.4 - System Configuration & Monitoring
 * Task: E17-1753114397068-6657F3
 *
 * Comprehensive activity tracking data model for monitoring user actions,
 * system events, and administrative activities across the platform.
 */
;
// Timing Information
duration ?  : number; // milliseconds
startTime ?  : string;
endTime ?  : string;
// Metadata
metadata: Record;
tags: string;
// Change Tracking
changes ?  : ActivityChange;
// Error Information (for failed activities)
error ?  : {
    code: string,
    message: string,
    stack: string,
    details: (Record)
};
// Audit Trail
createdAt: string;
updatedAt ?  : string;
version: number;
facets ?  : Record;
executionTime: number;
 > ;
topSources: Array < {
    source: string,
    count: number,
    percentage: number
} > ;
topActions: Array < {
    action: string,
    count: number,
    percentage: number
} > ;
topUsers: Array < {
    userId: string,
    userEmail: string,
    count: number,
    percentage: number
} > ;
errorRate: number;
averageDuration: number;
performanceMetrics: {
    p50: number;
    p95: number;
    p99: number;
}
;
// Default configurations
export const DEFAULT_ACTIVITY_RETENTION_DAYS = 90;
export const DEFAULT_ACTIVITY_PAGE_SIZE = 50;
export const MAX_ACTIVITY_PAGE_SIZE = 1000;
// Activity type display configurations
export const ACTIVITY_TYPE_LABELS = {
    user_action: 'User Action',
    system_event: 'System Event',
    admin_action: 'Admin Action',
    security_event: 'Security Event',
    api_call: 'API Call',
    data_change: 'Data Change',
    error_event: 'Error Event',
    performance_event: 'Performance Event',
    authentication: 'Authentication',
    authorization: 'Authorization',
    file_operation: 'File Operation',
    workflow_event: 'Workflow Event',
};
export const ACTIVITY_SEVERITY_COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#65a30d',
    info: '#2563eb',
};
