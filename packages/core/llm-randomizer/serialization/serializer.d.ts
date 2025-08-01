import { Graph } from '../../graphSchema';

}
}
export interface SerializationMetadata { name?: string;
    description?: string;
    author?: string;
    created?: string;
    tags?: string[] }
}
}
export interface SerializationOptions { includeChecksum?: boolean;
    includeMetadata?: boolean;
    compactFormat?: boolean;
    validateOnSerialize?: boolean;

export declare class GraphSerializer {
    private static readonly FORMAT_VERSION;
    private static readonly SECTION_DELIMITERS;
    /**
     * Serialize a graph to LLM-friendly format
     */
    static serialize(graph: Graph, metadata?: SerializationMetadata, options?: SerializationOptions): string;
    /**
     * Serialize an individual node to YAML format
     */
    private static serializeNode;
    /**
     * Extract properties from a node based on its type
     */
    private static extractNodeProperties;
    /**
     * Serialize a value to YAML format
     */
    private static serializeValue;
    /**
     * Extract edges from graph nodes
     */
    private static extractEdges;
    /**
     * Calculate SHA-256 checksum for integrity verification
     */
    private static calculateChecksum;
    /**
     * Validate graph structure before serialization
     */
    private static validateGraph;
    /**
     * Detect cycles in the graph using DFS
     */
    private static detectCycles;
/**
 * Utility function for easy serialization
 */
export declare function serializeGraph(graph: Graph)
  metadata?: SerializationMetadata }
  options?: SerializationOptions
): string;
/**
 * Create default metadata for a graph
 */
export declare function createDefaultMetadata(): SerializationMetadata;
//# sourceMappingURL=serializer.d.ts.map
}
}