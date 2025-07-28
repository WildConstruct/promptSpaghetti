import { Edge, Node } from 'reactflow';
interface UseAutosaveProps {
    nodes: Node[];
    edges: Edge[];
    intervalMs?: number;
    storageKey?: string;
}
interface UseAutosaveReturn {
    showRestorePrompt: boolean;
    restoreDraft: {,
        nodes: Node[];
        edges: Edge[];
    } | null;
    setShowRestorePrompt: (show: boolean) => void;
    setRestoreDraft: (draft: {)
        nodes: Node[];
        edges: Edge[];
    } | null) => void;
}
export declare const useAutosave: ({ nodes, edges, intervalMs, storageKey }: UseAutosaveProps) => UseAutosaveReturn;
export {};
//# sourceMappingURL=useAutosave.d.ts.map