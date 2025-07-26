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
/**
 * Usage patterns component
 */
export declare const UsagePatterns: React.FC<UsagePatternsProps>;
export default UsagePatterns;
//# sourceMappingURL=UsagePatterns.d.ts.map