/**
 * Optimized graph storage with hybrid Map/Array architecture
 */
export class OptimizedGraphStorage {
    nodeMap = new Map();
    edgeMap = new Map();
    indexes;
    dirty = new Set(); // Track changed nodes
    version = 0; // For cache invalidation
    // Cached arrays for React-Flow compatibility
    cachedNodes = null;
    cachedEdges = null;
    cacheVersion = -1;
    constructor(initialNodes = [], initialEdges = []) {
        this.indexes = this.createEmptyIndexes();
        this.loadData(initialNodes, initialEdges);
        /**
         * Get nodes array (React-Flow compatible) - lazily computed and cached
         */
        get;
        nodes();
        Node;
        {
            if (this.cachedNodes === null || this.cacheVersion !== this.version) {
                this.cachedNodes = Array.from(this.nodeMap.values());
                this.cacheVersion = this.version;
                return this.cachedNodes;
                /**
                 * Get edges array (React-Flow compatible) - lazily computed and cached
                 */
                get;
                edges();
                Edge;
                {
                    if (this.cachedEdges === null || this.cacheVersion !== this.version) {
                        this.cachedEdges = Array.from(this.edgeMap.values());
                        this.cacheVersion = this.version;
                        return this.cachedEdges;
                        /**
                         * O(1) node lookup
                         */
                        getNode(nodeId, string);
                        Node | undefined;
                        {
                            return this.nodeMap.get(nodeId);
                            /**
                             * O(1) edge lookup
                             */
                            getEdge(edgeId, string);
                            Edge | undefined;
                            {
                                return this.edgeMap.get(edgeId);
                                /**
                                 * Add node with automatic indexing
                                 */
                                addNode(node, Node);
                                void {
                                    this: .nodeMap.set(node.id, node),
                                    this: .updateNodeIndexes(node, 'add'),
                                    this: .markDirty(node.id),
                                    this: .invalidateCache(),
                                    /**
                                     * Add edge with automatic indexing
                                     */
                                    addEdge(edge) {
                                        this.edgeMap.set(edge.id, edge);
                                        this.updateEdgeIndexes(edge, 'add');
                                        this.invalidateCache();
                                        /**
                                         * Update node with partial data
                                         */
                                        updateNode(nodeId, string, updates, (Partial));
                                        boolean;
                                        {
                                            const existing = this.nodeMap.get(nodeId);
                                            if (!existing)
                                                return false;
                                            const updated = { ...existing, ...updates };
                                            // Update indexes if type changed
                                            if (updates.type && updates.type !== existing.type) {
                                                this.updateNodeIndexes(existing, 'remove');
                                                this.updateNodeIndexes(updated, 'add');
                                                this.nodeMap.set(nodeId, updated);
                                                this.markDirty(nodeId);
                                                this.invalidateCache();
                                                return true;
                                                /**
                                                * Remove node and all connected edges
                                                */
                                                removeNode(nodeId, string);
                                                boolean;
                                                {
                                                    const node = this.nodeMap.get(nodeId);
                                                    if (!node)
                                                        return false;
                                                    // Remove all connected edges
                                                    const connectedEdges = [];
                                                }
                                            }
                                        }
                                    },
                                    ...(this.indexes.incomingEdges.get(nodeId) || []),
                                    ...(this.indexes.outgoingEdges.get(nodeId) || []),
                                    connectedEdges, : .forEach(edge => this.removeEdge(edge.id)),
                                    // Remove node and update indexes
                                    this: .nodeMap.delete(nodeId),
                                    this: .updateNodeIndexes(node, 'remove'),
                                    this: .dirty.delete(nodeId),
                                    this: .invalidateCache(),
                                    return: true,
                                    /**
                                    * Remove edge
                                    */
                                    removeEdge(edgeId) {
                                        const edge = this.edgeMap.get(edgeId);
                                        if (!edge)
                                            return false;
                                        this.edgeMap.delete(edgeId);
                                        this.updateEdgeIndexes(edge, 'remove');
                                        this.invalidateCache();
                                        return true;
                                        /**
                                        * Get nodes by type - O(1) lookup
                                        */
                                        getNodesByType(type, NodeType);
                                        Node;
                                        {
                                            const nodeIds = this.indexes.nodesByType.get(type);
                                            if (!nodeIds)
                                                return [];
                                            return Array.from(nodeIds).map(id => this.nodeMap.get(id)).filter(Boolean);
                                            /**
                                            * Get incoming edges for a node - O(1) lookup
                                            */
                                            getIncomingEdges(nodeId, string);
                                            Edge;
                                            {
                                                return this.indexes.incomingEdges.get(nodeId) || [];
                                                /**
                                                * Get outgoing edges for a node - O(1) lookup
                                                */
                                                getOutgoingEdges(nodeId, string);
                                                Edge;
                                                {
                                                    return this.indexes.outgoingEdges.get(nodeId) || [];
                                                    /**
                                                    * Get graph statistics
                                                    */
                                                    getStats();
                                                    {
                                                        nodeCount: number;
                                                        edgeCount: number;
                                                        nodeTypes: Record;
                                                        connectivityStats: {
                                                            leafNodes: number;
                                                            rootNodes: number;
                                                            isolatedNodes: number;
                                                            averageConnections: number;
                                                        }
                                                        ;
                                                        memoryUsage: {
                                                            estimatedBytes: number;
                                                            cacheHitRatio ?  : number;
                                                        }
                                                        ;
                                                        const nodeTypes = {};
                                                        for (const [type, nodeSet] of this.indexes.nodesByType) {
                                                            nodeTypes[type] = nodeSet.size;
                                                            const totalConnections = Array.from(this.nodeMap.keys());
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    : 
                                        .reduce((sum, nodeId) => {
                                        return sum + this.getIncomingEdges(nodeId).length + this.getOutgoingEdges(nodeId).length;
                                    }, 0),
                                    return: {
                                        nodeCount: this.nodeMap.size,
                                        edgeCount: this.edgeMap.size,
                                        nodeTypes,
                                        connectivityStats: {
                                            leafNodes: this.indexes.leafNodes.size,
                                            rootNodes: this.indexes.rootNodes.size,
                                            isolatedNodes: this.indexes.isolatedNodes.size,
                                            averageConnections: this.nodeMap.size > 0 ? totalConnections / this.nodeMap.size : 0,
                                        },
                                        memoryUsage: {
                                            estimatedBytes: this.estimateMemoryUsage(),
                                        },
                                        /**
                                         * Serialize to compressed format for storage
                                         */
                                        toCompressedFormat() {
                                            const nodeCount = this.nodeMap.size;
                                            const edgeCount = this.edgeMap.size;
                                            // Use compression for large graphs (>1000 nodes or >2MB estimated)
                                            const estimatedSize = this.estimateMemoryUsage();
                                            const shouldCompress = nodeCount > 1000 || estimatedSize > 2 * 1024 * 1024;
                                            if (!shouldCompress) {
                                                // Return regular format for small graphs
                                                return {
                                                    nodes: this.nodes,
                                                    edges: this.edges,
                                                };
                                                try {
                                                    // Compress node and edge data
                                                    const nodeData = this.compressNodes();
                                                    const edgeData = this.compressEdges();
                                                    const compressionRatio = (nodeData.length + edgeData.length) / estimatedSize;
                                                    return {
                                                        format_version: '2.0.0',
                                                        compressed: true,
                                                        node_data: nodeData,
                                                        edge_data: edgeData,
                                                        metadata: {
                                                            node_count: nodeCount,
                                                            edge_count: edgeCount,
                                                            compression_ratio: compressionRatio,
                                                            original_size: estimatedSize,
                                                        }
                                                    };
                                                    try { }
                                                    catch (error) {
                                                        console.warn('Compression failed, falling back to regular format:', error);
                                                        return {
                                                            nodes: this.nodes,
                                                            edges: this.edges,
                                                        };
                                                        /**
                                                         * Load from regular or compressed format
                                                         */
                                                    }
                                                    /**
                                                     * Load from regular or compressed format
                                                     */
                                                }
                                                /**
                                                 * Load from regular or compressed format
                                                 */
                                                finally {
                                                }
                                                /**
                                                 * Load from regular or compressed format
                                                 */
                                            }
                                            /**
                                             * Load from regular or compressed format
                                             */
                                        }
                                        /**
                                         * Load from regular or compressed format
                                         */
                                        ,
                                        /**
                                         * Load from regular or compressed format
                                         */
                                        static fromStorageFormat(data) {
                                            if (data.compressed && data.format_version === '2.0.0') {
                                                return OptimizedGraphStorage.fromCompressed(data);
                                                // Regular format
                                                return new OptimizedGraphStorage(data.nodes || [], data.edges || []);
                                                /**
                                                * Load from compressed format
                                                */
                                            }
                                            /**
                                            * Load from compressed format
                                            */
                                        }
                                        /**
                                        * Load from compressed format
                                        */
                                        ,
                                        /**
                                        * Load from compressed format
                                        */
                                        static fromCompressed(compressed) {
                                            try {
                                                const nodes = OptimizedGraphStorage.decompressNodes(compressed.node_data);
                                                const edges = OptimizedGraphStorage.decompressEdges(compressed.edge_data);
                                                return new OptimizedGraphStorage(nodes, edges);
                                            }
                                            catch (error) {
                                                console.error('Failed to decompress graph data:', error);
                                                throw new Error('Invalid compressed graph data');
                                                /**
                                                * Get dirty nodes for incremental saves
                                                */
                                                getDirtyNodes();
                                                Node;
                                                {
                                                    return Array.from(this.dirty).map(id => this.nodeMap.get(id)).filter(Boolean);
                                                    /**
                                                    * Mark all nodes as clean (after successful save)
                                                    */
                                                    markClean();
                                                    void {
                                                        this: .dirty.clear(),
                                                        // Private methods
                                                        createEmptyIndexes() {
                                                            return {
                                                                nodesByType: new Map(),
                                                                edgesBySource: new Map(),
                                                                edgesByTarget: new Map(),
                                                                incomingEdges: new Map(),
                                                                outgoingEdges: new Map(),
                                                                leafNodes: new Set(),
                                                                rootNodes: new Set(),
                                                                isolatedNodes: new Set(),
                                                            };
                                                        },
                                                        loadData(nodes, edges) {
                                                            // Clear existing data
                                                            this.nodeMap.clear();
                                                            this.edgeMap.clear();
                                                            this.indexes = this.createEmptyIndexes();
                                                            // Load nodes
                                                            nodes.forEach(node => { });
                                                            this.nodeMap.set(node.id, node);
                                                            this.updateNodeIndexes(node, 'add');
                                                        },
                                                        // Load edges
                                                        edges, : .forEach(edge => { }),
                                                        this: .edgeMap.set(edge.id, edge),
                                                        this: .updateEdgeIndexes(edge, 'add') };
                                                    ;
                                                    this.invalidateCache();
                                                }
                                            }
                                        },
                                        updateNodeIndexes(node, operation) {
                                            const nodeType = node.data?.type || node.type;
                                            if (operation === 'add') {
                                                // Add to type index
                                                if (!this.indexes.nodesByType.has(nodeType)) {
                                                    this.indexes.nodesByType.set(nodeType, new Set());
                                                    this.indexes.nodesByType.get(nodeType).add(node.id);
                                                    // Update connectivity indexes
                                                    this.updateConnectivityIndexes(node.id);
                                                }
                                                else {
                                                    // Remove from type index
                                                    this.indexes.nodesByType.get(nodeType)?.delete(node.id);
                                                    if (this.indexes.nodesByType.get(nodeType)?.size === 0) {
                                                        this.indexes.nodesByType.delete(nodeType);
                                                        // Remove from connectivity indexes
                                                        this.indexes.leafNodes.delete(node.id);
                                                        this.indexes.rootNodes.delete(node.id);
                                                        this.indexes.isolatedNodes.delete(node.id);
                                                    }
                                                }
                                            }
                                        },
                                        updateEdgeIndexes(edge, operation) {
                                            if (operation === 'add') {
                                                // Update source/target indexes
                                                this.addToSetMap(this.indexes.edgesBySource, edge.source, edge.id);
                                                this.addToSetMap(this.indexes.edgesByTarget, edge.target, edge.id);
                                                // Update incoming/outgoing edge lists
                                                this.addToArrayMap(this.indexes.incomingEdges, edge.target, edge);
                                                this.addToArrayMap(this.indexes.outgoingEdges, edge.source, edge);
                                                // Update connectivity for affected nodes
                                                this.updateConnectivityIndexes(edge.source);
                                                this.updateConnectivityIndexes(edge.target);
                                            }
                                            else {
                                                // Remove from indexes
                                                this.removeFromSetMap(this.indexes.edgesBySource, edge.source, edge.id);
                                                this.removeFromSetMap(this.indexes.edgesByTarget, edge.target, edge.id);
                                                this.removeFromArrayMap(this.indexes.incomingEdges, edge.target, edge);
                                                this.removeFromArrayMap(this.indexes.outgoingEdges, edge.source, edge);
                                                // Update connectivity for affected nodes
                                                this.updateConnectivityIndexes(edge.source);
                                                this.updateConnectivityIndexes(edge.target);
                                            }
                                        },
                                        updateConnectivityIndexes(nodeId) {
                                            const hasIncoming = (this.indexes.incomingEdges.get(nodeId)?.length || 0) > 0;
                                            const hasOutgoing = (this.indexes.outgoingEdges.get(nodeId)?.length || 0) > 0;
                                            // Update connectivity sets
                                            if (!hasIncoming && !hasOutgoing) {
                                                this.indexes.isolatedNodes.add(nodeId);
                                                this.indexes.leafNodes.delete(nodeId);
                                                this.indexes.rootNodes.delete(nodeId);
                                            }
                                            else if (!hasIncoming) {
                                                this.indexes.rootNodes.add(nodeId);
                                                this.indexes.leafNodes.delete(nodeId);
                                                this.indexes.isolatedNodes.delete(nodeId);
                                            }
                                            else if (!hasOutgoing) {
                                                this.indexes.leafNodes.add(nodeId);
                                                this.indexes.rootNodes.delete(nodeId);
                                                this.indexes.isolatedNodes.delete(nodeId);
                                            }
                                            else {
                                                this.indexes.leafNodes.delete(nodeId);
                                                this.indexes.rootNodes.delete(nodeId);
                                                this.indexes.isolatedNodes.delete(nodeId);
                                            }
                                        },
                                        addToSetMap(map, key, value) {
                                            if (!map.has(key)) {
                                                map.set(key, new Set());
                                                map.get(key).add(value);
                                            }
                                        },
                                        removeFromSetMap(map, key, value) {
                                            const set = map.get(key);
                                            if (set) {
                                                set.delete(value);
                                                if (set.size === 0) {
                                                    map.delete(key);
                                                }
                                            }
                                        },
                                        addToArrayMap(map, key, value) {
                                            if (!map.has(key)) {
                                                map.set(key, []);
                                                map.get(key).push(value);
                                            }
                                        },
                                        removeFromArrayMap(map, key, value) {
                                            const array = map.get(key);
                                            if (array) {
                                                const index = array.indexOf(value);
                                                if (index !== -1) {
                                                    array.splice(index, 1);
                                                    if (array.length === 0) {
                                                        map.delete(key);
                                                    }
                                                }
                                            }
                                        },
                                        markDirty(nodeId) {
                                            this.dirty.add(nodeId);
                                        },
                                        invalidateCache() {
                                            this.cachedNodes = null;
                                            this.cachedEdges = null;
                                            this.version++;
                                        },
                                        estimateMemoryUsage() {
                                            let size = 0;
                                            // Estimate node memory usage
                                            this.nodeMap.forEach(node => { });
                                            size += JSON.stringify(node).length * 2; // Rough estimate (UTF-16)
                                        },
                                        // Estimate edge memory usage
                                        this: .edgeMap.forEach(edge => { }),
                                        size, JSON, : .stringify(edge).length * 2
                                    },
                                    return: size,
                                    compressNodes() {
                                        const nodeArray = Array.from(this.nodeMap.values());
                                        const jsonString = JSON.stringify(nodeArray);
                                        return new TextEncoder().encode(jsonString);
                                    },
                                    compressEdges() {
                                        const edgeArray = Array.from(this.edgeMap.values());
                                        const jsonString = JSON.stringify(edgeArray);
                                        return new TextEncoder().encode(jsonString);
                                    },
                                    static decompressNodes(data) {
                                        const jsonString = new TextDecoder().decode(data);
                                        return JSON.parse(jsonString);
                                    },
                                    static decompressEdges(data) {
                                        const jsonString = new TextDecoder().decode(data);
                                        return JSON.parse(jsonString);
                                    }
                                };
                            }
                        }
                    }
                }
            }
        }
    }
}
