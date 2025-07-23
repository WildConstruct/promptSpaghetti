// packages/core/hooks/useExternalDataImport.ts
// Epic 8.8 Task 1: Data Import Hooks with Caching System

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  DataSourceManager, 
  dataSourceManager, 
  DataSource,
  HistoricalQuery, 
  QueryResult 
} from '../external-data/DataSourceManager';

interface UseExternalDataImportProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  enableRealTimeUpdates?: boolean;
  cacheStrategy?: 'aggressive' | 'conservative' | 'disabled';
  onError?: (error: Error) => void;
  onSuccess?: (results: QueryResult[]) => void;
}

interface ExternalDataImportState {
  isLoading: boolean;
  hasError: boolean;
  error: Error | null;
  lastQuery: HistoricalQuery | null;
  lastResults: QueryResult[];
  availableDataSources: DataSource[];
  enabledSourcesCount: number;
  cacheHitRate: number;
  lastUpdateTime: string | null;
}

interface UseExternalDataImportReturn {
  // State
  state: ExternalDataImportState;
  
  // Data operations
  queryData: (query: HistoricalQuery, sourceIds?: string[]) => Promise<QueryResult[]>;
  refreshData: () => Promise<void>;
  clearCache: () => void;
  
  // Data source management
  addDataSource: (source: DataSource) => void;
  updateDataSource: (sourceId: string, updates: Partial<DataSource>) => void;
  removeDataSource: (sourceId: string) => void;
  toggleDataSource: (sourceId: string) => void;
  getDataSource: (sourceId: string) => DataSource | null;
  
  // Real-time updates
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
  
  // Utility functions
  validateQuery: (query: HistoricalQuery) => { valid: boolean; errors: string[] };
  getQuerySuggestions: (partial: Partial<HistoricalQuery>) => string[];
  exportResults: (format: 'json' | 'csv') => string;
}

