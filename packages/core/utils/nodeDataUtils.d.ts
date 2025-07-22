import { NodeData, NodeType } from '../types/NodeTypes';
export declare const createDefaultNodeData: (type: NodeType) => NodeData;
export declare const addVariationToNode: (nodeData: NodeData, variation: string) => NodeData;
export declare const removeVariationFromNode: (nodeData: NodeData, index: number) => NodeData;
export declare const updateVariationInNode: (nodeData: NodeData, index: number, newValue: string) => NodeData;
export declare const reorderVariationsInNode: (nodeData: NodeData, fromIndex: number, toIndex: number) => NodeData;
export declare const getRandomVariation: (nodeData: NodeData, seed?: number) => string;
export declare const hasVariations: (nodeData: NodeData) => boolean;
export declare const getVariationCount: (nodeData: NodeData) => number;
export declare const validateNodeDataLegacyWrapper: (nodeData: NodeData) => {
    valid: boolean;
    errors: string[];
};
export declare const validateNodeDataLegacy: (nodeData: NodeData) => {
    valid: boolean;
    errors: string[];
};
export declare const cloneNodeData: (nodeData: NodeData) => NodeData;
export declare const mergeNodeData: <T extends NodeData>(original: T, updates: Partial<T>) => T;
export declare const migrateNodeData: (oldNodeData: any) => NodeData | null;
//# sourceMappingURL=nodeDataUtils.d.ts.map