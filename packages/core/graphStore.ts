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
  
  // Project operations
  saveProject: (options: SaveProjectOptions) => Promise<{ success: boolean; error?: string }>;
  loadProject: () => Promise<{ success: boolean; error?: string }>;
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
  }
}));
