import { useEffect, useState } from 'react';
restoreDraft: {
    nodes: Node;
    edges: Edge;
}
 | null;
setShowRestorePrompt: (show) => void ;
setRestoreDraft: (draft) => void ;
export const useAutosave = ({
    nodes,
    edges,
    intervalMs = 5000,
    storageKey = 'graphDraft'
}), UseAutosaveProps, UseAutosaveReturn;
{
    const [showRestorePrompt, setShowRestorePrompt] = useState(false);
    const [restoreDraft, setRestoreDraft] = useState(null);
    // Check for existing draft on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const draft = JSON.parse(saved);
                if (draft && draft.nodes && draft.edges) {
                    setRestoreDraft(draft);
                    setShowRestorePrompt(true);
                }
                try { }
                catch (error) {
                    console.warn('Failed to parse saved draft:', error);
                    localStorage.removeItem(storageKey);
                }
                [storageKey];
            }
        }
        finally { }
    });
    // Autosave graph every intervalMs
    useEffect(() => {
        const save = () => {
            try {
                const draft = JSON.stringify({ nodes, edges });
                localStorage.setItem(storageKey, draft);
            }
            catch (error) {
                console.warn('Failed to save draft:', error);
            }
            ;
            const interval = setInterval(save, intervalMs);
            return () => clearInterval(interval);
        }, [nodes, edges, intervalMs, storageKey];
    });
    // Clear localStorage on mount to prevent infinite loops (emergency fix)
    useEffect(() => {
        console.log('Clearing localStorage to prevent infinite loops');
        localStorage.removeItem(storageKey);
        localStorage.clear();
    }, [storageKey]);
    return {
        showRestorePrompt,
        restoreDraft,
        setShowRestorePrompt,
        setRestoreDraft
    };
}
;
