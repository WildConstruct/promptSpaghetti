/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Verification Analytics Interface - E17-1753114397393-BA8A32
 *
 * Analytics and reporting interface for verification system performance
 * Part of Epic 17.5.5 - Verification System
 */
import React from 'react';

}
}
export interface VerificationAnalyticsData { period: {
        start: Date;
        end: Date;
        label: string }
}
    };
    overview: { totalRequests: number;
        approvedRequests: number;
        rejectedRequests: number;
        pendingRequests: number;
        averageProcessingTime: number;
        approvalRate: number };
    requestsByType: Array<{ type: string;
        count: number;
        approvalRate: number;
        averageProcessingTime: number }>;
    processingTrends: Array<{ date: Date;
        requests: number;
        approved: number;
        rejected: number;
        averageTime: number }>;
    trustScoreDistribution: Array<{ range: string;
        count: number;
        percentage: number }>;
    riskAnalysis: { highRiskUsers: number;
        flaggedDocuments: number;
        fraudAttempts: number;
        suspendedAccounts: number };
    performanceMetrics: { slaCompliance: number;
        qualityScore: number;
        reviewerProductivity: number;
        systemUptime: number };

}
}
export interface VerificationAnalyticsProps {
    className?: string;

export declare const VerificationAnalytics: React.FC<VerificationAnalyticsProps>;
export default VerificationAnalytics;
//# sourceMappingURL=VerificationAnalytics.d.ts.map
}
}