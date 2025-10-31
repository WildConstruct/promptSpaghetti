// Natural Language Search for Advanced Asset Browser
// Story 2.5b: Advanced Asset Browser Features

import { Asset, AssetMetadata } from './assetMatcher';
import { LLMService } from './llm/LLMService';
import type { LLMResponse } from './llm/types';

export interface SearchIntent {
  action: 'find' | 'exclude' | 'similar' | 'filter';
  criteria: SearchCriteria[];
  modifiers: SearchModifier[];
  context?: Record<string, unknown>;
}

export interface SearchCriteria {
  field: 'theme' | 'mood' | 'setting' | 'category' | 'style' | 'any';
  operator: 'contains' | 'equals' | 'not' | 'similar';
  value: string;
  weight: number;
}

export interface SearchModifier {
  type: 'but_not' | 'especially' | 'similar_to' | 'between';
  value: string;
}

export interface SearchResult {
  assets: Asset[];
  query: ParsedQuery;
  suggestions: string[];
  totalMatches: number;
  executionTime: number;
}

export interface ParsedQuery {
  original: string;
  normalized: string;
  intent: SearchIntent;
  tokens: string[];
  corrections: string[];
}

export class NaturalLanguageSearch {
  private llmService: LLMService | null;
  private searchCache: Map<string, SearchResult> = new Map();

  // Common search patterns
  private static readonly PATTERNS = {
    find: /(?:find|show|get|search|look for)(?: me)? (.*)/i,
    exclude: /(?:but not|except|without|excluding) (.*)/i,
    similar: /(?:similar to|like|resembling) (.*)/i,
    between: /(?:between|from) (.*) (?:and|to) (.*)/i,
    category: /(?:for|in|with) (\w+) (?:scene|setting|mood|theme)/i
  };

  // Typo corrections database
  private static readonly CORRECTIONS: Record<string, string> = {
    medival: 'medieval',
    fantacy: 'fantasy',
    urben: 'urban',
    charecter: 'character',
    seen: 'scene',
    croud: 'crowd',
    wether: 'weather'
  };

  constructor(llmService?: LLMService) {
    this.llmService = llmService || null;
  }

