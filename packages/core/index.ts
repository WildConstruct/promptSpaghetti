// Shared types and engine placeholder

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
  meta: {
    version: string;
  };
}

// Export new components and types
export * from './components/Inspector';
export * from './types/NodeTypes';
export * from './utils/nodeDataUtils';
export { GraphEditor } from './GraphEditor';
// Legacy InspectorSidebar removed - use InspectorPanel from ./components/Inspector instead
export { Palette } from './Palette';
export { PreviewModal } from './PreviewModal';
export { nodeSchemas } from './nodeSchemas';
export { useGraphStore } from './graphStore';
