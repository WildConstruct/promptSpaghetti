/**
 * Rate Limiting Metrics Dashboard Component
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * Interactive React dashboard for visualizing rate limiting performance metrics
 * with real-time updates, customizable widgets, and alert management.
 */
import React from 'react';
import { RateLimitingPerformanceMetrics } from '../RateLimitingPerformanceMetrics';
interface RateLimitingMetricsDashboardProps {
    metricsService: RateLimitingPerformanceMetrics;
    className?: string;
    theme?: 'light' | 'dark';
    autoRefresh?: boolean;
    refreshInterval?: number;
}
export declare const RateLimitingMetricsDashboard: React.FC<RateLimitingMetricsDashboardProps>;
export default RateLimitingMetricsDashboard;
//# sourceMappingURL=RateLimitingMetricsDashboard.d.ts.map