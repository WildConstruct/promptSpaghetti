/**
 * Nested PSG project store — keeps parent + child documents in memory
 * for precomp-style tabs (docs/nested-psg-precomp-plan.md).
 */
import { create } from 'zustand';
import type { Edge, Node } from 'reactflow';
import type { EditableNodeData } from '../components/epic1/nodes';

export type ProjectDocument = {
  id: string;
  name: string;
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
  dirty?: boolean;
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
  openDocument: (documentId: string) => void;
  setActiveDocument: (documentId: string) => void;
  closeDocument: (documentId: string) => void;
  getNestedDocumentsForRuntime: () => Record<
    string,
    { nodes: Node<EditableNodeData>[]; edges: Edge[] }
  >;
};

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
