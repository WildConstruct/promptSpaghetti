interface UseCommentsOptions {
    workspaceId: string;
    targetType: string;
    targetId: string;
    userId: string;
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    autoRefresh?: boolean;
    refreshInterval?: number;
}
export declare function useComments(options: UseCommentsOptions): void;
export {};
//# sourceMappingURL=useComments.d.ts.map