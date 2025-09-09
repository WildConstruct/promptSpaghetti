/**
 * Layout algorithms for auto-arranging nodes in the graph
 * Story 1.32: Auto-Layout and Node Positioning System
 */

import * as dagre from 'dagre';
import * as d3 from 'd3-force';
import { Node, Edge } from 'reactflow';

export type LayoutAlgorithm = 'dagre' | 'force' | 'grid';

export interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL'; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
  nodeSpacing?: number;
  rankSpacing?: number;
  animate?: boolean;
}

/**
 * Apply Dagre (hierarchical) layout algorithm
 * Best for directed graphs with clear flow
 */
export function applyDagreLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  // Safety check for empty or invalid nodes
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }

  let {
    direction = 'LR',
    nodeSpacing = 150, // Increased default spacing
    rankSpacing = 200 // Increased default spacing
  } = options;

  // Auto-detect best direction if not specified
  if (!options.direction) {
    // Check if we have an output node (should be at the end)
    const hasOutput = nodes.some(
      n => n.type === 'output' || n.data?.nodeType === 'output'
    );
    // For prompt graphs, LR (left-right) usually works best
    direction = hasOutput ? 'LR' : 'TB';
  }

  try {
    // Create a new directed graph
    const g = new dagre.graphlib.Graph();

    // Set graph options
    g.setGraph({
      rankdir: direction,
      nodesep: nodeSpacing,
      ranksep: rankSpacing,
      marginx: 20,
      marginy: 20
    });

    // Default node label - must return an object
    g.setDefaultNodeLabel(() => ({}));

    // Add nodes to the graph with validation
    const validNodeIds = new Set<string>();
    nodes.forEach(node => {
      if (node && node.id) {
        // Ensure node has required properties - WeightedChoice nodes are taller
        const defaultWidth = 250; // Wider default for WeightedChoice nodes
        const defaultHeight = node.type === 'weightedChoice' ? 200 : 100; // Taller for WeightedChoice
        const nodeConfig = {
          width: node.width || node.measured?.width || defaultWidth,
          height: node.height || node.measured?.height || defaultHeight,
          label: node.id
        };
        g.setNode(node.id, nodeConfig);
        validNodeIds.add(node.id);
      }
    });

    // Add edges to the graph with validation
    if (edges && Array.isArray(edges)) {
      edges.forEach(edge => {
        // Only add edge if both source and target exist in our valid nodes
        if (
          edge &&
          edge.source &&
          edge.target &&
          validNodeIds.has(edge.source) &&
          validNodeIds.has(edge.target)
        ) {
          try {
            // Add edge with empty label object
            g.setEdge(edge.source, edge.target, {});
          } catch (e) {
            console.warn(
              `Failed to add edge ${edge.source} -> ${edge.target}:`,
              e
            );
          }
        } else if (edge) {
          console.warn(
            `Skipping edge ${edge.source} -> ${edge.target}: nodes not in graph`
          );
        }
      });
    }

    // Log graph structure for debugging
    console.log(
      `[Dagre] Layout graph with ${g.nodeCount()} nodes and ${g.edgeCount()} edges`
    );

    // Calculate the layout
    dagre.layout(g);

    // Apply the calculated positions to nodes
    return nodes.map(node => {
      if (!node || !node.id) return node;

      try {
        const nodeWithPosition = g.node(node.id);

        // If dagre didn't calculate position, keep original or use fallback
        if (
          !nodeWithPosition ||
          typeof nodeWithPosition.x !== 'number' ||
          typeof nodeWithPosition.y !== 'number'
        ) {
          return {
            ...node,
            position: node.position || { x: 100, y: 100 }
          };
        }

        const defaultWidth = 250;
        const defaultHeight = node.type === 'weightedChoice' ? 200 : 100;
        const width = node.width || node.measured?.width || defaultWidth;
        const height = node.height || node.measured?.height || defaultHeight;

        return {
          ...node,
          position: {
            // Dagre gives center position, we need top-left
            x: nodeWithPosition.x - width / 2,
            y: nodeWithPosition.y - height / 2
          }
        };
      } catch (e) {
        console.warn(`Failed to get layout for node ${node.id}:`, e);
        return {
          ...node,
          position: node.position || { x: 100, y: 100 }
        };
      }
    });
  } catch (error) {
    console.error('Dagre layout failed:', error);
    // Fallback to grid layout
    return applyGridLayout(nodes, { x: 100, y: 100 }, options);
  }
}

/**
 * Apply Force-directed layout algorithm
 * Good for organic, spring-like layouts
 */
