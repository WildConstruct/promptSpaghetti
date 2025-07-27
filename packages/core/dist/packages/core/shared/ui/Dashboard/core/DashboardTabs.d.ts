/**
 * DashboardTabs - Consistent tab navigation for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides standardized tab navigation with badges and states
 */
import React from 'react';
import type { TabConfig } from './DashboardShell';
export interface DashboardTabsProps {
    tabs: TabConfig[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}
export declare const DashboardTabs: React.FC<DashboardTabsProps>;
export default DashboardTabs;
//# sourceMappingURL=DashboardTabs.d.ts.map