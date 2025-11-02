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

  describe('normalization edge cases', () => {
    it('gracefully handles empty and invalid JSON payload strings', () => {
      const extractor = new MetadataExtractor();
      const debugSpy = jest
        .spyOn(console, 'debug')
        .mockImplementation(() => undefined);

      const normalize = (extractor as any).normalizeMetadataPayload.bind(extractor);

      expect(normalize(null, 'absent payload')).toBeNull();
      expect(normalize(42, 'numeric payload')).toBeNull();
      expect(normalize('   ', 'empty payload')).toBeNull();
      expect(normalize('not valid json', 'invalid payload')).toBeNull();

      expect(debugSpy).toHaveBeenCalledWith(
        'Failed to parse metadata payload string:',
        expect.any(SyntaxError)
      );
      debugSpy.mockRestore();
    });

    it('derives tags from themes and respects consent flags', () => {
      const extractor = new MetadataExtractor();
      const normalize = (extractor as any).normalizeMetadataPayload.bind(extractor);

      const payload = {
        metadata: {
          subject: 'Heroic escape',
          themes: [{ name: 'Valor', confidence: 95 }],
          entities: [],
          tags: [],
          consent_flag: false
        }
      };

      const result = normalize(payload, 'A hero races through danger.', {
        model: 'gpt-metadata-plus'
      });

      expect(result?.tags).toEqual(['Valor']);
      expect(result?.themes).toEqual([{ name: 'Valor', confidence: 0.95 }]);
      expect(result?.extracted_by).toBe('gpt-metadata-plus');
      expect(result?.consent_flag).toBe(false);
    });

    it('falls back to entity names when no tags or themes exist', () => {
      const extractor = new MetadataExtractor();
      const normalize = (extractor as any).normalizeMetadataPayload.bind(extractor);

      const payload = {
        subject: 'The council gathers',
        entities: [
          { name: 'Archivist', entityType: 'advisor', score: '82' },
          { label: '   ' },
          'Silent Watcher'
        ]
      };

      const result = normalize(payload, 'The council gathers in silence.');

      expect(result?.tags).toEqual(['Archivist', 'Silent Watcher']);
      expect(result?.entities).toEqual([
        { name: 'Archivist', type: 'advisor', confidence: 0.82 },
        { name: 'Silent Watcher' }
      ]);
    });

    it('clamps numeric coercions and normalises confidence scores', () => {
      const extractor = new MetadataExtractor();
      const coerceNumber = (extractor as any).coerceNumber.bind(extractor);
      const normaliseConfidence = (extractor as any).normaliseConfidence.bind(
        extractor
      );
      const coerceStringArray = (extractor as any).coerceStringArray.bind(
        extractor
      );

      expect(coerceNumber('7.5')).toBe(7.5);
      expect(coerceNumber(15)).toBe(10);
      expect(coerceNumber('not-a-number')).toBeUndefined();

      expect(normaliseConfidence(250)).toBe(1);
      expect(normaliseConfidence(7)).toBe(0.7);
      expect(normaliseConfidence('0.42')).toBe(0.42);
      expect(normaliseConfidence('NaN')).toBeUndefined();
      expect(normaliseConfidence(null)).toBeUndefined();

      expect(coerceStringArray('noir| thriller ; mystery')).toEqual([
        'noir',
        'thriller',
        'mystery'
      ]);
    });

    it('deduplicates tags case-insensitively when normalizing payloads', () => {
      const extractor = new MetadataExtractor();
      const normalize = (extractor as any).normalizeMetadataPayload.bind(extractor);

      const payload = {
        tags: ['Neon', 'neon', 'CHASE', 'chase']
      };

      const result = normalize(payload, 'Neon chase through the city.');
      expect(result?.tags).toEqual(['Neon', 'CHASE']);
    });

    it('supports desert search queries and exact action matching', () => {
      const extractor = new MetadataExtractor();
      const { filters, keywords } = extractor.parseSearchQuery(
        'Peaceful desert scene with traveling caravan'
      );

      expect(filters).toEqual({
        location: 'desert',
        mood: 'peaceful'
      });
      expect(keywords).toEqual(['traveling', 'caravan']);

      const relevance = extractor.calculateRelevance(
        {
          location: 'desert',
          mood: 'peaceful',
          action: 'rest',
          tags: ['caravan']
        },
        { location: 'desert', mood: 'peaceful', action: 'rest', tags: ['caravan'] }
      );

      expect(relevance).toBe(1);
    });

    it('captures extractInBackground failures for diagnostics', async () => {
      const extractor = new MetadataExtractor();
      const debugSpy = jest
        .spyOn(console, 'debug')
        .mockImplementation(() => undefined);

      jest
        .spyOn(extractor as any, 'extract')
        .mockRejectedValueOnce(new Error('network dropped'));

      await extractor.extractInBackground('Background failure sample');

      expect(debugSpy).toHaveBeenCalledWith(
        'Background metadata extraction failed:',
        expect.any(Error)
      );
      debugSpy.mockRestore();
    });

    it('throws when extractWithLLM is invoked without a backing service', async () => {
      const extractor = new MetadataExtractor();
      await expect(
        (extractor as any).extractWithLLM('Requires LLM service')
      ).rejects.toThrow('LLM service not available');
    });

    it('supports completion responses that return raw payload strings', async () => {
      const completeFn = jest.fn(
        async (prompt: string, options?: Record<string, unknown>) => {
          expect(options).toMatchObject({
            responseFormat: 'json',
            taskType: 'metadata',
            maxTokens: 220
          });
          return JSON.stringify({
            subject: 'Raw City',
            tags: ['raw'],
            summary: 'Raw payload string'
          });
        }
      );

      const extractor = new MetadataExtractor(
        createLLMStub({ complete: completeFn }) as any
      );
      const result = await extractor.extract('Raw payload string sample');

      expect(completeFn).toHaveBeenCalledTimes(1);
      expect(result.metadata.subject).toBe('Raw City');
      expect(result.metadata.tags).toEqual(['raw']);
      expect(result.metadata.summary).toBe('Raw payload string');
    });
  });
});
