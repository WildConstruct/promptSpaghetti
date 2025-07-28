import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Export options props
 */
export interface ExportOptionsProps {
    analyticsClient: AnalyticsClient;
    timeRange: {
        startTime: number;
        endTime: number;
    };
    className?: string;
}
export declare const ExportOptions: React.FC<ExportOptionsProps>;
//# sourceMappingURL=ExportOptions.d.ts.map