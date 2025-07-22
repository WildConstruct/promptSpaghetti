/**
 * Epic 23: Graph CRDT State Manager
 *
 * CRDT-based state management for collaborative graph editing using Yjs
 * Provides conflict-free operations with automatic synchronization
 */
import * as Y from 'yjs';
// =============================================================================
// Main GraphCRDT Class
// =============================================================================
/**
 * CRDT-based graph state manager with Yjs integration
 */
export class GraphCRDT {
    ydoc;
    nodes;
    edges;
    operations;
    metadata;
    documentId;
    clientId;
    userId;
    versionVector = {};
    // Event handlers
    onOperationApplied;
    onConflictDetected;
    onStateChanged;
    constructor(documentId, clientId, userId) {
        this.documentId = documentId;
        this.clientId = clientId;
        this.userId = userId;
        // Initialize Yjs document
        this.ydoc = new Y.Doc();
        this.nodes = this.ydoc.getMap('nodes');
        this.edges = this.ydoc.getMap('edges');
        this.operations = this.ydoc.getArray('operations');
        this.metadata = this.ydoc.getMap('metadata');
        // Initialize version vector
        this.versionVector[clientId] = 0;
        // Setup change handlers
        this.setupChangeHandlers();
        // Initialize metadata
        this.metadata.set('documentId', documentId);
        this.metadata.set('created', new Date().toISOString());
        this.metadata.set('lastModified', new Date().toISOString());
    }
    // =============================================================================
    // Event Handler Setup
    // =============================================================================
    /**
     * Setup change handlers for CRDT updates
     */
    setupChangeHandlers() {
        // Node changes
        this.nodes.observe((event) => {
            this.handleNodeChanges(event);
            this.updateMetadata();
        });
        // Edge changes
        this.edges.observe((event) => {
            this.handleEdgeChanges(event);
            this.updateMetadata();
        });
        // Operation changes
        this.operations.observe((event) => {
            this.handleOperationChanges(event);
        });
        // Document updates (for synchronization)
        this.ydoc.on('update', (update, origin) => {
            if (origin !== this) {
                this.onStateChanged?.(this.documentId);
            }
        });
    }
    /**
     * Handle node change events
     */
    handleNodeChanges(event) {
        event.changes.keys.forEach((change, key) => {
            if (change.action === 'add') {
                console.log(`Node added: ${key}`);
            }
            else if (change.action === 'update') {
                console.log(`Node updated: ${key}`);
            }
            else if (change.action === 'delete') {
                console.log(`Node deleted: ${key}`);
            }
        });
    }
    /**
     * Handle edge change events
     */
    handleEdgeChanges(event) {
        event.changes.keys.forEach((change, key) => {
            if (change.action === 'add') {
                console.log(`Edge added: ${key}`);
            }
            else if (change.action === 'update') {
                console.log(`Edge updated: ${key}`);
            }
            else if (change.action === 'delete') {
                console.log(`Edge deleted: ${key}`);
            }
        });
    }
    /**
     * Handle operation change events
     */
    handleOperationChanges(event) {
        event.changes.added.forEach((item) => {
            const operation = item.content.arr[0];
            console.log(`Operation recorded: ${operation.operationId}`);
        });
    }
    /**
     * Update document metadata
     */
    updateMetadata() {
        this.metadata.set('lastModified', new Date().toISOString());
        this.metadata.set('version', this.getVersion());
        this.metadata.set('nodeCount', this.nodes.size);
        this.metadata.set('edgeCount', this.edges.size);
    }
    // =============================================================================
    // Node Operations
    // =============================================================================
    /**
     * Add a new node to the graph
     */
    addNode(operation) {
        try {
            // Check if node already exists
            if (this.nodes.has(operation.nodeId)) {
                console.warn(`Node ${operation.nodeId} already exists`);
                return false;
            }
            const nodeCRDT = {
                id: operation.nodeId,
                type: operation.nodeType,
                position: operation.position,
                data: operation.initialData || {},
                inputs: [],
                metadata: {
                    version: 1,
                    lastModified: new Date(operation.timestamp).toISOString(),
                    modifiedBy: operation.userId,
                    created: new Date(operation.timestamp).toISOString(),
                    createdBy: operation.userId
                }
            };
            // Apply operation in transaction for atomicity
            this.ydoc.transact(() => {
                this.nodes.set(operation.nodeId, nodeCRDT);
                this.recordOperation(operation);
                this.incrementVersion();
            }, this);
            this.onOperationApplied?.(operation);
            return true;
        }
        catch (error) {
            console.error('Error adding node:', error);
            return false;
        }
    }
    /**
     * Update an existing node
     */
    updateNode(operation) {
        try {
            const existingNode = this.nodes.get(operation.nodeId);
            if (!existingNode) {
                console.warn(`Node ${operation.nodeId} not found for update`);
                return false;
            }
            // Deep clone the node to avoid mutation
            const updatedNode = JSON.parse(JSON.stringify(existingNode));
            // Apply property update using path
            const targetObj = this.getNestedProperty(updatedNode, operation.propertyPath.slice(0, -1));
            const finalKey = operation.propertyPath[operation.propertyPath.length - 1];
            if (targetObj && finalKey) {
                targetObj[finalKey] = operation.newValue;
                // Update metadata
                updatedNode.metadata.version += 1;
                updatedNode.metadata.lastModified = new Date(operation.timestamp).toISOString();
                updatedNode.metadata.modifiedBy = operation.userId;
                // Apply update in transaction
                this.ydoc.transact(() => {
                    this.nodes.set(operation.nodeId, updatedNode);
                    this.recordOperation(operation);
                    this.incrementVersion();
                }, this);
                this.onOperationApplied?.(operation);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error updating node:', error);
            return false;
        }
    }
    /**
     * Remove a node from the graph
     */
    removeNode(operation) {
        try {
            const existingNode = this.nodes.get(operation.nodeId);
            if (!existingNode) {
                console.warn(`Node ${operation.nodeId} not found for removal`);
                return false;
            }
            // Apply removal in transaction
            this.ydoc.transact(() => {
                // Remove the node
                this.nodes.delete(operation.nodeId);
                // Handle edge cleanup if cascadeDelete is true
                if (operation.cascadeDelete) {
                    this.removeNodeEdges(operation.nodeId);
                }
                this.recordOperation(operation);
                this.incrementVersion();
            }, this);
            this.onOperationApplied?.(operation);
            return true;
        }
        catch (error) {
            console.error('Error removing node:', error);
            return false;
        }
    }
    // =============================================================================
    // Edge Operations
    // =============================================================================
    /**
     * Add a new edge to the graph
     */
    addEdge(operation) {
        try {
            // Check if edge already exists
            if (this.edges.has(operation.edgeId)) {
                console.warn(`Edge ${operation.edgeId} already exists`);
                return false;
            }
            // Validate source and target nodes exist
            if (!this.nodes.has(operation.sourceNodeId) || !this.nodes.has(operation.targetNodeId)) {
                console.warn(`Source or target node not found for edge ${operation.edgeId}`);
                return false;
            }
            // Check for circular dependencies
            if (this.wouldCreateCycle(operation.sourceNodeId, operation.targetNodeId)) {
                console.warn(`Edge ${operation.edgeId} would create a circular dependency`);
                return false;
            }
            const edgeCRDT = {
                id: operation.edgeId,
                sourceNodeId: operation.sourceNodeId,
                targetNodeId: operation.targetNodeId,
                sourcePort: operation.sourcePort,
                targetPort: operation.targetPort,
                type: operation.edgeType,
                metadata: {
                    version: 1,
                    lastModified: new Date(operation.timestamp).toISOString(),
                    modifiedBy: operation.userId,
                    created: new Date(operation.timestamp).toISOString(),
                    createdBy: operation.userId,
                    ...operation.metadata
                }
            };
            // Apply operation in transaction
            this.ydoc.transact(() => {
                this.edges.set(operation.edgeId, edgeCRDT);
                // Update target node's inputs array
                const targetNode = this.nodes.get(operation.targetNodeId);
                if (targetNode) {
                    const updatedTargetNode = { ...targetNode };
                    updatedTargetNode.inputs = [...targetNode.inputs, operation.sourceNodeId];
                    updatedTargetNode.metadata.lastModified = new Date(operation.timestamp).toISOString();
                    updatedTargetNode.metadata.version += 1;
                    this.nodes.set(operation.targetNodeId, updatedTargetNode);
                }
                this.recordOperation(operation);
                this.incrementVersion();
            }, this);
            this.onOperationApplied?.(operation);
            return true;
        }
        catch (error) {
            console.error('Error adding edge:', error);
            return false;
        }
    }
    /**
     * Update an existing edge
     */
    updateEdge(operation) {
        try {
            const existingEdge = this.edges.get(operation.edgeId);
            if (!existingEdge) {
                console.warn(`Edge ${operation.edgeId} not found for update`);
                return false;
            }
            const updatedEdge = { ...existingEdge };
            updatedEdge[operation.property] = operation.newValue;
            updatedEdge.metadata.version += 1;
            updatedEdge.metadata.lastModified = new Date(operation.timestamp).toISOString();
            updatedEdge.metadata.modifiedBy = operation.userId;
            // Apply update in transaction
            this.ydoc.transact(() => {
                this.edges.set(operation.edgeId, updatedEdge);
                this.recordOperation(operation);
                this.incrementVersion();
            }, this);
            this.onOperationApplied?.(operation);
            return true;
        }
        catch (error) {
            console.error('Error updating edge:', error);
            return false;
        }
    }
    /**
     * Remove an edge from the graph
     */
    removeEdge(operation) {
        try {
            const existingEdge = this.edges.get(operation.edgeId);
            if (!existingEdge) {
                console.warn(`Edge ${operation.edgeId} not found for removal`);
                return false;
            }
            // Apply removal in transaction
            this.ydoc.transact(() => {
                this.edges.delete(operation.edgeId);
                // Update target node's inputs array
                const targetNode = this.nodes.get(operation.targetNodeId);
                if (targetNode) {
                    const updatedTargetNode = { ...targetNode };
                    updatedTargetNode.inputs = targetNode.inputs.filter(id => id !== operation.sourceNodeId);
                    updatedTargetNode.metadata.lastModified = new Date(operation.timestamp).toISOString();
                    updatedTargetNode.metadata.version += 1;
                    this.nodes.set(operation.targetNodeId, updatedTargetNode);
                }
                this.recordOperation(operation);
                this.incrementVersion();
            }, this);
            this.onOperationApplied?.(operation);
            return true;
        }
        catch (error) {
            console.error('Error removing edge:', error);
            return false;
        }
    }
    // =============================================================================
    // Parameter Operations
    // =============================================================================
    /**
     * Update node parameters
     */
    updateParameter(operation) {
        try {
            const existingNode = this.nodes.get(operation.nodeId);
            if (!existingNode) {
                console.warn(`Node ${operation.nodeId} not found for parameter update`);
                return false;
            }
            const updatedNode = JSON.parse(JSON.stringify(existingNode));
            // Apply parameter update
            const paramPath = operation.parameterPath || [operation.parameterKey];
            const targetObj = this.getNestedProperty(updatedNode.data, paramPath.slice(0, -1));
            const finalKey = paramPath[paramPath.length - 1];
            if (targetObj && finalKey) {
                targetObj[finalKey] = operation.newValue;
                // Update metadata
                updatedNode.metadata.version += 1;
                updatedNode.metadata.lastModified = new Date(operation.timestamp).toISOString();
                updatedNode.metadata.modifiedBy = operation.userId;
                // Apply update in transaction
                this.ydoc.transact(() => {
                    this.nodes.set(operation.nodeId, updatedNode);
                    this.recordOperation(operation);
                    this.incrementVersion();
                }, this);
                this.onOperationApplied?.(operation);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error updating parameter:', error);
            return false;
        }
    }
    // =============================================================================
    // Utility Methods
    // =============================================================================
    /**
     * Get nested property from object using path array
     */
    getNestedProperty(obj, path) {
        return path.reduce((current, key) => {
            return current && typeof current === 'object' ? current[key] : undefined;
        }, obj);
    }
    /**
     * Check if adding an edge would create a cycle
     */
    wouldCreateCycle(sourceId, targetId) {
        const visited = new Set();
        const stack = [targetId];
        while (stack.length > 0) {
            const currentId = stack.pop();
            if (currentId === sourceId) {
                return true; // Cycle detected
            }
            if (visited.has(currentId)) {
                continue;
            }
            visited.add(currentId);
            // Add all nodes that this node connects to
            this.edges.forEach((edge) => {
                if (edge.sourceNodeId === currentId) {
                    stack.push(edge.targetNodeId);
                }
            });
        }
        return false;
    }
    /**
     * Remove all edges connected to a node
     */
    removeNodeEdges(nodeId) {
        const edgesToRemove = [];
        this.edges.forEach((edge, edgeId) => {
            if (edge.sourceNodeId === nodeId || edge.targetNodeId === nodeId) {
                edgesToRemove.push(edgeId);
            }
        });
        edgesToRemove.forEach(edgeId => {
            this.edges.delete(edgeId);
        });
    }
    /**
     * Record operation in history
     */
    recordOperation(operation) {
        const record = {
            operationId: operation.operationId,
            type: operation.type,
            nodeId: 'nodeId' in operation ? operation.nodeId : undefined,
            edgeId: 'edgeId' in operation ? operation.edgeId : undefined,
            timestamp: operation.timestamp,
            userId: operation.userId,
            applied: true,
            reverted: false,
            conflicted: false
        };
        this.operations.push([record]);
    }
    /**
     * Increment version vector for this client
     */
    incrementVersion() {
        this.versionVector[this.clientId] = (this.versionVector[this.clientId] || 0) + 1;
        this.metadata.set('versionVector', this.versionVector);
    }
    /**
     * Get current document version
     */
    getVersion() {
        return Object.values(this.versionVector).reduce((sum, version) => sum + version, 0);
    }
    /**
     * Get document state as standard Graph object
     */
    getGraph() {
        const nodes = [];
        this.nodes.forEach((nodeCRDT) => {
            const node = {
                id: nodeCRDT.id,
                type: nodeCRDT.type,
                inputs: nodeCRDT.inputs,
                ...nodeCRDT.data
            };
            nodes.push(node);
        });
        return {
            nodes,
            seed: this.metadata.get('seed')
        };
    }
    /**
     * Get all edges as array
     */
    getEdges() {
        const edges = [];
        this.edges.forEach((edgeCRDT) => {
            const edge = {
                id: edgeCRDT.id,
                sourceNodeId: edgeCRDT.sourceNodeId,
                targetNodeId: edgeCRDT.targetNodeId,
                sourcePort: edgeCRDT.sourcePort,
                targetPort: edgeCRDT.targetPort,
                type: edgeCRDT.type,
                metadata: { ...edgeCRDT.metadata }
            };
            edges.push(edge);
        });
        return edges;
    }
    /**
     * Get operation history
     */
    getOperationHistory() {
        return this.operations.toArray();
    }
    /**
     * Get document metadata
     */
    getMetadata() {
        const metadata = {};
        this.metadata.forEach((value, key) => {
            metadata[key] = value;
        });
        return metadata;
    }
    /**
     * Calculate document checksum for integrity verification
     */
    calculateChecksum() {
        const nodeData = JSON.stringify(Array.from(this.nodes.entries()).sort());
        const edgeData = JSON.stringify(Array.from(this.edges.entries()).sort());
        return this.hashString(nodeData + edgeData);
    }
    /**
     * Simple hash function for checksums
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }
    /**
     * Set event handlers
     */
    setEventHandlers(handlers) {
        this.onOperationApplied = handlers.onOperationApplied;
        this.onConflictDetected = handlers.onConflictDetected;
        this.onStateChanged = handlers.onStateChanged;
    }
    /**
     * Get Yjs document for synchronization
     */
    getYDoc() {
        return this.ydoc;
    }
    /**
     * Apply update from another client
     */
    applyUpdate(update, origin) {
        Y.applyUpdate(this.ydoc, update, origin);
    }
    /**
     * Get document state as update
     */
    getStateAsUpdate() {
        return Y.encodeStateAsUpdate(this.ydoc);
    }
    /**
     * Dispose of the CRDT instance
     */
    dispose() {
        this.ydoc.destroy();
    }
}
export default GraphCRDT;
