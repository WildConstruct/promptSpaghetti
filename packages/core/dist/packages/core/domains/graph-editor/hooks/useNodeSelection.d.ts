/**
 * Node Selection Hook
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Hook for managing node selection state
 */
import { Node } from '../types/GraphTypes';
export declare const useNodeSelection: () => {
    selectedNodeIds: string[];
    selectedNodes: ({
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
    })[];
    hasSelection: boolean;
    selectionCount: number;
    isMultiSelection: boolean;
    selectNodes: (nodeIds: string[], isMultiSelect?: boolean) => void;
    selectSingleNode: (nodeId: string) => void;
    addToSelection: (nodeIds: string[]) => void;
    toggleSelection: (nodeId: string) => void;
    clearSelection: () => void;
    selectAll: () => void;
    isSelected: (nodeId: string) => boolean;
    getSelectedNodes: () => Node[];
};
//# sourceMappingURL=useNodeSelection.d.ts.map