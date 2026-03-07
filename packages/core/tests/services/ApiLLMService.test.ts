import {
  LLMService,
  NodeIntelligenceService,
  TextRefinementService
} from '../../services/ApiLLMService';

describe('ApiLLMService NodeIntelligenceService', () => {
  let llm: jest.Mocked<LLMService>;
  let service: NodeIntelligenceService;

  beforeEach(() => {
    llm = {
      complete: jest.fn(),
      suggest: jest.fn(),
      metadata: jest.fn(),
      refine: jest.fn(),
      analyze: jest.fn(),
      populateChoices: jest.fn(),
      optimizeChoices: jest.fn()
    } as any;

    service = new NodeIntelligenceService(llm);
  });

  it('dedupes generated choices and preserves template variables', async () => {
    llm.populateChoices.mockResolvedValue({
      choices: [
        { text: 'running from blast', weight: 8 },
        { text: 'Running from blast', weight: 6 },
        { text: 'diving for cover', weight: 7 }
      ]
    });

    const result = await service.populateChoices(
      '{reaction} from explosion',
      'action scene',
      5
    );

    expect(result).toEqual([
      { text: '{reaction} running from blast', weight: 8 },
      { text: '{reaction} diving for cover', weight: 7 }
    ]);
  });

  it('uses normalized offline suggestions when API population fails', async () => {
    llm.populateChoices.mockRejectedValue(new Error('network down'));

    const result = await service.populateChoices(
      '{weather} sky',
      'weather board',
      2
    );

    expect(result).toHaveLength(2);
    expect(result[0]?.text).toContain('{weather}');
    expect(result[1]?.text).toContain('{weather}');
  });

  it('normalizes optimize weights responses onto the active API path', async () => {
    llm.optimizeChoices.mockResolvedValue({
      choices: [
        { text: 'Run', weight: 9 },
        { text: 'Hide', weight: 2 }
      ]
    });

    const result = await service.optimizeWeights(
      [
        { text: 'Run', weight: 5 },
        { text: 'Hide', weight: 5 }
      ],
      'Node title: Escape. Options: Run, Hide',
      'favor first'
    );

    expect(llm.optimizeChoices).toHaveBeenCalledWith({
      choices: [
        { text: 'Run', weight: 5 },
        { text: 'Hide', weight: 5 }
      ],
      context: 'Node title: Escape. Options: Run, Hide',
      preference: 'favor first'
    });
    expect(result.optimized).toEqual([
      { text: 'Run', weight: 9 },
      { text: 'Hide', weight: 2 }
    ]);
  });
});

describe('ApiLLMService request contracts', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('sends only allowed completion fields instead of raw config blobs', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: 'ok', model: 'stub' })
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const service = new LLMService({
      provider: 'openai',
      apiKey: 'secret',
      model: 'safe-model',
      temperature: 0.4,
      maxTokens: 128
    });

    await service.complete('hello');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(init?.body))).toEqual({
      prompt: 'hello',
      model: 'safe-model',
      temperature: 0.4,
      maxTokens: 128
    });
  });

  it('maps refine responses from refinedText into the existing refinement result', async () => {
    const llm = {
      refine: jest.fn().mockResolvedValue({
        refinedText: 'polished draft',
        model: 'stub'
      })
    } as unknown as jest.Mocked<LLMService>;

    const refinementService = new TextRefinementService(llm);
    const result = await refinementService.refine('draft', 'expand');

    expect(llm.refine).toHaveBeenCalledWith({
      text: 'draft',
      mode: 'expand',
      instruction: undefined
    });
    expect(result.refined).toBe('polished draft');
    expect(result.original).toBe('draft');
  });
});
