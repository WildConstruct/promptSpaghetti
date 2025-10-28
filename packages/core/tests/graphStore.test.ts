import type { Node, Edge } from 'reactflow';
import { useGraphStore } from '../graphStore';

beforeEach(() => {
  // Reset store state via the public API to avoid relying on module reloads
  useGraphStore.getState().newProject();
});

describe('graphStore basic graph operations', () => {
  test('setNodes/setEdges/add/update/delete/duplicate', () => {
    const s = useGraphStore.getState();

    const n1: Partial<Node> = {
      id: 'n1',
      type: 'textBlock',
      position: { x: 0, y: 0 },
      data: { value: 'A' }
    };
    const n2: Partial<Node> = {
      id: 'n2',
      type: 'textBlock',
      position: { x: 10, y: 10 },
      data: { value: 'B' }
    };

    s.setNodes([n1 as Node]);
    expect(useGraphStore.getState().nodes).toHaveLength(1);

    s.addNode(n2 as Node);
    expect(useGraphStore.getState().nodes.map((n: any) => n.id)).toEqual([
      'n1',
      'n2'
    ]);

    s.updateNode('n1', {
      data: { extra: 1 },
      type: 'textBlock'
    } as Partial<Node>);
    const updated = useGraphStore
      .getState()
      .nodes.find((n: any) => n.id === 'n1');
    expect(updated?.data?.value).toBe('A');
    expect(updated?.data?.extra).toBe(1);

    // Edges
    const e1: Partial<Edge> = { id: 'e1', source: 'n1', target: 'n2' };
    s.setEdges([e1 as Edge]);
    expect(useGraphStore.getState().edges).toHaveLength(1);

    // Duplicate node
    s.duplicateNode('n1');
    const ids = useGraphStore.getState().nodes.map((n: any) => n.id);
    expect(ids.some((id: string) => id.startsWith('n1-copy-'))).toBe(true);

    // Delete node also prunes edges
    s.deleteNode('n1');
    const afterDelete = useGraphStore.getState();
    expect(afterDelete.nodes.find((n: any) => n.id === 'n1')).toBeUndefined();
    expect(
      afterDelete.edges.find((e: any) => e.source === 'n1' || e.target === 'n1')
    ).toBeUndefined();
  });
});

describe('variations operations', () => {
  test('add/update/remove/reorder variations', () => {
    const s = useGraphStore.getState();
    const node: Partial<Node> = {
      id: 'v1',
      type: 'textBlock',
      position: { x: 0, y: 0 },
      data: { variations: ['a', 'b', 'c'] }
    };
    s.addNode(node as Node);

    s.addVariation('v1', 'd');
    expect(
      (useGraphStore.getState().nodes.find((n: any) => n.id === 'v1') as any)
        .data.variations
    ).toEqual(['a', 'b', 'c', 'd']);

    s.updateVariation('v1', 1, 'B');
    expect(
      (useGraphStore.getState().nodes.find((n: any) => n.id === 'v1') as any)
        .data.variations
    ).toEqual(['a', 'B', 'c', 'd']);

    s.reorderVariations('v1', 0, 2);
    expect(
      (useGraphStore.getState().nodes.find((n: any) => n.id === 'v1') as any)
        .data.variations
    ).toEqual(['B', 'c', 'a', 'd']);

    s.removeVariation('v1', 3);
    expect(
      (useGraphStore.getState().nodes.find((n: any) => n.id === 'v1') as any)
        .data.variations
    ).toEqual(['B', 'c', 'a']);
  });
});

describe('sticky notes', () => {
  test('set/add/update/delete mirrors annotations and toggles unsaved flag', () => {
    const s = useGraphStore.getState();
    const note = {
      id: 'sn1',
      position: { x: 5, y: 6 },
      content: 'hello',
      color: 'yellow' as const,
      size: { width: 120, height: 80 },
      author: 'me',
      timestamp: new Date().toISOString()
    };

    s.setStickyNotes([note]);
    expect(useGraphStore.getState().stickyNotes).toHaveLength(1);
    expect(useGraphStore.getState().annotations.stickyNotes).toHaveLength(1);

    s.addStickyNote({ ...note, id: 'sn2' });
    expect(useGraphStore.getState().stickyNotes).toHaveLength(2);

    s.updateStickyNote('sn2', { content: 'updated' });
    expect(
      useGraphStore.getState().stickyNotes.find((n: any) => n.id === 'sn2')
        ?.content
    ).toBe('updated');

    s.deleteStickyNote('sn1');
    expect(
      useGraphStore.getState().stickyNotes.find((n: any) => n.id === 'sn1')
    ).toBeUndefined();
  });
});

describe('node labels', () => {
  test('add/update/delete configs and preferences', () => {
    const s = useGraphStore.getState();
    const cfg = {
      id: 'lbl1',
      nodeId: 'nX',
      customLabel: 'L',
      displayMode: 'always' as const,
      position: 'bottom' as const,
      style: 'default' as const,
      author: 'me',
      timestamp: new Date().toISOString()
    };

    s.addNodeLabelConfig(cfg);
    expect(
      useGraphStore.getState().annotations.nodeLabelConfigs['lbl1']
    ).toBeTruthy();

    s.updateNodeLabelConfig('lbl1', { customLabel: 'L2' });
    expect(
      useGraphStore.getState().annotations.nodeLabelConfigs['lbl1'].customLabel
    ).toBe('L2');

    s.setLabelPreferences({ defaultDisplayMode: 'hover' });
    expect(
      useGraphStore.getState().annotations.labelPreferences.defaultDisplayMode
    ).toBe('hover');

    s.deleteNodeLabelConfig('lbl1');
    expect(
      useGraphStore.getState().annotations.nodeLabelConfigs['lbl1']
    ).toBeUndefined();
  });
});

