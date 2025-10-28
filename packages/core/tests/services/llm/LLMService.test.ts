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
      .mockImplementation(() => {});
  });

  afterAll(() => {
    resetSpy.mockRestore();
  });

  beforeEach(() => {
    createCompletionMock.mockReset();
    openAIConstructorMock.mockClear();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
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
});
