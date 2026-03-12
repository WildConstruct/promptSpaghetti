import { AgentDraftService } from '../src/services/AgentDraftService';

describe('AgentDraftService', () => {
  test('returns a deterministic fallback draft when model drafting is unavailable', async () => {
    const service = new AgentDraftService({
      available: () => false
    } as any);

    const result = await service.draftGraphFromPrompt({
      prompt: 'A moody city portrait with neon signs and rainy streets',
      mode: 'draft',
      options: { maxNewNodes: 6, autoConnect: true, preserveVariables: true }
    });

    expect(result.ok).toBe(true);
    expect(result.fallback).toBe(true);
    expect(result.model).toBe('heuristic-segmentation-v1');
    expect(result.notes).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Used heuristic segmentation fallback'),
        expect.stringContaining('missing API key')
      ])
    );

    expect(result.operations).toHaveLength(1);
    expect(result.operations[0]).toMatchObject({
      kind: 'insertNodes'
    });

    const insertOperation = result.operations[0];
    if (insertOperation.kind !== 'insertNodes') {
      throw new Error('Expected insertNodes operation in fallback response');
    }

    expect(insertOperation.nodes.length).toBeGreaterThan(0);
    expect(insertOperation.nodes.some(node => node.type === 'output')).toBe(true);
    expect(insertOperation.edges.length).toBeGreaterThan(0);
    expect(insertOperation.edges.every(edge => edge.target)).toBe(true);
  });
});
