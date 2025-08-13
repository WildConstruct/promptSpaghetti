import { create } from 'zustand';
import { Edge, Node } from 'reactflow';
import { NodeData } from './types/NodeTypes';
import { addVariationToNode,
  removeVariationFromNode,
  updateVariationInNode,
  reorderVariationsInNode,
  mergeNodeData }
 from './utils/nodeDataUtils';
import { ProjectManager, ProjectMetadata, ProjectSettings, SaveProjectOptions } from './projectManager';
import { ServerProjectManager } from './serverProjectManager';
import { Template, TemplateSaveData, TemplateInstantiationOptions, GraphData } from './types/TemplateTypes';
import { templateService } from './services/TemplateService';
import { StickyNote,
  GraphAnnotations,
  NodeLabelConfig,
  NodeLabelPreferences,
  DEFAULT_NODE_LABEL_PREFERENCES,
  RegionGroup,
  RegionGroupPreferences,
  DEFAULT_REGION_GROUP_PREFERENCES,
  ConnectionLabel,
  ConnectionAnnotation,
  ConnectionAnnotationPreferences,
  DEFAULT_CONNECTION_ANNOTATION_PREFERENCES }
 from './types/CollaborationTypes';

export interface GraphState { nodes: Node;
  edges: Edge;
  // Collaboration features (Epic 8.7)
  stickyNotes: StickyNote;
  annotations: GraphAnnotations;
  // Project state
  currentProject: ProjectMetadata | null;
  projectSettings: ProjectSettings;
  hasUnsavedChanges: boolean;
  isAutoSaveEnabled: boolean;
  // Graph operations
  setNodes: (nodes: Node) => void
  setEdges: (edges: Edge) => void
  addNode: (node: Node) => void
  addEdge: (edge: Edge) => void
  updateNode: (nodeId: string, partial: Record<string, unknown>) => void;
  addVariation: (nodeId: string, variation: string) => void
  removeVariation: (nodeId: string, variationIndex: number) => void
  updateVariation: (nodeId: string, variationIndex: number, newValue: string) => void
  reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) => void
  duplicateNode: (nodeId: string) => void
  deleteNode: (nodeId: string) => void;
  // Sticky notes operations (Epic 8.7)
  setStickyNotes: (notes: StickyNote) => void
  addStickyNote: (note: StickyNote) => void
  updateStickyNote: (noteId: string, updates: Partial<StickyNote>) => void
  deleteStickyNote: (noteId: string) => void;
  // Node labels operations (Epic 8.7 Task 2)
  setNodeLabelConfigs: (configs: Record<string, NodeLabelConfig>) => void;
  addNodeLabelConfig: (config: NodeLabelConfig) => void
  updateNodeLabelConfig: (labelId: string, updates: Partial<NodeLabelConfig>) => void
  deleteNodeLabelConfig: (labelId: string) => void
  setLabelPreferences: (preferences: Partial<NodeLabelPreferences>) => void;
  // Region groups operations (Epic 8.7 Task 3)
  setRegionGroups: (groups: RegionGroup) => void
  addRegionGroup: (group: RegionGroup) => void
  updateRegionGroup: (groupId: string, updates: Partial<RegionGroup>) => void
  deleteRegionGroup: (groupId: string) => void
  setRegionGroupPreferences: (preferences: Partial<RegionGroupPreferences>) => void;
  // Connection annotations operations (Epic 8.7 Task 4)
  setConnectionLabels: (labels: ConnectionLabel) => void
  addConnectionLabel: (label: ConnectionLabel) => void
  updateConnectionLabel: (labelId: string, updates: Partial<ConnectionLabel>) => void
  removeConnectionLabel: (labelId: string) => void
  setConnectionAnnotations: (annotations: ConnectionAnnotation) => void
  addConnectionAnnotation: (annotation: ConnectionAnnotation) => void
  updateConnectionAnnotation: (annotationId: string, updates: Partial<ConnectionAnnotation>) => void
  removeConnectionAnnotation: (annotationId: string) => void;
  setConnectionAnnotationPreferences: (preferences: Partial<ConnectionAnnotationPreferences>) => void;
  connectionAnnotationPreferences?: ConnectionAnnotationPreferences;
  // Project operations (file-based)

  saveProject: (options: SaveProjectOptions) => Promise<{ success: boolean; error?: string }>;
  loadProject: () => Promise<{ success: boolean; error?: string }>;
  // Project operations (server-based)
  saveProjectToServer: (
    options: SaveProjectOptions & { userId?: number }
  ) => Promise<{ success: boolean; error?: string; projectId?: string }>;
  loadProjectFromServer: (projectId: string, userId?: number) => Promise<{ success: boolean; error?: string }>;
  updateProjectOnServer: (
    projectId: string,
    options: SaveProjectOptions & { userId?: number }
  ) => Promise<{ success: boolean; error?: string }>;
  deleteProjectFromServer: (projectId: string, userId?: number) => Promise<{ success: boolean; error?: string }>;
  listUserProjects: (
    userId?: number,
    query?: Record<string, unknown>
  ) => Promise<{ success: boolean; projects?: ProjectMetadata; error?: string }>;
  // Common project operations
  newProject: () => void
  setCurrentProject: (metadata: ProjectMetadata) => void
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void
  markProjectSaved: () => void;
  markProjectModified: () => void;
  // Graph state operations
  getGraphData: () => { nodes: Node; edges: Edge };
  loadGraphData: (nodes: Node, edges: Edge) => void;
  // Template operations
  saveAsTemplate: (;
  templateData: TemplateSaveData
    author: string
  ) => Promise<{ success: boolean; error?: string; template?: Template }>;
  applyTemplate: (;
  templateId: string,
    options: TemplateInstantiationOptions
  ) => Promise<{ success: boolean; error?: string }>;
  getTemplateCompatibleData: () => GraphData;

