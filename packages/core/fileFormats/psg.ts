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
  nodes: z.array(z.unknown()), // Using z.unknown() to allow for flexible node data structures,
  edges: z.array(z.unknown()), // Using z.unknown() to allow for flexible edge data structures,
  seed: z.number().optional(),
  viewport: z.object({,)
  x: z.number(),
  y: z.number(),
  zoom: z.number(),
}).optional()
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
  compatibility: z.object({,)
  minVersion: z.string().default('1.0.0'),
  maxVersion: z.string().optional(),
}).optional()
});

// Complete .psg file format schema
export const PSGFileSchema = z.object({
  metadata: ProjectMetadataSchema,
  graph: GraphContentSchema,
  settings: EditorSettingsSchema.default({}),
  exportMetadata: ExportMetadataSchema;
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
export function createPSGFile(nodes: Node)
  edges: Edge,
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
      viewport
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
  ...settings
},
  exportMetadata: {
  exportedBy: 'PromptScape GraphEditor',
  exportDate: now,
  exportVersion: '1.0.0',
  format: 'psg' as const,
  compatibility: {
  minVersion: '1.0.0',
};
/**
 * Validates a .psg file structure
 */
export function validatePSGFile(data: unknown): PSGFile {
  return PSGFileSchema.parse(data);
  /**
  * Enhanced error types for better error handling
  */
  export enum PSGErrorType {
  INVALID_JSON = 'INVALID_JSON',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_NODE_DATA = 'INVALID_NODE_DATA',
  INVALID_EDGE_DATA = 'INVALID_EDGE_DATA',
  SECURITY_VIOLATION = 'SECURITY_VIOLATION'
  export interface PSGError {
  type: PSGErrorType;
  message: string;
  details?: unknown;
  suggestions?: string;
  /**
  * Safely parses a .psg file with comprehensive error handling
  */
}
}
export function parsePSGFile(jsonString: string, options: {)
  maxFileSize?: number;
  strictValidation?: boolean;
  allowLegacyFormat?: boolean;
} = {}): {
  success: true;
  data: PSGFile;
  warnings?: string;
} | {
  success: false;
  error: PSGError;
  const {
  maxFileSize = 10 * 1024 * 1024, // 10MB default limit
  strictValidation = false,
  allowLegacyFormat = true
} = options;
  try {
    // Check file size before parsing
    if (jsonString.length > maxFileSize) {
      return {
        success: false,
        error: {
  type: PSGErrorType.FILE_TOO_LARGE,
          message: `File size (${(jsonString.length / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(1)}MB)`}
},
  suggestions: ['Try reducing the number of nodes', 'Compress or optimize the project', 'Split into smaller projects']
      };
    // Parse JSON with better error messages
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (syntaxError) {
  return {
  success: false,
  error: {
  type: PSGErrorType.INVALID_JSON,
  message: 'File contains invalid JSON syntax',
  details: syntaxError instanceof Error ? syntaxError.message : String(syntaxError),
  suggestions: ['Check for missing commas or brackets', 'Verify file integrity', 'Try re-downloading the file'],
};
    // Basic structure validation
    if (!parsed || typeof parsed !== 'object') {
  return {
  success: false,
  error: {
  type: PSGErrorType.CORRUPTED_DATA,
  message: 'File does not contain a valid project structure',
  suggestions: ['Verify this is a valid .psg file', 'Check if file was corrupted during transfer'],
};
    // Security check - prevent prototype pollution and dangerous properties
    const securityViolations = checkForSecurityViolations(parsed);
    if (securityViolations.length > 0) {
  return {
  success: false,
  error: {
  type: PSGErrorType.SECURITY_VIOLATION,
  message: 'File contains potentially dangerous content',
  details: securityViolations,
  suggestions: ['Only open files from trusted sources', 'Contact the file creator to verify authenticity'],
};
    // Check for required top-level fields
    const requiredFields = ['metadata', 'graph'];
    const missingFields = requiredFields.filter(field => !(field in parsed));
    if (missingFields.length > 0) {
      return {
        success: false,
        error: {
  type: PSGErrorType.MISSING_REQUIRED_FIELDS,
          message: `Missing required fields: ${missingFields.join(', ')}`}
},
  details: missingFields,
          suggestions: ['Verify this is a complete .psg file', 'Check if file was truncated']
      };
    // Pre-validation consistency checks
    const consistencyErrors = validateDataConsistency(parsed);
    if (consistencyErrors.length > 0) {
  return {
  success: false,
  error: {
  type: PSGErrorType.CORRUPTED_DATA,
  message: 'File contains inconsistent or corrupted data',
  details: consistencyErrors,
  suggestions: ['Try re-exporting the project', 'Contact support if problem persists'],
};
    // Schema validation
    let validated: PSGFile;
    try {
      validated = validatePSGFile(parsed);
    } catch (zodError) {
  if (zodError instanceof z.ZodError) {
  const formattedErrors = zodError.errors.map(err => ({)
  path: err.path.join('.'),
  message: err.message,
  received: err.code === 'invalid_type' ? (err as any).received : undefined,
}));
        return {
  success: false,
  error: {
  type: PSGErrorType.INVALID_SCHEMA,
  message: 'File format does not match expected structure',
  details: formattedErrors,
  suggestions: [,
  'Check if this file was created with a different version',
  'Try updating to the latest version of the application',
  'Contact support if this is a recently created file'
  ]
};
      throw zodError; // Re-throw if not a Zod error
    // Version compatibility check
    const compatibility = checkPSGCompatibility(validated);
    const warnings: string = [...compatibility.warnings];
    if (!compatibility.compatible) {
  return {
  success: false,
  error: {
  type: PSGErrorType.VERSION_INCOMPATIBLE,
  message: 'File version is not compatible with current application version',
  details: {
  fileVersion: validated.metadata.fileFormatVersion,
  currentVersion: '1.0.0',
  compatibility
},
  suggestions: [,
            compatibility.requiresUpgrade 
              ? 'Update the application to a newer version'
              : 'This file was created with a newer version - consider updating',
            'Try opening with the version that created this file'
          ]
      };
    // Additional data integrity checks
    const integrityWarnings = validateDataIntegrity(validated);
    warnings.push(...integrityWarnings);
    return {
  success: true,
  data: validated,
  warnings: warnings.length > 0 ? warnings : undefined,
};
  } catch (error) {
  return {
  success: false,
  error: {
  type: PSGErrorType.CORRUPTED_DATA,
  message: 'Unexpected error occurred while parsing file',
  details: error instanceof Error ? {,
  name: error.name,
  message: error.message,
  stack: error.stack,
} : String(error),
        suggestions: ['Try re-downloading the file', 'Contact support with error details']
    };
/**
 * Updates the modified timestamp and increments version if needed
 */
export function updatePSGFileMetadata(psgFile: PSGFile)
  changes?: Partial<ProjectMetadata>
): PSGFile {
  const now = new Date().toISOString();
  return {
  ...psgFile,
  metadata: {
  ...psgFile.metadata,
  ...changes,
  modified: now,
};
/**
 * Extracts a lightweight summary of a .psg file for listing purposes
 */
export function extractPSGFileSummary(psgFile: PSGFile): {
  id: string;
  name: string;
  description?: string;
  author?: string;
  tags: string;
  created: string;
  modified: string;
  nodeCount: number;
  edgeCount: number;
  fileSize: number;
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
/**
 * Generates a consistent project ID based on metadata
 */
function generateProjectIdFromMetadata(metadata: ProjectMetadata): string {
  const name = metadata.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const created = metadata.created ? new Date(metadata.created).getTime() : Date.now();
  return `${name}_${created}`;}
/**
 * File extension and MIME type constants
 */
export export 
/**
 * Version compatibility checker
 */
export function checkPSGCompatibility(psgFile: PSGFile, currentVersion: string = '1.0.0'): {
  compatible: boolean;
  warnings: string;
  requiresUpgrade: boolean;
  const warnings: string[] = [];
  let compatible = true;
  let requiresUpgrade = false;
  const fileFormatVersion = psgFile.metadata.fileFormatVersion;
  const minCompatible = psgFile.exportMetadata.compatibility?.minVersion;
  const maxCompatible = psgFile.exportMetadata.compatibility?.maxVersion;
  // Check minimum version compatibility
  if (minCompatible && compareVersions(currentVersion, minCompatible) < 0) {
    compatible = false;
    warnings.push(`This file requires minimum version ${minCompatible}, but you have ${currentVersion}`);}
    requiresUpgrade = true;
  // Check maximum version compatibility
  if (maxCompatible && compareVersions(currentVersion, maxCompatible) > 0) {
    warnings.push(`This file was created for version ${maxCompatible} or earlier. Some features may not work correctly.`);}
  // Check for outdated file format
  if (compareVersions(fileFormatVersion, currentVersion) < 0) {
    warnings.push(`This file uses an older format (${fileFormatVersion}). Consider upgrading it to the latest format.`);}
  return {
    compatible,
    warnings,
    requiresUpgrade
  };
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
  return 0;
/**
 * Security validation to prevent dangerous content
 */
function checkForSecurityViolations(data: unknown): string {
  const violations: string[] = [];
  const checkObject = (obj: unknown, path: string = ''): void => {
    if (!obj || typeof obj !== 'object') return (
    for (const key in obj) {
      const currentPath = path ? `${path}.${key}` : key;}
      // Check for dangerous property names
      const dangerousProps = ['__proto__', 'constructor', 'prototype', 'eval', 'function'];
      if (dangerousProps.includes(key.toLowerCase())) {
        violations.push(`Dangerous property detected: ${currentPath}`);}
      // Check for function strings or suspicious content
      const value = obj[key];
      if (typeof value === 'string') {
        const suspiciousPatterns = [;
          /javascript:/i,
          /data:text\/html/i,
          /eval\s*\(/i)
          /function\s*\(/i)
          /<script/i,
          /onload\s*=/i
        ];
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            violations.push(`Suspicious content in ${currentPath}: ${pattern.source}`);}
      // Recursively check nested objects
      if (typeof value === 'object' && value !== null) {
        checkObject(value, currentPath);
  };
  checkObject(data);
  return violations;
/**
 * Validates internal data consistency
 */
function validateDataConsistency(data: unknown): string {
  const errors: string[] = [];
  try {
    // Check if nodes reference valid IDs
    if (data.graph?.nodes && data.graph?.edges) {
      const nodeIds = new Set(data.graph.nodes.map((node: unknown) => (node as any).id).filter(Boolean));
      // Validate edges reference existing nodes
      for (const edge of data.graph.edges) {
        if (edge.source && !nodeIds.has(edge.source)) {
          errors.push(`Edge references non-existent source node: ${edge.source}`);}
        if (edge.target && !nodeIds.has(edge.target)) {
          errors.push(`Edge references non-existent target node: ${edge.target}`);}
      // Check for duplicate node IDs
      const nodeIdArray = data.graph.nodes.map((node: unknown) => (node as any).id).filter(Boolean);
      const duplicates = nodeIdArray.filter((id: string, index: number) => nodeIdArray.indexOf(id) !== index);
      if (duplicates.length > 0) {
        errors.push(`Duplicate node IDs found: ${[...new Set(duplicates)].join(', ')}`);}
    // Validate metadata structure
    if (data.metadata) {
      if (data.metadata.created && data.metadata.modified) {
        const created = new Date(data.metadata.created).getTime();
        const modified = new Date(data.metadata.modified).getTime();
        if (created > modified) {
          errors.push('Created date is later than modified date');
  } catch (error) {
    errors.push(`Error during consistency validation: ${error instanceof Error ? error.message : String(error)}`);}
  return errors;
/**
 * Validates data integrity and returns warnings for potential issues
 */
function validateDataIntegrity(psgFile: PSGFile): string {
  const warnings: string[] = [];
  try {
  // Check graph complexity
  const nodeCount = psgFile.graph.nodes.length;
  const edgeCount = psgFile.graph.edges.length;
  if (nodeCount === 0) {
  warnings.push('Project contains no nodes');
} else if (nodeCount > 1000) {
      warnings.push(`Large project with ${nodeCount} nodes may impact performance`);}
    if (edgeCount > nodeCount * 3) {
      warnings.push('Unusually high edge-to-node ratio detected');
    // Check for isolated nodes (no connections)
    const connectedNodes = new Set();
    psgFile.graph.edges.forEach(edge => {)
  connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    const isolatedNodes = psgFile.graph.nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0 && nodeCount > 1) {
      warnings.push(`${isolatedNodes.length} isolated nodes detected (no connections)`);}
    // Check metadata completeness
    if (!psgFile.metadata.description && nodeCount > 5) {
      warnings.push('Consider adding a project description');
    // Check viewport settings
    if (psgFile.graph.viewport) {
      const { x, y, zoom } = psgFile.graph.viewport;
      if (Math.abs(x) > 10000 || Math.abs(y) > 10000) {
        warnings.push('Viewport position is very far from origin');
      if (zoom < 0.1 || zoom > 10) {
        warnings.push('Unusual viewport zoom level');
  } catch (error) {
    warnings.push(`Error during integrity validation: ${error instanceof Error ? error.message : String(error)}`);}
  return warnings;
/**
 * Enhanced serialization with validation and error handling
 */
export function serializePSGFile(psgFile: PSGFile, options: {)
  pretty?: boolean;
  validate?: boolean;
} = {}): {
  success: true;
  data: string;
  warnings?: string;
} | {
  success: false;
  error: PSGError;
  const { pretty = false, validate = true } = options;
  try {
  // Pre-serialization validation
  if (validate) {
  // If validation passes, continue
  // Update timestamps
  const updatedFile = {
  ...psgFile,
  exportMetadata: {
  ...psgFile.exportMetadata,
  exportDate: new Date().toISOString(),
};
    const jsonString = JSON.stringify(updatedFile, null, pretty ? 2 : 0);
    // Check serialized size
    const sizeInMB = jsonString.length / (1024 * 1024);
    const warnings: string[] = [];
    if (sizeInMB > 5) {
      warnings.push(`Large file size (${sizeInMB.toFixed(1)}MB) may affect loading performance`);}
    return {
  success: true,
  data: jsonString,
  warnings: warnings.length > 0 ? warnings : undefined,
};
  } catch (error) {
  if (error instanceof z.ZodError) {
  return {
  success: false,
  error: {
  type: PSGErrorType.INVALID_SCHEMA,
  message: 'Data validation failed during serialization',
  details: error.errors,
  suggestions: ['Check data integrity before saving', 'Review recent changes to the project'],
};
    return {
  success: false,
  error: {
  type: PSGErrorType.CORRUPTED_DATA,
  message: 'Failed to serialize project data',
  details: error instanceof Error ? error.message : String(error),
  suggestions: ['Try saving with a different name', 'Check for circular references in data'],
};