import { Edge, Node } from 'reactflow';
import { ProjectMetadata, ProjectSettings, SaveProjectOptions } from './projectManager';
import { Template, TemplateSaveData, TemplateInstantiationOptions, GraphData } from './types/TemplateTypes';
export interface GraphState {
    nodes: Node[];
    edges: Edge[];
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
    listUserProjects: (userId?: number, query?: any) => Promise<{
        success: boolean;
        projects?: any[];
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
export declare const useGraphStore: import("zustand").UseBoundStore<import("zustand").StoreApi<GraphState>>;
//# sourceMappingURL=graphStore.d.ts.map