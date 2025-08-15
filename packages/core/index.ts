// Story 1.30: Trimmed public surface
// Re-enabling exports to fix Epic1GraphEditor
export * from './public';

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
  meta: {};
  version: string;
}

// Export new components and types
export * from './components/Inspector';
export * from './types/NodeTypes';
// Temporarily disabled - nodeDataUtils has syntax errors and is unused
// export * from './utils/nodeDataUtils';
export { GraphEditor } from './GraphEditor';
// Legacy InspectorSidebar removed - use InspectorPanel from ./components/Inspector instead
export { Palette } from './Palette';
export { PreviewModal } from './PreviewModal';
export { nodeSchemas } from './nodeSchemas';
export { useGraphStore } from './graphStore';

// Professional Interface Integration
export { ProfessionalIntegration } from './components/CommandPalette/ProfessionalIntegration';
export { CommandPalette } from './components/CommandPalette/CommandPalette';
export { UndoRedoManager } from './components/CommandPalette/UndoRedoManager';
export { MultiSelectionManager } from './components/CommandPalette/MultiSelectionManager';
export { AutosaveManager } from './components/CommandPalette/AutosaveManager';
export { KeyboardShortcutsManager } from './components/CommandPalette/KeyboardShortcutsManager';

// Epic 2: Menu Bar & Navigation Foundation
export { ProfessionalMenuBar } from './components/MenuBar/ProfessionalMenuBar';
export type { MenuBarProps } from './components/MenuBar/ProfessionalMenuBar';

// Epic 3: Integrated File Management System
export { IntegratedFileBrowser } from './components/FileManagement/IntegratedFileBrowser';
export type { IntegratedFileBrowserProps } from './components/FileManagement/IntegratedFileBrowser';
export { RecentFilesPanel } from './components/FileManagement/RecentFilesPanel';
export type { RecentFilesPanelProps } from './components/FileManagement/RecentFilesPanel';
export { WorkspaceManager } from './components/FileManagement/WorkspaceManager';
export type { WorkspaceManagerProps, WorkspaceSession } from './components/FileManagement/WorkspaceManager';

// Epic 4: Inline Node Editing System - Complete Implementation ✅
export {
  InlineNodeEditor,
  InlineEditorManager,
  InlineEditorProvider,
  InlineEditableNode,
  GraphEditorWithInlineEditing,
  useInlineEditor,
  useInlineEditorContext,
  useGraphWithInlineEditing,
  createInlineEditingGraph,
  withInlineEditing,
  RichTextEditor,
  NodeSpecificRichEditor,
  WeightedChoiceEditor,
  ConcatEditor,
  VariableEditor,
  ConditionalEditor,
  OutputEditor,
  BatchNodeEditor
}
 from './components/InlineEditor';
export type {
  InlineNodeEditorProps,
  InlineEditorManagerProps,
  InlineEditableNodeProps,
  GraphEditorWithInlineEditingProps
}
 from './components/InlineEditor';

// Project Management System exports
export { ProjectManager } from './projectManager';
export { ServerProjectManager } from './serverProjectManager';
export type { 
  ProjectMetadata,
  PSGFile,
  ProjectSettings,
  SaveProjectOptions,
  LoadProjectResult,
  SaveProjectResult 
}
 from './projectManager';
export type { ServerProjectMetadata, ServerProject, ProjectListResponse, ProjectQuery } from './serverProjectManager';
export { default as SaveProjectDialog } from './components/ProjectDialogs/SaveProjectDialog';
export { default as LoadProjectDialog } from './components/ProjectDialogs/LoadProjectDialog';
export { default as ExportBundleDialog } from './components/ProjectDialogs/ExportBundleDialog';

// Epic 8.2 - Corrections Manager GA exports - TEMPORARILY DISABLED
// export { ResponsiveCorrectionsPanel } from './ResponsiveCorrectionsPanel';
// export { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard';
// export { WorkflowManager } from './components/WorkflowManager';
// export { MobileCorrectionsPanel } from './components/MobileCorrectionsPanel';
// export { EnhancedTextAreaEditor } from './components/Inspector/EnhancedTextAreaEditor';
// export { NotificationSystem } from './components/NotificationSystem';
// export * from './correctionsStore';

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
}
 from './extensions/interfaces/ExtensionInterfaces';
