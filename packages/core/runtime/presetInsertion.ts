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
  // Optional: if provided, pack inserted nodes within these bounds (relative to position)
  containerSize?: { width: number; height: number };
  containerPadding?: number;
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

  // Track concat input usage so we can assign inputs deterministically
  const concatInputUsage = new Map<string, Set<string>>();
  edges.forEach(e => {
    const tType = nodeTypeMap.get(e.target);
    if (tType === 'concat') {
      const used = concatInputUsage.get(e.target) || new Set<string>();
      if (e.targetHandle === 'input1' || e.targetHandle === 'input2') {
        used.add(e.targetHandle);
      }
      concatInputUsage.set(e.target, used);
    }
  });

  // Enable hasBranch for connected options and compute weightedChoice main output policy
  const weightedChoiceHasBranch = new Map<string, boolean>();
  nodes.forEach(node => {
    if (node.type === 'WeightedChoice' || node.type === 'weightedChoice') {
      const connections = branchConnections.get(node.id);
      if (connections && node.data.options) {
        node.data.options.forEach((option: any, index: number) => {
          option.hasBranch = connections.has(index);
        });
      }
      const opts = (node as any)?.data?.options;
      const has = Array.isArray(opts) && opts.some((o: any) => o?.hasBranch === true);
      weightedChoiceHasBranch.set(node.id, !!has);
    }
  });

  return edges.map(edge => {
    const sourceType = nodeTypeMap.get(edge.source);
    const targetType = nodeTypeMap.get(edge.target);

    // Map source handle based on source node type
    let sourceHandle = edge.sourceHandle;
    if (sourceType === 'weightedChoice') {
      // Preserve explicit branch-N handles
      const isBranch = typeof sourceHandle === 'string' && /^branch-\d+$/.test(sourceHandle);
      if (!isBranch) {
        const has = weightedChoiceHasBranch.get(edge.source) === true;
        if (!sourceHandle || sourceHandle === 'output' || sourceHandle === 'main') {
          sourceHandle = has ? 'main-output' : 'source';
        }
        // If sourceHandle is 'main-output' or 'source', leave as-is
      }
    }

    // Map target handle if needed
    let targetHandle = edge.targetHandle;
    // Concat nodes have two named inputs: input1 and input2. Preserve if provided;
    // otherwise assign the next available input.
    if (targetType === 'concat') {
      const used = concatInputUsage.get(edge.target) || new Set<string>();
      if (targetHandle !== 'input1' && targetHandle !== 'input2') {
        if (!used.has('input1')) {
          targetHandle = 'input1';
          used.add('input1');
        } else if (!used.has('input2')) {
          targetHandle = 'input2';
          used.add('input2');
        } else {
          // More than two incoming edges: default to input2 (will visually stack)
          targetHandle = 'input2';
        }
        concatInputUsage.set(edge.target, used);
      }
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

    // Don't create group nodes for fragments - they already have enhancedBoundingBox from psg.ts
    // This was causing the duplicate purple container issue
    let regions: any[] = [];

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
      gridSize,
      options
    );

    // Parent inserted content nodes to EnhancedBoundingBox if present
    const boxes = positionedNodes.filter(n => n.type === 'enhancedBoundingBox');
    const getBoxSize = (b: any) => ({
      width: (b.size && b.size.width) || (b.data && b.data.width) || (b.style && b.style.width) || 400,
      height: (b.size && b.size.height) || (b.data && b.data.height) || (b.style && b.style.height) || 300
    });
    const PADDING_X = 40;
    const HEADER_Y = 80;
    const positionedWithParent = boxes.length
      ? positionedNodes.map(n => {
          if (n.type === 'enhancedBoundingBox' || (n as any).parentNode) {
            return n;
          }
          // Single box: parent all; multiple: parent if inside bounds
          const targetBox = boxes.length === 1
            ? boxes[0]
            : boxes.find(b => {
                const { width, height } = getBoxSize(b);
                const x0 = (b as any).position?.x ?? 0;
                const y0 = (b as any).position?.y ?? 0;
                const x1 = x0 + width;
                const y1 = y0 + height;
                const nx = (n as any).position?.x ?? 0;
                const ny = (n as any).position?.y ?? 0;
                return nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1;
              });
          if (!targetBox) {
            return n;
          }
          const bx = (targetBox as any).position?.x ?? 0;
          const by = (targetBox as any).position?.y ?? 0;
          const nx = (n as any).position?.x ?? 0;
          const ny = (n as any).position?.y ?? 0;
          return {
            ...n,
            parentNode: (targetBox as any).id,
            extent: 'parent',
            position: {
              x: nx - bx - PADDING_X,
              y: ny - by - HEADER_Y
            }
          } as any;
        })
      : positionedNodes;

    // Create node type map for edge handle mapping
    const nodeTypeMap = new Map<string, string>();
    positionedWithParent.forEach(node => {
      nodeTypeMap.set(node.id, node.type);
    });

    // Map edge handles based on node types and enable branch outputs
    const mappedEdges = mapEdgeHandles(edges, nodeTypeMap, positionedWithParent);

    // Mark nodes as selected if requested
    if (selectAfterInsert) {
      positionedNodes.forEach(node => {
        (node as any).selected = true;
      });
      // Also select regions
      regions.forEach(region => {
        (region as any).selected = true;
      });
    }

    // Combine positioned nodes with region group nodes
    const allNodes = [...regions, ...positionedWithParent];

    return {
      nodes: allNodes,
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
    const x = (node as any).position?.x ?? 0;
    const y = (node as any).position?.y ?? 0;
    const width = (node as any).size?.width || 150;
    const height = (node as any).size?.height || 50;

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
    weightedChoice: 'weightedChoice',
    Concat: 'concat',
    concat: 'concat',
    Output: 'output',
    output: 'output',
    TextBlock: 'textBlock',
    textBlock: 'textBlock',
    Variable: 'variable',
    variable: 'variable',
    SetVariable: 'setVariable',
    GetVariable: 'getVariable',
    Include: 'include',
    boundingBox: 'boundingBox'
  };

  return typeMap[type] || type;
}

/**
 * Convert PSGLib node data to ReactFlow node data
 */
function convertNodeData(type: string, data: any): any {
  const nodeType = mapNodeType(type);

  switch (nodeType) {
    case 'weightedChoice': {
      if ((data as any).choices && Array.isArray((data as any).choices)) {
        return {
          ...data,
          nodeType: 'weightedChoice',
          options: (data as any).choices.map((choice: any, idx: number) => ({
            id: `option-${idx + 1}`,
            text: choice.text || '',
            weight: choice.weight || 1,
            hasBranch: false
          })),
          value: JSON.stringify((data as any).choices, null, 2)
        };
      }
      break;
    }
    case 'concat':
      return { ...data, nodeType: 'concat', value: (data as any).separator || ' ' };
    case 'output':
      return {
        ...data,
        nodeType: 'output',
        value: (data as any).template || (data as any).label || 'output',
        label: (data as any).label || 'output'
      };
    case 'textBlock':
      return {
        ...data,
        nodeType: 'textBlock',
        value: (data as any).text || (data as any).value || 'New text block',
        text: (data as any).text || (data as any).value || 'New text block'
      };
    case 'variable':
    case 'setVariable':
    case 'getVariable':
      return {
        ...data,
        nodeType,
        value: (data as any).variableName || 'myVariable',
        variableName: (data as any).variableName || 'myVariable',
        mode: nodeType === 'setVariable' ? 'set' : nodeType === 'getVariable' ? 'get' : 'both'
      };
  }

  return { ...data, nodeType };
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
  gridSize: number,
  options: {
    containerPadding?: number;
    containerSize?: { width: number; height: number };
  } = {}
): PSGLibNode[] {
  // Check if nodes are stacked (all at same position)
  const firstPos = nodes[0]?.position;
  const areStacked =
    nodes.length > 1 &&
    nodes.every(
      node => node.position.x === firstPos.x && node.position.y === firstPos.y
    );

  // If nodes are stacked or bounds indicate no layout, don't preserve positions
  const shouldPreserve =
    preservePositions &&
    !areStacked &&
    (bounds.maxX - bounds.minX > 0 || bounds.maxY - bounds.minY > 0);

  if (shouldPreserve) {
    // Nodes have a good layout, just offset them to the drop position
    const centerX = bounds.minX + (bounds.maxX - bounds.minX) / 2;
    const centerY = bounds.minY + (bounds.maxY - bounds.minY) / 2;
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;

    return nodes.map(node => {
      const hasParent = !!(node as any).parentNode;
      // IMPORTANT: child nodes already use relative positions to their parent.
      // Do NOT apply global offset to them, only to top-level nodes.
      let x = hasParent ? node.position.x : node.position.x + offsetX;
      let y = hasParent ? node.position.y : node.position.y + offsetY;

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
    return [
      {
        ...nodes[0],
        type: mapNodeType(nodes[0].type),
        position: snapToGrid
          ? {
              x: Math.round(position.x / gridSize) * gridSize,
              y: Math.round(position.y / gridSize) * gridSize
            }
          : position,
        data: convertNodeData(nodes[0].type, nodes[0].data)
      }
    ];
  }

  // For multiple stacked nodes, grid-pack within optional container bounds
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const rows = Math.ceil(nodes.length / cols);
  const padding = options.containerPadding ?? 24;
  const spacingDefault = 220;
  const hasContainer = !!options.containerSize;
  const innerWidth = hasContainer
    ? Math.max(0, options.containerSize!.width - padding * 2)
    : spacingDefault * (cols - 1);
  const innerHeight = hasContainer
    ? Math.max(0, options.containerSize!.height - padding * 2)
    : spacingDefault * (rows - 1);
  const xStep = cols > 1 ? innerWidth / (cols - 1) : 0;
  const yStep = rows > 1 ? innerHeight / (rows - 1) : 0;

  return nodes.map((node, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;

    // Anchor center at provided position
    let baseX =
      position.x -
      (hasContainer
        ? options.containerSize!.width / 2 - padding
        : innerWidth / 2);
    let baseY =
      position.y -
      (hasContainer
        ? options.containerSize!.height / 2 - padding
        : innerHeight / 2);

    let x = baseX + c * (hasContainer ? xStep : spacingDefault);
    let y = baseY + r * (hasContainer ? yStep : spacingDefault);

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
 * Insert preset via drag and drop
 */
export async function insertPresetFromDrop(
  presetContent: string,
  dropPosition: { x: number; y: number },
  viewportTransform?: { x: number; y: number; zoom: number }
): Promise<InsertionResult> {
  const graphPosition = viewportTransform
    ? {
        x: (dropPosition.x - (viewportTransform as any).x) / (viewportTransform as any).zoom,
        y: (dropPosition.y - (viewportTransform as any).y) / (viewportTransform as any).zoom
      }
    : dropPosition;

  let preservePositions = false;
  try {
    const data = JSON.parse(presetContent);
    if ((data as any).graph?.nodes?.some((n: any) => n.type === 'enhancedBoundingBox')) {
      preservePositions = true;
    }
  } catch {}

  return insertPreset(presetContent, {
    position: graphPosition,
    preservePositions,
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
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load preset: ${response.statusText}`);
  }
  const content = await response.text();
  return insertPreset(content, options);
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
    let data: any;
    try {
      data = JSON.parse(presetContent);
    } catch (e) {
      return { valid: false, error: 'Invalid JSON format' };
    }

    let psglib: PSGLibFile;
    if (data.fileType === 'psglib') {
      psglib = parsePSGLib(presetContent);
    } else if (data.version && data.nodes && !data.fileType) {
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
      return { valid: false, error: 'Unrecognized preset format' };
    }

    if (psglib.graph.nodes.length === 0) {
      return { valid: false, error: 'Preset contains no nodes' };
    }

    const nodeIds = new Set(psglib.graph.nodes.map(n => n.id));
    for (const edge of psglib.graph.edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        return { valid: false, error: 'Preset contains invalid edge references' };
      }
    }

    return {
      valid: true,
      nodeCount: psglib.graph.nodes.length,
      edgeCount: psglib.graph.edges.length
    };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Invalid preset file' };
  }
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
