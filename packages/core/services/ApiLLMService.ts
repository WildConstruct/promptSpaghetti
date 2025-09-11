/**
 * API-based LLM Service for browser environments
 * All LLM operations go through server-side API endpoints
 */

export interface LLMConfig {
  apiKey?: string;
  provider?: 'openrouter' | 'openai' | 'anthropic';
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = config;
  }

  private async callAPI<T>(endpoint: string, data: any): Promise<T> {
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

  async complete(prompt: string, options?: any): Promise<any> {
    return this.callAPI('llm-complete', { prompt, ...options });
  }

  async suggest(request: any): Promise<any> {
    return this.callAPI('llm-suggest', request);
  }

  async metadata(request: any): Promise<any> {
    return this.callAPI('llm-metadata', request);
  }

  async refine(request: any): Promise<any> {
    return this.callAPI('llm-refine', request);
  }

  async analyze(request: any): Promise<any> {
    return this.callAPI('llm-analyze', request);
  }
}

// Mock services that use the API-based LLM service
export class NodeIntelligenceService {
  constructor(private llm: LLMService) {}

  async getSuggestions(nodeType: string, context: any): Promise<any> {
    return this.llm.suggest({ nodeType, context });
  }
}

export class TextRefinementService {
  constructor(private llm: LLMService) {}

  async refine(text: string, options: any): Promise<string> {
    const result = await this.llm.refine({ text, options });
    return result.refined || text;
  }
}

export class GraphAnalyzer {
  constructor(private llm: LLMService) {}

  async analyze(graph: any): Promise<any> {
    return this.llm.analyze({ graph });
  }
}

export class MetadataExtractor {
  constructor(private llm: LLMService) {}

  async extract(content: any): Promise<any> {
    return this.llm.metadata({ content });
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
