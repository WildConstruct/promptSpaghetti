import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Usage patterns props
 */
export interface UsagePatternsProps {
    analyticsClient: AnalyticsClient;
    timeRange: {
        startTime: number;
        endTime: number;
    };
    userId?: number;
    organizationId?: number;
}
export declare const UsagePatterns: React.FC<UsagePatternsProps>;
//# sourceMappingURL=UsagePatterns.d.ts.map