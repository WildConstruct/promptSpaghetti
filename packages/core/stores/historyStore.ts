import { create } from 'zustand';

export interface GraphSnapshot<TNode = any, TEdge = any> {
  nodes: TNode[];
  edges: TEdge[];
  timestamp?: number;
}

interface HistoryState<TNode = any, TEdge = any> {
  entries: GraphSnapshot<TNode, TEdge>[];
  index: number; // -1 means empty
  capacity: number;
  push: (snap: GraphSnapshot<TNode, TEdge>) => void;
  undo: () => GraphSnapshot<TNode, TEdge> | null;
  redo: () => GraphSnapshot<TNode, TEdge> | null;
  select: (i: number) => GraphSnapshot<TNode, TEdge> | null;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  entries: [],
  index: -1,
  capacity: 50,

  push: snap => {
    const { entries, index, capacity } = get();
    const base = index >= 0 ? entries.slice(0, index + 1) : entries.slice();
    const next = base.concat([
      { ...snap, timestamp: snap.timestamp ?? Date.now() }
    ]);
    const trimmed =
      next.length > capacity ? next.slice(next.length - capacity) : next;
    const nextIndex = Math.min(trimmed.length - 1, capacity - 1);
    set({ entries: trimmed, index: nextIndex });
  },

  undo: () => {
    const { entries, index } = get();
    if (index <= 0 || entries.length === 0) return null;
    const nextIndex = index - 1;
    set({ index: nextIndex });
    return get().entries[nextIndex];
  },

  redo: () => {
    const { entries, index } = get();
    if (index < 0 || index >= entries.length - 1) return null;
    const nextIndex = index + 1;
    set({ index: nextIndex });
    return get().entries[nextIndex];
  },

  select: i => {
    const { entries } = get();
    if (i < 0 || i >= entries.length) return null;
    set({ index: i });
    return entries[i];
  },

  clear: () => set({ entries: [], index: -1 })
}));
