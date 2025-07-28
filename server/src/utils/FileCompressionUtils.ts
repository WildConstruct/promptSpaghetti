/**
 * File Compression Utilities - Epic 17 Implementation
 * Task: E17-1753114397281-ACAEC8 - Implement compression
 * 
 * Specialized compression utilities for file system operations,
 * including file compression, batch processing, and archive creation.
 */

import { createReadStream, createWriteStream, promises as fs } from 'fs';
import { pipeline } from 'stream/promises';
import { 
  createGzip,
  createDeflate,
  createBrotliCompress,
  createGunzip,
  createInflate,
  createBrotliDecompress
} from 'zlib';
import { 
  compressionService,
  CompressionAlgorithm,
  CompressionLevel,
  DataType,
  CompressionResult
} from '../../../packages/core/utils/CompressionService';
import { join, dirname, basename, extname } from 'path';

}
export interface FileCompressionOptions {
  algorithm?: CompressionAlgorithm;
  level?: CompressionLevel;
  preserveOriginal?: boolean;
  outputDir?: string;
  suffix?: string;
  batchSize?: number;
  skipExisting?: boolean;
  includeHidden?: boolean;
  recursive?: boolean;
  filePatterns?: string[];
  excludePatterns?: string[];
  maxFileSize?: number; // bytes
  minFileSize?: number; // bytes
}
}

}
export interface FileCompressionResult extends CompressionResult {
  inputPath: string;
  outputPath: string;
  inputSize: number;
  outputSize: number;
  processingTime: number;
  skipped?: boolean;
  skipReason?: string;
}

}
export interface BatchCompressionResult {
  totalFiles: number;
  processedFiles: number;
  skippedFiles: number;
  successfulFiles: number;
  failedFiles: number;
  totalInputSize: number;
  totalOutputSize: number;
  totalProcessingTime: number;
  averageCompressionRatio: number;
  results: FileCompressionResult[];
}
  errors: Array<{ file: string; error: string }>;
}

}
export interface ArchiveOptions {
  algorithm?: CompressionAlgorithm;
  level?: CompressionLevel;
  includeDirectoryStructure?: boolean;
  followSymlinks?: boolean;
  preservePermissions?: boolean;
  includeMetadata?: boolean;
}
}

const DEFAULT_FILE_OPTIONS: FileCompressionOptions = {
  algorithm: CompressionAlgorithm.GZIP,
  level: CompressionLevel.BALANCED,
  preserveOriginal: true,
  suffix: undefined, // Will be determined by algorithm
  batchSize: 10,
  skipExisting: true,
  includeHidden: false,
  recursive: false,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  minFileSize: 1024 // 1KB
};

/**
 * File Compression Utilities
 */
export class FileCompressionUtils {
  
  /**
   * Compress a single file
   */
  public static async compressFile(
    inputPath: string,
    outputPath?: string,
    options: FileCompressionOptions = {}
  ): Promise<FileCompressionResult> {

    const startTime = performance.now();
    const opts = { ...DEFAULT_FILE_OPTIONS, ...options };
    
    try {
      // Check if input file exists
      const stats = await fs.stat(inputPath);
      if (!stats.isFile()) {
        throw new Error(`Input path is not a file: ${inputPath}`);
      }
      
      const inputSize = stats.size;
      
      // Check file size constraints
      if (opts.maxFileSize && inputSize > opts.maxFileSize) {
        return {
          success: false,
          inputPath,
          outputPath: '',
          inputSize,
          outputSize: 0,
          processingTime: performance.now() - startTime,
          skipped: true,
          skipReason: `File too large (${inputSize} bytes > ${opts.maxFileSize} bytes)`,
          originalSize: inputSize,
          compressedSize: 0,
          compressionRatio: 1,
          algorithm: opts.algorithm!,
          level: opts.level!,
          compressionTime: 0,
          data: Buffer.alloc(0)
        };
      }
      
      if (opts.minFileSize && inputSize < opts.minFileSize) {
        return {
          success: false,
          inputPath,
          outputPath: '',
          inputSize,
          outputSize: 0,
          processingTime: performance.now() - startTime,
          skipped: true,
          skipReason: `File too small (${inputSize} bytes < ${opts.minFileSize} bytes)`,
          originalSize: inputSize,
          compressedSize: 0,
          compressionRatio: 1,
          algorithm: opts.algorithm!,
          level: opts.level!,
          compressionTime: 0,
          data: Buffer.alloc(0)
        };
      }
      
      // Determine output path
      if (!outputPath) {
        const suffix = opts.suffix || this.getDefaultSuffix(opts.algorithm!);
        outputPath = `${inputPath}${suffix}`;
        
        if (opts.outputDir) {
          const filename = basename(outputPath);
          outputPath = join(opts.outputDir, filename);
        }
      }
      
      // Check if output already exists
      if (opts.skipExisting) {
        try {
          await fs.access(outputPath);
          return {
            success: true,
            inputPath,
            outputPath,
            inputSize,
            outputSize: 0,
            processingTime: performance.now() - startTime,
            skipped: true,
            skipReason: 'Output file already exists',
            originalSize: inputSize,
            compressedSize: 0,
            compressionRatio: 1,
            algorithm: opts.algorithm!,
            level: opts.level!,
            compressionTime: 0,
            data: Buffer.alloc(0)
          };
        } catch {
          // File doesn't exist, continue with compression
        }
      }
      
      // Ensure output directory exists
      await fs.mkdir(dirname(outputPath), { recursive: true });
      
      // Perform streaming compression for large files
      if (inputSize > 10 * 1024 * 1024) { // 10MB
        return await this.compressFileStreaming(inputPath, outputPath, opts, inputSize, startTime);
      } else {
        return await this.compressFileInMemory(inputPath, outputPath, opts, inputSize, startTime);
      }
      
    } catch (error) {
      return {
        success: false,
        inputPath,
        outputPath: outputPath || '',
        inputSize: 0,
        outputSize: 0,
        processingTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: opts.algorithm!,
        level: opts.level!,
        compressionTime: 0,
        data: Buffer.alloc(0)
      };
    }
  }
  
