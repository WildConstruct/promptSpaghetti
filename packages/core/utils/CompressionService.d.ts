/**
 * Compression Service - Epic 17 Implementation
 * Task: E17-1753114397281-ACAEC8 - Implement compression
 *
 * Comprehensive compression utility service supporting multiple compression
 * algorithms for data storage, transfer, and performance optimization.
 */
import { z } from 'zod';
export declare enum CompressionAlgorithm {
    GZIP = "gzip",
    DEFLATE = "deflate",
    BROTLI = "brotli",
    LZ4 = "lz4",
    NONE = "none"
}
export declare enum CompressionLevel {
    FASTEST = 1,
    FAST = 3,
    BALANCED = 6,
    BEST = 9
}
export declare enum DataType {
    TEXT = "text",
    JSON = "json",
    BINARY = "binary",
    HTML = "html",
    CSS = "css",
    JAVASCRIPT = "javascript",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio"
}
export interface CompressionOptions {
    algorithm: CompressionAlgorithm;
    level: CompressionLevel;
    dataType: DataType;
    threshold?: number;
    chunkSize?: number;
    includeMetadata?: boolean;
}
export interface CompressionResult {
    success: boolean;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    algorithm: CompressionAlgorithm;
    level: CompressionLevel;
    compressionTime: number;
    data: Buffer;
    metadata?: CompressionMetadata;
    error?: string;
}
export interface CompressionMetadata {
    algorithm: CompressionAlgorithm;
    level: CompressionLevel;
    originalSize: number;
    compressedAt: Date;
    dataType: DataType;
    checksum?: string;
    version: string;
}
export interface CompressionStats {
    totalCompressions: number;
    totalDecompressions: number;
    totalBytesCompressed: number;
    totalBytesDecompressed: number;
    totalCompressionTime: number;
    totalDecompressionTime: number;
    averageCompressionRatio: number;
    algorithmStats: Map<CompressionAlgorithm, AlgorithmStats>;
}
export interface AlgorithmStats {
    algorithm: CompressionAlgorithm;
    usageCount: number;
    totalBytesProcessed: number;
    totalProcessingTime: number;
    averageCompressionRatio: number;
    averageSpeed: number;
}
export interface StreamCompressionOptions extends CompressionOptions {
    bufferSize?: number;
    onProgress?: (bytesProcessed: number, totalBytes?: number) => void;
    onChunk?: (chunk: Buffer, isLast: boolean) => void;
}
export declare const CompressionOptionsSchema: z.ZodObject<{
    algorithm: z.ZodNativeEnum<typeof CompressionAlgorithm>;
    level: z.ZodNativeEnum<typeof CompressionLevel>;
    dataType: z.ZodNativeEnum<typeof DataType>;
    threshold: z.ZodOptional<z.ZodNumber>;
    chunkSize: z.ZodOptional<z.ZodNumber>;
    includeMetadata: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    level: CompressionLevel;
    dataType: DataType;
    algorithm: CompressionAlgorithm;
    includeMetadata?: boolean | undefined;
    threshold?: number | undefined;
    chunkSize?: number | undefined;
}, {
    level: CompressionLevel;
    dataType: DataType;
    algorithm: CompressionAlgorithm;
    includeMetadata?: boolean | undefined;
    threshold?: number | undefined;
    chunkSize?: number | undefined;
}>;
export declare class CompressionService {
    private stats;
    private defaultOptions;
    private algorithmMap;
    constructor();
    /**
     * Compress data using the specified options
     */
    compress(data: string | Buffer | object, options?: Partial<CompressionOptions>): Promise<CompressionResult>;
    /**
     * Decompress data
     */
    decompress(data: Buffer, algorithm?: CompressionAlgorithm, metadata?: CompressionMetadata): Promise<Buffer>;
    /**
     * Compress JSON data with optimized settings
     */
    compressJSON(data: object, level?: CompressionLevel): Promise<CompressionResult>;
    /**
     * Decompress JSON data and parse
     */
    decompressJSON(data: Buffer, metadata?: CompressionMetadata): Promise<any>;
    /**
     * Compress text with optimal settings
     */
    compressText(text: string, algorithm?: CompressionAlgorithm): Promise<CompressionResult>;
    /**
     * Decompress and return text
     */
    decompressText(data: Buffer, algorithm?: CompressionAlgorithm): Promise<string>;
    /**
     * Compress HTML with Brotli for optimal web delivery
     */
    compressHTML(html: string, level?: CompressionLevel): Promise<CompressionResult>;
    /**
     * Compress CSS with optimal settings
     */
    compressCSS(css: string): Promise<CompressionResult>;
    /**
     * Compress JavaScript with optimal settings
     */
    compressJavaScript(js: string): Promise<CompressionResult>;
    /**
     * Compress data in streaming fashion for large datasets
     */
    compressStream(data: Buffer, options: StreamCompressionOptions): Promise<CompressionResult>;
    /**
     * Automatically select the best compression algorithm for given data
     */
    selectOptimalAlgorithm(data: string | Buffer | object, dataType: DataType): Promise<CompressionAlgorithm>;
    /**
     * Benchmark different algorithms on sample data
     */
    benchmarkAlgorithms(
      data: string | Buffer | object,
      dataType: DataType
    ): Promise<Map<CompressionAlgorithm, CompressionResult>>;
    /**
     * Get current compression statistics
     */
    getStats(): CompressionStats;
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Get algorithm-specific statistics
     */
    getAlgorithmStats(algorithm: CompressionAlgorithm): AlgorithmStats | null;
    /**
     * Get compression efficiency report
     */
    getEfficiencyReport(): {
        totalSpaceSaved: number;
        averageCompressionRatio: number;
        bestPerformingAlgorithm: CompressionAlgorithm;
        recommendedSettings: CompressionOptions;
    };
    private prepareInputBuffer;
    private calculateChecksum;
    private initializeStats;
    private updateCompressionStats;
    private updateDecompressionStats;
}
export declare const compressionService: CompressionService;
export default CompressionService;
//# sourceMappingURL=CompressionService.d.ts.map