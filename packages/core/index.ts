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

// Epic 8.4 - Extension System Architecture exports (avoid conflicts)
export { ExtensionLifecycleManager } from './extensions/ExtensionLifecycleManager';
export { ExtensionPointRegistry } from './extensions/ExtensionPointRegistry';
export { 
  BaseExtension, 
  ExtensionHealthStatus, 
  ExtensionContext, 
  ExtensionLogger,
  ExtensionStorage,
  ExtensionEventEmitter,
  ExtensionRuntime,
  ExtensionUIContext,
  ExtensionAPIContext,
  SystemInfo,
  PerformanceMetrics,
  ExtensionLifecycleState,
  ExtensionErrorType,
  ExtensionError,
  ExtensionValidationResult,
  ExtensionManifestSchema,
  ExtensionManifest
} from './extensions/interfaces/ExtensionInterfaces';
export { 
  NodeExtension,
  NodeCategory
  // Skip NodeDefinition to avoid conflict 
} from './extensions/interfaces/NodeExtension';
export * from './extensions/interfaces/UIExtension';
export * from './extensions/interfaces/TransformExtension';
export * from './extensions/interfaces/StorageExtension';
export * from './components/ExtensionManager';

// Epic 9.1.2 - Collaborative Editing exports
export { GraphCRDTAdapter, createCollaborativeGraph } from './collaboration/GraphCRDTAdapter';
export type { CollaborativeGraphOptions } from './collaboration/GraphCRDTAdapter';
export { 
  useCollaborativeGraphStore,
  useCollaborationEnabled,
  useConnectedUsers,
  useConnectionStatus,
  useLocalPresence,
  useCollaborativeGraph,
  useCollaborativeActions
} from './collaboration/collaborativeGraphStore';
export type { UserPresence, CollaborativeGraphState } from './collaboration/collaborativeGraphStore';
export { 
  useCollaborativeReactFlow,
  useNodeCollaborators,
  useCollaborationStatus
} from './collaboration/useCollaborativeReactFlow';
export { 
  CollaborativePresence,
  CollaborationStatus,
  UserAvatars
} from './collaboration/CollaborativePresence';

// Epic 9.4 - Workflow Orchestration exports
export { WorkflowStateManager } from './components/WorkflowStateManager';
export { WorkflowStateIndicator, WorkflowStateBadge } from './components/WorkflowStateIndicator';
export { WorkflowTransitionControls } from './components/WorkflowTransitionControls';
export { WorkflowHistoryVisualization } from './components/WorkflowHistoryVisualization';
export { AuditTrailViewer } from './components/AuditTrailViewer';
export { ApiIntegrationManager } from './components/ApiIntegrationManager';
export { ScheduledExecutionManager } from './components/ScheduledExecutionManager';
export { useWorkflowStore } from './stores/workflowStore';
export type { 
  WorkflowState, 
  WorkflowTransition, 
  WorkflowApproval, 
  WorkflowLock, 
  WorkflowHistoryEntry, 
  WorkflowStatistics 
} from './stores/workflowStore';

// Epic 12 - LLM Agent Randomizer System exports
export { 
  RandomizerPanel,
  GraphPreview,
  RandomizerWorkflow,
  RandomizerSystem,
  LLMRandomizerSystem
} from './llm-randomizer';

// Epic 19 - Security and Audit Logging exports
export {
  AuditLogger,
  createAuditLogger,
  AuditOperation,
  AuditLogLevel,
  InMemoryStorageBackend,
  type AuditLogEntry,
  type AuditLoggerConfig,
  type AuditStorageBackend,
  type AuditQueryCriteria,
  type AlertThresholds,
  type AuditStatistics
} from './security/AuditLogger';

export {
  AuditIntegration,
  createAuditIntegration,
  type ComplianceReport
} from './security/AuditIntegration';

export {
  DataClassifier,
  createDataClassifier,
  type DataClassificationResult,
  type ClassificationPattern,
  type ClassificationConfig,
  type ComplianceValidationResult
} from './security/DataClassifier';

export {
  ClassificationEnforcer,
  createClassificationEnforcer,
  type EnforcementResult,
  type ClassificationHandlingRequirements,
  type ClassificationEnforcementConfig
} from './security/ClassificationEnforcer';

export {
  ClassificationEnforcementMiddleware,
  createClassificationMiddleware
} from './security/ClassificationEnforcementMiddleware';

export {
  DataClassificationLevel,
  type OperationContext,
  type ClassificationResult
} from './types/DataClassification';
