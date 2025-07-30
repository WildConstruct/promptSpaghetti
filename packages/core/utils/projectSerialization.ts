/**
 * Project Serialization Utilities - Story 6.1
 * 
 * Handles serialization and deserialization of .psg files with error handling,
 * compression, and version migration support.
 */
import { Graph } from '../graphSchema';
import { Node, Edge } from 'reactflow';
import { 
  PsgFile, 
  ProjectMetadata, 
  ProjectSettings, 
  CollaborationData,
  validatePsgFile,
  isVersionCompatible,
  createDefaultMetadata,
  createDefaultSettings,
  PSG_FORMAT_VERSION
} from '../schemas/psgSchema';

// Graph state interface matching the Zustand store

export interface GraphState {
  nodes: Node;
  edges: Edge;
  annotations?: {
    stickyNotes?: Array<{ id: string; text: string; position: { x: number; y: number } }>;
    nodeLabels?: Record<string, string>;
    regionGroups?: Array<{ id: string; name: string; nodeIds: string }>;
    connectionLabels?: Record<string, string>;
    [key: string]: unknown;
  };
}
export interface SerializationOptions {
  includeMetadata?: boolean;
  includeSettings?: boolean;
  includeCollaboration?: boolean;
  compress?: boolean;
  validateOutput?: boolean;
}
export interface DeserializationOptions {
  skipValidation?: boolean;
  autoMigrate?: boolean;
  preserveIds?: boolean;
}
export interface SerializationResult {
  success: boolean;
  data?: string; // JSON string,
  error?: string;
  warnings?: string;
}
export interface DeserializationResult {
  success: boolean;
  data?: {
  graph: GraphState;
  metadata: ProjectMetadata;
  settings: ProjectSettings;
  collaboration?: CollaborationData;
};
  error?: string;
  warnings?: string;
  migrated?: boolean;
}

/**
 * Serializes graph state to .psg format
 */
