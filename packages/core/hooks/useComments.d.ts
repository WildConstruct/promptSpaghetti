/**
 * Epic 9.2.4 - useComments Hook
 * Hook for managing comments in a workspace target
 */
import { Comment, CreateComment, UpdateComment } from '../types/workspace';

}
interface UseCommentsOptions {
    workspaceId: string;
    targetType: string;
    targetId: string;
    userId: string;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    autoRefresh?: boolean;
    refreshInterval?: number;

export declare function useComments(options: UseCommentsOptions): {
    comments: Comment[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    createComment: (commentData: CreateComment) => Promise<Comment>;
    updateComment: (commentId: string, updates: UpdateComment) => Promise<Comment>;
    deleteComment: (commentId: string) => Promise<void>;
    loadMore: () => void;
    refresh: () => void;
    getComment: (commentId: string) => Promise<Comment | null>;
}
};
export {};
//# sourceMappingURL=useComments.d.ts.map