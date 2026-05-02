export * from './public';

export interface Node {
  id: string;
  type: string;
  data: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
  meta: Record<string, unknown>;
  version: string;
}

export { nodeSchemas } from './nodeSchemas';
export { useGraphStore } from './graphStore';

export {
  DataClassificationLevel,
  type OperationContext,
  type ValidationResult
} from './types/DataClassification';
export type { ExecutionContext, RuntimeNode } from './runtime';
export {
  AdvancedRuntimeNode,
  type AdvancedExecutionContext,
  type AdvancedNodeConfig,
  type ValidationResult as AdvancedValidationResult
} from './runtime';
export { Epic1GraphEditor } from './components/epic1/Epic1GraphEditor';
export type { Epic1GraphEditorProps } from './components/epic1/Epic1GraphEditor';
export { AssetBrowserLoader } from './components/epic1/AssetBrowserLoader';
export { TabbedSidePanel } from './components/epic1/TabbedSidePanel';
export {
  DefaultEdge as Epic1DefaultEdge,
  edgeTypes as epic1EdgeTypes,
  checkEdgeRendering as verifyEpic1EdgeRendering
} from './components/epic1/EdgeRenderingFix';
export { GraphEditor, GraphEditorWithProvider } from './GraphEditor';
export { Palette } from './Palette';
export { PreviewModal } from './PreviewModal';

export type { GraphEditorProps } from './GraphEditor';
export type { PaletteProps } from './Palette';
export type { PreviewModalProps } from './PreviewModal';
