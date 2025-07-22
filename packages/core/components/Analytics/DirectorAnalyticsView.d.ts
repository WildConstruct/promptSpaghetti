/**
 * Director Analytics View - E17-1753114397418-21317A
 *
 * Specialized analytics dashboard for film industry professionals
 * focusing on creative workflow optimization and director-specific metrics
 */
import React from 'react';
export interface DirectorAnalyticsViewProps {
    conversionData: any;
    performanceData: any;
    timeRange: {
        startTime: number;
        endTime: number;
    };
    userId?: number;
    loading: boolean;
}
export declare const DirectorAnalyticsView: React.FC<DirectorAnalyticsViewProps>;
export default DirectorAnalyticsView;
//# sourceMappingURL=DirectorAnalyticsView.d.ts.map