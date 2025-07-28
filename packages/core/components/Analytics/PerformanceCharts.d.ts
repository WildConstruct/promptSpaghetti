import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Performance charts props
 */

export interface PerformanceChartsProps {
    analyticsClient: AnalyticsClient;
    timeRange: {,
        startTime: number;
        endTime: number;
    };
    userId?: number;
    organizationId?: number;
/**
 * Performance charts component
 */
export declare const PerformanceCharts: React.FC<PerformanceChartsProps>;
export default PerformanceCharts;
//# sourceMappingURL=PerformanceCharts.d.ts.map