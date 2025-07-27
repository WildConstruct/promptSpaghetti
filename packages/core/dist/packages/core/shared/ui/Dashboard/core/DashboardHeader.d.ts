/**
 * DashboardHeader - Standardized header with actions and controls
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent header layout across all dashboards
 */
import React from 'react';
import type { TimeRangeOption } from './DashboardShell';
export interface DashboardHeaderProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{
        size?: number;
    }>;
    actions?: React.ReactNode;
    showRefresh?: boolean;
    showExport?: boolean;
    onRefresh?: () => void;
    onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
    timeRange?: string;
    timeRangeOptions?: TimeRangeOption[];
    onTimeRangeChange?: (timeRange: string) => void;
    showTimeRange?: boolean;
    className?: string;
}
export declare const DashboardHeader: React.FC<DashboardHeaderProps>;
export default DashboardHeader;
//# sourceMappingURL=DashboardHeader.d.ts.map