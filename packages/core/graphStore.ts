import { create } from 'zustand';
import type { Edge, Node } from 'reactflow';
// Local, minimal type definitions to avoid broken upstream imports.
// These mirror the shapes used by the editor and collaboration features.

export type StickyNoteColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'orange';

export interface StickyNote {
  id: string;
  position: { x: number; y: number };
  content: string;
  color: StickyNoteColor;
  size: { width: number; height: number };
  author: string;
  timestamp: string;
  isEditing?: boolean;
  zIndex?: number;
}

export type NodeLabelDisplayMode =
  | 'always'
  | 'hover'
  | 'focus'
  | 'selected'
  | 'never';
export type NodeLabelPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';
export type NodeLabelStyle =
  | 'default'
  | 'minimal'
  | 'professional'
  | 'colorful'
  | 'outline';

export interface NodeLabelConfig {
  id: string;
  nodeId: string;
  customLabel: string;
  displayMode: NodeLabelDisplayMode;
  position: NodeLabelPosition;
  style: NodeLabelStyle;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600';
  isEditing?: boolean;
  showIcon?: boolean;
  truncateLength?: number;
  author: string;
  timestamp: string;
}

export interface NodeLabelPreferences {
  defaultDisplayMode: NodeLabelDisplayMode;
  defaultPosition: NodeLabelPosition;
  defaultStyle: NodeLabelStyle;
  enableInlineEditing: boolean;
  enableAutoSave: boolean;
  enableLabelHistory: boolean;
  maxLabelLength: number;
  showLabelTooltips: boolean;
}

export const DEFAULT_NODE_LABEL_PREFERENCES: NodeLabelPreferences = {
  defaultDisplayMode: 'always',
  defaultPosition: 'bottom',
  defaultStyle: 'default',
  enableInlineEditing: true,
  enableAutoSave: true,
  enableLabelHistory: false,
  maxLabelLength: 120,
  showLabelTooltips: true
};

export type RegionGroupStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'rounded'
  | 'modern';
export type RegionGroupVisibility =
  | 'always'
  | 'hover'
  | 'selected'
  | 'editing'
  | 'collapsed';

export interface RegionGroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  padding?: number;
}

export interface RegionGroup {
  id: string;
  label: string;
  description?: string;
  color: string;
  backgroundColor?: string;
  opacity?: number;
  bounds: RegionGroupBounds;
  nodeIds: string[];
  collapsed: boolean;
  visible: boolean;
  style: RegionGroupStyle;
  visibility: RegionGroupVisibility;
  borderWidth?: number;
  showLabel?: boolean;
  showNodeCount?: boolean;
  isLocked?: boolean;
  zIndex?: number;
  author: string;
  timestamp: string;
  lastModified: string;
}

export interface RegionGroupPreferences {
  defaultColor: string;
  defaultBackgroundColor: string;
  defaultOpacity: number;
  defaultStyle: RegionGroupStyle;
  defaultVisibility: RegionGroupVisibility;
  defaultPadding: number;
  showLabels: boolean;
  showNodeCounts: boolean;
  enableAutoGrouping: boolean;
  autoGroupThreshold: number;
  snapToGrid: boolean;
  gridSize: number;
}

export const DEFAULT_REGION_GROUP_PREFERENCES: RegionGroupPreferences = {
  defaultColor: '#0ea5e9',
  defaultBackgroundColor: '#e0f2fe',
  defaultOpacity: 0.15,
  defaultStyle: 'rounded',
  defaultVisibility: 'always',
  defaultPadding: 8,
  showLabels: true,
  showNodeCounts: true,
  enableAutoGrouping: false,
  autoGroupThreshold: 4,
  snapToGrid: true,
  gridSize: 10
};

export type ConnectionLabelPosition = 'start' | 'middle' | 'end' | 'custom';
export type ConnectionLabelStyle =
  | 'default'
  | 'badge'
  | 'arrow'
  | 'highlight'
  | 'minimal';
export type ConnectionVisualStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'animated'
  | 'gradient';

