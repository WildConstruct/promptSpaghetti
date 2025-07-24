import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Editor Provider Wrapper Component
 * Integrates client-side provider hooking into the GraphEditor
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useEditorProviders } from '../hooks/useEditorProviders.js';
export const EditorProviderWrapper = ({ children, initialNodes, initialEdges, selectedNodeId, validationErrors = [], enableBuiltInProviders = {
    consoleLogger: true,
    autoSave: { interval: 30000 },
    validation: true
}, providers = [], onProviderRegistered, onProviderUnregistered, onProviderError }) => {
    const [providerErrors, setProviderErrors] = useState(new Map());
    // Initialize the provider hook system
    const { registry, editorContext, editorActions, isLoading } = useEditorProviders(initialNodes, initialEdges, selectedNodeId, validationErrors);
    // Register built-in providers
    useEffect(() => {
        const registerBuiltInProvider = async (hookFactory) => {
            try {
                const hook = hookFactory();
                registry.register(hook);
                onProviderRegistered?.(hook);
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error('[EditorProvider] Failed to register built-in provider:', errorObj);
                onProviderError?.(errorObj, 'built-in');
            }
        };
        if (enableBuiltInProviders.consoleLogger) {
            import('../hooks/useEditorProviders').then(({ createConsoleLoggerHook }) => {
                registerBuiltInProvider(createConsoleLoggerHook);
            });
        }
        if (enableBuiltInProviders.autoSave) {
            const interval = typeof enableBuiltInProviders.autoSave === 'object'
                ? enableBuiltInProviders.autoSave.interval
                : 30000;
            import('../hooks/useEditorProviders').then(({ createAutoSaveHook }) => {
                registerBuiltInProvider(() => createAutoSaveHook(interval));
            });
        }
        if (enableBuiltInProviders.validation) {
            import('../hooks/useEditorProviders').then(({ createValidationHook }) => {
                registerBuiltInProvider(createValidationHook);
            });
        }
    }, [registry, enableBuiltInProviders, onProviderRegistered, onProviderError]);
    // Register custom providers
    useEffect(() => {
        providers.forEach(provider => {
            try {
                registry.register(provider);
                onProviderRegistered?.(provider);
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error('[EditorProvider] Failed to register custom provider:', provider.id, errorObj);
                setProviderErrors(prev => new Map(prev).set(provider.id, errorObj));
                onProviderError?.(errorObj, provider.id);
            }
        });
        // Cleanup function to unregister providers when component unmounts
        return () => {
            providers.forEach(provider => {
                try {
                    registry.unregister(provider.id);
                    onProviderUnregistered?.(provider.id);
                }
                catch (error) {
                    console.error('[EditorProvider] Failed to unregister provider:', provider.id, error);
                }
            });
        };
    }, [providers, registry, onProviderRegistered, onProviderUnregistered, onProviderError]);
    // Error boundary for provider execution
    const safeRegistry = useMemo(() => ({
        ...registry,
        register: (hook) => {
            try {
                registry.register(hook);
                setProviderErrors(prev => {
                    const newErrors = new Map(prev);
                    newErrors.delete(hook.id);
                    return newErrors;
                });
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                setProviderErrors(prev => new Map(prev).set(hook.id, errorObj));
                onProviderError?.(errorObj, hook.id);
                throw error;
            }
        },
        executeHooks: async (hookName, ...args) => {
            const hooks = registry.getHooks();
            for (const hook of hooks) {
                try {
                    const hookFn = hook[hookName];
                    if (typeof hookFn === 'function') {
                        await hookFn(...args);
                    }
                }
                catch (error) {
                    const errorObj = error instanceof Error ? error : new Error('Unknown error');
                    console.error(`[EditorProvider] Error executing hook ${hookName} in provider ${hook.id}:`, errorObj);
                    setProviderErrors(prev => new Map(prev).set(hook.id, errorObj));
                    onProviderError?.(errorObj, hook.id);
                    // Continue executing other hooks
                }
            }
        },
        executeCustomAction: (hookId, actionName, ...args) => {
            try {
                return registry.executeCustomAction(hookId, actionName, ...args);
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error(`[EditorProvider] Error executing custom action ${actionName} in provider ${hookId}:`, errorObj);
                setProviderErrors(prev => new Map(prev).set(hookId, errorObj));
                onProviderError?.(errorObj, hookId);
                throw error;
            }
        }
    }), [registry, onProviderError]);
    // Enhanced editor actions with error handling
    const safeEditorActions = useMemo(() => ({
        ...editorActions,
        addNode: async (node) => {
            try {
                await editorActions.addNode(node);
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error('[EditorProvider] Error adding node:', errorObj);
                onProviderError?.(errorObj, 'addNode');
                throw error;
            }
        },
        updateNode: async (nodeId, data) => {
            try {
                await editorActions.updateNode(nodeId, data);
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error('[EditorProvider] Error updating node:', errorObj);
                onProviderError?.(errorObj, 'updateNode');
                throw error;
            }
        },
        removeNode: async (nodeId) => {
            try {
                await editorActions.removeNode(nodeId);
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error('[EditorProvider] Error removing node:', errorObj);
                onProviderError?.(errorObj, 'removeNode');
                throw error;
            }
        },
        executeGraph: async () => {
            try {
                return await editorActions.executeGraph();
            }
            catch (error) {
                const errorObj = error instanceof Error ? error : new Error('Unknown error');
                console.error('[EditorProvider] Error executing graph:', errorObj);
                onProviderError?.(errorObj, 'executeGraph');
                throw error;
            }
        }
    }), [editorActions, onProviderError]);
    return (_jsxs(_Fragment, { children: [children({
                registry: safeRegistry,
                editorContext: {
                    ...editorContext,
                    // Add provider error information to context
                    providerErrors: Array.from(providerErrors.entries()).map(([id, error]) => ({
                        providerId: id,
                        error: error.message
                    }))
                },
                editorActions: safeEditorActions,
                isLoading
            }), providerErrors.size > 0 && (_jsxs("div", { className: "provider-errors", style: {
                    position: 'fixed',
                    top: '10px',
                    right: '10px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    padding: '12px',
                    maxWidth: '300px',
                    fontSize: '14px',
                    zIndex: 9999
                }, children: [_jsxs("div", { style: { fontWeight: 'bold', marginBottom: '8px' }, children: ["Provider Errors (", providerErrors.size, ")"] }), Array.from(providerErrors.entries()).map(([id, error]) => (_jsxs("div", { style: { marginBottom: '4px' }, children: [_jsxs("strong", { children: [id, ":"] }), " ", error.message] }, id))), _jsx("button", { onClick: () => setProviderErrors(new Map()), style: {
                            marginTop: '8px',
                            padding: '4px 8px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }, children: "Clear Errors" })] }))] }));
};
// HOC for easier integration with existing GraphEditor
export const withEditorProviders = (Component, providerConfig) => {
    return React.forwardRef((props, ref) => {
        const { initialNodes, initialEdges, selectedNodeId, validationErrors, ...componentProps } = props;
        return (_jsx(EditorProviderWrapper, { initialNodes: initialNodes, initialEdges: initialEdges, selectedNodeId: selectedNodeId, validationErrors: validationErrors, ...providerConfig, children: ({ registry, editorContext, editorActions, isLoading }) => (_jsx(Component, { ...componentProps, ref: ref, registry: registry, editorContext: editorContext, editorActions: editorActions, isProviderLoading: isLoading })) }));
    });
};
