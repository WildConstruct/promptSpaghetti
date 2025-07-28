/**
 * DashboardProvider - Context for shared dashboard state
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides shared state and functionality across dashboard components
 */
import React from 'react';
export interface DashboardContextValue {
    timeRange: string;
    setTimeRange: (timeRange: string) => void;
    refreshing: boolean;
    setRefreshing: (refreshing: boolean) => void;
    exporting: boolean;
    setExporting: (exporting: boolean) => void;
    filters: Record<string, any>;
    setFilters: (filters: Record<string, any>) => void;
    updateFilter: (key: string, value: any) => void;
    clearFilters: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    viewMode: 'grid' | 'list' | 'table';
    setViewMode: (mode: 'grid' | 'list' | 'table') => void;
    selectedItems: Set<string>;
    selectItem: (id: string) => void;
    deselectItem: (id: string) => void;
    selectAll: (ids: string) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
    onRefresh?: () => void;
    onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
    onTimeRangeChange?: (timeRange: string) => void;
}
export interface DashboardProviderProps {
    children: React.ReactNode;
    timeRange?: string;
    onTimeRangeChange?: (timeRange: string) => void;
    onRefresh?: () => void;
    onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
}
export declare const DashboardProvider: React.FC<DashboardProviderProps>;
export declare const useDashboard: () => DashboardContextValue;
//# sourceMappingURL=DashboardProvider.d.ts.map