/**
 * .psg (PromptSpaghetti Graph) File Format Schema V2 - Epic 1
 * 
 * Enhanced schema for Epic 1 with inline editing support.
 * Provides comprehensive edit state tracking and node data structures.
 */

import { z } from 'zod';

// Current format version for Epic 1
export const PSG_FORMAT_VERSION_V2 = '2.0.0';

/**
 * Edit state for inline editing
 */
export const EditStateSchema = z.object({
  isEditing: z.boolean().default(false),
  editBuffer: z.any().optional(),
  lastEditTimestamp: z.string().datetime().optional(),
  validationErrors: z.array(z.string()).default([]),
  isDirty: z.boolean().default(false),
});

/**
 * Base node data with inline editing support
 */
export const NodeDataSchema = z.object({
  // Core value (type varies by node type)
  value: z.any(),
  
  // Inline editing state
  editState: EditStateSchema,
  
  // Validation state
  isValid: z.boolean().default(true),
  validationMessage: z.string().optional(),
  
  // Lock state (prevents editing)
  isLocked: z.boolean().default(false),
  lockReason: z.string().optional(),
  
  // Preview state
  previewMode: z.enum(['auto', 'manual', 'live']).default('auto'),
  lastPreviewUpdate: z.string().datetime().optional(),
});

/**
 * TextBlock node specific data
 */
export const TextBlockDataSchema = NodeDataSchema.extend({
  value: z.string(),
  // Text-specific properties
  maxLength: z.number().optional(),
  multiline: z.boolean().default(true),
  placeholder: z.string().optional(),
});

/**
 * WeightedChoice option
 */
export const WeightedOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  weight: z.number().min(0).max(100).default(50),
  color: z.string().optional(),
});

/**
 * WeightedChoice node specific data
 */
export const WeightedChoiceDataSchema = NodeDataSchema.extend({
  value: z.array(WeightedOptionSchema),
  // Weighted choice specific
  normalizeWeights: z.boolean().default(true),
  showPercentages: z.boolean().default(true),
  allowAddRemove: z.boolean().default(true),
  minOptions: z.number().default(2),
  maxOptions: z.number().optional(),
});

/**
 * Concat node specific data
 */
export const ConcatDataSchema = NodeDataSchema.extend({
  value: z.object({
    separator: z.string().default(''),
    trimInputs: z.boolean().default(true),
  }),
});

/**
 * Variable node specific data
 */
export const VariableDataSchema = NodeDataSchema.extend({
  value: z.object({
    name: z.string(),
    defaultValue: z.any().optional(),
    currentValue: z.any().optional(),
  }),
  // Variable specific
  variableType: z.enum(['string', 'number', 'boolean', 'any']).default('string'),
  scope: z.enum(['local', 'global']).default('local'),
});

/**
 * Node position in the graph
 */
export const NodePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/**
 * Node size
 */
export const NodeSizeSchema = z.object({
  width: z.number().optional(),
  height: z.number().optional(),
});

/**
 * Visual style for nodes
 */
export const NodeStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
  borderRadius: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  customClass: z.string().optional(),
});

/**
 * Complete node schema
 */
export const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['TextBlock', 'WeightedChoice', 'Concat', 'Variable', 'Output', 'Include']),
  position: NodePositionSchema,
  size: NodeSizeSchema.optional(),
  style: NodeStyleSchema.optional(),
  
  // Node-specific data (discriminated union based on type)
  data: z.union([
    TextBlockDataSchema,
    WeightedChoiceDataSchema,
    ConcatDataSchema,
    VariableDataSchema,
    NodeDataSchema, // Fallback for other node types
  ]),
  
  // Metadata
  label: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  
  // Execution metadata
  lastExecutionTime: z.number().optional(),
  executionCount: z.number().default(0),
  errorCount: z.number().default(0),
});

/**
 * Edge/Connection schema
 */
export const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  
  // Visual properties
  type: z.enum(['default', 'straight', 'step', 'smoothstep']).default('default'),
  animated: z.boolean().default(false),
  style: z.object({
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    strokeDasharray: z.string().optional(),
  }).optional(),
  
  // Metadata
  label: z.string().optional(),
  data: z.any().optional(),
});

/**
 * Graph viewport state
 */
export const ViewportSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  zoom: z.number().min(0.1).max(2).default(1),
});

/**
 * Execution settings
 */
export const ExecutionSettingsSchema = z.object({
  defaultSeed: z.number().optional(),
  timeout: z.number().default(5000), // ms
  maxDepth: z.number().default(100),
  enableCaching: z.boolean().default(true),
  parallelExecution: z.boolean().default(false),
});

/**
 * Project metadata enhanced for Epic 1
 */
export const ProjectMetadataV2Schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  createdAt: z.string().datetime(),
  lastModified: z.string().datetime(),
  lastModifiedBy: z.string().optional(),
  author: z.string().optional(),
  collaborators: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  thumbnail: z.string().optional(), // base64 or URL
  fileFormatVersion: z.string().default(PSG_FORMAT_VERSION_V2),
  
  // Epic 1 specific
  isTemplate: z.boolean().default(false),
  templateCategory: z.string().optional(),
  demoContent: z.boolean().default(false),
});

/**
 * Project settings enhanced for Epic 1
 */
