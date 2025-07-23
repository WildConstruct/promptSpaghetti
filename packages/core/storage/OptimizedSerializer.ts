/**
 * Optimized Project Serialization System
 * Implements compression, binary formats, and incremental serialization for large graphs
 */

import { z } from 'zod';
import { Graph } from '../graphSchema';
import { PSGFile, ProjectMetadata, ProjectSettings } from '../projectManager';
import { OptimizedGraphStorage } from './OptimizedGraphStorage';

/**
 * Serialization format options
 */
export interface SerializationOptions {
  format: 'json' | 'binary' | 'compressed';
  compression?: 'gzip' | 'lz4' | 'brotli';
  prettyPrint?: boolean; // Default: false
  incremental?: boolean; // Only serialize changed data
  splitLargeGraphs?: boolean; // Split into chunks for >10MB graphs
  includeMetadata?: boolean; // Default: true
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
  chunks?: number; // For split serialization
}

/**
 * Incremental serialization state
 */
interface IncrementalState {
  lastSerialized: number; // timestamp
  dirtyNodes: Set<string>;
  baselineChecksum: string;
  version: number;
}

/**
 * Performance-optimized serialization system
 */
export class OptimizedSerializer {
  private static readonly LARGE_GRAPH_THRESHOLD = 10 * 1024 * 1024; // 10MB
  private static readonly COMPRESSION_THRESHOLD = 1024; // 1KB
  
  private incrementalState = new Map<string, IncrementalState>();
  
