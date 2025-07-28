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
// Professional Interface Integration
export { ProfessionalIntegration } from './components/CommandPalette/ProfessionalIntegration';
export { CommandPalette } from './components/CommandPalette/CommandPalette';
export { UndoRedoManager } from './components/CommandPalette/UndoRedoManager';
export { MultiSelectionManager } from './components/CommandPalette/MultiSelectionManager';
export { AutosaveManager } from './components/CommandPalette/AutosaveManager';
export { KeyboardShortcutsManager } from './components/CommandPalette/KeyboardShortcutsManager';
// Project Management System exports
export { ProjectManager } from './projectManager';
export { ServerProjectManager } from './serverProjectManager';
export { default as SaveProjectDialog } from './components/ProjectDialogs/SaveProjectDialog';
export { default as LoadProjectDialog } from './components/ProjectDialogs/LoadProjectDialog';
export { default as ExportBundleDialog } from './components/ProjectDialogs/ExportBundleDialog';
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
// Epic 9.4 - Workflow Orchestration exports
export { WorkflowStateManager } from './components/WorkflowStateManager';
export { WorkflowStateIndicator, WorkflowStateBadge } from './components/WorkflowStateIndicator';
export { WorkflowTransitionControls } from './components/WorkflowTransitionControls';
export { WorkflowHistoryVisualization } from './components/WorkflowHistoryVisualization';
export { AuditTrailViewer } from './components/AuditTrailViewer';
export { ApiIntegrationManager } from './components/ApiIntegrationManager';
export { ScheduledExecutionManager } from './components/ScheduledExecutionManager';
export { useWorkflowStore } from './stores/workflowStore';
// Epic 12 - LLM Agent Randomizer System exports
export { RandomizerPanel, GraphPreview, RandomizerWorkflow, RandomizerSystem, LLMRandomizerSystem } from './llm-randomizer';
// Epic 19 - Security and Audit Logging exports
export { AuditLogger, createAuditLogger, AuditOperation, AuditLogLevel, InMemoryStorageBackend } from './security/AuditLogger';
export { AuditIntegration, createAuditIntegration } from './security/AuditIntegration';
export { DataClassifier, createDataClassifier } from './security/DataClassifier';
export { ClassificationEnforcer, createClassificationEnforcer } from './security/ClassificationEnforcer';
export { ClassificationEnforcementMiddleware, createClassificationMiddleware } from './security/ClassificationEnforcementMiddleware';
export { DataClassificationLevel } from './types/DataClassification';
// Epic 8.8 - UTDG Historical Data Integration Foundation exports
export { UTDGManager } from './historical/UTDGManager';
export { ConstraintValidator } from './historical/ConstraintValidator';
export { ExternalDataService } from './historical/ExternalDataService';
export { MedievalDemoDatabase, MEDIEVAL_DEMO_CONSTRAINTS, MEDIEVAL_PERIODS, MEDIEVAL_REGIONS, MEDIEVAL_FABRICS, MEDIEVAL_COLORS } from './historical/MedievalDemo';
export { HISTORICAL_ERAS } from './types/UTDG';
// Runtime system exports
export { RuntimeNode, AdvancedRuntimeNode } from './runtime';