  async search(
    query: string,
    assets: Asset[],
    options: {
      limit?: number;
      useCache?: boolean;
      graphContext?: Record<string, unknown>;
    } = {}
  ): Promise<SearchResult> {
    const startTime = performance.now();
    const { limit = 50, useCache = true, graphContext } = options;

    // Check cache
    const cacheKey = `${query}-${limit}`;
    if (useCache) {
      const cached = this.searchCache.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          executionTime: performance.now() - startTime
        };
      }
    }

    // Parse the query
    const parsedQuery = await this.parseQuery(query, graphContext);

    // Execute search based on intent
    const matchedAssets = await this.executeSearch(parsedQuery, assets);

    // Generate suggestions for refining the search
    const suggestions = this.generateSuggestions(
      parsedQuery,
      matchedAssets.length
    );

    // Limit results
    const limitedAssets = matchedAssets.slice(0, limit);

    const result: SearchResult = {
      assets: limitedAssets,
      query: parsedQuery,
      suggestions,
      totalMatches: matchedAssets.length,
      executionTime: performance.now() - startTime
    };

    // Cache result
    if (useCache) {
      this.searchCache.set(cacheKey, result);

      // Clear old cache entries
      if (this.searchCache.size > 100) {
        const iterator = this.searchCache.keys().next();
        if (!iterator.done && iterator.value) {
          this.searchCache.delete(iterator.value);
        }
      }
    }

    return result;
  }

  private async parseQuery(
    query: string,
    context?: Record<string, unknown>
  ): Promise<ParsedQuery> {
    const normalized = this.normalizeQuery(query);
    const tokens = this.tokenizeQuery(normalized);
    const corrections = this.applyCorrections(tokens);

    // Try to understand intent with LLM if available
    let intent: SearchIntent;
    if (this.llmService) {
      try {
        intent = await this.parseWithLLM(query, context);
      } catch {
        intent = this.parseWithPatterns(normalized);
      }
    } else {
      intent = this.parseWithPatterns(normalized);
    }

    if (context) {
      intent.context = context;
    }

    return {
      original: query,
      normalized,
      intent,
      tokens,
      corrections
    };
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private tokenizeQuery(query: string): string[] {
    return query.split(/\s+/).filter(token => token.length > 0);
  }

  private applyCorrections(tokens: string[]): string[] {
    const corrections: string[] = [];

    tokens.forEach(token => {
      const correction = NaturalLanguageSearch.CORRECTIONS[token];
      if (correction) {
        corrections.push(`${token} → ${correction}`);
      }
    });

    return corrections;
  }

  private parseWithPatterns(query: string): SearchIntent {
    const intent: SearchIntent = {
      action: 'find',
      criteria: [],
      modifiers: []
    };

    // Check for exclusion patterns
    const excludeMatch = query.match(NaturalLanguageSearch.PATTERNS.exclude);
    if (excludeMatch) {
      intent.modifiers.push({
        type: 'but_not',
        value: excludeMatch[1]
      });
    }

    // Check for similarity patterns
    const similarMatch = query.match(NaturalLanguageSearch.PATTERNS.similar);
    if (similarMatch) {
      intent.action = 'similar';
      intent.criteria.push({
        field: 'any',
        operator: 'similar',
        value: similarMatch[1],
        weight: 1.0
      });
    }

    // Check for category patterns
    const categoryMatch = query.match(NaturalLanguageSearch.PATTERNS.category);
    if (categoryMatch) {
      intent.criteria.push({
        field: 'category',
        operator: 'contains',
        value: categoryMatch[1],
        weight: 0.8
      });
    }

    // Extract keywords as general criteria
    const keywords = this.extractKeywords(query);
    keywords.forEach(keyword => {
      intent.criteria.push({
        field: 'any',
        operator: 'contains',
        value: keyword,
        weight: 0.5
      });
    });

    return intent;
  }

  private async parseWithLLM(
    query: string,
    context?: Record<string, unknown>
  ): Promise<SearchIntent> {
    if (!this.llmService) {
      return this.parseWithPatterns(query);
    }

    const contextBlock = context
      ? `Context: ${this.safeStringify(context)}\n`
      : '';

    const prompt = `Parse this natural language search query into structured search criteria.\n${contextBlock}Query: "${query}"\n\nReturn JSON with: { action, criteria, modifiers }.\n`;

    try {
      const response = await this.llmService.complete({
        prompt,
        temperature: 0.1,
        maxTokens: 500,
        taskType: 'general',
        responseFormat: 'json'
      });

      if (!response) {
        throw new Error('LLM returned null response');
      }

      const content = this.extractContent(response);
      const parsed = JSON.parse(content) as unknown;
      return this.normalizeIntent(parsed, query);
    } catch {
      // Fallback to pattern matching
      return this.parseWithPatterns(query);
    }
  }

  private extractKeywords(query: string): string[] {
    // Remove common words and extract meaningful keywords
    const stopWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
      'from',
      'as',
      'is',
      'was',
      'are',
      'been'
    ]);

    return query
      .split(/\s+/)
      .filter(word => !stopWords.has(word) && word.length > 2)
      .slice(0, 5); // Limit to 5 keywords
  }

  private async executeSearch(
    parsedQuery: ParsedQuery,
    assets: Asset[]
  ): Promise<Asset[]> {
    let results = [...assets];

    // Apply each criterion
    parsedQuery.intent.criteria.forEach(criterion => {
      results = this.applyCriterion(results, criterion);
    });

    // Apply modifiers
    parsedQuery.intent.modifiers.forEach(modifier => {
      results = this.applyModifier(results, modifier);
    });

    // Sort by relevance
    results = this.sortByRelevance(results, parsedQuery);

    return results;
  }

  private applyCriterion(assets: Asset[], criterion: SearchCriteria): Asset[] {
    return assets.filter(asset => {
      const fieldValue = this.getFieldValue(asset, criterion.field);
      const normalisedField = fieldValue.toLowerCase();
      const normalizedValue = criterion.value.toLowerCase();

      switch (criterion.operator) {
        case 'contains':
          return normalisedField.includes(normalizedValue);
        case 'equals':
          return normalisedField === normalizedValue;
        case 'not':
          return !normalisedField.includes(normalizedValue);
        case 'similar':
          return this.calculateSimilarity(fieldValue, criterion.value) > 0.6;
        default:
          return false;
      }
    });
  }

  private getFieldValue(asset: Asset, field: string): string {
    if (field === 'any') {
      // Search across all fields
      return JSON.stringify(asset).toLowerCase();
    }

    const metadata = asset.metadata;
    if (!metadata) {
      return '';
    }

    const metadataValue = metadata[field as keyof AssetMetadata];

    if (typeof metadataValue === 'string') {
      return metadataValue;
    }

    if (Array.isArray(metadataValue)) {
      return metadataValue
        .filter((value): value is string => typeof value === 'string')
        .join(' ');
    }

    return '';
  }

  private applyModifier(assets: Asset[], modifier: SearchModifier): Asset[] {
    switch (modifier.type) {
      case 'but_not':
        return assets.filter(asset => {
          const assetText = JSON.stringify(asset).toLowerCase();
          return !assetText.includes(modifier.value.toLowerCase());
        });

      case 'especially':
        return assets;

      default:
        return assets;
    }
  }

  private sortByRelevance(assets: Asset[], parsedQuery: ParsedQuery): Asset[] {
    return assets.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(a, parsedQuery);
      const scoreB = this.calculateRelevanceScore(b, parsedQuery);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(
    asset: Asset,
    parsedQuery: ParsedQuery
  ): number {
    let score = 0;
    const assetText = JSON.stringify(asset).toLowerCase();

    // Check each criterion
    parsedQuery.intent.criteria.forEach(criterion => {
      if (assetText.includes(criterion.value.toLowerCase())) {
        score += criterion.weight;
      }
    });

    // Apply boost if present
    const boostMultiplier = parsedQuery.intent.modifiers.some(
      modifier =>
        modifier.type === 'especially' &&
        assetText.includes(modifier.value.toLowerCase())
    )
      ? 2
      : 1;

    score *= boostMultiplier;

    return score;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple character-based similarity
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) {
      return 1;
    }

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) {
      return 1;
    }

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private generateSuggestions(
    parsedQuery: ParsedQuery,
    resultCount: number
  ): string[] {
    const suggestions: string[] = [];

    // Suggest refinements based on result count
    if (resultCount === 0) {
      suggestions.push('Try broader search terms');
      suggestions.push('Remove exclusion filters');
      if (parsedQuery.corrections.length > 0) {
        suggestions.push(`Did you mean: ${parsedQuery.corrections[0]}`);
      }
    } else if (resultCount > 100) {
      suggestions.push('Add more specific criteria');
      suggestions.push('Use "but not" to exclude unwanted results');
      suggestions.push('Try filtering by category or mood');
    }

    // Suggest related searches
    if (parsedQuery.intent.criteria.length > 0) {
      const mainCriterion = parsedQuery.intent.criteria[0];
      suggestions.push(`Similar to "${mainCriterion.value}"`);
    }

    return suggestions.slice(0, 3);
  }

  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '[unserializable context]';
    }
  }

  private extractContent(response: LLMResponse): string {
    const content = (response.content ?? '').trim();
    if (!content) {
      throw new Error('Empty LLM response');
    }
    return content;
  }

  private normalizeIntent(data: unknown, fallbackQuery: string): SearchIntent {
    const intent: SearchIntent = {
      action: 'find',
      criteria: [],
      modifiers: []
    };

    if (!data || typeof data !== 'object') {
      return intent;
    }

    const record = data as Record<string, unknown>;

    if (
      typeof record.action === 'string' &&
      this.isValidAction(record.action)
    ) {
      intent.action = record.action;
    }

    if (Array.isArray(record.criteria)) {
      record.criteria.forEach(raw => {
        const criterion = this.normalizeCriterion(raw);
        if (criterion) {
          intent.criteria.push(criterion);
        }
      });
    }

    if (Array.isArray(record.modifiers)) {
      record.modifiers.forEach(raw => {
        const modifier = this.normalizeModifier(raw);
        if (modifier) {
          intent.modifiers.push(modifier);
        }
      });
    }

    if (intent.criteria.length === 0) {
      this.extractKeywords(fallbackQuery).forEach(keyword => {
        intent.criteria.push({
          field: 'any',
          operator: 'contains',
          value: keyword,
          weight: 0.5
        });
      });
    }

    return intent;
  }

  private normalizeCriterion(raw: unknown): SearchCriteria | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const record = raw as Record<string, unknown>;
    const field = typeof record.field === 'string' ? record.field : 'any';
    const operator =
      typeof record.operator === 'string' ? record.operator : 'contains';
    const value = typeof record.value === 'string' ? record.value : '';
    const weight = typeof record.weight === 'number' ? record.weight : 1;

    if (
      !this.isValidField(field) ||
      !this.isValidOperator(operator) ||
      value.length === 0
    ) {
      return null;
    }

    return {
      field,
      operator,
      value,
      weight
    };
  }

  private normalizeModifier(raw: unknown): SearchModifier | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const record = raw as Record<string, unknown>;
    const type = typeof record.type === 'string' ? record.type : '';
    const value = typeof record.value === 'string' ? record.value : '';

    if (!this.isValidModifierType(type) || value.length === 0) {
      return null;
    }

    return {
      type,
      value
    };
  }

  private isValidAction(action: string): action is SearchIntent['action'] {
    return ['find', 'exclude', 'similar', 'filter'].includes(action);
  }

  private isValidField(field: string): field is SearchCriteria['field'] {
    return ['theme', 'mood', 'setting', 'category', 'style', 'any'].includes(
      field
    );
  }

  private isValidOperator(
    operator: string
  ): operator is SearchCriteria['operator'] {
    return ['contains', 'equals', 'not', 'similar'].includes(operator);
  }

  private isValidModifierType(type: string): type is SearchModifier['type'] {
    return ['but_not', 'especially', 'similar_to', 'between'].includes(type);
  }

  // Clear search cache
  clearCache(): void {
    this.searchCache.clear();
  }

  // Get search history (for autocomplete)
  getSearchHistory(): string[] {
    return Array.from(this.searchCache.keys()).map(key => key.split('-')[0]);
  }
}
