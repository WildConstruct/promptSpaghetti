// Shared types and engine placeholder
// Export new components and types
export * from './components/Inspector.js';
export * from './types/NodeTypes.js';
export * from './utils/nodeDataUtils.js';
export { GraphEditor } from './GraphEditor.js';
// Legacy InspectorSidebar removed - use InspectorPanel from ./components/Inspector instead
export { Palette } from './Palette.js';
export { PreviewModal } from './PreviewModal.js';
export { nodeSchemas } from './nodeSchemas.js';
export { useGraphStore } from './graphStore.js';
// Project Management System exports
export { ProjectManager } from './projectManager.js';
export { ServerProjectManager } from './serverProjectManager.js';
export { default as SaveProjectDialog } from './components/ProjectDialogs/SaveProjectDialog.js';
export { default as LoadProjectDialog } from './components/ProjectDialogs/LoadProjectDialog.js';
export { default as ExportBundleDialog } from './components/ProjectDialogs/ExportBundleDialog.js';
// Epic 8.2 - Corrections Manager GA exports
export { ResponsiveCorrectionsPanel } from './ResponsiveCorrectionsPanel.js';
export { CorrectionsStatsDashboard } from './components/CorrectionsStatsDashboard.js';
export { WorkflowManager } from './components/WorkflowManager.js';
export { MobileCorrectionsPanel } from './components/MobileCorrectionsPanel.js';
export { EnhancedTextAreaEditor } from './components/Inspector/EnhancedTextAreaEditor.js';
export { NotificationSystem } from './components/NotificationSystem.js';
export * from './correctionsStore.js';
// Epic 8.4 - Extension System Architecture exports (avoid conflicts)
export { ExtensionLifecycleManager } from './extensions/ExtensionLifecycleManager.js';
export { ExtensionPointRegistry } from './extensions/ExtensionPointRegistry.js';
export { ExtensionLifecycleState, ExtensionErrorType, ExtensionError, ExtensionManifestSchema } from './extensions/interfaces/ExtensionInterfaces.js';
export { NodeCategory
// Skip NodeDefinition to avoid conflict 
 } from './extensions/interfaces/NodeExtension.js';
export * from './extensions/interfaces/UIExtension.js';
export * from './extensions/interfaces/TransformExtension.js';
export * from './extensions/interfaces/StorageExtension.js';
export * from './components/ExtensionManager.js';
// Epic 9.1.2 - Collaborative Editing exports
export { GraphCRDTAdapter, createCollaborativeGraph } from './collaboration/GraphCRDTAdapter.js';
export { useCollaborativeGraphStore, useCollaborationEnabled, useConnectedUsers, useConnectionStatus, useLocalPresence, useCollaborativeGraph, useCollaborativeActions } from './collaboration/collaborativeGraphStore.js';
export { useCollaborativeReactFlow, useNodeCollaborators, useCollaborationStatus } from './collaboration/useCollaborativeReactFlow.js';
export { CollaborativePresence, CollaborationStatus, UserAvatars } from './collaboration/CollaborativePresence.js';
// Epic 9.4 - Workflow Orchestration exports
export { WorkflowStateManager } from './components/WorkflowStateManager.js';
export { WorkflowStateIndicator, WorkflowStateBadge } from './components/WorkflowStateIndicator.js';
export { WorkflowTransitionControls } from './components/WorkflowTransitionControls.js';
export { WorkflowHistoryVisualization } from './components/WorkflowHistoryVisualization.js';
export { AuditTrailViewer } from './components/AuditTrailViewer.js';
export { ApiIntegrationManager } from './components/ApiIntegrationManager.js';
export { ScheduledExecutionManager } from './components/ScheduledExecutionManager.js';
export { useWorkflowStore } from './stores/workflowStore.js';
// Epic 12 - LLM Agent Randomizer System exports
export { RandomizerPanel, GraphPreview, RandomizerWorkflow, RandomizerSystem, LLMRandomizerSystem } from './llm-randomizer.js';
// Epic 19 - Security and Audit Logging exports
export { AuditLogger, createAuditLogger, AuditOperation, AuditLogLevel, InMemoryStorageBackend } from './security/AuditLogger.js';
export { AuditIntegration, createAuditIntegration } from './security/AuditIntegration.js';
export { DataClassifier, createDataClassifier } from './security/DataClassifier.js';
export { ClassificationEnforcer, createClassificationEnforcer } from './security/ClassificationEnforcer.js';
export { ClassificationEnforcementMiddleware, createClassificationMiddleware } from './security/ClassificationEnforcementMiddleware.js';
export { DataClassificationLevel } from './types/DataClassification.js';
// Epic 8.8 - UTDG Historical Data Integration Foundation exports
export { UTDGManager } from './historical/UTDGManager.js';
export { ConstraintValidator } from './historical/ConstraintValidator.js';
export { ExternalDataService } from './historical/ExternalDataService.js';
export { MedievalDemoDatabase, MEDIEVAL_DEMO_CONSTRAINTS, MEDIEVAL_PERIODS, MEDIEVAL_REGIONS, MEDIEVAL_FABRICS, MEDIEVAL_COLORS } from './historical/MedievalDemo.js';
export { HISTORICAL_ERAS } from './types/UTDG.js';
// Runtime system exports
export { RuntimeNode, AdvancedRuntimeNode, AdvancedExecutionContext } from './runtime.js';
