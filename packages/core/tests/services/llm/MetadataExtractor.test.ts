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
});