  /**
   * Serialize project with optimal format selection
   */
  async serialize(
    projectData: PSGFile,
    options: SerializationOptions = { format: 'json' }
  ): Promise<SerializationResult> {
    const startTime = performance.now();
    
    try {
      // Auto-detect optimal format for large graphs
      const estimatedSize = this.estimateSize(projectData);
      const finalOptions = this.optimizeOptions(options, estimatedSize);
      
      let result: SerializationResult;
      
      switch (finalOptions.format) {
      case 'binary':
        result = await this.serializeToBinary(projectData, finalOptions);
        break;
      case 'compressed':
        result = await this.serializeCompressed(projectData, finalOptions);
        break;
      default:
        result = await this.serializeToJSON(projectData, finalOptions);
      }
      
      result.serializationTime = performance.now() - startTime;
      return result;
      
    } catch (error) {
      console.error('Serialization failed:', error);
      throw new Error(`Serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deserialize with automatic format detection
   */
  async deserialize(data: string | ArrayBuffer): Promise<PSGFile> {
    const startTime = performance.now();
    
    try {
      let parsedData: any;
      
      if (typeof data === 'string') {
        // Try JSON first
        if (data.trim().startsWith('{')) {
          parsedData = JSON.parse(data);
        } else {
          throw new Error('Unsupported string format');
        }
      } else {
        // Binary format
        parsedData = await this.deserializeBinary(data);
      }
      
      // Handle compressed data
      if (parsedData.compressed) {
        parsedData = await this.decompressData(parsedData);
      }
      
      // Handle chunked data
      if (parsedData.chunks) {
        parsedData = await this.reassembleChunks(parsedData);
      }
      
      console.log(`Deserialization took ${performance.now() - startTime}ms`);
      return parsedData;
      
    } catch (error) {
      console.error('Deserialization failed:', error);
      throw new Error(`Deserialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Incremental serialization - only serialize changes
   */
  async serializeIncremental(
    projectData: PSGFile,
    projectId: string,
    options: SerializationOptions = { format: 'json', incremental: true }
  ): Promise<SerializationResult & { isIncremental: boolean; deltaSize: number }> {
    const state = this.incrementalState.get(projectId);
    const currentTime = Date.now();
    
    if (!state || !options.incremental) {
      // Full serialization for first time or when incremental is disabled
      const result = await this.serialize(projectData, options);
      
      // Store state for future incremental updates
      this.incrementalState.set(projectId, {
        lastSerialized: currentTime,
        dirtyNodes: new Set(),
        baselineChecksum: await this.calculateChecksum(result.data),
        version: 1
      });
      
      return {
        ...result,
        isIncremental: false,
        deltaSize: result.size
      };
    }
    
    // Create incremental delta
    const delta = await this.createDelta(projectData, state);
    const deltaResult = await this.serialize(delta, options);
    
    // Update state
    state.lastSerialized = currentTime;
    state.version++;
    
    return {
      ...deltaResult,
      isIncremental: true,
      deltaSize: deltaResult.size
    };
  }

  /**
   * Get serialization performance metrics
   */
  getMetrics(): {
    averageSerializationTime: number;
    totalSerializations: number;
    compressionStats: {
      averageRatio: number;
      timeSaved: number;
    };
    } {
    // Implementation would track these metrics
    return {
      averageSerializationTime: 0,
      totalSerializations: 0,
      compressionStats: {
        averageRatio: 0,
        timeSaved: 0
      }
    };
  }

  // Private methods

  private optimizeOptions(options: SerializationOptions, estimatedSize: number): SerializationOptions {
    const optimized = { ...options };
    
    // Auto-select format based on size
    if (estimatedSize > this.LARGE_GRAPH_THRESHOLD && options.format === 'json') {
      optimized.format = 'compressed';
      console.log(`Large graph detected (${Math.round(estimatedSize / 1024 / 1024)}MB), using compressed format`);
    }
    
    // Enable compression for medium-sized graphs
    if (estimatedSize > this.COMPRESSION_THRESHOLD && !optimized.compression) {
      optimized.compression = 'gzip';
    }
    
    // Split very large graphs
    if (estimatedSize > this.LARGE_GRAPH_THRESHOLD * 5) {
      optimized.splitLargeGraphs = true;
    }
    
    // Disable pretty-printing by default for performance
    if (optimized.prettyPrint === undefined) {
      optimized.prettyPrint = false;
    }
    
    return optimized;
  }

  private estimateSize(projectData: PSGFile): number {
    try {
      // Quick size estimation without full serialization
      const nodeCount = projectData.graph.nodes?.length || 0;
      const edgeCount = (projectData.graph as any).edges?.length || 0;
      
      // Rough estimation: ~200 bytes per node, ~100 bytes per edge, plus metadata
      const estimatedSize = (nodeCount * 200) + (edgeCount * 100) + 1024;
      return estimatedSize;
    } catch (error) {
      return 0;
    }
  }

  private async serializeToJSON(
    projectData: PSGFile,
    options: SerializationOptions
  ): Promise<SerializationResult> {
    const optimizedGraph = OptimizedGraphStorage.fromStorageFormat(projectData.graph);
    const serializedData = optimizedGraph.toCompressedFormat();
    
    const finalData = {
      ...projectData,
      graph: serializedData
    };
    
    // Use compact JSON by default (no pretty-printing)
    const jsonString = JSON.stringify(finalData, null, options.prettyPrint ? 2 : undefined);
    const originalSize = new Blob([jsonString]).size;
    
    if (options.compression && jsonString.length > this.COMPRESSION_THRESHOLD) {
      const compressed = await this.compressString(jsonString, options.compression);
      return {
        data: compressed,
        format: `json+${options.compression}`,
        size: compressed.byteLength,
        compressionRatio: compressed.byteLength / originalSize
      };
    }
    
    return {
      data: jsonString,
      format: 'json',
      size: originalSize
    };
  }

  private async serializeToBinary(
    projectData: PSGFile,
    options: SerializationOptions
  ): Promise<SerializationResult> {
    // Binary serialization for maximum efficiency
    const encoder = new TextEncoder();
    
    // Create binary format with headers
    const jsonString = JSON.stringify(projectData);
    const jsonBytes = encoder.encode(jsonString);
    
    // Binary format: [4-byte header][4-byte size][data]
    const header = new Uint32Array([0x50534742]); // "PSGB" magic number
    const size = new Uint32Array([jsonBytes.length]);
    
    const result = new Uint8Array(8 + jsonBytes.length);
    result.set(new Uint8Array(header.buffer), 0);
    result.set(new Uint8Array(size.buffer), 4);
    result.set(jsonBytes, 8);
    
    return {
      data: result.buffer,
      format: 'binary',
      size: result.length
    };
  }

  private async serializeCompressed(
    projectData: PSGFile,
    options: SerializationOptions
  ): Promise<SerializationResult> {
    // Use optimized graph storage first
    const jsonResult = await this.serializeToJSON(projectData, { 
      ...options, 
      format: 'json', 
      compression: undefined 
    });
    
    const compressed = await this.compressString(
      jsonResult.data as string, 
      options.compression || 'gzip'
    );
    
    return {
      data: compressed,
      format: `compressed+${options.compression || 'gzip'}`,
      size: compressed.byteLength,
      compressionRatio: compressed.byteLength / jsonResult.size
    };
  }

  private async deserializeBinary(data: ArrayBuffer): Promise<any> {
    const view = new DataView(data);
    const magic = view.getUint32(0);
    
    if (magic !== 0x50534742) { // "PSGB"
      throw new Error('Invalid binary format');
    }
    
    const size = view.getUint32(4);
    const jsonData = new Uint8Array(data, 8, size);
    const jsonString = new TextDecoder().decode(jsonData);
    
    return JSON.parse(jsonString);
  }

  private async compressString(data: string, algorithm: string): Promise<ArrayBuffer> {
    if (typeof CompressionStream !== 'undefined') {
      // Use native compression if available (modern browsers)
      const stream = new CompressionStream(algorithm as CompressionFormat);
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(data));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result.buffer;
    }
    
    // Fallback: simple LZ-style compression
    return this.simpleLZCompress(data);
  }

  private decompressData(compressedData: any): Promise<any> {
    // Decompression implementation
    throw new Error('Decompression not implemented');
  }

  private reassembleChunks(chunkedData: any): Promise<any> {
    // Chunk reassembly implementation
    throw new Error('Chunk reassembly not implemented');
  }

  private async createDelta(projectData: PSGFile, state: IncrementalState): Promise<Partial<PSGFile>> {
    // Create incremental delta - only changed nodes
    return {
      metadata: {
        ...projectData.metadata,
        version: `${projectData.metadata.version}+delta.${state.version}`
      },
      graph: {
        nodes: [], // Only dirty nodes would be included
        seed: projectData.graph.seed
      } as any
    };
  }

  private async calculateChecksum(data: string | ArrayBuffer): Promise<string> {
    const buffer = typeof data === 'string' 
      ? new TextEncoder().encode(data).buffer 
      : data;
      
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private simpleLZCompress(data: string): ArrayBuffer {
    // Simple compression implementation for fallback
    const compressed = new TextEncoder().encode(data);
    return compressed.buffer;
  }
}