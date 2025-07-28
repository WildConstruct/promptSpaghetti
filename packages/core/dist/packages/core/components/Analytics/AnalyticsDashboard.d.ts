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
}
export declare const AnalyticsDashboard: React.FC<AnalyticsDashboardProps>;
//# sourceMappingURL=AnalyticsDashboard.d.ts.map