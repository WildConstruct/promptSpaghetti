import { SimilarityEngine } from '../../../services/llm/SimilarityEngine';
import type { SegmentMetadata } from '../../../services/llm/MetadataExtractor';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('SimilarityEngine scoring heuristics', () => {
  let engine: SimilarityEngine;
  let queryMetadata: SegmentMetadata;

  beforeEach(() => {
    engine = new SimilarityEngine();
    queryMetadata = {
      subject: 'calm patrol',
      action: 'observe',
      location: 'urban',
      mood: 'calm',
      intensity: 5,
      tags: ['action', 'hero'],
      extracted_by: 'test',
      extraction_date: new Date().toISOString(),
      consent_flag: true
    };
  });

  it('uses metadata-aware scores for style, tags, and recency', async () => {
    const assetMetadata: SegmentMetadata = {
      subject: 'calm patrol',
      action: 'observe',
      location: 'urban',
      mood: 'calm',
      intensity: 5,
      tags: ['action', 'hero', 'support'],
      extracted_by: 'unit-test',
      extraction_date: new Date().toISOString(),
      consent_flag: true
    };

    await engine.indexAsset('asset-1', 'Calm hero patrol', assetMetadata);

    const freshResults = await engine.findSimilar(
      'Calm hero patrol',
      queryMetadata,
      { limit: 1, threshold: 0 }
    );

    expect(freshResults).toHaveLength(1);
    const freshMatch = freshResults[0];
    expect(freshMatch.matches?.style).toBeCloseTo(1, 5);
    expect(freshMatch.matches?.tags).toBeCloseTo(2 / 3, 3);
    expect(freshMatch.matches?.recency).toBeCloseTo(1, 5);

    const internalEngine = engine as unknown as {
      vectorDB: { embeddings: Map<string, { timestamp: string }> };
    };
    const embeddings =
      internalEngine.vectorDB.embeddings ??
      (internalEngine.vectorDB as Record<string, Map<string, any>>).embeddings;
    const stored = embeddings.get('asset-1');
    expect(stored).toBeDefined();
    if (stored) {
      stored.timestamp = new Date(Date.now() - 40 * DAY_MS).toISOString();
    }

    const agedResults = await engine.findSimilar(
      'Calm hero patrol',
      queryMetadata,
      { limit: 1, threshold: 0 }
    );

    expect(agedResults).toHaveLength(1);
    const agedMatch = agedResults[0];
    expect(agedMatch.matches?.style).toBeCloseTo(1, 5);
    expect(agedMatch.matches?.tags).toBeCloseTo(2 / 3, 3);
    expect(freshMatch.matches?.recency).toBeDefined();
    const freshRecency = freshMatch.matches?.recency ?? 0;
    const agedRecency = agedMatch.matches?.recency ?? 0;
    expect(agedRecency).toBeLessThan(freshRecency);
    expect(agedRecency).toBeCloseTo(0.5, 1);
  });
});
