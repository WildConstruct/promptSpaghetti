/**
 * DashboardProvider - Context for shared dashboard state
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides shared state and functionality across dashboard components
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DashboardContextValue {
  // Time range state
  timeRange: string;
  setTimeRange: (timeRange: string) => void;
  // Loading and refresh state
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  // Export state
  exporting: boolean;
  setExporting: (exporting: boolean) => void;
  // Filter state
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  // View state
  viewMode: 'grid' | 'list' | 'table';
  setViewMode: (mode: 'grid' | 'list' | 'table') => void;
  // Selection state (for bulk operations)
  selectedItems: Set<string>;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  // Actions
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  onTimeRangeChange?: (timeRange: string) => void;
}
const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

export interface DashboardProviderProps {
  children: React.ReactNode;
  timeRange?: string;
  onTimeRangeChange?: (timeRange: string) => void;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({)
  children,
  timeRange: initialTimeRange = '7d',
  onTimeRangeChange,
  onRefresh,
  onExport
}) => {
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('grid');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const handleTimeRangeChange = useCallback((newTimeRange: string) => {
    setTimeRange(newTimeRange);
    onTimeRangeChange?.(newTimeRange);
  }, [onTimeRangeChange]);
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);
  const selectItem = useCallback((id: string) => {
    setSelectedItems(prev => new Set([...prev, id]));
  }, []);
  const deselectItem = useCallback((id: string) => {
    setSelectedItems(prev => {)
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);
  const selectAll = useCallback((ids: string[]) => {
    setSelectedItems(new Set(ids));
  }, []);
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);
  const isSelected = useCallback((id: string) => {
    return selectedItems.has(id);
  }, [selectedItems]);
  const contextValue: DashboardContextValue = {
    timeRange,
    setTimeRange: handleTimeRangeChange,
    refreshing,
    setRefreshing,
    exporting,
    setExporting,
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    selectedItems,
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    isSelected,
    onRefresh,
    onExport,
    onTimeRangeChange
  };
  return ();
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextValue => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export default DashboardProvider;