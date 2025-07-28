/**
 * Editor Provider Wrapper Component
 * Integrates client-side provider hooking into the GraphEditor
 */
import React from 'react';
import { EditorStateContext, EditorActions } from '../hooks/useEditorProviders';
export interface EditorProviderWrapperProps {
    children: (props: {}) => registry;
    ProviderRegistry: any;
    editorContext: EditorStateContext;
    editorActions: EditorActions;
    isLoading: boolean;
}
export declare const EditorProviderWrapper: React.FC<EditorProviderWrapperProps>;
export declare const withEditorProviders: <T extends {}>() => any, React: any, ComponentType: any, T: any, providerConfig: any, Omit: any, EditorProviderWrapperProps: any;
//# sourceMappingURL=EditorProviderWrapper.d.ts.map