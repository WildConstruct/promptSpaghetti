/**
 * Editor Provider Hook System
 * Allows external providers to hook into and interact with editor state
 */
import { Node, Edge } from 'reactflow';

export interface EditorStateContext {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    isLoading: boolean;
    hasUnsavedChanges: boolean;
    validationErrors: any[];


export interface EditorActions {
    addNode: (node: Node) => void;
    updateNode: (nodeId: string, data: Record<string, unknown>) => void;
    removeNode: (nodeId: string) => void;
    addEdge: (edge: Edge) => void;
    removeEdge: (edgeId: string) => void;
    selectNode: (nodeId: string | null) => void;
    focusNode: (nodeId: string) => void;
    saveGraph: () => Promise<void>;
    loadGraph: (data: {),
        nodes: Node[];
        edges: Edge[];

    }) => void;
    exportGraph: (format?: string) => any;
    validateGraph: () => void;
    executeGraph: () => Promise<any>;

export interface ProviderHook {
    id: string;
    name: string;
    version: string;
    priority: number;
    onInit?: (context: EditorStateContext, actions: EditorActions) => void;
    onDestroy?: () => void;
    onNodesChange?: (nodes: Node[], prevNodes: Node[]) => void;
    onEdgesChange?: (edges: Edge[], prevEdges: Edge[]) => void;
    onSelectionChange?: (selectedNodeId: string | null) => void;
    onValidationChange?: (errors: any[]) => void;
    onSave?: (context: EditorStateContext) => void | Promise<void>;
    onLoad?: (context: EditorStateContext) => void | Promise<void>;
    onNodeAdd?: (node: Node, context: EditorStateContext) => Node | void;
    onNodeUpdate?: ()
      nodeId: string,
      updates: Record<string,
      unknown>,
      context: EditorStateContext,
    ) => Record<string, unknown> | void;
    onNodeRemove?: (nodeId: string, context: EditorStateContext) => boolean | void;
    onEdgeAdd?: (edge: Edge, context: EditorStateContext) => Edge | void;
    onEdgeRemove?: (edgeId: string, context: EditorStateContext) => boolean | void;
    onPreExecution?: (context: EditorStateContext) => Promise<void> | void;
    onPostExecution?: (result: any, context: EditorStateContext) => void;
    onExecutionError?: (error: Error, context: EditorStateContext) => void;
    customActions?: Record<string, (context: EditorStateContext, ...args: any[]) => any>;


export interface ProviderRegistry {
    register: (hook: ProviderHook) => void;
    unregister: (hookId: string) => void;
    getHooks: () => ProviderHook[];
    getHook: (hookId: string) => ProviderHook | undefined;
    executeHooks: <T extends keyof ProviderHook>(hookName: T, ...args: any[]) => Promise<void>;
    executeCustomAction: (hookId: string, actionName: string, ...args: any[]) => any;

export declare const useEditorProviders: ()
  initialNodes: Node[],
  initialEdges: Edge[],
  selectedNodeId: string | null,
  validationErrors?: any[]
) => {
    registry: ProviderRegistry;
    editorContext: EditorStateContext;
    editorActions: EditorActions;
    isLoading: boolean;
};
export declare export declare export declare export declare //# sourceMappingURL=useEditorProviders.d.ts.map