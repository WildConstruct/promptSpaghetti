/**
 * Policy Analytics Dashboard - E17-1753114397363-F12F4D
 *
 * Analytics and monitoring interface for policy enforcement
 * Part of Epic 17.5.4 - Policy Enforcement (Backstage Admin Controls)
 */
import React from 'react';

}
}
export interface PolicyAnalyticsMetrics { totalPolicies: number;
    activePolicies: number;
    totalViolations: number;
    violationTrend: 'up' | 'down' | 'stable';
    violationTrendPercentage: number;
    enforcementActions: number;
    actionSuccessRate: number;
    avgResponseTime: number;
    topViolatedCategories: Array<{
        category: string;
        count: number;
        percentage: number }
}
    }>;
    enforcementEffectiveness: Array<{ actionType: string;
        successRate: number;
        count: number }>;
    timeSeriesData: Array<{ date: string;
        violations: number;
        enforcements: number;
        preventions: number }>;

}
}
export interface PolicyAnalyticsDashboardProps {
    className?: string;

export declare const PolicyAnalyticsDashboard: React.FC<PolicyAnalyticsDashboardProps>;
export default PolicyAnalyticsDashboard;
//# sourceMappingURL=PolicyAnalyticsDashboard.d.ts.map
}
}