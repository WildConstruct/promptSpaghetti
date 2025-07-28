import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Cost analysis props
 */
export interface CostAnalysisProps {
    analyticsClient: AnalyticsClient;
    timeRange: {,
        startTime: number;
        endTime: number;
    };
    userId?: number;
    organizationId?: number;
}
/**
 * Cost analysis component
 */
export declare const CostAnalysis: React.FC<CostAnalysisProps>;
export default CostAnalysis;
//# sourceMappingURL=CostAnalysis.d.ts.map