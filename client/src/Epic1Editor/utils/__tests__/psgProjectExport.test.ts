import {
  MAIN_DOCUMENT_ID,
  useDocumentProjectStore
} from '@promptscape/core/stores/documentProjectStore';
import {
  buildPsgFromProjectParts,
  exportActiveProjectToPSG
} from '../psgProjectExport';
import type { Edge, Node } from 'reactflow';

const n = (id: string, label: string): Node => ({
  id,
  type: 'textBlock',
  position: { x: 0, y: 0 },
  data: { text: label, value: label, nodeType: 'textBlock' }
});

const e = (id: string, source: string, target: string): Edge => ({
  id,
  source,
  target
});

describe('psgProjectExport (G4)', () => {
  beforeEach(() => {
    useDocumentProjectStore.getState().resetProject({
      id: MAIN_DOCUMENT_ID,
      name: 'Main',
      nodes: [n('main-a', 'parent text')],
      edges: []
    });
  });

  it('buildPsgFromProjectParts puts nested docs in documents[]', () => {
    const psg = buildPsgFromProjectParts(
      {
        nodes: [n('m1', 'main')],
        edges: [],
        name: 'Parent'
      },
      [
        {
          id: 'doc-child',
          name: 'Child',
          nodes: [n('c1', 'child')],
          edges: []
        }
      ],
      { name: 'Project' }
    );

    expect(psg.name).toBe('Project');
    expect(psg.nodes.some(node => node.id === 'm1')).toBe(true);
    expect(psg.documents).toHaveLength(1);
    expect(psg.documents?.[0].id).toBe('doc-child');
    expect(psg.documents?.[0].name).toBe('Child');
  });

  it('exportActiveProjectToPSG uses main composition as root even if child is active', () => {
    const store = useDocumentProjectStore.getState();
    store.createNestedDocument({
      id: 'doc-forge',
      name: 'Forge',
      nodes: [n('f1', 'iron tools')],
      edges: []
    });
    store.openDocument('doc-forge');

    // Active canvas is the child; export must still root on Main.
    const psg = exportActiveProjectToPSG(
      [n('f1', 'iron tools edited')],
      [],
      { name: 'Nested Project' }
    );

    expect(psg.name).toBe('Nested Project');
    // Main root still parent text
    expect(psg.nodes.some(node => node.id === 'main-a')).toBe(true);
    expect(psg.documents?.some(d => d.id === 'doc-forge')).toBe(true);
    // Child flush preserved edits
    const child = psg.documents?.find(d => d.id === 'doc-forge');
    expect(child?.nodes.some(node => node.id === 'f1')).toBe(true);
  });

  it('classic single-graph export when no nested docs', () => {
    useDocumentProjectStore.getState().setActiveDocument(MAIN_DOCUMENT_ID);
    const psg = exportActiveProjectToPSG([n('only', 'solo')], [], {
      name: 'Solo'
    });
    expect(psg.documents).toBeUndefined();
    expect(psg.nodes.some(node => node.id === 'only')).toBe(true);
    expect(psg.name).toBe('Solo');
  });
});
