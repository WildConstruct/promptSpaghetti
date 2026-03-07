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
import {
  parseCanonicalPsg,
  parsePsgWithCompatibility,
  convertCanonicalPSGToPSGLib,
  convertCompatiblePSGToPSGLib
} from '../fileFormats/psg';
import {
  canonicalizeImportedNodeType,
  getImportedFragmentWrapperPolicy,
  normalizeImportedEdges
} from './importGraphNormalization';

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

type ParsedPresetDocument =
  | { kind: 'psglib'; data: any; psglib: PSGLibFile }
  | { kind: 'psg'; data: any; psglib: PSGLibFile };

class PresetParseError extends Error {
  constructor(
    message: string,
    public readonly category: 'json' | 'unrecognized' | 'psglib' | 'psg'
  ) {
    super(message);
    this.name = 'PresetParseError';
  }
}

function parsePresetJson(presetContent: string): any {
  try {
    return JSON.parse(presetContent);
  } catch {
    throw new PresetParseError('Invalid JSON format', 'json');
  }
}

function parsePSGLibPreset(
  presetContent: string,
  data: any
): ParsedPresetDocument {
  if (data.fileType !== 'psglib') {
    throw new PresetParseError('Not a PSGLib preset', 'psglib');
  }

  try {
    return {
      kind: 'psglib',
      data,
      psglib: parsePSGLib(presetContent)
    };
  } catch (error) {
    throw new PresetParseError(
      error instanceof Error ? error.message : 'Invalid PSGLib preset',
      'psglib'
    );
  }
}