describe('region groups', () => {
  test('set/add/update/delete and preferences', () => {
    const s = useGraphStore.getState();
    const group = {
      id: 'g1',
      label: 'Group',
      color: '#000',
      bounds: { x: 0, y: 0, width: 100, height: 100 },
      collapsed: false,
      visible: true,
      style: 'rounded' as const,
      visibility: 'always' as const,
      nodeIds: [],
      author: 'me',
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    s.setRegionGroups([group]);
    expect(useGraphStore.getState().annotations.regionGroups).toHaveLength(1);

    s.addRegionGroup({ ...group, id: 'g2' });
    expect(useGraphStore.getState().annotations.regionGroups).toHaveLength(2);

    s.updateRegionGroup('g2', { label: 'New' });
    expect(
      useGraphStore
        .getState()
        .annotations.regionGroups.find((g: any) => g.id === 'g2')?.label
    ).toBe('New');

    s.setRegionGroupPreferences({ defaultColor: '#fff' });
    expect(
      useGraphStore.getState().annotations.regionGroupPreferences.defaultColor
    ).toBe('#fff');

    s.deleteRegionGroup('g1');
    expect(
      useGraphStore
        .getState()
        .annotations.regionGroups.find((g: any) => g.id === 'g1')
    ).toBeUndefined();
  });
});

describe('connection labels and annotations', () => {
  test('labels add/update/remove', () => {
    const s = useGraphStore.getState();
    const label = {
      id: 'cl1',
      connectionId: 'e1',
      content: 'hi',
      position: { x: 0, y: 0 },
      positionType: 'middle' as const,
      positionOffset: 0.5,
      style: 'default' as const,
      visible: true,
      author: 'me',
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    s.addConnectionLabel(label);
    expect(
      useGraphStore.getState().annotations.connectionLabels?.length || 0
    ).toBeGreaterThan(0);

    s.updateConnectionLabel('cl1', { content: 'bye' });
    expect(
      useGraphStore
        .getState()
        .annotations.connectionLabels?.find((l: any) => l.id === 'cl1')?.content
    ).toBe('bye');

    s.removeConnectionLabel('cl1');
    expect(
      useGraphStore
        .getState()
        .annotations.connectionLabels?.find((l: any) => l.id === 'cl1')
    ).toBeUndefined();
  });

  test('annotations add/update/remove and preferences', () => {
    const s = useGraphStore.getState();
    const ann = {
      id: 'a1',
      connectionId: 'e1',
      labels: [],
      visualStyle: 'solid' as const,
      author: 'me',
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    s.addConnectionAnnotation(ann);
    expect(
      useGraphStore.getState().annotations.connectionAnnotations.length
    ).toBe(1);

    s.updateConnectionAnnotation('a1', { visualStyle: 'dashed' });
    expect(
      useGraphStore
        .getState()
        .annotations.connectionAnnotations.find((a: any) => a.id === 'a1')
        ?.visualStyle
    ).toBe('dashed');

    s.setConnectionAnnotationPreferences({ defaultVisualStyle: 'dotted' });
    expect(
      useGraphStore.getState().annotations.connectionAnnotationPreferences
        .defaultVisualStyle
    ).toBe('dotted');

    s.removeConnectionAnnotation('a1');
    expect(
      useGraphStore
        .getState()
        .annotations.connectionAnnotations.find((a: any) => a.id === 'a1')
    ).toBeUndefined();
  });
});

describe('project ops and graph data IO', () => {
  test('newProject resets; saved/modified flags; get/load graph', () => {
    const s = useGraphStore.getState();
    // seed some state
    s.setNodes([
      { id: 'x', type: 'textBlock', position: { x: 0, y: 0 } } as any
    ]);
    s.setEdges([{ id: 'ex', source: 'x', target: 'x' } as any]);

    s.markProjectModified();
    expect(useGraphStore.getState().hasUnsavedChanges).toBe(true);

    s.markProjectSaved();
    expect(useGraphStore.getState().hasUnsavedChanges).toBe(false);

    // getGraphData
    const { nodes, edges } = useGraphStore.getState().getGraphData();
    expect(nodes.length).toBe(1);
    expect(edges.length).toBe(1);

    // newProject
    s.newProject();
    const after = useGraphStore.getState();
    expect(after.nodes.length).toBe(0);
    expect(after.edges.length).toBe(0);
    expect(after.stickyNotes.length).toBe(0);
    expect(after.hasUnsavedChanges).toBe(false);

    // loadGraphData
    s.loadGraphData(
      [{ id: 'n', type: 'textBlock', position: { x: 0, y: 0 } } as any],
      [{ id: 'e', source: 'n', target: 'n' } as any]
    );
    const loaded = useGraphStore.getState();
    expect(loaded.nodes.length).toBe(1);
    expect(loaded.edges.length).toBe(1);
    expect(loaded.hasUnsavedChanges).toBe(true);
  });
});
