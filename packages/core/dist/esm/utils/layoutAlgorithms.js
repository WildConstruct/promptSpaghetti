/**
 * Layout algorithms for auto-arranging nodes in the graph
 * Story 1.32: Auto-Layout and Node Positioning System
 */
import dagre from 'dagre';
import * as d3 from 'd3-force';
/**
 * Apply Dagre (hierarchical) layout algorithm
 * Best for directed graphs with clear flow
 */
export function applyDagreLayout(nodes, edges, options = {}) {
    const { direction = 'LR', nodeSpacing = 100, rankSpacing = 150, } = options;
    // Create a new directed graph
    const g = new dagre.graphlib.Graph();
    // Set graph options
    g.setGraph({
        rankdir: direction,
        nodesep: nodeSpacing,
        ranksep: rankSpacing,
        marginx: 20,
        marginy: 20,
    });
    // Default node label
    g.setDefaultNodeLabel(() => ({}));
    // Add nodes to the graph
    nodes.forEach((node) => {
        g.setNode(node.id, {
            width: node.width || 200,
            height: node.height || 80,
        });
    });
    // Add edges to the graph
    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });
    // Calculate the layout
    dagre.layout(g);
    // Apply the calculated positions to nodes
    return nodes.map((node) => {
        const nodeWithPosition = g.node(node.id);
        return {
            ...node,
            position: {
                // Dagre gives center position, we need top-left
                x: nodeWithPosition.x - (node.width || 200) / 2,
                y: nodeWithPosition.y - (node.height || 80) / 2,
            },
        };
    });
}
/**
 * Apply Force-directed layout algorithm
 * Good for organic, spring-like layouts
 */
export function applyForceLayout(nodes, edges, options = {}) {
    // Prepare nodes with current positions
    const simulationNodes = nodes.map((node) => ({
        ...node,
        x: node.position.x,
        y: node.position.y,
    }));
    // Prepare links for simulation
    const simulationLinks = edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
    }));
    // Create force simulation
    const simulation = d3
        .forceSimulation(simulationNodes)
        .force('link', d3
        .forceLink(simulationLinks)
        .id((d) => d.id)
        .distance(150))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(400, 300))
        .force('collision', d3.forceCollide().radius(100))
        .stop();
    // Run simulation synchronously
    simulation.tick(300);
    // Apply calculated positions
    return simulationNodes.map((simNode) => {
        const originalNode = nodes.find((n) => n.id === simNode.id);
        return {
            ...originalNode,
            position: {
                x: simNode.x,
                y: simNode.y,
            },
        };
    });
}
/**
 * Apply simple grid layout
 * Fallback for when other algorithms don't work well
 */
export function applyGridLayout(nodes, startPos = { x: 100, y: 100 }, options = {}) {
    const { nodeSpacing = 250 } = options;
    const columns = Math.ceil(Math.sqrt(nodes.length));
    return nodes.map((node, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        return {
            ...node,
            position: {
                x: startPos.x + col * nodeSpacing,
                y: startPos.y + row * nodeSpacing,
            },
        };
    });
}
/**
 * Smart layout selection based on graph characteristics
 */
export function selectBestLayout(nodes, edges) {
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
    }
    else if (density > 0.5) {
        return 'force';
    }
    else {
        return 'dagre';
    }
}
/**
 * Check if graph has hierarchical structure
 */
function checkIfHierarchical(nodes, edges) {
    // Simple heuristic: check if most nodes have clear input/output direction
    const inDegree = new Map();
    const outDegree = new Map();
    nodes.forEach((node) => {
        inDegree.set(node.id, 0);
        outDegree.set(node.id, 0);
    });
    edges.forEach((edge) => {
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
        outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
    });
    // Count nodes that are clearly sources, sinks, or intermediate
    let sources = 0;
    let sinks = 0;
    let intermediate = 0;
    nodes.forEach((node) => {
        const inCount = inDegree.get(node.id) || 0;
        const outCount = outDegree.get(node.id) || 0;
        if (inCount === 0 && outCount > 0)
            sources++;
        else if (inCount > 0 && outCount === 0)
            sinks++;
        else if (inCount > 0 && outCount > 0)
            intermediate++;
    });
    // If we have clear sources and sinks, it's likely hierarchical
    return sources > 0 && sinks > 0;
}
/**
 * Apply layout with animation support
 */
export function applyLayoutWithAnimation(nodes, algorithm, edges, options = {}) {
    let layoutedNodes;
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
        layoutedNodes = layoutedNodes.map((node) => ({
            ...node,
            style: {
                ...node.style,
                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            },
        }));
    }
    return layoutedNodes;
}
/**
 * Layout only newly added nodes, keeping existing nodes in place
 */
export function layoutNewNodes(existingNodes, newNodes, dropPosition, edges = []) {
    if (newNodes.length === 0)
        return [];
    if (newNodes.length === 1) {
        // Single node - just place at drop position
        return [{
                ...newNodes[0],
                position: dropPosition,
            }];
    }
    // For multiple nodes, layout them relative to drop position
    const layoutedNewNodes = applyDagreLayout(newNodes, edges, {
        direction: 'LR',
        nodeSpacing: 80,
        rankSpacing: 120,
    });
    // Calculate bounding box of layouted nodes
    const bounds = layoutedNewNodes.reduce((acc, node) => ({
        minX: Math.min(acc.minX, node.position.x),
        minY: Math.min(acc.minY, node.position.y),
        maxX: Math.max(acc.maxX, node.position.x + (node.width || 200)),
        maxY: Math.max(acc.maxY, node.position.y + (node.height || 80)),
    }), {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
    });
    // Center the layout at drop position
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const offsetX = dropPosition.x - centerX;
    const offsetY = dropPosition.y - centerY;
    // Apply offset to center at drop position
    return layoutedNewNodes.map((node) => ({
        ...node,
        position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY,
        },
    }));
}
