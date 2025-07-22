/**
 * Compression Middleware - Epic 17 Implementation
 * Task: E17-1753114397281-ACAEC8 - Implement compression
 * 
 * Fastify middleware for HTTP response compression with automatic
 * content-type detection and optimal algorithm selection.
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { compressionService, CompressionAlgorithm, CompressionLevel, DataType } from '../../packages/core/utils/CompressionService';

export interface CompressionMiddlewareOptions {
  threshold?: number; // Minimum response size to compress (bytes)
  level?: CompressionLevel;
  algorithms?: CompressionAlgorithm[];
  excludeContentTypes?: string[];
  includeContentTypes?: string[];
  enableBrotli?: boolean;
  enableGzip?: boolean;
  enableDeflate?: boolean;
  cacheCompressed?: boolean;
  maxCacheSize?: number; // MB
}

export interface CompressionStats {
  totalRequests: number;
  compressedRequests: number;
  totalBytesSaved: number;
  totalCompressionTime: number;
  algorithmUsage: Map<CompressionAlgorithm, number>;
  contentTypeStats: Map<string, {
    requests: number;
    bytesSaved: number;
    averageCompressionRatio: number;
  }>;
}

const DEFAULT_OPTIONS: CompressionMiddlewareOptions = {
  threshold: 1024, // 1KB
  level: CompressionLevel.BALANCED,
  algorithms: [CompressionAlgorithm.BROTLI, CompressionAlgorithm.GZIP, CompressionAlgorithm.DEFLATE],
  excludeContentTypes: [
    'image/',
    'video/',
    'audio/',
    'application/zip',
    'application/gzip',
    'application/compress',
    'application/octet-stream'
  ],
  includeContentTypes: [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml',
    'image/svg+xml'
  ],
  enableBrotli: true,
  enableGzip: true,
  enableDeflate: true,
  cacheCompressed: true,
  maxCacheSize: 100 // 100MB cache
};

/**
 * Compression middleware for Fastify
 */
export class CompressionMiddleware {
  private options: CompressionMiddlewareOptions;
  private stats: CompressionStats;
  private compressionCache: Map<string, { data: Buffer; algorithm: CompressionAlgorithm; timestamp: number }>;
  private cacheSize: number = 0; // Current cache size in bytes
  
  constructor(options: Partial<CompressionMiddlewareOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.stats = this.initializeStats();
    this.compressionCache = new Map();
    
    // Start cache cleanup interval
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // Every 5 minutes
  }
  
  /**
   * Get the middleware handler for Fastify
   */
  public getHandler() {
    return async (request: FastifyRequest, reply: FastifyReply, next: () => void) => {
      // Skip compression if not supported by client
      const acceptEncoding = request.headers['accept-encoding'] as string || '';
      if (!this.clientSupportsCompression(acceptEncoding)) {
        return next();
      }
      
      // Intercept reply.send to compress response
      const originalSend = reply.send.bind(reply);
      
      reply.send = (payload: any) => {
        return this.compressResponse(request, reply, payload, originalSend, acceptEncoding);
      };
      
      next();
    };
  }
  
  /**
   * Compress response payload
   */
  private async compressResponse(
    request: FastifyRequest,
    reply: FastifyReply,
    payload: any,
    originalSend: (payload: any) => FastifyReply,
    acceptEncoding: string
  ): Promise<FastifyReply> {
    const startTime = performance.now();
    this.stats.totalRequests++;
    
    try {
      // Get content type
      const contentType = reply.getHeader('content-type') as string || 'application/octet-stream';
      
      // Check if compression should be applied
      if (!this.shouldCompress(payload, contentType)) {
        return originalSend(payload);
      }
      
      // Convert payload to buffer
      const originalData = this.preparePayload(payload);
      const originalSize = originalData.length;
      
      // Check size threshold
      if (originalSize < this.options.threshold!) {
        return originalSend(payload);
      }
      
      // Select optimal compression algorithm
      const algorithm = this.selectCompressionAlgorithm(acceptEncoding, contentType, originalSize);
      const dataType = this.mapContentTypeToDataType(contentType);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(originalData, algorithm, dataType);
      let compressedData: Buffer;
      let compressionTime: number;
      
      if (this.options.cacheCompressed && this.compressionCache.has(cacheKey)) {
        const cached = this.compressionCache.get(cacheKey)!;
        compressedData = cached.data;
        compressionTime = 0; // Cache hit
      } else {
        // Compress data
        const result = await compressionService.compress(originalData, {
          algorithm,
          level: this.options.level!,
          dataType,
          threshold: 0 // We already checked threshold
        });
        
        if (!result.success) {
          console.warn(`Compression failed for ${algorithm}:`, result.error);
          return originalSend(payload);
        }
        
        compressedData = result.data;
        compressionTime = result.compressionTime;
        
        // Cache the compressed result
        if (this.options.cacheCompressed) {
          this.cacheCompressedData(cacheKey, compressedData, algorithm);
        }
      }
      
      // Update statistics
      this.updateStats(algorithm, contentType, originalSize, compressedData.length, compressionTime);
      
      // Set compression headers
      reply.header('content-encoding', algorithm);
      reply.header('content-length', compressedData.length);
      reply.header('vary', 'Accept-Encoding');
      
      // Add compression info to response headers (for debugging/monitoring)
      if (process.env.NODE_ENV === 'development') {
        reply.header('x-compression-ratio', ((compressedData.length / originalSize) * 100).toFixed(2) + '%');
        reply.header('x-compression-algorithm', algorithm);
        reply.header('x-compression-time', compressionTime.toFixed(2) + 'ms');
        reply.header('x-compression-original-size', originalSize.toString());
        reply.header('x-compression-compressed-size', compressedData.length.toString());
      }
      
      // Send compressed response
      return originalSend(compressedData);
      
    } catch (error) {
      console.error('Compression middleware error:', error);
      // Fall back to uncompressed response
      return originalSend(payload);
    }
  }
  
