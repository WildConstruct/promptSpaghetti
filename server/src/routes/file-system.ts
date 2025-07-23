/**
 * File System API Routes - Docker-based local development
 * 
 * Provides complete file system operations for the file browser interface.
 * Uses local Docker volumes for file storage instead of AWS S3.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

// File system types
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
  extension?: string;
  mimeType?: string;
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

export interface FileOperationResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface FileStats {
  totalFiles: number;
  totalFolders: number;
  totalSize: number;
  recentFiles: TreeNode[];
}

// Docker volume paths (configurable via environment)
const FILE_STORAGE_ROOT = process.env.FILE_STORAGE_ROOT || '/app/storage/user-files';
const TEMP_UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || '/app/storage/temp';

/**
 * Ensure storage directories exist
 */
async function ensureDirectories() {
  try {
    await fs.mkdir(FILE_STORAGE_ROOT, { recursive: true });
    await fs.mkdir(TEMP_UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create storage directories:', error);
  }
}

/**
 * Convert file system path to API path
 */
function toApiPath(fsPath: string): string {
  return fsPath.replace(FILE_STORAGE_ROOT, '').replace(/\\/g, '/') || '/';
}

/**
 * Convert API path to file system path
 */
function toFsPath(apiPath: string): string {
  const normalized = apiPath.replace(/^\/+/, '').replace(/\\/g, '/');
  return path.join(FILE_STORAGE_ROOT, normalized);
}

/**
 * Get file metadata from file system
 */
async function getFileMetadata(fsPath: string, apiPath: string): Promise<TreeNode | null> {
  try {
    const stats = await fs.stat(fsPath);
    const name = path.basename(fsPath);
    const extension = path.extname(name).slice(1);
    
    // Generate unique ID from path
    const id = Buffer.from(apiPath).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
    
    // Determine MIME type
    const mimeTypes: Record<string, string> = {
      'psg': 'application/psg',
      'json': 'application/json',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'js': 'application/javascript',
      'ts': 'application/typescript',
      'jsx': 'application/javascript',
      'tsx': 'application/typescript'
    };

    const node: TreeNode = {
      id,
      name,
      type: stats.isDirectory() ? 'folder' : 'file',
      path: apiPath,
      size: stats.isFile() ? stats.size : undefined,
      lastModified: stats.mtime,
      createdAt: stats.birthtime,
      tags: [],
      extension: stats.isFile() ? extension : undefined,
      mimeType: stats.isFile() ? (mimeTypes[extension] || 'application/octet-stream') : undefined,
      permissions: {
        read: true,
        write: true,
        delete: true,
        share: true
      }
    };

    // Add metadata for PSG files
    if (extension === 'psg' || extension === 'json') {
      try {
        const content = await fs.readFile(fsPath, 'utf-8');
        const data = JSON.parse(content);
        
        if (data.nodes && data.edges) {
          node.metadata = {
            nodeCount: Array.isArray(data.nodes) ? data.nodes.length : 0,
            edgeCount: Array.isArray(data.edges) ? data.edges.length : 0,
            description: data.description || data.metadata?.description || 'Graph file',
            author: data.author || data.metadata?.author || 'Unknown',
            version: data.version || data.metadata?.version || '1.0'
          };
          node.tags.push('graph', 'project');
        }
      } catch {
        // Ignore metadata parsing errors
      }
    }

    return node;
  } catch (error) {
    console.error('Failed to get file metadata:', error);
    return null;
  }
}

/**
 * Build directory tree recursively
 */
async function buildDirectoryTree(fsPath: string, apiPath: string, depth = 0): Promise<TreeNode[]> {
  const maxDepth = 10; // Prevent infinite recursion
  if (depth > maxDepth) return [];

  try {
    const entries = await fs.readdir(fsPath, { withFileTypes: true });
    const nodes: TreeNode[] = [];

    for (const entry of entries) {
      // Skip hidden files and system files
      if (entry.name.startsWith('.')) continue;

      const entryFsPath = path.join(fsPath, entry.name);
      const entryApiPath = apiPath === '/' ? `/${entry.name}` : `${apiPath}/${entry.name}`;
      
      const node = await getFileMetadata(entryFsPath, entryApiPath);
      if (!node) continue;

      // Add children for directories (but don't expand deeply by default)
      if (entry.isDirectory() && depth < 2) {
        const children = await buildDirectoryTree(entryFsPath, entryApiPath, depth + 1);
        node.children = children;
        node.isExpanded = depth === 0; // Only expand root level
      }

      nodes.push(node);
    }

    // Sort: directories first, then files, alphabetically
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error('Failed to build directory tree:', error);
    return [];
  }
}

/**
 * Register file system API routes
 */
export async function registerFileSystemRoutes(fastify: FastifyInstance) {
  // Ensure storage directories exist
  await ensureDirectories();

  // List directory contents
  fastify.get<{
    Querystring: { path?: string };
  }>('/api/files/list', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          path: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { path?: string } }>, reply: FastifyReply) => {
    try {
      const apiPath = request.query.path || '/';
      const fsPath = toFsPath(apiPath);

      // Security check: ensure path is within storage root
      const resolvedPath = path.resolve(fsPath);
      if (!resolvedPath.startsWith(path.resolve(FILE_STORAGE_ROOT))) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Access denied'
        });
      }

      const tree = await buildDirectoryTree(fsPath, apiPath);
      return reply.send(tree);
    } catch (error) {
      console.error('Failed to list directory:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to list directory contents'
      });
    }
  });

  // Move file or folder
  fastify.post<{
    Body: { sourcePath: string; targetPath: string };
  }>('/api/files/move', {
    schema: {
      body: {
        type: 'object',
        required: ['sourcePath', 'targetPath'],
        properties: {
          sourcePath: { type: 'string' },
          targetPath: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { sourcePath: string; targetPath: string } }>, reply: FastifyReply) => {
    try {
      const { sourcePath, targetPath } = request.body;
      const sourceFsPath = toFsPath(sourcePath);
      const targetFsPath = toFsPath(targetPath);

      // Security checks
      const resolvedSource = path.resolve(sourceFsPath);
      const resolvedTarget = path.resolve(targetFsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedSource.startsWith(rootPath) || !resolvedTarget.startsWith(rootPath)) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      // Ensure target directory exists
      await fs.mkdir(path.dirname(targetFsPath), { recursive: true });

      // Move the file/folder
      await fs.rename(sourceFsPath, targetFsPath);

      return reply.send({
        success: true,
        message: `Moved ${sourcePath} to ${targetPath}`,
        data: { sourcePath, targetPath, operation: 'move' }
      });
    } catch (error) {
      console.error('Failed to move file:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to move file',
        message: error.message
      });
    }
  });

  // Copy file or folder
  fastify.post<{
    Body: { sourcePath: string; targetPath: string };
  }>('/api/files/copy', {
    schema: {
      body: {
        type: 'object',
        required: ['sourcePath', 'targetPath'],
        properties: {
          sourcePath: { type: 'string' },
          targetPath: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { sourcePath: string; targetPath: string } }>, reply: FastifyReply) => {
    try {
      const { sourcePath, targetPath } = request.body;
      const sourceFsPath = toFsPath(sourcePath);
      const targetFsPath = toFsPath(targetPath);

      // Security checks
      const resolvedSource = path.resolve(sourceFsPath);
      const resolvedTarget = path.resolve(targetFsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedSource.startsWith(rootPath) || !resolvedTarget.startsWith(rootPath)) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      // Ensure target directory exists
      await fs.mkdir(path.dirname(targetFsPath), { recursive: true });

      // Copy file or directory recursively
      await fs.cp(sourceFsPath, targetFsPath, { recursive: true });

      return reply.send({
        success: true,
        message: `Copied ${sourcePath} to ${targetPath}`,
        data: { sourcePath, targetPath, operation: 'copy' }
      });
    } catch (error) {
      console.error('Failed to copy file:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to copy file',
        message: error.message
      });
    }
  });

  // Rename file or folder
  fastify.post<{
    Body: { path: string; newName: string };
  }>('/api/files/rename', {
    schema: {
      body: {
        type: 'object',
        required: ['path', 'newName'],
        properties: {
          path: { type: 'string' },
          newName: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { path: string; newName: string } }>, reply: FastifyReply) => {
    try {
      const { path: filePath, newName } = request.body;
      const sourceFsPath = toFsPath(filePath);
      const targetFsPath = path.join(path.dirname(sourceFsPath), newName);

      // Security check
      const resolvedSource = path.resolve(sourceFsPath);
      const resolvedTarget = path.resolve(targetFsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedSource.startsWith(rootPath) || !resolvedTarget.startsWith(rootPath)) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      // Rename the file/folder
      await fs.rename(sourceFsPath, targetFsPath);

      return reply.send({
        success: true,
        message: `Renamed to ${newName}`,
        data: { oldPath: filePath, newName, newPath: toApiPath(targetFsPath) }
      });
    } catch (error) {
      console.error('Failed to rename file:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to rename file',
        message: error.message
      });
    }
  });

  // Delete file or folder
  fastify.delete<{
    Body: { path: string };
  }>('/api/files/delete', {
    schema: {
      body: {
        type: 'object',
        required: ['path'],
        properties: {
          path: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { path: string } }>, reply: FastifyReply) => {
    try {
      const { path: filePath } = request.body;
      const fsPath = toFsPath(filePath);

      // Security check
      const resolvedPath = path.resolve(fsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedPath.startsWith(rootPath)) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      // Delete file or directory
      const stats = await fs.stat(fsPath);
      if (stats.isDirectory()) {
        await fs.rm(fsPath, { recursive: true, force: true });
      } else {
        await fs.unlink(fsPath);
      }

      return reply.send({
        success: true,
        message: `Deleted ${filePath}`,
        data: { path: filePath }
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to delete file',
        message: error.message
      });
    }
  });

  // Create folder
  fastify.post<{
    Body: { parentPath: string; folderName: string };
  }>('/api/files/create-folder', {
    schema: {
      body: {
        type: 'object',
        required: ['parentPath', 'folderName'],
        properties: {
          parentPath: { type: 'string' },
          folderName: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: { parentPath: string; folderName: string } }>, reply: FastifyReply) => {
    try {
      const { parentPath, folderName } = request.body;
      const parentFsPath = toFsPath(parentPath);
      const folderFsPath = path.join(parentFsPath, folderName);

      // Security check
      const resolvedPath = path.resolve(folderFsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedPath.startsWith(rootPath)) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      // Create folder
      await fs.mkdir(folderFsPath, { recursive: true });

      const newPath = parentPath === '/' ? `/${folderName}` : `${parentPath}/${folderName}`;

      return reply.send({
        success: true,
        message: `Created folder ${folderName}`,
        data: { parentPath, folderName, path: newPath }
      });
    } catch (error) {
      console.error('Failed to create folder:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to create folder',
        message: error.message
      });
    }
  });

  // Upload file
  fastify.post('/api/files/upload', {
    schema: {
      consumes: ['multipart/form-data']
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({
          success: false,
          error: 'No file provided'
        });
      }

      const parentPath = data.fields.parentPath?.value || '/';
      const parentFsPath = toFsPath(parentPath);
      const fileFsPath = path.join(parentFsPath, data.filename);

      // Security check
      const resolvedPath = path.resolve(fileFsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedPath.startsWith(rootPath)) {
        return reply.code(403).send({
          success: false,
          error: 'Access denied'
        });
      }

      // Ensure parent directory exists
      await fs.mkdir(parentFsPath, { recursive: true });

      // Save uploaded file
      await pipeline(data.file, createWriteStream(fileFsPath));

      return reply.send({
        success: true,
        message: `Uploaded ${data.filename}`,
        data: { 
          parentPath, 
          fileName: data.filename, 
          size: (await fs.stat(fileFsPath)).size,
          path: toApiPath(fileFsPath)
        }
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      return reply.code(500).send({
        success: false,
        error: 'Failed to upload file',
        message: error.message
      });
    }
  });

  // Get file properties
  fastify.get<{
    Querystring: { path: string };
  }>('/api/files/properties', {
    schema: {
      querystring: {
        type: 'object',
        required: ['path'],
        properties: {
          path: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { path: string } }>, reply: FastifyReply) => {
    try {
      const { path: filePath } = request.query;
      const fsPath = toFsPath(filePath);

      // Security check
      const resolvedPath = path.resolve(fsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedPath.startsWith(rootPath)) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Access denied'
        });
      }

      const node = await getFileMetadata(fsPath, filePath);
      if (!node) {
        return reply.code(404).send({
          error: 'Not Found',
          message: 'File not found'
        });
      }

      return reply.send(node);
    } catch (error) {
      console.error('Failed to get file properties:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get file properties'
      });
    }
  });

  // Check if file exists
  fastify.get<{
    Querystring: { path: string };
  }>('/api/files/exists', {
    schema: {
      querystring: {
        type: 'object',
        required: ['path'],
        properties: {
          path: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { path: string } }>, reply: FastifyReply) => {
    try {
      const { path: filePath } = request.query;
      const fsPath = toFsPath(filePath);

      // Security check
      const resolvedPath = path.resolve(fsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedPath.startsWith(rootPath)) {
        return reply.send({ exists: false });
      }

      try {
        await fs.access(fsPath);
        return reply.send({ exists: true });
      } catch {
        return reply.send({ exists: false });
      }
    } catch (error) {
      console.error('Failed to check file existence:', error);
      return reply.send({ exists: false });
    }
  });

  // Get file statistics
  fastify.get<{
    Querystring: { path?: string };
  }>('/api/files/stats', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          path: { type: 'string' }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { path?: string } }>, reply: FastifyReply) => {
    try {
      const apiPath = request.query.path || '/';
      const fsPath = toFsPath(apiPath);

      // Security check
      const resolvedPath = path.resolve(fsPath);
      const rootPath = path.resolve(FILE_STORAGE_ROOT);
      
      if (!resolvedPath.startsWith(rootPath)) {
        return reply.code(403).send({
          error: 'Forbidden',
          message: 'Access denied'
        });
      }

      const stats: FileStats = {
        totalFiles: 0,
        totalFolders: 0,
        totalSize: 0,
        recentFiles: []
      };

      // Recursively count files and folders
      async function countItems(dirPath: string) {
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.name.startsWith('.')) continue;
            
            const entryPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
              stats.totalFolders++;
              await countItems(entryPath);
            } else {
              stats.totalFiles++;
              const fileStat = await fs.stat(entryPath);
              stats.totalSize += fileStat.size;
              
              // Add to recent files if modified in last 7 days
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              if (fileStat.mtime > weekAgo) {
                const apiFilePath = toApiPath(entryPath);
                const node = await getFileMetadata(entryPath, apiFilePath);
                if (node) {
                  stats.recentFiles.push(node);
                }
              }
            }
          }
        } catch (error) {
          // Skip directories we can't read
        }
      }

      await countItems(fsPath);

      // Sort recent files by modification date (newest first)
      stats.recentFiles.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
      stats.recentFiles = stats.recentFiles.slice(0, 10); // Limit to 10

      return reply.send(stats);
    } catch (error) {
      console.error('Failed to get file stats:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get file statistics'
      });
    }
  });

  fastify.log.info('File system API routes registered successfully');
  fastify.log.info(`Storage root: ${FILE_STORAGE_ROOT}`);
}