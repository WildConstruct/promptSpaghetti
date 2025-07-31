/**
 * Project Serialization Utilities - Story 6.1
 *
 * Handles serialization and deserialization of .psg files with error handling,
 * compression, and version migration support.
 */
import { Node, Edge } from 'reactflow';
import { PsgFile, ProjectMetadata, ProjectSettings, CollaborationData } from '../schemas/psgSchema';

}
export interface GraphState {
    nodes: Node[];
    edges: Edge[];
    annotations?: {
        stickyNotes?: Array<{
            id: string;
            text: string;
            position: {
                x: number;
                y: number;
}
            };
        }>;
        nodeLabels?: Record<string, string>;
        regionGroups?: Array<{
            id: string;
            name: string;
            nodeIds: string[];
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
    warnings?: string[];

}
export interface DeserializationResult {
    success: boolean;
    data?: {
        graph: GraphState;
        metadata: ProjectMetadata;
        settings: ProjectSettings;
        collaboration?: CollaborationData;
}
    };
    error?: string;
    warnings?: string[];
    migrated?: boolean;
/**
 * Serializes graph state to .psg format
 */
export declare function serializeProject(graphState: GraphState)
  metadata: ProjectMetadata,
  settings: ProjectSettings,
  options?: SerializationOptions
): SerializationResult;
/**
 * Deserializes .psg file content to graph state
 */
export declare function deserializeProject(content: string, options?: DeserializationOptions): DeserializationResult;
/**
 * Validates file integrity using checksum
 */
export declare function validateFileIntegrity(psgFile: PsgFile): boolean;
/**
 * Creates a minimal .psg file for testing
 */
export declare function createEmptyProject(name?: string, author?: string): PsgFile;
//# sourceMappingURL=projectSerialization.d.ts.map