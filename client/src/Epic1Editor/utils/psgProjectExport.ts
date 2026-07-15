/**
 * Nested PSG project export helpers (G4).
 * Ensures the main composition is the PSG root and nested docs go in documents[].
 */
import type { Edge, Node } from 'reactflow';
import {
  exportGraphToPSG,
  type PSGFile,
  type PSGNestedDocument
} from '@promptscape/core/fileFormats/psg';
import {
  MAIN_DOCUMENT_ID,
  useDocumentProjectStore,
  type ProjectDocument
} from '@promptscape/core/stores/documentProjectStore';

export type ProjectExportOptions = {
  name?: string;
  description?: string;
  tags?: string[];
};

/**
 * Pure: build PSG with explicit main + nested documents (testable without DOM).
 */
export function buildPsgFromProjectParts(
  main: { nodes: Node[]; edges: Edge[]; name?: string },
  nested: Array<{
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
  }>,
  options: ProjectExportOptions = {}
): PSGFile {
  const documents: PSGNestedDocument[] | undefined =
    nested.length === 0
      ? undefined
      : nested.map(doc => {
          const exported = exportGraphToPSG(
            doc.nodes as Parameters<typeof exportGraphToPSG>[0],
            doc.edges as Parameters<typeof exportGraphToPSG>[1],
            { name: doc.name }
          );
          return {
            id: doc.id,
            name: doc.name,
            nodes: exported.nodes,
            edges: exported.edges,
            regions: exported.regions
          };
        });

  return exportGraphToPSG(
    main.nodes as Parameters<typeof exportGraphToPSG>[0],
    main.edges as Parameters<typeof exportGraphToPSG>[1],
    {
      name: options.name || main.name || 'Prompt Spaghetti Graph',
      description: options.description,
      metadata:
        options.tags && options.tags.length > 0
          ? { tags: options.tags }
          : undefined,
      documents
    }
  );
}

/**
 * Flush the active canvas into the project store, then export main + nested.
 * Call this from local export and Supabase save paths.
 */
export function exportActiveProjectToPSG(
  activeNodes: Node[],
  activeEdges: Edge[],
  options: ProjectExportOptions = {}
): PSGFile {
  const store = useDocumentProjectStore.getState();

  // Persist the tab the user is looking at before packaging the project.
  if (store.documents[store.activeDocumentId]) {
    store.updateDocumentGraph(
      store.activeDocumentId,
      activeNodes as ProjectDocument['nodes'],
      activeEdges as ProjectDocument['edges']
    );
  }

  const state = useDocumentProjectStore.getState();
  const mainId = state.mainDocumentId || MAIN_DOCUMENT_ID;
  const main = state.documents[mainId];
  const nested = Object.values(state.documents).filter(
    doc => doc.id !== mainId
  );

  // No main record: classic single-graph export from the active canvas.
  if (!main) {
    return buildPsgFromProjectParts(
      { nodes: activeNodes, edges: activeEdges, name: options.name },
      nested.map(d => ({
        id: d.id,
        name: d.name,
        nodes: d.nodes as Node[],
        edges: d.edges as Edge[]
      })),
      options
    );
  }

  return buildPsgFromProjectParts(
    {
      nodes: main.nodes as Node[],
      edges: main.edges as Edge[],
      name: main.name
    },
    nested.map(d => ({
      id: d.id,
      name: d.name,
      nodes: d.nodes as Node[],
      edges: d.edges as Edge[]
    })),
    options
  );
}
