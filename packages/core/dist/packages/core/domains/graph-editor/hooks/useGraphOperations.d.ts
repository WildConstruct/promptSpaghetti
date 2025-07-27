/**
 * Graph Operations Hook
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Hook for performing graph operations (add/remove/update nodes and edges)
 */
import { Node } from '../types/GraphTypes';
export declare const useGraphOperations: () => {
    addNode: (nodeType: string, position: {
        x: number;
        y: number;
    }) => void;
    removeNode: (nodeId: string) => void;
    removeSelectedNodes: () => void;
    updateNode: (nodeId: string, updates: Partial<Node>) => void;
    updateSelectedNodes: (updates: Partial<Node>) => void;
    moveNode: (nodeId: string, position: {
        x: number;
        y: number;
    }) => void;
    moveSelectedNodes: (deltaX: number, deltaY: number) => void;
    duplicateNode: (nodeId: string) => void;
    duplicateSelectedNodes: () => void;
    addEdge: (sourceId: string, targetId: string) => void;
    removeEdge: (edgeId: string) => void;
    removeEdgesBetween: (sourceId: string, targetId: string) => void;
    removeAllEdgesForNode: (nodeId: string) => void;
    deleteSelection: () => void;
    getNodeById: (nodeId: string) => {
        id?: string;
        type?: "WeightedChoice";
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
    };
    canConnect: (sourceId: string, targetId: string) => boolean;
    getConnectedNodes: (nodeId: string) => Node[];
};
//# sourceMappingURL=useGraphOperations.d.ts.map