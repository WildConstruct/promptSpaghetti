import { create } from 'zustand';
import { addVariationToNode, removeVariationFromNode, updateVariationInNode, reorderVariationsInNode, mergeNodeData, } from './utils/nodeDataUtils';
import { DEFAULT_NODE_LABEL_PREFERENCES, DEFAULT_REGION_GROUP_PREFERENCES, DEFAULT_CONNECTION_ANNOTATION_PREFERENCES, } from './types/CollaborationTypes';
saveProject: (options) => Promise;
loadProject: () => Promise;
// Project operations (server-based)
saveProjectToServer: ();
options: SaveProjectOptions & { userId: number };
Promise;
loadProjectFromServer: (projectId, userId) => Promise;
updateProjectOnServer: ();
projectId: string,
    options;
SaveProjectOptions & { userId: number };
Promise;
deleteProjectFromServer: (projectId, userId) => Promise;
listUserProjects: (userId, query) => Promise;
// Common project operations
newProject: () => void ;
setCurrentProject: (metadata) => void ;
updateProjectSettings: (settings) => void ;
markProjectSaved: () => void ;
markProjectModified: () => void ;
// Graph state operations
getGraphData: () => { nodes: Node; edges: Edge; };
loadGraphData: (nodes, edges) => void ;
// Template operations
saveAsTemplate: ();
templateData: TemplateSaveData,
    author;
string;
Promise;
applyTemplate: ();
templateId: string,
    options;
