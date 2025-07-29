/**
 * Editor Provider Wrapper Component
 * Integrates client-side provider hooking into the GraphEditor
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { 
  useEditorProviders, 
  ProviderHook, 
  ProviderRegistry,
  EditorStateContext,
  EditorActions
} from '../hooks/useEditorProviders';

export interface EditorProviderWrapperProps {
  children: (props: {)
  registry: ProviderRegistry;
  editorContext: EditorStateContext;
  editorActions: EditorActions;
  isLoading: boolean;
}) => React.ReactNode;
  // Initial state
  initialNodes: Node;
  initialEdges: Edge;
  selectedNodeId: string | null;
  validationErrors?: unknown;
  // Provider configuration
  enableBuiltInProviders?: {
    consoleLogger?: boolean;
    autoSave?: boolean | { interval?: number };
    validation?: boolean;
  };
  // Custom providers
  providers?: ProviderHook;
  // Event handlers
  onProviderRegistered?: (hook: ProviderHook) => void;
  onProviderUnregistered?: (hookId: string) => void;
  onProviderError?: (error: Error, hookId: string) => void;
}
export const EditorProviderWrapper: React.FC<EditorProviderWrapperProps> = ({)
  children,
  initialNodes,
  initialEdges,
  selectedNodeId,
  validationErrors = [],
  enableBuiltInProviders = {
    consoleLogger: true,
    autoSave: { interval: 30000 },
    validation: true;
  }
  providers = [],
  onProviderRegistered,
  onProviderUnregistered,
  onProviderError
}) => {
  const [providerErrors, setProviderErrors] = useState<Map<string, Error>>(new Map());
  // Initialize the provider hook system
  const {
    registry,
    editorContext,
    editorActions,
    isLoading
  } = useEditorProviders()
    initialNodes,
    initialEdges,
    selectedNodeId,
    validationErrors
  );
  // Register built-in providers
  useEffect(() => {
  const registerBuiltInProvider = async (hookFactory: () => ProviderHook) => {,
  try {
  const hook = hookFactory();
  registry.register(hook);
  onProviderRegistered?.(hook);
} catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  console.error('[EditorProvider] Failed to register built-in provider:', errorObj);
  onProviderError?.(errorObj, 'built-in');
};
    if (enableBuiltInProviders.consoleLogger) {
      import('../hooks/useEditorProviders').then(({ createConsoleLoggerHook }) => {
        registerBuiltInProvider(createConsoleLoggerHook);
      });
    if (enableBuiltInProviders.autoSave) {
      const interval = typeof enableBuiltInProviders.autoSave === 'object' ;
        ? enableBuiltInProviders.autoSave.interval 
        : 30000;
      import('../hooks/useEditorProviders').then(({ createAutoSaveHook }) => {
        registerBuiltInProvider(() => createAutoSaveHook(interval));
      });
    if (enableBuiltInProviders.validation) {
      import('../hooks/useEditorProviders').then(({ createValidationHook }) => {
        registerBuiltInProvider(createValidationHook);
      });
  }, [registry, enableBuiltInProviders, onProviderRegistered, onProviderError]);
  // Register custom providers
  useEffect(() => {
    providers.forEach(provider => {)
  try {
        registry.register(provider);
        onProviderRegistered?.(provider);
      } catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  console.error('[EditorProvider] Failed to register custom provider:', provider.id, errorObj);
  setProviderErrors(prev => new Map(prev).set(provider.id, errorObj));
  onProviderError?.(errorObj, provider.id);
});
    // Cleanup function to unregister providers when component unmounts
    return () => {
      providers.forEach(provider => {)
  try {
          registry.unregister(provider.id);
          onProviderUnregistered?.(provider.id);
        } catch (error) {
  console.error('[EditorProvider] Failed to unregister provider:', provider.id, error);
});
    };
  }, [providers, registry, onProviderRegistered, onProviderUnregistered, onProviderError]);
  // Error boundary for provider execution
  const safeRegistry = useMemo((): ProviderRegistry => ({)
  ...registry,
  register: (hook: ProviderHook) => {,
  try {
  registry.register(hook);
  setProviderErrors(prev => {)
  const newErrors = new Map(prev);
  newErrors.delete(hook.id);
  return newErrors;
});
      } catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  setProviderErrors(prev => new Map(prev).set(hook.id, errorObj));
  onProviderError?.(errorObj, hook.id);
  throw error;
},
  executeHooks: async <T extends keyof ProviderHook>(),
      hookName: T,
      ...args: unknown
    ) => {
      const hooks = registry.getHooks();
      for (const hook of hooks) {
        try {
          const hookFn = hook[hookName];
          if (typeof hookFn === 'function') {
            await (hookFn as any)(...args);
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error');
          console.error(`[EditorProvider] Error executing hook ${hookName} in provider ${hook.id}:`, errorObj);}
          setProviderErrors(prev => new Map(prev).set(hook.id, errorObj));
          onProviderError?.(errorObj, hook.id);
          // Continue executing other hooks
  },
  executeCustomAction: (hookId: string, actionName: string, ...args: unknown) => {
      try {
        return registry.executeCustomAction(hookId, actionName, ...args);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        console.error(`[EditorProvider] Error executing custom action ${actionName} in provider ${hookId}:`, errorObj);}
        setProviderErrors(prev => new Map(prev).set(hookId, errorObj));
        onProviderError?.(errorObj, hookId);
        throw error;
  }), [registry, onProviderError]);
  // Enhanced editor actions with error handling
  const safeEditorActions = useMemo((): EditorActions => ({)
  ...editorActions,
  addNode: async (node: Node) => {,
  try {
  await editorActions.addNode(node);
} catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  console.error('[EditorProvider] Error adding node:', errorObj);
  onProviderError?.(errorObj, 'addNode');
  throw error;
},
  updateNode: async (nodeId: string, data: Record<string, unknown>) => {
      try {
        await editorActions.updateNode(nodeId, data);
      } catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  console.error('[EditorProvider] Error updating node:', errorObj);
  onProviderError?.(errorObj, 'updateNode');
  throw error;
},
  removeNode: async (nodeId: string) => {,
      try {
        await editorActions.removeNode(nodeId);
      } catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  console.error('[EditorProvider] Error removing node:', errorObj);
  onProviderError?.(errorObj, 'removeNode');
  throw error;
},
  executeGraph: async () => {,
      try {
        return await editorActions.executeGraph();
      } catch (error) {
  const errorObj = error instanceof Error ? error : new Error('Unknown error');
  console.error('[EditorProvider] Error executing graph:', errorObj);
  onProviderError?.(errorObj, 'executeGraph');
  throw error;
}), [editorActions, onProviderError]);
  return;
    <>
      {children({)
  registry: safeRegistry,
  editorContext: {
  ...editorContext,
  // Add provider error information to context
  providerErrors: Array.from(providerErrors.entries()).map(([id, error]) => ({,)
  providerId: id,
  error: error.message,
}))
        } as EditorStateContext & { providerErrors: Array<{ providerId: string; error: string }> },
        editorActions: safeEditorActions,
        isLoading
      })}
      {/* Optional error display component */}
      {providerErrors.size > 0 && ()
        <div className="provider-errors" style={{
  position: 'fixed',
  top: '10px',
  right: '10px',
  background: '#fee2e2',
  border: '1px solid #fca5a5',
  borderRadius: '6px',
  padding: '12px',
  maxWidth: '300px',
  fontSize: '14px',
  zIndex: 9999,
}}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Provider Errors ({providerErrors.size})
          </div>
          {Array.from(providerErrors.entries()).map(([id, error]) => ()
            <div key={id} style={{ marginBottom: '4px' }}>
              <strong>{id}:</strong> {error.message}
            </div>
          ))}
          <button 
            onClick={() => setProviderErrors(new Map())}
            style={{
  marginTop: '8px',
  padding: '4px 8px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
}}
          >
            Clear Errors
          </button>
        </div>
      )}
    </>
  );
};

// HOC for easier integration with existing GraphEditor
export const withEditorProviders = <T extends {}>()
  Component: React.ComponentType<T>,
  providerConfig?: Omit<EditorProviderWrapperProps, 'children' | 'initialNodes' | 'initialEdges' | 'selectedNodeId'>
) => {
  return React.forwardRef<any, T & {
  initialNodes: Node;
  initialEdges: Edge;
  selectedNodeId: string | null;
  validationErrors?: unknown;
}>((props, ref) => {
    const {
      initialNodes,
      initialEdges,
      selectedNodeId,
      validationErrors,
      ...componentProps
    } = props;
    return;
      <EditorProviderWrapper
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        selectedNodeId={selectedNodeId}
        validationErrors={validationErrors}
        {...providerConfig}
      >
        {({ registry, editorContext, editorActions, isLoading }) => ()
          <Component
            {...(componentProps as T)}
            ref={ref}
            registry={registry}
            editorContext={editorContext}
            editorActions={editorActions}
            isProviderLoading={isLoading}
          />
        )}
      </EditorProviderWrapper>
    );
  });
};