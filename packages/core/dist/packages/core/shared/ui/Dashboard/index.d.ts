/**
 * Dashboard Components - Complete Export
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Unified dashboard system for 95+ dashboard components consolidation
 */
export * from './core';
export * from './states';
export { MetricsGrid } from './metrics/MetricsGrid';
export { MetricCard } from './metrics/MetricCard';
export { TrendIndicator } from './metrics/TrendIndicator';
export * from './charts';
export * from './visualization';
export { default as DashboardShell, useDashboard } from './core/DashboardShell';
export type { DashboardShellProps, TabConfig, TimeRangeOption, DashboardContextValue } from './core';
export type { MetricsGridProps, MetricCardProps, MetricValue, MetricTrend, TrendIndicatorProps } from './metrics/MetricCard';
export type { ChartProps, ChartType, ChartDataPoint, ChartSeries } from './charts/Chart';
export type { DataTableProps, TableColumn, TableAction } from './visualization/DataTable';
//# sourceMappingURL=index.d.ts.map