export function applyForceLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  // Safety check for empty or invalid nodes
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }

  try {
    // Prepare nodes with current positions
    const simulationNodes = nodes.map(node => ({
      ...node,
      id: node.id,
      x: node.position?.x || 100,
      y: node.position?.y || 100
    }));

    // Prepare links for simulation with validation
    const nodeIds = new Set(nodes.map(n => n.id));
    const simulationLinks = (edges || [])
      .filter(
        edge => edge && nodeIds.has(edge.source) && nodeIds.has(edge.target)
      )
      .map(edge => ({
        source: edge.source,
        target: edge.target
      }));

    // Create force simulation
    const simulation = d3
      .forceSimulation(simulationNodes as any)
      .force(
        'link',
        d3
          .forceLink(simulationLinks)
          .id((d: any) => d.id)
          .distance(150)
      )
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(400, 300))
      .force('collision', d3.forceCollide().radius(100))
      .stop();

    // Run simulation synchronously
    simulation.tick(300);

    // Apply calculated positions
    return simulationNodes.map((simNode: any) => {
      const originalNode = nodes.find(n => n.id === simNode.id);
      if (!originalNode) {
        return simNode;
      }
      return {
        ...originalNode,
        position: {
          x: isFinite(simNode.x) ? simNode.x : originalNode.position?.x || 100,
          y: isFinite(simNode.y) ? simNode.y : originalNode.position?.y || 100
        }
      };
    });
  } catch (error) {
    console.error('Force layout failed:', error);
    // Fallback to grid layout
    return applyGridLayout(nodes, { x: 100, y: 100 }, options);
  }
}

/**
 * Apply simple grid layout
 * Fallback for when other algorithms don't work well
 */
export function applyGridLayout(
  nodes: Node[],
  startPos: { x: number; y: number } = { x: 100, y: 100 },
  options: LayoutOptions = {}
): Node[] {
  // Safety check for empty or invalid nodes
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return [];
  }

  const { nodeSpacing = 250 } = options;
  const columns = Math.ceil(Math.sqrt(nodes.length));

  // Ensure startPos is valid
  const validStartPos = {
    x:
      typeof startPos?.x === 'number' && isFinite(startPos.x)
        ? startPos.x
        : 100,
    y:
      typeof startPos?.y === 'number' && isFinite(startPos.y) ? startPos.y : 100
  };

  return nodes.map((node, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;

    return {
      ...node,
      position: {
        x: validStartPos.x + col * nodeSpacing,
        y: validStartPos.y + row * nodeSpacing
      }
    };
  });
}

/**
 * Smart layout selection based on graph characteristics
 */
export function selectBestLayout(
  nodes: Node[],
  edges: Edge[]
): LayoutAlgorithm {
  // If no edges, use grid
  if (edges.length === 0) {
    return 'grid';
  }

  // Calculate graph density
  const maxPossibleEdges = (nodes.length * (nodes.length - 1)) / 2;
  const density = edges.length / maxPossibleEdges;

  // Check if graph is mostly hierarchical (DAG-like)
  const hasHierarchy = checkIfHierarchical(nodes, edges);

  if (hasHierarchy && density < 0.3) {
    return 'dagre';
  } else if (density > 0.5) {
    return 'force';
  } else {
    return 'dagre';
  }
}

/**
 * Check if graph has hierarchical structure
 */
function checkIfHierarchical(nodes: Node[], edges: Edge[]): boolean {
  // Simple heuristic: check if most nodes have clear input/output direction
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    outDegree.set(node.id, 0);
  });

  edges.forEach(edge => {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
  });

  // Count nodes that are clearly sources, sinks, or intermediate
  let sources = 0;
  let sinks = 0;
  let intermediate = 0;

  nodes.forEach(node => {
    const inCount = inDegree.get(node.id) || 0;
    const outCount = outDegree.get(node.id) || 0;

    if (inCount === 0 && outCount > 0) sources++;
    else if (inCount > 0 && outCount === 0) sinks++;
    else if (inCount > 0 && outCount > 0) intermediate++;
  });

  // If we have clear sources and sinks, it's likely hierarchical
  return sources > 0 && sinks > 0;
}

/**
 * Apply layout with animation support
 */
export function applyLayoutWithAnimation(
  nodes: Node[],
  algorithm: LayoutAlgorithm,
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  let layoutedNodes: Node[];

  switch (algorithm) {
    case 'dagre':
      layoutedNodes = applyDagreLayout(nodes, edges, options);
      break;
    case 'force':
      layoutedNodes = applyForceLayout(nodes, edges, options);
      break;
    case 'grid':
      layoutedNodes = applyGridLayout(nodes, undefined, options);
      break;
    default:
      layoutedNodes = nodes;
  }

  // Add transition style for smooth animation
  if (options.animate) {
    layoutedNodes = layoutedNodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }));
  }

  return layoutedNodes;
}

