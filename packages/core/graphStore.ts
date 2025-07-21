import { create } from 'zustand';
import { Edge, Node } from 'reactflow';
import { NodeData } from './types/NodeTypes';
import { 
  addVariationToNode, 
  removeVariationFromNode, 
  updateVariationInNode, 
  reorderVariationsInNode,
  mergeNodeData
} from './utils/nodeDataUtils';
import { ProjectManager, ProjectMetadata, ProjectSettings, SaveProjectOptions } from './projectManager';
import { ServerProjectManager } from './serverProjectManager';

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  
  // Project state
  currentProject: ProjectMetadata | null;
  projectSettings: ProjectSettings;
  hasUnsavedChanges: boolean;
  isAutoSaveEnabled: boolean;
  
  // Graph operations
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
  
  // Project operations (file-based)
  saveProject: (options: SaveProjectOptions) => Promise<{ success: boolean; error?: string }>;
  loadProject: () => Promise<{ success: boolean; error?: string }>;
  
  // Project operations (server-based)
  saveProjectToServer: (options: SaveProjectOptions & { userId?: number }) => Promise<{ success: boolean; error?: string; projectId?: string }>;
  loadProjectFromServer: (projectId: string, userId?: number) => Promise<{ success: boolean; error?: string }>;
  updateProjectOnServer: (
    projectId: string,
    options: SaveProjectOptions & { userId?: number }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteProjectFromServer: (projectId: string, userId?: number) => Promise<{ success: boolean; error?: string }>;
  listUserProjects: (userId?: number, query?: any) => Promise<{ success: boolean; projects?: any[]; error?: string }>;
  
  // Common project operations
  newProject: () => void;
  setCurrentProject: (metadata: ProjectMetadata) => void;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  markProjectSaved: () => void;
  markProjectModified: () => void;
  
  // Graph state operations
  getGraphData: () => { nodes: Node[]; edges: Edge[] };
  loadGraphData: (nodes: Node[], edges: Edge[]) => void;
}

export       if (!nodeToClone) return state;
      
      const newNode = {
        ...nodeToClone,
        id: `${nodeToClone.id}-copy-${Date.now()}`,
        position: {
          x: nodeToClone.position.x + 100,
          y: nodeToClone.position.y + 100
        },
        data: {
          ...nodeToClone.data,
          label: `${nodeToClone.data.label} (Copy)`
        }
      };
      
      return { nodes: [...state.nodes, newNode], hasUnsavedChanges: true };
    }),
  
  deleteNode: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      hasUnsavedChanges: true
    })),
  
  // Project operations
  saveProject: async (options: SaveProjectOptions) => {
    const state = get();
    try {
      const result = await ProjectManager.saveProjectToDevice(
        { nodes: state.nodes, edges: state.edges },
        options,
        state.projectSettings
      );
      
      if (result.success) {
        set({ 
          hasUnsavedChanges: false,
          currentProject: result.fileName ? {
            name: options.name,
            description: options.description,
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            author: options.author,
            tags: options.tags || [],
            fileFormatVersion: '1.0.0',
          } : state.currentProject
        });
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  loadProject: async () => {
    try {
      const result = await ProjectManager.loadProjectFromDevice();
      
      if (result.success && result.data) {
        set({
          nodes: result.data.graph.nodes,
          edges: result.data.graph.edges,
          currentProject: result.data.metadata,
          projectSettings: { ...get().projectSettings, ...result.data.settings },
          hasUnsavedChanges: false
        });
        
        return { success: true, warnings: result.warnings };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
  
  newProject: () => {
    set({
      nodes: [],
      edges: [],
      currentProject: null,
      hasUnsavedChanges: false
    });
  },
  
  setCurrentProject: (metadata: ProjectMetadata) => {
    set({ currentProject: metadata });
  },
  
  updateProjectSettings: (settings: Partial<ProjectSettings>) => {
    set((state) => ({
      projectSettings: { ...state.projectSettings, ...settings },
      hasUnsavedChanges: true
    }));
  },
  
  markProjectSaved: () => {
    set({ hasUnsavedChanges: false });
  },
  
  markProjectModified: () => {
    set({ hasUnsavedChanges: true });
  },
  
  getGraphData: () => {
    const state = get();
    return { nodes: state.nodes, edges: state.edges };
  },
  
  loadGraphData: (nodes: Node[], edges: Edge[]) => {
    set({ nodes, edges, hasUnsavedChanges: false });
  },

  // Server-based project operations
  saveProjectToServer: async (options: SaveProjectOptions & { userId?: number }) => {
    const state = get();
    try {
      const result = await ServerProjectManager.saveProjectToServer(
        { nodes: state.nodes, edges: state.edges },
        options,
        state.projectSettings,
        options.userId
      );
      
      if (result.success) {
        set({ 
          hasUnsavedChanges: false,
          currentProject: {
            name: options.name,
            description: options.description,
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            author: options.author,
            tags: options.tags || [],
            fileFormatVersion: '1.0.0',
          }
        });
      }
      
      return {
        success: result.success,
        error: result.error,
        projectId: result.projectId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  loadProjectFromServer: async (projectId: string, userId?: number) => {
    try {
      const result = await ServerProjectManager.loadProjectFromServer(projectId, userId);
      
      if (result.success && result.data) {
        set({
          nodes: result.data.graph.nodes,
          edges: result.data.graph.edges,
          currentProject: result.data.metadata,
          projectSettings: { ...get().projectSettings, ...result.data.settings },
          hasUnsavedChanges: false
        });
        
        return { success: true, warnings: result.warnings };
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  updateProjectOnServer: async (projectId: string, options: SaveProjectOptions & { userId?: number }) => {
    const state = get();
    try {
      const result = await ServerProjectManager.updateProjectOnServer(
        projectId,
        { nodes: state.nodes, edges: state.edges },
        options,
        state.projectSettings,
        options.userId
      );
      
      if (result.success) {
        set({ 
          hasUnsavedChanges: false,
          currentProject: {
            ...state.currentProject,
            name: options.name,
            description: options.description,
            author: options.author,
            tags: options.tags || [],
            lastModified: new Date().toISOString(),
          }
        });
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  deleteProjectFromServer: async (projectId: string, userId?: number) => {
    try {
      const result = await ServerProjectManager.deleteProjectFromServer(projectId, userId);
      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  listUserProjects: async (userId?: number, query?: any) => {
    try {
      const result = await ServerProjectManager.getUserProjects({
        userId,
        ...query,
      });
      
      if ('error' in result) {
        return {
          success: false,
          error: result.error,
        };
      }
      
      return {
        success: true,
        projects: result.projects,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
}));
