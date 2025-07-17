import { Graph } from '../../graphSchema';
export interface SerializationMetadata {
    name?: string;
    description?: string;
    author?: string;
    created?: string;
    tags?: string[];
}
export interface SerializationOptions {
    includeChecksum?: boolean;
    includeMetadata?: boolean;
    compactFormat?: boolean;
    validateOnSerialize?: boolean;
}
export declare class GraphSerializer {
    private static readonly FORMAT_VERSION;
    private static readonly SECTION_DELIMITERS;
    static serialize(graph: Graph, metadata?: SerializationMetadata, options?: SerializationOptions): string;
    private static serializeNode;
    private static extractNodeProperties;
    private static serializeValue;
    private static extractEdges;
    private static calculateChecksum;
    private static validateGraph;
    private static detectCycles;
}
export declare function serializeGraph(graph: Graph, metadata?: SerializationMetadata, options?: SerializationOptions): string;
export declare function createDefaultMetadata(): SerializationMetadata;
//# sourceMappingURL=serializer.d.ts.map