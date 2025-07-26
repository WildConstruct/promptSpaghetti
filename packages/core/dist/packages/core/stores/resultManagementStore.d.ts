/**
 * Epic 8.5 - Result Management Store
 *
 * Professional result persistence and management system for film industry workflows.
 * Handles result selection, saving, tagging, rating, and organization.
 */
import { EnhancedPreviewResult } from '../components/PreviewModal/EnhancedPreviewModal';
export interface SavedResult extends EnhancedPreviewResult {
    savedAt: Date;
    lastModified: Date;
    collection?: string;
    projectId?: string;
    graphId?: string;
    version?: number;
    workflow?: {
        status: 'draft' | 'review' | 'approved' | 'rejected' | 'final';
        assignee?: string;
        reviewer?: string;
        deadline?: Date;
        priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    creative?: {
        genre?: string;
        tone?: string;
        style?: string;
        characterCount?: number;
        sceneType?: 'interior' | 'exterior' | 'mixed';
        timeOfDay?: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
    };
}
export interface ResultCollection {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    lastModified: Date;
    resultIds: string[];
    tags: string[];
    projectInfo?: {
        title?: string;
        director?: string;
        producer?: string;
        genre?: string;
        budget?: string;
        targetRating?: string;
    };
}
export interface ResultFilter {
    tags?: string[];
    rating?: {
        min?: number;
        max?: number;
    };
    contentType?: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    collection?: string;
    status?: string[];
    searchText?: string;
}
export interface ResultStats {
    totalResults: number;
    averageRating: number;
    averageWordCount: number;
    totalExecutionTime: number;
    topTags: Array<{
        tag: string;
        count: number;
    }>;
    contentTypeDistribution: Record<string, number>;
    recentActivity: Array<{
        type: 'save' | 'rate' | 'tag' | 'export' | 'note';
        timestamp: Date;
        resultId: string;
        details?: string;
    }>;
}
interface ResultManagementState {
    savedResults: Record<string, SavedResult>;
    collections: Record<string, ResultCollection>;
    selectedResultIds: Set<string>;
    currentFilter: ResultFilter;
    sortBy: 'createdAt' | 'rating' | 'wordCount' | 'lastModified';
    sortOrder: 'asc' | 'desc';
    stats: ResultStats;
    saveResult: (result: EnhancedPreviewResult, metadata?: Partial<SavedResult>) => Promise<string>;
    updateResult: (id: string, updates: Partial<SavedResult>) => void;
    deleteResult: (id: string) => void;
    duplicateResult: (id: string) => Promise<string>;
    selectResult: (id: string) => void;
    deselectResult: (id: string) => void;
    selectAll: (filtered?: boolean) => void;
    clearSelection: () => void;
    toggleResultSelection: (id: string) => void;
    rateResult: (id: string, rating: number) => void;
    tagResult: (id: string, tags: string[]) => void;
    addNote: (id: string, note: string) => void;
    updateWorkflowStatus: (id: string, workflow: Partial<SavedResult['workflow']>) => void;
    createCollection: (name: string, description?: string) => string;
    updateCollection: (id: string, updates: Partial<ResultCollection>) => void;
    deleteCollection: (id: string) => void;
    addToCollection: (resultIds: string[], collectionId: string) => void;
    removeFromCollection: (resultIds: string[], collectionId: string) => void;
    setFilter: (filter: ResultFilter) => void;
    clearFilter: () => void;
    setSorting: (sortBy: ResultManagementState['sortBy'], order: 'asc' | 'desc') => void;
    searchResults: (query: string) => SavedResult[];
    bulkUpdateTags: (resultIds: string[], tags: string[]) => void;
    bulkUpdateWorkflow: (resultIds: string[], workflow: Partial<SavedResult['workflow']>) => void;
    bulkDelete: (resultIds: string[]) => void;
    bulkExport: (resultIds: string[], format: string) => Promise<void>;
    refreshStats: () => void;
    getFilteredResults: () => SavedResult[];
    getResultsByCollection: (collectionId: string) => SavedResult[];
    getRecentResults: (limit?: number) => SavedResult[];
    getTopRatedResults: (limit?: number) => SavedResult[];
}
export declare         clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: ResultManagementState) => void) => () => void;
        onFinishHydration: (fn: (state: ResultManagementState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<ResultManagementState, ResultManagementState>>;
    };
}>;
export {};
//# sourceMappingURL=resultManagementStore.d.ts.map