export interface ConnectionLabel {
  id: string;
  connectionId: string;
  content: string;
  description?: string;
  position: { x: number; y: number };
  positionType: ConnectionLabelPosition;
  positionOffset: number; // 0-1
  style: ConnectionLabelStyle;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600';
  isEditing?: boolean;
  showIcon?: boolean;
  icon?: string;
  visible: boolean;
  author: string;
  timestamp: string;
  lastModified: string;
}

export interface ConnectionAnnotation {
  id: string;
  connectionId: string;
  labels: ConnectionLabel[];
  visualStyle: ConnectionVisualStyle;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  showDirection?: boolean;
  showStartMarker?: boolean;
  showEndMarker?: boolean;
  isHighlighted?: boolean;
  category?: string;
  metadata?: Record<string, unknown>;
  author: string;
  timestamp: string;
  lastModified: string;
}

export interface ConnectionAnnotationPreferences {
  defaultLabelStyle: ConnectionLabelStyle;
  defaultVisualStyle: ConnectionVisualStyle;
  defaultColor: string;
  defaultPosition: ConnectionLabelPosition;
  enableInlineEditing: boolean;
  showTooltips: boolean;
  autoPositioning: boolean;
  snapToPath: boolean;
  showDirectionArrows: boolean;
  maxLabelLength: number;
  highlightOnHover: boolean;
}

export const DEFAULT_CONNECTION_ANNOTATION_PREFERENCES: ConnectionAnnotationPreferences =
  {
    defaultLabelStyle: 'default',
    defaultVisualStyle: 'solid',
    defaultColor: '#64748b',
    defaultPosition: 'middle',
    enableInlineEditing: true,
    showTooltips: true,
    autoPositioning: true,
    snapToPath: true,
    showDirectionArrows: false,
    maxLabelLength: 80,
    highlightOnHover: true
  };

export interface GraphAnnotations {
  stickyNotes: StickyNote[];
  nodeLabels?: Record<string, string>; // backward-compat
  nodeLabelConfigs: Record<string, NodeLabelConfig>;
  regionGroups: RegionGroup[];
  connectionLabels?: ConnectionLabel[]; // backward-compat
  connectionAnnotations: ConnectionAnnotation[];
  labelPreferences: NodeLabelPreferences;
  regionGroupPreferences: RegionGroupPreferences;
  connectionAnnotationPreferences: ConnectionAnnotationPreferences;
  metadata: {
    author: string;
    created: string;
    modified: string;
    version: string;
  };
}

export interface ProjectMetadata {
  id?: string;
  name: string;
  description?: string;
  author?: string;
  tags?: string[];
  created?: string;
  modified?: string;
  version?: string;
}

export interface ProjectSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  backupCount?: number;
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  // Collaboration
  stickyNotes: StickyNote[];
  annotations: GraphAnnotations;
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
  updateNode: (nodeId: string, updates: Partial<Node>) => void;

  // Variations on node.data.variations (string[])
  addVariation: (nodeId: string, variation: string) => void;
  removeVariation: (nodeId: string, variationIndex: number) => void;
  updateVariation: (
    nodeId: string,
    variationIndex: number,
    newValue: string
  ) => void;
  reorderVariations: (
    nodeId: string,
    fromIndex: number,
    toIndex: number
  ) => void;

  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  // Sticky notes
  setStickyNotes: (notes: StickyNote[]) => void;
  addStickyNote: (note: StickyNote) => void;
  updateStickyNote: (noteId: string, updates: Partial<StickyNote>) => void;
  deleteStickyNote: (noteId: string) => void;

  // Node labels
  setNodeLabelConfigs: (configs: Record<string, NodeLabelConfig>) => void;
  addNodeLabelConfig: (config: NodeLabelConfig) => void;
  updateNodeLabelConfig: (
    labelId: string,
    updates: Partial<NodeLabelConfig>
  ) => void;
  deleteNodeLabelConfig: (labelId: string) => void;
  setLabelPreferences: (preferences: Partial<NodeLabelPreferences>) => void;

  // Region groups
  setRegionGroups: (groups: RegionGroup[]) => void;
  addRegionGroup: (group: RegionGroup) => void;
  updateRegionGroup: (groupId: string, updates: Partial<RegionGroup>) => void;
  deleteRegionGroup: (groupId: string) => void;
  setRegionGroupPreferences: (
    preferences: Partial<RegionGroupPreferences>
  ) => void;

  // Connection annotations
  setConnectionLabels: (labels: ConnectionLabel[]) => void;
  addConnectionLabel: (label: ConnectionLabel) => void;
  updateConnectionLabel: (
    labelId: string,
    updates: Partial<ConnectionLabel>
  ) => void;
  removeConnectionLabel: (labelId: string) => void;

  setConnectionAnnotations: (annotations: ConnectionAnnotation[]) => void;
  addConnectionAnnotation: (annotation: ConnectionAnnotation) => void;
  updateConnectionAnnotation: (
    annotationId: string,
    updates: Partial<ConnectionAnnotation>
  ) => void;
  removeConnectionAnnotation: (annotationId: string) => void;
  setConnectionAnnotationPreferences: (
    preferences: Partial<ConnectionAnnotationPreferences>
  ) => void;

  // Project operations (local only)
  newProject: () => void;
  setCurrentProject: (metadata: ProjectMetadata) => void;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  markProjectSaved: () => void;
  markProjectModified: () => void;

  // Graph state operations
  getGraphData: () => { nodes: Node[]; edges: Edge[] };
  loadGraphData: (nodes: Node[], edges: Edge[]) => void;
}

