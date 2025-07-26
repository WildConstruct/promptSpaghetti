import { create } from 'zustand';
import { ProjectManager } from './projectManager';
import { ServerProjectManager } from './serverProjectManager';
import { templateService } from './services/TemplateService';
import { DEFAULT_NODE_LABEL_PREFERENCES, DEFAULT_REGION_GROUP_PREFERENCES, DEFAULT_CONNECTION_ANNOTATION_PREFERENCES } from './types/CollaborationTypes';
export const useGraphStore = create((set, get) => ({
    nodes: [],
    edges: [],
    // Collaboration features (Epic 8.7)
    stickyNotes: [],
    annotations: {
        stickyNotes: [],
        nodeLabels: {},
        nodeLabelConfigs: {},
        regionGroups: [],
        connectionLabels: [],
        connectionAnnotations: [],
        labelPreferences: DEFAULT_NODE_LABEL_PREFERENCES,
        regionGroupPreferences: DEFAULT_REGION_GROUP_PREFERENCES,
        connectionAnnotationPreferences: DEFAULT_CONNECTION_ANNOTATION_PREFERENCES,
        metadata: {
            author: 'Anonymous',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0'
        }
    },
    // Connection annotation preferences
    connectionAnnotationPreferences: DEFAULT_CONNECTION_ANNOTATION_PREFERENCES,
    currentProject: null,
    projectSettings: {
        autoSave: true,
        backupInterval: 5,
        maxBackups: 10
    },
    hasUnsavedChanges: false,
    isAutoSaveEnabled: true,
    cloneNode: (nodeId: string) => set((state) => {
        const nodeToClone = state.nodes.find(n => n.id === nodeId);
        if (!nodeToClone)
            return state;
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
    deleteNode: (nodeId: string) => set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        hasUnsavedChanges: true
    })),
    // Sticky notes operations (Epic 8.7)
    setStickyNotes: (notes: any[]) => set((state) => ({
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
    addStickyNote: (note: any) => set((state) => ({
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
    updateStickyNote: (noteId: string, updates: any) => set((state) => {
        const updatedNotes = state.stickyNotes.map(note => note.id === noteId ? { ...note, ...updates } : note);
        return {
            stickyNotes: updatedNotes,
            annotations: {
                ...state.annotations,
                stickyNotes: updatedNotes,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString()
                }
            },
            hasUnsavedChanges: true
        };
    }),
    deleteStickyNote: (noteId: string) => set((state) => {
        const filteredNotes = state.stickyNotes.filter(note => note.id !== noteId);
        return {
            stickyNotes: filteredNotes,
            annotations: {
                ...state.annotations,
                stickyNotes: filteredNotes,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString()
                }
            },
            hasUnsavedChanges: true
        };
    }),
    // Node labels operations (Epic 8.7 Task 2)
    setNodeLabelConfigs: (configs: any) => set((state) => ({
        annotations: {
            ...state.annotations,
            nodeLabelConfigs: configs,
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    addNodeLabelConfig: (config: any) => set((state) => ({
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
    updateNodeLabelConfig: (labelId: string, updates: any) => set((state) => {
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
    deleteNodeLabelConfig: (labelId: string) => set((state) => {
        const { [labelId]: deleted, ...remainingConfigs } = state.annotations.nodeLabelConfigs;
        return {
            annotations: {
                ...state.annotations,
                nodeLabelConfigs: remainingConfigs,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString()
                }
            },
            hasUnsavedChanges: true
        };
    }),
    setLabelPreferences: (preferences: any) => set((state) => ({
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
    // Region groups operations (Epic 8.7 Task 3)
    setRegionGroups: (groups: any[]) => set((state) => ({
        annotations: {
            ...state.annotations,
            regionGroups: groups,
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    addRegionGroup: (group: any) => set((state) => ({
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
    updateRegionGroup: (groupId: string, updates: any) => set((state) => {
        const existingGroup = state.annotations.regionGroups.find(g => g.id === groupId);
        if (!existingGroup)
            return state;
        return {
            annotations: {
                ...state.annotations,
                regionGroups: state.annotations.regionGroups.map(group => group.id === groupId
                    ? { ...group, ...updates, lastModified: new Date().toISOString() }
                    : group),
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString()
                }
            },
            hasUnsavedChanges: true
        };
    }),
    deleteRegionGroup: (groupId: string) => set((state) => ({
        annotations: {
            ...state.annotations,
            regionGroups: state.annotations.regionGroups.filter(group => group.id !== groupId),
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    setRegionGroupPreferences: (preferences: any) => set((state) => ({
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
    // Connection annotations operations (Epic 8.7 Task 4)
    setConnectionLabels: (labels: any[]) => set((state) => ({
        annotations: {
            ...state.annotations,
            connectionLabels: labels,
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    addConnectionLabel: (label: any) => set((state) => ({
        annotations: {
            ...state.annotations,
            connectionLabels: [...(state.annotations.connectionLabels || []), label],
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    updateConnectionLabel: (labelId: string, updates: any) => set((state) => {
        const updatedLabels = (state.annotations.connectionLabels || []).map(label => label.id === labelId ? { ...label, ...updates } : label);
        return {
            annotations: {
                ...state.annotations,
                connectionLabels: updatedLabels,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString()
                }
            },
            hasUnsavedChanges: true
        };
    }),
    removeConnectionLabel: (labelId: string) => set((state) => ({
        annotations: {
            ...state.annotations,
            connectionLabels: (state.annotations.connectionLabels || []).filter(label => label.id !== labelId),
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    setConnectionAnnotations: (annotations: any[]) => set((state) => ({
        annotations: {
            ...state.annotations,
            connectionAnnotations: annotations,
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    addConnectionAnnotation: (annotation: any) => set((state) => ({
        annotations: {
            ...state.annotations,
            connectionAnnotations: [...(state.annotations.connectionAnnotations || []), annotation],
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    updateConnectionAnnotation: (annotationId: string, updates: any) => set((state) => {
        const updatedAnnotations = (state.annotations.connectionAnnotations || []).map(annotation => annotation.id === annotationId ? { ...annotation, ...updates } : annotation);
        return {
            annotations: {
                ...state.annotations,
                connectionAnnotations: updatedAnnotations,
                metadata: {
                    ...state.annotations.metadata,
                    modified: new Date().toISOString()
                }
            },
            hasUnsavedChanges: true
        };
    }),
    removeConnectionAnnotation: (annotationId: string) => set((state) => ({
        annotations: {
            ...state.annotations,
            connectionAnnotations: (state.annotations.connectionAnnotations || []).filter(annotation => annotation.id !== annotationId),
            metadata: {
                ...state.annotations.metadata,
                modified: new Date().toISOString()
            }
        },
        hasUnsavedChanges: true
    })),
    setConnectionAnnotationPreferences: (preferences: any) => set((state) => ({
        connectionAnnotationPreferences: {
            ...state.connectionAnnotationPreferences,
            ...preferences
        },
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
    // Project operations
    saveProject: async (options: any) => {
        const state = get();
        try {
            const result = await ProjectManager.saveProjectToDevice({ nodes: state.nodes, edges: state.edges }, options, state.projectSettings);
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
                        fileFormatVersion: '1.0.0'
                    } : state.currentProject
                });
            }
            return result;
        }
        catch (error) {
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
        }
        catch (error) {
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
    setCurrentProject: (metadata: any) => {
        set({ currentProject: metadata });
    },
    updateProjectSettings: (settings: any) => {
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
    loadGraphData: (nodes: any[], edges: any[]) => {
        set({ nodes, edges, hasUnsavedChanges: false });
    },
    // Server-based project operations
    saveProjectToServer: async (options: any) => {
        const state = get();
        try {
            const result = await ServerProjectManager.saveProjectToServer({ nodes: state.nodes, edges: state.edges }, options, state.projectSettings, options.userId);
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
                        fileFormatVersion: '1.0.0'
                    }
                });
            }
            return {
                success: result.success,
                error: result.error,
                projectId: result.projectId
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    loadProjectFromServer: async (projectId: string, userId: string) => {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    updateProjectOnServer: async (projectId: string, options: any) => {
        const state = get();
        try {
            const result = await ServerProjectManager.updateProjectOnServer(projectId, { nodes: state.nodes, edges: state.edges }, options, state.projectSettings, options.userId);
            if (result.success) {
                set({
                    hasUnsavedChanges: false,
                    currentProject: {
                        ...state.currentProject,
                        name: options.name,
                        description: options.description,
                        author: options.author,
                        tags: options.tags || [],
                        lastModified: new Date().toISOString()
                    }
                });
            }
            return result;
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    deleteProjectFromServer: async (projectId: string, userId: string) => {
        try {
            const result = await ServerProjectManager.deleteProjectFromServer(projectId, userId);
            return {
                success: result.success,
                error: result.error
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    listUserProjects: async (userId: string, query: any) => {
        try {
            const result = await ServerProjectManager.getUserProjects({
                userId,
                ...query
            });
            if ('error' in result) {
                return {
                    success: false,
                    error: result.error
                };
            }
            return {
                success: true,
                projects: result.projects
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    },
    // Template operations implementation
    saveAsTemplate: async (templateData: any, author: string) => {
        const state = get();
        try {
            const template = await templateService.createFromGraph(state.nodes, state.edges, templateData, author);
            return {
                success: true,
                template
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save template'
            };
        }
    },
    applyTemplate: async (templateId: string, options: any) => {
        try {
            const graphData = await templateService.instantiateTemplate(templateId, options);
            if (options.mergeWithCurrent) {
                // Merge with current graph
                const state = get();
                set({
                    nodes: [...state.nodes, ...graphData.nodes],
                    edges: [...state.edges, ...graphData.edges],
                    hasUnsavedChanges: true
                });
            }
            else {
                // Replace current graph
                set({
                    nodes: graphData.nodes,
                    edges: graphData.edges,
                    hasUnsavedChanges: true
                });
            }
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to apply template'
            };
        }
    },
    getTemplateCompatibleData: () => {
        const state = get();
        return {
            nodes: state.nodes,
            edges: state.edges,
            annotations: {
                stickyNotes: [], // Will be populated when sticky notes system is implemented
                nodeLabels: Object.fromEntries(state.nodes.map(node => [node.id, node.data?.label || node.id])),
                regionGroups: [], // Will be populated when region groups system is implemented
                connectionLabels: Object.fromEntries(state.edges.filter(edge => edge.label).map(edge => [edge.id, edge.label])),
                metadata: {
                    author: 'system',
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    version: '1.0.0'
                }
            }
        };
    }
}));
