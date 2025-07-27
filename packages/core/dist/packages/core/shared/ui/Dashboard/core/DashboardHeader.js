import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * DashboardHeader - Standardized header with actions and controls
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides consistent header layout across all dashboards
 */
import { useState } from 'react';
import { RefreshCw, Download, ChevronDown, Calendar } from 'lucide-react';
export const DashboardHeader = ({ title, description, icon: Icon, actions, showRefresh = true, showExport = true, onRefresh, onExport, timeRange = '7d', timeRangeOptions = [], onTimeRangeChange, showTimeRange = true, className = '' }) => {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const handleRefresh = async () => {
        if (refreshing || !onRefresh)
            return;
        setRefreshing(true);
        try {
            await onRefresh();
        }
        finally {
            setRefreshing(false);
        }
    };
    const handleExport = (format) => {
        onExport?.(format);
        setShowExportMenu(false);
    };
    const currentTimeRangeOption = timeRangeOptions.find(option => option.value === timeRange);
    return (_jsx("div", { className: `dashboard-header ${className}`, children: _jsxs("div", { className: "header-content", children: [_jsxs("div", { className: "header-title-section", children: [Icon && (_jsx("div", { className: "header-icon", children: _jsx(Icon, { size: 24 }) })), _jsxs("div", { className: "header-text", children: [_jsx("h1", { className: "header-title", children: title }), description && (_jsx("p", { className: "header-description", children: description }))] })] }), _jsxs("div", { className: "header-controls", children: [showTimeRange && timeRangeOptions.length > 0 && (_jsxs("div", { className: "time-range-selector", children: [_jsx("select", { value: timeRange, onChange: (e) => onTimeRangeChange?.(e.target.value), className: "time-range-select", children: timeRangeOptions.map(option => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx(Calendar, { size: 16, className: "time-range-icon" })] })), actions && (_jsx("div", { className: "header-actions", children: actions })), showRefresh && (_jsxs("button", { onClick: handleRefresh, disabled: refreshing, className: `header-action-btn refresh-btn ${refreshing ? 'refreshing' : ''}`, title: "Refresh dashboard", children: [_jsx(RefreshCw, { size: 16, className: refreshing ? 'spin' : '' }), _jsx("span", { children: "Refresh" })] })), showExport && (_jsxs("div", { className: "export-container", children: [_jsxs("button", { onClick: () => setShowExportMenu(!showExportMenu), className: "header-action-btn export-btn", title: "Export data", children: [_jsx(Download, { size: 16 }), _jsx("span", { children: "Export" }), _jsx(ChevronDown, { size: 14, className: "dropdown-icon" })] }), showExportMenu && (_jsxs("div", { className: "export-menu", children: [_jsxs("button", { onClick: () => handleExport('csv'), className: "export-menu-item", children: [_jsx("span", { children: "CSV" }), _jsx("span", { className: "export-description", children: "Comma-separated values" })] }), _jsxs("button", { onClick: () => handleExport('excel'), className: "export-menu-item", children: [_jsx("span", { children: "Excel" }), _jsx("span", { className: "export-description", children: "Microsoft Excel format" })] }), _jsxs("button", { onClick: () => handleExport('pdf'), className: "export-menu-item", children: [_jsx("span", { children: "PDF" }), _jsx("span", { className: "export-description", children: "Portable document format" })] })] }))] }))] })] }) }));
};
export default DashboardHeader;
