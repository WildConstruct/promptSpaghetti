/**
 * Project Manager - Core file management system for .psg project files
 * 
 * Handles save/load operations for prompt graph projects with metadata and validation
 */

import { z } from 'zod';
import { graphSchema, type Graph } from './graphSchema';

// Project metadata schema
const ProjectMetadataSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  createdAt: z.string().datetime(),
  lastModified: z.string().datetime(),
  author: z.string().optional(),
  tags: z.array(z.string()).default([]),
  fileFormatVersion: z.string().default('1.0.0'),
});

// Complete .psg file format schema
const PSGFileSchema = z.object({
  metadata: ProjectMetadataSchema,
  graph: graphSchema,
  settings: z.object({
    autoSave: z.boolean().default(true),
    autoSaveInterval: z.number().default(5000), // milliseconds
    theme: z.enum(['light', 'dark']).default('light'),
    gridVisible: z.boolean().default(true),
    snapToGrid: z.boolean().default(false),
    miniMapVisible: z.boolean().default(true),
  }).default({}),
});

export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type PSGFile = z.infer<typeof PSGFileSchema>;
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
  warnings?: string[];
}

export interface SaveProjectResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

/**
 * ProjectManager class handles all project file operations
 */
export class ProjectManager {
  private static readonly FILE_EXTENSION = '.psg';
  private static readonly FORMAT_VERSION = '1.0.0';

  /**
   * Create a new project file from graph data
   */
  static createProjectFile(
    graph: Graph,
    options: SaveProjectOptions,
    settings: Partial<ProjectSettings> = {}
  ): PSGFile {
    const now = new Date().toISOString();
    
    const metadata: ProjectMetadata = {
      name: options.name,
      description: options.description,
      version: '1.0.0',
      createdAt: now,
      lastModified: now,
      author: options.author,
      tags: options.tags || [],
      fileFormatVersion: this.FORMAT_VERSION,
    };

    const defaultSettings: ProjectSettings = {
      autoSave: true,
      autoSaveInterval: 5000,
      theme: 'light',
      gridVisible: true,
      snapToGrid: false,
      miniMapVisible: true,
      ...settings,
    };

    return {
      metadata,
      graph,
      settings: defaultSettings,
    };
  }

  /**
   * Serialize project to JSON string
   */
  static serializeProject(projectData: PSGFile): string {
    try {
      return JSON.stringify(projectData, null, 2);
    } catch (error) {
      throw new Error(`Failed to serialize project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse and validate project file content
   */
  static parseProjectFile(content: string): LoadProjectResult {
    try {
      // Parse JSON
      const parsedData = JSON.parse(content);
      
      // Validate against schema
      const validationResult = PSGFileSchema.safeParse(parsedData);
      
      if (!validationResult.success) {
        const errorMessages = validationResult.error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join('; ');
        
        return {
          success: false,
          error: `Invalid project file format: ${errorMessages}`,
        };
      }

      const warnings: string[] = [];
      
      // Check format version compatibility
      if (validationResult.data.metadata.fileFormatVersion !== this.FORMAT_VERSION) {
        warnings.push(
          `Project was created with format version ${validationResult.data.metadata.fileFormatVersion},
          current version is ${this.FORMAT_VERSION}`
        );
      }

      return {
        success: true,
        data: validationResult.data,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
      
    } catch (error) {
      if (error instanceof SyntaxError) {
        return {
          success: false,
          error: 'Invalid JSON format in project file',
        };
      }
      
      return {
        success: false,
        error: `Failed to parse project file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Save project file to user's device
   */
  static async saveProjectToDevice(
    graph: Graph,
    options: SaveProjectOptions,
    settings?: Partial<ProjectSettings>
  ): Promise<SaveProjectResult> {
    try {
      // Create project file
      const projectFile = this.createProjectFile(graph, options, settings);
      
      // Serialize to JSON
      const jsonContent = this.serializeProject(projectFile);
      
      // Create filename
      const sanitizedName = options.name.replace(/[^a-z0-9.-]/gi, '_');
      const fileName = `${sanitizedName}${this.FILE_EXTENSION}`;
      
      // Create download
      const blob = new Blob([jsonContent], { type: 'application/json' });
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