export const ProjectSettingsV2Schema = z.object({
  // Editor settings
  autoSave: z.boolean().default(true),
  autoSaveInterval: z.number().default(30), // seconds
  undoStackSize: z.number().default(50),
  
  // Visual settings
  gridEnabled: z.boolean().default(true),
  gridSize: z.number().default(20),
  snapToGrid: z.boolean().default(false),
  showMinimap: z.boolean().default(true),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  
  // Inline editing settings
  inlineEditingEnabled: z.boolean().default(true),
  autoFocusOnCreate: z.boolean().default(true),
  showValidationInline: z.boolean().default(true),
  editOnDoubleClick: z.boolean().default(true),
  
  // Execution settings
  execution: ExecutionSettingsSchema,
  
  // Performance settings
  enableAnimations: z.boolean().default(true),
  renderOptimization: z.boolean().default(true),
  lazyLoadNodes: z.boolean().default(false),
});

/**
 * Graph state
 */
export const GraphStateSchema = z.object({
  selectedNodes: z.array(z.string()).default([]),
  selectedEdges: z.array(z.string()).default([]),
  copiedNodes: z.array(z.string()).default([]),
  viewport: ViewportSchema,
  
  // Inline editing state
  editingNodeId: z.string().optional(),
  focusedNodeId: z.string().optional(),
  
  // Execution state
  isExecuting: z.boolean().default(false),
  lastExecutionId: z.string().optional(),
  executionResults: z.record(z.any()).optional(),
});

/**
 * Complete graph structure
 */
export const GraphV2Schema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
  state: GraphStateSchema.optional(),
});

/**
 * Medieval demo specific data
 */
export const MedievalDemoSchema = z.object({
  presets: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    nodeData: z.record(z.any()),
  })).optional(),
  
  examples: z.array(z.object({
    id: z.string(),
    title: z.string(),
    prompt: z.string(),
    expectedOutput: z.array(z.string()),
  })).optional(),
});

/**
 * Main .psg file format schema V2
 */
export const PsgFileV2Schema = z.object({
  // Format identification
  fileType: z.literal('psg'),
  formatVersion: z.literal(PSG_FORMAT_VERSION_V2),
  
  // Core data
  metadata: ProjectMetadataV2Schema,
  settings: ProjectSettingsV2Schema,
  graph: GraphV2Schema,
  
  // Optional features
  medievalDemo: MedievalDemoSchema.optional(),
  
  // Extensibility
  plugins: z.record(z.any()).optional(),
  customNodeTypes: z.record(z.any()).optional(),
  
  // File integrity
  checksum: z.string().optional(),
  compressed: z.boolean().default(false),
  encryption: z.object({
    enabled: z.boolean(),
    algorithm: z.string(),
    keyId: z.string(),
  }).optional(),
});

// Type exports
export type PsgFileV2 = z.infer<typeof PsgFileV2Schema>;
export type ProjectMetadataV2 = z.infer<typeof ProjectMetadataV2Schema>;
export type ProjectSettingsV2 = z.infer<typeof ProjectSettingsV2Schema>;
export type GraphV2 = z.infer<typeof GraphV2Schema>;
export type Node = z.infer<typeof NodeSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type EditState = z.infer<typeof EditStateSchema>;
export type NodeData = z.infer<typeof NodeDataSchema>;
export type TextBlockData = z.infer<typeof TextBlockDataSchema>;
export type WeightedChoiceData = z.infer<typeof WeightedChoiceDataSchema>;
export type ConcatData = z.infer<typeof ConcatDataSchema>;
export type VariableData = z.infer<typeof VariableDataSchema>;

/**
 * Create default edit state
 */
export function createDefaultEditState(): EditState {
  return {
    isEditing: false,
    editBuffer: undefined,
    lastEditTimestamp: undefined,
    validationErrors: [],
    isDirty: false,
  };
}

/**
 * Create default node data
 */
export function createDefaultNodeData(value: any): NodeData {
  return {
    value,
    editState: createDefaultEditState(),
    isValid: true,
    validationMessage: undefined,
    isLocked: false,
    lockReason: undefined,
    previewMode: 'auto',
    lastPreviewUpdate: undefined,
  };
}

/**
 * Validate PSG file
 */
export function validatePsgFileV2(data: unknown): {
  success: boolean;
  data?: PsgFileV2;
  errors?: z.ZodError;
} {
  const result = PsgFileV2Schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Check version compatibility
 */
export function isVersionCompatibleV2(fileVersion: string): {
  compatible: boolean;
  canMigrate: boolean;
  message: string;
} {
  const [major, minor] = fileVersion.split('.').map(Number);
  const [currentMajor, currentMinor] = PSG_FORMAT_VERSION_V2.split('.').map(Number);
  
  // Exact match
  if (fileVersion === PSG_FORMAT_VERSION_V2) {
    return {
      compatible: true,
      canMigrate: false,
      message: 'File format is current',
    };
  }
  
  // V1 files can be migrated
  if (major === 1) {
    return {
      compatible: false,
      canMigrate: true,
      message: 'File is version 1.x and can be migrated to version 2.0',
    };
  }
  
  // Same major version, different minor
  if (major === currentMajor) {
    return {
      compatible: true,
      canMigrate: false,
      message: minor < currentMinor ? 'File will be updated to latest minor version' : 'File is from a newer minor version',
    };
  }
  
  // Future major version
  if (major > currentMajor) {
    return {
      compatible: false,
      canMigrate: false,
      message: 'File is from a newer major version and cannot be opened',
    };
  }
  
  // Unknown version
  return {
    compatible: false,
    canMigrate: false,
    message: 'Unknown file version',
  };
}