export const useExternalDataImport = ({
  autoRefresh = false,
  refreshInterval = 300000, // 5 minutes
  enableRealTimeUpdates = false,
  cacheStrategy = 'conservative',
  onError,
  onSuccess
}: UseExternalDataImportProps = {}): UseExternalDataImportReturn => {
  
  const [state, setState] = useState<ExternalDataImportState>({
    isLoading: false,
    hasError: false,
    error: null,
    lastQuery: null,
    lastResults: [],
    availableDataSources: [],
    enabledSourcesCount: 0,
    cacheHitRate: 0,
    lastUpdateTime: null
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const realTimeUpdateRef = useRef<NodeJS.Timeout>();
  const cacheStatsRef = useRef({ hits: 0, total: 0 });

  // Initialize data sources on mount
  useEffect(() => {
    const manager = dataSourceManager;
    const sources = Array.from((manager as any).dataSources.values());
    const enabledCount = sources.filter(s => s.enabled).length;
    
    setState(prev => ({
      ...prev,
      availableDataSources: sources,
      enabledSourcesCount: enabledCount
    }));
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && state.lastQuery) {
      refreshIntervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, state.lastQuery]);

  // Query external data
  const queryData = useCallback(async (
    query: HistoricalQuery, 
    sourceIds?: string[]
  ): Promise<QueryResult[]> => {
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      hasError: false, 
      error: null 
    }));

    try {
            const manager = dataSourceManager;
      const results = await manager.queryHistoricalData(query, sourceIds);
      
      // Update cache statistics
      const cachedResults = results.filter(r => r.metadata.cached);
      cacheStatsRef.current.hits += cachedResults.length;
      cacheStatsRef.current.total += results.length;
      
      const cacheHitRate = cacheStatsRef.current.total > 0 
        ? (cacheStatsRef.current.hits / cacheStatsRef.current.total) * 100 
        : 0;

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastQuery: query,
        lastResults: results,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        lastUpdateTime: new Date().toISOString()
      }));

      if (onSuccess) {
        onSuccess(results);
      }

      return results;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasError: true,
        error: errorObj
      }));

      if (onError) {
        onError(errorObj);
      }

      return [];
    }
  }, [onSuccess, onError]);

  // Refresh current query
  const refreshData = useCallback(async (): Promise<void> => {
    if (state.lastQuery) {
      await queryData(state.lastQuery);
    }
  }, [state.lastQuery, queryData]);

  // Clear all caches
  const clearCache = useCallback(() => {
    const manager = dataSourceManager;
    (manager as any).cache.clear();
    cacheStatsRef.current = { hits: 0, total: 0 };
    
    setState(prev => ({
      ...prev,
      cacheHitRate: 0
    }));
  }, []);

  // Add new data source
  const addDataSource = useCallback((source: DataSource) => {
    const manager = dataSourceManager;
    manager.registerDataSource(source);
    
    setState(prev => ({
      ...prev,
      availableDataSources: [...prev.availableDataSources, source],
      enabledSourcesCount: source.enabled 
        ? prev.enabledSourcesCount + 1 
        : prev.enabledSourcesCount
    }));
  }, []);

  // Update existing data source
  const updateDataSource = useCallback((sourceId: string, updates: Partial<DataSource>) => {
    const manager = dataSourceManager;
    const sources = (manager as any).dataSources;
    const existingSource = sources.get(sourceId);
    
    if (existingSource) {
      const updatedSource = { ...existingSource, ...updates };
      sources.set(sourceId, updatedSource);
      
      setState(prev => ({
        ...prev,
        availableDataSources: prev.availableDataSources.map(s => 
          s.id === sourceId ? updatedSource : s
        ),
        enabledSourcesCount: prev.availableDataSources
          .map(s => s.id === sourceId ? updatedSource : s)
          .filter(s => s.enabled).length
      }));
    }
  }, []);

  // Remove data source
  const removeDataSource = useCallback((sourceId: string) => {
    const manager = dataSourceManager;
    const sources = (manager as any).dataSources;
    const removedSource = sources.get(sourceId);
    sources.delete(sourceId);
    
    setState(prev => ({
      ...prev,
      availableDataSources: prev.availableDataSources.filter(s => s.id !== sourceId),
      enabledSourcesCount: removedSource?.enabled 
        ? prev.enabledSourcesCount - 1
        : prev.enabledSourcesCount
    }));
  }, []);

  // Toggle data source enabled state
  const toggleDataSource = useCallback((sourceId: string) => {
    setState(prev => {
      const source = prev.availableDataSources.find(s => s.id === sourceId);
      if (!source) return prev;

      const updatedSources = prev.availableDataSources.map(s =>
        s.id === sourceId ? { ...s, enabled: !s.enabled } : s
      );

      return {
        ...prev,
        availableDataSources: updatedSources,
        enabledSourcesCount: updatedSources.filter(s => s.enabled).length
      };
    });
  }, []);

  // Get specific data source
  const getDataSource = useCallback((sourceId: string): DataSource | null => {
    return state.availableDataSources.find(s => s.id === sourceId) || null;
  }, [state.availableDataSources]);

  // Start real-time updates
  const startRealTimeUpdates = useCallback(() => {
    if (!enableRealTimeUpdates) return;
    
    realTimeUpdateRef.current = setInterval(() => {
      if (state.lastQuery) {
        queryData(state.lastQuery);
      }
    }, 30000); // Update every 30 seconds
  }, [enableRealTimeUpdates, state.lastQuery, queryData]);

  // Stop real-time updates
  const stopRealTimeUpdates = useCallback(() => {
    if (realTimeUpdateRef.current) {
      clearInterval(realTimeUpdateRef.current);
      realTimeUpdateRef.current = undefined;
    }
  }, []);

  // Validate query structure
  const validateQuery = useCallback((query: HistoricalQuery): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!query.category) {
      errors.push('Category is required');
    }
    
    if (!query.era) {
      errors.push('Era is required');
    }
    
    if (query.limit && (query.limit < 1 || query.limit > 1000)) {
      errors.push('Limit must be between 1 and 1000');
    }
    
    if (query.offset && query.offset < 0) {
      errors.push('Offset must be non-negative');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, []);

  // Get query suggestions based on available data
  const getQuerySuggestions = useCallback((partial: Partial<HistoricalQuery>): string[] => {
    const suggestions: string[] = [];
    
    // Era suggestions
    if (!partial.era) {
      suggestions.push(
        'Try "medieval", "renaissance", "ancient", "modern"',
        'Use specific periods like "early-medieval" or "high-renaissance"'
      );
    }
    
    // Category suggestions
    if (!partial.category) {
      suggestions.push(
        'Popular categories: "clothing", "architecture", "art", "literature"',
        'Historical categories: "warfare", "trade", "religion", "daily-life"'
      );
    }
    
    // Region suggestions
    if (!partial.region) {
      suggestions.push(
        'Add regions like "europe", "asia", "middle-east" for more specific results'
      );
    }

    return suggestions;
  }, []);

  // Export results in different formats
  const exportResults = useCallback((format: 'json' | 'csv'): string => {
    if (format === 'json') {
      return JSON.stringify(state.lastResults, null, 2);
    }
    
    if (format === 'csv') {
      const allData = state.lastResults.flatMap(result => result.data);
      if (allData.length === 0) return '';
      
      const headers = Object.keys(allData[0]);
      const csvRows = [
        headers.join(','),
        ...allData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
          }).join(',')
        )
      ];
      
      return csvRows.join('\n');
    }
    
    return '';
  }, [state.lastResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (realTimeUpdateRef.current) {
        clearInterval(realTimeUpdateRef.current);
      }
    };
  }, []);

  return {
    // State
    state,
    
    // Data operations
    queryData,
    refreshData,
    clearCache,
    
    // Data source management
    addDataSource,
    updateDataSource,
    removeDataSource,
    toggleDataSource,
    getDataSource,
    
    // Real-time updates
    startRealTimeUpdates,
    stopRealTimeUpdates,
    
    // Utility functions
    validateQuery,
    getQuerySuggestions,
    exportResults
  };
};