  /**
   * Check if client supports compression
   */
  private clientSupportsCompression(acceptEncoding: string): boolean {
    const supported = ['gzip', 'deflate', 'br'].some(encoding => 
      acceptEncoding.toLowerCase().includes(encoding)
    );
    return supported;
  }
  
  /**
   * Determine if response should be compressed
   */
  private shouldCompress(payload: any, contentType: string): boolean {
    // Skip if no payload
    if (!payload) return false;
    
    // Check exclude list
    if (this.options.excludeContentTypes?.some(excluded => 
      contentType.toLowerCase().startsWith(excluded.toLowerCase())
    )) {
      return false;
    }
    
    // Check include list (if specified)
    if (this.options.includeContentTypes?.length) {
      return this.options.includeContentTypes.some(included => 
        contentType.toLowerCase().startsWith(included.toLowerCase())
      );
    }
    
    return true;
  }
  
  /**
   * Select optimal compression algorithm based on client support and content
   */
  private selectCompressionAlgorithm(
    acceptEncoding: string,
    contentType: string,
    payloadSize: number
  ): CompressionAlgorithm {
    const encoding = acceptEncoding.toLowerCase();
    
    // Priority order: Brotli > Gzip > Deflate
    if (this.options.enableBrotli && encoding.includes('br')) {
      return CompressionAlgorithm.BROTLI;
    }
    
    if (this.options.enableGzip && encoding.includes('gzip')) {
      return CompressionAlgorithm.GZIP;
    }
    
    if (this.options.enableDeflate && encoding.includes('deflate')) {
      return CompressionAlgorithm.DEFLATE;
    }
    
    // Fallback to Gzip (most widely supported)
    return CompressionAlgorithm.GZIP;
  }
  
  /**
   * Map HTTP content type to compression data type
   */
  private mapContentTypeToDataType(contentType: string): DataType {
    const ct = contentType.toLowerCase();
    
    if (ct.includes('json')) return DataType.JSON;
    if (ct.includes('html')) return DataType.HTML;
    if (ct.includes('css')) return DataType.CSS;
    if (ct.includes('javascript')) return DataType.JAVASCRIPT;
    if (ct.includes('text/')) return DataType.TEXT;
    if (ct.includes('xml')) return DataType.TEXT;
    
    return DataType.BINARY;
  }
  
  /**
   * Prepare payload for compression
   */
  private preparePayload(payload: any): Buffer {
    if (Buffer.isBuffer(payload)) {
      return payload;
    }
    
    if (typeof payload === 'string') {
      return Buffer.from(payload, 'utf8');
    }
    
    if (typeof payload === 'object') {
      return Buffer.from(JSON.stringify(payload), 'utf8');
    }
    
    return Buffer.from(String(payload), 'utf8');
  }
  
