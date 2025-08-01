import { GraphSyncHandler } from '../../crdt-research/src/graph-sync';
export class GraphCRDTAdapter {
    syncHandler;
    yGraph;
    options;
    currentGraph;
    isUpdating = false;
    constructor(options, initialGraph) {
        this.options = options;
        this.syncHandler = new GraphSyncHandler(options.documentId, options.userId);
        this.yGraph = this.syncHandler.getGraph();
        // Initialize with existing graph if provided
        this.currentGraph = initialGraph || { nodes: [], edges: [] };
        // Set up observers
        this.setupObservers();
        // Import initial graph to CRDT
        if (initialGraph) {
            this.importGraph(initialGraph);
        }
    }
    /**
     * Convert existing Node to CRDTNode
     */
    toCRDTNode(node) {
        return {
            id: node.id,
            type: node.type,
            position: this.extractPosition(node),
            data: this.extractNodeData(node),
            metadata: {
                originalType: node.type,
                inputs: node.inputs || [],
                ...this.extractNodeMetadata(node) }
        };
    }
    /**
     * Convert existing Edge to CRDTEdge
     */
    toCRDTEdge(edge, sourceNode, targetNode) {
        return {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || 'output',
            targetHandle: edge.targetHandle || 'input',
            metadata: {
                sourceType: sourceNode.type,
                targetType: targetNode.type,
                ...this.extractEdgeMetadata(edge)
            }
        };
    }
    /**
     * Convert CRDTNode back to existing Node format
     */
    fromCRDTNode(crdtNode) {
        const baseNode = {
            id: crdtNode.id,
            type: crdtNode.type,
            inputs: crdtNode.metadata.inputs || [],
        };
        // Add type-specific properties based on node type
        switch (crdtNode.type) {
            case 'WeightedChoice':
                return {
                    ...baseNode,
                    type: 'WeightedChoice',
                    choices: crdtNode.data.choices || [],
                };
            case 'Concat':
                return {
                    ...baseNode,
                    type: 'Concat',
                };
            case 'Output':
                return {
                    ...baseNode,
                    type: 'Output',
                };
            case 'SetVariable':
                return {
                    ...baseNode,
                    type: 'SetVariable',
                    variableName: crdtNode.data.variableName || '',
                    value: crdtNode.data.value || '',
                };
            case 'GetVariable':
                return {
                    ...baseNode,
                    type: 'GetVariable',
                    variableName: crdtNode.data.variableName || '',
                };
            case 'Include':
                return {
                    ...baseNode,
                    type: 'Include',
                    name: crdtNode.data.name || '',
                };
            default:
                // For unknown types, preserve original data
                return {
                    ...baseNode,
                    ...crdtNode.data
                };
        }
    }
    /**
     * Convert CRDTEdge back to existing Edge format
     */
    fromCRDTEdge(crdtEdge) {
        return {
            id: crdtEdge.id,
            source: crdtEdge.source,
            target: crdtEdge.target,
            sourceHandle: crdtEdge.sourceHandle,
            targetHandle: crdtEdge.targetHandle,
        };
    }
    /**
     * Extract position from existing node (assuming UI stores position separately)
     */
    extractPosition(node) {
        // For now, return default position
        // In real implementation, this would extract from React Flow node data
        return { x: 0, y: 0 };
    }
    /**
     * Extract node data excluding schema fields
     */
    extractNodeData(node) {
        const { id, type, inputs, ...data } = node;
        return data;
    }
    /**
     * Extract node metadata
     */
    extractNodeMetadata(node) {
        return {
            created: Date.now(),
            lastModified: Date.now(),
        };
    }
    /**
     * Extract edge metadata
     */
    extractEdgeMetadata(edge) {
        return {
            created: Date.now(),
        };
    }
    /**
     * Setup CRDT observers to sync changes back to graph
     */
    setupObservers() {
        // Observe CRDT changes and update current graph
        this.yGraph.observe((event) => {
            if (!this.isUpdating) {
                this.syncToGraph();
            }
        });
        // Observe document updates for network sync
        this.syncHandler.onDocumentUpdate((update, origin) => {
            // Handle remote updates
            if (origin !== this.options.userId) {
                this.syncToGraph();
            }
        });
        // Observe user presence
        this.syncHandler.onAwarenessChange((awareness) => {
            if (this.options.onUserPresence) {
                this.options.onUserPresence(awareness);
            }
        });
    }
    /**
     * Import existing graph into CRDT
     */
    importGraph(graph) {
        this.isUpdating = true;
        try {
            // Create a map of nodes for edge validation
            const nodeMap = new Map();
            graph.nodes.forEach(node => nodeMap.set(node.id, node));
            // Import nodes
            graph.nodes.forEach(node => {
                const crdtNode = this.toCRDTNode(node);
                this.yGraph.addNode(crdtNode);
            });
            // Import edges
            graph.edges.forEach(edge => {
                const sourceNode = nodeMap.get(edge.source);
                const targetNode = nodeMap.get(edge.target);
                if (sourceNode && targetNode) {
                    const crdtEdge = this.toCRDTEdge(edge, sourceNode, targetNode);
                    this.yGraph.addEdge(crdtEdge);
                }
            });
        }
        finally {
            this.isUpdating = false;
        }
        /**
         * Sync CRDT state back to current graph
         */
    }
    /**
     * Sync CRDT state back to current graph
     */
    syncToGraph() {
        const nodes = this.yGraph.getNodes().map(node => this.fromCRDTNode(node));
        const edges = this.yGraph.getEdges().map(edge => this.fromCRDTEdge(edge));
        this.currentGraph = { nodes, edges };
        if (this.options.onGraphChange) {
            this.options.onGraphChange(this.currentGraph);
        }
        /**
         * Public API: Get current graph state
         */
        getGraph();
        Graph;
        {
            return { ...this.currentGraph };
        }
        /**
         * Public API: Add a node collaboratively
         */
        addNode(node, Node, position ?  : { x: number, y: number });
        void {
            const: crdtNode = this.toCRDTNode(node),
            if(position) {
                crdtNode.position = position;
            },
            this: .isUpdating = true,
            this: .yGraph.addNode(crdtNode),
            this: .isUpdating = false,
            this: .syncToGraph()
        };
        /**
         * Public API: Update a node collaboratively
         */
        updateNode(nodeId, string, updates, (Partial));
        void {
            const: existingNode = this.yGraph.getNode(nodeId),
            if(, existingNode) { }, return: ,
            const: crdtUpdates
        };
        {
            data: {
                existingNode.data, ;
                this.extractNodeData(updates);
            }
            metadata: {
                existingNode.metadata, lastModified;
                Date.now();
            }
        }
        ;
        this.isUpdating = true;
        this.yGraph.updateNode(nodeId, crdtUpdates);
        this.isUpdating = false;
        this.syncToGraph();
    }
    /**
     * Public API: Delete a node collaboratively
     */
    deleteNode(nodeId) {
        this.isUpdating = true;
        this.yGraph.deleteNode(nodeId);
        this.isUpdating = false;
        this.syncToGraph();
    }
    /**
     * Public API: Add an edge collaboratively
     */
    addEdge(edge) {
        const sourceNode = this.currentGraph.nodes.find(n => n.id === edge.source);
        const targetNode = this.currentGraph.nodes.find(n => n.id === edge.target);
        if (sourceNode && targetNode) {
            const crdtEdge = this.toCRDTEdge(edge, sourceNode, targetNode);
            this.isUpdating = true;
            this.yGraph.addEdge(crdtEdge);
            this.isUpdating = false;
            this.syncToGraph();
        }
        /**
         * Public API: Delete an edge collaboratively
         */
        deleteEdge(edgeId, string);
        void {
            this: .isUpdating = true,
            this: .yGraph.deleteEdge(edgeId),
            this: .isUpdating = false,
            this: .syncToGraph()
        };
        /**
         * Public API: Update node position (for React Flow integration)
         */
        updateNodePosition(nodeId, string, position, { x: number, y: number });
        void {
            this: .isUpdating = true,
            this: .yGraph.updateNode(nodeId, { position }),
            this: .isUpdating = false
        };
        /**
         * Public API: Set user presence
         */
        setUserPresence(presence, {
            cursor: { nodeId: string, position: { x: number, y: number } },
            selection: string,
            name: string,
            color: string
        });
        void {
            this: .syncHandler.setLocalPresence(presence)
        };
        /**
         * Public API: Get sync state
         */
        getSyncState();
        {
            return this.syncHandler.getSyncState();
        }
        /**
         * Public API: Apply remote update
         */
        applyRemoteUpdate(update, Uint8Array);
        void {
            this: .syncHandler.applyUpdate(update)
        };
        /**
         * Public API: Get document state for initial sync
         */
        getDocumentState();
        Uint8Array;
        {
            return this.syncHandler.getStateAsUpdate();
        }
        /**
         * Public API: Create snapshot
         */
        createSnapshot();
        Uint8Array;
        {
            return this.syncHandler.createSnapshot();
        }
        /**
         * Public API: Get performance metrics
         */
        getMetrics();
        {
            return {
                documentSize: this.syncHandler.getDocumentSize(),
                nodeCount: this.yGraph.getNodes().length,
                edgeCount: this.yGraph.getEdges().length,
                syncState: this.syncHandler.getSyncState(),
            };
        }
        /**
         * Cleanup resources
         */
        destroy();
        void {
            this: .syncHandler.destroy()
        };
    }
}
/**
 * Factory function to create collaborative graph adapter
 */
export function createCollaborativeGraph(options, initialGraph) {
    return new GraphCRDTAdapter(options, initialGraph);
}
