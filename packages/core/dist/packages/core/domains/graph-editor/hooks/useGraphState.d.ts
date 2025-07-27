/**
 * Graph State Hook
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Primary hook for accessing graph editor state
 */
import { Graph } from '../types/GraphTypes';
export declare const useGraphState: () => {
    setGraph: (graph: Graph) => void;
    updateGraph: (updater: (graph: Graph) => Graph) => void;
    markDirty: () => void;
    markClean: () => void;
    resetState: () => void;
    updateConfig: (config: Partial<import("../types/GraphTypes").GraphEditorConfig>) => void;
    hasNodes: boolean;
    hasEdges: boolean;
    hasSelection: boolean;
    hasErrors: boolean;
    isValid: boolean;
    graph: Graph;
    selectedNodeIds: string[];
    draggedNodeId: string;
    isExecuting: boolean;
    executionResults: Record<string, any>;
    validationErrors: import("../types/GraphTypes").ValidationError[];
    previewSeeds: number[];
    autosaveEnabled: boolean;
    isDirty: boolean;
    config: import("../types/GraphTypes").GraphEditorConfig;
};
//# sourceMappingURL=useGraphState.d.ts.map