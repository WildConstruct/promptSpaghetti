"use strict";
/**
 * Project Serialization Utilities - Story 6.1
 *
 * Handles serialization and deserialization of .psg files with error handling,
 * compression, and version migration support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeProject = serializeProject;
exports.deserializeProject = deserializeProject;
exports.validateFileIntegrity = validateFileIntegrity;
exports.createEmptyProject = createEmptyProject;
const psgSchema_1 = require("../schemas/psgSchema");
/**
 * Serializes graph state to .psg format
 */
function serializeProject(graphState: unknown, metadata: unknown, settings: unknown, options: unknown = {}) {
    try {
        const { includeMetadata = true, includeSettings = true, includeCollaboration = true, compress = false, validateOutput = true } = options;
        // Convert ReactFlow nodes/edges to graph schema format
        const graph = {
            nodes: graphState.nodes.map(convertReactFlowNodeToGraphNode),
            seed: undefined // Will be set during execution if needed
        };
        // Build the .psg file structure
        const psgFile = {
            fileType: 'psg',
            formatVersion: psgSchema_1.PSG_FORMAT_VERSION,
            metadata: includeMetadata ? metadata : (0, psgSchema_1.createDefaultMetadata)('Untitled Project'),
            settings: includeSettings ? settings : (0, psgSchema_1.createDefaultSettings)(),
            graph,
            exportedAt: new Date().toISOString()
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
        // Generate checksum for integrity
        const content = JSON.stringify(psgFile, null, compress ? 0 : 2);
        psgFile.checksum = generateChecksum(content);
        // Validate output if requested
        if (validateOutput) {
            const validation = (0, psgSchema_1.validatePsgFile)(psgFile);
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
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown serialization error'
        };
    }
}
/**
 * Deserializes .psg file content to graph state
 */
function deserializeProject(content: string, options: unknown = {}) {
    try {
        const { skipValidation = false, autoMigrate = true, preserveIds = true } = options;
        // Parse JSON
        let psgData;
        try {
            psgData = JSON.parse(content);
        }
        catch (parseError) {
            return {
                success: false,
                error: 'Invalid JSON format in .psg file'
            };
        }
        // Validate file format
        if (!skipValidation) {
            const validation = (0, psgSchema_1.validatePsgFile)(psgData);
            if (!validation.success) {
                return {
                    success: false,
                    error: `Invalid .psg file format: ${validation.error}`,
                    warnings: validation.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`)
                };
            }
            psgData = validation.data;
        }
        const psgFile = psgData;
        const warnings = [];
        let migrated = false;
        // Check version compatibility
        const compatibility = (0, psgSchema_1.isVersionCompatible)(psgFile.formatVersion);
        if (!compatibility.compatible) {
            return {
                success: false,
                error: compatibility.message || 'Incompatible file version'
            };
        }
        if (compatibility.requiresMigration) {
            if (autoMigrate) {
                // Perform migration (placeholder for future versions)
                migrated = true;
                warnings.push(compatibility.message || 'File format was automatically updated');
            }
            else {
                warnings.push(compatibility.message || 'File format migration available');
            }
        }
        // Convert graph nodes back to ReactFlow format
        const reactFlowNodes = psgFile.graph.nodes.map(node => convertGraphNodeToReactFlowNode(node, { preserveIds }));
        // Create edges array (empty for now, will be populated based on node inputs)
        const reactFlowEdges = generateEdgesFromNodes(reactFlowNodes);
        // Build graph state
        const graphState = {
            nodes: reactFlowNodes,
            edges: reactFlowEdges
        };
        // Add collaboration data if present
        if (psgFile.collaboration) {
            graphState.annotations = {
                stickyNotes: psgFile.collaboration.stickyNotes,
                nodeLabels: psgFile.collaboration.annotations.nodeLabels,
                regionGroups: psgFile.collaboration.annotations.regionGroups,
                connectionLabels: psgFile.collaboration.annotations.connectionLabels
            };
        }
        return {
            success: true,
            data: {
                graph: graphState,
                metadata: psgFile.metadata,
                settings: psgFile.settings,
                collaboration: psgFile.collaboration
            },
            warnings,
            migrated
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown deserialization error'
        };
    }
}
/**
 * Converts ReactFlow node to graph schema node format
 */
function convertReactFlowNodeToGraphNode(reactFlowNode: unknown) {
    // Map nodeType to proper schema type
    const getSchemaNodeType = (nodeType: string) => {
        const typeMap = {
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
            'python-transform': 'PythonTransform'
        };
        return typeMap[nodeType] || 'Output';
    };
    const nodeType = reactFlowNode.data?.nodeType || 'output';
    const schemaType = getSchemaNodeType(nodeType);
    const baseNode = {
        id: reactFlowNode.id,
        type: schemaType,
        inputs: [] // Will be calculated from edge connections
    };
    // Copy node-specific data, excluding ReactFlow-specific fields
    if (reactFlowNode.data) {
        const { nodeType: _, ...nodeData } = reactFlowNode.data;
        // Handle specific node type conversions
        if (schemaType === 'WeightedChoice' && nodeData.variations) {
            // Convert variations array to choices format for WeightedChoice nodes
            baseNode.choices = nodeData.variations.map((value) => ({
                value,
                weight: 1.0 // Default equal weight
            }));
            // Don't include the original variations field
            const { variations: _variations, ...restData } = nodeData;
            Object.assign(baseNode, restData);
        }
        else {
            Object.assign(baseNode, nodeData);
        }
    }
    return baseNode;
}
/**
 * Converts graph schema node to ReactFlow node format
 */
function convertGraphNodeToReactFlowNode(graphNode: unknown, options: unknown = {}) {
    const { preserveIds = true } = options;
    // Map schema type back to UI nodeType
    const getUINodeType = (schemaType: string) => {
        const typeMap = {
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
            'PythonTransform': 'python-transform'
        };
        return typeMap[schemaType] || 'output';
    };
    const uiNodeType = getUINodeType(graphNode.type);
    const reactFlowNode = {
        id: preserveIds ? graphNode.id : `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'default', // ReactFlow visual type
        position: { x: 0, y: 0 }, // Will be set by auto-layout or user
        data: {
            nodeType: uiNodeType,
            label: graphNode.label || graphNode.id,
            ...graphNode
        }
    };
    // Handle specific node type conversions back to UI format
    if (graphNode.type === 'WeightedChoice' && graphNode.choices) {
        // Convert choices back to variations for UI
        reactFlowNode.data.variations = graphNode.choices.map((choice) => choice.value);
        // Remove the schema-specific choices field from data
        const { choices: _choices, type: _type, ...restData } = reactFlowNode.data;
        reactFlowNode.data = { nodeType: uiNodeType, label: graphNode.label || graphNode.id, ...restData };
    }
    else {
        // Remove schema-specific type field
        const { type: _type, ...restData } = reactFlowNode.data;
        reactFlowNode.data = { nodeType: uiNodeType, label: graphNode.label || graphNode.id, ...restData };
    }
    return reactFlowNode;
}
/**
 * Generates ReactFlow edges from node input connections
 */
function generateEdgesFromNodes(nodes: unknown[]) {
    const edges = [];
    nodes.forEach(node => {
        if (node.data?.inputs && Array.isArray(node.data.inputs)) {
            node.data.inputs.forEach((inputId, index) => {
                edges.push({
                    id: `edge_${inputId}_to_${node.id}_${index}`,
                    source: inputId,
                    target: node.id,
                    sourceHandle: null,
                    targetHandle: `input_${index}`,
                    type: 'default'
                });
            });
        }
    });
    return edges;
}
/**
 * Generates a simple checksum for file integrity
 */
function generateChecksum(content: string) {
    let checksum = 0;
    for (let i = 0; i < content.length; i++) {
        checksum = ((checksum << 5) - checksum + content.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(checksum).toString(16);
}
/**
 * Validates file integrity using checksum
 */
function validateFileIntegrity(psgFile: unknown) {
    if (!psgFile.checksum) {
        return true; // No checksum to validate
    }
    const { checksum, ...fileWithoutChecksum } = psgFile;
    const content = JSON.stringify(fileWithoutChecksum, null, 2);
    const calculatedChecksum = generateChecksum(content);
    return checksum === calculatedChecksum;
}
/**
 * Creates a minimal .psg file for testing
 */
function createEmptyProject(name = 'New Project', author?: string) {
    return {
        fileType: 'psg',
        formatVersion: psgSchema_1.PSG_FORMAT_VERSION,
        metadata: (0, psgSchema_1.createDefaultMetadata)(name, author),
        settings: (0, psgSchema_1.createDefaultSettings)(),
        graph: { nodes: [] },
        exportedAt: new Date().toISOString()
    };
}
