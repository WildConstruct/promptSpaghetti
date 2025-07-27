/**
 * Graph Editor State Container
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 *
 * Domain-specific state management for graph editing functionality
 */
import { BaseStateContainer, ValidationResult } from '../../../state/containers/BaseStateContainer';
import { DomainStateContainer, DomainStateChange } from '../../../state/orchestration/StateOrchestrator';
import { GraphSchema } from '../../types/GraphTypes';
export interface GraphState {
    nodes: Record<string, GraphNode>;
    edges: Record<string, GraphEdge>;
    metadata: GraphMetadata;
    selection: {
        selectedNodes: string[];
        selectedEdges: string[];
        isMultiSelect: boolean;
    };
    viewport: {
        x: number;
        y: number;
        zoom: number;
    };
    execution: {
        isRunning: boolean;
        currentNodeId?: string;
        results: Record<string, any>;
        errors: ExecutionError[];
    };
    history: {
        canUndo: boolean;
        canRedo: boolean;
        currentIndex: number;
        maxSize: number;
    };
    collaboration: {
        isConnected: boolean;
        activeUsers: CollaboratorInfo[];
        cursors: Record<string, CursorPosition>;
    };
    performance: {
        nodeCount: number;
        edgeCount: number;
        lastRenderTime: number;
        memoryUsage: number;
    };
}
export interface GraphNode {
    id: string;
    type: string;
    position: {
        x: number;
        y: number;
    };
    data: Record<string, any>;
    width?: number;
    height?: number;
    selected?: boolean;
    dragging?: boolean;
    style?: Record<string, any>;
    className?: string;
    metadata?: {
        created: number;
        modified: number;
        author?: string;
        version?: number;
    };
}
export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
    data?: Record<string, any>;
    style?: Record<string, any>;
    className?: string;
    animated?: boolean;
    selected?: boolean;
    metadata?: {
        created: number;
        modified: number;
        author?: string;
    };
}
export interface GraphMetadata {
    id: string;
    name: string;
    description?: string;
    version: string;
    created: number;
    modified: number;
    author: string;
    tags: string[];
    isPublic: boolean;
    schema: GraphSchema;
    settings: {
        snapToGrid: boolean;
        gridSize: number;
        showGrid: boolean;
        nodeSpacing: number;
        autoLayout: boolean;
    };
}
export interface ExecutionError {
    id: string;
    nodeId: string;
    message: string;
    type: 'runtime' | 'validation' | 'network';
    timestamp: number;
    stack?: string;
}
export interface CollaboratorInfo {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    isActive: boolean;
    lastSeen: number;
}
export interface CursorPosition {
    userId: string;
    x: number;
    y: number;
    nodeId?: string;
    timestamp: number;
}
export type GraphOperation = {
    type: 'ADD_NODE';
    node: GraphNode;
} | {
    type: 'UPDATE_NODE';
    nodeId: string;
    updates: Partial<GraphNode>;
} | {
    type: 'DELETE_NODE';
    nodeId: string;
} | {
    type: 'ADD_EDGE';
    edge: GraphEdge;
} | {
    type: 'UPDATE_EDGE';
    edgeId: string;
    updates: Partial<GraphEdge>;
} | {
    type: 'DELETE_EDGE';
    edgeId: string;
} | {
    type: 'SELECT_NODES';
    nodeIds: string[];
    append?: boolean;
} | {
    type: 'SELECT_EDGES';
    edgeIds: string[];
    append?: boolean;
} | {
    type: 'CLEAR_SELECTION';
} | {
    type: 'UPDATE_VIEWPORT';
    viewport: Partial<GraphState['viewport']>;
} | {
    type: 'START_EXECUTION';
    nodeId?: string;
} | {
    type: 'EXECUTION_RESULT';
    nodeId: string;
    result: any;
} | {
    type: 'EXECUTION_ERROR';
    error: ExecutionError;
} | {
    type: 'UPDATE_COLLABORATION';
    updates: Partial<GraphState['collaboration']>;
};
export interface GraphTransaction {
    id: string;
    operations: GraphOperation[];
    timestamp: number;
    userId?: string;
    description?: string;
}
export declare class GraphStateContainer extends BaseStateContainer<GraphState> implements DomainStateContainer {
    private transactionQueue;
    private activeTransaction?;
    private nodePositionCache;
    private validationCache;
    constructor(initialGraph?: Partial<GraphState>);
    getInitialState(): GraphState;
    validateState(state: GraphState): ValidationResult;
    getDomainName(): string;
    applyOperation(operation: GraphOperation, userId?: string): Promise<void>;
    applyTransaction(transaction: GraphTransaction): Promise<void>;
    private applyOperationToState;
    applyExternalChange(change: DomainStateChange): Promise<void>;
    canAcceptChange(change: DomainStateChange): boolean;
    prepareForTransaction(transactionId: string): Promise<void>;
    commitTransaction(transactionId: string): Promise<void>;
    rollbackTransaction(transactionId: string): Promise<void>;
    getSelectedNodes(): GraphNode[];
    getSelectedEdges(): GraphEdge[];
    getNodeById(nodeId: string): GraphNode | undefined;
    getEdgeById(edgeId: string): GraphEdge | undefined;
    getConnectedNodes(nodeId: string): GraphNode[];
    getExecutionResults(): Record<string, any>;
    private detectCycles;
    private setNestedProperty;
    private setupEventHandlers;
    private updatePerformanceMetrics;
    private estimateMemoryUsage;
    private emitDomainEvents;
    private generateId;
    private generateChangeId;
}
//# sourceMappingURL=GraphStateContainer.d.ts.map