  /**
   * Compress multiple files in batch
   */
  public static async compressFiles(
    inputPaths: string[],
    options: FileCompressionOptions = {}
  ): Promise<BatchCompressionResult> {

    const opts = { ...DEFAULT_FILE_OPTIONS, ...options };
    const results: FileCompressionResult[] = [];
    const errors: Array<{ file: string; error: string }> = [];
    const batchSize = opts.batchSize || 10;
    
    let totalInputSize = 0;
    let totalOutputSize = 0;
    let totalProcessingTime = 0;
    let successfulFiles = 0;
    let skippedFiles = 0;
    let failedFiles = 0;
    
    // Process files in batches
    for (let i = 0; i < inputPaths.length; i += batchSize) {
      const batch = inputPaths.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (inputPath) => {
        try {
          const result = await this.compressFile(inputPath, undefined, opts);
          results.push(result);
          
          totalInputSize += result.inputSize;
          totalOutputSize += result.outputSize;
          totalProcessingTime += result.processingTime;
          
          if (result.skipped) {
            skippedFiles++;
          } else if (result.success) {
            successfulFiles++;
          } else {
            failedFiles++;
          }
          
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ file: inputPath, error: errorMessage });
          failedFiles++;
          return null;
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    const averageCompressionRatio = totalInputSize > 0 ? totalOutputSize / totalInputSize : 1;
    
    return {
      totalFiles: inputPaths.length,
      processedFiles: results.length,
      skippedFiles,
      successfulFiles,
      failedFiles,
      totalInputSize,
      totalOutputSize,
      totalProcessingTime,
      averageCompressionRatio,
      results,
      errors
    };
  }
  
  /**
   * Compress directory recursively
   */
  public static async compressDirectory(
    directoryPath: string,
    options: FileCompressionOptions = {}
  ): Promise<BatchCompressionResult> {

    const opts = { ...DEFAULT_FILE_OPTIONS, ...options, recursive: true };
    const files = await this.findFilesToCompress(directoryPath, opts);
    return await this.compressFiles(files, opts);
  }
  
  /**
   * Create compressed archive from files/directories
   */
  public static async createArchive(
    inputPaths: string[],
    archivePath: string,
    options: ArchiveOptions = {}
  ): Promise<CompressionResult> {

    const opts = {
      algorithm: CompressionAlgorithm.GZIP,
      level: CompressionLevel.BALANCED,
      includeDirectoryStructure: true,
      followSymlinks: false,
      preservePermissions: true,
      includeMetadata: true,
      ...options
    };
    
    // This is a simplified implementation - in practice, you'd want to use
    // a proper archive format like TAR with compression
    const startTime = performance.now();
    
    try {
      // Collect all files to archive
      const filesToArchive = await this.collectArchiveFiles(inputPaths, opts);
      
      // Create archive data structure
      const archiveData = await this.createArchiveData(filesToArchive, opts);
      
      // Compress the archive
      const result = await compressionService.compress(archiveData, {
        algorithm: opts.algorithm,
        level: opts.level,
        dataType: DataType.BINARY,
        includeMetadata: true
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Archive compression failed');
      }
      
      // Write compressed archive to disk
      await fs.writeFile(archivePath, result.data);
      
      return {
        ...result,
        compressionTime: performance.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        originalSize: 0,
        compressedSize: 0,
        compressionRatio: 1,
        algorithm: opts.algorithm,
        level: opts.level,
        compressionTime: performance.now() - startTime,
        data: Buffer.alloc(0),
        error: error instanceof Error ? error.message : 'Archive creation failed'
      };
    }
  }
  
  /**
   * Decompress a file
   */
  public static async decompressFile(
    inputPath: string,
    outputPath?: string,
    algorithm?: CompressionAlgorithm
  ): Promise<{
    success: boolean;
    inputPath: string;
    outputPath: string;
    inputSize: number;
    outputSize: number;
    processingTime: number;
    error?: string;
  }> {

    const startTime = performance.now();
    
    try {
      const stats = await fs.stat(inputPath);
      const inputSize = stats.size;
      
      // Determine output path
      if (!outputPath) {
        outputPath = this.getDecompressedFilename(inputPath);
      }
      
      // Determine algorithm from file extension if not provided
      if (!algorithm) {
        algorithm = this.algorithmFromExtension(inputPath);
      }
      
      // Read compressed data
      const compressedData = await fs.readFile(inputPath);
      
      // Decompress
      const decompressedData = await compressionService.decompress(compressedData, algorithm);
      
      // Write decompressed data
      await fs.writeFile(outputPath, decompressedData);
      
      return {
        success: true,
        inputPath,
        outputPath,
        inputSize,
        outputSize: decompressedData.length,
        processingTime: performance.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        inputPath,
        outputPath: outputPath || '',
        inputSize: 0,
        outputSize: 0,
        processingTime: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Decompression failed'
      };
    }
  }
  
  // Private Helper Methods
  
  /**
   * Compress file using streaming for large files
   */
  private static async compressFileStreaming(
    inputPath: string,
    outputPath: string,
    options: FileCompressionOptions,
    inputSize: number,
    startTime: number
  ): Promise<FileCompressionResult> {

    const algorithm = options.algorithm!;
    const level = options.level!;
    
    // Create compression stream based on algorithm
    let compressStream;
    switch (algorithm) {
    case CompressionAlgorithm.GZIP:
      compressStream = createGzip({ level });
      break;
    case CompressionAlgorithm.DEFLATE:
      compressStream = createDeflate({ level });
      break;
    case CompressionAlgorithm.BROTLI:
      compressStream = createBrotliCompress({
        params: {
          [require('zlib').constants.BROTLI_PARAM_QUALITY]: level
        }
      });
      break;
    default:
      throw new Error(`Streaming compression not supported for ${algorithm}`);
    }
    
    // Create streams
    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);
    
    // Perform streaming compression
    await pipeline(readStream, compressStream, writeStream);
    
    // Get output size
    const outputStats = await fs.stat(outputPath);
    const outputSize = outputStats.size;
    
    return {
      success: true,
      inputPath,
      outputPath,
      inputSize,
      outputSize,
      processingTime: performance.now() - startTime,
      originalSize: inputSize,
      compressedSize: outputSize,
      compressionRatio: outputSize / inputSize,
      algorithm,
      level,
      compressionTime: performance.now() - startTime,
      data: Buffer.alloc(0) // Not loaded into memory for streaming
    };
  }
  
  /**
   * Compress file in memory for smaller files
   */
  private static async compressFileInMemory(
    inputPath: string,
    outputPath: string,
    options: FileCompressionOptions,
    inputSize: number,
    startTime: number
  ): Promise<FileCompressionResult> {

    // Read file
    const inputData = await fs.readFile(inputPath);
    
    // Determine data type from file extension
    const dataType = this.getDataTypeFromExtension(inputPath);
    
    // Compress
    const result = await compressionService.compress(inputData, {
      algorithm: options.algorithm!,
      level: options.level!,
      dataType,
      includeMetadata: true
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Compression failed');
    }
    
    // Write compressed data
    await fs.writeFile(outputPath, result.data);
    
    return {
      success: true,
      inputPath,
      outputPath,
      inputSize,
      outputSize: result.compressedSize,
      processingTime: performance.now() - startTime,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      algorithm: result.algorithm,
      level: result.level,
      compressionTime: result.compressionTime,
      data: result.data
    };
  }
  
  /**
   * Find files to compress in directory
   */
  private static async findFilesToCompress(
    directoryPath: string,
    options: FileCompressionOptions
  ): Promise<string[]> {

    const files: string[] = [];
    
    const processDirectory = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (options.recursive) {
            await processDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          // Check if file matches patterns
          if (this.matchesPatterns(entry.name, options)) {
            files.push(fullPath);
          }
        }
      }
    };
    
    await processDirectory(directoryPath);
    return files;
  }
  