function parseCanonicalOrLibraryPsgPreset(
  presetContent: string,
  data: any
): ParsedPresetDocument {
  if (!(data.version && data.nodes && !data.fileType)) {
    throw new PresetParseError('Not a PSG fragment preset', 'psg');
  }

  try {
    return {
      kind: 'psg',
      data,
      psglib: convertCanonicalPSGToPSGLib(parseCanonicalPsg(presetContent))
    };
  } catch (error) {
    try {
      return parseCompatiblePsgPreset(presetContent, data);
    } catch {
      throw new PresetParseError(
        `Invalid PSG fragment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'psg'
      );
    }
  }
}

function parseCompatiblePsgPreset(
  presetContent: string,
  data: any
): ParsedPresetDocument {
  if (!(data.version && data.nodes && !data.fileType)) {
    throw new PresetParseError('Not a PSG fragment preset', 'psg');
  }

  try {
    return {
      kind: 'psg',
      data,
      psglib: convertCompatiblePSGToPSGLib(
        parsePsgWithCompatibility(presetContent)
      )
    };
  } catch (error) {
    throw new PresetParseError(
      `Invalid PSG fragment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'psg'
    );
  }
}

function parsePresetDocument(
  presetContent: string,
  options: { preferCanonicalPsg?: boolean } = {}
): ParsedPresetDocument {
  const data = parsePresetJson(presetContent);

  if (data.fileType === 'psglib') {
    return parsePSGLibPreset(presetContent, data);
  }

  if (data.version && data.nodes && !data.fileType) {
    return options.preferCanonicalPsg
      ? parseCanonicalOrLibraryPsgPreset(presetContent, data)
      : parseCompatiblePsgPreset(presetContent, data);
  }

  throw new PresetParseError('Unrecognized preset format', 'unrecognized');
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
    const { psglib } = parsePresetDocument(presetContent, {
      preferCanonicalPsg: true
    });

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
    const hasExistingParenting = positionedNodes.some(
      n => typeof (n as any).parentNode === 'string'
    );
    const getBoxSize = (b: any) => ({
      width:
        (b.size && b.size.width) ||
        (b.data && b.data.width) ||
        (b.style && b.style.width) ||
        400,
      height:
        (b.size && b.size.height) ||
        (b.data && b.data.height) ||
        (b.style && b.style.height) ||
        300
    });
    const positionedWithParent =
      boxes.length && !hasExistingParenting
        ? positionedNodes.map(n => {
            if (n.type === 'enhancedBoundingBox' || (n as any).parentNode) {
              return n;
            }
            // Single box: parent all; multiple: parent if inside bounds
            const targetBox =
              boxes.length === 1
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
              expandParent: true,
              position: {
                x: nx - bx,
                y: ny - by
              }
            } as any;
          })
        : positionedNodes;

    // Create node type map for edge handle mapping
    const mappedEdges = normalizeImportedEdges(
      edges,
      positionedWithParent as PSGLibNode[]
    );

    // Mark nodes as selected if requested
    if (selectAfterInsert) {
      positionedWithParent.forEach(node => {
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
    const width =
      (node as any).size?.width ||
      (node as any).width ||
      (node as any).data?.width ||
      150;
    const height =
      (node as any).size?.height ||
      (node as any).height ||
      (node as any).data?.height ||
      50;

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
/**
 * Convert PSGLib node data to ReactFlow node data
 */
function convertNodeData(type: string, data: any): any {
  const nodeType = canonicalizeImportedNodeType(type);

  switch (nodeType) {
    case 'weightedChoice': {
      // Handle both PSG format (data.options) and legacy format (data.choices)
      const options = (data as any).options || (data as any).choices;
      if (options && Array.isArray(options)) {
        return {
          ...data,
          nodeType: 'weightedChoice',
          options: options.map((option: any, idx: number) => ({
            id: `option-${idx + 1}`,
            text: option.text || '',
            weight: option.weight || 1,
            hasBranch: false
          })),
          value: JSON.stringify(options, null, 2)
        };
      }
      break;
    }
    case 'concat':
      return {
        ...data,
        nodeType: 'concat',
        value: (data as any).separator || ' '
      };
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
        mode:
          nodeType === 'setVariable'
            ? 'set'
            : nodeType === 'getVariable'
              ? 'get'
              : 'both'
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
  const hasParentedNodes = nodes.some(
    node => (node as any).parentNode !== undefined
  );
  // Check if nodes are stacked (all at same position)
  const firstPos = nodes[0]?.position;
  const areStacked =
    nodes.length > 1 &&
    nodes.every(
      node => node.position.x === firstPos.x && node.position.y === firstPos.y
    );

  // If nodes include parent/child relationships, preserve their relative layout
  if (hasParentedNodes) {
    const topLevelNodes = nodes.filter(n => !(n as any).parentNode);
    const layoutBounds =
      topLevelNodes.length > 0 ? calculateBounds(topLevelNodes) : bounds;
    const centerX =
      layoutBounds.minX + (layoutBounds.maxX - layoutBounds.minX) / 2;
    const centerY =
      layoutBounds.minY + (layoutBounds.maxY - layoutBounds.minY) / 2;
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;

    return nodes.map(node => {
      const hasParent = !!(node as any).parentNode;
      let x = node.position.x;
      let y = node.position.y;
      // Only offset top-level nodes; children stay relative to their parent
      if (!hasParent) {
        x += offsetX;
        y += offsetY;
        if (snapToGrid) {
          x = Math.round(x / gridSize) * gridSize;
          y = Math.round(y / gridSize) * gridSize;
        }
      }

      return {
        ...node,
        type: canonicalizeImportedNodeType(node.type),
        position: { x, y },
        data: convertNodeData(node.type, node.data)
      };
    });
  }

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
        type: canonicalizeImportedNodeType(node.type),
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
        type: canonicalizeImportedNodeType(nodes[0].type),
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
      type: canonicalizeImportedNodeType(node.type),
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
        x:
          (dropPosition.x - (viewportTransform as any).x) /
          (viewportTransform as any).zoom,
        y:
          (dropPosition.y - (viewportTransform as any).y) /
          (viewportTransform as any).zoom
      }
    : dropPosition;

  let preservePositions = false;
  try {
    const data = JSON.parse(presetContent);
    preservePositions = getImportedFragmentWrapperPolicy({
      presetData: data
    }).shouldPreservePositions;
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
export function validatePreset(
  presetContent: string,
  options: { preferCanonicalPsg?: boolean } = {}
): {
  valid: boolean;
  error?: string;
  nodeCount?: number;
  edgeCount?: number;
} {
  try {
    let parsed: ParsedPresetDocument;
    try {
      parsed = parsePresetDocument(presetContent, options);
    } catch (e) {
      if (e instanceof PresetParseError) {
        return { valid: false, error: e.message };
      }
      return { valid: false, error: 'Invalid preset file' };
    }

    const { psglib } = parsed;

    if (psglib.graph.nodes.length === 0) {
      return { valid: false, error: 'Preset contains no nodes' };
    }

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
