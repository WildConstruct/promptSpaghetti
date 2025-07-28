/**
 * Verification Analytics Interface - E17-1753114397393-BA8A32
 *
 * Analytics and reporting interface for verification system performance
 * Part of Epic 17.5.5 - Verification System
 */
import React from 'react';
export interface VerificationAnalyticsData {
    period: {
        start: Date;
        end: Date;
        label: string;
    };
    overview: {
        totalRequests: number;
        approvedRequests: number;
        rejectedRequests: number;
        pendingRequests: number;
        averageProcessingTime: number;
        approvalRate: number;
    };
    requestsByType: Array<{}, type>;
    string: any;
    count: number;
    approvalRate: number;
    averageProcessingTime: number;
}
export interface VerificationAnalyticsProps {
    className?: string;
}
export declare const VerificationAnalytics: React.FC<VerificationAnalyticsProps>;
export default VerificationAnalytics;
//# sourceMappingURL=VerificationAnalytics.d.ts.map