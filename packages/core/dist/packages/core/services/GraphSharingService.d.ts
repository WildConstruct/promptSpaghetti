export interface SharedGraphFormat {
    metadata: {
        exportId: string;
        version: string;
        timestamp: string;
        title: string;
        description?: string;
        author: {
            id: string;
            name: string;
            email?: string;
        };
        versionControl: {
            version: number;
            previousVersion?: string;
            changes: string;
            tags: string;
            branch?: string;
        };
        sharing: {
            permissions: 'private' | 'read_only' | 'collaborative' | 'public';
            collaborators: Array<{}, userId>;
            string: any;
            name: string;
            role: 'viewer' | 'editor' | 'admin';
            addedAt: string;
        };
    };
}
export declare class GraphSharingService {
    private static instance;
    private sharedGraphs;
    static getInstance(): GraphSharingService;
    /**
     * Validate shared graph format and integrity
     */
    private validateSharedGraph;
}
//# sourceMappingURL=GraphSharingService.d.ts.map