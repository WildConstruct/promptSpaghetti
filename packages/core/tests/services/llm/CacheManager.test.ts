import { CacheManager } from '../../../services/llm/CacheManager';
import type { LLMRequest, LLMResponse } from '../../../services/llm/types';

const baseRequest: LLMRequest = {
  prompt: 'Tell me a story',
  context: 'Once upon a time',
  maxTokens: 50,
  temperature: 0.7,
  responseFormat: 'text',
  taskType: 'general'
};

const response: LLMResponse = {
  content: 'A short tale',
  model: 'model-x',
  tokensIn: 10,
  tokensOut: 12,
  cost: 0.0001,
  cached: false
};

describe('CacheManager', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns cached response with metadata and respects skip flag', () => {
    const cache = new CacheManager();

    cache.set(baseRequest, 'model-x', response);
    const cached = cache.get(baseRequest, 'model-x');
    expect(cached).toEqual({ ...response, cached: true });

    const skip = cache.get({ ...baseRequest, skipCache: true }, 'model-x');
    expect(skip).toBeNull();
  });

  it('evicts oldest entries when exceeding capacity', () => {
    const cache = new CacheManager(2);
    cache.set({ ...baseRequest, prompt: 'one' }, 'model-x', response);
    cache.set({ ...baseRequest, prompt: 'two' }, 'model-x', response);
    cache.set({ ...baseRequest, prompt: 'three' }, 'model-x', response);

    expect(cache.size()).toBe(2);
    expect(cache.get({ ...baseRequest, prompt: 'one' }, 'model-x')).toBeNull();
  });

  it('expires entries based on task-specific TTL', () => {
    jest.useFakeTimers();
    const cache = new CacheManager(10, 1000);
    cache.set({ ...baseRequest, taskType: 'metadata' }, 'model-x', response);

    jest.advanceTimersByTime(30 * 60 * 1000);
    expect(cache.get({ ...baseRequest, taskType: 'metadata' }, 'model-x')).not.toBeNull();

    jest.advanceTimersByTime(31 * 60 * 1000);
    expect(cache.get({ ...baseRequest, taskType: 'metadata' }, 'model-x')).toBeNull();
  });

  it('exports and imports cache contents', () => {
    const cache = new CacheManager();
    cache.set(baseRequest, 'model-x', response);

    const snapshot = cache.export();
    cache.clear();
    expect(cache.size()).toBe(0);

    cache.import(snapshot);
    expect(cache.size()).toBe(1);
    expect(cache.get(baseRequest, 'model-x')).not.toBeNull();
  });
});

