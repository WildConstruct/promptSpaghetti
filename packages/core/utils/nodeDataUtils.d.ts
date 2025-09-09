import type { NodeData, NodeType } from '../types/NodeTypes';

export declare function createDefaultNodeData(type: NodeType): NodeData;

export declare function addVariationToNode(
  nodeData: NodeData,
  variation: string
): NodeData;

export declare function removeVariationFromNode(
  nodeData: NodeData,
  index: number
): NodeData;

export declare function updateVariationInNode(
  nodeData: NodeData,
  index: number,
  newValue: string
): NodeData;

export declare function reorderVariationsInNode(
  nodeData: NodeData,
  fromIndex: number,
  toIndex: number
): NodeData;

export declare function getRandomVariation(
  nodeData: NodeData,
  seed?: number
): string;

export declare function hasVariations(nodeData: NodeData): boolean;

export declare function getVariationCount(nodeData: NodeData): number;

export declare function validateNodeDataLegacyWrapper(nodeData: NodeData): {
  valid: boolean;
  errors: string[];
};

export declare function validateNodeDataLegacy(nodeData: NodeData): {
  valid: boolean;
  errors: string[];
};

export declare function cloneNodeData(nodeData: NodeData): NodeData;

export declare function mergeNodeData<T extends NodeData>(
  original: T,
  updates: Partial<T>
): T;

export declare function migrateNodeData(oldNodeData: any): NodeData | null;

//# sourceMappingURL=nodeDataUtils.d.ts.map
