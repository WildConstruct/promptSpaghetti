import { LLMService } from '../../../services/llm/LLMService';
import type { LLMRequest } from '../../../services/llm/types';
import { TokenTracker } from '../../../services/llm/TokenTracker';

jest.mock('openai/shims/node', () => ({}));

jest.mock('openai', () => {
  const create = jest.fn();
  const defaultExport = jest.fn(() => ({
    chat: {
      completions: {
        create
      }
    }
  }));

  return {
    __esModule: true,
    default: defaultExport,
    create
  };
});

const openAIExports = jest.requireMock('openai') as {
  default: jest.Mock;
  create: jest.Mock;
};
const openAIConstructorMock = openAIExports.default;
const createCompletionMock = openAIExports.create;

describe('LLMService', () => {
  const baseConfig = {
    apiKey: 'test-key',
    baseUrl: 'http://llm.local',
    mode: 'development' as const,
    cacheEnabled: true,
    dailyLimit: 5,
    costLimit: 1
  };

  const baseRequest: LLMRequest = {
    prompt: 'Tell me a story about dragons.',
    context: 'Fantasy setting',
    maxTokens: 64,
    temperature: 0.2,
    responseFormat: 'text',
    taskType: 'general'
  };

  let resetSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeAll(() => {
    resetSpy = jest
      .spyOn(TokenTracker.prototype as any, 'scheduleDailyReset')
      .mockImplementation(() => undefined);
  });

  afterAll(() => {
    resetSpy.mockRestore();
  });

  beforeEach(() => {
    createCompletionMock.mockReset();
    openAIConstructorMock.mockClear();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  const createService = () => new LLMService(baseConfig);

  it('returns cached response on repeated requests', async () => {
    createCompletionMock.mockResolvedValue({
      choices: [{ message: { content: 'Once upon a time' } }]
    });

    const service = createService();

    const first = await service.complete(baseRequest);
    expect(first?.cached).toBe(false);

    const second = await service.complete(baseRequest);
    expect(second?.cached).toBe(true);
    expect(createCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('bypasses cache when skipCache is true', async () => {
    createCompletionMock.mockResolvedValue({
      choices: [{ message: { content: 'Fresh content' } }]
    });

    const service = createService();

    await service.complete({ ...baseRequest, skipCache: true });
    await service.complete({ ...baseRequest, skipCache: true });

    expect(createCompletionMock).toHaveBeenCalledTimes(2);
  });

  it('returns quota error when limits exceeded', async () => {
    const service = createService();
    service['tokenTracker'].setUserQuota('default', 0, 0);

    const result = await service.complete(baseRequest);
    expect(result?.error).toBe('Daily quota exceeded');
    expect(createCompletionMock).not.toHaveBeenCalled();
  });

  it('returns null when all models fail', async () => {
    createCompletionMock.mockRejectedValue(new Error('Upstream failure'));

    const service = createService();
    const result = await service.complete(baseRequest);

    expect(result).toBeNull();
    expect(createCompletionMock).toHaveBeenCalled();
  });

  it('does not initialize OpenAI client when api key is missing', () => {
    const configWithoutKey = { ...baseConfig, apiKey: undefined };
    const service = new LLMService(configWithoutKey);

    expect(openAIConstructorMock).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      '[LLMService] No API key provided - client not initialized'
    );
    expect((service as any).client).toBeNull();
  });

  it('throws informative error when model is called without client', async () => {
    const service = new LLMService({ ...baseConfig, apiKey: undefined });

    await expect(
      (service as any).callModel('openai/gpt-4o-mini', baseRequest)
    ).rejects.toThrow('LLM client not initialized - no API key configured');

    expect(errorSpy).toHaveBeenCalledWith(
      '[LLMService] Client not initialized - no API key provided'
    );
  });

  it('throws when creating a completion without API client', async () => {
    const service = new LLMService({ ...baseConfig, apiKey: undefined });

    await expect(
      (service as any).createCompletion(
        'mock-model',
        'prompt text',
        10,
        0.5,
        false
      )
    ).rejects.toThrow('LLM client not initialized - no API key configured');
  });

  it('propagates retry exhaustion errors after repeated timeouts', async () => {
    jest.useFakeTimers();
    const service = createService();
    const callWithRetry = (service as any).callWithRetry.bind(service);

    const fn = jest.fn(async () => {
      throw new Error('Request timeout');
    });

    await expect(callWithRetry(fn, 2, 100)).rejects.toThrow('Request timeout');
    expect(fn).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('compresses prompts to enforced length and includes context', () => {
    const service = createService() as any;
    const longText = 'lorem ipsum '.repeat(300);

    const compressed = service.compressPrompt(longText, longText);

    expect(compressed.startsWith('Context:')).toBe(true);
    expect(compressed.endsWith('...')).toBe(true);
    expect(compressed.length).toBeLessThanOrEqual(2003);
  });

  it('returns a descriptive error when no models are available', async () => {
    const service = createService() as any;
    service.modelSelector = {
      getModelsForTask: jest.fn().mockReturnValue([])
    };

    const result = await service.complete(baseRequest);

    expect(result).toMatchObject({
      error: 'No available models',
      cached: false
    });
  });

  it('warns when nearing quota limits', async () => {
    createCompletionMock.mockResolvedValue({
      choices: [{ message: { content: 'Quota ok' } }]
    });

    const service = createService();
    const tracker = service['tokenTracker'] as TokenTracker;
    const quotaSpy = jest
      .spyOn(tracker, 'isQuotaExceeded')
      .mockReturnValue(false);
    const warnQuotaSpy = jest
      .spyOn(tracker, 'shouldWarn')
      .mockReturnValue(true);

    await service.complete(baseRequest);

    expect(warnSpy).toHaveBeenCalledWith('Approaching daily quota limit');

    quotaSpy.mockRestore();
    warnQuotaSpy.mockRestore();
  });

  it('falls back to the next model when suggestion JSON is invalid', async () => {
    createCompletionMock
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({ choices: [] })
            }
          }
        ]
      })
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                choices: [{ text: 'Valid choice', weight: 50 }]
              })
            }
          }
        ]
      });

    const service = createService() as any;
    const models = [
      {
        id: 'model-a',
        name: 'Model A',
        provider: 'mock',
        costPerMillion: 0,
        maxTokens: 2048,
        isFree: true,
        priority: 1
      },
      {
        id: 'model-b',
        name: 'Model B',
        provider: 'mock',
        costPerMillion: 0.2,
        maxTokens: 2048,
        isFree: false,
        priority: 2
      }
    ];
    service.modelSelector = {
      getModelsForTask: jest.fn().mockReturnValue(models),
      markModelFailed: jest.fn(),
      getModelById: jest.fn((id: string) =>
        models.find(model => model.id === id)
      ),
      calculateCost: jest.fn().mockReturnValue(0.01)
    };

    const result = await service.complete({
      ...baseRequest,
      responseFormat: 'json',
      taskType: 'suggestion'
    });

    expect(result?.model).toBe('model-b');
    expect(service.modelSelector.markModelFailed).toHaveBeenCalledWith(
      'model-a'
    );

    const [, error] = errorSpy.mock.calls[0];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain('Suggestion response must include choices');
  });

  it('sanitizes prompts and emits privacy warnings', async () => {
    createCompletionMock.mockResolvedValue({
      choices: [{ message: { content: 'sanitized' } }]
    });

    const service = createService();
    const sanitizeMock = jest
      .spyOn(service['privacyFilter'], 'sanitizePrompt')
      .mockImplementationOnce(() => ({
        sanitized: 'scrubbed prompt ',
        warnings: ['Sensitive token']
      }))
      .mockImplementationOnce(() => ({
        sanitized: 'scrubbed context ',
        warnings: []
      }));

    await service.complete(baseRequest);

    expect(sanitizeMock).toHaveBeenCalledTimes(2);
    expect(warnSpy).toHaveBeenCalledWith('Privacy filter warnings:', [
      'Sensitive token'
    ]);

    sanitizeMock.mockRestore();
  });

  it('throws descriptive errors for invalid suggestion responses', () => {
    const service = createService() as any;

    expect(() => service.validateJsonResponse('"text"', 'suggestion')).toThrow(
      'Invalid JSON response: Suggestion response must be an object'
    );

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({ choices: [] }),
        'suggestion'
      )
    ).toThrow(
      'Invalid JSON response: Suggestion response must include choices array'
    );

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({ choices: [{ text: 'only text' }] }),
        'suggestion'
      )
    ).toThrow(
      'Invalid JSON response: Each suggestion choice must include text and weight'
    );
  });

  it('enforces metadata response shape and types', () => {
    const service = createService() as any;

    expect(() => service.validateJsonResponse('"text"', 'metadata')).toThrow(
      'Invalid JSON response: Metadata response must be an object'
    );

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({
          tags: 'not-an-array',
          subject: 'hero',
          intensity: 5
        }),
        'metadata'
      )
    ).toThrow(
      'Invalid JSON response: Metadata tags must be an array of strings'
    );

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({
          tags: ['hero'],
          subject: 42,
          intensity: 5
        }),
        'metadata'
      )
    ).toThrow('Invalid JSON response: Metadata subject must be a string');

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({
          tags: ['hero'],
          subject: 'hero',
          intensity: 'strong'
        }),
        'metadata'
      )
    ).toThrow('Invalid JSON response: Metadata intensity must be a number');
  });

  it('validates refinement responses strictly', () => {
    const service = createService() as any;

    expect(() => service.validateJsonResponse('"text"', 'refinement')).toThrow(
      'Invalid JSON response: Refinement response must be an object'
    );

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({
          original: 5,
          refined: 'text',
          changes: []
        }),
        'refinement'
      )
    ).toThrow(
      'Invalid JSON response: Refinement response must include original and refined text'
    );

    expect(() =>
      service.validateJsonResponse(
        JSON.stringify({
          original: 'draft',
          refined: 'edited',
          changes: ['ok', 5]
        }),
        'refinement'
      )
    ).toThrow(
      'Invalid JSON response: Refinement changes must be an array of strings'
    );
  });

  it('executes completeBatch requests', async () => {
    const service = createService();
    const completeSpy = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce({
        content: 'first',
        model: 'model-a',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      })
      .mockResolvedValueOnce({
        content: 'second',
        model: 'model-b',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      });

    const results = await service.completeBatch([baseRequest, baseRequest]);

    expect(results).toHaveLength(2);
    expect(completeSpy).toHaveBeenCalledTimes(2);
    completeSpy.mockRestore();
  });

  it('parses populateChoices responses and handles malformed payloads', async () => {
    const service = createService();
    const completeMock = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce({
        content: JSON.stringify({
          choices: [{ text: 'Alpha', weight: 10 }]
        }),
        model: 'model-x',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      })
      .mockResolvedValueOnce({
        content: 'not-json',
        model: 'model-x',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      });

    const result = await service.populateChoices('ctx', 'section', 2);
    expect(result?.choices[0].text).toBe('Alpha');

    const fallback = await service.populateChoices('ctx', 'section', 2);
    expect(fallback).toBeNull();

    completeMock.mockRestore();
  });

  it('returns null when populateChoices receives no response', async () => {
    const service = createService();
    const completeMock = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce(null);

    const result = await service.populateChoices('ctx', 'section', 2);
    expect(result).toBeNull();

    completeMock.mockRestore();
  });

  it('parses metadata extraction and recovers from invalid payloads', async () => {
    const service = createService();
    const completeMock = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce({
        content: JSON.stringify({
          tags: ['focus'],
          subject: 'dragon',
          intensity: 8
        }),
        model: 'model-x',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      })
      .mockResolvedValueOnce({
        content: '{bad-json',
        model: 'model-x',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      });

    const valid = await service.extractMetadata('story text');
    expect(valid?.subject).toBe('dragon');

    const invalid = await service.extractMetadata('story text');
    expect(invalid).toBeNull();

    completeMock.mockRestore();
  });

  it('returns null when metadata extraction has no content', async () => {
    const service = createService();
    const completeMock = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce(null);

    const result = await service.extractMetadata('story text');
    expect(result).toBeNull();

    completeMock.mockRestore();
  });

  it('parses refinement responses and returns null on parse errors', async () => {
    const service = createService();
    const completeMock = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce({
        content: JSON.stringify({
          original: 'draft',
          refined: 'finished',
          changes: ['trimmed intro']
        }),
        model: 'model-x',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      })
      .mockResolvedValueOnce({
        content: '',
        model: 'model-x',
        tokensIn: 1,
        tokensOut: 1,
        cost: 0,
        cached: false
      });

    const refined = await service.refineText('draft', 'formal');
    expect(refined?.refined).toBe('finished');

    const fallback = await service.refineText('draft', 'formal');
    expect(fallback).toBeNull();

    completeMock.mockRestore();
  });

  it('returns null when refinement helper receives empty response', async () => {
    const service = createService();
    const completeMock = jest
      .spyOn(service, 'complete')
      .mockResolvedValueOnce(null);

    const result = await service.refineText('draft', 'formal');
    expect(result).toBeNull();

    completeMock.mockRestore();
  });

  it('exposes administrative utilities and trims metrics history', () => {
    const service = createService() as any;

    service.setUserId('qa-user');

    const tracker: TokenTracker = service.tokenTracker;
    tracker.trackUsage('qa-user', 'model-z', 12, 8, 0.4);

    const usage = service.getUsageStats(24);
    expect(usage.totalCalls).toBeGreaterThanOrEqual(1);

    const quota = service.getUserQuota();
    expect(quota.dailyUsed).toBeGreaterThanOrEqual(1);

    const projection = service.getCostProjection(3);
    expect(projection).toBeCloseTo(usage.totalCost * 3);

    const cacheManager = service.cacheManager;
    cacheManager.set(baseRequest, 'model-z', {
      content: 'cached',
      model: 'model-z',
      tokensIn: 1,
      tokensOut: 1,
      cost: 0,
      cached: false
    });

    expect(service.getCacheStats().size).toBe(1);
    service.clearCache();
    expect(service.getCacheStats().size).toBe(0);

    const logMetrics = service.logMetrics.bind(service);
    for (let i = 0; i < 1005; i++) {
      logMetrics({
        timestamp: i,
        model: 'model-z',
        tokensIn: 1,
        tokensOut: 1,
        latencyMs: 5,
        cacheHit: false,
        success: true,
        userId: 'qa-user',
        consentVerified: true
      });
    }

    expect(service.metrics).toHaveLength(1000);
    const exported = service.exportMetrics();
    expect(JSON.parse(exported)).toHaveLength(1000);
  });

  it('validates JSON responses for metadata requests', async () => {
    createCompletionMock.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              tags: ['magic'],
              subject: 'dragons',
              intensity: 7
            })
          }
        }
      ]
    });

    const service = createService();
    const result = await service.complete({
      ...baseRequest,
      responseFormat: 'json',
      taskType: 'metadata'
    });

    expect(result?.content).toContain('dragons');
    expect(createCompletionMock).toHaveBeenCalledTimes(1);
    const params = createCompletionMock.mock.calls[0][0];
    expect(params.response_format).toEqual({ type: 'json_object' });
  });

  describe('callWithRetry', () => {
    it('retries on rate limits with exponential backoff', async () => {
      jest.useFakeTimers();
      const service = createService();
      const callWithRetry = (service as any).callWithRetry.bind(service);

      const fn = jest.fn(async () => {
        if (fn.mock.calls.length === 1) {
          const error = new Error('Too many requests') as Error & {
            status?: number;
          };
          error.status = 429;
          throw error;
        }
        return 'ok';
      });

      const promise = callWithRetry(fn, 3, 1000);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited')
      );
      jest.useRealTimers();
    });

    it('retries when rate limit status is reported via response object', async () => {
      jest.useFakeTimers();
      const service = createService();
      const callWithRetry = (service as any).callWithRetry.bind(service);

      const fn = jest.fn(async () => {
        if (fn.mock.calls.length === 1) {
          const error = {
            response: { status: 429 },
            message: 'Please slow down'
          };
          throw error;
        }
        return 'recovered';
      });

      const promise = callWithRetry(fn, 2, 500);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('recovered');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Rate limited')
      );
      jest.useRealTimers();
    });

    it('logs timeout and succeeds on subsequent attempt', async () => {
      jest.useFakeTimers();
      const service = createService();
      const callWithRetry = (service as any).callWithRetry.bind(service);

      const fn = jest.fn(async () => {
        if (fn.mock.calls.length === 1) {
          return new Promise(resolve =>
            setTimeout(() => resolve('slow'), 2000)
          );
        }
        return 'fast';
      });

      const promise = callWithRetry(fn, 2, 1000);
      await jest.advanceTimersByTimeAsync(1000);
      const result = await promise;

      expect(result).toBe('fast');
      expect(fn).toHaveBeenCalledTimes(2);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Request timed out after 1000ms')
      );

      await jest.advanceTimersByTimeAsync(2000);
      jest.useRealTimers();
    });

    it('rethrows normalized errors for non retryable failures', async () => {
      const service = createService();
      const callWithRetry = (service as any).callWithRetry.bind(service);
      const fn = jest.fn(async () => {
        const error = {
          response: { status: 503 },
          message: 'Service unavailable right now'
        };
        throw error;
      });

      await expect(callWithRetry(fn, 2, 500)).rejects.toThrow(
        'Service unavailable right now'
      );
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('propagates plain string errors via normalizeError', async () => {
      const service = createService();
      const callWithRetry = (service as any).callWithRetry.bind(service);
      const fn = jest.fn(async () => {
        throw 'catastrophic failure';
      });

      await expect(callWithRetry(fn, 1, 500)).rejects.toThrow(
        'catastrophic failure'
      );
    });
  });
});
