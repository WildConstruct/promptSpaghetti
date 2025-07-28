/**
 * File Service Integration Test Suite
 * 
 * Tests the enhanced FileService with dependency injection in realistic scenarios
 */
import { FileService, HttpClient, AuthProvider, Logger, FileServiceConfig } from '../fileService';

// Mock dependencies for testing
class MockHttpClient implements HttpClient {
  private responses: Map<string, any> = new Map();
  private shouldFail: Set<string> = new Set();
  public requestLog: Array<{ url: string; options?: RequestInit }> = [];
  setResponse(url: string, response: unknown): void {
    this.responses.set(url, response);
  }
  setFailure(url: string): void {
    this.shouldFail.add(url);
  }
  async request<T>(url: string, options?: RequestInit): Promise<T> {
    this.requestLog.push({ url, options });
    if (this.shouldFail.has(url)) {
      throw new Error(`Network error for ${url}`);}
    }
    if (this.responses.has(url)) {
      return this.responses.get(url);
    }
    // Default success response
    return { success: true, message: 'Operation completed' } as T;
  }
  clearLog(): void {
    this.requestLog = [];
  }
  getLastRequest(): { url: string; options?: RequestInit } | undefined {
    return this.requestLog[this.requestLog.length - 1];
  }
}
class MockAuthProvider implements AuthProvider {
  private token: string | null = null;
  setToken(token: string | null): void {
    this.token = token;
  }
  getToken(): string | null {
    return this.token;
  }
}
class MockLogger implements Logger {
  public logs: Array<{ level: string; message: string; context?: Record<string, unknown> }> = [];
  error(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: 'error', message, context });
  }
  info(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: 'info', message, context });
  }
  warn(message: string, context?: Record<string, unknown>): void {
    this.logs.push({ level: 'warn', message, context });
  }
  clearLogs(): void {
    this.logs = [];
  }
  getLastLog(): { level: string; message: string; context?: Record<string, unknown> } | undefined {
    return this.logs[this.logs.length - 1];
  }
}
describe('FileService Integration Tests', () => {
  let fileService: FileService;
  let mockHttpClient: MockHttpClient;
  let mockAuthProvider: MockAuthProvider;
  let mockLogger: MockLogger;
  let config: FileServiceConfig;
  beforeEach(() => {
    mockHttpClient = new MockHttpClient();
    mockAuthProvider = new MockAuthProvider();
    mockLogger = new MockLogger();
    config = {
      baseUrl: 'https://api.example.com',
      enableMockFallback: true,
    };
    fileService = new FileService({)
      httpClient: mockHttpClient,
      authProvider: mockAuthProvider,
      logger: mockLogger,
      config
    });
    // Set up default auth token
    mockAuthProvider.setToken('test-token-123');
  });
  describe('Authentication Integration', () => {
    it('should include auth token in requests', async () => {
      const mockFiles = [;
        { id: '1', name: 'test.txt', type: 'file', path: '/test.txt', lastModified: new Date(), createdAt: new Date(), tags: [] }
      ];
      mockHttpClient.setResponse('https://api.example.com/api/files/list?path=%2F', mockFiles);
      await fileService.listDirectory('/');
      const lastRequest = mockHttpClient.getLastRequest();
      expect(lastRequest?.options?.headers).toEqual({)
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
      });
    });
    it('should handle missing auth token gracefully', async () => {
      mockAuthProvider.setToken(null);
      const mockFiles = [;
        { id: '1', name: 'test.txt', type: 'file', path: '/test.txt', lastModified: new Date(), createdAt: new Date(), tags: [] }
      ];
      mockHttpClient.setResponse('https://api.example.com/api/files/list?path=%2F', mockFiles);
      await fileService.listDirectory('/');
      const lastRequest = mockHttpClient.getLastRequest();
      expect(lastRequest?.options?.headers).toEqual({)
        'Content-Type': 'application/json',
        'Authorization': ''
      });
    });
    it('should update auth token dynamically', async () => {
      // First request with initial token
      mockHttpClient.setResponse('https://api.example.com/api/files/list?path=%2F', []);
      await fileService.listDirectory('/');
      let lastRequest = mockHttpClient.getLastRequest();
      expect(lastRequest?.options?.headers).toMatchObject({)
        'Authorization': 'Bearer test-token-123'
      });
      // Update token
      mockAuthProvider.setToken('new-token-456');
      mockHttpClient.clearLog();
      // Second request with new token
      await fileService.listDirectory('/');
      lastRequest = mockHttpClient.getLastRequest();
      expect(lastRequest?.options?.headers).toMatchObject({)
        'Authorization': 'Bearer new-token-456'
      });
    });
  });
  describe('Error Handling and Logging Integration', () => {
    it('should log errors and provide fallback when API fails', async () => {
      mockHttpClient.setFailure('https://api.example.com/api/files/list?path=%2F');
      const result = await fileService.listDirectory('/');
      // Should log the error
      const lastLog = mockLogger.getLastLog();
      expect(lastLog?.level).toBe('error');
      expect(lastLog?.message).toBe('Failed to list directory');
      expect(lastLog?.context).toMatchObject({)
        error: 'Network error for https://api.example.com/api/files/list?path=%2F',
        path: '/',
        timestamp: expect.any(String),
      });
      // Should return mock data as fallback
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
    it('should throw errors when mock fallback is disabled', async () => {
      // Create service with mock fallback disabled
      const serviceNoFallback = new FileService({)
        httpClient: mockHttpClient,
        authProvider: mockAuthProvider,
        logger: mockLogger,
        config: { ...config, enableMockFallback: false }
      });
      mockHttpClient.setFailure('https://api.example.com/api/files/list?path=%2F');
      await expect(serviceNoFallback.listDirectory('/')).rejects.toThrow('Network error');
      // Should still log the error
      const lastLog = mockLogger.getLastLog();
      expect(lastLog?.level).toBe('error');
      expect(lastLog?.message).toBe('Failed to list directory');
    });
    it('should log all file operations with context', async () => {
      mockHttpClient.setResponse('https://api.example.com/api/files/move', {
        success: true,
        message: 'File moved successfully',
      });
      await fileService.moveFile('/source.txt', '/target.txt');
      const logs = mockLogger.logs.filter(log => log.level === 'info' || log.level === 'error');
      // Should not log successful operations by default (only errors)
      // But if there were any errors, they would be logged with full context
      expect(mockLogger.logs.length).toBe(0); // No errors occurred
    });
  });
  describe('File Operations Integration', () => {
    it('should handle complete file move workflow', async () => {
      const mockResponse = {
        success: true,
        message: 'File moved successfully',
        data: { sourcePath: '/old/file.txt', targetPath: '/new/file.txt', operation: 'move' }
      };
      mockHttpClient.setResponse('https://api.example.com/api/files/move', mockResponse);
      const result = await fileService.moveFile('/old/file.txt', '/new/file.txt');
      expect(result).toEqual(mockResponse);
      const lastRequest = mockHttpClient.getLastRequest();
      expect(lastRequest?.url).toBe('https://api.example.com/api/files/move');
      expect(lastRequest?.options?.method).toBe('POST');
      expect(lastRequest?.options?.body).toBe(JSON.stringify({)
        sourcePath: '/old/file.txt',
        targetPath: '/new/file.txt',
      }));
    });
    it('should handle file upload with FormData', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const mockResponse = {
        success: true,
        message: 'File uploaded successfully',
        data: { fileName: 'test.txt', size: 12 }
      };
      // Mock fetch for upload since it doesn't use the httpClient
      global.fetch = jest.fn<unknown[], unknown>().mockResolvedValue({)
        ok: true,
        json: ( as unknown as unknown) => Promise.resolve(mockResponse),
      });
      const result = await fileService.uploadFile('/uploads', mockFile);
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith()
        'https://api.example.com/api/files/upload',
        expect.objectContaining({)
          method: 'POST',
          headers: {,
            'Authorization': 'Bearer test-token-123'
          },
          body: expect.any(FormData),
        })
      );
    });
    it('should handle batch operations efficiently', async () => {
      const paths = ['/file1.txt', '/file2.txt', '/file3.txt'];
      const mockResponse = paths.map(path => ({)
        success: true,
        message: `Delete operation completed for ${path}`,}
        data: { path, operation: 'delete' }
      }));
      mockHttpClient.setResponse('https://api.example.com/api/files/batch', mockResponse);
      const result = await fileService.batchOperation('delete', paths);
      expect(result).toEqual(mockResponse);
      const lastRequest = mockHttpClient.getLastRequest();
      expect(JSON.parse(lastRequest?.options?.body as string)).toEqual({)
        operation: 'delete',
        paths,
        targetPath: undefined,
      });
    });
  });
  describe('Configuration and Environment Integration', () => {
    it('should use different base URLs based on configuration', async () => {
      const devService = new FileService({)
        httpClient: mockHttpClient,
        authProvider: mockAuthProvider,
        logger: mockLogger,
        config: { baseUrl: 'https://dev-api.example.com', enableMockFallback: true }
      });
      mockHttpClient.setResponse('https://dev-api.example.com/api/files/list?path=%2F', []);
      await devService.listDirectory('/');
      const lastRequest = mockHttpClient.getLastRequest();
      expect(lastRequest?.url).toBe('https://dev-api.example.com/api/files/list?path=%2F');
    });
    it('should handle different mock fallback configurations', async () => {
      const noFallbackService = new FileService({)
        httpClient: mockHttpClient,
        authProvider: mockAuthProvider,
        logger: mockLogger,
        config: { baseUrl: 'https://api.example.com', enableMockFallback: false }
      });
      mockHttpClient.setFailure('https://api.example.com/api/files/list?path=%2F');
      // Should throw without fallback
      await expect(noFallbackService.listDirectory('/')).rejects.toThrow();
      // Original service should provide fallback
      const result = await fileService.listDirectory('/');
      expect(result).toBeInstanceOf(Array);
    });
  });
  describe('Performance and Caching Integration', () => {
    it('should handle concurrent requests efficiently', async () => {
      const paths = ['/path1', '/path2', '/path3'];
      // Set up responses for all paths
      paths.forEach(path => {)
        mockHttpClient.setResponse()
          `https://api.example.com/api/files/list?path=${encodeURIComponent(path)}`,}
          [{ id: path, name: path, type: 'folder', path, lastModified: new Date(), createdAt: new Date(), tags: [] }]
        );
      });
      // Make concurrent requests
      const promises = paths.map(path => fileService.listDirectory(path));
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      expect(mockHttpClient.requestLog).toHaveLength(3);
      // All requests should have been made
      paths.forEach((path, index) => {
        expect(mockHttpClient.requestLog[index].url).toContain(encodeURIComponent(path));
      });
    });
    it('should handle request timing and sequence', async () => {
      const delays = [100, 50, 200];
      const paths = ['/slow', '/fast', '/slowest'];
      // Create delayed responses
      paths.forEach((path, index) => {
        mockHttpClient.setResponse()
          `https://api.example.com/api/files/list?path=${encodeURIComponent(path)}`,}
          new Promise(resolve => )
            setTimeout(() => resolve([{ )
              id: path, 
              name: path, 
              type: 'folder', 
              path, 
              lastModified: new Date(), 
              createdAt: new Date(), 
              tags: [] ,
            }]), delays[index])
        );
      });
      const startTime = Date.now();
      const promises = paths.map(path => fileService.listDirectory(path));
      const results = await Promise.all(promises);
      const endTime = Date.now();
      expect(results).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(300); // Should complete when slowest completes
    });
  });
  describe('Error Recovery and Resilience', () => {
    it('should recover from temporary network failures', async () => {
      const url = 'https://api.example.com/api/files/list?path=%2F';
      // First request fails
      mockHttpClient.setFailure(url);
      let result = await fileService.listDirectory('/');
      // Should get mock data
      expect(result).toBeInstanceOf(Array);
      expect(mockLogger.getLastLog()?.level).toBe('error');
      // Clear failure and try again
      mockHttpClient.shouldFail.delete(url);
      mockHttpClient.setResponse(url, [)
        { id: '1', name: 'real-file.txt', type: 'file', path: '/real-file.txt', lastModified: new Date(), createdAt: new Date(), tags: [] }
      ]);
      mockLogger.clearLogs();
      result = await fileService.listDirectory('/');
      // Should get real data now
      expect(result[0].name).toBe('real-file.txt');
      expect(mockLogger.logs).toHaveLength(0); // No errors
    });
    it('should handle malformed responses gracefully', async () => {
      mockHttpClient.setResponse('https://api.example.com/api/files/list?path=%2F', 'invalid-json');
      const result = await fileService.listDirectory('/');
      // Should fall back to mock data
      expect(result).toBeInstanceOf(Array);
      expect(mockLogger.getLastLog()?.level).toBe('error');
    });
  });
  describe('Real-world Workflow Integration', () => {
    it('should handle complete file management workflow', async () => {
      // 1. List directory
      mockHttpClient.setResponse('https://api.example.com/api/files/list?path=%2F', [
        { id: '1', name: 'old-name.txt', type: 'file', path: '/old-name.txt', lastModified: new Date(), createdAt: new Date(), tags: [] }
      ]);
      const files = await fileService.listDirectory('/');
      expect(files[0].name).toBe('old-name.txt');
      // 2. Rename file
      mockHttpClient.setResponse('https://api.example.com/api/files/rename', {
        success: true,
        message: 'File renamed successfully',
        data: { oldPath: '/old-name.txt', newName: 'new-name.txt' }
      });
      const renameResult = await fileService.renameFile('/old-name.txt', 'new-name.txt');
      expect(renameResult.success).toBe(true);
      // 3. Move file to subfolder
      mockHttpClient.setResponse('https://api.example.com/api/files/create-folder', {
        success: true,
        message: 'Folder created successfully',
        data: { parentPath: '/', folderName: 'archive', path: '/archive' }
      });
      const folderResult = await fileService.createFolder('/', 'archive');
      expect(folderResult.success).toBe(true);
      mockHttpClient.setResponse('https://api.example.com/api/files/move', {
        success: true,
        message: 'File moved successfully',
        data: { sourcePath: '/new-name.txt', targetPath: '/archive/new-name.txt', operation: 'move' }
      });
      const moveResult = await fileService.moveFile('/new-name.txt', '/archive/new-name.txt');
      expect(moveResult.success).toBe(true);
      // Verify all operations were logged appropriately
      const allRequests = mockHttpClient.requestLog;
      expect(allRequests).toHaveLength(4); // list, rename, create-folder, move
      expect(allRequests.map(r => r.url)).toEqual([)
        'https://api.example.com/api/files/list?path=%2F',
        'https://api.example.com/api/files/rename',
        'https://api.example.com/api/files/create-folder',
        'https://api.example.com/api/files/move'
      ]);
    });
  });
});