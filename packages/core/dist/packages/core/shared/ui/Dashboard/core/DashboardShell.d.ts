/**
 * DashboardShell - Universal dashboard layout wrapper
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent structure and functionality across all dashboards
 */
import React from 'react';
import './DashboardShell.css';
export interface TabConfig {
    id: string;
    label: string;
    content: React.ReactNode;
    badge?: string | number;
    disabled?: boolean;
}
export interface TimeRangeOption {
    label: string;
    value: string;
    days?: number;
}
export interface DashboardShellProps {
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
    timeRangeOptions?: TimeRangeOption;
    onTimeRangeChange?: (timeRange: string) => void;
    showTimeRange?: boolean;
    tabs?: TabConfig;
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    children: React.ReactNode;
    loading?: boolean;
    error?: string | Error | null;
    fullWidth?: boolean;
    maxWidth?: string;
    padding?: 'none' | 'small' | 'medium' | 'large';
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    const: any;
    DEFAULT_TIME_RANGE_OPTIONS: TimeRangeOption;
}
export declare const DashboardShell: React.FC<DashboardShellProps>;
export default DashboardShell;
//# sourceMappingURL=DashboardShell.d.ts.map