// Specialized hook for historical query building
export   const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const updateQuery = useCallback((updates: Partial<HistoricalQuery>) => {
    const newQuery = { ...query, ...updates };
    setQuery(newQuery);
    
    // Validate the query
    const required = ['category', 'era'];
    const errors = required.filter(field => !newQuery[field as keyof HistoricalQuery]);
    
    setValidationErrors(errors.map(field => `${field} is required`));
    setIsValid(errors.length === 0);
  }, [query]);

  const resetQuery = useCallback(() => {
    setQuery({});
    setIsValid(false);
    setValidationErrors([]);
  }, []);

  const buildQuery = useCallback((): HistoricalQuery | null => {
    if (!isValid) return null;
    
    return {
      era: query.era || '',
      region: query.region,
      category: query.category || '',
      subcategory: query.subcategory,
      keywords: query.keywords,
      filters: query.filters || {},
      limit: query.limit || 50,
      offset: query.offset || 0,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder || 'desc'
    };
  }, [query, isValid]);

  return {
    query,
    isValid,
    validationErrors,
    updateQuery,
    resetQuery,
    buildQuery
  };
};

// Hook for caching management and statistics
export     const cache = (manager as any).cache;
    
    let totalSize = 0;
    for (const [, entry] of cache.entries()) {
      totalSize += entry.size;
    }
    
    setCacheStats({
      size: Math.round(totalSize / 1024), // KB
      hitRate: 0, // Would need to track this in the manager
      lastCleanup: new Date().toISOString(),
      entries: cache.size
    });
  }, []);

  const clearCache = useCallback(() => {
    const manager = dataSourceManager;
    (manager as any).cache.clear();
    getCacheStats();
  }, [getCacheStats]);

  const optimizeCache = useCallback(() => {
    const manager = dataSourceManager;
    (manager as any).cleanupCache();
    getCacheStats();
  }, [getCacheStats]);

  useEffect(() => {
    getCacheStats();
  }, [getCacheStats]);

  return {
    cacheStats,
    getCacheStats,
    clearCache,
    optimizeCache
  };
};