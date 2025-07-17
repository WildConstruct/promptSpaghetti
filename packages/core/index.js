// Shared types and engine placeholder
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
// Epic 8.4 - Extension System Architecture exports (avoid conflicts)
export { ExtensionLifecycleManager } from './extensions/ExtensionLifecycleManager';
export { ExtensionPointRegistry } from './extensions/ExtensionPointRegistry';
export { ExtensionLifecycleState, ExtensionErrorType, ExtensionError, ExtensionManifestSchema } from './extensions/interfaces/ExtensionInterfaces';
export { NodeCategory
// Skip NodeDefinition to avoid conflict 
 } from './extensions/interfaces/NodeExtension';
export * from './extensions/interfaces/UIExtension';
export * from './extensions/interfaces/TransformExtension';
export * from './extensions/interfaces/StorageExtension';
export * from './components/ExtensionManager';
// Epic 9.1.2 - Collaborative Editing exports
export { GraphCRDTAdapter, createCollaborativeGraph } from './collaboration/GraphCRDTAdapter';
export { useCollaborativeGraphStore, useCollaborationEnabled, useConnectedUsers, useConnectionStatus, useLocalPresence, useCollaborativeGraph, useCollaborativeActions } from './collaboration/collaborativeGraphStore';
export { useCollaborativeReactFlow, useNodeCollaborators, useCollaborationStatus } from './collaboration/useCollaborativeReactFlow';
export { CollaborativePresence, CollaborationStatus, UserAvatars } from './collaboration/CollaborativePresence';
