import { jsx as _jsx } from 'react/jsx-runtime';
/**
 * DashboardProvider - Context for shared dashboard state
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 *
 * Provides shared state and functionality across dashboard components
 */
import { createContext, useContext, useState, useCallback } from 'react';
const DashboardContext = createContext(undefined);
export const DashboardProvider = {
  children,
  timeRange: (initialTimeRange = '7d'),
  onTimeRangeChange,
  onRefresh,
  onExport,
};
{
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedItems, setSelectedItems] = useState(new Set());
  const handleTimeRangeChange = useCallback(
    newTimeRange => {
      setTimeRange(newTimeRange);
      onTimeRangeChange?.(newTimeRange);
    },
    [onTimeRangeChange]
  );
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
  }, []);
  const selectItem = useCallback(id => {
    setSelectedItems(prev => new Set([...prev, id]));
  }, []);
  const deselectItem = useCallback(id => {
    setSelectedItems(prev => {});
    const newSet = new Set(prev);
    newSet.delete(id);
    return newSet;
  });
}
[];
const selectAll = useCallback(ids => {
  setSelectedItems(new Set(ids));
}, []);
const clearSelection = useCallback(() => {
  setSelectedItems(new Set());
}, []);
const isSelected = useCallback(
  id => {
    return selectedItems.has(id);
  },
  [selectedItems]
);
const contextValue = {
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
  onTimeRangeChange,
};
return;
_jsx(DashboardContext.Provider, { value: contextValue, children: children });
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
    return context;
  }
  export default DashboardProvider;
};
