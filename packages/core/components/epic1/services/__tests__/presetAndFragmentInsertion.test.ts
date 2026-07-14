import type { Edge } from 'reactflow';
import {
  buildEdgeSpliceTarget,
  buildViewportFallbackInsertion,
  presetToAgentFragmentRecord
} from '../presetAndFragmentInsertion';

describe('presetAndFragmentInsertion', () => {
  describe('presetToAgentFragmentRecord', () => {
    it('maps core preset fields and defaults insertion strategies', () => {
      const record = presetToAgentFragmentRecord({
        id: 'p1',
        name: 'Family DNA',
        description: 'test',
        category: 'characters',
        tags: ['dna'],
        nodes: 3,
        path: '/assets/family.psg',
        metadata: {
          preferredInsertion: 'replace-node',
          suggestionWeight: 2
        }
      } as never);

      expect(record).toMatchObject({
        id: 'p1',
        name: 'Family DNA',
        path: '/assets/family.psg',
        category: 'characters',
        nodeCount: 3,
        preferredInsertion: 'replace-node',
        entryStrategy: 'auto-boundary',
        exitStrategy: 'auto-boundary',
        suggestionWeight: 2
      });
    });
  });

  describe('buildEdgeSpliceTarget', () => {
    it('returns null when edge is missing', () => {
      expect(buildEdgeSpliceTarget([], 'nope')).toBeNull();
      expect(buildEdgeSpliceTarget([], null)).toBeNull();
    });

    it('snapshots edge fields for splice', () => {
      const edges: Edge[] = [
        {
          id: 'e1',
          source: 'a',
          target: 'b',
          sourceHandle: 'source',
          targetHandle: 'target',
          type: 'default'
        }
      ];
      expect(buildEdgeSpliceTarget(edges, 'e1')).toEqual({
        edgeId: 'e1',
        sourceId: 'a',
        targetId: 'b',
        edgeType: 'default',
        edgeClassName: undefined,
        edgeStyle: undefined,
        markerEnd: undefined,
        sourceHandle: 'source',
        targetHandle: 'target'
      });
    });
  });

  describe('buildViewportFallbackInsertion', () => {
    it('uses fallback coords without a React Flow instance', () => {
      const plan = buildViewportFallbackInsertion(null);
      expect(plan.anchor).toBe('free-placement');
      expect(plan.position).toEqual({ x: 250, y: 250 });
    });
  });
});
