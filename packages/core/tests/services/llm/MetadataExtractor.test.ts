import { MetadataExtractor } from '../../../services/llm/MetadataExtractor';

const createLLMStub = (overrides: Partial<Record<string, unknown>>) =>
  overrides as unknown as { [key: string]: unknown };

describe('MetadataExtractor', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('serves cached metadata on subsequent calls', async () => {
    const extractor = new MetadataExtractor();
    const first = await extractor.extract('The urban chaos unfolds quickly.');
    expect(first.fromCache).toBe(false);

    const second = await extractor.extract('The urban chaos unfolds quickly.');
    expect(second.fromCache).toBe(true);
    expect(second.metadata.tags).toContain('urban');
  });

  it('leverages offline patterns before hitting LLM', async () => {
    const extractor = new MetadataExtractor();
    const result = await extractor.extract('A desert scene with dunes.');

    expect(result.metadata.tags).toContain('desert');
    expect(result.metadata.fallbackReason).toBe('offline-cache');
    expect(result.metadata.extracted_by).toBe('offline-cache');
  });

  it('uses LLM service when available and caches result', async () => {
    const llm = createLLMStub({
      extractMetadata: jest.fn().mockResolvedValue({
        metadata: {
          subject: 'dragon',
          tags: ['fantasy', 'dragon'],
          summary: 'A dragon appears.'
        }
      })
    });

    const extractor = new MetadataExtractor(llm as any);
    const first = await extractor.extract('A mighty dragon appears.');
    expect((llm.extractMetadata as jest.Mock)).toHaveBeenCalled();
    expect(first.metadata.tags).toEqual(['fantasy', 'dragon']);
    expect(first.metadata.summary).toBe('A dragon appears.');
    expect(first.metadata.extracted_by).toBe('llm-service');

    const second = await extractor.extract('A mighty dragon appears.');
    expect(second.fromCache).toBe(true);
  });

  it('falls back to basic extraction when LLM fails', async () => {
    const llm = createLLMStub({
      extractMetadata: jest.fn().mockRejectedValue(new Error('LLM offline')),
      complete: jest.fn().mockRejectedValue(new Error('still offline'))
    });

    const extractor = new MetadataExtractor(llm as any);
    const result = await extractor.extract('Crowds panic in the city street');

    expect(result.metadata.tags).toEqual(expect.arrayContaining(['urban']));
    expect(result.metadata.fallbackReason).toBe('basic-fallback');
    expect(result.metadata.extracted_by).toBe('basic-fallback');
  });

  it('handles background extraction without throwing', async () => {
    const llm = createLLMStub({
      extractMetadata: jest.fn().mockRejectedValue(new Error('LLM down'))
    });

    const extractor = new MetadataExtractor(llm as any);
    await expect(
      extractor.extractInBackground('Background extraction')
    ).resolves.toBeUndefined();
  });

  it('normalizes metadata payload returned as JSON string', async () => {
    const llm = createLLMStub({
      metadata: jest.fn().mockResolvedValue(
        JSON.stringify({
          metadata: {
            subject: 'Courageous Knight',
            themes: [{ topic: 'Valor', confidence: 90 }],
            entities: [{ label: 'Sir Galen', category: 'Hero', score: 0.82 }],
            tags: ''
          },
          summary: 'A knight stands tall.'
        })
      )
    });

    const extractor = new MetadataExtractor(llm as any);
    const result = await extractor.extract('A knight defends the city walls.');

    expect((llm.metadata as jest.Mock)).toHaveBeenCalled();
    expect(result.metadata.subject).toBe('Courageous Knight');
    expect(result.metadata.summary).toBe('A knight stands tall.');
    expect(result.metadata.tags).toEqual(['Valor']);
    expect(result.metadata.themes).toEqual([
      { name: 'Valor', confidence: 0.9 }
    ]);
    expect(result.metadata.entities).toEqual([
      { name: 'Sir Galen', type: 'Hero', confidence: 0.82 }
    ]);
  });

  it('handles completion API with options signature and fills fallback tags', async () => {
    const completeFn = jest.fn(
      async (prompt: string, options?: Record<string, unknown>) => {
        expect(prompt).toContain('Extract rich metadata');
        expect(options).toMatchObject({
          responseFormat: 'json',
          taskType: 'metadata',
          maxTokens: 220
        });
        return {
          content: JSON.stringify({
            metadata: {
              subject: 'City Chase',
              style: 'noir, thriller',
              themes: [],
              entities: [],
              tags: []
            },
            summary: 'A tense pursuit through the skyline.'
          }),
          model: 'gpt-metadata-pro'
        };
      }
    );

    const llm = createLLMStub({ complete: completeFn });
    const extractor = new MetadataExtractor(llm as any);
    const result = await extractor.extract(
      'Speeding vehicle races through the urban city.'
    );

    expect(completeFn).toHaveBeenCalledTimes(1);
    expect(result.metadata.tags).toEqual(
      expect.arrayContaining(['vehicle', 'urban'])
    );
    expect(result.metadata.fallbackReason).toBe('No tags returned from LLM');
    expect(result.metadata.summary).toBe('A tense pursuit through the skyline.');
    expect(result.metadata.extracted_by).toBe('gpt-metadata-pro');
  });

  it('handles completion API with request signature returning structured content', async () => {
    const completeFn = jest.fn(async (request: Record<string, unknown>) => {
      expect(request).toMatchObject({
        responseFormat: 'json',
        taskType: 'metadata'
      });
      return {
        content: {
          subject: 'Forest Camp',
          tags: ['nature', 'camping'],
          themes: [{ name: 'Serenity', confidence: 0.6 }],
          entities: ['Campfire']
        }
      };
    });

    const llm = createLLMStub({ complete: completeFn });
    const extractor = new MetadataExtractor(llm as any);
    const result = await extractor.extract('A peaceful camp beneath tall trees.');

    expect(completeFn).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: expect.stringContaining('Extract rich metadata') })
    );
    expect(result.metadata.subject).toBe('Forest Camp');
    expect(result.metadata.tags).toEqual(['nature', 'camping']);
    expect(result.metadata.themes).toEqual([
      { name: 'Serenity', confidence: 0.6 }
    ]);
    expect(result.metadata.entities).toEqual([{ name: 'Campfire' }]);
    expect(result.metadata.extracted_by).toBe('llm-service');
  });

  it('supports batch extraction helper and cache utilities', async () => {
    const extractor = new MetadataExtractor();
    const spy = jest.spyOn(extractor as any, 'extract');
    spy.mockImplementation(async (text: string) => ({
      metadata: { subject: text, tags: [], themes: [], entities: [] },
      extractionTime: 1,
      fromCache: false
    }));

    const results = await extractor.extractBatch([
      'First segment',
      'Second segment',
      'Third segment'
    ]);

    expect(results).toHaveLength(3);
    expect(spy).toHaveBeenCalledTimes(3);

    extractor.clearCache();
    expect(extractor.getCacheStats()).toEqual({ size: 0, hitRate: 0.75 });
    spy.mockRestore();
  });

  it('parses search queries and calculates relevance scores', () => {
    const extractor = new MetadataExtractor();
    const { filters, keywords } = extractor.parseSearchQuery(
      'Intense urban action scene with neon lights'
    );

    expect(filters).toEqual({
      location: 'urban',
      mood: 'intense',
      action: '*'
    });
    expect(keywords).toEqual(['neon', 'lights']);

    const metadata = {
      subject: 'Neon chase',
      location: 'urban',
      mood: 'intense',
      action: 'run',
      tags: ['neon', 'chase']
    };

    const relevance = extractor.calculateRelevance(metadata, filters);
    expect(relevance).toBeGreaterThan(0);
  });
});
