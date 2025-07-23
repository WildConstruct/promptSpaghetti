/**
 * Compression Service - Epic 17 Implementation
 * Task: E17-1753114397281-ACAEC8 - Implement compression
 *
 * Comprehensive compression utility service supporting multiple compression
 * algorithms for data storage, transfer, and performance optimization.
 */
import { gzip, gunzip, deflate, inflate, brotliCompress, brotliDecompress } from 'zlib';
import { promisify } from 'util';
import { z } from 'zod';
// Promisify compression functions for async/await usage
const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);
const deflateAsync = promisify(deflate);
const inflateAsync = promisify(inflate);
const brotliCompressAsync = promisify(brotliCompress);
const brotliDecompressAsync = promisify(brotliDecompress);
// =============================================================================
// Types and Enums
// =============================================================================
export var CompressionAlgorithm;
(function (CompressionAlgorithm) {
    CompressionAlgorithm["GZIP"] = "gzip";
    CompressionAlgorithm["DEFLATE"] = "deflate";
    CompressionAlgorithm["BROTLI"] = "brotli";
    CompressionAlgorithm["LZ4"] = "lz4";
    CompressionAlgorithm["NONE"] = "none";
})(CompressionAlgorithm || (CompressionAlgorithm = {}));
export var CompressionLevel;
(function (CompressionLevel) {
    CompressionLevel[CompressionLevel["FASTEST"] = 1] = "FASTEST";
    CompressionLevel[CompressionLevel["FAST"] = 3] = "FAST";
    CompressionLevel[CompressionLevel["BALANCED"] = 6] = "BALANCED";
    CompressionLevel[CompressionLevel["BEST"] = 9] = "BEST";
})(CompressionLevel || (CompressionLevel = {}));
export var DataType;
(function (DataType) {
    DataType["TEXT"] = "text";
    DataType["JSON"] = "json";
    DataType["BINARY"] = "binary";
    DataType["HTML"] = "html";
    DataType["CSS"] = "css";
    DataType["JAVASCRIPT"] = "javascript";
    DataType["IMAGE"] = "image";
    DataType["VIDEO"] = "video";
    DataType["AUDIO"] = "audio";
})(DataType || (DataType = {}));
// Validation schemas
export const CompressionOptionsSchema = z.object({
    algorithm: z.nativeEnum(CompressionAlgorithm),
    level: z.nativeEnum(CompressionLevel),
    dataType: z.nativeEnum(DataType),
    threshold: z.number().min(0).optional(),
    chunkSize: z.number().min(1024).max(1024 * 1024).optional(), // 1KB - 1MB
    includeMetadata: z.boolean().optional()
});
// =============================================================================
// Main Compression Service
// =============================================================================
export class CompressionService {
    stats;
    defaultOptions;
    algorithmMap;
    constructor() {
        this.stats = this.initializeStats();
        this.defaultOptions = {
            algorithm: CompressionAlgorithm.GZIP,
            level: CompressionLevel.BALANCED,
            dataType: DataType.TEXT,
            threshold: 1024, // Don't compress data smaller than 1KB
            chunkSize: 64 * 1024, // 64KB chunks for streaming
            includeMetadata: true
        };
        this.algorithmMap = new Map([
            [CompressionAlgorithm.GZIP, new GzipProcessor()],
            [CompressionAlgorithm.DEFLATE, new DeflateProcessor()],
            [CompressionAlgorithm.BROTLI, new BrotliProcessor()],
            [CompressionAlgorithm.NONE, new NoCompressionProcessor()]
        ]);
    }
    // =============================================================================
    // Primary Compression Methods
    // =============================================================================
    /**
     * Compress data using the specified options
     */
    async compress(data, options = {}) {
        const startTime = performance.now();
        const opts = { ...this.defaultOptions, ...options };
        try {
            // Validate options
            CompressionOptionsSchema.parse(opts);
            // Convert data to buffer
            const inputBuffer = this.prepareInputBuffer(data, opts.dataType);
            const originalSize = inputBuffer.length;
            // Check threshold - don't compress if data is too small
            if (opts.threshold && originalSize < opts.threshold) {
                return {
                    success: true,
                    originalSize,
                    compressedSize: originalSize,
                    compressionRatio: 1.0,
                    algorithm: CompressionAlgorithm.NONE,
                    level: opts.level,
                    compressionTime: performance.now() - startTime,
                    data: inputBuffer
                };
            }
            // Get appropriate compression processor
            const processor = this.algorithmMap.get(opts.algorithm);
            if (!processor) {
                throw new Error(`Unsupported compression algorithm: ${opts.algorithm}`);
            }
            // Perform compression
            const compressedData = await processor.compress(inputBuffer, opts);
            const compressedSize = compressedData.length;
            const compressionTime = performance.now() - startTime;
            const compressionRatio = compressedSize / originalSize;
            // Create metadata if requested
            let metadata;
            if (opts.includeMetadata) {
                metadata = {
                    algorithm: opts.algorithm,
                    level: opts.level,
                    originalSize,
                    compressedAt: new Date(),
                    dataType: opts.dataType,
                    checksum: this.calculateChecksum(inputBuffer),
                    version: '1.0.0'
                };
            }
            // Update statistics
            this.updateCompressionStats(opts.algorithm, originalSize, compressedSize, compressionTime);
            const result = {
                success: true,
                originalSize,
                compressedSize,
                compressionRatio,
                algorithm: opts.algorithm,
                level: opts.level,
                compressionTime,
                data: compressedData,
                metadata
            };
            return result;
        }
        catch (error) {
            const compressionTime = performance.now() - startTime;
            return {
                success: false,
                originalSize: 0,
                compressedSize: 0,
                compressionRatio: 1.0,
                algorithm: opts.algorithm,
                level: opts.level,
                compressionTime,
                data: Buffer.alloc(0),
                error: error instanceof Error ? error.message : 'Unknown compression error'
            };
        }
    }
    /**
     * Decompress data
     */
    async decompress(data, algorithm, metadata) {
        const startTime = performance.now();
        try {
            // Determine algorithm from metadata or parameter
            const algo = algorithm || metadata?.algorithm || CompressionAlgorithm.GZIP;
            // Get appropriate processor
            const processor = this.algorithmMap.get(algo);
            if (!processor) {
                throw new Error(`Unsupported decompression algorithm: ${algo}`);
            }
            // Perform decompression
            const decompressedData = await processor.decompress(data);
            const decompressionTime = performance.now() - startTime;
            // Update statistics
            this.updateDecompressionStats(algo, data.length, decompressedData.length, decompressionTime);
            // Verify checksum if available
            if (metadata?.checksum) {
                const calculatedChecksum = this.calculateChecksum(decompressedData);
                if (calculatedChecksum !== metadata.checksum) {
                    throw new Error('Decompressed data checksum mismatch - data may be corrupted');
                }
            }
            return decompressedData;
        }
        catch (error) {
            throw new Error(`Decompression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // =============================================================================
    // Convenience Methods for Different Data Types
    // =============================================================================
    /**
     * Compress JSON data with optimized settings
     */
    async compressJSON(data, level = CompressionLevel.BALANCED) {
        return this.compress(data, {
            algorithm: CompressionAlgorithm.GZIP,
            level,
            dataType: DataType.JSON,
            threshold: 512, // Lower threshold for JSON
            includeMetadata: true
        });
    }
    /**
     * Decompress JSON data and parse
     */
    async decompressJSON(data, metadata) {
        const decompressed = await this.decompress(data, undefined, metadata);
        return JSON.parse(decompressed.toString('utf8'));
    }
    /**
     * Compress text with optimal settings
     */
    async compressText(text, algorithm = CompressionAlgorithm.GZIP) {
        return this.compress(text, {
            algorithm,
            level: CompressionLevel.BALANCED,
            dataType: DataType.TEXT,
            threshold: 256
        });
    }
    /**
     * Decompress and return text
     */
    async decompressText(data, algorithm) {
        const decompressed = await this.decompress(data, algorithm);
        return decompressed.toString('utf8');
    }
    /**
     * Compress HTML with Brotli for optimal web delivery
     */
    async compressHTML(html, level = CompressionLevel.BEST) {
        return this.compress(html, {
            algorithm: CompressionAlgorithm.BROTLI,
            level,
            dataType: DataType.HTML,
            threshold: 512
        });
    }
    /**
     * Compress CSS with optimal settings
     */
    async compressCSS(css) {
        return this.compress(css, {
            algorithm: CompressionAlgorithm.BROTLI,
            level: CompressionLevel.BEST,
            dataType: DataType.CSS,
            threshold: 256
        });
    }
    /**
     * Compress JavaScript with optimal settings
     */
    async compressJavaScript(js) {
        return this.compress(js, {
            algorithm: CompressionAlgorithm.BROTLI,
            level: CompressionLevel.BALANCED,
            dataType: DataType.JAVASCRIPT,
            threshold: 512
        });
    }
    // =============================================================================
    // Streaming Compression
    // =============================================================================
    /**
     * Compress data in streaming fashion for large datasets
     */
    async compressStream(data, options) {
        const startTime = performance.now();
        const opts = { ...this.defaultOptions, ...options };
        const chunks = [];
        const chunkSize = opts.chunkSize || 64 * 1024;
        try {
            let totalProcessed = 0;
            for (let offset = 0; offset < data.length; offset += chunkSize) {
                const chunk = data.slice(offset, offset + chunkSize);
                const isLastChunk = offset + chunkSize >= data.length;
                const compressedChunk = await this.compress(chunk, {
                    ...opts,
                    includeMetadata: false
                });
                if (compressedChunk.success) {
                    chunks.push(compressedChunk.data);
                }
                totalProcessed += chunk.length;
                // Report progress
                if (opts.onProgress) {
                    opts.onProgress(totalProcessed, data.length);
                }
                // Emit chunk
                if (opts.onChunk) {
                    opts.onChunk(compressedChunk.data, isLastChunk);
                }
            }
            const finalData = Buffer.concat(chunks);
            const compressionTime = performance.now() - startTime;
            return {
                success: true,
                originalSize: data.length,
                compressedSize: finalData.length,
                compressionRatio: finalData.length / data.length,
                algorithm: opts.algorithm,
                level: opts.level,
                compressionTime,
                data: finalData
            };
        }
        catch (error) {
            return {
                success: false,
                originalSize: data.length,
                compressedSize: 0,
                compressionRatio: 1.0,
                algorithm: opts.algorithm,
                level: opts.level,
                compressionTime: performance.now() - startTime,
                data: Buffer.alloc(0),
                error: error instanceof Error ? error.message : 'Streaming compression failed'
            };
        }
    }
    // =============================================================================
    // Algorithm Selection and Optimization
    // =============================================================================
    /**
     * Automatically select the best compression algorithm for given data
     */
    async selectOptimalAlgorithm(data, dataType) {
        const inputBuffer = this.prepareInputBuffer(data, dataType);
        // Small data - no compression
        if (inputBuffer.length < 512) {
            return CompressionAlgorithm.NONE;
        }
        // Algorithm selection based on data type and size
        switch (dataType) {
            case DataType.JSON:
            case DataType.TEXT:
                return inputBuffer.length > 50000 ? CompressionAlgorithm.BROTLI : CompressionAlgorithm.GZIP;
            case DataType.HTML:
            case DataType.CSS:
            case DataType.JAVASCRIPT:
                return CompressionAlgorithm.BROTLI;
            case DataType.BINARY:
                return inputBuffer.length > 100000 ? CompressionAlgorithm.DEFLATE : CompressionAlgorithm.GZIP;
            default:
                return CompressionAlgorithm.GZIP;
        }
    }
    /**
     * Benchmark different algorithms on sample data
     */
    async benchmarkAlgorithms(data, dataType) {
        const results = new Map();
        const algorithms = [
            CompressionAlgorithm.GZIP,
            CompressionAlgorithm.DEFLATE,
            CompressionAlgorithm.BROTLI
        ];
        for (const algorithm of algorithms) {
            try {
                const result = await this.compress(data, {
                    algorithm,
                    level: CompressionLevel.BALANCED,
                    dataType,
                    includeMetadata: false
                });
                results.set(algorithm, result);
            }
            catch (error) {
                // Skip failed algorithms
            }
        }
        return results;
    }
    // =============================================================================
    // Statistics and Monitoring
    // =============================================================================
    /**
     * Get current compression statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = this.initializeStats();
    }
    /**
     * Get algorithm-specific statistics
     */
    getAlgorithmStats(algorithm) {
        return this.stats.algorithmStats.get(algorithm) || null;
    }
    /**
     * Get compression efficiency report
     */
    getEfficiencyReport() {
        const totalOriginal = this.stats.totalBytesCompressed;
        const totalCompressed = Array.from(this.stats.algorithmStats.values())
            .reduce((sum, stat) => sum + (stat.totalBytesProcessed * (1 - stat.averageCompressionRatio)), 0);
        const bestAlgorithm = Array.from(this.stats.algorithmStats.entries())
            .reduce((best, [algo, stat]) => stat.averageCompressionRatio < best[1].averageCompressionRatio ? [algo, stat] : best)[0];
        return {
            totalSpaceSaved: totalOriginal - totalCompressed,
            averageCompressionRatio: this.stats.averageCompressionRatio,
            bestPerformingAlgorithm: bestAlgorithm,
            recommendedSettings: {
                algorithm: bestAlgorithm,
                level: CompressionLevel.BALANCED,
                dataType: DataType.TEXT,
                threshold: 1024,
                includeMetadata: true
            }
        };
    }
    // =============================================================================
    // Private Helper Methods
    // =============================================================================
    prepareInputBuffer(data, dataType) {
        if (Buffer.isBuffer(data)) {
            return data;
        }
        if (typeof data === 'string') {
            return Buffer.from(data, 'utf8');
        }
        if (dataType === DataType.JSON) {
            return Buffer.from(JSON.stringify(data), 'utf8');
        }
        return Buffer.from(String(data), 'utf8');
    }
    calculateChecksum(data) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    initializeStats() {
        return {
            totalCompressions: 0,
            totalDecompressions: 0,
            totalBytesCompressed: 0,
            totalBytesDecompressed: 0,
            totalCompressionTime: 0,
            totalDecompressionTime: 0,
            averageCompressionRatio: 1.0,
            algorithmStats: new Map()
        };
    }
    updateCompressionStats(algorithm, originalSize, compressedSize, timeMs) {
        this.stats.totalCompressions++;
        this.stats.totalBytesCompressed += originalSize;
        this.stats.totalCompressionTime += timeMs;
        // Update average compression ratio
        const totalCompressed = this.stats.totalBytesCompressed;
        const ratio = compressedSize / originalSize;
        this.stats.averageCompressionRatio =
            (this.stats.averageCompressionRatio * (this.stats.totalCompressions - 1) + ratio) / this.stats.totalCompressions;
        // Update algorithm-specific stats
        let algorithmStat = this.stats.algorithmStats.get(algorithm);
        if (!algorithmStat) {
            algorithmStat = {
                algorithm,
                usageCount: 0,
                totalBytesProcessed: 0,
                totalProcessingTime: 0,
                averageCompressionRatio: 1.0,
                averageSpeed: 0
            };
            this.stats.algorithmStats.set(algorithm, algorithmStat);
        }
        algorithmStat.usageCount++;
        algorithmStat.totalBytesProcessed += originalSize;
        algorithmStat.totalProcessingTime += timeMs;
        algorithmStat.averageCompressionRatio =
            (algorithmStat.averageCompressionRatio * (algorithmStat.usageCount - 1) + ratio) / algorithmStat.usageCount;
        algorithmStat.averageSpeed = algorithmStat.totalBytesProcessed / algorithmStat.totalProcessingTime;
    }
    updateDecompressionStats(algorithm, compressedSize, decompressedSize, timeMs) {
        this.stats.totalDecompressions++;
        this.stats.totalBytesDecompressed += decompressedSize;
        this.stats.totalDecompressionTime += timeMs;
    }
}
// =============================================================================
// Algorithm Processors
// =============================================================================
class AlgorithmProcessor {
}
class GzipProcessor extends AlgorithmProcessor {
    async compress(data, options) {
        return gzipAsync(data, { level: options.level });
    }
    async decompress(data) {
        return gunzipAsync(data);
    }
}
class DeflateProcessor extends AlgorithmProcessor {
    async compress(data, options) {
        return deflateAsync(data, { level: options.level });
    }
    async decompress(data) {
        return inflateAsync(data);
    }
}
class BrotliProcessor extends AlgorithmProcessor {
    async compress(data, options) {
        return brotliCompressAsync(data, {
            params: {
                [require('zlib').constants.BROTLI_PARAM_QUALITY]: options.level
            }
        });
    }
    async decompress(data) {
        return brotliDecompressAsync(data);
    }
}
class NoCompressionProcessor extends AlgorithmProcessor {
    async compress(data) {
        return data;
    }
    async decompress(data) {
        return data;
    }
}
// =============================================================================
// Singleton Instance
// =============================================================================
export const compressionService = new CompressionService();
export default CompressionService;
