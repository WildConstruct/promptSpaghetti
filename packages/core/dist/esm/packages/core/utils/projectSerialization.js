import { validatePsgFile, isVersionCompatible, createDefaultMetadata, createDefaultSettings, PSG_FORMAT_VERSION } from '../schemas/psgSchema';
stickyNotes ?  : Array;
nodeLabels ?  : Record;
regionGroups ?  : Array;
connectionLabels ?  : Record;
[key, string];
unknown;
;
;
error ?  : string;
warnings ?  : string;
migrated ?  : boolean;
export function serializeProject(graphState, metadata, settings, options = {}) {
    try {
        const { includeMetadata = true, includeSettings = true, includeCollaboration = true, compress = false, validateOutput = true } = options;
        // Convert ReactFlow nodes/edges to graph schema format
        const graph = {
            nodes: graphState.nodes.map(convertReactFlowNodeToGraphNode),
            seed: undefined // Will be set during execution if needed,
        };
        // Build the .psg file structure
        const psgFile = {
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
                const finalContent = JSON.stringify(psgFile, null, compress ? 0 : 2);
                return {
                    success: true,
                    data: finalContent,
                    warnings: [],
                };
            }
            try { }
            catch (error) {
                return {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown serialization error',
                };
            }
        }
        catch (outerError) {
            return {
                success: false,
                error: outerError instanceof Error ? outerError.message : 'Unknown serialization error',
            };
        }
        /**
         * Deserializes .psg file content to graph state
         */
        export function deserializeProject(content, options = {}) {
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
                        error: 'Invalid JSON format in .psg file',
                    };
                }
                // Validate file format
                if (!skipValidation) {
                    const validation = validatePsgFile(psgData);
                    if (!validation.success) {
                        return {
                            success: false,
                            error: `Invalid .psg file format: ${validation.error}`,
                            warnings: validation.issues?.map(issue => `${issue.path.join('.')}: ${issue.message}`) || []
                        };
                    }
                    psgData = validation.data;
                }
                const psgFile = psgData;
                const warnings = [];
                let migrated = false;
                // Check version compatibility
                const compatibility = isVersionCompatible(psgFile.formatVersion);
                if (!compatibility.compatible) {
                    return {
                        success: false,
                        error: compatibility.message || 'Incompatible file version',
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
                    // Convert graph nodes back to ReactFlow format
                    const reactFlowNodes = psgFile.graph.nodes.map(node => convertGraphNodeToReactFlowNode(node, { preserveIds }));
                    // Create edges array (empty for now, will be populated based on node inputs)
                    const reactFlowEdges = generateEdgesFromNodes(reactFlowNodes);
                    // Build graph state
                    const graphState = {
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
                    }
                    return {
                        success: true,
                        data: {
                            graph: graphState,
                            metadata: psgFile.metadata,
                            settings: psgFile.settings,
                            collaboration: psgFile.collaboration,
                        },
                        warnings,
                        migrated
                    };
                }
                try { }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown deserialization error',
                    };
                }
                /**
                 * Converts ReactFlow node to graph schema node format
                 */
                function convertReactFlowNodeToGraphNode(reactFlowNode) {
                    // Map nodeType to proper schema type
                    const getSchemaNodeType = (nodeType) => {
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
                            'python-transform': 'PythonTransform',
                        };
                        return typeMap[nodeType] || 'Output';
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
                            baseNode.choices = nodeData.variations.map((value) => ({
                                value,
                                weight: 1.0 // Default equal weight,
                            }));
                            // Don't include the original variations field
                            const { variations: _variations, ...restData } = nodeData;
                            Object.assign(baseNode, restData);
                        }
                        else {
                            Object.assign(baseNode, nodeData);
                            return baseNode;
                            options: {
                                preserveIds ?  : boolean;
                            }
                            { }
                            Node;
                            {
                                const { preserveIds = true } = options;
                                // Map schema type back to UI nodeType
                                const getUINodeType = (schemaType) => {
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
                                        'PythonTransform': 'python-transform',
                                    };
                                    return typeMap[schemaType] || 'output';
                                };
                                const uiNodeType = getUINodeType(graphNode.type);
                                const reactFlowNode = {
                                    id: preserveIds ? graphNode.id : `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
                            }
                            type: 'default', // ReactFlow visual type
                                position;
                            {
                                x: 0, y;
                                0;
                            }
                            data: {
                                nodeType: uiNodeType,
                                    label;
                                graphNode.label || graphNode.id,
                                ;
                                graphNode;
                            }
                            ;
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
                                return reactFlowNode;
                                /**
                                 * Generates ReactFlow edges from node input connections
                                 */
                                function generateEdgesFromNodes(nodes) {
                                    const edges = [];
                                    nodes.forEach(node => { });
                                    if (node.data?.inputs && Array.isArray(node.data.inputs)) {
                                        node.data.inputs.forEach((inputId, index) => {
                                            edges.push({});
                                            id: `edge_${inputId}_to_${node.id}_${index}`;
                                        });
                                    }
                                    source: inputId,
                                        target;
                                    node.id,
                                        sourceHandle;
                                    null,
                                        targetHandle;
                                    `input_${index}`;
                                }
                            }
                            type: 'default';
                        }
                        ;
                    }
                    ;
                }
                ;
                return edges;
                /**
                 * Generates a simple checksum for file integrity
                 */
                function generateChecksum(content) {
                    let checksum = 0;
                    for (let i = 0; i < content.length; i++) {
                        checksum = ((checksum << 5) - checksum + content.charCodeAt(i)) & 0xffffffff;
                        return Math.abs(checksum).toString(16);
                        /**
                         * Validates file integrity using checksum
                         */
                        export function validateFileIntegrity(psgFile) {
                            if (!psgFile.checksum) {
                                return true; // No checksum to validate
                                const { checksum, ...fileWithoutChecksum } = psgFile;
                                const content = JSON.stringify(fileWithoutChecksum, null, 2);
                                const calculatedChecksum = generateChecksum(content);
                                return checksum === calculatedChecksum;
                                author ?  : string;
                                PsgFile;
                                {
                                    return {
                                        fileType: 'psg',
                                        formatVersion: PSG_FORMAT_VERSION,
                                        metadata: createDefaultMetadata(name, author),
                                        settings: createDefaultSettings(),
                                        graph: { nodes: [] },
                                        exportedAt: new Date().toISOString()
                                    };
                                }
                            }
                        }
                    }
                }
            }
            finally { }
        }
    }
    finally { }
}
