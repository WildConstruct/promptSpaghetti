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

// Epic 8.2 - Corrections Manager GA exports
export { ResponsiveCorrectionsPanel } from './ResponsiveCorrectionsPanel';
export { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard';
export { WorkflowManager } from './components/WorkflowManager';
export { MobileCorrectionsPanel } from './components/MobileCorrectionsPanel';
export { EnhancedTextAreaEditor } from './components/Inspector/EnhancedTextAreaEditor';
export { NotificationSystem } from './components/NotificationSystem';
export * from './correctionsStore';

// Epic 8.4 - Extension System Architecture exports
export * from './extensions';
export * from './components/ExtensionManager';
