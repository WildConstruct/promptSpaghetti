"use strict";
/**
 * Preset Insertion Logic
 * Handles importing PSGLib presets into the graph editor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertPreset = insertPreset;
exports.insertPresetFromDrop = insertPresetFromDrop;
exports.loadPresetFromPath = loadPresetFromPath;
exports.validatePreset = validatePreset;
exports.createGhostNodes = createGhostNodes;
exports.checkDuplicatePresetId = checkDuplicatePresetId;
exports.createImportAnimation = createImportAnimation;
const psglib_1 = require("../fileFormats/psglib");
/**
 * Map edge handles based on node types and enable branch outputs
 */
function mapEdgeHandles(edges, nodeTypeMap, nodes) {
    // Track which weighted choice nodes have branch connections
    const branchConnections = new Map();
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
                branchConnections.get(edge.source).add(branchIndex);
            }
        }
    });
    // Enable hasBranch for connected options
    nodes.forEach(node => {
        if (node.type === 'WeightedChoice' || node.type === 'weightedChoice') {
            const connections = branchConnections.get(node.id);
            if (connections && node.data.options) {
                node.data.options.forEach((option, index) => {
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
        if (targetType === 'concat' &&
            targetHandle &&
            targetHandle.startsWith('input')) {
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
 * Insert a preset from PSGLib file content
 */
async function insertPreset(psglibContent, options = {}) {
    const { position = { x: 100, y: 100 }, preservePositions = false, snapToGrid = false, gridSize = 20, selectAfterInsert = true } = options;
    try {
        // Parse PSGLib file
        const psglib = (0, psglib_1.parsePSGLib)(psglibContent);
        // Track usage for analytics
        (0, psglib_1.trackPresetUsage)(psglib, 'import');
        // Regenerate IDs to avoid conflicts
        const { nodes, edges } = (0, psglib_1.regenerateNodeIds)(psglib.graph.nodes, psglib.graph.edges);
        // Calculate bounds of the preset
        const bounds = calculateBounds(nodes);
        // Position nodes and get type map
        const positionedNodes = positionNodes(nodes, bounds, position, preservePositions, snapToGrid, gridSize);
        // Create node type map for edge handle mapping
        const nodeTypeMap = new Map();
        positionedNodes.forEach(node => {
            nodeTypeMap.set(node.id, node.type);
        });
        // Map edge handles based on node types and enable branch outputs
        const mappedEdges = mapEdgeHandles(edges, nodeTypeMap, positionedNodes);
        // Mark nodes as selected if requested
        if (selectAfterInsert) {
            positionedNodes.forEach(node => {
                node.selected = true;
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
    }
    catch (error) {
        console.error('Failed to insert preset:', error);
        throw error;
    }
}
/**
 * Insert preset via drag and drop
 */
async function insertPresetFromDrop(psglibContent, dropPosition, viewportTransform) {
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
async function loadPresetFromPath(path, options = {}) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load preset: ${response.statusText}`);
        }
        const content = await response.text();
        return insertPreset(content, options);
    }
    catch (error) {
        console.error('Failed to load preset from path:', error);
        throw error;
    }
}
/**
 * Validate preset before insertion
 */
function validatePreset(psglibContent) {
    try {
        const psglib = (0, psglib_1.parsePSGLib)(psglibContent);
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
    }
    catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Invalid preset file'
        };
    }
}
/**
 * Calculate bounds of nodes
 */
function calculateBounds(nodes) {
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
function mapNodeType(type) {
    const typeMap = {
        WeightedChoice: 'weightedChoice',
        Concat: 'concat',
        Output: 'output',
        TextBlock: 'textBlock',
        Variable: 'variable',
        SetVariable: 'setVariable',
        GetVariable: 'getVariable',
        Include: 'include'
    };
    // Return mapped type or lowercase version as fallback
    return typeMap[type] || type.toLowerCase();
}
/**
 * Convert PSGLib node data to ReactFlow node data
 */
function convertNodeData(type, data) {
    const nodeType = mapNodeType(type);
    // Convert data based on node type
    switch (nodeType) {
        case 'weightedChoice':
            // Convert choices array to options format expected by WeightedChoiceNode
            if (data.choices && Array.isArray(data.choices)) {
                return {
                    ...data,
                    nodeType: 'weightedChoice',
                    options: data.choices.map((choice, idx) => ({
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
                mode: nodeType === 'setVariable'
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
function positionNodes(nodes, bounds, position, preservePositions, snapToGrid, gridSize) {
    if (preservePositions) {
        return nodes;
    }
    // Calculate center of the preset
    const presetWidth = bounds.maxX - bounds.minX;
    const presetHeight = bounds.maxY - bounds.minY;
    const centerX = bounds.minX + presetWidth / 2;
    const centerY = bounds.minY + presetHeight / 2;
    // Calculate offset to center the preset at the drop position
    const offsetX = position.x - centerX;
    const offsetY = position.y - centerY;
    // Apply a better spread to avoid overlapping if multiple presets are dropped
    const spreadOffset = 80; // Increased spread to prevent stacking
    const randomSpread = {
        x: (Math.random() - 0.5) * spreadOffset * 2, // Wider horizontal spread
        y: (Math.random() - 0.5) * spreadOffset
    };
    return nodes.map(node => {
        let x = node.position.x + offsetX + randomSpread.x;
        let y = node.position.y + offsetY + randomSpread.y;
        // Snap to grid if enabled
        if (snapToGrid) {
            x = Math.round(x / gridSize) * gridSize;
            y = Math.round(y / gridSize) * gridSize;
        }
        // Convert node to ReactFlow format
        return {
            ...node,
            type: mapNodeType(node.type), // Map the type to ReactFlow format
            position: { x, y },
            data: convertNodeData(node.type, node.data) // Convert data to expected format
        };
    });
}
/**
 * Preview ghost nodes during drag
 */
function createGhostNodes(nodes, position) {
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
function checkDuplicatePresetId(presetId, existingPresets) {
    const conflict = existingPresets.find(p => p.id === presetId);
    return {
        isDuplicate: !!conflict,
        conflictingPreset: conflict
    };
}
/**
 * Generate animation for successful import
 */
function createImportAnimation(nodeElement, duration = 500) {
    // Flash animation
    nodeElement.animate([
        { boxShadow: '0 0 0 0 rgba(46, 164, 79, 0.8)' },
        { boxShadow: '0 0 20px 10px rgba(46, 164, 79, 0.4)' },
        { boxShadow: '0 0 0 0 rgba(46, 164, 79, 0)' }
    ], {
        duration,
        easing: 'ease-out'
    });
}
