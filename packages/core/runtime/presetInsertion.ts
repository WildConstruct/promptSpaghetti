/**
 * Preset Insertion Logic
 * Handles importing PSGLib presets into the graph editor
 */

import {
  parsePSGLib,
  regenerateNodeIds,
  trackPresetUsage,
  type PSGLibFile,
  type PSGLibNode,
  type PSGLibEdge
} from '../fileFormats/psglib';
import { parsePSG, convertPSGToPSGLib } from '../fileFormats/psg';

export interface InsertionOptions {
  position?: { x: number; y: number };
  preservePositions?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  selectAfterInsert?: boolean;
}

export interface InsertionResult {
  nodes: any[]; // Replace with proper Node type
  edges: any[]; // Replace with proper Edge type
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

/**
 * Map edge handles based on node types and enable branch outputs
 */
function mapEdgeHandles(
  edges: PSGLibEdge[],
  nodeTypeMap: Map<string, string>,
  nodes: PSGLibNode[]
): PSGLibEdge[] {
  // Track which weighted choice nodes have branch connections
  const branchConnections = new Map<string, Set<number>>();

  edges.forEach(edge => {
    const sourceType = nodeTypeMap.get(edge.source);
    if (sourceType === 'weightedChoice' && edge.sourceHandle) {
      // Check if this is a branch output (e.g., branch-0, branch-1, etc.)
      const branchMatch = edge.sourceHandle.match(/branch-(\d+)/);
      if (branchMatch) {
        const branchIndex = parseInt(branchMatch[1]);
        if (!branchConnections.has(edge.source)) {
          branchConnections.set(edge.source, new Set());
        }
        branchConnections.get(edge.source)!.add(branchIndex);
      }
    }
  });

  // Enable hasBranch for connected options
  nodes.forEach(node => {
    if (node.type === 'WeightedChoice' || node.type === 'weightedChoice') {
      const connections = branchConnections.get(node.id);
      if (connections && node.data.options) {
        node.data.options.forEach((option: any, index: number) => {
          option.hasBranch = connections.has(index);
        });
      }
    }
  });

  return edges.map(edge => {
    const sourceType = nodeTypeMap.get(edge.source);
    const targetType = nodeTypeMap.get(edge.target);

    // Map source handle based on source node type
    let sourceHandle = edge.sourceHandle;
    if (sourceType === 'weightedChoice' && sourceHandle === 'output') {
      sourceHandle = 'main'; // WeightedChoice uses 'main' not 'output'
    }

    // Map target handle if needed
    let targetHandle = edge.targetHandle;
    // Concat nodes use 'target' not 'input0', 'input1', etc.
    if (
      targetType === 'concat' &&
      targetHandle &&
      targetHandle.startsWith('input')
    ) {
      targetHandle = 'target'; // Concat nodes only have a single 'target' handle
    }

    return {
      ...edge,
      sourceHandle,
      targetHandle
    };
  });
}

/**
 * Insert a preset from PSGLib or PSG file content
 */
export async function insertPreset(
  presetContent: string,
  options: InsertionOptions = {}
): Promise<InsertionResult> {
  const {
    position = { x: 100, y: 100 },
    preservePositions = false,
    snapToGrid = false,
    gridSize = 20,
    selectAfterInsert = true
  } = options;

  try {
    // Parse the preset - detect format and convert if needed
    let psglib: PSGLibFile;
    
    // Try to parse as JSON first to detect format
    const data = JSON.parse(presetContent);
    
    if (data.fileType === 'psglib') {
      // It's already a PSGLib file
      psglib = parsePSGLib(presetContent);
    } else if (data.version && data.nodes && !data.fileType) {
      // It's a PSG fragment file - convert it
      const psg = parsePSG(presetContent);
      psglib = convertPSGToPSGLib(psg);
    } else {
      throw new Error('Unrecognized preset format');
    }

    // Track usage for analytics
    trackPresetUsage(psglib, 'import');

    // Regenerate IDs to avoid conflicts
    const { nodes, edges } = regenerateNodeIds(
      psglib.graph.nodes,
      psglib.graph.edges
    );

    // Calculate bounds of the preset
    const bounds = calculateBounds(nodes);

    // Position nodes and get type map
    // Note: We'll let the auto-layout in useDragDropHandlers handle multi-node positioning
    const positionedNodes = positionNodes(
      nodes,
      bounds,
      position,
      preservePositions,
      snapToGrid,
      gridSize
    );

    // Create node type map for edge handle mapping
    const nodeTypeMap = new Map<string, string>();
    positionedNodes.forEach(node => {
      nodeTypeMap.set(node.id, node.type);
    });

    // Map edge handles based on node types and enable branch outputs
    const mappedEdges = mapEdgeHandles(edges, nodeTypeMap, positionedNodes);

    // Mark nodes as selected if requested
    if (selectAfterInsert) {
      positionedNodes.forEach(node => {
        (node as any).selected = true;
      });
    }

    return {
      nodes: positionedNodes,
      edges: mappedEdges,
      bounds: {
        minX: position.x,
        minY: position.y,
        maxX: position.x + (bounds.maxX - bounds.minX),
        maxY: position.y + (bounds.maxY - bounds.minY)
      }
    };
  } catch (error) {
    console.error('Failed to insert preset:', error);
    throw error;
  }
}

/**
 * Insert preset via drag and drop
 */
export async function insertPresetFromDrop(
  presetContent: string,
  dropPosition: { x: number; y: number },
  viewportTransform?: { x: number; y: number; zoom: number }
): Promise<InsertionResult> {
  // Convert screen coordinates to graph coordinates
  const graphPosition = viewportTransform
    ? {
        x: (dropPosition.x - viewportTransform.x) / viewportTransform.zoom,
        y: (dropPosition.y - viewportTransform.y) / viewportTransform.zoom
      }
    : dropPosition;

  return insertPreset(presetContent, {
    position: graphPosition,
    snapToGrid: true,
    selectAfterInsert: true
  });
}

/**
 * Load preset from file path (for Asset Browser integration)
 */
export async function loadPresetFromPath(
  path: string,
  options: InsertionOptions = {}
): Promise<InsertionResult> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load preset: ${response.statusText}`);
    }

    const content = await response.text();
    return insertPreset(content, options);
  } catch (error) {
    console.error('Failed to load preset from path:', error);
    throw error;
  }
}

/**
 * Validate preset before insertion
 */
export function validatePreset(presetContent: string): {
  valid: boolean;
  error?: string;
  nodeCount?: number;
  edgeCount?: number;
} {
  try {
    // Try to parse as JSON first to detect format
    let data: any;
    try {
      data = JSON.parse(presetContent);
    } catch (e) {
      return {
        valid: false,
        error: 'Invalid JSON format'
      };
    }

    let psglib: PSGLibFile;
    
    // Detect format based on structure
    if (data.fileType === 'psglib') {
      // It's already a PSGLib file
      psglib = parsePSGLib(presetContent);
    } else if (data.version && data.nodes && !data.fileType) {
      // It's a PSG fragment file - convert it
      try {
        const psg = parsePSG(presetContent);
        psglib = convertPSGToPSGLib(psg);
      } catch (psgError) {
        return {
          valid: false,
          error: `Invalid PSG fragment: ${psgError instanceof Error ? psgError.message : 'Unknown error'}`
        };
      }
    } else {
      return {
        valid: false,
        error: 'Unrecognized preset format'
      };
    }

    // Check for empty preset
    if (psglib.graph.nodes.length === 0) {
      return {
        valid: false,
        error: 'Preset contains no nodes'
      };
    }

    // Check for orphaned edges
    const nodeIds = new Set(psglib.graph.nodes.map(n => n.id));
    for (const edge of psglib.graph.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        return {
          valid: false,
          error: 'Preset contains invalid edge references'
        };
      }
    }

    return {
      valid: true,
      nodeCount: psglib.graph.nodes.length,
      edgeCount: psglib.graph.edges.length
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid preset file'
    };
  }
}

/**
 * Calculate bounds of nodes
 */
function calculateBounds(nodes: PSGLibNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const x = node.position.x;
    const y = node.position.y;
    const width = node.size?.width || 150;
    const height = node.size?.height || 50;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Map PSGLib node types to ReactFlow node types
 */
function mapNodeType(type: string): string {
  const typeMap: Record<string, string> = {
    WeightedChoice: 'weightedChoice',
    weightedChoice: 'weightedChoice', // Already mapped
    Concat: 'concat',
    concat: 'concat', // Already mapped
    Output: 'output',
    output: 'output', // Already mapped
    TextBlock: 'textBlock',
    textBlock: 'textBlock', // Already mapped
    Variable: 'variable',
    variable: 'variable', // Already mapped
    SetVariable: 'setVariable',
    GetVariable: 'getVariable',
    Include: 'include',
    boundingBox: 'boundingBox' // Don't lowercase this
  };

  // Return mapped type or keep as-is if already in correct format
  return typeMap[type] || type;
}

/**
 * Convert PSGLib node data to ReactFlow node data
 */
function convertNodeData(type: string, data: any): any {
  const nodeType = mapNodeType(type);

  // Convert data based on node type
  switch (nodeType) {
    case 'weightedChoice':
      // Convert choices array to options format expected by WeightedChoiceNode
      if (data.choices && Array.isArray(data.choices)) {
        return {
          ...data,
          nodeType: 'weightedChoice',
          options: data.choices.map((choice: any, idx: number) => ({
            id: `option-${idx + 1}`,
            text: choice.text || '',
            weight: choice.weight || 1,
            hasBranch: false // Default to false - only enable when actually connected
          })),
          value: JSON.stringify(data.choices, null, 2)
        };
      }
      break;

    case 'concat':
      return {
        ...data,
        nodeType: 'concat',
        value: data.separator || ' '
      };

    case 'output':
      return {
        ...data,
        nodeType: 'output',
        value: data.template || data.label || 'output',
        label: data.label || 'output'
      };

    case 'textBlock':
      return {
        ...data,
        nodeType: 'textBlock',
        value: data.text || data.value || 'New text block',
        text: data.text || data.value || 'New text block'
      };

    case 'variable':
    case 'setVariable':
    case 'getVariable':
      return {
        ...data,
        nodeType: nodeType,
        value: data.variableName || 'myVariable',
        variableName: data.variableName || 'myVariable',
        mode:
          nodeType === 'setVariable'
            ? 'set'
            : nodeType === 'getVariable'
              ? 'get'
              : 'both'
      };
  }

  // Default: just add nodeType field
  return {
    ...data,
    nodeType
  };
}

/**
 * Position nodes relative to insertion point
 */
function positionNodes(
  nodes: PSGLibNode[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  position: { x: number; y: number },
  preservePositions: boolean,
  snapToGrid: boolean,
  gridSize: number
): PSGLibNode[] {
  // Check if nodes are stacked (all at same position)
  const firstPos = nodes[0]?.position;
  const areStacked = nodes.length > 1 && nodes.every(node => 
    node.position.x === firstPos.x && node.position.y === firstPos.y
  );

  // If nodes are stacked or bounds indicate no layout, don't preserve positions
  const shouldPreserve = preservePositions && !areStacked && 
    (bounds.maxX - bounds.minX > 0 || bounds.maxY - bounds.minY > 0);

  if (shouldPreserve) {
    // Nodes have a good layout, just offset them to the drop position
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;

    return nodes.map(node => {
      let x = node.position.x + offsetX;
      let y = node.position.y + offsetY;

      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }

      return {
        ...node,
        type: mapNodeType(node.type),
        position: { x, y },
        data: convertNodeData(node.type, node.data)
      };
    });
  }

  // Nodes are stacked or need repositioning
  // For single node, just place at drop position
  if (nodes.length === 1) {
    return [{
      ...nodes[0],
      type: mapNodeType(nodes[0].type),
      position: snapToGrid ? {
        x: Math.round(position.x / gridSize) * gridSize,
        y: Math.round(position.y / gridSize) * gridSize
      } : position,
      data: convertNodeData(nodes[0].type, nodes[0].data)
    }];
  }

  // For multiple stacked nodes, give them initial positions for the layout algorithm
  // Place them in a temporary grid so the layout algorithm has something to work with
  const tempSpacing = 300;  // Increased spacing for better initial layout
  const cols = Math.ceil(Math.sqrt(nodes.length));
  
  return nodes.map((node, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    let x = position.x + (col * tempSpacing) - ((cols - 1) * tempSpacing / 2);
    let y = position.y + (row * tempSpacing) - ((Math.ceil(nodes.length / cols) - 1) * tempSpacing / 2);

    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    return {
      ...node,
      type: mapNodeType(node.type),
      position: { x, y },
      data: convertNodeData(node.type, node.data)
    };
  });
}

/**
 * Preview ghost nodes during drag
 */
export function createGhostNodes(
  nodes: PSGLibNode[],
  position: { x: number; y: number }
): PSGLibNode[] {
  const bounds = calculateBounds(nodes);
  const positioned = positionNodes(nodes, bounds, position, false, true, 20);

  // Add ghost styling and ensure unique IDs for preview
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = Math.floor(Math.random() * 100000); // Add extra randomness

  return positioned.map((node, index) => ({
    ...node,
    id: `ghost-${timestamp}-${random}-${counter}-${index}`, // Unique ghost ID
    style: {
      ...node.style,
      opacity: 0.5,
      pointerEvents: 'none'
    }
  }));
}

/**
 * Check for duplicate preset IDs in the current graph
 */
export function checkDuplicatePresetId(
  presetId: string,
  existingPresets: Array<{ id: string; name: string }>
): {
  isDuplicate: boolean;
  conflictingPreset?: { id: string; name: string };
} {
  const conflict = existingPresets.find(p => p.id === presetId);

  return {
    isDuplicate: !!conflict,
    conflictingPreset: conflict
  };
}

/**
 * Generate animation for successful import
 */
export function createImportAnimation(
  nodeElement: HTMLElement,
  duration = 500
): void {
  // Flash animation
  nodeElement.animate(
    [
      { boxShadow: '0 0 0 0 rgba(46, 164, 79, 0.8)' },
      { boxShadow: '0 0 20px 10px rgba(46, 164, 79, 0.4)' },
      { boxShadow: '0 0 0 0 rgba(46, 164, 79, 0)' }
    ],
    {
      duration,
      easing: 'ease-out'
    }
  );
}
