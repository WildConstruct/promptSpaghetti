import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Analytics dashboard props
 */

export interface AnalyticsDashboardProps {
    analyticsClient: AnalyticsClient;
    userId?: number;
    organizationId?: number;
    className?: string;
    autoRefresh?: boolean;
    refreshInterval?: number;


/**
 * Main analytics dashboard component
 */
export declare const AnalyticsDashboard: React.FC<AnalyticsDashboardProps>;
export default AnalyticsDashboard;
//# sourceMappingURL=AnalyticsDashboard.d.ts.map