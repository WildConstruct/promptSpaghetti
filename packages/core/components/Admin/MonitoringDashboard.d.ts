/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Monitoring Dashboard
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 *
 * Complete monitoring dashboard that integrates all monitoring interfaces
 * with configurable layouts, role-based access, and real-time updates.
 */
import React from 'react';
import { WidgetConfig } from './MonitoringWidgets';

}
}
export interface DashboardLayout { id: string;
    name: string;
    description: string;
    widgets: WidgetConfig[];
    roles: string[];
    refreshInterval: number }
}
}
export interface MonitoringDashboardProps {
    userRole: string;
    userId: string;
    initialLayout?: string;
    allowLayoutCustomization?: boolean;
    onExport?: (type: string, timeRange: string) => void;
    onAlertAction?: (alertId: string, action: string) => void;
    className?: string;

export declare const MonitoringDashboard: React.FC<MonitoringDashboardProps>;
export default MonitoringDashboard;
//# sourceMappingURL=MonitoringDashboard.d.ts.map
}
}