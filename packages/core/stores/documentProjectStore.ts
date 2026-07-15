/**
 * Nested PSG project store — keeps parent + child documents in memory
 * for precomp-style tabs (docs/nested-psg-precomp-plan.md).
 */
import { create } from 'zustand';
import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../components/epic1/nodes';

/** React Flow viewport for a composition tab. */
export type DocumentViewport = {
  x: number;
  y: number;
  zoom: number;
};

/** Serializable undo stack for one composition (graph snapshots only). */
export type DocumentHistoryEntry = {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  timestamp: number;
};

export type DocumentHistoryState = {
  entries: DocumentHistoryEntry[];
  index: number;
};

export type ProjectDocument = {
  id: string;
  name: string;
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  dirty?: boolean;
  /** Last camera for this composition (restored on tab switch). */
  viewport?: DocumentViewport;
  /** Per-document undo stack (restored on tab switch). */
  history?: DocumentHistoryState;
};

type DocumentProjectState = {
  /** Root / main composition id (always present when a project is loaded). */
  mainDocumentId: string;
  activeDocumentId: string;
  openDocumentIds: string[];
  documents: Record<string, ProjectDocument>;
  /** Reset project to a single main document (or empty). */
  resetProject: (main: ProjectDocument, nested?: ProjectDocument[]) => void;
  /** Replace one document's graph. */
  updateDocumentGraph: (
    documentId: string,
    nodes: Node<EditableNodeData>[],
    edges: Edge[]
  ) => void;
  /**
   * Persist undo stack and/or viewport for a composition without changing
   * the active tab.
   */
  updateDocumentSession: (
    documentId: string,
    session: {
      history?: DocumentHistoryState | null;
      viewport?: DocumentViewport | null;
    }
  ) => void;
  /**
   * Add a nested precomp document (does not switch active tab by itself).
   * Returns the created document record.
   */
  createNestedDocument: (options?: {
    id?: string;
    name?: string;
    nodes?: Node<EditableNodeData>[];
    edges?: Edge[];
  }) => ProjectDocument;
  /** Rename a document (main or nested). */
  renameDocument: (documentId: string, name: string) => void;
  openDocument: (documentId: string) => void;
  setActiveDocument: (documentId: string) => void;
  closeDocument: (documentId: string) => void;
  getNestedDocumentsForRuntime: () => Record<
    string,
    { nodes: Node<EditableNodeData>[]; edges: Edge[] }
  >;
};

const makeDocumentId = (): string =>
  `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const MAIN_ID = 'main';

export const useDocumentProjectStore = create<DocumentProjectState>(
  (set, get) => ({
    mainDocumentId: MAIN_ID,
    activeDocumentId: MAIN_ID,
    openDocumentIds: [MAIN_ID],
    documents: {
      [MAIN_ID]: {
        id: MAIN_ID,
        name: 'Main',
        nodes: [],
        edges: []
      }
    },

    resetProject: (main, nested = []) => {
      const documents: Record<string, ProjectDocument> = {
        [main.id]: main
      };
      for (const doc of nested) {
        documents[doc.id] = doc;
      }
      set({
        mainDocumentId: main.id,
        activeDocumentId: main.id,
        openDocumentIds: [main.id],
        documents
      });
    },

    updateDocumentGraph: (documentId, nodes, edges) => {
      set(state => {
        const existing = state.documents[documentId];
        if (!existing) {
          return state;
        }
        return {
          documents: {
            ...state.documents,
            [documentId]: {
              ...existing,
              nodes,
              edges,
              dirty: true
            }
          }
        };
      });
    },

    updateDocumentSession: (documentId, session) => {
      set(state => {
        const existing = state.documents[documentId];
        if (!existing) {
          return state;
        }
        const next: ProjectDocument = { ...existing };
        if ('history' in session) {
          next.history =
            session.history === null || session.history === undefined
              ? undefined
              : {
                  index: session.history.index,
                  entries: session.history.entries.map(entry => ({
                    timestamp: entry.timestamp,
                    nodes: entry.nodes,
                    edges: entry.edges
                  }))
                };
        }
        if ('viewport' in session) {
          next.viewport =
            session.viewport === null || session.viewport === undefined
              ? undefined
              : { ...session.viewport };
        }
        return {
          documents: {
            ...state.documents,
            [documentId]: next
          }
        };
      });
    },

    createNestedDocument: (options = {}) => {
      const id = options.id && options.id.trim().length > 0
        ? options.id.trim()
        : makeDocumentId();
      const name =
        options.name && options.name.trim().length > 0
          ? options.name.trim()
          : 'New Composition';
      const doc: ProjectDocument = {
        id,
        name,
        nodes: options.nodes ?? [],
        edges: options.edges ?? [],
        dirty: true
      };
      set(state => {
        if (state.documents[id]) {
          // Idempotent: replace graph if same id re-created.
          return {
            documents: {
              ...state.documents,
              [id]: {
                ...state.documents[id],
                name: doc.name,
                nodes: doc.nodes,
                edges: doc.edges,
                dirty: true
              }
            }
          };
        }
        return {
          documents: {
            ...state.documents,
            [id]: doc
          }
        };
      });
      return get().documents[id] ?? doc;
    },

    renameDocument: (documentId, name) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }
      set(state => {
        const existing = state.documents[documentId];
        if (!existing) {
          return state;
        }
        return {
          documents: {
            ...state.documents,
            [documentId]: {
              ...existing,
              name: trimmed,
              dirty: true
            }
          }
        };
      });
    },

    openDocument: documentId => {
      const state = get();
      if (!state.documents[documentId]) {
        return;
      }
      const open = state.openDocumentIds.includes(documentId)
        ? state.openDocumentIds
        : [...state.openDocumentIds, documentId];
      set({
        openDocumentIds: open,
        activeDocumentId: documentId
      });
    },

    setActiveDocument: documentId => {
      const state = get();
      if (!state.documents[documentId]) {
        return;
      }
      if (!state.openDocumentIds.includes(documentId)) {
        get().openDocument(documentId);
        return;
      }
      set({ activeDocumentId: documentId });
    },

    closeDocument: documentId => {
      const state = get();
      if (documentId === state.mainDocumentId) {
        return;
      }
      const open = state.openDocumentIds.filter(id => id !== documentId);
      const active =
        state.activeDocumentId === documentId
          ? state.mainDocumentId
          : state.activeDocumentId;
      set({
        openDocumentIds: open.length > 0 ? open : [state.mainDocumentId],
        activeDocumentId: active
      });
    },

    getNestedDocumentsForRuntime: () => {
      const state = get();
      const out: Record<
        string,
        { nodes: Node<EditableNodeData>[]; edges: Edge[] }
      > = {};
      for (const [id, doc] of Object.entries(state.documents)) {
        if (id === state.mainDocumentId) {
          continue;
        }
        out[id] = { nodes: doc.nodes, edges: doc.edges };
      }
      return out;
    }
  })
);

export const MAIN_DOCUMENT_ID = MAIN_ID;
