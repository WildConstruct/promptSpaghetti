import { Node, Edge } from 'reactflow';
import { ProjectMetadata, ProjectSettings, CollaborationData } from '../schemas/psgSchema';
export interface GraphState {
    nodes: Node;
    edges: Edge;
    annotations?: {
        stickyNotes?: Array<{
            id: string;
            text: string;
            position: {
                x: number;
                y: number;
            };
        }>;
        nodeLabels?: Record<string, string>;
        regionGroups?: Array<{
            id: string;
            name: string;
            nodeIds: string;
        }>;
        connectionLabels?: Record<string, string>;
        [key: string]: unknown;
    };
}
export interface SerializationOptions {
    includeMetadata?: boolean;
    includeSettings?: boolean;
    includeCollaboration?: boolean;
    compress?: boolean;
    validateOutput?: boolean;
}
export interface DeserializationOptions {
    skipValidation?: boolean;
    autoMigrate?: boolean;
    preserveIds?: boolean;
}
export interface SerializationResult {
    success: boolean;
    data?: string;
    error?: string;
    warnings?: string;
}
export interface DeserializationResult {
    success: boolean;
    data?: {
        graph: GraphState;
        metadata: ProjectMetadata;
        settings: ProjectSettings;
        collaboration?: CollaborationData;
    };
    error?: string;
    warnings?: string;
    migrated?: boolean;
}
export declare function serializeProject(graphState: GraphState): any;
//# sourceMappingURL=projectSerialization.d.ts.map