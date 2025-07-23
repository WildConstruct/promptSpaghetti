/**
 * Compression System Tests - Epic 17 Implementation
 * Task: E17-1753114397281-ACAEC8 - Implement compression
 * 
 * Comprehensive test suite for the compression system including
 * core compression service, HTTP middleware, and file utilities.
 */

import { CompressionService, CompressionAlgorithm, CompressionLevel, DataType } from '../../packages/core/utils/CompressionService';
import { CompressionMiddleware } from '../middleware/compression.middleware';
import FileCompressionUtils from '../utils/FileCompressionUtils';
import { writeFileSync, readFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('Compression System Tests', () => {
  let compressionService: CompressionService;
  const testDir = './test-compression-temp';
  
  beforeAll(() => {
    compressionService = new CompressionService();
    // Create test directory
    mkdirSync(testDir, { recursive: true });
  });
  
  afterAll(() => {
    // Clean up test directory
    rmSync(testDir, { recursive: true, force: true });
  });

  describe('Core Compression Service', () => {
    
    test('should compress and decompress text data with GZIP', async () => {
      const testData = 'This is a test string that should compress well because it has repeated patterns. ' +
        'This is a test string that should compress well because it has repeated patterns.';
      
      const result = await compressionService.compress(testData, {
        algorithm: CompressionAlgorithm.GZIP,
        level: CompressionLevel.BALANCED,
        dataType: DataType.TEXT
      });
      
      expect(result.success).toBe(true);
      expect(result.compressedSize).toBeLessThan(result.originalSize);
      expect(result.compressionRatio).toBeLessThan(1);
      expect(result.algorithm).toBe(CompressionAlgorithm.GZIP);
      
      // Test decompression
      const decompressed = await compressionService.decompress(result.data, CompressionAlgorithm.GZIP);
      expect(decompressed.toString('utf8')).toBe(testData);
    });
    
    test('should compress JSON data efficiently', async () => {
      const testData = {
        users: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
          settings: {
            theme: 'dark',
            notifications: true,
            language: 'en'
          }
        }))
      };
      
      const result = await compressionService.compressJSON(testData, CompressionLevel.BEST);
      
      expect(result.success).toBe(true);
      expect(result.compressedSize).toBeLessThan(result.originalSize * 0.7); // Should achieve good compression
      
      // Test decompression
      const decompressed = await compressionService.decompressJSON(result.data, result.metadata);
      expect(decompressed).toEqual(testData);
    });
    
    test('should handle different compression algorithms', async () => {
      const testData = 'Test data for algorithm comparison';
      const algorithms = [CompressionAlgorithm.GZIP, CompressionAlgorithm.DEFLATE, CompressionAlgorithm.BROTLI];
      const results = [];
      
      for (const algorithm of algorithms) {
        const result = await compressionService.compress(testData, {
          algorithm,
          level: CompressionLevel.BALANCED,
          dataType: DataType.TEXT
        });
        
        expect(result.success).toBe(true);
        expect(result.algorithm).toBe(algorithm);
        results.push(result);
        
        // Test decompression
        const decompressed = await compressionService.decompress(result.data, algorithm);
        expect(decompressed.toString('utf8')).toBe(testData);
      }
      
      // All algorithms should produce different compressed sizes
      const sizes = results.map(r => r.compressedSize);
      expect(new Set(sizes).size).toBeGreaterThan(1);
    });
    
    test('should respect size threshold', async () => {
      const smallData = 'small';
      
      const result = await compressionService.compress(smallData, {
        algorithm: CompressionAlgorithm.GZIP,
        level: CompressionLevel.BALANCED,
        dataType: DataType.TEXT,
        threshold: 1024 // Don't compress data smaller than 1KB
      });
      
      expect(result.success).toBe(true);
      expect(result.algorithm).toBe(CompressionAlgorithm.NONE); // Should skip compression
      expect(result.compressionRatio).toBe(1);
    });
    
    test('should track compression statistics', async () => {
      const initialStats = compressionService.getStats();
      const testData = 'Statistics test data';
      
      await compressionService.compress(testData, {
        algorithm: CompressionAlgorithm.GZIP,
        level: CompressionLevel.FAST,
        dataType: DataType.TEXT
      });
      
      const updatedStats = compressionService.getStats();
      
      expect(updatedStats.totalCompressions).toBeGreaterThan(initialStats.totalCompressions);
      expect(updatedStats.totalBytesCompressed).toBeGreaterThan(initialStats.totalBytesCompressed);
      expect(updatedStats.algorithmStats.has(CompressionAlgorithm.GZIP)).toBe(true);
    });
    
    test('should benchmark different algorithms', async () => {
      const testData = 'Benchmark test data '.repeat(100);
      
      const benchmark = await compressionService.benchmarkAlgorithms(testData, DataType.TEXT);
      
      expect(benchmark.size).toBeGreaterThan(0);
      expect(benchmark.has(CompressionAlgorithm.GZIP)).toBe(true);
      
      for (const [algorithm, result] of benchmark) {
        expect(result.success).toBe(true);
        expect(result.algorithm).toBe(algorithm);
        expect(result.compressionTime).toBeGreaterThan(0);
      }
    });
  });

  describe('HTTP Compression Middleware', () => {
    let middleware: CompressionMiddleware;
    
    beforeEach(() => {
      middleware = new CompressionMiddleware({
        threshold: 100,
        level: CompressionLevel.FAST,
        enableBrotli: true,
        enableGzip: true
      });
    });
    
    test('should compress JSON API responses', async () => {
      const testResponse = {
        data: Array.from({ length: 50 }, (_, i) => ({ id: i, value: `Item ${i}` })),
        meta: { total: 50, page: 1 }
      };
      
      // Mock Fastify request/reply
      const mockRequest = {
        headers: { 'accept-encoding': 'gzip, deflate, br' }
      };
      
      let compressedData: Buffer | null = null;
      const compressionHeaders: Record<string, string> = {};
      
      const mockReply = {
        send: jest.fn((data) => {
          compressedData = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data));
          return mockReply;
        }),
        getHeader: jest.fn((name) => {
          if (name === 'content-type') return 'application/json';
          return compressionHeaders[name];
        }),
        header: jest.fn((name, value) => {
          compressionHeaders[name] = value;
          return mockReply;
        })
      };
      
      const originalSend = mockReply.send;
      const handler = middleware.getHandler();
      
      // Simulate middleware execution
      await new Promise<void>((resolve) => {
        handler(mockRequest as any, mockReply as any, resolve);
      });
      
      // Test compression
      const result = mockReply.send(testResponse);
      
      expect(compressionHeaders['content-encoding']).toBeDefined();
      expect(['gzip', 'deflate', 'br']).toContain(compressionHeaders['content-encoding']);
      expect(compressedData).toBeDefined();
      expect(compressedData!.length).toBeLessThan(JSON.stringify(testResponse).length);
    });
    
    test('should provide compression statistics', () => {
      const stats = middleware.getStats();
      
      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('compressedRequests');
      expect(stats).toHaveProperty('totalBytesSaved');
      expect(stats).toHaveProperty('algorithmUsage');
      expect(stats).toHaveProperty('contentTypeStats');
    });
    
    test('should provide cache information', () => {
      const cacheInfo = middleware.getCacheInfo();
      
      expect(cacheInfo).toHaveProperty('size');
      expect(cacheInfo).toHaveProperty('entries');
      expect(cacheInfo).toHaveProperty('hitRate');
      expect(cacheInfo).toHaveProperty('maxSize');
      expect(cacheInfo.maxSize).toBeGreaterThan(0);
    });
  });

  describe('File Compression Utilities', () => {
    const testFilePath = join(testDir, 'test-file.txt');
    const compressedFilePath = join(testDir, 'test-file.txt.gz');
    
    beforeEach(() => {
      // Create test file
      const testContent = 'This is test file content. '.repeat(100);
      writeFileSync(testFilePath, testContent, 'utf8');
    });
    
    afterEach(() => {
      // Clean up test files
      [testFilePath, compressedFilePath].forEach(path => {
        try { unlinkSync(path); } catch {}
      });
    });
    
    test('should compress a single file', async () => {
      const result = await FileCompressionUtils.compressFile(testFilePath);
      
      expect(result.success).toBe(true);
      expect(result.inputPath).toBe(testFilePath);
      expect(result.outputPath).toContain('.gz');
      expect(result.outputSize).toBeLessThan(result.inputSize);
      expect(result.compressionRatio).toBeLessThan(1);
      
      // Verify compressed file exists
      const compressedContent = readFileSync(result.outputPath);
      expect(compressedContent.length).toBeGreaterThan(0);
    });
    
    test('should decompress a file', async () => {
      // First compress
      const compressResult = await FileCompressionUtils.compressFile(testFilePath);
      expect(compressResult.success).toBe(true);
      
      // Then decompress
      const decompressPath = join(testDir, 'decompressed-file.txt');
      const decompressResult = await FileCompressionUtils.decompressFile(
        compressResult.outputPath,
        decompressPath
      );
      
      expect(decompressResult.success).toBe(true);
      
      // Verify content matches original
      const originalContent = readFileSync(testFilePath, 'utf8');
      const decompressedContent = readFileSync(decompressPath, 'utf8');
      expect(decompressedContent).toBe(originalContent);
      
      // Clean up
      unlinkSync(decompressPath);
    });
    
    test('should handle batch file compression', async () => {
      // Create multiple test files
      const files = [];
      for (let i = 0; i < 3; i++) {
        const filePath = join(testDir, `batch-test-${i}.txt`);
        writeFileSync(filePath, `Batch test file ${i} content. `.repeat(50));
        files.push(filePath);
      }
      
      const result = await FileCompressionUtils.compressFiles(files, {
        algorithm: CompressionAlgorithm.GZIP,
        level: CompressionLevel.FAST
      });
      
      expect(result.totalFiles).toBe(3);
      expect(result.successfulFiles).toBe(3);
      expect(result.failedFiles).toBe(0);
      expect(result.totalOutputSize).toBeLessThan(result.totalInputSize);
      expect(result.averageCompressionRatio).toBeLessThan(1);
      
      // Clean up
      files.forEach(file => {
        unlinkSync(file);
        try { unlinkSync(file + '.gz'); } catch {}
      });
    });
    
    test('should respect file size constraints', async () => {
      // Create a very small file
      const smallFilePath = join(testDir, 'small-file.txt');
      writeFileSync(smallFilePath, 'tiny', 'utf8');
      
      const result = await FileCompressionUtils.compressFile(smallFilePath, undefined, {
        minFileSize: 1024 // 1KB minimum
      });
      
      expect(result.success).toBe(false);
      expect(result.skipped).toBe(true);
      expect(result.skipReason).toContain('too small');
      
      // Clean up
      unlinkSync(smallFilePath);
    });
  });

  describe('Integration Tests', () => {
    
    test('should handle various data types consistently', async () => {
      const testCases = [
        { data: 'Simple text string', dataType: DataType.TEXT },
        { data: { key: 'value', array: [1, 2, 3] }, dataType: DataType.JSON },
        { data: '<html><body>HTML content</body></html>', dataType: DataType.HTML },
        { data: 'body { color: red; }', dataType: DataType.CSS },
        { data: 'function test() { return "js"; }', dataType: DataType.JAVASCRIPT }
      ];
      
      for (const testCase of testCases) {
        const result = await compressionService.compress(testCase.data, {
          algorithm: CompressionAlgorithm.GZIP,
          level: CompressionLevel.BALANCED,
          dataType: testCase.dataType
        });
        
        expect(result.success).toBe(true);
        expect(result.originalSize).toBeGreaterThan(0);
        
        // Test decompression
        const decompressed = await compressionService.decompress(result.data, CompressionAlgorithm.GZIP);
        const expectedString = typeof testCase.data === 'string' 
          ? testCase.data 
          : JSON.stringify(testCase.data);
        
        expect(decompressed.toString('utf8')).toBe(expectedString);
      }
    });
    
    test('should maintain performance under load', async () => {
      const testData = 'Performance test data. '.repeat(1000);
      const iterations = 50;
      const results = [];
      
      const startTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        const result = await compressionService.compress(testData, {
          algorithm: CompressionAlgorithm.GZIP,
          level: CompressionLevel.FAST,
          dataType: DataType.TEXT
        });
        results.push(result);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;
      
      // All compressions should succeed
      expect(results.every(r => r.success)).toBe(true);
      
      // Average compression time should be reasonable (< 10ms for fast compression)
      expect(averageTime).toBeLessThan(10);
      
      // Compression ratios should be consistent
      const ratios = results.map(r => r.compressionRatio);
      const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
      const ratioVariance = ratios.reduce((sum, r) => sum + Math.pow(r - avgRatio, 2), 0) / ratios.length;
      
      expect(ratioVariance).toBeLessThan(0.01); // Low variance indicates consistency
    });
    
    test('should handle error cases gracefully', async () => {
      // Test with invalid algorithm
      const result1 = await compressionService.compress('test', {
        algorithm: 'invalid' as CompressionAlgorithm,
        level: CompressionLevel.BALANCED,
        dataType: DataType.TEXT
      });
      
      expect(result1.success).toBe(false);
      expect(result1.error).toBeDefined();
      
      // Test decompression with wrong algorithm
      try {
        await compressionService.decompress(Buffer.from('invalid data'), CompressionAlgorithm.GZIP);
      } catch (error) {
        expect(error).toBeDefined();
      }
      
      // Test file compression with non-existent file
      const fileResult = await FileCompressionUtils.compressFile('/non/existent/file.txt');
      expect(fileResult.success).toBe(false);
      expect(fileResult.error).toBeDefined();
    });
  });
});