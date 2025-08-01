/**
 * Security Analytics Dashboard
 * Task T-1752989143998-695: Design security event logging analytics
 *
 * Executive-level security analytics dashboard with real-time threat monitoring,
 * behavioral analysis, and predictive security insights for Wild Construct platform.
 */
import React from 'react';
import { SecurityEventAnalytics, SecurityInsight, SecurityPattern, ThreatCategory } from '../SecurityEventAnalytics';

}
}
export interface SecurityAnalyticsDashboardProps {
    analytics: SecurityEventAnalytics;
    theme?: 'light' | 'dark' | 'cinema';
    refreshInterval?: number;
    executiveMode?: boolean;
    allowedInsights?: ThreatCategory[];
    onThreatDetected?: (threat: SecurityPattern) => void;
    onCriticalAlert?: (insight: SecurityInsight) => void;


/**
 * Comprehensive security analytics dashboard for executive and operational use
 */
export declare const SecurityAnalyticsDashboard: React.FC<SecurityAnalyticsDashboardProps>;
export default SecurityAnalyticsDashboard;
//# sourceMappingURL=SecurityAnalyticsDashboard.d.ts.map
}
}