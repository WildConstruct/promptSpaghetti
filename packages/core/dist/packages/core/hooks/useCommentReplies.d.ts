interface UseCommentRepliesOptions {
    commentId: string;
    userId: string;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    enabled?: boolean;
    autoRefresh?: boolean;
    refreshInterval?: number;
}
export declare function useCommentReplies(options: UseCommentRepliesOptions): void;
export {};
//# sourceMappingURL=useCommentReplies.d.ts.map