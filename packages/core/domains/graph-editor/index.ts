/**
 * Graph Editor Domain - Main Export
 * REFACTOR-005: Domain-Driven Architecture
 *
 * Main entry point for the graph editor domain
 */

// Domain interface and types
export * from './GraphEditorDomain';
export * from './types/GraphTypes';

// Hooks
export { useGraphState } from './hooks/useGraphState';
export { useNodeSelection } from './hooks/useNodeSelection';
export { useGraphOperations } from './hooks/useGraphOperations';

// Store
export {
  useGraphEditorStore,
  useGraphEditorState,
  useGraphEditorConfig,
  useGraphEditorHistory,
} from './stores/graphEditorStore';

// Re-export existing components (to be migrated)
export { default as GraphEditor } from '../../GraphEditor';
export { default as InspectorPanel } from '../../InspectorPanel';
export { default as PreviewModal } from '../../PreviewModal';
export { default as Palette } from '../../Palette';

// Re-export runtime components
export * from '../../runtime';
export * from '../../runtime/advanced';

// Domain factory (to be implemented)
export const createGraphEditorDomain = (config?: any) => {
  // TODO: Implement domain factory
  return {
    components: {},
    hooks: {},
    services: {},
    events: {},
    config: {},
    utils: {},
  };
};
