import Fastify from 'fastify';
import { llmRoutes } from '../src/routes/llm';

const getStatusMock = jest.fn();

jest.mock('../src/services/LLMService', () => ({
  LLMService: jest.fn().mockImplementation(() => ({
    getStatus: getStatusMock,
    complete: jest.fn(),
    available: jest.fn(() => true)
  }))
}));

describe('llmRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the canonical /api/llm/status contract with capabilities', async () => {
    getStatusMock.mockReturnValue({
      available: true,
      mode: 'live',
      provider: 'openrouter',
      defaultModel: 'openai/gpt-4o-mini'
    });

    const app = Fastify();
    await llmRoutes(app);

    const response = await app.inject({
      method: 'GET',
      url: '/api/llm/status'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      available: true,
      mode: 'live',
      provider: 'openrouter',
      defaultModel: 'openai/gpt-4o-mini',
      capabilities: [
        'getStatus',
        'draftGraphFromPrompt',
        'complete',
        'suggest',
        'metadata',
        'refine',
        'analyze',
        'populateChoices',
        'optimizeChoices'
      ]
    });

    await app.close();
  });
});