  /**
   * Check if filename matches include/exclude patterns
   */
  private static matchesPatterns(filename: string, options: FileCompressionOptions): boolean {
    // Check hidden files
    if (!options.includeHidden && filename.startsWith('.')) {
      return false;
    }
    
    // Check exclude patterns
    if (options.excludePatterns) {
      for (const pattern of options.excludePatterns) {
        if (filename.match(new RegExp(pattern))) {
          return false;
        }
      }
    }
    
    // Check include patterns
    if (options.filePatterns) {
      return options.filePatterns.some(pattern => 
        filename.match(new RegExp(pattern))
      );
    }
    
    return true;
  }
  
  /**
   * Get default file suffix for compression algorithm
   */
  private static getDefaultSuffix(algorithm: CompressionAlgorithm): string {
    switch (algorithm) {
    case CompressionAlgorithm.GZIP:
      return '.gz';
    case CompressionAlgorithm.DEFLATE:
      return '.zz';
    case CompressionAlgorithm.BROTLI:
      return '.br';
    default:
      return '.compressed';
    }
  }
  
  /**
   * Get data type from file extension
   */
  private static getDataTypeFromExtension(filePath: string): DataType {
    const ext = extname(filePath).toLowerCase();
    
    switch (ext) {
    case '.json':
      return DataType.JSON;
    case '.html':
    case '.htm':
      return DataType.HTML;
    case '.css':
      return DataType.CSS;
    case '.js':
    case '.mjs':
      return DataType.JAVASCRIPT;
    case '.txt':
    case '.md':
    case '.csv':
    case '.xml':
    case '.yaml':
    case '.yml':
      return DataType.TEXT;
    default:
      return DataType.BINARY;
    }
  }
  
