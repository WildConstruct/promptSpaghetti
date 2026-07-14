import { quickStartTemplates } from '../quickStartTemplates';
import { TEMPLATE_CATALOG_BY_ID } from '../templateCatalog';
import { GraphConverter } from '@promptscape/core/components/epic1/services/GraphConverter';
import { Epic1ExecutionEngine } from '@promptscape/core/runtime/nodes/epic1/Epic1ExecutionEngine';
import type { Node, Edge } from 'reactflow';

describe('nested_psg_intro teaching graph', () => {
  it('is registered in the catalog and template map', () => {
    expect(quickStartTemplates.nested_psg_intro).toBeDefined();
    expect(TEMPLATE_CATALOG_BY_ID.nested_psg_intro).toMatchObject({
      id: 'nested_psg_intro',
      title: 'Nested PSG Intro'
    });
  });

  it('embeds a child document and a SubPSG reference', () => {
    const tmpl = quickStartTemplates.nested_psg_intro;
    expect(tmpl.documents).toHaveLength(1);
    const doc = tmpl.documents![0];
    expect(doc.id).toBe('doc-forge-wares');
    expect(doc.name).toBe('Forge Wares');

    const sub = tmpl.nodes.find(n => n.type === 'subPsg');
    expect(sub).toBeDefined();
    expect((sub!.data as { documentId?: string }).documentId).toBe(
      'doc-forge-wares'
    );

    const hasSlotEdge = tmpl.edges.some(
      e =>
        e.source === sub!.id &&
        typeof e.targetHandle === 'string' &&
        e.targetHandle.startsWith('slot-')
    );
    expect(hasSlotEdge).toBe(true);
  });

  it('executes through the engine via GraphConverter + nested docs', async () => {
    const tmpl = quickStartTemplates.nested_psg_intro;
    const nested: Record<string, { nodes: Node[]; edges: Edge[] }> = {};
    for (const doc of tmpl.documents ?? []) {
      nested[doc.id] = {
        nodes: doc.nodes as Node[],
        edges: doc.edges as Edge[]
      };
    }

    const runtime = GraphConverter.convertToRuntimeGraph(
      tmpl.nodes as Node[],
      tmpl.edges as Edge[],
      nested
    );
    expect(runtime).not.toBeNull();
    expect(runtime!.nestedDocuments?.['doc-forge-wares']).toBeDefined();

    const result = await new Epic1ExecutionEngine(runtime!, 123).execute();
    expect(result.success).toBe(true);
    expect(String(result.output)).toMatch(
      /quiet village where (iron tools|ornate blades|horseshoes and nails)/i
    );
  });
});
