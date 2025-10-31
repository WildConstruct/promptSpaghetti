/**
 * Comprehensive Test Suite for LLMService
 * Target Coverage: 80%+
 */

import { LLMService } from '../LLMService';
import { ModelSelector } from '../ModelSelector';
import { CacheManager } from '../CacheManager';
import { TokenTracker } from '../TokenTracker';
import { PrivacyFilter } from '../PrivacyFilter';
import OpenAI from 'openai';
import { LLMRequest, LLMServiceConfig, TaskType, ModelInfo } from '../types';

// Mock all dependencies
jest.mock('openai');
jest.mock('../ModelSelector');
jest.mock('../CacheManager');
jest.mock('../TokenTracker');
jest.mock('../PrivacyFilter');

describe('LLMService', () => {
  let service: LLMService;
  let mockConfig: LLMServiceConfig;
  let mockModelSelector: jest.Mocked<ModelSelector>;
  let mockCacheManager: jest.Mocked<CacheManager>;
  let mockTokenTracker: jest.Mocked<TokenTracker>;
  let mockPrivacyFilter: jest.Mocked<PrivacyFilter>;
  let mockOpenAIClient: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock config
    mockConfig = {
      apiKey: 'test-api-key-123',
      mode: 'development',
      baseUrl: 'https://openrouter.ai/api/v1',
      dailyLimit: 100000,
      costLimit: 10.0,
      cacheEnabled: true,
      cacheTTL: 3600,
      enableMetrics: true
    };

    // Setup mock OpenAI client
    mockOpenAIClient = {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAIClient
    );

    // Setup mock dependencies
    mockModelSelector = new ModelSelector() as jest.Mocked<ModelSelector>;
    mockCacheManager = new CacheManager() as jest.Mocked<CacheManager>;
    mockTokenTracker = new TokenTracker(
      100000,
      10
    ) as jest.Mocked<TokenTracker>;
    mockPrivacyFilter = new PrivacyFilter() as jest.Mocked<PrivacyFilter>;

    // Create service instance
    service = new LLMService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with valid config', () => {
      expect(service).toBeDefined();
      expect(OpenAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key-123',
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Prompt Spaghetti'
        },
        dangerouslyAllowBrowser: true
      });
    });

    it('should not initialize OpenAI client without API key', () => {
      jest.clearAllMocks();
      const configWithoutKey = { ...mockConfig, apiKey: '' };
      const serviceWithoutKey = new LLMService(configWithoutKey);
      expect(serviceWithoutKey).toBeDefined();
      expect(OpenAI).not.toHaveBeenCalled();
    });

    it('should use production mode when specified', () => {
      jest.clearAllMocks();
      const prodConfig = { ...mockConfig, mode: 'production' as const };
      new LLMService(prodConfig);
      expect(OpenAI).toHaveBeenCalledWith(
        expect.objectContaining({
          dangerouslyAllowBrowser: false
        })
      );
    });
  });

  describe('complete', () => {
    const mockRequest: LLMRequest = {
      prompt: 'Test prompt',
      taskType: 'suggestion' as TaskType,
      maxTokens: 1000,
      temperature: 0.7,
      context: {
        nodeType: 'WeightedChoice',
        nodeId: 'test-node-1'
      }
    };

    const mockModel: ModelInfo = {
      id: 'anthropic/claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      contextWindow: 200000,
      maxOutput: 4096,
      costPer1kInput: 0.00025,
      costPer1kOutput: 0.00125,
      capabilities: ['fast', 'efficient'],
      recommended: ['suggestion', 'parsing']
    };

    beforeEach(() => {
      mockTokenTracker.isQuotaExceeded.mockReturnValue(false);
      mockTokenTracker.shouldWarn.mockReturnValue(false);
      mockModelSelector.getModelsForTask.mockReturnValue([mockModel]);
      mockCacheManager.get.mockReturnValue(null);
      mockPrivacyFilter.filterRequest.mockReturnValue(mockRequest.prompt);
      mockPrivacyFilter.filterResponse.mockReturnValue('Test response');
    });

    it('should complete a request successfully', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: { content: 'Test response' },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        },
        model: 'anthropic/claude-3-haiku'
      });

      const response = await service.complete(mockRequest);

      expect(response).toEqual({
        content: 'Test response',
        model: 'anthropic/claude-3-haiku',
        tokensIn: 100,
        tokensOut: 50,
        cost: expect.any(Number),
        cached: false
      });

      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith({
        model: 'anthropic/claude-3-haiku',
        messages: [{ role: 'user', content: 'Test prompt' }],
        max_tokens: 1000,
        temperature: 0.7
      });
    });

    it('should return cached response when available', async () => {
      const cachedResponse = {
        content: 'Cached response',
        model: 'anthropic/claude-3-haiku',
        tokensIn: 80,
        tokensOut: 40,
        cost: 0.0001,
        cached: true
      };
      mockCacheManager.get.mockReturnValue(cachedResponse);

      const response = await service.complete(mockRequest);

      expect(response).toEqual(cachedResponse);
      expect(mockOpenAIClient.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should handle quota exceeded', async () => {
      mockTokenTracker.isQuotaExceeded.mockReturnValue(true);

      const response = await service.complete(mockRequest);

      expect(response).toEqual({
        content: '',
        model: '',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'Daily quota exceeded'
      });
      expect(mockOpenAIClient.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should warn when approaching quota', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockTokenTracker.shouldWarn.mockReturnValue(true);

      await service.complete(mockRequest);

      expect(consoleSpy).toHaveBeenCalledWith('Approaching daily quota limit');
      consoleSpy.mockRestore();
    });

    it('should handle no available models', async () => {
      mockModelSelector.getModelsForTask.mockReturnValue([]);

      const response = await service.complete(mockRequest);

      expect(response).toEqual({
        content: '',
        model: '',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'No available models'
      });
    });

    it('should handle API errors gracefully', async () => {
      mockOpenAIClient.chat.completions.create.mockRejectedValue(
        new Error('API Error: Rate limit exceeded')
      );

      const response = await service.complete(mockRequest);

      expect(response).toEqual({
        content: '',
        model: 'anthropic/claude-3-haiku',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'API Error: Rate limit exceeded'
      });
    });

    it('should try fallback models on failure', async () => {
      const fallbackModel: ModelInfo = {
        ...mockModel,
        id: 'openai/gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo'
      };
      mockModelSelector.getModelsForTask.mockReturnValue([
        mockModel,
        fallbackModel
      ]);

      // First model fails
      mockOpenAIClient.chat.completions.create
        .mockRejectedValueOnce(new Error('Model overloaded'))
        .mockResolvedValueOnce({
          choices: [
            {
              message: { content: 'Fallback response' },
              finish_reason: 'stop'
            }
          ],
          usage: {
            prompt_tokens: 90,
            completion_tokens: 45,
            total_tokens: 135
          },
          model: 'openai/gpt-3.5-turbo'
        });

      const response = await service.complete(mockRequest);

      expect(response).toEqual({
        content: 'Fallback response',
        model: 'openai/gpt-3.5-turbo',
        tokensIn: 90,
        tokensOut: 45,
        cost: expect.any(Number),
        cached: false
      });
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledTimes(2);
    });

    it('should filter sensitive data from requests', async () => {
      mockPrivacyFilter.filterRequest.mockReturnValue('Filtered prompt');

      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: { content: 'Response' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'anthropic/claude-3-haiku'
      });

      await service.complete(mockRequest);

      expect(mockPrivacyFilter.filterRequest).toHaveBeenCalledWith(
        'Test prompt'
      );
      expect(mockOpenAIClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: 'Filtered prompt' }]
        })
      );
    });

    it('should filter sensitive data from responses', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: { content: 'Sensitive response with SSN: 123-45-6789' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'anthropic/claude-3-haiku'
      });
      mockPrivacyFilter.filterResponse.mockReturnValue(
        'Sensitive response with SSN: [REDACTED]'
      );

      const response = await service.complete(mockRequest);

      expect(mockPrivacyFilter.filterResponse).toHaveBeenCalledWith(
        'Sensitive response with SSN: 123-45-6789'
      );
      expect(response?.content).toBe('Sensitive response with SSN: [REDACTED]');
    });

    it('should store response in cache when enabled', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: { content: 'Response to cache' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'anthropic/claude-3-haiku'
      });

      const response = await service.complete(mockRequest);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        mockRequest,
        'anthropic/claude-3-haiku',
        expect.objectContaining({
          content: 'Response to cache',
          model: 'anthropic/claude-3-haiku',
          cached: false
        })
      );
    });

    it('should track token usage', async () => {
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: { content: 'Response' },
            finish_reason: 'stop'
          }
        ],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'anthropic/claude-3-haiku'
      });

      await service.complete(mockRequest);

      expect(mockTokenTracker.trackUsage).toHaveBeenCalledWith(
        'default',
        100,
        50,
        expect.any(Number)
      );
    });
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions for a node', async () => {
      const mockSuggestions = {
        content: JSON.stringify({
          suggestions: [
            { text: 'Suggestion 1', confidence: 0.9 },
            { text: 'Suggestion 2', confidence: 0.8 }
          ]
        }),
        model: 'anthropic/claude-3-haiku',
        tokensIn: 200,
        tokensOut: 100,
        cost: 0.001,
        cached: false
      };

      jest.spyOn(service, 'complete').mockResolvedValue(mockSuggestions);

      const result = await service.generateSuggestions({
        nodeType: 'WeightedChoice',
        nodeData: { choices: [] },
        context: { nodeId: 'test-node' }
      });

      expect(result).toEqual({
        suggestions: [
          { text: 'Suggestion 1', confidence: 0.9 },
          { text: 'Suggestion 2', confidence: 0.8 }
        ]
      });
    });

    it('should handle invalid JSON in suggestions response', async () => {
      jest.spyOn(service, 'complete').mockResolvedValue({
        content: 'Invalid JSON',
        model: 'anthropic/claude-3-haiku',
        tokensIn: 100,
        tokensOut: 50,
        cost: 0.001,
        cached: false
      });

      const result = await service.generateSuggestions({
        nodeType: 'WeightedChoice',
        nodeData: {},
        context: {}
      });

      expect(result).toEqual({ suggestions: [] });
    });
  });

  describe('extractMetadata', () => {
    it('should extract metadata from content', async () => {
      const mockMetadata = {
        content: JSON.stringify({
          title: 'Test Title',
          tags: ['tag1', 'tag2'],
          category: 'test-category'
        }),
        model: 'anthropic/claude-3-haiku',
        tokensIn: 150,
        tokensOut: 75,
        cost: 0.001,
        cached: false
      };

      jest.spyOn(service, 'complete').mockResolvedValue(mockMetadata);

      const result = await service.extractMetadata({
        content: 'Some content to analyze',
        extractFields: ['title', 'tags', 'category']
      });

      expect(result).toEqual({
        title: 'Test Title',
        tags: ['tag1', 'tag2'],
        category: 'test-category'
      });
    });
  });

  describe('refinePrompt', () => {
    it('should refine a prompt', async () => {
      const mockRefinement = {
        content: JSON.stringify({
          refined: 'Refined prompt text',
          improvements: ['Clarity', 'Specificity'],
          confidence: 0.95
        }),
        model: 'anthropic/claude-3-haiku',
        tokensIn: 180,
        tokensOut: 90,
        cost: 0.001,
        cached: false
      };

      jest.spyOn(service, 'complete').mockResolvedValue(mockRefinement);

      const result = await service.refinePrompt({
        prompt: 'Original prompt',
        style: 'professional',
        goals: ['clarity', 'engagement']
      });

      expect(result).toEqual({
        refined: 'Refined prompt text',
        improvements: ['Clarity', 'Specificity'],
        confidence: 0.95
      });
    });
  });

  describe('getMetrics', () => {
    it('should return collected metrics', () => {
      const metrics = service.getMetrics();
      expect(metrics).toEqual([]);
    });

    it('should return metrics after requests', async () => {
      mockTokenTracker.isQuotaExceeded.mockReturnValue(false);
      mockModelSelector.getModelsForTask.mockReturnValue([
        {
          id: 'test-model',
          name: 'Test Model',
          provider: 'test',
          contextWindow: 4096,
          maxOutput: 1024,
          costPer1kInput: 0.001,
          costPer1kOutput: 0.002,
          capabilities: [],
          recommended: []
        }
      ]);
      mockCacheManager.get.mockReturnValue(null);
      mockPrivacyFilter.filterRequest.mockImplementation(s => s);
      mockPrivacyFilter.filterResponse.mockImplementation(s => s);

      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
        model: 'test-model'
      });

      await service.complete({
        prompt: 'Test',
        taskType: 'suggestion',
        maxTokens: 100
      });

      const metrics = service.getMetrics();
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0]).toMatchObject({
        timestamp: expect.any(Number),
        model: 'test-model',
        taskType: 'suggestion',
        tokensIn: 100,
        tokensOut: 50,
        cost: expect.any(Number),
        latency: expect.any(Number),
        cached: false
      });
    });
  });

  describe('clearCache', () => {
    it('should clear the cache', () => {
      service.clearCache();
      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics', () => {
      mockTokenTracker.getUsageStats.mockReturnValue({
        userId: 'default',
        tokensUsed: 5000,
        costIncurred: 0.05,
        requestCount: 10,
        quotaRemaining: 95000,
        costRemaining: 9.95
      });

      const stats = service.getUsageStats('default');

      expect(stats).toEqual({
        userId: 'default',
        tokensUsed: 5000,
        costIncurred: 0.05,
        requestCount: 10,
        quotaRemaining: 95000,
        costRemaining: 9.95
      });
    });
  });

  describe('resetUsage', () => {
    it('should reset usage for a user', () => {
      service.resetUsage('test-user');
      expect(mockTokenTracker.resetUsage).toHaveBeenCalledWith('test-user');
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockTokenTracker.isQuotaExceeded.mockReturnValue(false);
      mockModelSelector.getModelsForTask.mockReturnValue([
        {
          id: 'test-model',
          name: 'Test Model',
          provider: 'test',
          contextWindow: 4096,
          maxOutput: 1024,
          costPer1kInput: 0.001,
          costPer1kOutput: 0.002,
          capabilities: [],
          recommended: []
        }
      ]);
      mockCacheManager.get.mockReturnValue(null);

      const networkError = new Error('Network request failed');
      mockOpenAIClient.chat.completions.create.mockRejectedValue(networkError);

      const response = await service.complete({
        prompt: 'Test',
        taskType: 'suggestion',
        maxTokens: 100
      });

      expect(response).toEqual({
        content: '',
        model: 'test-model',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'Network request failed'
      });
    });

    it('should handle malformed API responses', async () => {
      mockTokenTracker.isQuotaExceeded.mockReturnValue(false);
      mockModelSelector.getModelsForTask.mockReturnValue([
        {
          id: 'test-model',
          name: 'Test Model',
          provider: 'test',
          contextWindow: 4096,
          maxOutput: 1024,
          costPer1kInput: 0.001,
          costPer1kOutput: 0.002,
          capabilities: [],
          recommended: []
        }
      ]);
      mockCacheManager.get.mockReturnValue(null);

      // Malformed response missing required fields
      mockOpenAIClient.chat.completions.create.mockResolvedValue({
        choices: [],
        usage: null,
        model: 'test-model'
      });

      const response = await service.complete({
        prompt: 'Test',
        taskType: 'suggestion',
        maxTokens: 100
      });

      expect(response).toBeDefined();
      expect(response?.error).toBeDefined();
    });
  });

  describe('initialization without client', () => {
    it('should handle operations without API key', async () => {
      const serviceWithoutKey = new LLMService({ ...mockConfig, apiKey: '' });

      const response = await serviceWithoutKey.complete({
        prompt: 'Test',
        taskType: 'suggestion',
        maxTokens: 100
      });

      expect(response).toEqual({
        content: '',
        model: '',
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        cached: false,
        error: 'LLM service not configured'
      });
    });
  });

  describe('callWithRetry', () => {
    it('retries on rate limits with exponential backoff', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.useFakeTimers();

      try {
        let attempt = 0;
        const fn = jest.fn(async () => {
          attempt += 1;
          if (attempt === 1) {
            const error = new Error('Too many requests') as Error & { status?: number };
            error.status = 429;
            throw error;
          }
          return 'ok';
        });

        const callWithRetry = (service as any).callWithRetry.bind(service);
        const promise = callWithRetry(fn, 3, 1000);

        await jest.advanceTimersByTimeAsync(1000);
        const result = await promise;

        expect(result).toBe('ok');
        expect(fn).toHaveBeenCalledTimes(2);
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Rate limited'));
      } finally {
        consoleSpy.mockRestore();
        jest.useRealTimers();
      }
    });

    it('logs timeout and succeeds on subsequent attempt', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      jest.useFakeTimers();

      try {
        let attempt = 0;
        const fn = jest.fn(async () => {
          attempt += 1;
          if (attempt === 1) {
            return new Promise(resolve => setTimeout(() => resolve('slow'), 2000));
          }
          return 'fast';
        });

        const callWithRetry = (service as any).callWithRetry.bind(service);
        const promise = callWithRetry(fn, 2, 1000);

        await jest.advanceTimersByTimeAsync(1000);
        const result = await promise;

        expect(result).toBe('fast');
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Request timed out after 1000ms')
        );
        expect(fn).toHaveBeenCalledTimes(2);

        await jest.advanceTimersByTimeAsync(2000);
      } finally {
        consoleSpy.mockRestore();
        jest.useRealTimers();
      }
    });

    it('rethrows normalized errors for non retryable failures', async () => {
      const callWithRetry = (service as any).callWithRetry.bind(service);
      const fn = jest.fn(async () => {
        const error = { response: { status: 503 }, message: 'Service unavailable right now' };
        throw error;
      });

      await expect(callWithRetry(fn, 2, 500)).rejects.toThrow(
        'Service unavailable right now'
      );
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('propagates plain string errors via normalizeError', async () => {
      const callWithRetry = (service as any).callWithRetry.bind(service);
      const fn = jest.fn(async () => {
        throw 'catastrophic failure';
      });

      await expect(callWithRetry(fn, 1, 500)).rejects.toThrow(
        'catastrophic failure'
      );
    });
  });

  describe('validateJsonResponse', () => {
    it('throws when JSON cannot be parsed', () => {
      const internal = service as unknown as {
        validateJsonResponse: (content: string, taskType?: string) => void;
      };

      expect(() =>
        internal.validateJsonResponse('not-json', 'suggestion')
      ).toThrow('Invalid JSON response');
    });

    it('enforces suggestion choice structure', () => {
      const internal = service as unknown as {
        validateJsonResponse: (content: string, taskType?: string) => void;
      };

      expect(() =>
        internal.validateJsonResponse(
          JSON.stringify({ choices: [{ text: 'only-text' }] }),
          'suggestion'
        )
      ).toThrow('Each suggestion choice must include text and weight');

      expect(() =>
        internal.validateJsonResponse(
          JSON.stringify({ choices: [{ text: 'ok', weight: 6 }] }),
          'suggestion'
        )
      ).not.toThrow();
    });

    it('validates metadata payload types', () => {
      const internal = service as unknown as {
        validateJsonResponse: (content: string, taskType?: string) => void;
      };

      expect(() =>
        internal.validateJsonResponse(
          JSON.stringify({
            tags: ['scene'],
            subject: 'test',
            intensity: 'high'
          }),
          'metadata'
        )
      ).toThrow('Metadata intensity must be a number');

      expect(() =>
        internal.validateJsonResponse(
          JSON.stringify({
            tags: ['scene'],
            subject: 'test',
            intensity: 5
          }),
          'metadata'
        )
      ).not.toThrow();
    });
  });
});
