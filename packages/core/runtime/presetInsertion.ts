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
 * Insert a preset from PSGLib file content
 */
export async function insertPreset(
  psglibContent: string,
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
    // Parse PSGLib file
    const psglib = parsePSGLib(psglibContent);

    // Track usage for analytics
    trackPresetUsage(psglib, 'import');

    // Regenerate IDs to avoid conflicts
    const { nodes, edges } = regenerateNodeIds(
      psglib.graph.nodes,
      psglib.graph.edges
    );

    // Calculate bounds of the preset
    const bounds = calculateBounds(nodes);

    // Position nodes
    const positionedNodes = positionNodes(
      nodes,
      bounds,
      position,
      preservePositions,
      snapToGrid,
      gridSize
    );

    // Mark nodes as selected if requested
    if (selectAfterInsert) {
      positionedNodes.forEach(node => {
        (node as any).selected = true;
      });
    }

    return {
      nodes: positionedNodes,
      edges,
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
  psglibContent: string,
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

  return insertPreset(psglibContent, {
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
export function validatePreset(psglibContent: string): {
  valid: boolean;
  error?: string;
  nodeCount?: number;
  edgeCount?: number;
} {
  try {
    const psglib = parsePSGLib(psglibContent);

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
  if (preservePositions) {
    return nodes;
  }

  // Calculate offset from bounds to target position
  const offsetX = position.x - bounds.minX;
  const offsetY = position.y - bounds.minY;

  return nodes.map(node => {
    let x = node.position.x + offsetX;
    let y = node.position.y + offsetY;

    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }

    return {
      ...node,
      position: { x, y }
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

  // Add ghost styling
  return positioned.map(node => ({
    ...node,
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
