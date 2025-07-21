/**
 * .psg (PromptScape Graph) File Format
 * 
 * Defines the structure and validation for native project files
 * that can be saved, loaded, and shared between users.
 */

import { z } from 'zod';
import { Node, Edge } from 'reactflow';

// Project metadata schema - information about the project itself
export const ProjectMetadataSchema = z.object({
  name: z.string().min(1).max(100, 'Project name must be between 1-100 characters'),
  description: z.string().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  created: z.string().datetime('Invalid created date format').optional(),
  modified: z.string().datetime('Invalid modified date format').optional(),
  version: z.string().default('1.0.0'),
  fileFormatVersion: z.string().default('1.0.0'),
});

// Graph content schema - the actual node/edge data
export const GraphContentSchema = z.object({
  nodes: z.array(z.any()), // Using z.any() to allow for flexible node data structures
  edges: z.array(z.any()), // Using z.any() to allow for flexible edge data structures
  seed: z.number().optional(),
  viewport: z.object({
    x: z.number(),
    y: z.number(),
    zoom: z.number(),
  }).optional(),
});

// Editor settings schema - UI and editor preferences
export const EditorSettingsSchema = z.object({
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().min(1000).max(60000).default(5000),
  theme: z.enum(['light', 'dark']).default('light'),
  gridVisible: z.boolean().default(true),
  snapToGrid: z.boolean().default(false),
  miniMapVisible: z.boolean().default(true),
  showNodeIcons: z.boolean().default(true),
  showConnectionLabels: z.boolean().default(true),
});

// Export metadata schema - information about how/when the file was exported
export const ExportMetadataSchema = z.object({
  exportedBy: z.string().default('PromptScape GraphEditor'),
  exportDate: z.string().datetime(),
  exportVersion: z.string().default('1.0.0'),
  format: z.literal('psg'),
  compatibility: z.object({
    minVersion: z.string().default('1.0.0'),
    maxVersion: z.string().optional(),
  }).optional(),
});

// Complete .psg file format schema
export const PSGFileSchema = z.object({
  metadata: ProjectMetadataSchema,
  graph: GraphContentSchema,
  settings: EditorSettingsSchema.default({}),
  exportMetadata: ExportMetadataSchema,
});

// Type definitions
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type GraphContent = z.infer<typeof GraphContentSchema>;
export type EditorSettings = z.infer<typeof EditorSettingsSchema>;
export type ExportMetadata = z.infer<typeof ExportMetadataSchema>;
export type PSGFile = z.infer<typeof PSGFileSchema>;

// Utility functions for working with .psg files

/**
 * Creates a new .psg file from graph data
 */
export function createPSGFile(
  nodes: Node[],
  edges: Edge[],
  metadata: Partial<ProjectMetadata>,
  settings?: Partial<EditorSettings>,
  seed?: number,
  viewport?: { x: number; y: number; zoom: number }
): PSGFile {
  const now = new Date().toISOString();
  
  return {
    metadata: {
      name: metadata.name || 'Untitled Project',
      description: metadata.description,
      author: metadata.author,
      tags: metadata.tags || [],
      created: metadata.created || now,
      modified: now,
      version: metadata.version || '1.0.0',
      fileFormatVersion: '1.0.0',
    },
    graph: {
      nodes,
      edges,
      seed,
      viewport,
    },
    settings: {
      autoSave: true,
      autoSaveInterval: 5000,
      theme: 'light',
      gridVisible: true,
      snapToGrid: false,
      miniMapVisible: true,
      showNodeIcons: true,
      showConnectionLabels: true,
      ...settings,
    },
    exportMetadata: {
      exportedBy: 'PromptScape GraphEditor',
      exportDate: now,
      exportVersion: '1.0.0',
      format: 'psg' as const,
      compatibility: {
        minVersion: '1.0.0',
      },
    },
  };
}

/**
 * Validates a .psg file structure
 */
export function validatePSGFile(data: unknown): PSGFile {
  return PSGFileSchema.parse(data);
}

/**
 * Safely parses a .psg file with error handling
 */
export function parsePSGFile(jsonString: string): {
  success: true;
  data: PSGFile;
} | {
  success: false;
  error: string;
  details?: any;
} {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = validatePSGFile(parsed);
    
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Invalid JSON format',
        details: error.message,
      };
    }
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid .psg file format',
        details: error.errors,
      };
    }
    
    return {
      success: false,
      error: 'Unknown error occurred while parsing file',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Updates the modified timestamp and increments version if needed
 */
export function updatePSGFileMetadata(
  psgFile: PSGFile,
  changes?: Partial<ProjectMetadata>
): PSGFile {
  const now = new Date().toISOString();
  
  return {
    ...psgFile,
    metadata: {
      ...psgFile.metadata,
      ...changes,
      modified: now,
    },
  };
}

/**
 * Extracts a lightweight summary of a .psg file for listing purposes
 */
export function extractPSGFileSummary(psgFile: PSGFile): {
  id: string;
  name: string;
  description?: string;
  author?: string;
  tags: string[];
  created: string;
  modified: string;
  nodeCount: number;
  edgeCount: number;
  fileSize: number;
} {
  const content = JSON.stringify(psgFile);
  
  return {
    id: generateProjectIdFromMetadata(psgFile.metadata),
    name: psgFile.metadata.name,
    description: psgFile.metadata.description,
    author: psgFile.metadata.author,
    tags: psgFile.metadata.tags || [],
    created: psgFile.metadata.created || psgFile.exportMetadata.exportDate,
    modified: psgFile.metadata.modified || psgFile.exportMetadata.exportDate,
    nodeCount: psgFile.graph.nodes.length,
    edgeCount: psgFile.graph.edges.length,
    fileSize: content.length,
  };
}

/**
 * Generates a consistent project ID based on metadata
 */
function generateProjectIdFromMetadata(metadata: ProjectMetadata): string {
  const name = metadata.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const created = metadata.created ? new Date(metadata.created).getTime() : Date.now();
  return `${name}_${created}`;
}

/**
 * File extension and MIME type constants
 */
export export export 
/**
 * Version compatibility checker
 */
export function checkPSGCompatibility(psgFile: PSGFile, currentVersion: string = '1.0.0'): {
  compatible: boolean;
  warnings: string[];
  requiresUpgrade: boolean;
} {
  const warnings: string[] = [];
  let compatible = true;
  let requiresUpgrade = false;
  
  const fileFormatVersion = psgFile.metadata.fileFormatVersion;
  const minCompatible = psgFile.exportMetadata.compatibility?.minVersion;
  const maxCompatible = psgFile.exportMetadata.compatibility?.maxVersion;
  
  // Check minimum version compatibility
  if (minCompatible && compareVersions(currentVersion, minCompatible) < 0) {
    compatible = false;
    warnings.push(`This file requires minimum version ${minCompatible}, but you have ${currentVersion}`);
    requiresUpgrade = true;
  }
  
  // Check maximum version compatibility
  if (maxCompatible && compareVersions(currentVersion, maxCompatible) > 0) {
    warnings.push(`This file was created for version ${maxCompatible} or earlier. Some features may not work correctly.`);
  }
  
  // Check for outdated file format
  if (compareVersions(fileFormatVersion, currentVersion) < 0) {
    warnings.push(`This file uses an older format (${fileFormatVersion}). Consider upgrading it to the latest format.`);
  }
  
  return {
    compatible,
    warnings,
    requiresUpgrade,
  };
}

/**
 * Simple semantic version comparison
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    
    if (partA < partB) return -1;
    if (partA > partB) return 1;
  }
  
  return 0;
}