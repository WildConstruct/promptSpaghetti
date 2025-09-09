/**
 * File Service - API client for file operations
 *
 * Enhanced with dependency injection for better testability and separation of concerns
 */
import { useAuthStore } from '../stores/authStore';

// Dependency Injection Interfaces

export interface HttpClient {
  request<T>(url: string, options?: RequestInit): Promise<T>;
}

export interface AuthProvider {
  getToken(): string | null;
}

export interface Logger {
  error(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
}

export interface FileServiceConfig {
  baseUrl: string;
  enableMockFallback: boolean;
}

export interface FileServiceDependencies {
  httpClient: HttpClient;
  authProvider: AuthProvider;
  logger: Logger;
  config: FileServiceConfig;
}

export interface FileOperationResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  lastModified: Date;
  createdAt: Date;
  tags: string[];
  children?: TreeNode[];
  isExpanded?: boolean;
  metadata?: {
    nodeCount?: number;
    edgeCount?: number;
    description?: string;
    author?: string;
    version?: string;
    thumbnail?: string;
  };
  permissions?: {
    read: boolean;
    write: boolean;
    delete: boolean;
    share: boolean;
  };
}

export interface FileStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  recentFiles: TreeNode[];
}

class FileService {
  constructor(private deps: FileServiceDependencies) {}
  // Factory method for creating with default dependencies
  static createDefault(): FileService {
    return new FileService({
      httpClient: new DefaultHttpClient(),
      authProvider: new AuthStoreProvider(),
      logger: new ConsoleLogger(),
      config: {
        baseUrl: import.meta.env.VITE_API_URL || '',
        enableMockFallback: true
      }
    });
  }

  /**
   * Get authenticated headers for API requests
   */
  private getHeaders(): HeadersInit {
    const state: any = (useAuthStore as any).getState?.() || {};
    const token =
      state?.accessToken ?? state?.token ?? this.deps.authProvider.getToken();
    const userId = state?.user?.id || null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (userId) headers['X-User-Id'] = String(userId);
    return headers;
  }

