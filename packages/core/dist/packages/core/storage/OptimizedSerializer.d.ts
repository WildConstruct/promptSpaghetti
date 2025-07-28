/**
 * Serialization format options
 */
export interface SerializationOptions {
    format: 'json' | 'binary' | 'compressed';
    compression?: 'gzip' | 'lz4' | 'brotli';
    prettyPrint?: boolean;
    incremental?: boolean;
    splitLargeGraphs?: boolean;
    includeMetadata?: boolean;
}
export interface SerializationResult {
    data: string | ArrayBuffer;
    format: string;
    size: number;
    compressionRatio?: number;
    serializationTime: number;
    chunks?: number;
}
export declare class OptimizedSerializer {
    private static readonly LARGE_GRAPH_THRESHOLD;
    private static readonly COMPRESSION_THRESHOLD;
    private incrementalState;
    /**
     * Serialize project with optimal format selection
     */
    serialize(): any;
}
//# sourceMappingURL=OptimizedSerializer.d.ts.map