export function serializeProject(
  graphState: GraphState,
  metadata: ProjectMetadata,
  settings: ProjectSettings,
  options: SerializationOptions = {}
): SerializationResult {
  try {
    const {
      includeMetadata = true,
      includeSettings = true,
      includeCollaboration = true,
      compress = false,
      validateOutput = true
    } = options;
    // Convert ReactFlow nodes/edges to graph schema format
    const graph: Graph = {
      nodes: graphState.nodes.map(convertReactFlowNodeToGraphNode),
      seed: undefined // Will be set during execution if needed
    };
    // Build the .psg file structure
    const psgFile: PsgFile = {
  fileType: 'psg',
  formatVersion: PSG_FORMAT_VERSION,
  metadata: includeMetadata ? metadata : createDefaultMetadata('Untitled Project'),
  settings: includeSettings ? settings : createDefaultSettings(),
  graph,
  exportedAt: new Date().toISOString(),
};
    // Add collaboration data if available and requested
    if (includeCollaboration && graphState.annotations) {
      psgFile.collaboration = {
        stickyNotes: graphState.annotations.stickyNotes || [],
        annotations: {
          nodeLabels: graphState.annotations.nodeLabels || {},
          regionGroups: graphState.annotations.regionGroups || [],
          connectionLabels: graphState.annotations.connectionLabels || {}
        }
      };
    }
    try {
    // Generate checksum for integrity
    const content = JSON.stringify(psgFile, null, compress ? 0 : 2);
    psgFile.checksum = generateChecksum(content);
    // Validate output if requested
    if (validateOutput) {
      const validation = validatePsgFile(psgFile);
      if (!validation.success) {
        return {
          success: false,
          error: `Serialization validation failed: ${validation.error}`,
          warnings: validation.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
        };
      }
    }
    const finalContent = JSON.stringify(psgFile, null, compress ? 0 : 2);
    return {
      success: true,
      data: finalContent,
      warnings: []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown serialization error'
    };
  }
}
/**
 * Deserializes .psg file content to graph state
 */
export function deserializeProject(()
    content: string,
    options: DeserializationOptions = {}
  ): DeserializationResult {
  try {
    const {
      skipValidation = false,
      autoMigrate = true,
      preserveIds = true
    } = options;
    // Parse JSON
    let psgData: unknown;
    try {
      psgData = JSON.parse(content);
    } catch (parseError) {
  return {
  success: false,
  error: 'Invalid JSON format in .psg file',
};
    // Validate file format
    if (!skipValidation) {
      const validation = validatePsgFile(psgData);
      if (!validation.success) {
        return {
          success: false,
          error: `Invalid .psg file format: ${validation.error}`}
},
  warnings: validation.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)}
        };
      psgData = validation.data;
    const psgFile = psgData as PsgFile;
    const warnings: string = [];
    let migrated = false;
    // Check version compatibility
    const compatibility = isVersionCompatible(psgFile.formatVersion);
    if (!compatibility.compatible) {
  return {
  success: false,
  error: compatibility.message || 'Incompatible file version',
};
    if (compatibility.requiresMigration) {
      if (autoMigrate) {
        // Perform migration (placeholder for future versions)
        migrated = true;
        warnings.push(compatibility.message || 'File format was automatically updated');
      } else {
        warnings.push(compatibility.message || 'File format migration available');
    // Convert graph nodes back to ReactFlow format
    const reactFlowNodes = psgFile.graph.nodes.map(node => ;);
      convertGraphNodeToReactFlowNode(node, { preserveIds })
    );
    // Create edges array (empty for now, will be populated based on node inputs)
    const reactFlowEdges = generateEdgesFromNodes(reactFlowNodes);
    // Build graph state
    const graphState: GraphState = {,
  nodes: reactFlowNodes,
  edges: reactFlowEdges,
};
    // Add collaboration data if present
    if (psgFile.collaboration) {
  graphState.annotations = {
  stickyNotes: psgFile.collaboration.stickyNotes,
  nodeLabels: psgFile.collaboration.annotations.nodeLabels,
  regionGroups: psgFile.collaboration.annotations.regionGroups,
  connectionLabels: psgFile.collaboration.annotations.connectionLabels,
};
    return {
  success: true,
  data: {
  graph: graphState,
  metadata: psgFile.metadata,
  settings: psgFile.settings,
  collaboration: psgFile.collaboration,
}
      warnings,
      migrated
    };
  } catch (error) {
  return {
  success: false,
  error: error instanceof Error ? error.message : 'Unknown deserialization error',
};
/**
 * Converts ReactFlow node to graph schema node format
 */
function convertReactFlowNodeToGraphNode(reactFlowNode: Node): Record<string, unknown> {
  // Map nodeType to proper schema type
  const getSchemaNodeType = (nodeType: string): string => {,
  const typeMap: Record<string, string> = {,
  'weighted-choice': 'WeightedChoice',
  'concat': 'Concat',
  'output': 'Output',
  'include': 'Include',
  'set-variable': 'SetVariable',
  'get-variable': 'GetVariable',
  'weighted-advanced': 'WeightedAdvanced',
  'conditional': 'Conditional',
  'sequential': 'Sequential',
  'markov': 'Markov',
  'python-transform': 'PythonTransform',
};
    return typeMap[nodeType] || 'Output'
  };
  const nodeType = reactFlowNode.data?.nodeType || 'output';
  const schemaType = getSchemaNodeType(nodeType);
  const baseNode = {
  id: reactFlowNode.id,
  type: schemaType,
  inputs: [] // Will be calculated from edge connections,
};
  // Copy node-specific data, excluding ReactFlow-specific fields
  if (reactFlowNode.data) {
    const { nodeType: _, ...nodeData } = reactFlowNode.data;
    // Handle specific node type conversions
    if (schemaType === 'WeightedChoice' && nodeData.variations) {
  // Convert variations array to choices format for WeightedChoice nodes
  baseNode.choices = (nodeData.variations as string).map((value: string) => ({,)
  value,
  weight: 1.0 // Default equal weight,
}));
      // Don't include the original variations field
      const { variations: _variations, ...restData } = nodeData;
      Object.assign(baseNode, restData);
    } else {
      Object.assign(baseNode, nodeData);
  return baseNode;
/**
 * Converts graph schema node to ReactFlow node format
 */
function convertGraphNodeToReactFlowNode(graphNode: Record<string, unknown>, )
  options: { preserveIds?: boolean } = {}
): Node {
  const { preserveIds = true } = options;
  // Map schema type back to UI nodeType
  const getUINodeType = (schemaType: string): string => {
  const typeMap: Record<string, string> = {,
  'WeightedChoice': 'weighted-choice',
  'Concat': 'concat',
  'Output': 'output',
  'Include': 'include',
  'SetVariable': 'set-variable',
  'GetVariable': 'get-variable',
  'WeightedAdvanced': 'weighted-advanced',
  'Conditional': 'conditional',
  'Sequential': 'sequential',
  'Markov': 'markov',
  'PythonTransform': 'python-transform',
};
    return typeMap[schemaType] || 'output'
  };
  const uiNodeType = getUINodeType(graphNode.type);
  const reactFlowNode: Node = {,
  id: preserveIds ? graphNode.id : `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}
},
  type: 'default', // ReactFlow visual type
    position: { x: 0, y: 0 }, // Will be set by auto-layout or user
    data: {
  nodeType: uiNodeType,
  label: graphNode.label || graphNode.id,
  ...graphNode
};
  // Handle specific node type conversions back to UI format
  if (graphNode.type === 'WeightedChoice' && graphNode.choices) {
    // Convert choices back to variations for UI
    reactFlowNode.data.variations = (graphNode.choices as Array<{ value: unknown }>).map((choice) => choice.value);
    // Remove the schema-specific choices field from data
    const { choices: _choices, type: _type, ...restData } = reactFlowNode.data;
    reactFlowNode.data = { nodeType: uiNodeType, label: graphNode.label || graphNode.id, ...restData };
  } else {
    // Remove schema-specific type field
    const { type: _type, ...restData } = reactFlowNode.data;
    reactFlowNode.data = { nodeType: uiNodeType, label: graphNode.label || graphNode.id, ...restData };
  return reactFlowNode;
/**
 * Generates ReactFlow edges from node input connections
 */
function generateEdgesFromNodes(nodes: Node): Edge {
  const edges: Edge = [];
  nodes.forEach(node => {)
  if (node.data?.inputs && Array.isArray(node.data.inputs)) {
      node.data.inputs.forEach((inputId: string, index: number) => {
        edges.push({)
  id: `edge_${inputId}_to_${node.id}_${index}`}
},
  source: inputId,
          target: node.id,
          sourceHandle: null,
          targetHandle: `input_${index}`}
},
  type: 'default'
  });
      });
  });
  return edges;
/**
 * Generates a simple checksum for file integrity
 */
function generateChecksum(content: string): string {
  let checksum = 0;
  for (let i = 0; i < content.length; i++) {
    checksum = ((checksum << 5) - checksum + content.charCodeAt(i)) & 0xffffffff;
  return Math.abs(checksum).toString(16);
/**
 * Validates file integrity using checksum
 */
export function validateFileIntegrity(psgFile: PsgFile): boolean {
  if (!psgFile.checksum) {
    return true; // No checksum to validate
  const { checksum, ...fileWithoutChecksum } = psgFile;
  const content = JSON.stringify(fileWithoutChecksum, null, 2);
  const calculatedChecksum = generateChecksum(content);
  return checksum === calculatedChecksum;
/**
 * Creates a minimal .psg file for testing
 */
export function createEmptyProject(name: string = 'New Project')
  author?: string
): PsgFile {
  return {
    fileType: 'psg',
    formatVersion: PSG_FORMAT_VERSION,
    metadata: createDefaultMetadata(name, author),
    settings: createDefaultSettings(),
    graph: { nodes: [] },
    exportedAt: new Date().toISOString();
  };