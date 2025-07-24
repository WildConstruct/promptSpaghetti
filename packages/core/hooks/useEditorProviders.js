/**
 * Editor Provider Hook System
 * Allows external providers to hook into and interact with editor state
 */
import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useReactFlow } from 'reactflow';
import { useGraphStore } from '../graphStore.js';
// Global provider registry
const providerRegistry = new Map();
export const useEditorProviders = (initialNodes, initialEdges, selectedNodeId, validationErrors = []) => {
    const graphStore = useGraphStore();
    const reactFlowInstance = useReactFlow();
    const [isLoading, setIsLoading] = useState(false);
    const [providersInitialized, setProvidersInitialized] = useState(false);
    // Keep track of previous values for change detection
    const prevNodesRef = useRef(initialNodes);
    const prevEdgesRef = useRef(initialEdges);
    const prevSelectedRef = useRef(selectedNodeId);
    // Create editor state context
    const editorContext = useMemo(() => ({
        nodes: initialNodes,
        edges: initialEdges,
        selectedNodeId,
        isLoading,
        hasUnsavedChanges: graphStore.hasUnsavedChanges,
        validationErrors
    }), [initialNodes, initialEdges, selectedNodeId, isLoading, graphStore.hasUnsavedChanges, validationErrors]);
    // Create editor actions
    const editorActions = useMemo(() => ({
        addNode: async (node) => {
            // Execute provider hooks before adding
            const hooks = getSortedHooks();
            for (const hook of hooks) {
                if (hook.onNodeAdd) {
                    const result = hook.onNodeAdd(node, editorContext);
                    if (result) {
                        node = result;
                    }
                }
            }
            graphStore.addNode(node);
        },
        updateNode: async (nodeId, data) => {
            // Execute provider hooks before updating
            const hooks = getSortedHooks();
            for (const hook of hooks) {
                if (hook.onNodeUpdate) {
                    const result = hook.onNodeUpdate(nodeId, data, editorContext);
                    if (result) {
                        data = { ...data, ...result };
                    }
                }
            }
            graphStore.updateNode(nodeId, data);
        },
        removeNode: async (nodeId) => {
            // Execute provider hooks before removing - allow prevention
            const hooks = getSortedHooks();
            for (const hook of hooks) {
                if (hook.onNodeRemove) {
                    const result = hook.onNodeRemove(nodeId, editorContext);
                    if (result === false) {
                        return; // Prevent removal
                    }
                }
            }
            graphStore.deleteNode(nodeId);
        },
        addEdge: async (edge) => {
            // Execute provider hooks before adding
            const hooks = getSortedHooks();
            for (const hook of hooks) {
                if (hook.onEdgeAdd) {
                    const result = hook.onEdgeAdd(edge, editorContext);
                    if (result) {
                        edge = result;
                    }
                }
            }
            graphStore.addEdge(edge);
        },
        removeEdge: async (edgeId) => {
            // Execute provider hooks before removing - allow prevention
            const hooks = getSortedHooks();
            for (const hook of hooks) {
                if (hook.onEdgeRemove) {
                    const result = hook.onEdgeRemove(edgeId, editorContext);
                    if (result === false) {
                        return; // Prevent removal
                    }
                }
            }
            const newEdges = initialEdges.filter(e => e.id !== edgeId);
            graphStore.setEdges(newEdges);
        },
        selectNode: (nodeId) => {
            // This would be handled by the parent component
            // Provider hooks will be called via useEffect when selectedNodeId changes
        },
        focusNode: (nodeId) => {
            if (reactFlowInstance) {
                const node = initialNodes.find(n => n.id === nodeId);
                if (node) {
                    reactFlowInstance.setCenter(node.position.x, node.position.y, { zoom: 1.5 });
                }
            }
        },
        saveGraph: async () => {
            setIsLoading(true);
            try {
                // Execute pre-save hooks
                const hooks = getSortedHooks();
                for (const hook of hooks) {
                    if (hook.onSave) {
                        await hook.onSave(editorContext);
                    }
                }
                // Perform actual save (would integrate with existing save logic)
                await graphStore.saveProject({
                    name: 'Current Graph',
                    description: 'Auto-saved graph'
                });
            }
            finally {
                setIsLoading(false);
            }
        },
        loadGraph: (data) => {
            setIsLoading(true);
            try {
                graphStore.loadGraphData(data.nodes, data.edges);
                // Execute post-load hooks
                const hooks = getSortedHooks();
                hooks.forEach(hook => {
                    if (hook.onLoad) {
                        hook.onLoad(editorContext);
                    }
                });
            }
            finally {
                setIsLoading(false);
            }
        },
        exportGraph: (format = 'json') => {
            // Return graph data in requested format
            const data = { nodes: initialNodes, edges: initialEdges };
            switch (format) {
                case 'json':
                    return JSON.stringify(data, null, 2);
                case 'yaml':
                    // Would implement YAML export
                    return data;
                default:
                    return data;
            }
        },
        validateGraph: () => {
            // This would trigger validation - actual validation logic would be elsewhere
            // Providers can hook into onValidationChange
        },
        executeGraph: async () => {
            setIsLoading(true);
            try {
                // Execute pre-execution hooks
                const hooks = getSortedHooks();
                for (const hook of hooks) {
                    if (hook.onPreExecution) {
                        await hook.onPreExecution(editorContext);
                    }
                }
                // Perform actual execution (mock)
                const result = { success: true, output: 'Graph executed successfully' };
                // Execute post-execution hooks
                for (const hook of hooks) {
                    if (hook.onPostExecution) {
                        hook.onPostExecution(result, editorContext);
                    }
                }
                return result;
            }
            catch (error) {
                // Execute error hooks
                const hooks = getSortedHooks();
                for (const hook of hooks) {
                    if (hook.onExecutionError) {
                        hook.onExecutionError(error, editorContext);
                    }
                }
                throw error;
            }
            finally {
                setIsLoading(false);
            }
        }
    }), [editorContext, graphStore, initialNodes, initialEdges, reactFlowInstance]);
    // Helper function to get hooks sorted by priority
    const getSortedHooks = useCallback(() => {
        return Array.from(providerRegistry.values()).sort((a, b) => a.priority - b.priority);
    }, []);
    // Provider registry implementation
    const registry = useMemo(() => ({
        register: (hook) => {
            if (providerRegistry.has(hook.id)) {
                console.warn(`Provider hook ${hook.id} is already registered. Replacing existing hook.`);
            }
            providerRegistry.set(hook.id, hook);
            // If providers are already initialized, initialize this new hook
            if (providersInitialized && hook.onInit) {
                hook.onInit(editorContext, editorActions);
            }
        },
        unregister: (hookId) => {
            const hook = providerRegistry.get(hookId);
            if (hook) {
                if (hook.onDestroy) {
                    hook.onDestroy();
                }
                providerRegistry.delete(hookId);
            }
        },
        getHooks: () => getSortedHooks(),
        getHook: (hookId) => providerRegistry.get(hookId),
        executeHooks: async (hookName, ...args) => {
            const hooks = getSortedHooks();
            for (const hook of hooks) {
                const hookFn = hook[hookName];
                if (typeof hookFn === 'function') {
                    await hookFn(...args);
                }
            }
        },
        executeCustomAction: (hookId, actionName, ...args) => {
            const hook = providerRegistry.get(hookId);
            if (hook?.customActions?.[actionName]) {
                return hook.customActions[actionName](editorContext, ...args);
            }
            throw new Error(`Custom action ${actionName} not found in provider ${hookId}`);
        }
    }), [editorContext, editorActions, getSortedHooks, providersInitialized]);
    // Initialize provider hooks on mount
    useEffect(() => {
        const hooks = getSortedHooks();
        hooks.forEach(hook => {
            if (hook.onInit) {
                hook.onInit(editorContext, editorActions);
            }
        });
        setProvidersInitialized(true);
        return () => {
            hooks.forEach(hook => {
                if (hook.onDestroy) {
                    hook.onDestroy();
                }
            });
        };
    }, []); // Only run on mount/unmount
    // Handle nodes changes
    useEffect(() => {
        if (providersInitialized && prevNodesRef.current !== initialNodes) {
            const hooks = getSortedHooks();
            hooks.forEach(hook => {
                if (hook.onNodesChange) {
                    hook.onNodesChange(initialNodes, prevNodesRef.current);
                }
            });
            prevNodesRef.current = initialNodes;
        }
    }, [initialNodes, providersInitialized, getSortedHooks]);
    // Handle edges changes
    useEffect(() => {
        if (providersInitialized && prevEdgesRef.current !== initialEdges) {
            const hooks = getSortedHooks();
            hooks.forEach(hook => {
                if (hook.onEdgesChange) {
                    hook.onEdgesChange(initialEdges, prevEdgesRef.current);
                }
            });
            prevEdgesRef.current = initialEdges;
        }
    }, [initialEdges, providersInitialized, getSortedHooks]);
    // Handle selection changes
    useEffect(() => {
        if (providersInitialized && prevSelectedRef.current !== selectedNodeId) {
            const hooks = getSortedHooks();
            hooks.forEach(hook => {
                if (hook.onSelectionChange) {
                    hook.onSelectionChange(selectedNodeId);
                }
            });
            prevSelectedRef.current = selectedNodeId;
        }
    }, [selectedNodeId, providersInitialized, getSortedHooks]);
    // Handle validation changes
    useEffect(() => {
        if (providersInitialized) {
            const hooks = getSortedHooks();
            hooks.forEach(hook => {
                if (hook.onValidationChange) {
                    hook.onValidationChange(validationErrors);
                }
            });
        }
    }, [validationErrors, providersInitialized, getSortedHooks]);
    return {
        registry,
        editorContext,
        editorActions,
        isLoading
    };
};
// Helper function to create provider hooks
export const createProviderHook = (config) => {
    return {
        priority: 100, // Default priority
        ...config
    };
};
// Built-in provider hooks examples
export const createConsoleLoggerHook = () => createProviderHook({
    id: 'console-logger',
    name: 'Console Logger',
    version: '1.0.0',
    priority: 1000, // Low priority
    onInit: (context, actions) => {
        console.log('[EditorProvider] Console logger initialized', context);
    },
    onNodesChange: (nodes, prevNodes) => {
        console.log('[EditorProvider] Nodes changed', {
            count: nodes.length,
            prevCount: prevNodes.length
        });
    },
    onEdgesChange: (edges, prevEdges) => {
        console.log('[EditorProvider] Edges changed', {
            count: edges.length,
            prevCount: prevEdges.length
        });
    },
    onSelectionChange: (selectedNodeId) => {
        console.log('[EditorProvider] Selection changed', { selectedNodeId });
    }
});
export const createAutoSaveHook = (interval = 30000) => {
    let autoSaveTimer = null;
    return createProviderHook({
        id: 'auto-save',
        name: 'Auto Save',
        version: '1.0.0',
        priority: 50, // High priority
        onInit: (context, actions) => {
            autoSaveTimer = setInterval(() => {
                if (context.hasUnsavedChanges) {
                    console.log('[EditorProvider] Auto-saving...');
                    actions.saveGraph();
                }
            }, interval);
        },
        onDestroy: () => {
            if (autoSaveTimer) {
                clearInterval(autoSaveTimer);
                autoSaveTimer = null;
            }
        }
    });
};
export const createValidationHook = () => createProviderHook({
    id: 'validation',
    name: 'Validation Provider',
    version: '1.0.0',
    priority: 10, // Very high priority
    onNodeAdd: (node, context) => {
        // Add validation metadata to new nodes
        return {
            ...node,
            data: {
                ...node.data,
                _validated: false,
                _validationTimestamp: Date.now()
            }
        };
    },
    onNodeUpdate: (nodeId, updates, context) => {
        // Add validation metadata to updates
        return {
            ...updates,
            _validated: false,
            _validationTimestamp: Date.now()
        };
    },
    onValidationChange: (errors) => {
        if (errors.length > 0) {
            console.warn('[EditorProvider] Validation errors detected', errors);
        }
    }
});
