import { NodeData, NodeType } from '../types/NodeTypes';
export declare const createDefaultNodeData: (type: NodeType) => NodeData;
export declare const addVariationToNode: (nodeData: NodeData, variation: string) => NodeData;
export declare const removeVariationFromNode: (nodeData: NodeData, index: number) => NodeData;
export declare const updateVariationInNode: (nodeData: NodeData) => any, number: any, newValue: string, NodeData: any;
export declare const reorderVariationsInNode: (nodeData: NodeData) => any, number: any, toIndex: number, NodeData: any;
export declare const getRandomVariation: (nodeData: NodeData, seed?: number) => string;
export declare const hasVariations: (nodeData: NodeData) => boolean;
export declare const getVariationCount: (nodeData: NodeData) => number;
export declare const validateNodeDataLegacyWrapper: (nodeData: NodeData) => {
    valid: boolean;
    errors: string;
};
export declare const validateNodeDataLegacy: (nodeData: NodeData) => {
    valid: boolean;
    errors: string;
};
export declare const migrateNodeData: (oldNodeData: any) => NodeData | null;
//# sourceMappingURL=nodeDataUtils.d.ts.map