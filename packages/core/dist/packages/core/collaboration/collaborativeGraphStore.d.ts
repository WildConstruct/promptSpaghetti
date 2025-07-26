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
export declare         <U>(selector: (state: CollaborativeGraphState) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: (a: U, b: U) => boolean;
            fireImmediately?: boolean;
        }): () => void;
    };
}>;
export declare export declare export declare export declare export declare         type?: "WeightedChoice";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
    } | {
        id?: string;
        type?: "Concat";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        type?: "Output";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        name?: string;
        type?: "Include";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
    } | {
        id?: string;
        value?: string | number | boolean | string[] | Record<string, string>;
        type?: "SetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    } | {
        id?: string;
        type?: "GetVariable";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        key?: string;
    } | {
        id?: string;
        type?: "WeightedAdvanced";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        choices?: {
            value?: string;
            weight?: number;
        }[];
        distributionConfig?: {
            normalize?: boolean;
            type?: "custom" | "linear" | "exponential" | "gaussian";
            parameters?: Record<string, number>;
            minWeight?: number;
        };
    } | {
        id?: string;
        type?: "Conditional";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        branches?: {
            condition?: string;
            output?: string;
            label?: string;
        }[];
        defaultOutput?: string;
        conditionalConfig?: {
            allowVariableAccess?: boolean;
            strictMode?: boolean;
            customFunctions?: Record<string, string | number | boolean | string[] | Record<string, string>>;
        };
    } | {
        id?: string;
        type?: "Sequential";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        sequence?: string[];
        pattern?: {
            type?: "linear" | "cyclical" | "random" | "weighted";
            config?: {
                custom?: Record<string, any>;
                weights?: number[];
                allowRepeats?: boolean;
            };
        };
    } | {
        id?: string;
        type?: "Markov";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        states?: string[];
        transitions?: Record<string, Record<string, number>>;
        initialState?: string;
        markovConfig?: {
            custom?: Record<string, any>;
            maxTransitions?: number;
            normalizeProbabilities?: boolean;
            terminationStates?: string[];
            detectLoops?: boolean;
        };
    } | {
        id?: string;
        code?: string;
        type?: "PythonTransform";
        inputs?: string[];
        template?: string;
        extractedVariables?: {
            name?: string;
            placeholder?: string;
            startIndex?: number;
            endIndex?: number;
            isValid?: boolean;
            inferredType?: "string" | "number" | "boolean" | "object" | "array" | "auto";
            defaultValue?: string;
        }[];
        timeout?: number;
        memoryLimit?: string;
        allowedModules?: string[];
        pythonConfig?: {
            defaultOutput?: string;
            strictMode?: boolean;
            enableCaching?: boolean;
            executorUrl?: string;
            retryAttempts?: number;
            fallbackBehavior?: "error" | "skip" | "default";
        };
    })[];
    seed?: string | number;
};
export declare     disableCollaboration: () => void;
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