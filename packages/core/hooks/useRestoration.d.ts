import { CreateRestorationAttemptRequest, RestorationPreviewRequest, ConflictResolutionRequest, RestorationBookmarkRequest, RestorationAttempt, RestorationPreviewResponse, RestorationProgressResponse, RestorationStatsResponse, RestorationBookmark, ConflictResolutionResult, RestorationFilter } from '../types/restoration';
interface UseRestorationReturn {
    loading: boolean;
    error: string | null;
    generatePreview: (request: RestorationPreviewRequest) => Promise<RestorationPreviewResponse>;
    createRestoration: (request: CreateRestorationAttemptRequest) => Promise<RestorationAttempt>;
    getProgress: (restorationAttemptId: string) => Promise<RestorationProgressResponse>;
    resolveConflict: (request: ConflictResolutionRequest) => Promise<ConflictResolutionResult>;
    cancelRestoration: (restorationAttemptId: string) => Promise<void>;
    getStats: (projectId: string) => Promise<RestorationStatsResponse>;
    createBookmark: (request: RestorationBookmarkRequest) => Promise<RestorationBookmark>;
    getBookmarks: (projectId: string) => Promise<RestorationBookmark[]>;
    deleteBookmark: (bookmarkId: string) => Promise<void>;
    listRestorations: (filter: RestorationFilter) => Promise<RestorationAttempt[]>;
    getRestorationDetails: (restorationAttemptId: string) => Promise<any>;
    clearError: () => void;
}
export declare const useRestoration: () => UseRestorationReturn;
export {};
//# sourceMappingURL=useRestoration.d.ts.map