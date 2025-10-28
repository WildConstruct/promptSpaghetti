/**
 * API-based LLM Service for browser environments
 * All LLM operations go through server-side API endpoints
 */

import type {
  Choice,
  WeightOptimizationResult,
  InspirationSuggestion
} from './llm/NodeIntelligence';

export interface LLMConfig {
  apiKey?: string;
  provider?: 'openrouter' | 'openai' | 'anthropic';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

type JsonObject = Record<string, unknown>;

export interface LLMCompletionResponse extends JsonObject {
  output?: string;
  outputs?: string[];
}

export interface RefinementResponse extends JsonObject {
  refined?: string;
}

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
  }

  private async callAPI<T>(endpoint: string, data: JsonObject): Promise<T> {
    const response = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, config: this.config })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  async complete(
    prompt: string,
    options: JsonObject = {}
  ): Promise<LLMCompletionResponse> {
    return this.callAPI<LLMCompletionResponse>('llm-complete', {
      prompt,
      ...options
    });
  }

  async suggest<TResponse extends JsonObject>(
    request: JsonObject
  ): Promise<TResponse> {
    return this.callAPI<TResponse>('llm-suggest', request);
  }

  async metadata<TResponse extends JsonObject>(
    request: JsonObject
  ): Promise<TResponse> {
    return this.callAPI<TResponse>('llm-metadata', request);
  }

  async refine<TResponse extends JsonObject>(
    request: JsonObject
  ): Promise<TResponse> {
    return this.callAPI<TResponse>('llm-refine', request);
  }

  async analyze<TResponse extends JsonObject>(
    request: JsonObject
  ): Promise<TResponse> {
    return this.callAPI<TResponse>('llm-analyze', request);
  }

  async populateChoices<TResponse extends JsonObject>(
    request: JsonObject
  ): Promise<TResponse> {
    return this.callAPI<TResponse>('llm-populate', request);
  }

  async optimizeChoices<TResponse extends JsonObject>(
    request: JsonObject
  ): Promise<TResponse> {
    return this.callAPI<TResponse>('llm-optimize', request);
  }
}

// Mock services that use the API-based LLM service
export class NodeIntelligenceService {
  constructor(private llm: LLMService) {}

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
      const response = await this.llm.populateChoices<{
        choices?: Array<{ text?: string; weight?: number }>;
      }>({
        nodeText,
        context,
        count
      });

      if (Array.isArray(response?.choices)) {
        const normalised = response.choices
          .map(choice => ({
            text: String(choice.text ?? '').trim(),
            weight: Number.isFinite(choice.weight)
              ? Math.max(1, Math.min(10, Math.round(Number(choice.weight))))
              : 5
          }))
          .filter(choice => choice.text.length > 0);

        if (normalised.length > 0) {
          return normalised;
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
      const response = await this.llm.optimizeChoices<{ choices?: Choice[] }>({
        choices,
        context,
        preference
      });

      if (Array.isArray(response?.choices) && response.choices.length > 0) {
        const optimised = response.choices.map((choice, index) => ({
          ...choices[index],
          ...choice,
          weight: Number.isFinite(choice.weight)
            ? Math.max(1, Math.min(10, Math.round(Number(choice.weight))))
            : choices[index]?.weight ?? 5
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
      const response = await this.llm.suggest<{
        suggestions?: InspirationSuggestion[];
      }>({
        operation: 'inspiration',
        context: upstreamContext
      });

      if (Array.isArray(response?.suggestions)) {
        return response.suggestions.map(suggestion => ({
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

    return fallback[category].slice(0, count);
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

  async refine(text: string, options: JsonObject): Promise<string> {
    const result = await this.llm.refine<RefinementResponse>({ text, options });
    return typeof result.refined === 'string' ? result.refined : text;
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