type VariationNodeData = Record<string, unknown> & { variations?: string[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getNodeData(node: Node): VariationNodeData {
  return isRecord(node.data) ? node.data : {};
}

function getVariations(node: Node): string[] {
  const variations = getNodeData(node).variations;
  return Array.isArray(variations) ? variations : [];
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  stickyNotes: [],
  annotations: {
    stickyNotes: [],
    nodeLabelConfigs: {},
    regionGroups: [],
    connectionLabels: [],
    connectionAnnotations: [],
    labelPreferences: DEFAULT_NODE_LABEL_PREFERENCES,
    regionGroupPreferences: DEFAULT_REGION_GROUP_PREFERENCES,
    connectionAnnotationPreferences: DEFAULT_CONNECTION_ANNOTATION_PREFERENCES,
    metadata: {
      author: 'system',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      version: '1.0.0'
    }
  },
  currentProject: null,
  projectSettings: {
    autoSave: true,
    autoSaveInterval: 30000,
    backupCount: 5,
    compressionEnabled: true,
    encryptionEnabled: false
  },
  hasUnsavedChanges: false,
  isAutoSaveEnabled: true,

  // Graph operations
  setNodes: nodes => set({ nodes, hasUnsavedChanges: true }),
  setEdges: edges => set({ edges, hasUnsavedChanges: true }),
  addNode: node =>
    set(state => ({ nodes: [...state.nodes, node], hasUnsavedChanges: true })),
  addEdge: edge =>
    set(state => ({ edges: [...state.edges, edge], hasUnsavedChanges: true })),
  updateNode: (nodeId, updates) =>
    set(state => ({
      nodes: state.nodes.map(n => {
        if (n.id !== nodeId) return n;
        const merged: Node = { ...n, ...updates } as Node;
        if (isRecord(updates.data)) {
          merged.data = { ...getNodeData(n), ...updates.data };
        }
        return merged;
      }),
      hasUnsavedChanges: true
    })),

  // Variations
  addVariation: (nodeId, variation) =>
    set(state => ({
      nodes: state.nodes.map(n =>
        n.id === nodeId
          ? ({
              ...n,
              data: {
                ...getNodeData(n),
                variations: [...getVariations(n), variation]
              }
            } as Node)
          : n
      ),
      hasUnsavedChanges: true
    })),
  removeVariation: (nodeId, variationIndex) =>
    set(state => ({
      nodes: state.nodes.map(n => {
        if (n.id !== nodeId) return n;
        const arr = getVariations(n);
        return {
          ...n,
          data: {
            ...getNodeData(n),
            variations: arr.filter((_, i) => i !== variationIndex)
          }
        } as Node;
      }),
      hasUnsavedChanges: true
    })),
  updateVariation: (nodeId, variationIndex, newValue) =>
    set(state => ({
      nodes: state.nodes.map(n => {
        if (n.id !== nodeId) return n;
        const arr = [...getVariations(n)];
        arr[variationIndex] = newValue;
        return { ...n, data: { ...getNodeData(n), variations: arr } } as Node;
      }),
      hasUnsavedChanges: true
    })),
  reorderVariations: (nodeId, fromIndex, toIndex) =>
    set(state => ({
      nodes: state.nodes.map(n => {
        if (n.id !== nodeId) return n;
        const arr = [...getVariations(n)];
        if (
          fromIndex < 0 ||
          fromIndex >= arr.length ||
          toIndex < 0 ||
          toIndex >= arr.length
        )
          return n;
        const [moved] = arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, moved);
        return { ...n, data: { ...getNodeData(n), variations: arr } } as Node;
      }),
      hasUnsavedChanges: true
    })),

  duplicateNode: nodeId =>
    set(state => {
      const src = state.nodes.find(n => n.id === nodeId);
      if (!src) return state;
      const copy: Node = {
        ...src,
        id: `${src.id}-copy-${Date.now()}`,
        position: {
          x: src.position.x + 100 || 100,
          y: src.position.y + 100 || 100
        },
        data: { ...getNodeData(src) }
      } as Node;
      return { nodes: [...state.nodes, copy], hasUnsavedChanges: true };
    }),
  deleteNode: nodeId =>
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(
        e => e.source !== nodeId && e.target !== nodeId
      ),
      hasUnsavedChanges: true
    })),

  // Sticky notes
  setStickyNotes: notes =>
    set(state => ({
      stickyNotes: notes,
      annotations: {
        ...state.annotations,
        stickyNotes: notes,
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  addStickyNote: note =>
    set(state => ({
      stickyNotes: [...state.stickyNotes, note],
      annotations: {
        ...state.annotations,
        stickyNotes: [...state.annotations.stickyNotes, note],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  updateStickyNote: (noteId, updates) =>
    set(state => {
      const upd = (arr: StickyNote[]) =>
        arr.map(n => (n.id === noteId ? { ...n, ...updates } : n));
      const updated = upd(state.stickyNotes);
      return {
        stickyNotes: updated,
        annotations: {
          ...state.annotations,
          stickyNotes: upd(state.annotations.stickyNotes),
          metadata: {
            ...state.annotations.metadata,
            modified: new Date().toISOString()
          }
        },
        hasUnsavedChanges: true
      };
    }),
  deleteStickyNote: noteId =>
    set(state => {
      const filtered = state.stickyNotes.filter(n => n.id !== noteId);
      return {
        stickyNotes: filtered,
        annotations: {
          ...state.annotations,
          stickyNotes: state.annotations.stickyNotes.filter(
            n => n.id !== noteId
          ),
          metadata: {
            ...state.annotations.metadata,
            modified: new Date().toISOString()
          }
        },
        hasUnsavedChanges: true
      };
    }),

  // Node labels
  setNodeLabelConfigs: configs =>
    set(state => ({
      annotations: {
        ...state.annotations,
        nodeLabelConfigs: { ...configs },
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  addNodeLabelConfig: config =>
    set(state => ({
      annotations: {
        ...state.annotations,
        nodeLabelConfigs: {
          ...state.annotations.nodeLabelConfigs,
          [config.id]: config
        },
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  updateNodeLabelConfig: (labelId, updates) =>
    set(state => {
      const existing = state.annotations.nodeLabelConfigs[labelId];
      if (!existing) return state;
      return {
        annotations: {
          ...state.annotations,
          nodeLabelConfigs: {
            ...state.annotations.nodeLabelConfigs,
            [labelId]: {
              ...existing,
              ...updates,
              timestamp: new Date().toISOString()
            }
          },
          metadata: {
            ...state.annotations.metadata,
            modified: new Date().toISOString()
          }
        },
        hasUnsavedChanges: true
      };
    }),
  deleteNodeLabelConfig: labelId =>
    set(state => {
      const entries = Object.entries(state.annotations.nodeLabelConfigs).filter(
        ([k]) => k !== labelId
      );
      const rest = Object.fromEntries(entries);
      return {
        annotations: {
          ...state.annotations,
          nodeLabelConfigs: rest,
          metadata: {
            ...state.annotations.metadata,
            modified: new Date().toISOString()
          }
        },
        hasUnsavedChanges: true
      };
    }),
  setLabelPreferences: preferences =>
    set(state => ({
      annotations: {
        ...state.annotations,
        labelPreferences: {
          ...state.annotations.labelPreferences,
          ...preferences
        },
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),

  // Region groups
  setRegionGroups: groups =>
    set(state => ({
      annotations: {
        ...state.annotations,
        regionGroups: [...groups],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  addRegionGroup: group =>
    set(state => ({
      annotations: {
        ...state.annotations,
        regionGroups: [...state.annotations.regionGroups, group],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  updateRegionGroup: (groupId, updates) =>
    set(state => ({
      annotations: {
        ...state.annotations,
        regionGroups: state.annotations.regionGroups.map(g =>
          g.id === groupId
            ? { ...g, ...updates, lastModified: new Date().toISOString() }
            : g
        ),
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  deleteRegionGroup: groupId =>
    set(state => ({
      annotations: {
        ...state.annotations,
        regionGroups: state.annotations.regionGroups.filter(
          g => g.id !== groupId
        ),
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  setRegionGroupPreferences: preferences =>
    set(state => ({
      annotations: {
        ...state.annotations,
        regionGroupPreferences: {
          ...state.annotations.regionGroupPreferences,
          ...preferences
        },
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),

  // Connection labels + annotations
  setConnectionLabels: labels =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionLabels: [...labels],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  addConnectionLabel: label =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionLabels: [
          ...(state.annotations.connectionLabels || []),
          label
        ],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  updateConnectionLabel: (labelId, updates) =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionLabels: (state.annotations.connectionLabels || []).map(l =>
          l.id === labelId
            ? { ...l, ...updates, lastModified: new Date().toISOString() }
            : l
        ),
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  removeConnectionLabel: labelId =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionLabels: (state.annotations.connectionLabels || []).filter(
          l => l.id !== labelId
        ),
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),

  setConnectionAnnotations: annotations =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionAnnotations: [...annotations],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  addConnectionAnnotation: annotation =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionAnnotations: [
          ...state.annotations.connectionAnnotations,
          annotation
        ],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  updateConnectionAnnotation: (annotationId, updates) =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionAnnotations: state.annotations.connectionAnnotations.map(a =>
          a.id === annotationId
            ? { ...a, ...updates, lastModified: new Date().toISOString() }
            : a
        ),
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  removeConnectionAnnotation: annotationId =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionAnnotations: state.annotations.connectionAnnotations.filter(
          a => a.id !== annotationId
        ),
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),
  setConnectionAnnotationPreferences: preferences =>
    set(state => ({
      annotations: {
        ...state.annotations,
        connectionAnnotationPreferences: {
          ...state.annotations.connectionAnnotationPreferences,
          ...preferences
        },
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      hasUnsavedChanges: true
    })),

  // Project operations (local only)
  newProject: () =>
    set(state => ({
      nodes: [],
      edges: [],
      stickyNotes: [],
      annotations: {
        ...state.annotations,
        stickyNotes: [],
        nodeLabelConfigs: {},
        regionGroups: [],
        connectionLabels: [],
        connectionAnnotations: [],
        metadata: {
          ...state.annotations.metadata,
          modified: new Date().toISOString()
        }
      },
      currentProject: null,
      hasUnsavedChanges: false
    })),
  setCurrentProject: metadata =>
    set(() => ({ currentProject: metadata, hasUnsavedChanges: true })),
  updateProjectSettings: settings =>
    set(state => ({
      projectSettings: { ...state.projectSettings, ...settings },
      hasUnsavedChanges: true
    })),
  markProjectSaved: () => set(() => ({ hasUnsavedChanges: false })),
  markProjectModified: () => set(() => ({ hasUnsavedChanges: true })),

  // Graph state ops
  getGraphData: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },
  loadGraphData: (nodes, edges) =>
    set(() => ({ nodes, edges, hasUnsavedChanges: true }))
}));