TemplateInstantiationOptions;
Promise;
getTemplateCompatibleData: () => GraphData;
export const useGraphStore = create((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    stickyNotes: [],
    annotations: {
        stickyNotes: [],
        nodeLabelConfigs: {},
        labelPreferences: DEFAULT_NODE_LABEL_PREFERENCES,
        regionGroups: [],
        regionGroupPreferences: DEFAULT_REGION_GROUP_PREFERENCES,
        connectionLabels: [],
        connectionAnnotations: [],
        connectionAnnotationPreferences: DEFAULT_CONNECTION_ANNOTATION_PREFERENCES,
        metadata: {
            author: 'system',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0',
        },
        currentProject: null,
        projectSettings: {
            autoSave: true,
            autoSaveInterval: 30000,
            backupCount: 5,
            compressionEnabled: true,
            encryptionEnabled: false,
        },
        hasUnsavedChanges: false,
        isAutoSaveEnabled: true,
        // Graph operations
        setNodes: (nodes) => set({ nodes, hasUnsavedChanges: true }),
        setEdges: (edges) => set({ edges, hasUnsavedChanges: true }),
        addNode: (node) => set(state => ({
            nodes: [...state.nodes, node],
            hasUnsavedChanges: true,
        })),
        addEdge: (edge) => set(state => ({
            edges: [...state.edges, edge],
            hasUnsavedChanges: true,
        })),
        updateNode: (nodeId, partial) => set(state => ({
            nodes: state.nodes.map(node => (node.id === nodeId ? mergeNodeData(node, partial) : node)),
            hasUnsavedChanges: true,
        })),
        addVariation: (nodeId, variation) => set(state => ({
            nodes: addVariationToNode(state.nodes, nodeId, variation),
            hasUnsavedChanges: true,
        })),
        removeVariation: (nodeId, variationIndex) => set(state => ({
            nodes: removeVariationFromNode(state.nodes, nodeId, variationIndex),
            hasUnsavedChanges: true,
        })),
        updateVariation: (nodeId, variationIndex, newValue) => set(state => ({
            nodes: updateVariationInNode(state.nodes, nodeId, variationIndex, newValue),
            hasUnsavedChanges: true,
        })),
        reorderVariations: (nodeId, fromIndex, toIndex) => set(state => ({
            nodes: reorderVariationsInNode(state.nodes, nodeId, fromIndex, toIndex),
            hasUnsavedChanges: true,
        })),
        duplicateNode: (nodeId) => set(state => {
            const nodeToClone = state.nodes.find(n => n.id === nodeId);
            if (!nodeToClone)
                return state;
            const newNode = {
                ...nodeToClone,
                id: `${nodeToClone.id}-copy-${Date.now()}`,
                position: {
                    x: nodeToClone.position.x + 100,
                    y: nodeToClone.position.y + 100,
                },
                data: {
                    ...nodeToClone.data,
                    label: `${nodeToClone.data.label} (Copy)`,
                },
            };
            return { nodes: [...state.nodes, newNode], hasUnsavedChanges: true };
        }),
        deleteNode: (nodeId) => set(state => ({
            nodes: state.nodes.filter(n => n.id !== nodeId),
            edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
            hasUnsavedChanges: true,
        })),
        // Sticky notes operations (Epic 8.7)
        setStickyNotes: (notes) => set(state => ({
            stickyNotes: notes,
            annotations: {
                ...state.annotations,
                stickyNotes: notes,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString(),
                },
            },
            hasUnsavedChanges: true,
        })),
        addStickyNote: (note) => set(state => ({
            stickyNotes: [...state.stickyNotes, note],
            annotations: {
                ...state.annotations,
                stickyNotes: [...state.annotations.stickyNotes, note],
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString(),
                },
            },
            hasUnsavedChanges: true,
        })),
        updateStickyNote: (noteId, updates) => set(state => {
            const updatedNotes = state.stickyNotes.map(note => (note.id === noteId ? { ...note, ...updates } : note));
            return {
                stickyNotes: updatedNotes,
                annotations: {
                    ...state.annotations,
                    stickyNotes: updatedNotes,
                    metadata: {
                        ...state.annotations.metadata,
                        modified: new Date().toISOString(),
                    },
                },
                hasUnsavedChanges: true,
            };
        }),
        deleteStickyNote: (noteId) => set(state => {
            const filteredNotes = state.stickyNotes.filter(note => note.id !== noteId);
            return {
                stickyNotes: filteredNotes,
                annotations: {
                    ...state.annotations,
                    stickyNotes: filteredNotes,
                    metadata: {
                        ...state.annotations.metadata,
                        modified: new Date().toISOString(),
                    },
                },
                hasUnsavedChanges: true,
            };
        }),
        // Node labels operations (Epic 8.7 Task 2)
        setNodeLabelConfigs: (configs) => set(state => ({
            annotations: {
                ...state.annotations,
                nodeLabelConfigs: configs,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString(),
                },
            },
            hasUnsavedChanges: true,
        })),
        addNodeLabelConfig: (config) => set(state => ({
            annotations: {
                ...state.annotations,
                nodeLabelConfigs: {
                    ...state.annotations.nodeLabelConfigs,
                    [config.id]: config,
                },
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString(),
                },
            },
            hasUnsavedChanges: true,
        })),
        updateNodeLabelConfig: (labelId, updates) => set(state => {
            const existingConfig = state.annotations.nodeLabelConfigs[labelId];
            if (!existingConfig)
                return state;
            return {
                annotations: {
                    ...state.annotations,
                    nodeLabelConfigs: {
                        ...state.annotations.nodeLabelConfigs,
                        [labelId]: {
                            ...existingConfig,
                            ...updates,
                            timestamp: new Date().toISOString(),
                        },
                    },
                    metadata: {
                        ...state.annotations.metadata,
                        modified: new Date().toISOString(),
                    },
                },
                hasUnsavedChanges: true,
            };
        }),
        deleteNodeLabelConfig: (labelId) => set(state => {
            const { [labelId]: deleted, ...remainingConfigs } = state.annotations.nodeLabelConfigs;
            return {
                annotations: {
                    ...state.annotations,
                    nodeLabelConfigs: remainingConfigs,
                    metadata: {
                        ...state.annotations.metadata,
                        modified: new Date().toISOString(),
                    },
                },
                hasUnsavedChanges: true,
            };
        }),
        setLabelPreferences: preferences => set(state => ({
            annotations: {
                ...state.annotations,
                labelPreferences: {
                    ...state.annotations.labelPreferences,
                    ...preferences,
                },
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString(),
                },
            },
            hasUnsavedChanges: true,
        })),
        // Epic 8.7 Collaboration Systems and additional methods - TEMPORARILY DISABLED
        // All complex methods have been commented out for ESBuild compatibility
        // This includes region groups, connection labels, project operations, and template methods
        // Close main store object
     },
})); // Close object literal, close function parameter, close create call
