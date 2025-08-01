/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Analytics dashboard props
 */

}
}
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
}
}