export { 
  NodeExtension,
  NodeCategory 
}
  // Skip NodeDefinition to avoid conflict
 from './extensions/interfaces/NodeExtension';
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
}
 from './collaboration/collaborativeGraphStore';
export type { UserPresence, CollaborativeGraphState } from './collaboration/collaborativeGraphStore';
export { 
  useCollaborativeReactFlow,
  useNodeCollaborators,
  useCollaborationStatus 
}
 from './collaboration/useCollaborativeReactFlow';
export { CollaborativePresence, CollaborationStatus, UserAvatars } from './collaboration/CollaborativePresence';

// Epic 9.4 - Workflow Orchestration exports - TEMPORARILY DISABLED
// export { WorkflowStateManager } from './components/WorkflowStateManager';
// export { WorkflowStateIndicator, WorkflowStateBadge } from './components/WorkflowStateIndicator';
// export { WorkflowTransitionControls } from './components/WorkflowTransitionControls';
// export { WorkflowHistoryVisualization } from './components/WorkflowHistoryVisualization';
// export { AuditTrailViewer } from './components/AuditTrailViewer';
// export { ApiIntegrationManager } from './components/ApiIntegrationManager';
// export { ScheduledExecutionManager } from './components/ScheduledExecutionManager';
// export { useWorkflowStore } from './stores/workflowStore';
// export type { //   WorkflowState
//   WorkflowTransition
//   WorkflowApproval
//   WorkflowLock
//   WorkflowHistoryEntry }
//   WorkflowStatistics
// } from './stores/workflowStore';

// Epic 12 - LLM Agent Randomizer System exports
export { 
  RandomizerPanel,
  GraphPreview,
  RandomizerWorkflow,
  RandomizerSystem,
  LLMRandomizerSystem 
}
 from './llm-randomizer';

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
}
 from './security/AuditLogger';

export { AuditIntegration, createAuditIntegration, type ComplianceReport } from './security/AuditIntegration';

export { 
  DataClassifier,
  createDataClassifier,
  type DataClassificationResult,
  type ClassificationPattern,
  type ClassificationConfig,
  type ComplianceValidationResult 
}
 from './security/DataClassifier';

export { 
  ClassificationEnforcer,
  createClassificationEnforcer,
  type EnforcementResult,
  type ClassificationHandlingRequirements,
  type ClassificationEnforcementConfig 
}
 from './security/ClassificationEnforcer';

export { 
  ClassificationEnforcementMiddleware,
  createClassificationMiddleware 
}
 from './security/ClassificationEnforcementMiddleware';

export { DataClassificationLevel, type OperationContext, type ClassificationResult } from './types/DataClassification';

// Epic 8.8 - UTDG Historical Data Integration Foundation exports
export { UTDGManager } from './historical/UTDGManager';

export { ConstraintValidator } from './historical/ConstraintValidator';

export { ExternalDataService } from './historical/ExternalDataService';

export { 
  MedievalDemoDatabase,
  MEDIEVAL_DEMO_CONSTRAINTS,
  MEDIEVAL_PERIODS,
  MEDIEVAL_REGIONS,
  MEDIEVAL_FABRICS,
  MEDIEVAL_COLORS 
}
 from './historical/MedievalDemo';

export type { 
  UTDGNode,
  Era,
  HistoricalConstraint,
  ConstraintValidationResult,
  DataSource,
  HistoricalQuery,
  HistoricalQueryResult,
  MedievalClothing,
  UTDGGraph,
  ContentGenerationConfig,
  GeneratedContent,
  VFXExportData,
  ValidationReport,
  SocialClass,
  Variation 
}
 from './types/UTDG';

export { HISTORICAL_ERAS } from './types/UTDG';

// Runtime system exports
export { 
  ExecutionContext,
  RuntimeNode,
  AdvancedRuntimeNode,
  AdvancedExecutionContext,
  AdvancedNodeConfig 
} from './runtime';

// Epic1 exports
export { Epic1GraphEditor, Epic1GraphEditorWithProvider } from './components/epic1/Epic1GraphEditor';
export { AssetBrowserLoader } from './components/epic1/AssetBrowserLoader';
export { TabbedSidePanel } from './components/epic1/TabbedSidePanel';
export { EdgeRenderingFix, edgeTypes as epic1EdgeTypes } from './components/epic1/EdgeRenderingFix';
