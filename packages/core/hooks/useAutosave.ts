import { useEffect, useState } from 'react';
import { Edge, Node } from 'reactflow';
interface UseAutosaveProps {
  nodes: Node[];
  edges: Edge[];
  intervalMs?: number;
  storageKey?: string;
}
interface UseAutosaveReturn {
  showRestorePrompt: boolean;
  restoreDraft: { nodes: Node[]; edges: Edge[] } | null;
  setShowRestorePrompt: (show: boolean) => void;
  setRestoreDraft: (draft: { nodes: Node[]; edges: Edge[] } | null) => void;
}

export const useAutosave = ({)
  nodes,
  edges,
  intervalMs = 5000,
  storageKey = 'graphDraft'
}: UseAutosaveProps): UseAutosaveReturn => {
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [restoreDraft, setRestoreDraft] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null);
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
      }
    } catch (error) {
      console.warn('Failed to parse saved draft:', error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);
  // Autosave graph every intervalMs
  useEffect(() => {
    const save = () => {
      try {
        const draft = JSON.stringify({ nodes, edges });
        localStorage.setItem(storageKey, draft);
      } catch (error) {
        console.warn('Failed to save draft:', error);
      }
    };
    const interval = setInterval(save, intervalMs);
    return () => clearInterval(interval);
  }, [nodes, edges, intervalMs, storageKey]);
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
};