/**
 * Dashboard Components - Complete Export
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Unified dashboard system for 95+ dashboard components consolidation
 */

// Core Layout Components
export * from './core';

// State Components
export * from './states';

// Metrics Components
export { MetricsGrid } from './metrics/MetricsGrid';
export { MetricCard } from './metrics/MetricCard';
export { TrendIndicator } from './metrics/TrendIndicator';

// Chart Components
export * from './charts';

// Visualization Components
export * from './visualization';

// Main dashboard shell (convenience export)
export { default as DashboardShell, useDashboard } from './core/DashboardShell';

// Type exports
export type { DashboardShellProps, TabConfig, TimeRangeOption, DashboardContextValue } from './core';

export type { MetricsGridProps,
  MetricCardProps,
  MetricValue,
  MetricTrend,
  TrendIndicatorProps }
 from './metrics/MetricCard';

export type { ChartProps, ChartType, ChartDataPoint, ChartSeries } from './charts/Chart';

export type { DataTableProps, TableColumn, TableAction } from './visualization/DataTable';
