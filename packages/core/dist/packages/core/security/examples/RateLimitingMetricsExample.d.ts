/**
 * Rate Limiting Performance Metrics Example
 * Task: E31-1753313263525-EEFACB - Build API rate limiting performance metrics visualization
 * Epic 31: Security Intelligence Platform
 *
 * Comprehensive example demonstrating the rate limiting performance metrics
 * system including dashboard integration, real-time monitoring, and alerts.
 */
import { RateLimitingService } from '../RateLimitingService';
import { RateLimitingPerformanceMetrics } from '../RateLimitingPerformanceMetrics';
export declare function BasicMetricsExample(): RateLimitingPerformanceMetrics;
export declare function RateLimitingDashboardExample(): import("react/jsx-runtime").JSX.Element;
export declare function AdvancedVisualizationExample(): RateLimitingPerformanceMetrics;
export declare function CustomWidgetExample(): RateLimitingPerformanceMetrics;
export declare function AlertManagementExample(): RateLimitingPerformanceMetrics;
export declare function DataExportExample(): RateLimitingPerformanceMetrics;
declare function simulateTraffic(rateLimitingService: RateLimitingService, highVolume?: boolean): void;
export declare function runAllExamples(): void;
export { BasicMetricsExample, AdvancedVisualizationExample, CustomWidgetExample, AlertManagementExample, DataExportExample, simulateTraffic };
//# sourceMappingURL=RateLimitingMetricsExample.d.ts.map