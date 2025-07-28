/**
 * Rate Limiting Analytics Dashboard React Component
 * Task: E31-1753313263523-692B39 - Create rate limiting analytics dashboard
 * Epic 31: Security Intelligence Platform
 *
 * Advanced React component providing comprehensive security analytics dashboard
 * with real-time monitoring, predictive insights, and actionable intelligence.
 */
import React from 'react';
import { RateLimitingAnalyticsDashboard } from '../RateLimitingAnalyticsDashboard';
interface RateLimitingAnalyticsDashboardProps {
    analyticsDashboard: RateLimitingAnalyticsDashboard;
    className?: string;
    theme?: 'light' | 'dark';
    refreshInterval?: number;
    enableRealTimeUpdates?: boolean;
    showAdvancedFeatures?: boolean;
}
export declare const RateLimitingAnalyticsDashboardComponent: React.FC<RateLimitingAnalyticsDashboardProps>;
export {};
//# sourceMappingURL=RateLimitingAnalyticsDashboardComponent.d.ts.map