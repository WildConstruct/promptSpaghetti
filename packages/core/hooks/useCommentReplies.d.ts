/**
 * Epic 9.2.4 - useCommentReplies Hook
 * Hook for managing replies to a specific comment
 */
import { Comment } from '../types/workspace';
interface UseCommentRepliesOptions {
    commentId: string;
    userId: string;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
export declare function useCommentReplies(options: UseCommentRepliesOptions): {
    replies: Comment[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    loadMore: () => void;
    refresh: () => void;
    addReply: (newReply: Comment) => void;
    updateReply: (replyId: string, updatedReply: Comment) => void;
    removeReply: (replyId: string) => void;
};
export {};
//# sourceMappingURL=useCommentReplies.d.ts.map