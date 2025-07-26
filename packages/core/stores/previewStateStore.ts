/**
 * Preview State Store
 * Epic 8.5: Story 8.5 - Real-Time Multi-Seed Preview - Task 2
 * 
 * Centralized state management for real-time preview functionality with
 * synchronization, caching, and performance optimizations.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface PreviewResult {
  seed: number;
  output?: string;
  error?: string;
  usedNodeIds?: string[];
  usedEdgeIds?: string[];
  executionTimeMs?: number;
  executionPath?: any;
  weightChoices?: Array<{
    nodeId: string;
    selectedOption: any;
    availableOptions: any[];
    weights?: number[];
    selectionProbability?: number;
  }>;
  locked?: boolean;
  lockedAt?: number;
  lockedNote?: string;
  debugInfo?: {
    nodeExecutionOrder: string[];
    randomChoices: any[];
    performanceBreakdown: any;
    memoryUsage?: any;
  };
}

export interface PreviewCache {
  graphHash: string;
  timestamp: number;
  results: PreviewResult[];
  performanceStats: {
    totalTime: number;
    averageTime: number;
  } | null;
}

export interface PreviewPerformanceMetrics {
  totalExecutionTime: number;
  averageExecutionTime: number;
  cacheHitRate: number;
  lastExecutionCount: number;
  peakMemoryUsage?: number;
  networkLatency?: number;
}

export interface PreviewStateStore {
  // Current preview state
  isLoading: boolean;
  error: string | null;
  results: PreviewResult[];
  aggregateError: string | null;
  performanceStats: {
    totalTime: number;
    averageTime: number;
  } | null;
  
  // Real-time sync state
  lastGraphHash: string | null;
  lastUpdateTimestamp: number;
  isRealTimeEnabled: boolean;
  syncInterval: number; // milliseconds
  
  // Preview cache system
  cache: Map<string, PreviewCache>;
  maxCacheSize: number;
  cacheExpirationMs: number;
  
  // Result management state
  lockedResults: number[];
  regeneratingResults: number[];
  
  // Performance monitoring
  performanceMetrics: PreviewPerformanceMetrics;
  performanceHistory: PreviewPerformanceMetrics[];
  maxHistoryLength: number;
  
  // Auto-refresh configuration
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number;
  autoRefreshThreshold: number; // Graph change significance threshold
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setResults: (results: PreviewResult[]) => void;
  setAggregateError: (error: string | null) => void;
  setPerformanceStats: (stats: { totalTime: number; averageTime: number } | null) => void;
  
  // Real-time sync actions
  updateGraphHash: (hash: string) => void;
  enableRealTimeSync: (enabled: boolean) => void;
  setSyncInterval: (interval: number) => void;
  
  // Cache management
  getCachedResults: (graphHash: string) => PreviewCache | null;
  setCachedResults: (graphHash: string, results: PreviewResult[], stats: any) => void;
  clearCache: () => void;
  pruneCacheByAge: () => void;
  pruneCacheBySize: () => void;
  
  // Result management
  lockResult: (index: number, note?: string) => void;
  unlockResult: (index: number) => void;
  setRegeneratingResult: (index: number, regenerating: boolean) => void;
  
  // Performance monitoring
  updatePerformanceMetrics: (metrics: Partial<PreviewPerformanceMetrics>) => void;
  addPerformanceSnapshot: () => void;
  getPerformanceInsights: () => {
    trend: 'improving' | 'degrading' | 'stable';
    bottlenecks: string[];
    recommendations: string[];
  };
  
  // Auto-refresh
  setAutoRefresh: (enabled: boolean, interval?: number) => void;
  shouldAutoRefresh: (changeSignificance?: number) => boolean;
  
  // Utility actions
  resetState: () => void;
  getStateSnapshot: () => any;
  restoreFromSnapshot: (snapshot: any) => void;
}

// Generate hash for graph objects for caching
  } catch {
    return `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Default performance metrics
const defaultPerformanceMetrics: PreviewPerformanceMetrics = {
  totalExecutionTime: 0,
  averageExecutionTime: 0,
  cacheHitRate: 0,
  lastExecutionCount: 0
};

export const usePreviewStateStore = create<PreviewStateStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      isLoading: false,
      error: null,
      results: [],
      aggregateError: null,
      performanceStats: null,
      
      // Real-time sync state
      lastGraphHash: null,
      lastUpdateTimestamp: 0,
      isRealTimeEnabled: false,
      syncInterval: 1000, // 1 second default
      
      // Cache system
      cache: new Map<string, PreviewCache>(),
      maxCacheSize: 50,
      cacheExpirationMs: 5 * 60 * 1000, // 5 minutes
      
      // Result management
      lockedResults: [],
      regeneratingResults: [],
      
      // Performance monitoring
      performanceMetrics: defaultPerformanceMetrics,
      performanceHistory: [],
      maxHistoryLength: 100,
      
      // Auto-refresh
      autoRefreshEnabled: false,
      autoRefreshInterval: 5000, // 5 seconds
      autoRefreshThreshold: 0.3, // 30% change threshold
      
      // Basic actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setResults: (results) => {
        set({ results });
        // Update last update timestamp
        set({ lastUpdateTimestamp: Date.now() });
      },
      setAggregateError: (aggregateError) => set({ aggregateError }),
      setPerformanceStats: (performanceStats) => set({ performanceStats }),
      
      // Real-time sync actions
      updateGraphHash: (hash) => {
        const state = get();
        if (state.lastGraphHash !== hash) {
          set({
            lastGraphHash: hash,
            lastUpdateTimestamp: Date.now()
          });
        }
      },
      
      enableRealTimeSync: (enabled) => set({ isRealTimeEnabled: enabled }),
      setSyncInterval: (interval) => set({ syncInterval: Math.max(100, interval) }),
      
      // Cache management
      getCachedResults: (graphHash) => {
        const state = get();
        const cached = state.cache.get(graphHash);
        
        if (!cached) return null;
        
        // Check if cache is expired
        const isExpired = Date.now() - cached.timestamp > state.cacheExpirationMs;
        if (isExpired) {
          state.cache.delete(graphHash);
          return null;
        }
        
        // Update cache hit rate
        const currentMetrics = state.performanceMetrics;
        const totalRequests = currentMetrics.lastExecutionCount + 1;
        const cacheHits = Math.round(currentMetrics.cacheHitRate * currentMetrics.lastExecutionCount) + 1;
        
        set({
          performanceMetrics: {
            ...currentMetrics,
            cacheHitRate: cacheHits / totalRequests,
            lastExecutionCount: totalRequests
          }
        });
        
        return cached;
      },
      
      setCachedResults: (graphHash, results, stats) => {
        const state = get();
        const newCache = new Map(state.cache);
        
        // Add new cache entry
        newCache.set(graphHash, {
          graphHash,
          timestamp: Date.now(),
          results: [...results],
          performanceStats: stats ? { ...stats } : null
        });
        
        // Prune cache if needed
        if (newCache.size > state.maxCacheSize) {
          const oldestKey = Array.from(newCache.keys())[0];
          newCache.delete(oldestKey);
        }
        
        set({ cache: newCache });
      },
      
      clearCache: () => set({ cache: new Map() }),
      
      pruneCacheByAge: () => {
        const state = get();
        const newCache = new Map();
        const cutoffTime = Date.now() - state.cacheExpirationMs;
        
        for (const [key, value] of state.cache.entries()) {
          if (value.timestamp > cutoffTime) {
            newCache.set(key, value);
          }
        }
        
        set({ cache: newCache });
      },
      
      pruneCacheBySize: () => {
        const state = get();
        if (state.cache.size <= state.maxCacheSize) return;
        
        const entries = Array.from(state.cache.entries())
          .sort(([, a], [, b]) => b.timestamp - a.timestamp)
          .slice(0, state.maxCacheSize);
          
        set({ cache: new Map(entries) });
      },
      
      // Result management
      lockResult: (index, note) => {
        const state = get();
        const updatedResults = [...state.results];
        
        if (updatedResults[index]) {
          updatedResults[index] = {
            ...updatedResults[index],
            locked: true,
            lockedAt: Date.now(),
            lockedNote: note
          };
        }
        
        set({
          results: updatedResults,
          lockedResults: [...state.lockedResults, index]
        });
      },
      
      unlockResult: (index) => {
        const state = get();
        const updatedResults = [...state.results];
        
        if (updatedResults[index]) {
          updatedResults[index] = {
            ...updatedResults[index],
            locked: false,
            lockedAt: undefined,
            lockedNote: undefined
          };
        }
        
        set({
          results: updatedResults,
          lockedResults: state.lockedResults.filter(i => i !== index)
        });
      },
      
      setRegeneratingResult: (index, regenerating) => {
        const state = get();
        const updatedRegenerating = regenerating
          ? [...state.regeneratingResults, index]
          : state.regeneratingResults.filter(i => i !== index);
          
        set({ regeneratingResults: updatedRegenerating });
      },
      
      // Performance monitoring
      updatePerformanceMetrics: (newMetrics) => {
        const state = get();
        set({
          performanceMetrics: {
            ...state.performanceMetrics,
            ...newMetrics
          }
        });
      },
      
      addPerformanceSnapshot: () => {
        const state = get();
        const newHistory = [
          ...state.performanceHistory,
          {
            ...state.performanceMetrics,
            timestamp: Date.now()
          } as any
        ].slice(-state.maxHistoryLength);
        
        set({ performanceHistory: newHistory });
      },
      
      getPerformanceInsights: () => {
        const state = get();
        const history = state.performanceHistory;
        
        if (history.length < 2) {
          return {
            trend: 'stable' as const,
            bottlenecks: [],
            recommendations: ['Need more data for analysis']
          };
        }
        
        const recent = history.slice(-5);
        const avgRecent = recent.reduce((sum, h) => sum + h.averageExecutionTime, 0) / recent.length;
        const avgOlder = history.slice(
          -10,
          -5
        ).reduce((sum, h) => sum + h.averageExecutionTime, 0) / Math.max(1, history.length - 5);
        
        const trend = avgRecent > avgOlder * 1.1 ? 'degrading' : 
                     avgRecent < avgOlder * 0.9 ? 'improving' : 'stable';
        
        const bottlenecks: string[] = [];
        const recommendations: string[] = [];
        
        if (state.performanceMetrics.cacheHitRate < 0.3) {
          bottlenecks.push('Low cache hit rate');
          recommendations.push('Consider increasing cache size or adjusting refresh patterns');
        }
        
        if (state.performanceMetrics.averageExecutionTime > 1000) {
          bottlenecks.push('Slow execution time');
          recommendations.push('Optimize graph complexity or enable parallel processing');
        }
        
        if (state.performanceMetrics.networkLatency && state.performanceMetrics.networkLatency > 500) {
          bottlenecks.push('High network latency');
          recommendations.push('Consider local caching or server optimization');
        }
        
        return { trend, bottlenecks, recommendations };
      },
      
      // Auto-refresh
      setAutoRefresh: (enabled, interval) => {
        const updates: Partial<PreviewStateStore> = { autoRefreshEnabled: enabled };
        if (interval !== undefined) {
          updates.autoRefreshInterval = Math.max(1000, interval);
        }
        set(updates);
      },
      
      shouldAutoRefresh: (changeSignificance = 0) => {
        const state = get();
        if (!state.autoRefreshEnabled) return false;
        if (state.isLoading) return false;
        
        const timeSinceLastUpdate = Date.now() - state.lastUpdateTimestamp;
        const intervalPassed = timeSinceLastUpdate > state.autoRefreshInterval;
        const significantChange = changeSignificance > state.autoRefreshThreshold;
        
        return intervalPassed || significantChange;
      },
      
      // Utility actions
      resetState: () => {
        set({
          isLoading: false,
          error: null,
          results: [],
          aggregateError: null,
          performanceStats: null,
          lockedResults: [],
          regeneratingResults: [],
          lastUpdateTimestamp: 0,
          performanceMetrics: defaultPerformanceMetrics
        });
      },
      
      getStateSnapshot: () => {
        const state = get();
        return {
          results: state.results,
          lockedResults: state.lockedResults,
          performanceStats: state.performanceStats,
          lastGraphHash: state.lastGraphHash,
          lastUpdateTimestamp: state.lastUpdateTimestamp,
          performanceMetrics: state.performanceMetrics
        };
      },
      
      restoreFromSnapshot: (snapshot) => {
        set({
          results: snapshot.results || [],
          lockedResults: snapshot.lockedResults || [],
          performanceStats: snapshot.performanceStats || null,
          lastGraphHash: snapshot.lastGraphHash || null,
          lastUpdateTimestamp: snapshot.lastUpdateTimestamp || 0,
          performanceMetrics: snapshot.performanceMetrics || defaultPerformanceMetrics
        });
      }
    })),
    {
      name: 'preview-state-store',
      partialize: (state) => ({
        // Only persist essential state
        isRealTimeEnabled: state.isRealTimeEnabled,
        syncInterval: state.syncInterval,
        autoRefreshEnabled: state.autoRefreshEnabled,
        autoRefreshInterval: state.autoRefreshInterval,
        maxCacheSize: state.maxCacheSize,
        cacheExpirationMs: state.cacheExpirationMs
      })
    }
  )
);

// Utility hooks for common state selections
export export export export export 
// Performance monitoring hook
export }));