export const useGraphStore = create<GraphState>((set, get) => ({ // Initial state
  nodes: []
  edges: []
  stickyNotes: []
  annotations: {
  stickyNotes: [] }
    nodeLabelConfigs: {}
    labelPreferences: DEFAULT_NODE_LABEL_PREFERENCES
    regionGroups: []
    regionGroupPreferences: DEFAULT_REGION_GROUP_PREFERENCES
    connectionLabels: []
    connectionAnnotations: []
    connectionAnnotationPreferences: DEFAULT_CONNECTION_ANNOTATION_PREFERENCES
    metadata: { 
  author: 'system'
  created: new Date().toISOString()
  modified: new Date().toISOString()
  version: '1.0.0' }

    currentProject: null
    projectSettings: { 
  autoSave: true
  autoSaveInterval: 30000
  backupCount: 5
  compressionEnabled: true
  encryptionEnabled: false }

    hasUnsavedChanges: false
    isAutoSaveEnabled: true
    // Graph operations
    setNodes: (nodes: Node) => set({ nodes, hasUnsavedChanges: true })
    setEdges: (edges: Edge) => set({ edges, hasUnsavedChanges: true })
    addNode: (node: Node) =>
      set(state => ({ nodes: [...state.nodes, node]
  hasUnsavedChanges: true }
}))
    addEdge: (edge: Edge) =>
      set(state => ({ edges: [...state.edges, edge]
  hasUnsavedChanges: true }
}))
    updateNode: (nodeId: string, partial: Record<string, unknown>) =>
      set(state => ({ nodes: state.nodes.map(node => (node.id === nodeId ? mergeNodeData(node, partial as Partial<NodeData>) : node))
  hasUnsavedChanges: true }
}))
    addVariation: (nodeId: string, variation: string) =>
      set(state => ({ nodes: addVariationToNode(state.nodes, nodeId, variation)
  hasUnsavedChanges: true }
}))
    removeVariation: (nodeId: string, variationIndex: number) =>
      set(state => ({ nodes: removeVariationFromNode(state.nodes, nodeId, variationIndex)
  hasUnsavedChanges: true }
}))
    updateVariation: (nodeId: string, variationIndex: number, newValue: string) =>
      set(state => ({ nodes: updateVariationInNode(state.nodes, nodeId, variationIndex, newValue)
  hasUnsavedChanges: true }
}))
    reorderVariations: (nodeId: string, fromIndex: number, toIndex: number) =>
      set(state => ({ nodes: reorderVariationsInNode(state.nodes, nodeId, fromIndex, toIndex)
  hasUnsavedChanges: true }
}))
    duplicateNode: (nodeId: string) =>
      set(state => { const nodeToClone = state.nodes.find(n => n.id === nodeId);
        if (!nodeToClone) return state;
        const newNode = {
          ...nodeToClone }
          id: `${nodeToClone.id}-copy-${Date.now()}`
          position: { 
  x: nodeToClone.position.x + 100
  y: nodeToClone.position.y + 100 }

          data: { ...nodeToClone.data }
            label: `${nodeToClone.data.label} (Copy)`

        };
        return { nodes: [...state.nodes, newNode], hasUnsavedChanges: true };
      })
    deleteNode: (nodeId: string) =>
      set(state => ({ nodes: state.nodes.filter(n => n.id !== nodeId)
  edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
  hasUnsavedChanges: true }
}))
    // Sticky notes operations (Epic 8.7)
    setStickyNotes: (notes: StickyNote) =>
      set(state => ({ stickyNotes: notes
  annotations: {
  ...state.annotations
  stickyNotes: notes
  metadata: {
  ...state.annotations.metadata
  modified: new Date().toISOString() }


        hasUnsavedChanges: true
}))
    addStickyNote: (note: StickyNote) =>
      set(state => ({ stickyNotes: [...state.stickyNotes, note]
  annotations: {
  ...state.annotations
  stickyNotes: [...state.annotations.stickyNotes, note]
  metadata: {
  ...state.annotations.metadata
  modified: new Date().toISOString() }


        hasUnsavedChanges: true
}))
    updateStickyNote: (noteId: string, updates: Partial<StickyNote>) =>
      set(state => {
        const updatedNotes = state.stickyNotes.map(note => (note.id === noteId ? { ...note, ...updates } : note));
        return { stickyNotes: updatedNotes
  annotations: {
  ...state.annotations
  stickyNotes: updatedNotes
  metadata: {
  ...state.annotations.metadata
  modified: new Date().toISOString() }


          hasUnsavedChanges: true
};
      })
    deleteStickyNote: (noteId: string) =>
      set(state => { const filteredNotes = state.stickyNotes.filter(note => note.id !== noteId);
  return {
  stickyNotes: filteredNotes
  annotations: {
  ...state.annotations
  stickyNotes: filteredNotes
  metadata: {
  ...state.annotations.metadata
  modified: new Date().toISOString() }


          hasUnsavedChanges: true
};
      })
    // Node labels operations (Epic 8.7 Task 2)
    setNodeLabelConfigs: (configs: Record<string, any>) =>
      set(state => ({ annotations: {
  ...state.annotations
  nodeLabelConfigs: configs
  metadata: {
  ...state.annotations.metadata
  modified: new Date().toISOString() }


        hasUnsavedChanges: true
}))
    addNodeLabelConfig: (config: NodeLabelConfig) =>
      set(state => ({ annotations: {
  ...state.annotations
  nodeLabelConfigs: {
  ...state.annotations.nodeLabelConfigs
  [config.id]: config }

          metadata: { ...state.annotations.metadata
  modified: new Date().toISOString() }


        hasUnsavedChanges: true
}))
    updateNodeLabelConfig: (labelId: string, updates: Partial<NodeLabelConfig>) =>
      set(state => { const existingConfig = state.annotations.nodeLabelConfigs[labelId];
  if (!existingConfig) return state;
  return {
  annotations: {
  ...state.annotations
  nodeLabelConfigs: {
  ...state.annotations.nodeLabelConfigs
  [labelId]: {
  ...existingConfig
  ...updates
  timestamp: new Date().toISOString() }


            metadata: { ...state.annotations.metadata
  modified: new Date().toISOString() }


          hasUnsavedChanges: true
};
      })
    deleteNodeLabelConfig: (labelId: string) =>
      set(state => {
        const { [labelId]: deleted, ...remainingConfigs } = state.annotations.nodeLabelConfigs;
        return { annotations: {
  ...state.annotations
  nodeLabelConfigs: remainingConfigs
  metadata: {
  ...state.annotations.metadata
  modified: new Date().toISOString() }


          hasUnsavedChanges: true
};
      })
    setLabelPreferences: preferences =>
      set(state => ({ annotations: {
  ...state.annotations
  labelPreferences: {
  ...state.annotations.labelPreferences
  ...preferences }

          metadata: { ...state.annotations.metadata
  modified: new Date().toISOString() }


        hasUnsavedChanges: true
}))
    // Epic 8.7 Collaboration Systems and additional methods - TEMPORARILY DISABLED
    // All complex methods have been commented out for ESBuild compatibility
    // This includes region groups, connection labels, project operations, and template methods

    // Close main store object

})); // Close object literal, close function parameter, close create call
