import { applySlotSelectionsToAnalysis } from '../applySlotSelections';
import type { PromptAnalysis } from '../../../lib/simplePromptParser';
import type { SlotReviewRow } from '../FragmentSlotReview';

const baseAnalysis = (): PromptAnalysis => ({
  segments: [
    { text: 'a detective', startIndex: 0, endIndex: 11 },
    { text: 'rainy street', startIndex: 13, endIndex: 25 }
  ],
  nodes: [
    {
      node: {
        id: 'n1',
        nodeType: 'Text',
        getPreviewText: () => 'a detective',
        data: { text: 'a detective', value: 'a detective' }
      }
    },
    {
      node: {
        id: 'n2',
        nodeType: 'Text',
        getPreviewText: () => 'rainy street',
        data: { text: 'rainy street', value: 'rainy street' }
      }
    },
    {
      node: {
        id: 'out',
        nodeType: 'Output',
        getPreviewText: () => 'Output'
      }
    }
  ],
  mappings: [],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2' },
    { id: 'e2', source: 'n2', target: 'out' }
  ],
  rawPrompt: 'a detective, rainy street'
});

describe('applySlotSelectionsToAnalysis', () => {
  it('keeps original text when selection is original', () => {
    const rows: SlotReviewRow[] = [
      {
        slot: {
          id: 'slot-1',
          sourceText: 'a detective',
          slotType: 'subject',
          classificationConfidence: 0.8
        },
        candidates: [],
        selection: { kind: 'original' }
      },
      {
        slot: {
          id: 'slot-2',
          sourceText: 'rainy street',
          slotType: 'setting',
          classificationConfidence: 0.8
        },
        candidates: [],
        selection: { kind: 'original' }
      }
    ];
    const next = applySlotSelectionsToAnalysis(baseAnalysis(), rows);
    expect(next.nodes).toHaveLength(3);
    expect(next.nodes[0].node.getPreviewText?.()).toBe('a detective');
  });

  it('swaps fragment selection onto a text node with fragmentPath', () => {
    const rows: SlotReviewRow[] = [
      {
        slot: {
          id: 'slot-1',
          sourceText: 'a detective',
          slotType: 'subject',
          classificationConfidence: 0.8
        },
        candidates: [],
        selection: {
          kind: 'fragment',
          candidate: {
            fragmentId: 'roman-citizen',
            name: 'Roman Citizen',
            path: '/assets/library/RomanCitizen.psg',
            score: 40,
            reasons: ['same slot (subject)']
          }
        }
      },
      {
        slot: {
          id: 'slot-2',
          sourceText: 'rainy street',
          slotType: 'setting',
          classificationConfidence: 0.8
        },
        candidates: [],
        selection: { kind: 'original' }
      }
    ];
    const next = applySlotSelectionsToAnalysis(baseAnalysis(), rows);
    const first = next.nodes[0].node;
    expect(first.getPreviewText?.()).toBe('Roman Citizen');
    expect(first.data?.fragmentPath).toBe('/assets/library/RomanCitizen.psg');
    expect(first.data?.fragmentSwap).toBe(true);
  });

  it('drops skipped slots and dangling edges', () => {
    const rows: SlotReviewRow[] = [
      {
        slot: {
          id: 'slot-1',
          sourceText: 'a detective',
          slotType: 'subject',
          classificationConfidence: 0.8
        },
        candidates: [],
        selection: { kind: 'original' }
      },
      {
        slot: {
          id: 'slot-2',
          sourceText: 'rainy street',
          slotType: 'setting',
          classificationConfidence: 0.8
        },
        candidates: [],
        selection: { kind: 'none' }
      }
    ];
    const next = applySlotSelectionsToAnalysis(baseAnalysis(), rows);
    expect(next.nodes.map(n => n.node.id)).toEqual(['n1', 'out']);
    expect(next.edges.every(e => e.source !== 'n2' && e.target !== 'n2')).toBe(
      true
    );
  });
});