  /**
   * Get decompressed filename by removing compression extension
   */
  private static getDecompressedFilename(compressedPath: string): string {
    const suffixes = ['.gz', '.zz', '.br', '.compressed'];
    
    for (const suffix of suffixes) {
      if (compressedPath.endsWith(suffix)) {
        return compressedPath.slice(0, -suffix.length);
      }
    }
    
    return compressedPath + '.decompressed';
  }
  
  /**
   * Determine compression algorithm from file extension
   */
  private static algorithmFromExtension(filePath: string): CompressionAlgorithm {
    if (filePath.endsWith('.gz')) return CompressionAlgorithm.GZIP;
    if (filePath.endsWith('.zz')) return CompressionAlgorithm.DEFLATE;
    if (filePath.endsWith('.br')) return CompressionAlgorithm.BROTLI;
    return CompressionAlgorithm.GZIP; // Default
  }
  
  /**
   * Collect files for archive creation
   */
  private static async collectArchiveFiles(
    inputPaths: string[],
    options: ArchiveOptions
  ): Promise<Array<{ path: string; relativePath: string; data: Buffer }>> {
    const files: Array<{ path: string; relativePath: string; data: Buffer }> = [];
    
    for (const inputPath of inputPaths) {
      const stats = await fs.stat(inputPath);
      
      if (stats.isFile()) {
        const data = await fs.readFile(inputPath);
        files.push({
          path: inputPath,
          relativePath: basename(inputPath),
          data
        });
      } else if (stats.isDirectory() && options.includeDirectoryStructure) {
        // Recursively collect directory files
        const dirFiles = await this.collectDirectoryFiles(inputPath, inputPath, options);
        files.push(...dirFiles);
      }
    }
    
    return files;
  }
  
  /**
   * Collect files from directory for archive
   */
  private static async collectDirectoryFiles(
    basePath: string,
    currentPath: string,
    options: ArchiveOptions
  ): Promise<Array<{ path: string; relativePath: string; data: Buffer }>> {
    const files: Array<{ path: string; relativePath: string; data: Buffer }> = [];
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      const relativePath = fullPath.substring(basePath.length + 1);
      
      if (entry.isFile() || (entry.isSymbolicLink() && options.followSymlinks)) {
        const data = await fs.readFile(fullPath);
        files.push({
          path: fullPath,
          relativePath,
          data
        });
      } else if (entry.isDirectory()) {
        const subFiles = await this.collectDirectoryFiles(basePath, fullPath, options);
        files.push(...subFiles);
      }
    }
    
    return files;
  }
  
  /**
   * Create archive data structure
   */
  private static async createArchiveData(
    files: Array<{ path: string; relativePath: string; data: Buffer }>,
    options: ArchiveOptions
  ): Promise<Buffer> {

    // Simple archive format - in practice, you'd use TAR or similar
    const archiveEntries = files.map(file => ({
      path: file.relativePath,
      size: file.data.length,
      data: file.data,
      metadata: options.includeMetadata ? {
        created: new Date().toISOString(),
        checksum: require('crypto').createHash('sha256').update(file.data).digest('hex')
      } : undefined
    }));
    
    const archiveData = JSON.stringify(archiveEntries);
    return Buffer.from(archiveData, 'utf8');
  }
}

export default FileCompressionUtils;