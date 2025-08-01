/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

import React from 'react';
import { AnalyticsClient } from '../../analytics/AnalyticsClient';
/**
 * Recommendations panel props
 */

}
}
export interface RecommendationsPanelProps {
    recommendations: unknown[];
    analyticsClient: AnalyticsClient;
    userId?: number;
    organizationId?: number;
    onRefresh?: () => void;
    className?: string;


/**
 * Recommendations panel component
 */
export declare const RecommendationsPanel: React.FC<RecommendationsPanelProps>;
export default RecommendationsPanel;
//# sourceMappingURL=RecommendationsPanel.d.ts.map
}
}