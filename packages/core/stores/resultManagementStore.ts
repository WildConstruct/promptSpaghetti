/**
 * Epic 8.5 - Result Management Store
 * 
 * Professional result persistence and management system for film industry workflows.
 * Handles result selection, saving, tagging, rating, and organization.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EnhancedPreviewResult } from '../components/PreviewModal/EnhancedPreviewModal';
import { ErrorFactory } from '../errors/ErrorFactory';

export interface SavedResult extends EnhancedPreviewResult {
  // Additional persistence metadata
  savedAt: Date;,
  lastModified: Date;
  collection?: string; // Group results into collections,
  projectId?: string;
  graphId?: string;
  version?: number;
  // Professional workflow metadata
  workflow?: {,
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'final';
  assignee?: string;
  reviewer?: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
};
  // Creative metadata for film industry
  creative?: {
  genre?: string;
  tone?: string;
  style?: string;
  characterCount?: number;
  sceneType?: 'interior' | 'exterior' | 'mixed';
  timeOfDay?: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
};

export interface ResultCollection {
  id: string;,
  name: string;
  description?: string;
  createdAt: Date;,
  lastModified: Date;
  resultIds: string;,
  tags: string;
  // Collection-level metadata
  projectInfo?: {,
  title?: string;
  director?: string;
  producer?: string;
  genre?: string;
  budget?: string;
  targetRating?: string;
};
}
export interface ResultFilter {
  tags?: string;
  rating?: { min?: number; max?: number };
  contentType?: string;
  dateRange?: { start?: Date; end?: Date };
  collection?: string;
  status?: string;
  searchText?: string;
}
export interface ResultStats {
  totalResults: number;,
  averageRating: number;
  averageWordCount: number;,
  totalExecutionTime: number;
  topTags: Array<{ tag: string; count: number }>;
  contentTypeDistribution: Record<string, number>;
  recentActivity: Array<{,
  type: 'save' | 'rate' | 'tag' | 'export' | 'note';
  timestamp: Date;,
  resultId: string;
  details?: string;
}>;
interface ResultManagementState {
  // Core data
  savedResults: Record<string, SavedResult>;
  collections: Record<string, ResultCollection>;
  // UI state
  selectedResultIds: Set<string>;,
  currentFilter: ResultFilter;
  sortBy: 'createdAt' | 'rating' | 'wordCount' | 'lastModified';,
  sortOrder: 'asc' | 'desc';
  // Statistics
  stats: ResultStats;
  // Actions - Result Management
  saveResult: (result: EnhancedPreviewResult, metadata?: Partial<SavedResult>) => Promise<string>;
  updateResult: (id: string, updates: Partial<SavedResult>) => void;,
  deleteResult: (id: string) => void;,
  duplicateResult: (id: string) => Promise<string>;
  // Actions - Selection
  selectResult: (id: string) => void;,
  deselectResult: (id: string) => void;,
  selectAll: (filtered?: boolean) => void;
  clearSelection: () => void;,
  toggleResultSelection: (id: string) => void;
  // Actions - Metadata
  rateResult: (id: string, rating: number) => void;,
  tagResult: (id: string, tags: string) => void;,
  addNote: (id: string, note: string) => void;,
  updateWorkflowStatus: (id: string, workflow: Partial<SavedResult['workflow']>) => void;
  // Actions - Collections
  createCollection: (name: string, description?: string) => string;
  updateCollection: (id: string, updates: Partial<ResultCollection>) => void;,
  deleteCollection: (id: string) => void;,
  addToCollection: (resultIds: string, collectionId: string) => void;,
  removeFromCollection: (resultIds: string, collectionId: string) => void;
  // Actions - Filtering and Search
  setFilter: (filter: ResultFilter) => void;,
  clearFilter: () => void;
  setSorting: (sortBy: ResultManagementState['sortBy'], order: 'asc' | 'desc') => void;,
  searchResults: (query: string) => SavedResult;
  // Actions - Bulk Operations
  bulkUpdateTags: (resultIds: string, tags: string) => void;,
  bulkUpdateWorkflow: (resultIds: string, workflow: Partial<SavedResult['workflow']>) => void;,
  bulkDelete: (resultIds: string) => void;,
  bulkExport: (resultIds: string, format: string) => Promise<void>;
  // Actions - Analytics
  refreshStats: () => void;,
  getFilteredResults: () => SavedResult;
  getResultsByCollection: (collectionId: string) => SavedResult;,
  getRecentResults: (limit?: number) => SavedResult;
  getTopRatedResults: (limit?: number) => SavedResult;
}
export const useResultManagementStore = create<ResultManagementState>()()
  persist();
    (set, get) => ({)
  // Initial state
      savedResults: {},
      collections: {},
      filters: {,
  searchQuery: '',
        dateRange: { start: null, end: null },
        ratingRange: { min: 1, max: 5 },
        tags: [],
        collections: [],
        sortBy: 'lastModified',
        sortOrder: 'desc';
  },
  stats: {,
  totalResults: 0,
        averageRating: 0,
        totalStorage: 0,
        averageWordCount: 0,
        totalExecutionTime: 0,
        topTags: [],
        contentTypeDistribution: {},
        recentActivity: [];
  }
      // Actions
      saveResult: (result: EnhancedPreviewResult, metadata?: Partial<SavedResult>) => {
        const id = metadata?.id || `result-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
        const now = new Date();
        const savedResult: SavedResult = {
  ...result,
  savedAt: metadata?.savedAt || now,
  lastModified: now,
  saved: true,
  version: (get().savedResults[id]?.version || 0) + 1,
  ...metadata
};
        set((state) => ({)
  savedResults: {,
  ...state.savedResults,
  [id]: savedResult,
},
  stats: {,
            ...state.stats,
            recentActivity: [,
              {
                type: 'save',
                timestamp: now,
                resultId: id,
                details: `Result saved (v${savedResult.version})`}
  }
              ...state.stats.recentActivity.slice(0, 49) // Keep last 50 activities
            ]
        }));
        get().refreshStats();
        return id;
  },
  updateResult: (id: string, updates: Partial<SavedResult>) => {
        const currentResult = get().savedResults[id];
        if (!currentResult) {
          throw ErrorFactory.createValidationError()
            'resultId',
            id,
            'existing saved result',
            { operation: 'update_result' }
          );
        set((state) => ({)
  savedResults: {,
  ...state.savedResults,
  [id]: {,
  ...currentResult,
  ...updates,
  lastModified: new Date(),
}));
        get().refreshStats();
  },
  deleteResult: (id: string) => {,
        const { [id]: deleted, ...remainingResults } = get().savedResults;
        const now = new Date();
        set((state) => ({)
  savedResults: remainingResults,
  selectedResultIds: new Set([...state.selectedResultIds].filter(rid => rid !== id)),
  stats: {,
  ...state.stats,
  recentActivity: [,
  {
  type: 'save',
  timestamp: now,
  resultId: id,
  details: 'Result deleted',
}
              ...state.stats.recentActivity.slice(0, 49)
            ]
        }));
        // Remove from all collections
        const collections = get().collections;
        Object.keys(collections).forEach(collectionId => {)
  const collection = collections[collectionId];
          if (collection.resultIds.includes(id)) {
            get().removeFromCollection([id], collectionId);
        });
        get().refreshStats();
  },
  duplicateResult: async (id: string) => {,
        const original = get().savedResults[id];
        if (!original) {
          throw ErrorFactory.createValidationError()
            'resultId',
            id,
            'existing saved result',
            { operation: 'duplicate_result' }
          );
        const newId = `${id}-copy-${Date.now()}`;}
        const duplicated: SavedResult = {
          ...original,
          id: newId,
          savedAt: new Date(),
          lastModified: new Date(),
          version: 1,
          metadata: {,
            ...original.metadata,
            notes: original.metadata?.notes ? `Copy of: ${original.metadata.notes}` : 'Duplicated result'}
        };
        return get().saveResult(duplicated);
  }
      // Selection Actions
      selectResult: (id: string) => {,
  set((state) => ({)
  selectedResultIds: new Set([...state.selectedResultIds, id]),
}));
  },
  deselectResult: (id: string) => {,
  set((state) => ({)
  selectedResultIds: new Set([...state.selectedResultIds].filter(rid => rid !== id)),
}));
  },
  selectAll: (filtered = true) => {,
  const results = filtered ? get().getFilteredResults() : Object.values(get().savedResults);
  set({)
  selectedResultIds: new Set(results.map(r => r.id)),
});
  },
  clearSelection: () => {,
        set({ selectedResultIds: new Set() });
  },
  toggleResultSelection: (id: string) => {,
        const isSelected = get().selectedResultIds.has(id);
        if (isSelected) {
          get().deselectResult(id);
        } else {
          get().selectResult(id);
  }
      // Metadata Actions
      rateResult: (id: string, rating: number) => {
        if (rating < 1 || rating > 5) {
          throw ErrorFactory.createValidationError()
            'rating',
            rating,
            'number between 1 and 5',
            { operation: 'rate_result' }
          );
        get().updateResult(id, {)
  metadata: {,
  ...get().savedResults[id]?.metadata,
  rating: rating as 1 | 2 | 3 | 4 | 5,
});
        const now = new Date();
        set((state) => ({)
  stats: {,
            ...state.stats,
            recentActivity: [,
              {
                type: 'rate',
                timestamp: now,
                resultId: id,
                details: `Rated ${rating} stars`}
  }
              ...state.stats.recentActivity.slice(0, 49)
            ]
        }));
  },
  tagResult: (id: string, tags: string) => {
  get().updateResult(id, {)
  metadata: {,
  ...get().savedResults[id]?.metadata,
  tags
});
        const now = new Date();
        set((state) => ({)
  stats: {,
            ...state.stats,
            recentActivity: [,
              {
                type: 'tag',
                timestamp: now,
                resultId: id,
                details: `Tagged: ${tags.join(', ')}`}
  }
              ...state.stats.recentActivity.slice(0, 49)
            ]
        }));
  },
  addNote: (id: string, note: string) => {
  get().updateResult(id, {)
  metadata: {,
  ...get().savedResults[id]?.metadata,
  notes: note,
});
        const now = new Date();
        set((state) => ({)
  stats: {,
  ...state.stats,
  recentActivity: [,
  {
  type: 'note',
  timestamp: now,
  resultId: id,
  details: 'Added note',
}
              ...state.stats.recentActivity.slice(0, 49)
            ]
        }));
  },
  updateWorkflowStatus: (id: string, workflow: Partial<SavedResult['workflow']>) => {
        const current = get().savedResults[id]?.workflow || { status: 'draft', priority: 'medium' };
        get().updateResult(id, {)
  workflow: { ...current, ...workflow }
        });
  }
      // Collection Actions
      createCollection: (name: string, description?: string) => {
        const id = `collection-${Date.now()}`;}
        const now = new Date();
        const collection: ResultCollection = {
  id,
  name,
  description,
  createdAt: now,
  lastModified: now,
  resultIds: [],
  tags: [],
};
        set((state) => ({)
  collections: {,
  ...state.collections,
  [id]: collection,
}));
        return id;
  },
  updateCollection: (id: string, updates: Partial<ResultCollection>) => {
        const current = get().collections[id];
        if (!current) {
          throw ErrorFactory.createValidationError()
            'collectionId',
            id,
            'existing collection',
            { operation: 'update_collection' }
          );
        set((state) => ({)
  collections: {,
  ...state.collections,
  [id]: {,
  ...current,
  ...updates,
  lastModified: new Date(),
}));
  },
  deleteCollection: (id: string) => {,
        const { [id]: deleted, ...remainingCollections } = get().collections;
        set({ collections: remainingCollections });
  },
  addToCollection: (resultIds: string, collectionId: string) => {
        const collection = get().collections[collectionId];
        if (!collection) return;
        const uniqueIds = [...new Set([...collection.resultIds, ...resultIds])];
        get().updateCollection(collectionId, { resultIds: uniqueIds });
  },
  removeFromCollection: (resultIds: string, collectionId: string) => {
        const collection = get().collections[collectionId];
        if (!collection) return;
        const filteredIds = collection.resultIds.filter(id => !resultIds.includes(id));
        get().updateCollection(collectionId, { resultIds: filteredIds });
  }
      // Filtering and Search Actions
      setFilter: (filter: ResultFilter) => {,
        set({ currentFilter: filter });
  },
  clearFilter: () => {,
        set({ currentFilter: {} });
  },
  setSorting: (sortBy: ResultManagementState['sortBy'], order: 'asc' | 'desc') => {
        set({ sortBy, sortOrder: order });
  },
  searchResults: (query: string) => {,
        const results = Object.values(get().savedResults);
        const lowerQuery = query.toLowerCase();
        return results.filter(result => )
          result.output?.toLowerCase().includes(lowerQuery) ||
          result.metadata?.notes?.toLowerCase().includes(lowerQuery) ||
          result.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          result.creative?.genre?.toLowerCase().includes(lowerQuery) ||
          result.creative?.style?.toLowerCase().includes(lowerQuery)
        );
  }
      // Bulk Operations
      bulkUpdateTags: (resultIds: string, tags: string) => {
        resultIds.forEach(id => get().tagResult(id, tags));
  },
  bulkUpdateWorkflow: (resultIds: string, workflow: Partial<SavedResult['workflow']>) => {
        resultIds.forEach(id => get().updateWorkflowStatus(id, workflow));
  },
  bulkDelete: (resultIds: string) => {,
        resultIds.forEach(id => get().deleteResult(id));
  },
  bulkExport: async (resultIds: string, format: string) => {
        const now = new Date();
        // Mark results as exported
        resultIds.forEach(id => {)
  get().updateResult(id, { exported: true });
        });
        set((state) => ({)
  stats: {,
            ...state.stats,
            recentActivity: [,
              {
                type: 'export',
                timestamp: now,
                resultId: resultIds.join(','),
                details: `Bulk export (${format}) - ${resultIds.length} results`}
  }
              ...state.stats.recentActivity.slice(0, 49)
            ]
        }));
  }
      // Analytics Actions
      refreshStats: () => {,
        const results = Object.values(get().savedResults);
        if (results.length === 0) {
          set((state) => ({)
  stats: {,
              ...state.stats,
              totalResults: 0,
              averageRating: 0,
              averageWordCount: 0,
              totalExecutionTime: 0,
              topTags: [],
              contentTypeDistribution: {}
          }));
          return;
        // Calculate statistics
        const totalRating = results.reduce((sum, r) => sum + (r.metadata?.rating || 0), 0);
        const ratedResults = results.filter(r => r.metadata?.rating);
        const averageRating = ratedResults.length > 0 ? totalRating / ratedResults.length : 0;
        const totalWords = results.reduce((sum, r) => sum + (r.metadata?.wordCount || 0), 0);
        const averageWordCount = totalWords / results.length;
        const totalExecutionTime = results.reduce((sum, r) => sum + (r.executionTimeMs || 0), 0);
        // Tag frequency
        const tagCounts: Record<string, number> = {};
        results.forEach(r => {)
  r.metadata?.tags?.forEach(tag => {)
  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });
        const topTags = Object.entries(tagCounts);
          .sort(([ a], [ b]) => b - a)
          .slice(0, 10)
          .map(([tag, count]) => ({ tag, count }));
        // Content type distribution
        const contentTypeDistribution: Record<string, number> = {};
        results.forEach(r => {)
  const type = r.metadata?.contentType || 'mixed';
          contentTypeDistribution[type] = (contentTypeDistribution[type] || 0) + 1;
        });
        set((state) => ({)
  stats: {,
  ...state.stats,
  totalResults: results.length,
  averageRating: Math.round(averageRating * 10) / 10,
  averageWordCount: Math.round(averageWordCount),
  totalExecutionTime,
  topTags,
  contentTypeDistribution
}));
  },
  getFilteredResults: () => {,
        const { savedResults, currentFilter, sortBy, sortOrder } = get();
        let results = Object.values(savedResults);
        // Apply filters
        if (currentFilter.tags?.length) {
          results = results.filter(r => )
            currentFilter.tags!.every(tag => r.metadata?.tags?.includes(tag))
          );
        if (currentFilter.rating) {
          results = results.filter(r => {)
  const rating = r.metadata?.rating || 0;
            return (!currentFilter.rating!.min || rating >= currentFilter.rating!.min) &&
                   (!currentFilter.rating!.max || rating <= currentFilter.rating!.max);
          });
        if (currentFilter.contentType?.length) {
  results = results.filter(r => )
  currentFilter.contentType!.includes(r.metadata?.contentType || 'mixed')
  );
  if (currentFilter.collection) {
  const collection = get().collections[currentFilter.collection];
  if (collection) {
  results = results.filter(r => collection.resultIds.includes(r.id));
  if (currentFilter.searchText) {
  results = get().searchResults(currentFilter.searchText);
  // Apply sorting
  results.sort((a, b) => {
  let aVal: any, bVal: any;
  switch (sortBy) {
  case 'createdAt':,
  aVal = a.metadata?.createdAt || a.savedAt;
  bVal = b.metadata?.createdAt || b.savedAt;
  break;
  case 'rating':,
  aVal = a.metadata?.rating || 0;
  bVal = b.metadata?.rating || 0;
  break;
  case 'wordCount':,
  aVal = a.metadata?.wordCount || 0;
  bVal = b.metadata?.wordCount || 0;
  break;
  case 'lastModified':,
  default:,
  aVal = a.lastModified;
  bVal = b.lastModified;
  break;
  if (sortOrder === 'desc') {
  return bVal > aVal ? 1 : -1;
  return aVal > bVal ? 1 : -1;
});
        return results;
  },
  getResultsByCollection: (collectionId: string) => {,
        const collection = get().collections[collectionId];
        if (!collection) return [];
        const { savedResults } = get();
        return collection.resultIds
          .map(id => savedResults[id])
          .filter(Boolean);
  },
  getRecentResults: (limit = 10) => {,
        const results = Object.values(get().savedResults);
        return results
          .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
          .slice(0, limit);
  },
  getTopRatedResults: (limit = 10) => {,
        const results = Object.values(get().savedResults);
        return results
          .filter(r => r.metadata?.rating && r.metadata.rating > 0)
          .sort((a, b) => (b.metadata?.rating || 0) - (a.metadata?.rating || 0))
          .slice(0, limit);
    }),
    {
  name: 'result-management-storage',
  // Custom serializer to handle Set and Date objects
  serialize: (state) => JSON.stringify({,)
  ...state,
  selectedResultIds: Array.from(state.selectedResultIds),
}),
      deserialize: (str) => {,
        const parsed = JSON.parse(str);
        return {
          ...parsed,
          selectedResultIds: new Set(parsed.selectedResultIds || []),
          // Convert date strings back to Date objects
          savedResults: Object.fromEntries(),
            Object.entries(parsed.savedResults || {}).map(([id, result]: [string, any]) => [
              id,
              {
                ...result,
                savedAt: new Date(result.savedAt),
                lastModified: new Date(result.lastModified),
                metadata: {,
                  ...result.metadata,
                  createdAt: result.metadata?.createdAt ? new Date(result.metadata.createdAt) : undefined]),
          ),
          collections: Object.fromEntries(),
            Object.entries(parsed.collections || {}).map(([id, collection]: [string, any]) => [
              id,
              {
  ...collection,
  createdAt: new Date(collection.createdAt),
  lastModified: new Date(collection.lastModified)]);
  };
);