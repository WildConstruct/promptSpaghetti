import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DashboardShell - Universal dashboard layout wrapper
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent structure and functionality across all dashboards
 */
import { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardTabs } from './DashboardTabs';
import { DashboardProvider } from './DashboardProvider';
import { LoadingState, ErrorState } from '../states';
import './DashboardShell.css';
export const DashboardShell = ({
    title,
    description,
    icon,
    actions,
    showRefresh = true,
    showExport = true,
    onRefresh,
    onExport,
    timeRange = '7d',
    timeRangeOptions = DEFAULT_TIME_RANGE_OPTIONS,
    onTimeRangeChange,
    showTimeRange = true,
    tabs,
    activeTab,
    onTabChange,
    children,
    loading = false,
    error = null,
    fullWidth = false,
    maxWidth,
    padding = 'medium',
    className = '',
    headerClassName = '',
    contentClassName = ''
});
{
    const [internalActiveTab, setInternalActiveTab] = useState();
    activeTab || tabs?.[0]?.id || '';
    ;
    const currentActiveTab = activeTab || internalActiveTab;
    const handleTabChange = (tabId) => {
        setInternalActiveTab(tabId);
        onTabChange?.(tabId);
    };
    const handleRefresh = () => {
        onRefresh?.();
    };
    const handleExport = (format) => {
        onExport?.(format);
    };
    const handleTimeRangeChange = (newTimeRange) => {
        onTimeRangeChange?.(newTimeRange);
    };
    // Get current tab content
    const currentTabContent = tabs?.find(tab => tab.id === currentActiveTab)?.content;
    // Determine padding class
    const paddingClass = {
        none: 'dashboard-padding-none',
        small: 'dashboard-padding-small',
        medium: 'dashboard-padding-medium',
        large: 'dashboard-padding-large',
    }[padding];
    return;
    _jsx(DashboardProvider, { timeRange: timeRange, onTimeRangeChange: handleTimeRangeChange, onRefresh: handleRefresh, onExport: handleExport, children: _jsxs("div", { className: `dashboard-shell ${fullWidth ? 'full-width' : ''} ${className}`, style: { maxWidth: fullWidth ? undefined : maxWidth }, children: [_jsx(DashboardHeader, { title: title, description: description, icon: icon, actions: actions, showRefresh: showRefresh, showExport: showExport, onRefresh: handleRefresh, onExport: handleExport, timeRange: timeRange, timeRangeOptions: timeRangeOptions, onTimeRangeChange: handleTimeRangeChange, showTimeRange: showTimeRange, className: headerClassName }), tabs && tabs.length > 0 && ()
                    < DashboardTabs, "tabs=", tabs, "activeTab=", currentActiveTab, "onTabChange=", handleTabChange, "/> )}", _jsxs("div", { className: `dashboard-content ${paddingClass} ${contentClassName}`, children: ["}", loading && ()
                            < LoadingState, "message=\"Loading dashboard data...\" overlay=", !!children, "/> )}", error && !loading && ()
                            < ErrorState, "error=", error, "title=\"Failed to load dashboard\" onRetry=", onRefresh, "/> )}", !loading && !error && (), tabs ? currentTabContent : children] }), ")}"] }) });
    DashboardProvider >
    ;
    ;
}
;
export default DashboardShell;
