/**
 * Editor Provider Hook System
 * Allows external providers to hook into and interact with editor state
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';
import { useGraphStore } from '../graphStore';

// Provider hook types
export interface EditorStateContext {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: any[];
}

export interface EditorActions {
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  focusNode: (nodeId: string) => void;
  saveGraph: () => Promise<void>;
  loadGraph: (data: { nodes: Node[]; edges: Edge[] }) => void;
  exportGraph: (format?: string) => any;
  validateGraph: () => void;
  executeGraph: () => Promise<any>;
}

export interface ProviderHook {
  id: string;
  name: string;
  version: string;
  priority: number; // Lower number = higher priority
  
  // Lifecycle hooks
  onInit?: (context: EditorStateContext, actions: EditorActions) => void;
  onDestroy?: () => void;
  
  // State change hooks
  onNodesChange?: (nodes: Node[], prevNodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[], prevEdges: Edge[]) => void;
  onSelectionChange?: (selectedNodeId: string | null) => void;
  onValidationChange?: (errors: any[]) => void;
  onSave?: (context: EditorStateContext) => void | Promise<void>;
  onLoad?: (context: EditorStateContext) => void | Promise<void>;
  
  // Graph operation hooks
  onNodeAdd?: (node: Node, context: EditorStateContext) => Node | void;
  onNodeUpdate?: (nodeId: string, updates: Record<string, unknown>, context: EditorStateContext) => Record<string, unknown> | void;
  onNodeRemove?: (nodeId: string, context: EditorStateContext) => boolean | void; // Return false to prevent
  onEdgeAdd?: (edge: Edge, context: EditorStateContext) => Edge | void;
  onEdgeRemove?: (edgeId: string, context: EditorStateContext) => boolean | void;
  
  // Execution hooks
  onPreExecution?: (context: EditorStateContext) => Promise<void> | void;
  onPostExecution?: (result: any, context: EditorStateContext) => void;
  onExecutionError?: (error: Error, context: EditorStateContext) => void;
  
  // Custom actions
  customActions?: Record<string, (context: EditorStateContext, ...args: any[]) => any>;
}

export interface ProviderRegistry {
  register: (hook: ProviderHook) => void;
  unregister: (hookId: string) => void;
  getHooks: () => ProviderHook[];
  getHook: (hookId: string) => ProviderHook | undefined;
  executeHooks: <T extends keyof ProviderHook>(
    hookName: T, 
    ...args: any[]
  ) => Promise<void>;
  executeCustomAction: (hookId: string, actionName: string, ...args: any[]) => any;
}

// Global provider registry
const providerRegistry = new Map<string, ProviderHook>();

export const useEditorProviders = (
  initialNodes: Node[],
  initialEdges: Edge[],
  selectedNodeId: string | null,
  validationErrors: any[] = []
) => {
  const graphStore = useGraphStore();
  const reactFlowInstance = useReactFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [providersInitialized, setProvidersInitialized] = useState(false);
  
  // Keep track of previous values for change detection
  const prevNodesRef = useRef<Node[]>(initialNodes);
  const prevEdgesRef = useRef<Edge[]>(initialEdges);
  const prevSelectedRef = useRef<string | null>(selectedNodeId);
  
  // Create editor state context
  const editorContext = useMemo((): EditorStateContext => ({
    nodes: initialNodes,
    edges: initialEdges,
    selectedNodeId,
    isLoading,
    hasUnsavedChanges: graphStore.hasUnsavedChanges,
    validationErrors
  }), [initialNodes, initialEdges, selectedNodeId, isLoading, graphStore.hasUnsavedChanges, validationErrors]);
  
  // Create editor actions
  const editorActions = useMemo((): EditorActions => ({
    addNode: async (node: Node) => {
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
    
    updateNode: async (nodeId: string, data: Record<string, unknown>) => {
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
    
    removeNode: async (nodeId: string) => {
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
    
    addEdge: async (edge: Edge) => {
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
    
    removeEdge: async (edgeId: string) => {
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
    
    selectNode: (nodeId: string | null) => {
      // This would be handled by the parent component
      // Provider hooks will be called via useEffect when selectedNodeId changes
    },
    
    focusNode: (nodeId: string) => {
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
      } finally {
        setIsLoading(false);
      }
    },
    
    loadGraph: (data: { nodes: Node[]; edges: Edge[] }) => {
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
      } finally {
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
      } catch (error) {
        // Execute error hooks
        const hooks = getSortedHooks();
        for (const hook of hooks) {
          if (hook.onExecutionError) {
            hook.onExecutionError(error as Error, editorContext);
          }
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  }), [editorContext, graphStore, initialNodes, initialEdges, reactFlowInstance]);
  
  // Helper function to get hooks sorted by priority
  const getSortedHooks = useCallback((): ProviderHook[] => {
    return Array.from(providerRegistry.values()).sort((a, b) => a.priority - b.priority);
  }, []);
  
  // Provider registry implementation
  const registry: ProviderRegistry = useMemo(() => ({
    register: (hook: ProviderHook) => {
      if (providerRegistry.has(hook.id)) {
        console.warn(`Provider hook ${hook.id} is already registered. Replacing existing hook.`);
      }
      
      providerRegistry.set(hook.id, hook);
      
      // If providers are already initialized, initialize this new hook
      if (providersInitialized && hook.onInit) {
        hook.onInit(editorContext, editorActions);
      }
    },
    
    unregister: (hookId: string) => {
      const hook = providerRegistry.get(hookId);
      if (hook) {
        if (hook.onDestroy) {
          hook.onDestroy();
        }
        providerRegistry.delete(hookId);
      }
    },
    
    getHooks: () => getSortedHooks(),
    
    getHook: (hookId: string) => providerRegistry.get(hookId),
    
    executeHooks: async <T extends keyof ProviderHook>(
      hookName: T,
      ...args: any[]
    ) => {
      const hooks = getSortedHooks();
      for (const hook of hooks) {
        const hookFn = hook[hookName];
        if (typeof hookFn === 'function') {
          await (hookFn as any)(...args);
        }
      }
    },
    
    executeCustomAction: (hookId: string, actionName: string, ...args: any[]) => {
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
export const createProviderHook = (config: ProviderHook): ProviderHook => {
  return {
    priority: 100, // Default priority
    ...config
  };
};

// Built-in provider hooks examples
export const createConsoleLoggerHook = (): ProviderHook => createProviderHook({
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

export const createAutoSaveHook = (interval = 30000): ProviderHook => {
  let autoSaveTimer: NodeJS.Timeout | null = null;
  
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

export const createValidationHook = (): ProviderHook => createProviderHook({
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