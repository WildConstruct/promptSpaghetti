/**
 * Health Dashboard Component - Epic 17.4
 *
 * Comprehensive system health monitoring dashboard for backstage admin controls.
 * Integrates with HealthMonitoringService and DiagnosticService for real-time
 * system status, performance metrics, and operational insights.
 *
 * Task: E17-1753114397242-281319 - Design health dashboards
 * Epic: 17 - Backstage Admin Controls
 */
import React from 'react';
interface HealthDashboardProps {
    refreshInterval?: number;
    autoRefresh?: boolean;
    showDetails?: boolean;
    onAlertAction?: (alertId: string, action: 'acknowledge' | 'resolve') => void;
}
export declare const HealthDashboard: React.FC<HealthDashboardProps>;
export default HealthDashboard;
//# sourceMappingURL=HealthDashboard.d.ts.map