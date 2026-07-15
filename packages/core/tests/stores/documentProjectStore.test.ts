import {
  MAIN_DOCUMENT_ID,
  useDocumentProjectStore
} from '../../stores/documentProjectStore';

describe('documentProjectStore', () => {
  beforeEach(() => {
    useDocumentProjectStore.getState().resetProject({
      id: MAIN_DOCUMENT_ID,
      name: 'Main',
      nodes: [],
      edges: []
    });
  });

  it('createNestedDocument adds a child without replacing main', () => {
    const created = useDocumentProjectStore.getState().createNestedDocument({
      name: 'Forge',
      nodes: [{ id: 'n1', type: 'textBlock', position: { x: 0, y: 0 }, data: {} }],
      edges: []
    });

    const state = useDocumentProjectStore.getState();
    expect(created.id).toMatch(/^doc-/);
    expect(created.name).toBe('Forge');
    expect(state.documents[MAIN_DOCUMENT_ID]).toBeDefined();
    expect(state.documents[created.id]?.name).toBe('Forge');
    expect(state.activeDocumentId).toBe(MAIN_DOCUMENT_ID);
    expect(Object.keys(state.getNestedDocumentsForRuntime())).toContain(
      created.id
    );
  });

  it('openDocument switches active and tracks open tabs', () => {
    const created = useDocumentProjectStore
      .getState()
      .createNestedDocument({ name: 'Child' });
    useDocumentProjectStore.getState().openDocument(created.id);
    const state = useDocumentProjectStore.getState();
    expect(state.activeDocumentId).toBe(created.id);
    expect(state.openDocumentIds).toEqual([MAIN_DOCUMENT_ID, created.id]);
  });

  it('renameDocument updates the display name', () => {
    const created = useDocumentProjectStore
      .getState()
      .createNestedDocument({ name: 'Old' });
    useDocumentProjectStore.getState().renameDocument(created.id, 'New Name');
    expect(useDocumentProjectStore.getState().documents[created.id]?.name).toBe(
      'New Name'
    );
  });

  it('updateDocumentSession stores per-document history and viewport', () => {
    const created = useDocumentProjectStore
      .getState()
      .createNestedDocument({ name: 'Child' });

    useDocumentProjectStore.getState().updateDocumentSession(created.id, {
      viewport: { x: 12, y: 34, zoom: 1.25 },
      history: {
        index: 0,
        entries: [
          {
            timestamp: 1,
            nodes: [
              {
                id: 'a',
                type: 'textBlock',
                position: { x: 0, y: 0 },
                data: {}
              }
            ],
            edges: []
          }
        ]
      }
    });

    const doc = useDocumentProjectStore.getState().documents[created.id];
    expect(doc?.viewport).toEqual({ x: 12, y: 34, zoom: 1.25 });
    expect(doc?.history?.index).toBe(0);
    expect(doc?.history?.entries).toHaveLength(1);
    expect(doc?.history?.entries[0].nodes[0].id).toBe('a');
  });
});
