import { Edge, Node } from 'reactflow';
import { ProjectMetadata, ProjectSettings, SaveProjectOptions } from './projectManager';
import { Template, TemplateSaveData, TemplateInstantiationOptions, GraphData } from './types/TemplateTypes';
import { StickyNote, GraphAnnotations, NodeLabelConfig, NodeLabelPreferences, RegionGroup, RegionGroupPreferences, ConnectionLabel, ConnectionAnnotation, ConnectionAnnotationPreferences } from './types/CollaborationTypes';
export interface GraphState {
    nodes: Node[];
    edges: Edge[];
    stickyNotes: StickyNote[];
    annotations: GraphAnnotations;
    currentProject: ProjectMetadata | null;
    projectSettings: ProjectSettings;
    hasUnsavedChanges: boolean;
    isAutoSaveEnabled: boolean;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    addEdge: (edge: Edge) => void;
    updateNode: (nodeId: string, partial: Record<string, unknown>) => void;
    addVariation: (nodeId: string, variation: string) => void;
    removeVariation: (nodeId: string, variationIndex: number) => void;
    updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void;
    reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void;
    duplicateNode: (nodeId: string) => void;
    deleteNode: (nodeId: string) => void;
    setStickyNotes: (notes: StickyNote[]) => void;
    addStickyNote: (note: StickyNote) => void;
    updateStickyNote: (noteId: string, updates: Partial<StickyNote>) => void;
    deleteStickyNote: (noteId: string) => void;
    setNodeLabelConfigs: (configs: Record<string, NodeLabelConfig>) => void;
    addNodeLabelConfig: (config: NodeLabelConfig) => void;
    updateNodeLabelConfig: (labelId: string, updates: Partial<NodeLabelConfig>) => void;
    deleteNodeLabelConfig: (labelId: string) => void;
    setLabelPreferences: (preferences: Partial<NodeLabelPreferences>) => void;
    setRegionGroups: (groups: RegionGroup[]) => void;
    addRegionGroup: (group: RegionGroup) => void;
    updateRegionGroup: (groupId: string, updates: Partial<RegionGroup>) => void;
    deleteRegionGroup: (groupId: string) => void;
    setRegionGroupPreferences: (preferences: Partial<RegionGroupPreferences>) => void;
    setConnectionLabels: (labels: ConnectionLabel[]) => void;
    addConnectionLabel: (label: ConnectionLabel) => void;
    updateConnectionLabel: (labelId: string, updates: Partial<ConnectionLabel>) => void;
    removeConnectionLabel: (labelId: string) => void;
    setConnectionAnnotations: (annotations: ConnectionAnnotation[]) => void;
    addConnectionAnnotation: (annotation: ConnectionAnnotation) => void;
    updateConnectionAnnotation: (annotationId: string, updates: Partial<ConnectionAnnotation>) => void;
    removeConnectionAnnotation: (annotationId: string) => void;
    setConnectionAnnotationPreferences: (preferences: Partial<ConnectionAnnotationPreferences>) => void;
    connectionAnnotationPreferences?: ConnectionAnnotationPreferences;
    saveProject: (options: SaveProjectOptions) => Promise<{
        success: boolean;
        error?: string;
    }>;
    loadProject: () => Promise<{
        success: boolean;
        error?: string;
    }>;
    saveProjectToServer: (options: SaveProjectOptions & {
        userId?: number;
    }) => Promise<{
        success: boolean;
        error?: string;
        projectId?: string;
    }>;
    loadProjectFromServer: (projectId: string, userId?: number) => Promise<{
        success: boolean;
        error?: string;
    }>;
    updateProjectOnServer: (projectId: string, options: SaveProjectOptions & {
        userId?: number;
    }) => Promise<{
        success: boolean;
        error?: string;
    }>;
    deleteProjectFromServer: (projectId: string, userId?: number) => Promise<{
        success: boolean;
        error?: string;
    }>;
    listUserProjects: (userId?: number, query?: Record<string, unknown>) => Promise<{
        success: boolean;
        projects?: ProjectMetadata[];
        error?: string;
    }>;
    newProject: () => void;
    setCurrentProject: (metadata: ProjectMetadata) => void;
    updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
    markProjectSaved: () => void;
    markProjectModified: () => void;
    getGraphData: () => {
        nodes: Node[];
        edges: Edge[];
    };
    loadGraphData: (nodes: Node[], edges: Edge[]) => void;
    saveAsTemplate: (templateData: TemplateSaveData, author: string) => Promise<{
        success: boolean;
        error?: string;
        template?: Template;
    }>;
    applyTemplate: (templateId: string, options: TemplateInstantiationOptions) => Promise<{
        success: boolean;
        error?: string;
    }>;
    getTemplateCompatibleData: () => GraphData;
}
//# sourceMappingURL=graphStore.d.ts.map