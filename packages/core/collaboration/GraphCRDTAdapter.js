"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphCRDTAdapter = void 0;
exports.createCollaborativeGraph = createCollaborativeGraph;
const graph_sync_1 = require("../../crdt-research/src/graph-sync");
class GraphCRDTAdapter {
    constructor(options, initialGraph) {
        this.isUpdating = false;
        this.options = options;
        this.syncHandler = new graph_sync_1.GraphSyncHandler(options.documentId, options.userId);
        this.yGraph = this.syncHandler.getGraph();
        this.currentGraph = initialGraph || { nodes: [], edges: [] };
        this.setupObservers();
        if (initialGraph) {
            this.importGraph(initialGraph);
        }
    }
    toCRDTNode(node) {
        return {
            id: node.id,
            type: node.type,
            position: this.extractPosition(node),
            data: this.extractNodeData(node),
            metadata: {
                originalType: node.type,
                inputs: node.inputs || [],
                ...this.extractNodeMetadata(node)
            }
        };
    }
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
    fromCRDTNode(crdtNode) {
        const baseNode = {
            id: crdtNode.id,
            type: crdtNode.type,
            inputs: crdtNode.metadata.inputs || []
        };
        switch (crdtNode.type) {
            case 'WeightedChoice':
                return {
                    ...baseNode,
                    type: 'WeightedChoice',
                    choices: crdtNode.data.choices || []
                };
            case 'Concat':
                return {
                    ...baseNode,
                    type: 'Concat'
                };
            case 'Output':
                return {
                    ...baseNode,
                    type: 'Output'
                };
            case 'SetVariable':
                return {
                    ...baseNode,
                    type: 'SetVariable',
                    variableName: crdtNode.data.variableName || '',
                    value: crdtNode.data.value || ''
                };
            case 'GetVariable':
                return {
                    ...baseNode,
                    type: 'GetVariable',
                    variableName: crdtNode.data.variableName || ''
                };
            case 'Include':
                return {
                    ...baseNode,
                    type: 'Include',
                    name: crdtNode.data.name || ''
                };
            default:
                return {
                    ...baseNode,
                    ...crdtNode.data
                };
        }
    }
    fromCRDTEdge(crdtEdge) {
        return {
            id: crdtEdge.id,
            source: crdtEdge.source,
            target: crdtEdge.target,
            sourceHandle: crdtEdge.sourceHandle,
            targetHandle: crdtEdge.targetHandle
        };
    }
    extractPosition(node) {
        return { x: 0, y: 0 };
    }
    extractNodeData(node) {
        const { id, type, inputs, ...data } = node;
        return data;
    }
    extractNodeMetadata(node) {
        return {
            created: Date.now(),
            lastModified: Date.now()
        };
    }
    extractEdgeMetadata(edge) {
        return {
            created: Date.now()
        };
    }
    setupObservers() {
        this.yGraph.observe((event) => {
            if (!this.isUpdating) {
                this.syncToGraph();
            }
        });
        this.syncHandler.onDocumentUpdate((update, origin) => {
            if (origin !== this.options.userId) {
                this.syncToGraph();
            }
        });
        this.syncHandler.onAwarenessChange((awareness) => {
            if (this.options.onUserPresence) {
                this.options.onUserPresence(awareness);
            }
        });
    }
    importGraph(graph) {
        this.isUpdating = true;
        try {
            const nodeMap = new Map();
            graph.nodes.forEach(node => nodeMap.set(node.id, node));
            graph.nodes.forEach(node => {
                const crdtNode = this.toCRDTNode(node);
                this.yGraph.addNode(crdtNode);
            });
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
    }
    syncToGraph() {
        const nodes = this.yGraph.getNodes().map(node => this.fromCRDTNode(node));
        const edges = this.yGraph.getEdges().map(edge => this.fromCRDTEdge(edge));
        this.currentGraph = { nodes, edges };
        if (this.options.onGraphChange) {
            this.options.onGraphChange(this.currentGraph);
        }
    }
    getGraph() {
        return { ...this.currentGraph };
    }
    addNode(node, position) {
        const crdtNode = this.toCRDTNode(node);
        if (position) {
            crdtNode.position = position;
        }
        this.isUpdating = true;
        this.yGraph.addNode(crdtNode);
        this.isUpdating = false;
        this.syncToGraph();
    }
    updateNode(nodeId, updates) {
        const existingNode = this.yGraph.getNode(nodeId);
        if (!existingNode)
            return;
        const crdtUpdates = {
            data: { ...existingNode.data, ...this.extractNodeData(updates) },
            metadata: { ...existingNode.metadata, lastModified: Date.now() }
        };
        this.isUpdating = true;
        this.yGraph.updateNode(nodeId, crdtUpdates);
        this.isUpdating = false;
        this.syncToGraph();
    }
    deleteNode(nodeId) {
        this.isUpdating = true;
        this.yGraph.deleteNode(nodeId);
        this.isUpdating = false;
        this.syncToGraph();
    }
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
    }
    deleteEdge(edgeId) {
        this.isUpdating = true;
        this.yGraph.deleteEdge(edgeId);
        this.isUpdating = false;
        this.syncToGraph();
    }
    updateNodePosition(nodeId, position) {
        this.isUpdating = true;
        this.yGraph.updateNode(nodeId, { position });
        this.isUpdating = false;
    }
    setUserPresence(presence) {
        this.syncHandler.setLocalPresence(presence);
    }
    getSyncState() {
        return this.syncHandler.getSyncState();
    }
    applyRemoteUpdate(update) {
        this.syncHandler.applyUpdate(update);
    }
    getDocumentState() {
        return this.syncHandler.getStateAsUpdate();
    }
    createSnapshot() {
        return this.syncHandler.createSnapshot();
    }
    getMetrics() {
        return {
            documentSize: this.syncHandler.getDocumentSize(),
            nodeCount: this.yGraph.getNodes().length,
            edgeCount: this.yGraph.getEdges().length,
            syncState: this.syncHandler.getSyncState()
        };
    }
    destroy() {
        this.syncHandler.destroy();
    }
}
exports.GraphCRDTAdapter = GraphCRDTAdapter;
function createCollaborativeGraph(options, initialGraph) {
    return new GraphCRDTAdapter(options, initialGraph);
}
//# sourceMappingURL=GraphCRDTAdapter.js.map