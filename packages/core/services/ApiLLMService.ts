/**
 * API-based LLM Service for browser environments
 * All LLM operations go through server-side API endpoints
 */

import type {
  Choice,
  WeightOptimizationResult,
  InspirationSuggestion
} from './llm/NodeIntelligence';
import type {
  RefinementMode,
  RefinementResult
} from './llm/TextRefinementService';
import type {
  DraftGraphFromPromptRequest,
  DraftGraphFromPromptResponse
} from './agenticGraph';
import type {
  LLMCapability,
  LLMMode,
  LLMProvider,
  LLMStatusContract
} from './llm/contracts';

export interface LLMConfig {
  apiKey?: string;
  provider?: 'openrouter' | 'openai' | 'anthropic';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

type JsonObject = Record<string, unknown>;

function readImportMetaEnv(): Record<string, string | undefined> | undefined {
  try {
    return Function(
      'return typeof import !== "undefined" && import.meta && import.meta.env ? import.meta.env : undefined;'
    )() as Record<string, string | undefined> | undefined;
  } catch {
    return undefined;
  }
}

const IMPORT_META_ENV = readImportMetaEnv();

const ENV_VARS: Record<string, string | undefined> = IMPORT_META_ENV ?? {
  VITE_API_URL: undefined,
  VITE_API_BASE_URL: undefined,
  VITE_VERCEL_PROTECTION_BYPASS: undefined
};

const API_BASE = ENV_VARS.VITE_API_URL ?? ENV_VARS.VITE_API_BASE_URL ?? '';

function withBase(path: string): string {
  if (!path) {
    return path;
  }

  if (!API_BASE || API_BASE === '/' || API_BASE === '') {
    return path;
  }

  if (path.startsWith('http')) {
    return path;
  }

  const base = API_BASE.replace(/\/$/, '');
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
}

export interface LLMCompletionResponse extends JsonObject {
  content?: string;
  output?: string;
  outputs?: string[];
}

export type LLMStatusResponse = JsonObject & LLMStatusContract;

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined)
    };

    const protectionBypass =
      ENV_VARS.VITE_VERCEL_PROTECTION_BYPASS;

    if (protectionBypass) {
      headers['x-vercel-protection-bypass'] = protectionBypass;
    }

    const response = await fetch(withBase(path), {
      ...init,
      headers
    });

    if (!response.ok) {
      let errorMessage = `API call failed: ${response.statusText}`;

      try {
        const errorData = await response.json();

        if (
          typeof errorData === 'object' &&
          errorData !== null &&
          'error' in errorData &&
          typeof errorData.error === 'string'
        ) {
          errorMessage = errorData.error;
        }
      } catch {
        if (response.statusText) {
          errorMessage = `API call failed: ${response.status} ${response.statusText}`;
        }
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  private async requestWithFallback<T>(
    paths: string[],
    init: RequestInit = {}
  ): Promise<T> {
    let lastError: unknown;

    for (const path of paths) {
      try {
        return await this.request<T>(path, init);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('API call failed');
  }

  private async callAPI<T>(
    paths: string[],
    data: JsonObject,
    options: { includeConfig?: boolean } = {}
  ): Promise<T> {
    return this.requestWithFallback<T>(paths, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        options.includeConfig ? this.filterRequestPayload(data) : data
      )
    });
  }

  private filterRequestPayload(data: JsonObject): JsonObject {
    const payload: JsonObject = { ...data };

    if (typeof this.config.model === 'string' && payload.model == null) {
      payload.model = this.config.model;
    }
    if (
      typeof this.config.temperature === 'number' &&
      payload.temperature == null
    ) {
      payload.temperature = this.config.temperature;
    }
    if (
      typeof this.config.maxTokens === 'number' &&
      payload.maxTokens == null
    ) {
      payload.maxTokens = this.config.maxTokens;
    }

    return payload;
  }

  async complete(
    prompt: string,
    options?: JsonObject
  ): Promise<LLMCompletionResponse>;
  async complete(
    request: JsonObject
  ): Promise<LLMCompletionResponse>;
  async complete(
    promptOrRequest: string | JsonObject,
    options: JsonObject = {}
  ): Promise<LLMCompletionResponse> {
    const request =
      typeof promptOrRequest === 'string'
        ? {
            prompt: promptOrRequest,
            ...options
          }
        : promptOrRequest;

    return this.callAPI<LLMCompletionResponse>(
      ['/api/llm/complete', '/api/llm-complete'],
      request,
      {
        includeConfig: true
      }
    );
  }

  async getStatus(): Promise<LLMStatusResponse> {
    return this.request<LLMStatusResponse>('/api/llm/status');
  }

  async parse(prompt: string, request: JsonObject = {}): Promise<JsonObject> {
    return this.callAPI<JsonObject>(
      ['/api/ai/parse', '/api/llm/parse', '/api/ai-parse', '/api/llm-parse'],
      {
        prompt,
        ...request
      }
    );
  }

  async suggest<TResponse>(request: JsonObject): Promise<TResponse> {
    return this.callAPI<TResponse>(
      ['/api/llm/suggest', '/api/llm-suggest'],
      request
    );
  }

  async metadata<TResponse>(request: JsonObject): Promise<TResponse> {
    return this.callAPI<TResponse>(
      ['/api/llm/metadata', '/api/llm-metadata'],
      request
    );
  }

  async refine<TResponse>(request: JsonObject): Promise<TResponse> {
    return this.callAPI<TResponse>(
      ['/api/llm/refine', '/api/llm-refine'],
      request
    );
  }

  async analyze<TResponse>(request: JsonObject): Promise<TResponse> {
    return this.callAPI<TResponse>(
      ['/api/llm/analyze', '/api/llm-analyze'],
      request
    );
  }

  async populateChoices<TResponse>(request: JsonObject): Promise<TResponse> {
    return this.callAPI<TResponse>(
      ['/api/llm/populate', '/api/llm-populate'],
      request
    );
  }

  async optimizeChoices<TResponse>(request: JsonObject): Promise<TResponse> {
    return this.callAPI<TResponse>(
      ['/api/llm/optimize', '/api/llm-optimize'],
      request
    );
  }

  async draftGraphFromPrompt(
    request: DraftGraphFromPromptRequest
  ): Promise<DraftGraphFromPromptResponse>;
  async draftGraphFromPrompt(
    prompt: string,
    request?: Omit<DraftGraphFromPromptRequest, 'prompt'>
  ): Promise<DraftGraphFromPromptResponse>;
  async draftGraphFromPrompt(
    requestOrPrompt: DraftGraphFromPromptRequest | string,
    requestOverrides: Omit<DraftGraphFromPromptRequest, 'prompt'> = {}
  ): Promise<DraftGraphFromPromptResponse> {
    const request =
      typeof requestOrPrompt === 'string'
        ? {
            prompt: requestOrPrompt,
            ...requestOverrides
          }
        : requestOrPrompt;

    return this.callAPI<DraftGraphFromPromptResponse>(
      ['/api/agent/draft-graph'],
      request as JsonObject
    );
  }
}

export class ApiLLMClient extends LLMService {}

// Mock services that use the API-based LLM service
export class NodeIntelligenceService {
  constructor(private llm: LLMService) {}

  private variablePattern = /\{([^}]+)\}/g;

  private extractVariables(text: string): string[] {
    const matches = text.match(this.variablePattern);
    return matches ? Array.from(new Set(matches)) : [];
  }

  private preserveVariables(
    originalText: string,
    generatedText: string
  ): string {
    const variables = this.extractVariables(originalText);
    if (variables.length === 0) {
      return generatedText.trim();
    }

    let result = generatedText.trim();
    for (const variable of variables) {
      if (!result.includes(variable)) {
        result = `${variable} ${result}`.trim();
      }
    }

    return result;
  }

  private normalizeChoices(
    nodeText: string,
    choices: Array<{ text?: string; weight?: number }>
  ): Choice[] {
    const seen = new Set<string>();

    return choices
      .map(choice => ({
        text: this.preserveVariables(
          nodeText,
          String(choice.text ?? '').trim()
        ),
        weight: Number.isFinite(choice.weight)
          ? Math.max(1, Math.min(10, Math.round(Number(choice.weight))))
          : 5
      }))
      .filter(choice => choice.text.length > 0)
      .filter(choice => {
        const key = choice.text.trim().toLowerCase();
        if (!key || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  private isChoiceLike(
    value: unknown
  ): value is { text?: string; weight?: number } {
    return typeof value === 'object' && value !== null;
  }

  private parseChoiceResponse(
    value: unknown
  ): Array<{ text?: string; weight?: number }> | null {
    if (
      typeof value !== 'object' ||
      value === null ||
      !Array.isArray((value as { choices?: unknown }).choices)
    ) {
      return null;
    }

    const choices = (value as { choices: unknown[] }).choices.filter(
      (choice): choice is { text?: string; weight?: number } =>
        this.isChoiceLike(choice)
    );

    return choices.length > 0 ? choices : null;
  }

  private isInspirationSuggestionLike(
    value: unknown
  ): value is InspirationSuggestion {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const candidate = value as InspirationSuggestion;
    return (
      typeof candidate.theme === 'string' && Array.isArray(candidate.choices)
    );
  }

  private parseInspirationResponse(
    value: unknown
  ): InspirationSuggestion[] | null {
    if (
      typeof value !== 'object' ||
      value === null ||
      !Array.isArray((value as { suggestions?: unknown }).suggestions)
    ) {
      return null;
    }

    const suggestions = (
      value as { suggestions: unknown[] }
    ).suggestions.filter(
      (suggestion): suggestion is InspirationSuggestion =>
        this.isInspirationSuggestionLike(suggestion)
    );

    return suggestions.length > 0 ? suggestions : null;
  }

  async getSuggestions<TResponse extends JsonObject>(
    nodeType: string,
    context: JsonObject
  ): Promise<TResponse> {
    return this.llm.suggest<TResponse>({ nodeType, context });
  }

  async populateChoices(
    nodeText: string,
    context: string,
    count: number = 5
  ): Promise<Choice[]> {
    try {
      const response = await this.llm.populateChoices<unknown>({
        nodeText,
        context,
        count
      });

      const parsedChoices = this.parseChoiceResponse(response);
      if (parsedChoices) {
        const normalised = this.normalizeChoices(nodeText, parsedChoices);

        if (normalised.length > 0) {
          return normalised.slice(0, count);
        }
      }
    } catch (error) {
      console.error(
        '[ApiLLMService] populateChoices failed, falling back to offline suggestions:',
        error
      );
    }

    return this.getOfflineSuggestions(nodeText, count);
  }

  async optimizeWeights(
    choices: Choice[],
    context: string,
    preference: string = 'balanced variety'
  ): Promise<WeightOptimizationResult> {
    try {
      const response = await this.llm.optimizeChoices<unknown>({
        choices,
        context,
        preference
      });

      const parsedChoices = this.parseChoiceResponse(response);
      if (parsedChoices) {
        const optimised = parsedChoices.map((choice, index) => ({
          ...choices[index],
          ...choice,
          weight: Number.isFinite(choice.weight)
            ? Math.max(1, Math.min(10, Math.round(Number(choice.weight))))
            : (choices[index]?.weight ?? 5)
        }));

        return {
          original: choices,
          optimized: optimised,
          confidence: 'medium'
        };
      }
    } catch (error) {
      console.error(
        '[ApiLLMService] optimizeWeights failed, returning original choices:',
        error
      );
    }

    return {
      original: choices,
      optimized: choices,
      confidence: 'low'
    };
  }

  async getInspiration(
    upstreamContext: string
  ): Promise<InspirationSuggestion[]> {
    try {
      const response = await this.llm.suggest<unknown>({
        operation: 'inspiration',
        context: upstreamContext
      });

      const parsedSuggestions = this.parseInspirationResponse(response);
      if (parsedSuggestions) {
        return parsedSuggestions.map(suggestion => ({
          theme: suggestion.theme || 'Inspiration',
          choices: Array.isArray(suggestion.choices)
            ? suggestion.choices.map(choice => ({
                text: String(choice.text ?? '').trim(),
                weight: Number.isFinite(choice.weight)
                  ? Math.max(1, Math.min(10, Math.round(Number(choice.weight))))
                  : 5
              }))
            : []
        }));
      }
    } catch (error) {
      console.error(
        '[ApiLLMService] getInspiration failed, using offline suggestions:',
        error
      );
    }

    return this.getOfflineInspiration();
  }

  private getOfflineSuggestions(text: string, count: number): Choice[] {
    const fallback: Record<string, Choice[]> = {
      action: [
        { text: 'running frantically', weight: 7 },
        { text: 'diving for cover', weight: 8 },
        { text: 'freezing in place', weight: 5 },
        { text: 'stumbling backwards', weight: 6 },
        { text: 'scrambling away', weight: 7 }
      ],
      emotion: [
        { text: 'terrified', weight: 8 },
        { text: 'shocked', weight: 7 },
        { text: 'confused', weight: 5 },
        { text: 'panicked', weight: 9 },
        { text: 'stunned', weight: 6 }
      ],
      environment: [
        { text: 'debris-filled streets', weight: 7 },
        { text: 'smoke-filled air', weight: 8 },
        { text: 'abandoned buildings', weight: 6 },
        { text: 'chaotic scene', weight: 9 },
        { text: 'war-torn landscape', weight: 7 }
      ],
      time: [
        { text: 'at dawn', weight: 6 },
        { text: 'at dusk', weight: 7 },
        { text: 'in the dead of night', weight: 8 },
        { text: 'under harsh midday sun', weight: 5 },
        { text: 'during golden hour', weight: 7 }
      ],
      weather: [
        { text: 'heavy rain', weight: 7 },
        { text: 'thick fog', weight: 6 },
        { text: 'swirling dust', weight: 8 },
        { text: 'clear skies', weight: 5 },
        { text: 'storm approaching', weight: 7 }
      ]
    };

    const lowerText = text.toLowerCase();
    let category: keyof typeof fallback = 'action';

    if (lowerText.includes('feel') || lowerText.includes('emotion')) {
      category = 'emotion';
    } else if (lowerText.includes('scene') || lowerText.includes('place')) {
      category = 'environment';
    } else if (lowerText.includes('time') || lowerText.includes('when')) {
      category = 'time';
    } else if (lowerText.includes('weather') || lowerText.includes('sky')) {
      category = 'weather';
    }

    return this.normalizeChoices(text, fallback[category]).slice(0, count);
  }

  private getOfflineInspiration(): InspirationSuggestion[] {
    return [
      {
        theme: 'Character Reactions',
        choices: [
          { text: 'panic and flee', weight: 8 },
          { text: 'freeze in shock', weight: 6 },
          { text: 'seek cover', weight: 7 },
          { text: 'help others', weight: 5 }
        ]
      },
      {
        theme: 'Environmental Details',
        choices: [
          { text: 'debris flying', weight: 7 },
          { text: 'dust clouds', weight: 6 },
          { text: 'sirens wailing', weight: 8 },
          { text: 'glass shattering', weight: 7 }
        ]
      },
      {
        theme: 'Time Variations',
        choices: [
          { text: 'dawn breaking', weight: 6 },
          { text: 'high noon', weight: 5 },
          { text: 'twilight hour', weight: 7 },
          { text: 'dead of night', weight: 8 }
        ]
      }
    ];
  }
}

export class TextRefinementService {
  constructor(private llm: LLMService) {}

  async refine(
    text: string,
    mode: RefinementMode,
    prompt?: string
  ): Promise<RefinementResult> {
    try {
      const result = await this.llm.refine<{
        refinedText?: string;
        model?: string;
        changes?: unknown;
        original?: string;
      }>({
        text,
        mode,
        instruction: prompt
      });

      const refined =
        typeof result?.refinedText === 'string' ? result.refinedText : text;

      return {
        original: result?.original || text,
        refined,
        changes: Array.isArray(result?.changes) ? result.changes : [],
        mode,
        confidence: 'medium'
      };
    } catch (error) {
      console.error('[ApiLLMService] Text refinement failed:', error);
      return {
        original: text,
        refined: text,
        changes: [],
        mode,
        confidence: 'low'
      };
    }
  }

  async refineBatch(
    texts: string[],
    mode: RefinementMode,
    prompt?: string
  ): Promise<RefinementResult[]> {
    return Promise.all(texts.map(text => this.refine(text, mode, prompt)));
  }
}

export class GraphAnalyzer {
  constructor(private llm: LLMService) {}

  async analyze<TResponse extends JsonObject>(
    graph: JsonObject
  ): Promise<TResponse> {
    return this.llm.analyze<TResponse>({ graph });
  }
}

export class MetadataExtractor {
  constructor(private llm: LLMService) {}

  async extract<TResponse extends JsonObject>(
    content: JsonObject | string
  ): Promise<TResponse> {
    return this.llm.metadata<TResponse>({ content });
  }
}

export class SimilarityEngine {
  async compare(a: string, b: string): Promise<number> {
    // Simple client-side similarity for now
    const aWords = new Set(a.toLowerCase().split(/\s+/));
    const bWords = new Set(b.toLowerCase().split(/\s+/));
    const intersection = new Set([...aWords].filter(x => bWords.has(x)));
    const union = new Set([...aWords, ...bWords]);
    return intersection.size / union.size;
  }
}

export class TokenTracker {
  private totalTokens = 0;
  private totalCost = 0;

  track(tokens: number, cost: number): void {
    this.totalTokens += tokens;
    this.totalCost += cost;
  }

  getStats() {
    return {
      totalTokens: this.totalTokens,
      totalCost: this.totalCost
    };
  }

  reset(): void {
    this.totalTokens = 0;
    this.totalCost = 0;
  }
}