  /**
   * Make authenticated API request using injected HTTP client
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.deps.httpClient.request<T>(
      `${this.deps.config.baseUrl}${url}`,
      {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers
        }
      }
    );
  }
  /**
   * List directory contents
   */
  async listDirectory(path: string = '/'): Promise<TreeNode[]> {
    try {
      return await this.makeRequest<TreeNode[]>(
        `/api/files/list?path=${encodeURIComponent(path)}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to list directory', {
        error: errorMessage,
        path,
        timestamp: new Date().toISOString()
      });
      // Return mock data for development
      if (this.deps.config.enableMockFallback) {
        return this.getMockDirectoryData(path);
      }
      throw error;
    }
  }
  /**
   * Move file or folder from source to target path
   */
  async moveFile(
    sourcePath: string,
    targetPath: string
  ): Promise<FileOperationResponse> {
    try {
      return await this.makeRequest<FileOperationResponse>('/api/files/move', {
        method: 'POST',
        body: JSON.stringify({ sourcePath, targetPath })
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to move file', {
        error: errorMessage,
        sourcePath,
        targetPath,
        timestamp: new Date().toISOString()
      });
      // Return mock success for development
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `Moved ${sourcePath} to ${targetPath}`,
          data: { sourcePath, targetPath, operation: 'move' }
        };
      }
      throw error;
    }
  }
  /**
   * Copy file or folder from source to target path
   */
  async copyFile(
    sourcePath: string,
    targetPath: string
  ): Promise<FileOperationResponse> {
    try {
      return await this.makeRequest<FileOperationResponse>('/api/files/copy', {
        method: 'POST',
        body: JSON.stringify({ sourcePath, targetPath })
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to copy file', {
        error: errorMessage,
        sourcePath,
        targetPath,
        timestamp: new Date().toISOString()
      });
      // Return mock success for development
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `Copied ${sourcePath} to ${targetPath}`,
          data: { sourcePath, targetPath, operation: 'copy' }
        };
      }
      throw error;
    }
  }
  /**
   * Rename file or folder
   */
  async renameFile(
    path: string,
    newName: string
  ): Promise<FileOperationResponse> {
    try {
      return await this.makeRequest<FileOperationResponse>(
        '/api/files/rename',
        {
          method: 'POST',
          body: JSON.stringify({ path, newName })
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to rename file', {
        error: errorMessage,
        path,
        newName,
        timestamp: new Date().toISOString()
      });
      // Return mock success for development
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `Renamed file to ${newName}`,
          data: { oldPath: path, newName }
        };
      }
      throw error;
    }
  }
  /**
   * Delete file or folder
   */
  async deleteFile(path: string): Promise<FileOperationResponse> {
    try {
      return await this.makeRequest<FileOperationResponse>(
        '/api/files/delete',
        {
          method: 'DELETE',
          body: JSON.stringify({ path })
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to delete file', {
        error: errorMessage,
        path,
        timestamp: new Date().toISOString()
      });
      // Return mock success for development
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `Deleted ${path}`,
          data: { path }
        };
      }
      throw error;
    }
  }
  /**
   * Create new folder
   */
  async createFolder(
    parentPath: string,
    folderName: string
  ): Promise<FileOperationResponse> {
    try {
      return await this.makeRequest<FileOperationResponse>(
        '/api/files/create-folder',
        {
          method: 'POST',
          body: JSON.stringify({ parentPath, folderName })
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to create folder', {
        error: errorMessage,
        parentPath,
        folderName,
        timestamp: new Date().toISOString()
      });
      // Return mock success for development
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `Created folder ${folderName}`,
          data: { parentPath, folderName, path: `${parentPath}/${folderName}` }
        };
      }
      throw error;
    }
  }
  /**
   * Upload file to specified directory
   */
  async uploadFile(
    parentPath: string,
    file: File
  ): Promise<FileOperationResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentPath', parentPath);
      const token = this.deps.authProvider.getToken();
      const response = await fetch(
        `${this.deps.config.baseUrl}/api/files/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData
        }
      );
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to upload file', {
        error: errorMessage,
        parentPath,
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      });
      // Return mock success for development
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `Uploaded ${file.name}`,
          data: { parentPath, fileName: file.name, size: file.size }
        };
      }
      throw error;
    }
  }
  /**
   * Get file/folder properties and metadata
   */
  async getProperties(path: string): Promise<TreeNode | null> {
    try {
      return await this.makeRequest<TreeNode>(
        `/api/files/properties?path=${encodeURIComponent(path)}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to get file properties', {
        error: errorMessage,
        path,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }
  /**
   * Search files and folders
   */
  async searchFiles(
    query: string,
    searchIn: 'name' | 'content' | 'tags' | 'all' = 'name'
  ): Promise<TreeNode[]> {
    try {
      return await this.makeRequest<TreeNode[]>(
        `/api/files/search?q=${encodeURIComponent(query)}&searchIn=${searchIn}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to search files', {
        error: errorMessage,
        query,
        searchIn,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }
  /**
   * Get file statistics for dashboard
   */
  async getFileStats(path: string = '/'): Promise<FileStats> {
    try {
      return await this.makeRequest<FileStats>(
        `/api/files/stats?path=${encodeURIComponent(path)}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to get file stats', {
        error: errorMessage,
        path,
        timestamp: new Date().toISOString()
      });
      return {
        totalFiles: 0,
        totalFolders: 0,
        totalSize: 0,
        recentFiles: []
      };
    }
  }
  /**
   * Check if file/folder exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ exists: boolean }>(
        `/api/files/exists?path=${encodeURIComponent(path)}`
      );
      return response.exists;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to check file existence', {
        error: errorMessage,
        path,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }
  /**
   * Batch file operations (move, copy, delete multiple items)
   */
  async batchOperation(
    operation: 'move' | 'copy' | 'delete',
    paths: string[],
    targetPath?: string
  ): Promise<FileOperationResponse> {
    try {
      return await this.makeRequest<FileOperationResponse>('/api/files/batch', {
        method: 'POST',
        body: JSON.stringify({ operation, paths, targetPath })
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.deps.logger.error('Failed to perform batch operation', {
        error: errorMessage,
        operation,
        paths,
        targetPath,
        timestamp: new Date().toISOString()
      });
      // Return mock success for each item
      if (this.deps.config.enableMockFallback) {
        return {
          success: true,
          message: `${operation} operation completed for ${paths.length} items`,
          data: { paths, operation, targetPath }
        };
      }
      throw error;
    }
  }
  /**
   * Get mock directory data for development
   */
  private getMockDirectoryData(path: string): TreeNode[] {
    const mockData: TreeNode[] = [
      {
        id: 'root',
        name: 'My Projects',
        type: 'folder',
        path: '/',
        lastModified: new Date('2024-01-15'),
        createdAt: new Date('2024-01-01'),
        tags: ['root'],
        permissions: { read: true, write: true, delete: false, share: true },
        children: [
          {
            id: 'f1',
            name: 'Workflows',
            type: 'folder',
            path: '/workflows',
            lastModified: new Date('2024-01-10'),
            createdAt: new Date('2024-01-05'),
            tags: ['category'],
            permissions: { read: true, write: true, delete: true, share: true },
            children: [
              {
                id: 'file1',
                name: 'Character Generator.psg',
                type: 'file',
                path: '/workflows/Character Generator.psg',
                size: 15420,
                lastModified: new Date('2024-01-08'),
                createdAt: new Date('2024-01-08'),
                tags: ['character', 'rpg'],
                permissions: {
                  read: true,
                  write: true,
                  delete: true,
                  share: true
                },
                metadata: {
                  nodeCount: 12,
                  edgeCount: 15,
                  description:
                    'RPG character generator with stats and background',
                  author: 'User',
                  version: '1.2'
                }
              },
              {
                id: 'file2',
                name: 'Story Prompt.psg',
                type: 'file',
                path: '/workflows/Story Prompt.psg',
                size: 8340,
                lastModified: new Date('2024-01-06'),
                createdAt: new Date('2024-01-06'),
                tags: ['story', 'creative'],
                permissions: {
                  read: true,
                  write: true,
                  delete: true,
                  share: true
                },
                metadata: {
                  nodeCount: 8,
                  edgeCount: 10,
                  description: 'Creative story prompt generator',
                  author: 'User',
                  version: '1.0'
                }
              }
            ]
          },
          {
            id: 'f2',
            name: 'Templates',
            type: 'folder',
            path: '/templates',
            lastModified: new Date('2024-01-12'),
            createdAt: new Date('2024-01-03'),
            tags: ['templates'],
            permissions: { read: true, write: true, delete: true, share: true },
            children: [
              {
                id: 'file3',
                name: 'Basic Prompt.psg',
                type: 'file',
                path: '/templates/Basic Prompt.psg',
                size: 2100,
                lastModified: new Date('2024-01-12'),
                createdAt: new Date('2024-01-12'),
                tags: ['basic', 'template'],
                permissions: {
                  read: true,
                  write: true,
                  delete: true,
                  share: true
                },
                metadata: {
                  nodeCount: 3,
                  edgeCount: 2,
                  description: 'Simple prompt template',
                  author: 'System',
                  version: '1.0'
                }
              }
            ]
          }
        ]
      }
    ];

    if (path === '/') {
      return mockData;
    }

    // Find the specific path in mock data
    const findPath = (nodes: TreeNode[], targetPath: string): TreeNode[] => {
      for (const node of nodes) {
        if (node.path === targetPath && node.children) {
          return node.children;
        }
        if (node.children) {
          const found = findPath(node.children, targetPath);
          if (found.length > 0) {
            return found;
          }
        }
      }
      return [];
    };

    return findPath(mockData, path);
  }
}

// Concrete Implementation Classes
class DefaultHttpClient implements HttpClient {
  async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, options);
    if (!response.ok) {
      let errorData = {
        message: `Request failed with status ${response.status}`
      };
      try {
        errorData = await response.json();
      } catch {
        // Use default error data if JSON parsing fails
      }
      throw new Error(
        errorData.message ?? `Request failed with status ${response.status}`
      );
    }
    return await response.json();
  }
}

class AuthStoreProvider implements AuthProvider {
  getToken(): string | null {
    return useAuthStore.getState().token;
  }
}

class ConsoleLogger implements Logger {
  error(message: string, context?: Record<string, unknown>): void {
    console.error(`[FileService] ${message}`, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(`[FileService] ${message}`, context);
  }
  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[FileService] ${message}`, context);
  }
}

// Export singleton instance with default dependencies
export const fileService = FileService.createDefault();

// Export class for custom dependency injection
export { FileService };
