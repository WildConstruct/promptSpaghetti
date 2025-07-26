// packages/core/services/GraphSharingService.ts
// Epic 8.7 Task 5: Graph Sharing System with Complete Annotations
// Graph sharing service
export class GraphSharingService {
    static instance;
    sharedGraphs = new Map();
    static getInstance() {
        if (!GraphSharingService.instance) {
            GraphSharingService.instance = new GraphSharingService();
        }
        return GraphSharingService.instance;
    }
    /**
     * Export graph with all annotations for sharing
     */
    async exportForSharing(nodes, edges, annotations = {}, metadata = {}, options) {
        const exportId = this.generateExportId();
        const timestamp = new Date().toISOString();
        // Extract connection labels from annotated edges
        const connectionLabels = edges
            .filter(edge => edge.label && edge.label.trim().length > 0)
            .map(edge => ({
            edgeId: edge.id,
            label: edge.label,
            style: edge.labelStyle,
            position: {
                type: edge.labelPosition,
                offset: edge.labelOffset
            },
            visible: edge.showLabel ?? true
        }));
        const sharedGraph = {
            metadata: {
                exportId,
                version: '1.0.0',
                timestamp,
                title: metadata.title || 'Untitled Graph',
                description: metadata.description,
                author: options.author,
                versionControl: {
                    version: 1,
                    changes: ['Initial share'],
                    tags: metadata.versionControl?.tags || [],
                    branch: metadata.versionControl?.branch || 'main'
                },
                sharing: {
                    permissions: options.permissions || 'read_only',
                    collaborators: [],
                    shareUrl: this.generateShareUrl(exportId)
                }
            },
            graph: {
                nodes: this.sanitizeNodes(nodes),
                edges: this.sanitizeEdges(edges),
                settings: {
                    canvasPosition: { x: 0, y: 0, zoom: 1 },
                    gridVisible: true,
                    snapToGrid: false,
                    readonly: options.permissions === 'read_only'
                }
            },
            annotations: {
                connectionLabels,
                stickyNotes: annotations.stickyNotes || [],
                nodeLabels: this.extractNodeLabels(nodes),
                regions: annotations.regions || [],
                comments: options.includeComments ? (annotations.comments || []) : []
            },
            collaboration: {
                changeHistory: options.includeHistory ? [] : [],
                conflicts: [],
                lastSync: timestamp,
                syncStatus: 'synced'
            },
            compatibility: {
                minVersion: '1.0.0',
                features: [
                    'connection-labels',
                    'sticky-notes',
                    'node-annotations',
                    'region-grouping',
                    'collaboration',
                    'version-control'
                ],
                warnings: [],
                errors: []
            }
        };
        // Store for later retrieval
        this.sharedGraphs.set(exportId, sharedGraph);
        return sharedGraph;
    }
    /**
     * Import shared graph with validation
     */
    async importSharedGraph(sharedGraph, options = {}) {
        const errors = [];
        const warnings = [];
        try {
            // Validate format version compatibility
            const validation = this.validateSharedGraph(sharedGraph);
            if (!validation.valid) {
                errors.push(...validation.errors);
                warnings.push(...validation.warnings);
            }
            // Import graph structure
            const nodes = await this.importNodes(sharedGraph.graph.nodes);
            const edges = await this.importEdges(sharedGraph.graph.edges, sharedGraph.annotations.connectionLabels);
            // Restore annotations if requested
            let annotations = sharedGraph.annotations;
            if (!options.preserveAnnotations) {
                annotations = {
                    connectionLabels: sharedGraph.annotations.connectionLabels,
                    stickyNotes: [],
                    nodeLabels: [],
                    regions: [],
                    comments: []
                };
            }
            return {
                success: errors.length === 0,
                graph: { nodes, edges },
                annotations,
                errors: errors.length > 0 ? errors : undefined,
                warnings: warnings.length > 0 ? warnings : undefined
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [error instanceof Error ? error.message : 'Unknown import error']
            };
        }
    }
    /**
     * Validate shared graph format and integrity
     */
    validateSharedGraph(sharedGraph) {
        const errors = [];
        const warnings = [];
        // Check required fields
        if (!sharedGraph.metadata?.exportId) {
            errors.push('Missing export ID');
        }
        if (!sharedGraph.metadata?.version) {
            errors.push('Missing format version');
        }
        if (!sharedGraph.graph?.nodes) {
            errors.push('Missing graph nodes');
        }
        if (!sharedGraph.graph?.edges) {
            errors.push('Missing graph edges');
        }
        // Validate graph integrity
        if (sharedGraph.graph?.nodes && sharedGraph.graph?.edges) {
            const nodeIds = new Set(sharedGraph.graph.nodes.map(n => n.id));
            // Check edge references
            for (const edge of sharedGraph.graph.edges) {
                if (!nodeIds.has(edge.source)) {
                    errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
                }
                if (!nodeIds.has(edge.target)) {
                    errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
                }
            }
            // Validate annotation references
            for (const label of sharedGraph.annotations?.connectionLabels || []) {
                const edgeExists = sharedGraph.graph.edges.some(e => e.id === label.edgeId);
                if (!edgeExists) {
                    warnings.push(`Connection label references non-existent edge: ${label.edgeId}`);
                }
            }
            for (const nodeLabel of sharedGraph.annotations?.nodeLabels || []) {
                if (!nodeIds.has(nodeLabel.nodeId)) {
                    warnings.push(`Node label references non-existent node: ${nodeLabel.nodeId}`);
                }
            }
        }
        // Version compatibility check
        const version = sharedGraph.metadata?.version || '0.0.0';
        const [major, minor] = version.split('.').map(Number);
        if (major > 1) {
            errors.push(`Unsupported major version: ${version}`);
        }
        else if (major === 1 && minor > 0) {
            warnings.push(`Newer minor version detected: ${version}. Some features may not be available.`);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Create a new version of a shared graph
     */
    async createVersion(baseGraph, changes) {
        const newVersion = {
            ...baseGraph,
            metadata: {
                ...baseGraph.metadata,
                exportId: this.generateExportId(),
                timestamp: new Date().toISOString(),
                versionControl: {
                    ...baseGraph.metadata.versionControl,
                    version: baseGraph.metadata.versionControl.version + 1,
                    previousVersion: baseGraph.metadata.exportId,
                    changes: [
                        ...baseGraph.metadata.versionControl.changes,
                        changes.changeDescription
                    ]
                }
            },
            graph: {
                ...baseGraph.graph,
                nodes: changes.nodes || baseGraph.graph.nodes,
                edges: changes.edges || baseGraph.graph.edges
            },
            annotations: {
                ...baseGraph.annotations,
                ...changes.annotations
            },
            collaboration: {
                ...baseGraph.collaboration,
                changeHistory: [
                    ...baseGraph.collaboration.changeHistory,
                    {
                        id: this.generateChangeId(),
                        timestamp: new Date().toISOString(),
                        author: changes.author.name,
                        operation: 'version_update',
                        target: 'graph',
                        description: changes.changeDescription
                    }
                ],
                lastSync: new Date().toISOString()
            }
        };
        // Store new version
        this.sharedGraphs.set(newVersion.metadata.exportId, newVersion);
        return newVersion;
    }
    /**
     * Generate shareable URL for a graph
     */
    generateShareUrl(exportId) {
        // In production, this would generate a proper URL
        return `https://wild-construct.app/shared/${exportId}`;
    }
    /**
     * Sanitize nodes for sharing (remove sensitive data)
     */
    sanitizeNodes(nodes) {
        return nodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                // Remove any sensitive or internal data
                _internal: undefined,
                _private: undefined
            }
        }));
    }
    /**
     * Sanitize edges for sharing
     */
    sanitizeEdges(edges) {
        return edges.map(edge => ({
            ...edge,
            // Ensure all annotation data is preserved
            label: edge.label,
            labelStyle: edge.labelStyle,
            labelPosition: edge.labelPosition,
            labelOffset: edge.labelOffset,
            showLabel: edge.showLabel,
            interactive: edge.interactive
        }));
    }
    /**
     * Extract node labels from node data
     */
    extractNodeLabels(nodes) {
        return nodes.map(node => ({
            nodeId: node.id,
            label: node.data?.label,
            description: node.data?.description,
            tags: Array.isArray(node.data?.tags) ? node.data.tags : [],
            color: node.data?.color,
            notes: node.data?.notes
        })).filter(label => label.label || label.description || label.tags.length > 0 || label.notes);
    }
    /**
     * Import nodes with annotation restoration
     */
    async importNodes(nodes) {
        // In a real implementation, this might involve validation,
        // ID remapping, or other import-specific processing
        return nodes;
    }
    /**
     * Import edges with label restoration
     */
    async importEdges(edges, connectionLabels) {
        // Create a map for quick label lookup
        const labelMap = new Map(connectionLabels.map(label => [label.edgeId, label]));
        // Restore connection labels
        return edges.map(edge => {
            const labelData = labelMap.get(edge.id);
            if (labelData && !edge.label) {
                return {
                    ...edge,
                    label: labelData.label,
                    labelStyle: labelData.style,
                    labelPosition: labelData.position?.type,
                    labelOffset: labelData.position?.offset,
                    showLabel: labelData.visible,
                    interactive: true
                };
            }
            return edge;
        });
    }
    /**
     * Utility methods
     */
    generateExportId() {
        return `shared_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateChangeId() {
        return `change_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    /**
     * Get shared graph by ID
     */
    getSharedGraph(exportId) {
        return this.sharedGraphs.get(exportId) || null;
    }
    /**
     * List all shared graphs for a user
     */
    getUserSharedGraphs(userId) {
        return Array.from(this.sharedGraphs.values()).filter(graph => graph.metadata.author.id === userId ||
            graph.metadata.sharing.collaborators.some(c => c.userId === userId));
    }
    /**
     * Update sharing permissions
     */
    updateSharingPermissions(exportId, permissions, collaborators) {
        const graph = this.sharedGraphs.get(exportId);
        if (!graph)
            return false;
        graph.metadata.sharing.permissions = permissions;
        if (collaborators) {
            graph.metadata.sharing.collaborators = collaborators;
        }
        return true;
    }
}
// Export utilities
export const graphSharingService = GraphSharingService.getInstance();
export const exportGraphForSharing = (nodes, edges, options = {}) => graphSharingService.exportForSharing(nodes, edges, {}, {}, options);
export const importSharedGraph = (sharedGraph, options = {}) => graphSharingService.importSharedGraph(sharedGraph, options);
export const validateSharedGraphFormat = (sharedGraph) => {
    // Basic validation - in production would use Zod schema
    return Boolean(sharedGraph?.metadata?.exportId &&
        sharedGraph?.graph?.nodes &&
        sharedGraph?.graph?.edges &&
        sharedGraph?.annotations);
};
