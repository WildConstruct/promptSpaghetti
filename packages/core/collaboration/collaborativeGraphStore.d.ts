/**
 * Collaborative Graph Store - Epic 9.1.2
 * Extends existing graph store with collaborative editing capabilities
 */
import { Graph, Node, Edge } from '../graphSchema';
import { GraphCRDTAdapter, CollaborativeGraphOptions } from './GraphCRDTAdapter';
export interface UserPresence {
    userId: string;
    name: string;
    color: string;
    cursor?: {
        nodeId?: string;
        position?: {
            x: number;
            y: number;
        };
    };
    selection?: string[];
    lastSeen: number;
}
export interface CollaborativeGraphState {
    graph: Graph;
    isCollaborative: boolean;
    collaborationEnabled: boolean;
    documentId?: string;
    userId?: string;
    connectedUsers: Map<string, UserPresence>;
    localPresence?: UserPresence;
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    lastSyncTime?: number;
    crdtAdapter?: GraphCRDTAdapter;
    enableCollaboration: (options: CollaborativeGraphOptions) => Promise<void>;
    disableCollaboration: () => void;
    setGraph: (graph: Graph) => void;
    addNode: (node: Node, position?: {
        x: number;
        y: number;
    }) => void;
    updateNode: (nodeId: string, updates: Partial<Node>) => void;
    deleteNode: (nodeId: string) => void;
    addEdge: (edge: Edge) => void;
    deleteEdge: (edgeId: string) => void;
    updateNodePosition: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    updateLocalPresence: (presence: Partial<UserPresence>) => void;
    updateUserCursor: (nodeId?: string, position?: {
        x: number;
        y: number;
    }) => void;
    updateUserSelection: (nodeIds: string[]) => void;
    applyRemoteUpdate: (update: Uint8Array) => void;
    getDocumentState: () => Uint8Array | null;
    createSnapshot: () => Uint8Array | null;
    getMetrics: () => any;
    getSyncState: () => any;
}
export declare const useCollaborativeGraphStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<CollaborativeGraphState>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: CollaborativeGraphState, previousSelectedState: CollaborativeGraphState) => void): () => void;
        <U>(selector: (state: CollaborativeGraphState) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export declare const useCollaborationEnabled: () => boolean;
export declare const useConnectedUsers: () => Map<string, UserPresence>;
export declare const useConnectionStatus: () => "error" | "disconnected" | "connecting" | "connected";
export declare const useLocalPresence: () => UserPresence | undefined;
export declare const useCollaborativeGraph: () => {
    nodes: ({
        id: string;
        type: "WeightedChoice";
        choices: {
            value: string;
            weight: number;
        }[];
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Concat";
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "Output";
        inputs?: string[] | undefined;
    } | {
        id: string;
        name: string;
        type: "Include";
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "SetVariable";
        key: string;
        value?: string | number | boolean | string[] | Record<string, string> | null | undefined;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "GetVariable";
        key: string;
        inputs?: string[] | undefined;
    } | {
        id: string;
        type: "WeightedAdvanced";
        inputs?: string[] | undefined;
        choices?: {
            value: string;
            weight: number;
        }[] | undefined;
        distributionConfig?: {
            type: "linear" | "custom" | "exponential" | "gaussian";
            normalize?: boolean | undefined;
            parameters?: Record<string, number> | undefined;
            minWeight?: number | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Conditional";
        inputs?: string[] | undefined;
        branches?: {
            output: string;
            condition: string;
            label?: string | undefined;
        }[] | undefined;
        defaultOutput?: string | undefined;
        conditionalConfig?: {
            allowVariableAccess?: boolean | undefined;
            strictMode?: boolean | undefined;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string> | null | undefined> | undefined;
        } | undefined;
    } | {
        id: string;
        type: "Sequential";
        pattern?: {
            type: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any> | undefined;
                allowRepeats?: boolean | undefined;
                weights?: number[] | undefined;
            } | undefined;
        } | undefined;
        inputs?: string[] | undefined;
        sequence?: string[] | undefined;
    } | {
        id: string;
        type: "Markov";
        inputs?: string[] | undefined;
        states?: string[] | undefined;
        transitions?: Record<string, Record<string, number>> | undefined;
        initialState?: string | undefined;
        markovConfig?: {
            custom?: Record<string, any> | undefined;
            maxTransitions?: number | undefined;
            normalizeProbabilities?: boolean | undefined;
            terminationStates?: string[] | undefined;
            detectLoops?: boolean | undefined;
        } | undefined;
    } | {
        id: string;
        type: "PythonTransform";
        code: string;
        timeout?: number | undefined;
        inputs?: string[] | undefined;
        memoryLimit?: string | undefined;
        allowedModules?: string[] | undefined;
        pythonConfig?: {
            defaultOutput?: string | undefined;
            strictMode?: boolean | undefined;
            enableCaching?: boolean | undefined;
            executorUrl?: string | undefined;
            retryAttempts?: number | undefined;
            fallbackBehavior?: "error" | "default" | "skip" | undefined;
        } | undefined;
    })[];
    seed?: string | number | undefined;
};
export declare const useCollaborativeActions: () => {
    enableCollaboration: (options: CollaborativeGraphOptions) => Promise<void>;
    disableCollaboration: () => void;
    addNode: (node: Node, position?: {
        x: number;
        y: number;
    }) => void;
    updateNode: (nodeId: string, updates: Partial<Node>) => void;
    deleteNode: (nodeId: string) => void;
    addEdge: (edge: Edge) => void;
    deleteEdge: (edgeId: string) => void;
    updateNodePosition: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    updateLocalPresence: (presence: Partial<UserPresence>) => void;
    updateUserCursor: (nodeId?: string, position?: {
        x: number;
        y: number;
    }) => void;
    updateUserSelection: (nodeIds: string[]) => void;
};
//# sourceMappingURL=collaborativeGraphStore.d.ts.map