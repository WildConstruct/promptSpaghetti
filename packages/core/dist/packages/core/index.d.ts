export interface Node {
    id: string;
    type: string;
    data: Record<string, unknown>;
    position: {
        x: number;
        y: number;
    };
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
export * from './components/Inspector';
export * from './types/NodeTypes';
export * from './utils/nodeDataUtils';
export { GraphEditor } from './GraphEditor';
export { Palette } from './Palette';
export { PreviewModal } from './PreviewModal';
export { nodeSchemas } from './nodeSchemas';
export { useGraphStore } from './graphStore';
export { ProfessionalIntegration } from './components/CommandPalette/ProfessionalIntegration';
export { CommandPalette } from './components/CommandPalette/CommandPalette';
export { UndoRedoManager } from './components/CommandPalette/UndoRedoManager';
export { MultiSelectionManager } from './components/CommandPalette/MultiSelectionManager';
export { AutosaveManager } from './components/CommandPalette/AutosaveManager';
export { KeyboardShortcutsManager } from './components/CommandPalette/KeyboardShortcutsManager';
export { ProfessionalMenuBar } from './components/MenuBar/ProfessionalMenuBar';
export type { MenuBarProps } from './components/MenuBar/ProfessionalMenuBar';
export { IntegratedFileBrowser } from './components/FileManagement/IntegratedFileBrowser';
export type { IntegratedFileBrowserProps } from './components/FileManagement/IntegratedFileBrowser';
export { RecentFilesPanel } from './components/FileManagement/RecentFilesPanel';
export type { RecentFilesPanelProps } from './components/FileManagement/RecentFilesPanel';
export { WorkspaceManager } from './components/FileManagement/WorkspaceManager';
export type { WorkspaceManagerProps, WorkspaceSession } from './components/FileManagement/WorkspaceManager';
export { InlineNodeEditor, InlineEditorManager, InlineEditorProvider, InlineEditableNode, GraphEditorWithInlineEditing, useInlineEditor, useInlineEditorContext, useGraphWithInlineEditing, createInlineEditingGraph, withInlineEditing, RichTextEditor, NodeSpecificRichEditor, WeightedChoiceEditor, ConcatEditor, VariableEditor, ConditionalEditor, OutputEditor, BatchNodeEditor } from './components/InlineEditor';
export type { InlineNodeEditorProps, InlineEditorManagerProps, InlineEditableNodeProps, GraphEditorWithInlineEditingProps } from './components/InlineEditor';
export { ProjectManager } from './projectManager';
export { ServerProjectManager } from './serverProjectManager';
export type { ProjectMetadata, PSGFile, ProjectSettings, SaveProjectOptions, LoadProjectResult, SaveProjectResult } from './projectManager';
export type { ServerProjectMetadata, ServerProject, ProjectListResponse, ProjectQuery } from './serverProjectManager';
export { default as SaveProjectDialog } from './components/ProjectDialogs/SaveProjectDialog';
export { default as LoadProjectDialog } from './components/ProjectDialogs/LoadProjectDialog';
export { default as ExportBundleDialog } from './components/ProjectDialogs/ExportBundleDialog';
export { ExtensionLifecycleManager } from './extensions/ExtensionLifecycleManager';
export { ExtensionPointRegistry } from './extensions/ExtensionPointRegistry';
export { BaseExtension, ExtensionHealthStatus, ExtensionContext, ExtensionLogger, ExtensionStorage, ExtensionEventEmitter, ExtensionRuntime, ExtensionUIContext, ExtensionAPIContext, SystemInfo, PerformanceMetrics, ExtensionLifecycleState, ExtensionErrorType, ExtensionError, ExtensionValidationResult, ExtensionManifestSchema, ExtensionManifest } from './extensions/interfaces/ExtensionInterfaces';
export { NodeExtension, NodeCategory } from './extensions/interfaces/NodeExtension';
export * from './extensions/interfaces/UIExtension';
export * from './extensions/interfaces/TransformExtension';
export * from './extensions/interfaces/StorageExtension';
export * from './components/ExtensionManager';
export { GraphCRDTAdapter, createCollaborativeGraph } from './collaboration/GraphCRDTAdapter';
export type { CollaborativeGraphOptions } from './collaboration/GraphCRDTAdapter';
export { useCollaborativeGraphStore, useCollaborationEnabled, useConnectedUsers, useConnectionStatus, useLocalPresence, useCollaborativeGraph, useCollaborativeActions } from './collaboration/collaborativeGraphStore';
export type { UserPresence, CollaborativeGraphState } from './collaboration/collaborativeGraphStore';
export { useCollaborativeReactFlow, useNodeCollaborators, useCollaborationStatus } from './collaboration/useCollaborativeReactFlow';
export { CollaborativePresence, CollaborationStatus, UserAvatars } from './collaboration/CollaborativePresence';
export { RandomizerPanel, GraphPreview, RandomizerWorkflow, RandomizerSystem, LLMRandomizerSystem } from './llm-randomizer';
export { AuditLogger, createAuditLogger, AuditOperation, AuditLogLevel, InMemoryStorageBackend, type AuditLogEntry, type AuditLoggerConfig, type AuditStorageBackend, type AuditQueryCriteria, type AlertThresholds, type AuditStatistics } from './security/AuditLogger';
export { AuditIntegration, createAuditIntegration, type ComplianceReport } from './security/AuditIntegration';
export { DataClassifier, createDataClassifier, type DataClassificationResult, type ClassificationPattern, type ClassificationConfig, type ComplianceValidationResult } from './security/DataClassifier';
export { ClassificationEnforcer, createClassificationEnforcer, type EnforcementResult, type ClassificationHandlingRequirements, type ClassificationEnforcementConfig } from './security/ClassificationEnforcer';
export { ClassificationEnforcementMiddleware, createClassificationMiddleware } from './security/ClassificationEnforcementMiddleware';
export { DataClassificationLevel, type OperationContext, type ClassificationResult } from './types/DataClassification';
export { UTDGManager } from './historical/UTDGManager';
export { ConstraintValidator } from './historical/ConstraintValidator';
export { ExternalDataService } from './historical/ExternalDataService';
export { MedievalDemoDatabase, MEDIEVAL_DEMO_CONSTRAINTS, MEDIEVAL_PERIODS, MEDIEVAL_REGIONS, MEDIEVAL_FABRICS, MEDIEVAL_COLORS } from './historical/MedievalDemo';
export type { UTDGNode, Era, HistoricalConstraint, ConstraintValidationResult, DataSource, HistoricalQuery, HistoricalQueryResult, MedievalClothing, UTDGGraph, ContentGenerationConfig, GeneratedContent, VFXExportData, ValidationReport, SocialClass, Variation } from './types/UTDG';
export { HISTORICAL_ERAS } from './types/UTDG';
export { ExecutionContext, RuntimeNode, AdvancedRuntimeNode, AdvancedExecutionContext, AdvancedNodeConfig } from './runtime';
//# sourceMappingURL=index.d.ts.map