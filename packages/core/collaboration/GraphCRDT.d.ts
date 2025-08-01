/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 23: Graph CRDT State Manager
 *
 * CRDT-based state management for collaborative graph editing using Yjs
 * Provides conflict-free operations with automatic synchronization
 */
import * as Y from 'yjs';
import { MutationOperation,
  NodeAddOperation,
  NodeUpdateOperation,
  NodeRemoveOperation,
  EdgeAddOperation,
  EdgeUpdateOperation,
  EdgeRemoveOperation,
  ParameterUpdateOperation,
  GraphEdge }
  ConflictType
} from './GraphMutations';
import { Graph } from '../graphSchema';
/**
 * CRDT representation of a graph node
 */

}
}
export interface GraphNodeCRDT { id: string;
    type: string;
    position: {
        x: number;
        y: number }
}
    };
    data: Record<string, any>;
    inputs: string[];
    metadata: { version: number;
        lastModified: string;
        modifiedBy: string;
        created: string;
        createdBy: string };
/**
 * CRDT representation of a graph edge
 */

}
}
export interface GraphEdgeCRDT { id: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourcePort?: string;
    targetPort?: string;
    type: 'data' | 'control' | 'conditional';
    metadata: {
        version: number;
        lastModified: string;
        modifiedBy: string;
        created: string;
        createdBy: string;
        [key: string]: any }
}
    };
/**
 * Operation record for history tracking
 */

}
}
export interface OperationRecord { operationId: string;
    type: string;
    nodeId?: string;
    edgeId?: string;
    timestamp: number;
    userId: string;
    applied: boolean;
    reverted: boolean;
    conflicted: boolean;
/**
 * CRDT-based graph state manager with Yjs integration
 */
export declare class GraphCRDT {
    private ydoc;
    private nodes;
    private edges;
    private operations;
    private metadata;
    private documentId;
    private clientId;
    private userId;
    private versionVector;
    private onOperationApplied?;
    private onConflictDetected?;
    private onStateChanged?;
    constructor(documentId: string, clientId: string, userId: string);
    /**
     * Setup change handlers for CRDT updates
     */
    private setupChangeHandlers;
    /**
     * Handle node change events
     */
    private handleNodeChanges;
    /**
     * Handle edge change events
     */
    private handleEdgeChanges;
    /**
     * Handle operation change events
     */
    private handleOperationChanges;
    /**
     * Update document metadata
     */
    private updateMetadata;
    /**
     * Add a new node to the graph
     */
    addNode(operation: NodeAddOperation): boolean;
    /**
     * Update an existing node
     */
    updateNode(operation: NodeUpdateOperation): boolean;
    /**
     * Remove a node from the graph
     */
    removeNode(operation: NodeRemoveOperation): boolean;
    /**
     * Add a new edge to the graph
     */
    addEdge(operation: EdgeAddOperation): boolean;
    /**
     * Update an existing edge
     */
    updateEdge(operation: EdgeUpdateOperation): boolean;
    /**
     * Remove an edge from the graph
     */
    removeEdge(operation: EdgeRemoveOperation): boolean;
    /**
     * Update node parameters
     */
    updateParameter(operation: ParameterUpdateOperation): boolean;
    /**
     * Get nested property from object using path array
     */
    private getNestedProperty;
    /**
     * Check if adding an edge would create a cycle
     */
    private wouldCreateCycle;
    /**
     * Remove all edges connected to a node
     */
    private removeNodeEdges;
    /**
     * Record operation in history
     */
    private recordOperation;
    /**
     * Increment version vector for this client
     */
    private incrementVersion;
    /**
     * Get current document version
     */
    getVersion(): number;
    /**
     * Get document state as standard Graph object
     */
    getGraph(): Graph;
    /**
     * Get all edges as array
     */
    getEdges(): GraphEdge[];
    /**
     * Get operation history
     */
    getOperationHistory(): OperationRecord[];
    /**
     * Get document metadata
     */
    getMetadata(): Record<string, any>;
    /**
     * Calculate document checksum for integrity verification
     */
    calculateChecksum(): string;
    /**
     * Simple hash function for checksums
     */
    private hashString;
    /**
     * Set event handlers
     */
    setEventHandlers(handlers: {)
        onOperationApplied?: (operation: MutationOperation) => void;
        onConflictDetected?: (conflictType: ConflictType, operations: MutationOperation[]) => void;
        onStateChanged?: (documentId: string) => void }
}
    }): void;
    /**
     * Get Yjs document for synchronization
     */
    getYDoc(): Y.Doc;
    /**
     * Apply update from another client
     */
    applyUpdate(update: Uint8Array, origin?: any): void;
    /**
     * Get document state as update
     */
    getStateAsUpdate(): Uint8Array;
    /**
     * Dispose of the CRDT instance
     */
    dispose(): void;

export default GraphCRDT;
//# sourceMappingURL=GraphCRDT.d.ts.map