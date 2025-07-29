import { Node } from 'reactflow';
import { AnnotatedEdge } from '../components/Annotations/ConnectionAnnotations';

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
            changes: string[];
            tags: string[];
            branch?: string;
        };
        sharing: {
            permissions: 'private' | 'read_only' | 'collaborative' | 'public';
            collaborators: Array<{,
                userId: string;
                name: string;
                role: 'viewer' | 'editor' | 'admin';
                addedAt: string;
            }>;
            shareUrl?: string;
            expiresAt?: string;
        };
    };
    graph: {
        nodes: Node[];
        edges: AnnotatedEdge[];
        settings: {
            canvasPosition: {
                x: number;
                y: number;
                zoom: number;
            };
            theme?: string;
            gridVisible?: boolean;
            snapToGrid?: boolean;
            readonly?: boolean;
        };
    };
    annotations: {
        connectionLabels: Array<{,
            edgeId: string;
            label: string;
            style?: any;
            position?: any;
            visible: boolean;
        }>;
        stickyNotes: Array<{,
            id: string;
            position: {
                x: number;
                y: number;
            };
            size: {
                width: number;
                height: number;
            };
            content: string;
            color: string;
            fontSize: number;
            author: string;
            createdAt: string;
            updatedAt: string;
            visible: boolean;
        }>;
        nodeLabels: Array<{,
            nodeId: string;
            label?: string;
            description?: string;
            tags: string[];
            color?: string;
            notes?: string;
        }>;
        regions: Array<{,
            id: string;
            name: string;
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
            color: string;
            opacity: number;
            nodeIds: string[];
            description?: string;
            collapsed: boolean;
        }>;
        comments: Array<{,
            id: string;
            content: string;
            author: string;
            timestamp: string;
            position?: {
                x: number;
                y: number;
            };
            targetType: 'node' | 'edge' | 'region' | 'canvas';
            targetId?: string;
            resolved: boolean;
            replies: Array<{,
                id: string;
                content: string;
                author: string;
                timestamp: string;
            }>;
        }>;
    };
    collaboration: {
        changeHistory: Array<{,
            id: string;
            timestamp: string;
            author: string;
            operation: string;
            target: string;
            before?: any;
            after?: any;
            description: string;
        }>;
        conflicts: Array<{,
            id: string;
            timestamp: string;
            type: 'merge' | 'edit' | 'delete';
            targetType: 'node' | 'edge' | 'annotation';
            targetId: string;
            authors: string[];
            resolved: boolean;
            resolution?: any;
        }>;
        lastSync: string;
        syncStatus: 'synced' | 'pending' | 'conflict' | 'offline'
  };
    compatibility: {
        minVersion: string;
        features: string[];
        warnings: string[];
        errors: string[];
    };

export declare class GraphSharingService {
    private static instance;
    private sharedGraphs;
    static getInstance(): GraphSharingService;
    /**
     * Export graph with all annotations for sharing
     */
    exportForSharing(nodes: Node[], edges: AnnotatedEdge[], annotations: any | undefined, metadata: Partial<SharedGraphFormat["metadata"]> | undefined, options: {)
        includeHistory?: boolean;
        includeComments?: boolean;
        permissions?: SharedGraphFormat['metadata']['sharing']['permissions'];
        author: {
            id: string;
            name: string;
            email?: string;
        };
    }): Promise<SharedGraphFormat>;
    /**
     * Import shared graph with validation
     */
    importSharedGraph(sharedGraph: SharedGraphFormat, options?: {)
        validateIntegrity?: boolean;
        mergeConflicts?: 'overwrite' | 'merge' | 'ask';
        preserveAnnotations?: boolean;
    }): Promise<{
        success: boolean;
        graph?: {
            nodes: Node[];
            edges: AnnotatedEdge[];
        };
        annotations?: SharedGraphFormat['annotations'];
        errors?: string[];
        warnings?: string[];
    }>;
    /**
     * Validate shared graph format and integrity
     */
    private validateSharedGraph;
    /**
     * Create a new version of a shared graph
     */
    createVersion(baseGraph: SharedGraphFormat, changes: {)
        nodes?: Node[];
        edges?: AnnotatedEdge[];
        annotations?: Partial<SharedGraphFormat['annotations']>;
        changeDescription: string;
        author: {
            id: string;
            name: string;
        };
    }): Promise<SharedGraphFormat>;
    /**
     * Generate shareable URL for a graph
     */
    private generateShareUrl;
    /**
     * Sanitize nodes for sharing (remove sensitive data)
     */
    private sanitizeNodes;
    /**
     * Sanitize edges for sharing
     */
    private sanitizeEdges;
    /**
     * Extract node labels from node data
     */
    private extractNodeLabels;
    /**
     * Import nodes with annotation restoration
     */
    private importNodes;
    /**
     * Import edges with label restoration
     */
    private importEdges;
    /**
     * Utility methods
     */
    private generateExportId;
    private generateChangeId;
    /**
     * Get shared graph by ID
     */
    getSharedGraph(exportId: string): SharedGraphFormat | null;
    /**
     * List all shared graphs for a user
     */
    getUserSharedGraphs(userId: string): SharedGraphFormat[];
    /**
     * Update sharing permissions
     */
    updateSharingPermissions();
      exportId: string,
      permissions: SharedGraphFormat['metadata']['sharing']['permissions'],
      collaborators?: SharedGraphFormat['metadata']['sharing']['collaborators']
    ): boolean;

export declare export declare const importSharedGraph: (sharedGraph: SharedGraphFormat, options?: any) => Promise<{
    success: boolean;
    graph?: {
        nodes: Node[];
        edges: AnnotatedEdge[];
    };
    annotations?: SharedGraphFormat["annotations"];
    errors?: string[];
    warnings?: string[];
}>;
export declare //# sourceMappingURL=GraphSharingService.d.ts.map