/**
 * Project Manager - Core file management system for .psg project files
 * 
 * Handles save/load operations for prompt graph projects with metadata and validation
 */

import { z } from 'zod';
import { graphSchema, type Graph } from './graphSchema';
import { 
  PSGFileSchema, 
  parsePSGFile, 
  serializePSGFile, 
  createPSGFile,
  PSGFile as EnhancedPSGFile,
  ProjectMetadata as EnhancedProjectMetadata,
  PSGError,
  PSGErrorType,
  PSG_FILE_EXTENSION,
  PSG_MIME_TYPE
} from './fileFormats/psg';

// Re-export enhanced types from the PSG format module
export type ProjectMetadata = EnhancedProjectMetadata;
export type PSGFile = EnhancedPSGFile;
export type ProjectSettings = PSGFile['settings'];

export interface SaveProjectOptions {
  name: string;
  description?: string;
  author?: string;
  tags?: string[];
}

export interface LoadProjectResult {
  success: boolean;
  data?: PSGFile;
  error?: string;
  errorDetails?: PSGError;
  warnings?: string[];
}

export interface SaveProjectResult {
  success: boolean;
  fileName?: string;
  error?: string;
  errorDetails?: PSGError;
  warnings?: string[];
}

/**
 * ProjectManager class handles all project file operations
 */
export class ProjectManager {
  private static readonly FILE_EXTENSION = PSG_FILE_EXTENSION;
  private static readonly MIME_TYPE = PSG_MIME_TYPE;
  private static readonly FORMAT_VERSION = '1.0.0';

  /**
   * Create a new project file from graph data
   */
  static createProjectFile(
    graph: Graph | { nodes: any[]; edges: any[]; seed?: number; viewport?: { x: number; y: number; zoom: number } },
    options: SaveProjectOptions,
    settings: Partial<ProjectSettings> = {}
  ): PSGFile {
    // Handle both Graph types and React Flow graph data
    const nodes = 'nodes' in graph ? graph.nodes : [];
    const edges = 'edges' in graph ? graph.edges : [];
    const seed = 'seed' in graph ? graph.seed : undefined;
    const viewport = 'viewport' in graph ? graph.viewport : undefined;
    
    return createPSGFile(
      nodes,
      edges,
      {
        name: options.name,
        description: options.description,
        author: options.author,
        tags: options.tags,
      },
      settings,
      seed,
      viewport
    );
  }

  /**
   * Serialize project to JSON string with enhanced error handling
   */
  static serializeProject(projectData: PSGFile, pretty: boolean = true): SaveProjectResult {
    const result = serializePSGFile(projectData, { pretty, validate: true });
    
    if (result.success) {
      return {
        success: true,
        warnings: result.warnings
      };
    } else {
      return {
        success: false,
        error: result.error.message,
        errorDetails: result.error
      };
    }
  }

  /**
   * Parse and validate project file content with comprehensive error handling
   */
  static parseProjectFile(content: string, options: {
    maxFileSize?: number;
    strictValidation?: boolean;
  } = {}): LoadProjectResult {
    const result = parsePSGFile(content, options);
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        warnings: result.warnings
      };
    } else {
      return {
        success: false,
        error: result.error.message,
        errorDetails: result.error
      };
    }
  }

  /**
   * Save project file to user's device with enhanced error handling
   */
  static async saveProjectToDevice(
    graph: Graph | { nodes: any[]; edges: any[]; seed?: number; viewport?: { x: number; y: number; zoom: number } },
    options: SaveProjectOptions,
    settings?: Partial<ProjectSettings>
  ): Promise<SaveProjectResult> {
    try {
      // Create project file
      const projectFile = this.createProjectFile(graph, options, settings);
      
      // Serialize to JSON with validation
      const serializationResult = serializePSGFile(projectFile, { pretty: true, validate: true });
      
      if (!serializationResult.success) {
        return {
          success: false,
          error: serializationResult.error.message,
          errorDetails: serializationResult.error
        };
      }
      
      const jsonContent = serializationResult.data;
      
      // Create filename
      const sanitizedName = options.name.replace(/[^a-z0-9.-]/gi, '_');
      const fileName = `${sanitizedName}${this.FILE_EXTENSION}`;
      
      // Create download with proper MIME type
      const blob = new Blob([jsonContent], { type: this.MIME_TYPE });
      const url = URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      URL.revokeObjectURL(url);
      
      return {
        success: true,
        fileName,
        warnings: serializationResult.warnings
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to save project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Load project file from user's device
   */
  static loadProjectFromDevice(): Promise<LoadProjectResult> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = this.FILE_EXTENSION;
      input.style.display = 'none';
      
      input.addEventListener('change', async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (!file) {
          resolve({
            success: false,
            error: 'No file selected',
          });
          return;
        }
        
        try {
          const content = await file.text();
          const result = this.parseProjectFile(content);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        } finally {
          document.body.removeChild(input);
        }
      });
      
      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        resolve({
          success: false,
          error: 'File selection cancelled',
        });
      });
      
      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Update project metadata
   */
  static updateProjectMetadata(
    projectFile: PSGFile,
    updates: Partial<Omit<ProjectMetadata, 'createdAt' | 'fileFormatVersion'>>
  ): PSGFile {
    return {
      ...projectFile,
      metadata: {
        ...projectFile.metadata,
        ...updates,
        lastModified: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate project file size and complexity
   */
  static validateProjectComplexity(projectFile: PSGFile): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    // Check file size (approximate)
    const jsonString = JSON.stringify(projectFile);
    const sizeInKB = new Blob([jsonString]).size / 1024;
    
    if (sizeInKB > 1024) { // 1MB
      warnings.push(`Large project file (${sizeInKB.toFixed(1)}KB). Loading may be slow.`);
    }
    
    // Check graph complexity
    const nodeCount = projectFile.graph.nodes.length;
    const edgeCount = projectFile.graph.edges.length;
    
    if (nodeCount > 100) {
      warnings.push(`Large number of nodes (${nodeCount}). Consider breaking into smaller projects.`);
    }
    
    if (edgeCount > 200) {
      warnings.push(`Large number of connections (${edgeCount}). Performance may be impacted.`);
    }
    
    return {
      valid: true,
      warnings,
    };
  }

  /**
   * Generate project file name from metadata
   */
  static generateFileName(metadata: ProjectMetadata): string {
    const sanitizedName = metadata.name.replace(/[^a-z0-9.-]/gi, '_');
    return `${sanitizedName}${this.FILE_EXTENSION}`;
  }

  /**
   * Extract basic info from project file without full parsing
   */
  static extractProjectInfo(content: string): { name?: string; lastModified?: string; error?: string } {
    try {
      const parsed = JSON.parse(content);
      return {
        name: parsed.metadata?.name,
        lastModified: parsed.metadata?.lastModified,
      };
    } catch (error) {
      return {
        error: 'Could not read project info',
      };
    }
  }
}

export default ProjectManager;