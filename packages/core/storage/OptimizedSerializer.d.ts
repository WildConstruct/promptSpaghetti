/**
 * Optimized Project Serialization System
 * Implements compression, binary formats, and incremental serialization for large graphs
 */
import { PSGFile } from '../projectManager';
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
/**
 * Serialization result with performance metrics
 */
export interface SerializationResult {
    data: string | ArrayBuffer;
    format: string;
    size: number;
    compressionRatio?: number;
    serializationTime: number;
    chunks?: number;
}
/**
 * Performance-optimized serialization system
 */
export declare class OptimizedSerializer {
    private static readonly LARGE_GRAPH_THRESHOLD;
    private static readonly COMPRESSION_THRESHOLD;
    private incrementalState;
    /**
     * Serialize project with optimal format selection
     */
    serialize(projectData: PSGFile, options?: SerializationOptions): Promise<SerializationResult>;
    /**
     * Deserialize with automatic format detection
     */
    deserialize(data: string | ArrayBuffer): Promise<PSGFile>;
    /**
     * Incremental serialization - only serialize changes
     */
    serializeIncremental();
      projectData: PSGFile,
      projectId: string,
      options?: SerializationOptions
    ): Promise<SerializationResult & {
        isIncremental: boolean;
        deltaSize: number;
    }>;
    /**
     * Get serialization performance metrics
     */
    getMetrics(): {
        averageSerializationTime: number;
        totalSerializations: number;
        compressionStats: {,
            averageRatio: number;
            timeSaved: number;
        };
    };
    private optimizeOptions;
    private estimateSize;
    private serializeToJSON;
    private serializeToBinary;
    private serializeCompressed;
    private deserializeBinary;
    private compressString;
    private decompressData;
    private reassembleChunks;
    private createDelta;
    private calculateChecksum;
    private simpleLZCompress;
}
//# sourceMappingURL=OptimizedSerializer.d.ts.map