  /**
   * Generate cache key for compressed data
   */
  private generateCacheKey(data: Buffer, algorithm: CompressionAlgorithm, dataType: DataType): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    return `${hash}_${algorithm}_${dataType}`;
  }
  
  /**
   * Cache compressed data
   */
  private cacheCompressedData(key: string, data: Buffer, algorithm: CompressionAlgorithm): void {
    const maxCacheSizeBytes = (this.options.maxCacheSize || 100) * 1024 * 1024; // Convert MB to bytes
    
    // Check if cache is full
    if (this.cacheSize + data.length > maxCacheSizeBytes) {
      this.evictOldestCacheEntries(data.length);
    }
    
    this.compressionCache.set(key, {
      data,
      algorithm,
      timestamp: Date.now()
    });
    
    this.cacheSize += data.length;
  }
  
  /**
   * Evict oldest cache entries to make room
   */
  private evictOldestCacheEntries(requiredSpace: number): void {
    const entries = Array.from(this.compressionCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    let freedSpace = 0;
    
    for (const [key, entry] of entries) {
      this.compressionCache.delete(key);
      this.cacheSize -= entry.data.length;
      freedSpace += entry.data.length;
      
      if (freedSpace >= requiredSpace) {
        break;
      }
    }
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const maxAge = 30 * 60 * 1000; // 30 minutes
    const now = Date.now();
    
    for (const [key, entry] of this.compressionCache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.compressionCache.delete(key);
        this.cacheSize -= entry.data.length;
      }
    }
  }
  
  /**
   * Update compression statistics
   */
  private updateStats(
    algorithm: CompressionAlgorithm,
    contentType: string,
    originalSize: number,
    compressedSize: number,
    compressionTime: number
  ): void {
    this.stats.compressedRequests++;
    this.stats.totalBytesSaved += (originalSize - compressedSize);
    this.stats.totalCompressionTime += compressionTime;
    
    // Update algorithm usage
    const currentCount = this.stats.algorithmUsage.get(algorithm) || 0;
    this.stats.algorithmUsage.set(algorithm, currentCount + 1);
    
    // Update content type stats
    const baseContentType = contentType.split(';')[0].toLowerCase();
    let ctStats = this.stats.contentTypeStats.get(baseContentType);
    
    if (!ctStats) {
      ctStats = {
        requests: 0,
        bytesSaved: 0,
        averageCompressionRatio: 0
      };
      this.stats.contentTypeStats.set(baseContentType, ctStats);
    }
    
    const bytesSaved = originalSize - compressedSize;
    const compressionRatio = compressedSize / originalSize;
    
    ctStats.requests++;
    ctStats.bytesSaved += bytesSaved;
    ctStats.averageCompressionRatio = 
      (ctStats.averageCompressionRatio * (ctStats.requests - 1) + compressionRatio) / ctStats.requests;
  }
  
  /**
   * Get compression statistics
   */
  public getStats(): CompressionStats {
    return {
      ...this.stats,
      algorithmUsage: new Map(this.stats.algorithmUsage),
      contentTypeStats: new Map(this.stats.contentTypeStats)
    };
  }
  
  /**
   * Reset statistics
   */
  public resetStats(): void {
    this.stats = this.initializeStats();
  }
  
  /**
   * Get cache information
   */
  public getCacheInfo(): {
    size: number; // bytes
    entries: number;
    hitRate: number;
    maxSize: number; // bytes
  } {
    const maxSize = (this.options.maxCacheSize || 100) * 1024 * 1024;
    
    return {
      size: this.cacheSize,
      entries: this.compressionCache.size,
      hitRate: this.stats.totalRequests > 0 ? 
        (this.stats.compressedRequests - this.stats.totalRequests) / this.stats.totalRequests : 0,
      maxSize
    };
  }
  
  /**
   * Initialize statistics object
   */
  private initializeStats(): CompressionStats {
    return {
      totalRequests: 0,
      compressedRequests: 0,
      totalBytesSaved: 0,
      totalCompressionTime: 0,
      algorithmUsage: new Map(),
      contentTypeStats: new Map()
    };
  }
}

/**
 * Fastify plugin for compression middleware
 */
export async function compressionPlugin(
  fastify: FastifyInstance,
  options: CompressionMiddlewareOptions = {}
) {
  const middleware = new CompressionMiddleware(options);
  
  // Register the middleware
  fastify.addHook('onRequest', middleware.getHandler());
  
  // Add compression stats route for monitoring
  fastify.get('/admin/compression/stats', async (request, reply) => {
    const stats = middleware.getStats();
    const cacheInfo = middleware.getCacheInfo();
    
    return {
      compression: {
        ...stats,
        algorithmUsage: Object.fromEntries(stats.algorithmUsage),
        contentTypeStats: Object.fromEntries(stats.contentTypeStats)
      },
      cache: cacheInfo,
      compressionRatio: stats.totalRequests > 0 ? 
        stats.compressedRequests / stats.totalRequests : 0,
      averageBytesSavedPerRequest: stats.compressedRequests > 0 ?
        stats.totalBytesSaved / stats.compressedRequests : 0
    };
  });
  
  // Add compression test route for debugging
  if (process.env.NODE_ENV === 'development') {
    fastify.get('/admin/compression/test', async (request, reply) => {
      const testData = {
        message: 'This is a test response for compression middleware',
        data: new Array(1000).fill(0).map((_, i) => ({
          id: i,
          name: `Test Item ${i}`,
          description: `This is test item number ${i} with some repeated text to make compression effective.`
        })),
        timestamp: new Date().toISOString(),
        compressionTest: true
      };
      
      return testData;
    });
  }
  
  // Store middleware instance for external access
  fastify.decorate('compressionMiddleware', middleware);
}

// Export default instance for direct use
export const compressionMiddleware = new CompressionMiddleware();
export default compressionMiddleware;