/**
 * Layout only newly added nodes, keeping existing nodes in place
 */
export function layoutNewNodes(
  existingNodes: Node[],
  newNodes: Node[],
  dropPosition: { x: number; y: number },
  edges: Edge[] = []
): Node[] {
  // Safety checks
  if (!newNodes || !Array.isArray(newNodes) || newNodes.length === 0) {
    return [];
  }

  // Ensure dropPosition is valid
  const validDropPosition = {
    x: typeof dropPosition?.x === 'number' ? dropPosition.x : 100,
    y: typeof dropPosition?.y === 'number' ? dropPosition.y : 100
  };

  // Single node - just place at drop position
  if (newNodes.length === 1) {
    return [
      {
        ...newNodes[0],
        position: validDropPosition
      }
    ];
  }

  // For multiple nodes, apply layout
  try {
    let layoutedNodes: Node[];

    // If we have edges, use dagre for hierarchical layout
    if (edges && edges.length > 0) {
      console.log(
        '[Layout] Using dagre for',
        newNodes.length,
        'nodes with',
        edges.length,
        'edges'
      );

      // Ensure nodes have valid positions before layout
      const nodesForLayout = newNodes.map((node, index) => ({
        ...node,
        position: node.position || {
          x: validDropPosition.x + index * 100,
          y: validDropPosition.y + index * 100
        }
      }));

      layoutedNodes = applyDagreLayout(nodesForLayout, edges, {
        direction: 'LR', // Left-Right for prompt graphs
        nodeSpacing: 200, // Increased spacing between nodes
        rankSpacing: 300 // Increased spacing between ranks
      });

      // If dagre failed, try grid layout
      if (!layoutedNodes || layoutedNodes.length === 0) {
        console.warn('[Layout] Dagre failed, falling back to grid');
        layoutedNodes = applyGridLayout(nodesForLayout, validDropPosition, {
          nodeSpacing: 200
        });
      }
    } else {
      // No edges, use simple grid layout
      console.log(
        '[Layout] Using grid for',
        newNodes.length,
        'nodes without edges'
      );
      layoutedNodes = applyGridLayout(newNodes, validDropPosition, {
        nodeSpacing: 300 // Increased spacing for grid layout
      });
    }

    // If layout completely failed, just return nodes with drop position
    if (!layoutedNodes || layoutedNodes.length === 0) {
      console.error('[Layout] All layouts failed, using original positions');
      return newNodes.map((node, index) => ({
        ...node,
        position: {
          x: validDropPosition.x + index * 100,
          y: validDropPosition.y + index * 50
        }
      }));
    }

    // Calculate bounding box to center the layout at drop position
    const bounds = layoutedNodes.reduce(
      (acc, node) => {
        const pos = node.position || { x: 0, y: 0 };
        const defaultWidth = 250;
        const defaultHeight = node.type === 'weightedChoice' ? 200 : 100;
        const width = node.width || node.measured?.width || defaultWidth;
        const height = node.height || node.measured?.height || defaultHeight;

        return {
          minX: Math.min(acc.minX, pos.x),
          minY: Math.min(acc.minY, pos.y),
          maxX: Math.max(acc.maxX, pos.x + width),
          maxY: Math.max(acc.maxY, pos.y + height)
        };
      },
      {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
      }
    );

    // Check if bounds are valid
    if (
      isFinite(bounds.minX) &&
      isFinite(bounds.minY) &&
      isFinite(bounds.maxX) &&
      isFinite(bounds.maxY)
    ) {
      // Center the layout at drop position
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      const offsetX = validDropPosition.x - centerX;
      const offsetY = validDropPosition.y - centerY;

      // Apply offset to center at drop position
      return layoutedNodes.map(node => ({
        ...node,
        position: {
          x: (node.position?.x || 0) + offsetX,
          y: (node.position?.y || 0) + offsetY
        }
      }));
    }

    // Bounds invalid, return layouted nodes as is
    return layoutedNodes;
  } catch (error) {
    console.error('[Layout] Unexpected error:', error);
    // Emergency fallback - simple spacing
    return newNodes.map((node, index) => ({
      ...node,
      position: {
        x: validDropPosition.x + (index % 3) * 200,
        y: validDropPosition.y + Math.floor(index / 3) * 150
      }
    }));
  }
}
