// Natural Language Search for Advanced Asset Browser
// Story 2.5b: Advanced Asset Browser Features

import { Asset } from './assetMatcher';
import { LLMService } from './llm/LLMService';
import { BulkOperationsManager } from './llm/BulkOperationsManager';

export interface SearchIntent {
  action: 'find' | 'exclude' | 'similar' | 'filter';
  criteria: SearchCriteria[];
  modifiers: SearchModifier[];
  context?: any;
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
  private bulkOpsManager: BulkOperationsManager;
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
    this.bulkOpsManager = new BulkOperationsManager();
  }

  async search(
    query: string,
    assets: Asset[],
    options: {
      limit?: number;
      useCache?: boolean;
      graphContext?: any;
    } = {}
  ): Promise<SearchResult> {
    const startTime = performance.now();
    const { limit = 50, useCache = true, graphContext } = options;

    // Check cache
    const cacheKey = `${query}-${limit}`;
    if (useCache && this.searchCache.has(cacheKey)) {
      const cached = this.searchCache.get(cacheKey)!;
      return {
        ...cached,
        executionTime: performance.now() - startTime
      };
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
        const firstKey = this.searchCache.keys().next().value;
        this.searchCache.delete(firstKey);
      }
    }

    return result;
  }

  private async parseQuery(query: string, context?: any): Promise<ParsedQuery> {
    const normalized = this.normalizeQuery(query);
    const tokens = this.tokenizeQuery(normalized);
    const corrections = this.applyCorrections(tokens);

    // Try to understand intent with LLM if available
    let intent: SearchIntent;
    if (this.llmService) {
      try {
        intent = await this.parseWithLLM(query, context);
      } catch (error) {
        intent = this.parseWithPatterns(normalized);
      }
    } else {
      intent = this.parseWithPatterns(normalized);
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
    context?: any
  ): Promise<SearchIntent> {
    if (!this.llmService) {
      return this.parseWithPatterns(query);
    }

    const prompt = `
      Parse this natural language search query into structured search criteria:
      Query: "${query}"
      ${context ? `Context: ${JSON.stringify(context)}` : ''}
      
      Return JSON with:
      - action: 'find' | 'exclude' | 'similar' | 'filter'
      - criteria: array of {field, operator, value, weight}
      - modifiers: array of {type, value}
      
      Example: "Find urban chase scenes but not at night"
      Returns: {
        action: 'find',
        criteria: [
          {field: 'setting', operator: 'equals', value: 'urban', weight: 1.0},
          {field: 'theme', operator: 'contains', value: 'chase', weight: 0.8}
        ],
        modifiers: [
          {type: 'but_not', value: 'night'}
        ]
      }
    `;

    try {
      const response = await this.llmService.complete({
        prompt,
        model: 'gpt-4o-mini',
        temperature: 0.1,
        maxTokens: 500
      });

      return JSON.parse(response.content);
    } catch (error) {
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

      switch (criterion.operator) {
        case 'contains':
          return fieldValue
            .toLowerCase()
            .includes(criterion.value.toLowerCase());
        case 'equals':
          return fieldValue.toLowerCase() === criterion.value.toLowerCase();
        case 'not':
          return !fieldValue
            .toLowerCase()
            .includes(criterion.value.toLowerCase());
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

    return asset.metadata?.[field as keyof typeof asset.metadata] || '';
  }

  private applyModifier(assets: Asset[], modifier: SearchModifier): Asset[] {
    switch (modifier.type) {
      case 'but_not':
        return assets.filter(asset => {
          const assetText = JSON.stringify(asset).toLowerCase();
          return !assetText.includes(modifier.value.toLowerCase());
        });

      case 'especially':
        // Boost assets that match the modifier
        return assets.map(asset => {
          const assetText = JSON.stringify(asset).toLowerCase();
          if (assetText.includes(modifier.value.toLowerCase())) {
            // Add boost metadata for sorting
            (asset as any)._boost = ((asset as any)._boost || 1) * 2;
          }
          return asset;
        });

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
    if ((asset as any)._boost) {
      score *= (asset as any)._boost;
    }

    return score;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple character-based similarity
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

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

  // Clear search cache
  clearCache(): void {
    this.searchCache.clear();
  }

  // Get search history (for autocomplete)
  getSearchHistory(): string[] {
    return Array.from(this.searchCache.keys()).map(key => key.split('-')[0]);
  }
}
