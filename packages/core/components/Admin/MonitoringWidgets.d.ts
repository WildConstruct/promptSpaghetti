/**
 * Monitoring Widgets
 * Epic 17.4.2 - Monitoring Dashboard
 * Task: E17-1753114397070-5493E0
 *
 * Modular monitoring widgets for different views and metrics.
 * Supports configurable layouts, real-time updates, and role-based visibility.
 */
import React from 'react';

export interface WidgetConfig {
    id: string;
    title: string;
    type: 'metric' | 'chart' | 'list' | 'status' | 'alert';
    size: 'small' | 'medium' | 'large' | 'full-width';
    refreshInterval?: number;
    requiredPermissions: string[];
    dataSource: string;


interface MonitoringWidgetProps {
    config: WidgetConfig;
    userRole: string;
    data?: unknown;
    onAction?: (widgetId: string, action: string, params?: Record<string, unknown>) => void;
    className?: string;

export declare const SystemHealthWidget: React.FC<MonitoringWidgetProps>;
export declare const ResourceUsageWidget: React.FC<MonitoringWidgetProps>;
export declare const APIMetricsWidget: React.FC<MonitoringWidgetProps>;
export declare const SecurityOverviewWidget: React.FC<MonitoringWidgetProps>;
export declare const ActivityFeedWidget: React.FC<MonitoringWidgetProps>;
export declare const MonitoringWidget: React.FC<MonitoringWidgetProps>;
export default MonitoringWidget;
//# sourceMappingURL=MonitoringWidgets.d.ts.map