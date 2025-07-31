/**
 * Editor Provider Wrapper Component
 * Integrates client-side provider hooking into the GraphEditor
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
import { ProviderHook, ProviderRegistry, EditorStateContext, EditorActions } from '../hooks/useEditorProviders';

}
export interface EditorProviderWrapperProps {
    children: (props: {),
        registry: ProviderRegistry;
        editorContext: EditorStateContext;
        editorActions: EditorActions;
        isLoading: boolean;

}
    }) => React.ReactNode;
    initialNodes: Node[];
    initialEdges: Edge[];
    selectedNodeId: string | null;
    validationErrors?: unknown[];
    enableBuiltInProviders?: {
        consoleLogger?: boolean;
        autoSave?: boolean | {
            interval?: number;
        };
        validation?: boolean;
    };
    providers?: ProviderHook[];
    onProviderRegistered?: (hook: ProviderHook) => void;
    onProviderUnregistered?: (hookId: string) => void;
    onProviderError?: (error: Error, hookId: string) => void;

export declare const EditorProviderWrapper: React.FC<EditorProviderWrapperProps>;
export declare const withEditorProviders: <T extends {}>(Component: React.ComponentType<T>, providerConfig?: Omit<EditorProviderWrapperProps, "children" | "initialNodes" | "initialEdges" | "selectedNodeId">) => React.ForwardRefExoticComponent<React.PropsWithoutRef<T & {
    initialNodes: Node[];
    initialEdges: Edge[];
    selectedNodeId: string | null;
    validationErrors?: unknown[];
}> & React.RefAttributes<any>>;
//# sourceMappingURL=EditorProviderWrapper.d.ts.map