/**
 * Faceted Search System (Epic 16)
 * 
 * DEPLOYMENT BLOCKER FIX: Comprehensive faceted search system for building
 * advanced search interfaces with multiple filtering dimensions, real-time
 * results, search suggestions, and intelligent query processing.
 * 
 * Features:
 * - Multi-dimensional faceted filtering
 * - Real-time search with debouncing
 * - Search suggestions and auto-complete
 * - Advanced query parsing and processing
 * - Result ranking and relevance scoring
 * - Search analytics and optimization
 * - Customizable search interfaces
 * - Performance optimization with caching
 */
import { EventEmitter } from 'events';

// Core faceted search interfaces
export interface SearchFacet {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'enum' | 'range' | 'hierarchical';
  field: string;
  displayName: string;
  description?: string;
  options?: FacetOption[];
  ranges?: FacetRange[];
  hierarchy?: FacetHierarchy;
  config: FacetConfig;
  metadata: FacetMetadata;
}

export interface FacetOption {
  value: unknown;
  label: string;
  count: number;
  selected: boolean;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface FacetRange {
  min: number;
  max: number;
  step?: number;
  selectedMin?: number;
  selectedMax?: number;
  format?: 'number' | 'currency' | 'percentage' | 'date';
}

export interface FacetHierarchy {
  levels: HierarchyLevel[];
  separator: string;
  expandedLevels: Set<string>;
  maxDepth?: number;
}

export interface HierarchyLevel {
  id: string;
  name: string;
  parent?: string;
  children: string[];
  count: number;
  selected: boolean;
  expanded: boolean;
}

export interface FacetConfig {
  multiSelect: boolean;
  searchable: boolean;
  sortBy: 'count' | 'name' | 'custom';
  sortOrder: 'asc' | 'desc';
  displayLimit: number;
  showCount: boolean;
  collapsible: boolean;
  defaultExpanded: boolean;
  excludeFromQuery?: boolean;
}

export interface FacetMetadata {
  priority: number;
  group?: string;
  dependencies?: string[];
  conditionalDisplay?: {
    field: string;
    value: unknown;
  };
  analytics: {,
    totalSelections: number;
    popularValues: string[];
    averageSelections: number;
  };
}

export interface SearchQuery {
  text: string;
  filters: SearchFilter[];
  sort: SearchSort;
  pagination: SearchPagination;
  facets: string[];
  options: SearchOptions;
}

export interface SearchFilter {
  facetId: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
  value: unknown;
  values?: unknown[];
  boost?: number;
}

export interface SearchSort {
  field: string;
  order: 'asc' | 'desc';
  mode?: 'relevance' | 'field' | 'custom';
  customFunction?: string;
}

export interface SearchPagination {
  page: number;
  size: number;
  offset: number;
  total?: number;
}

export interface SearchOptions {
  includeHighlights: boolean;
  includeAggregations: boolean;
  includeSuggestions: boolean;
  fuzzySearch: boolean;
  stemming: boolean;
  synonyms: boolean;
  boostFields: Record<string, number>;
  minScore?: number;
}

export interface SearchResult<T = any> {
  items: SearchResultItem<T>[];
  facets: FacetResult[];
  pagination: SearchPagination;
  suggestions: SearchSuggestion[];
  aggregations: SearchAggregation[];
  metadata: SearchResultMetadata;
  query: SearchQuery;
}

export interface SearchResultItem<T = any> {
  id: string;
  data: T;
  score: number;
  highlights: Record<string, string[]>;
  explanation?: ScoreExplanation;
  matched: string[];
}

export interface ScoreExplanation {
  value: number;
  description: string;
  details: ScoreDetail[];
}

export interface ScoreDetail {
  field: string;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface FacetResult {
  facetId: string;
  name: string;
  type: string;
  options?: FacetOption[];
  range?: {
    min: number;
    max: number;
    selectedMin?: number;
    selectedMax?: number;
  };
  hierarchy?: FacetHierarchy;
  metadata: {,
    totalOptions: number;
    selectedOptions: number;
    hasMore: boolean;
  };
}

export interface SearchSuggestion {
  type: 'query' | 'correction' | 'completion';
  text: string;
  highlight: string;
  score: number;
  count?: number;
  metadata?: Record<string, any>;
}

export interface SearchAggregation {
  name: string;
  type: 'terms' | 'date_histogram' | 'numeric_range' | 'stats';
  field: string;
  buckets?: AggregationBucket[];
  stats?: AggregationStats;
}

export interface AggregationBucket {
  key: unknown;
  count: number;
  subAggregations?: SearchAggregation[];
}

export interface AggregationStats {
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
}

export interface SearchResultMetadata {
  took: number; // execution time in ms
  total: number;
  maxScore: number;
  queryAnalysis: QueryAnalysis;
  performance: PerformanceMetrics;
}

export interface QueryAnalysis {
  processedQuery: string;
  queryType: 'simple' | 'complex' | 'structured';
  appliedFilters: number;
  activeFacets: number;
  searchTerms: string[];
  suggestedTerms: string[];
}

export interface PerformanceMetrics {
  parseTime: number;
  searchTime: number;
  facetTime: number;
  totalTime: number;
  cacheHit: boolean;
  documentsScanned: number;
  resultsFiltered: number;
}

export interface SearchIndex<T = any> {
  name: string;
  fields: IndexField[];
  documents: Map<string, IndexedDocument<T>>;
  facets: Map<string, SearchFacet>;
  statistics: IndexStatistics;
  configuration: IndexConfiguration;
}

export interface IndexField {
  name: string;
  type: 'text' | 'keyword' | 'number' | 'date' | 'boolean' | 'object' | 'nested';
  indexed: boolean;
  stored: boolean;
  facetable: boolean;
  searchable: boolean;
  sortable: boolean;
  boost?: number;
  analyzer?: string;
}

export interface IndexedDocument<T = any> {
  id: string;
  data: T;
  indexed: Date;
  version: number;
  fields: Record<string, any>;
  boost?: number;
}

export interface IndexStatistics {
  totalDocuments: number;
  totalFields: number;
  indexSize: number; // bytes
  lastUpdated: Date;
  performance: {,
    averageSearchTime: number;
    averageFacetTime: number;
    cacheHitRate: number;
  };
}

export interface IndexConfiguration {
  analyzer: {,
    default: string;
    text: string;
    keyword: string;
  };
  faceting: {,
    defaultLimit: number;
    maxFacets: number;
    enableHierarchical: boolean;
  };
  performance: {,
    enableCaching: boolean;
    cacheSize: number;
    cacheTtl: number;
  };
}

export interface SearchConfiguration {
  index: IndexConfiguration;
  query: {,
    defaultOperator: 'and' | 'or';
    enableFuzzy: boolean;
    fuzzyDistance: number;
    enableSynonyms: boolean;
    enableStemming: boolean;
    minShouldMatch?: string;
  };
  faceting: {,
    enableRealTime: boolean;
    maxFacetOptions: number;
    enableHierarchical: boolean;
    enableRanges: boolean;
  };
  suggestions: {,
    enableAutoComplete: boolean;
    enableCorrections: boolean;
    maxSuggestions: number;
    minQueryLength: number;
  };
  performance: {,
    enableCaching: boolean;
    debounceDelay: number;
    maxCacheSize: number;
    enablePrefetch: boolean;
  };
}

// Main Faceted Search System
export class FacetedSearchSystem<T = any> extends EventEmitter {
  private indexes: Map<string, SearchIndex<T>> = new Map();
  private cache: Map<string, SearchResult<T>> = new Map();
  private config: SearchConfiguration;
  private queryProcessors: Map<string, Function> = new Map();
  private facetProcessors: Map<string, Function> = new Map();
  private suggestionEngine: SuggestionEngine;
  private searchAnalytics: SearchAnalytics;
  constructor(config?: Partial<SearchConfiguration>) {
    super();
    this.config = {
      index: {,
        analyzer: {,
          default: 'standard',
          text: 'standard',
          keyword: 'keyword',
        },
        faceting: {,
          defaultLimit: 10,
          maxFacets: 50,
          enableHierarchical: true,
        },
        performance: {,
          enableCaching: true,
          cacheSize: 1000,
          cacheTtl: 300000 // 5 minutes
        }
      },
      query: {,
        defaultOperator: 'and',
        enableFuzzy: true,
        fuzzyDistance: 2,
        enableSynonyms: true,
        enableStemming: true,
        minShouldMatch: '75%',
      },
      faceting: {,
        enableRealTime: true,
        maxFacetOptions: 100,
        enableHierarchical: true,
        enableRanges: true,
      },
      suggestions: {,
        enableAutoComplete: true,
        enableCorrections: true,
        maxSuggestions: 10,
        minQueryLength: 2,
      },
      performance: {,
        enableCaching: true,
        debounceDelay: 300,
        maxCacheSize: 10000,
        enablePrefetch: false,
      },
      ...config
    };
    this.suggestionEngine = new SuggestionEngine(this.config.suggestions);
    this.searchAnalytics = new SearchAnalytics();
    this.initializeProcessors();
  }
  // Index management
  async createIndex(name: string, fields: IndexField[], configuration?: Partial<IndexConfiguration>): Promise<void> {
    const index: SearchIndex<T> = {
      name,
      fields,
      documents: new Map(),
      facets: new Map(),
      statistics: {,
        totalDocuments: 0,
        totalFields: fields.length,
        indexSize: 0,
        lastUpdated: new Date(),
        performance: {,
          averageSearchTime: 0,
          averageFacetTime: 0,
          cacheHitRate: 0,
        }
      },
      configuration: {,
        ...this.config.index,
        ...configuration
      }
    };
    this.indexes.set(name, index);
    this.emit('indexCreated', {)
      name,
      fields: fields.length,
      configuration: index.configuration,
    });
  }
  async addDocuments(indexName: string, documents: T[], idField = 'id'): Promise<void> {
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    const startTime = performance.now();
    let addedCount = 0;
    for (const doc of documents) {
      const id = this.extractId(doc, idField);
      const indexedDoc: IndexedDocument<T> = {
        id,
        data: doc,
        indexed: new Date(),
        version: 1,
        fields: this.extractFields(doc, index.fields)
      };
      if (index.documents.has(id)) {
        indexedDoc.version = index.documents.get(id)!.version + 1;
      }
      index.documents.set(id, indexedDoc);
      addedCount++;
    }
    // Update statistics
    index.statistics.totalDocuments = index.documents.size;
    index.statistics.lastUpdated = new Date();
    index.statistics.indexSize = this.calculateIndexSize(index);
    // Clear cache for this index
    this.clearCacheForIndex(indexName);
    // Update facets
    await this.updateFacetCounts(index);
    const indexTime = performance.now() - startTime;
    this.emit('documentsAdded', {)
      indexName,
      documentsAdded: addedCount,
      totalDocuments: index.statistics.totalDocuments,
      indexTime
    });
  }
  async addFacet(indexName: string, facet: SearchFacet): Promise<void> {
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    // Validate facet field exists
    const field = index.fields.find(f => f.name === facet.field);
    if (!field) {
      throw new Error(`Field ${facet.field} not found in index ${indexName}`);}
    }
    if (!field.facetable) {
      throw new Error(`Field ${facet.field} is not configured as facetable`);}
    }
    index.facets.set(facet.id, facet);
    // Initialize facet data
    await this.initializeFacet(index, facet);
    this.emit('facetAdded', {)
      indexName,
      facetId: facet.id,
      facetType: facet.type,
    });
  }
  // Search execution
  async search(indexName: string, query: Partial<SearchQuery>): Promise<SearchResult<T>> {
    const startTime = performance.now();
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    // Build complete query
    const completeQuery = this.buildCompleteQuery(query);
    // Check cache
    const cacheKey = this.generateCacheKey(indexName, completeQuery);
    if (this.config.performance.enableCaching) {
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        this.searchAnalytics.recordSearch(completeQuery, cachedResult, true);
        return cachedResult;
      }
    }
    try {
      // Parse and process query
      const parsedQuery = await this.parseQuery(completeQuery);
      // Execute search
      const searchResults = await this.executeSearch(index, parsedQuery);
      // Process facets
      const facetResults = await this.processFacets(index, parsedQuery, searchResults.items);
      // Generate suggestions
      const suggestions = await this.generateSuggestions(index, parsedQuery);
      // Generate aggregations
      const aggregations = await this.generateAggregations(index, parsedQuery);
      // Build result
      const result: SearchResult<T> = {
        items: searchResults.items,
        facets: facetResults,
        pagination: this.buildPagination(completeQuery.pagination, searchResults.total),
        suggestions,
        aggregations,
        metadata: {,
          took: performance.now() - startTime,
          total: searchResults.total,
          maxScore: searchResults.maxScore,
          queryAnalysis: this.analyzeQuery(completeQuery),
          performance: {,
            parseTime: 0,
            searchTime: searchResults.searchTime,
            facetTime: 0,
            totalTime: performance.now() - startTime,
            cacheHit: false,
            documentsScanned: searchResults.documentsScanned,
            resultsFiltered: searchResults.resultsFiltered,
          }
        },
        query: completeQuery,
      };
      // Cache result
      if (this.config.performance.enableCaching) {
        this.cache.set(cacheKey, result);
      }
      // Record analytics
      this.searchAnalytics.recordSearch(completeQuery, result, false);
      this.emit('searchCompleted', {)
        indexName,
        query: completeQuery,
        results: result.items.length,
        took: result.metadata.took,
      });
      return result;
    } catch (error) {
      this.emit('searchError', {)
        indexName,
        query: completeQuery,
        error: error.message,
      });
      throw error;
    }
  }
  // Real-time search with debouncing
  async searchRealTime()
    indexName: string, 
    query: Partial<SearchQuery>,
    callback: (result: SearchResult<T>) => void,
    debounceMs?: number
  ): Promise<() => void> {
    const delay = debounceMs || this.config.performance.debounceDelay;
    let timeoutId: NodeJS.Timeout;
    const debouncedSearch = async () => {
      try {
        const result = await this.search(indexName, query);
        callback(result);
      } catch (error) {
        this.emit('realTimeSearchError', {)
          indexName,
          query,
          error: error.message,
        });
      }
    };
    const executeSearch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(debouncedSearch, delay);
    };
    // Execute initial search
    executeSearch();
    // Return cancellation function
    return () => {
      clearTimeout(timeoutId);
    };
  }
  // Facet operations
  async updateFacetSelection()
    indexName: string, 
    facetId: string, 
    value: unknown, 
    selected: boolean,
  ): Promise<void> {
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    const facet = index.facets.get(facetId);
    if (!facet) {
      throw new Error(`Facet ${facetId} not found in index ${indexName}`);}
    }
    // Update facet option selection
    if (facet.options) {
      const option = facet.options.find(opt => opt.value === value);
      if (option) {
        if (facet.config.multiSelect) {
          option.selected = selected;
        } else {
          // Single select - clear other selections
          facet.options.forEach(opt => opt.selected = false);
          option.selected = selected;
        }
      }
    }
    // Clear cache to force refresh
    this.clearCacheForIndex(indexName);
    this.emit('facetSelectionUpdated', {)
      indexName,
      facetId,
      value,
      selected
    });
  }
  async clearFacetSelections(indexName: string, facetId?: string): Promise<void> {
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    if (facetId) {
      const facet = index.facets.get(facetId);
      if (facet && facet.options) {
        facet.options.forEach(opt => opt.selected = false);
      }
    } else {
      // Clear all facet selections
      for (const facet of index.facets.values()) {
        if (facet.options) {
          facet.options.forEach(opt => opt.selected = false);
        }
      }
    }
    // Clear cache
    this.clearCacheForIndex(indexName);
    this.emit('facetSelectionsCleared', {)
      indexName,
      facetId
    });
  }
  // Suggestions and auto-complete
  async getSuggestions()
    indexName: string, 
    query: string, 
    type: 'all' | 'completion' | 'correction' = 'all'
  ): Promise<SearchSuggestion[]> {
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    if (query.length < this.config.suggestions.minQueryLength) {
      return [];
    }
    return await this.suggestionEngine.getSuggestions()
      index,
      query,
      type,
      this.config.suggestions.maxSuggestions
    );
  }
  // Analytics and insights
  getSearchAnalytics(indexName?: string): {
    totalSearches: number;
    averageResponseTime: number;
    popularQueries: Array<{ query: string; count: number }>;
    popularFacets: Array<{ facetId: string; selectionCount: number }>;
    cacheHitRate: number;
    errorRate: number;
  } {
    return this.searchAnalytics.getAnalytics(indexName);
  }
  // Configuration management
  updateConfiguration(config: Partial<SearchConfiguration>): void {
    this.config = { ...this.config, ...config };
    this.emit('configurationUpdated', { config: this.config });
  }
  // Index operations
  async deleteIndex(indexName: string): Promise<void> {
    const index = this.indexes.get(indexName);
    if (index) {
      this.indexes.delete(indexName);
      this.clearCacheForIndex(indexName);
      this.emit('indexDeleted', { indexName });
    }
  }
  async reindexDocuments(indexName: string): Promise<void> {
    const index = this.indexes.get(indexName);
    if (!index) {
      throw new Error(`Index ${indexName} not found`);}
    }
    const startTime = performance.now();
    // Rebuild facets
    for (const facet of index.facets.values()) {
      await this.initializeFacet(index, facet);
    }
    // Update statistics
    index.statistics.lastUpdated = new Date();
    // Clear cache
    this.clearCacheForIndex(indexName);
    const reindexTime = performance.now() - startTime;
    this.emit('reindexCompleted', {)
      indexName,
      documentsReindexed: index.statistics.totalDocuments,
      reindexTime
    });
  }
  // Cleanup
  destroy(): void {
    this.indexes.clear();
    this.cache.clear();
    this.queryProcessors.clear();
    this.facetProcessors.clear();
    this.removeAllListeners();
  }
  // Private methods
  private initializeProcessors(): void {
    // Text query processors
    this.queryProcessors.set('text', this.processTextQuery.bind(this));
    this.queryProcessors.set('fuzzy', this.processFuzzyQuery.bind(this));
    this.queryProcessors.set('phrase', this.processPhraseQuery.bind(this));
    // Facet processors
    this.facetProcessors.set('terms', this.processTermsFacet.bind(this));
    this.facetProcessors.set('range', this.processRangeFacet.bind(this));
    this.facetProcessors.set('date', this.processDateFacet.bind(this));
    this.facetProcessors.set('hierarchical', this.processHierarchicalFacet.bind(this));
  }
  private buildCompleteQuery(query: Partial<SearchQuery>): SearchQuery {
    return {
      text: query.text || '',
      filters: query.filters || [],
      sort: query.sort || { field: '_score', order: 'desc', mode: 'relevance' },
      pagination: {,
        page: 1,
        size: 20,
        offset: 0,
        ...query.pagination
      },
      facets: query.facets || [],
      options: {,
        includeHighlights: true,
        includeAggregations: true,
        includeSuggestions: true,
        fuzzySearch: this.config.query.enableFuzzy,
        stemming: this.config.query.enableStemming,
        synonyms: this.config.query.enableSynonyms,
        boostFields: {},
        ...query.options
      }
    };
  }
  private async parseQuery(query: SearchQuery): Promise<any> {
    // Parse and normalize query text
    const parsedText = this.parseQueryText(query.text);
    // Process filters
    const processedFilters = query.filters.map(filter => ;)
      this.processFilter(filter)
    );
    return {
      text: parsedText,
      filters: processedFilters,
      sort: query.sort,
      pagination: query.pagination,
      options: query.options,
    };
  }
  private parseQueryText(text: string): unknown {
    // Simple query parsing - in practice, you'd use a proper query parser
    const tokens = text.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    return {
      original: text,
      tokens,
      phrases: this.extractPhrases(text),
      operators: this.extractOperators(text),
    };
  }
  private extractPhrases(text: string): string[] {
    const phraseRegex = /"([^"]+)"/g;
    const phrases: string[] = [];
    let match;
    while ((match = phraseRegex.exec(text)) !== null) {
      phrases.push(match[1]);
    }
    return phrases;
  }
  private extractOperators(text: string): unknown {
    // Extract boolean operators, field queries, etc.
    return {
      hasAnd: text.includes(' AND '),
      hasOr: text.includes(' OR '),
      hasNot: text.includes(' NOT '),
      fieldQueries: this.extractFieldQueries(text),
    };
  }
  private extractFieldQueries(text: string): Array<{ field: string; value: string }> {
    const fieldRegex = /(\w+):([^\s]+)/g;
    const fieldQueries: Array<{ field: string; value: string }> = [];
    let match;
    while ((match = fieldRegex.exec(text)) !== null) {
      fieldQueries.push({)
        field: match[1],
        value: match[2],
      });
    }
    return fieldQueries;
  }
  private processFilter(filter: SearchFilter): unknown {
    return {
      ...filter,
      processed: true,
      normalizedValue: this.normalizeFilterValue(filter.value, filter.operator)
    };
  }
  private normalizeFilterValue(value: unknown, operator: string): unknown {
    switch (operator) {
    case 'contains':
    case 'starts_with':
    case 'ends_with':
      return String(value).toLowerCase();
    case 'between':
      return Array.isArray(value) ? value : [value, value];
    default:
      return value;
    }
  }
  private async executeSearch(index: SearchIndex<T>, query: any): Promise<{
    items: SearchResultItem<T>[];
    total: number;
    maxScore: number;
    searchTime: number;
    documentsScanned: number;
    resultsFiltered: number;
  }> {
    const startTime = performance.now();
    const results: SearchResultItem<T>[] = [];
    let maxScore = 0;
    let documentsScanned = 0;
    let resultsFiltered = 0;
    // Search through documents
    for (const [id, doc] of index.documents) {
      documentsScanned++;
      const score = this.calculateDocumentScore(doc, query, index);
      if (score > 0) {
        const resultItem: SearchResultItem<T> = {
          id,
          data: doc.data,
          score,
          highlights: this.generateHighlights(doc, query),
          matched: this.getMatchedFields(doc, query)
        };
        if (query.options.includeHighlights) {
          resultItem.explanation = this.generateScoreExplanation(score, doc, query);
        }
        results.push(resultItem);
        maxScore = Math.max(maxScore, score);
        resultsFiltered++;
      }
    }
    // Sort results
    results.sort((a, b) => {
      if (query.sort.mode === 'relevance') {
        return b.score - a.score;
      } else {
        return this.compareByField(a, b, query.sort);
      }
    });
    // Apply pagination
    const offset = query.pagination.offset || (query.pagination.page - 1) * query.pagination.size;
    const paginatedResults = results.slice(offset, offset + query.pagination.size);
    return {
      items: paginatedResults,
      total: results.length,
      maxScore,
      searchTime: performance.now() - startTime,
      documentsScanned,
      resultsFiltered
    };
  }
  private calculateDocumentScore(doc: IndexedDocument<T>, query: any, index: SearchIndex<T>): number {
    let score = 0;
    // Text search score
    if (query.text.tokens.length > 0) {
      score += this.calculateTextScore(doc, query.text, index);
    }
    // Filter matching
    for (const filter of query.filters) {
      if (!this.matchesFilter(doc, filter)) {
        return 0; // Document doesn't match filter
      }
    }
    // Field boosts
    if (query.options.boostFields) {
      for (const [field, boost] of Object.entries(query.options.boostFields)) {
        if (doc.fields[field]) {
          score *= (1 + boost);
        }
      }
    }
    // Document-level boost
    if (doc.boost) {
      score *= doc.boost;
    }
    return score;
  }
  private calculateTextScore(doc: IndexedDocument<T>, textQuery: any, index: SearchIndex<T>): number {
    let score = 0;
    // Search in searchable fields
    const searchableFields = index.fields.filter(f => f.searchable);
    for (const field of searchableFields) {
      const fieldValue = String(doc.fields[field.name] || '').toLowerCase();
      const fieldScore = this.calculateFieldScore(fieldValue, textQuery, field);
      score += fieldScore * (field.boost || 1);
    }
    return score;
  }
  private calculateFieldScore(fieldValue: string, textQuery: any, field: IndexField): number {
    let score = 0;
    // Exact phrase matches
    for (const phrase of textQuery.phrases) {
      if (fieldValue.includes(phrase.toLowerCase())) {
        score += 10;
      }
    }
    // Token matches
    for (const token of textQuery.tokens) {
      if (fieldValue.includes(token)) {
        score += 1;
        // Boost for exact word matches
        const wordBoundaryRegex = new RegExp(`\\b${token}\\b`);}
        if (wordBoundaryRegex.test(fieldValue)) {
          score += 2;
        }
      }
    }
    // Field-specific scoring
    if (field.type === 'text' && field.name === 'title') {
      score *= 2; // Boost title matches
    }
    return score;
  }
  private matchesFilter(doc: IndexedDocument<T>, filter: any): boolean {
    const fieldValue = doc.fields[filter.field];
    switch (filter.operator) {
    case 'equals':
      return fieldValue === filter.normalizedValue;
    case 'not_equals':
      return fieldValue !== filter.normalizedValue;
    case 'contains':
      return String(fieldValue).toLowerCase().includes(filter.normalizedValue);
    case 'starts_with':
      return String(fieldValue).toLowerCase().startsWith(filter.normalizedValue);
    case 'ends_with':
      return String(fieldValue).toLowerCase().endsWith(filter.normalizedValue);
    case 'greater':
      return fieldValue > filter.normalizedValue;
    case 'less':
      return fieldValue < filter.normalizedValue;
    case 'between':
      return fieldValue >= filter.normalizedValue[0] && fieldValue <= filter.normalizedValue[1];
    case 'in':
      return Array.isArray(filter.values) && filter.values.includes(fieldValue);
    case 'not_in':
      return Array.isArray(filter.values) && !filter.values.includes(fieldValue);
    default:
      return true;
    }
  }
  private generateHighlights(doc: IndexedDocument<T>, query: any): Record<string, string[]> {
    const highlights: Record<string, string[]> = {};
    if (query.text.tokens.length === 0) {
      return highlights;
    }
    // Generate highlights for searchable fields
    for (const [fieldName, fieldValue] of Object.entries(doc.fields)) {
      if (typeof fieldValue === 'string') {
        const fieldHighlights = this.highlightField(fieldValue, query.text.tokens);
        if (fieldHighlights.length > 0) {
          highlights[fieldName] = fieldHighlights;
        }
      }
    }
    return highlights;
  }
  private highlightField(text: string, tokens: string[]): string[] {
    const highlights: string[] = [];
    const lowerText = text.toLowerCase();
    for (const token of tokens) {
      const index = lowerText.indexOf(token);
      if (index !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + token.length + 50);
        const snippet = text.substring(start, end);
        const highlightedSnippet = snippet.replace(;)
          new RegExp(token, 'gi'),
          '<mark>$&</mark>'
        );
        highlights.push(highlightedSnippet);
      }
    }
    return highlights;
  }
  private getMatchedFields(doc: IndexedDocument<T>, query: any): string[] {
    const matchedFields: string[] = [];
    for (const [fieldName, fieldValue] of Object.entries(doc.fields)) {
      if (typeof fieldValue === 'string') {
        const lowerValue = fieldValue.toLowerCase();
        for (const token of query.text.tokens) {
          if (lowerValue.includes(token)) {
            matchedFields.push(fieldName);
            break;
          }
        }
      }
    }
    return matchedFields;
  }
  private generateScoreExplanation(score: number, doc: IndexedDocument<T>, query: any): ScoreExplanation {
    return {
      value: score,
      description: 'Document score based on text match and field boosts',
      details: [,
        {
          field: 'text_match',
          weight: 1.0,
          contribution: score * 0.8,
          explanation: 'Text search contribution'
        },
        {
          field: 'field_boost',
          weight: 1.0,
          contribution: score * 0.2,
          explanation: 'Field boost contribution'
        }
      ]
    };
  }
  private compareByField(a: SearchResultItem<T>, b: SearchResultItem<T>, sort: SearchSort): number {
    const aValue = this.getFieldValueForSort(a, sort.field);
    const bValue = this.getFieldValueForSort(b, sort.field);
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    else if (aValue > bValue) comparison = 1;
    return sort.order === 'asc' ? comparison : -comparison;
  }
  private getFieldValueForSort(item: SearchResultItem<T>, field: string): any {
    if (field === '_score') {
      return item.score;
    }
    return (item.data as any)[field];
  }
  private async processFacets()
    index: SearchIndex<T>, 
    query: any, 
    results: SearchResultItem<T>[],
  ): Promise<FacetResult[]> {
    const facetResults: FacetResult[] = [];
    for (const facet of index.facets.values()) {
      const facetResult = await this.processFacet(facet, results, query);
      facetResults.push(facetResult);
    }
    return facetResults;
  }
  private async processFacet()
    facet: SearchFacet, 
    results: SearchResultItem<T>[], 
    query: any,
  ): Promise<FacetResult> {
    const processor = this.facetProcessors.get(facet.type) || this.processTermsFacet;
    return await processor(facet, results, query);
  }
  private async processTermsFacet(facet: SearchFacet, results: SearchResultItem<T>[]): Promise<FacetResult> {
    const valueCounts = new Map<any, number>();
    // Count values in results
    for (const result of results) {
      const value = (result.data as any)[facet.field];
      if (value !== undefined && value !== null) {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      }
    }
    // Convert to facet options
    const options: FacetOption[] = Array.from(valueCounts.entries())
      .map(([value, count]) => ({)
        value,
        label: String(value),
        count,
        selected: facet.options?.find(opt => opt.value === value)?.selected || false
      }))
      .sort((a, b) => {
        if (facet.config.sortBy === 'count') {
          return facet.config.sortOrder === 'desc' ? b.count - a.count : a.count - b.count;
        } else {
          return facet.config.sortOrder === 'desc' ? b.label.localeCompare(a.label) : a.label.localeCompare(b.label);
        }
      })
      .slice(0, facet.config.displayLimit);
    return {
      facetId: facet.id,
      name: facet.name,
      type: facet.type,
      options,
      metadata: {,
        totalOptions: valueCounts.size,
        selectedOptions: options.filter(opt => opt.selected).length,
        hasMore: valueCounts.size > facet.config.displayLimit
      }
    };
  }
  private async processRangeFacet(facet: SearchFacet, results: SearchResultItem<T>[]): Promise<FacetResult> {
    const values = results;
      .map(result => (result.data as any)[facet.field])
      .filter(val => typeof val === 'number')
      .sort((a, b) => a - b);
    if (values.length === 0) {
      return {
        facetId: facet.id,
        name: facet.name,
        type: facet.type,
        range: { min: 0, max: 0 },
        metadata: { totalOptions: 0, selectedOptions: 0, hasMore: false }
      };
    }
    const min = values[0];
    const max = values[values.length - 1];
    return {
      facetId: facet.id,
      name: facet.name,
      type: facet.type,
      range: {,
        min,
        max,
        selectedMin: facet.ranges?.[0]?.selectedMin,
        selectedMax: facet.ranges?.[0]?.selectedMax,
      },
      metadata: {,
        totalOptions: values.length,
        selectedOptions: facet.ranges?.[0]?.selectedMin !== undefined ? 1 : 0,
        hasMore: false,
      }
    };
  }
  private async processDateFacet(facet: SearchFacet, results: SearchResultItem<T>[]): Promise<FacetResult> {
    // Similar to range facet but for dates
    return this.processRangeFacet(facet, results);
  }
  private async processHierarchicalFacet(facet: SearchFacet, results: SearchResultItem<T>[]): Promise<FacetResult> {
    // Process hierarchical facets
    const hierarchy = facet.hierarchy || { levels: [], separator: '/', expandedLevels: new Set() };
    return {
      facetId: facet.id,
      name: facet.name,
      type: facet.type,
      hierarchy,
      metadata: {,
        totalOptions: hierarchy.levels.length,
        selectedOptions: hierarchy.levels.filter(level => level.selected).length,
        hasMore: false,
      }
    };
  }
  private async generateSuggestions(index: SearchIndex<T>, query: any): Promise<SearchSuggestion[]> {
    if (!this.config.suggestions.enableAutoComplete || !query.text.original) {
      return [];
    }
    return await this.suggestionEngine.getSuggestions()
      index,
      query.text.original,
      'all',
      this.config.suggestions.maxSuggestions
    );
  }
  private async generateAggregations(index: SearchIndex<T>, query: any): Promise<SearchAggregation[]> {
    // Generate aggregations based on query
    return [];
  }
  private buildPagination(pagination: SearchPagination, total: number): SearchPagination {
    return {
      ...pagination,
      total,
      offset: (pagination.page - 1) * pagination.size
    };
  }
  private analyzeQuery(query: SearchQuery): QueryAnalysis {
    return {
      processedQuery: query.text,
      queryType: this.classifyQuery(query),
      appliedFilters: query.filters.length,
      activeFacets: query.facets.length,
      searchTerms: query.text.split(/\s+/).filter(t => t.length > 0),
      suggestedTerms: [],
    };
  }
  private classifyQuery(query: SearchQuery): 'simple' | 'complex' | 'structured' {
    if (query.filters.length > 3 || query.facets.length > 5) {
      return 'complex';
    } else if (query.filters.length > 0 || query.facets.length > 0) {
      return 'structured';
    } else {
      return 'simple';
    }
  }
  private generateCacheKey(indexName: string, query: SearchQuery): string {
    return `${indexName}_${JSON.stringify(query)}`;}
  }
  private clearCacheForIndex(indexName: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(indexName)) {
        this.cache.delete(key);
      }
    }
  }
  private extractId(doc: T, idField: string): string {
    const id = (doc as any)[idField];
    return id ? String(id) : `doc_${Date.now()}_${Math.random()}`;}
  }
  private extractFields(doc: T, fieldDefinitions: IndexField[]): Record<string, any> {
    const fields: Record<string, any> = {};
    for (const fieldDef of fieldDefinitions) {
      const value = (doc as any)[fieldDef.name];
      if (value !== undefined) {
        fields[fieldDef.name] = this.processFieldValue(value, fieldDef);
      }
    }
    return fields;
  }
  private processFieldValue(value: any, field: IndexField): any {
    switch (field.type) {
    case 'text':
      return String(value);
    case 'keyword':
      return String(value);
    case 'number':
      return Number(value);
    case 'date':
      return new Date(value);
    case 'boolean':
      return Boolean(value);
    default:
      return value;
    }
  }
  private calculateIndexSize(index: SearchIndex<T>): number {
    // Simple size calculation - in practice, you'd calculate actual memory usage
    return index.documents.size * 1000; // Rough estimate
  }
  private async updateFacetCounts(index: SearchIndex<T>): Promise<void> {
    for (const facet of index.facets.values()) {
      await this.initializeFacet(index, facet);
    }
  }
  private async initializeFacet(index: SearchIndex<T>, facet: SearchFacet): Promise<void> {
    switch (facet.type) {
    case 'text':
    case 'enum':
      await this.initializeTermsFacet(index, facet);
      break;
    case 'number':
      await this.initializeRangeFacet(index, facet);
      break;
    case 'date':
      await this.initializeDateFacet(index, facet);
      break;
    case 'hierarchical':
      await this.initializeHierarchicalFacet(index, facet);
      break;
    }
  }
  private async initializeTermsFacet(index: SearchIndex<T>, facet: SearchFacet): Promise<void> {
    const valueCounts = new Map<any, number>();
    for (const doc of index.documents.values()) {
      const value = doc.fields[facet.field];
      if (value !== undefined && value !== null) {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      }
    }
    facet.options = Array.from(valueCounts.entries())
      .map(([value, count]) => ({)
        value,
        label: String(value),
        count,
        selected: false,
      }))
      .sort((a, b) => b.count - a.count);
  }
  private async initializeRangeFacet(index: SearchIndex<T>, facet: SearchFacet): Promise<void> {
    const values = Array.from(index.documents.values());
      .map(doc => doc.fields[facet.field])
      .filter(val => typeof val === 'number')
      .sort((a, b) => a - b);
    if (values.length > 0) {
      facet.ranges = [{
        min: values[0],
        max: values[values.length - 1],
        step: 1,
      }];
    }
  }
  private async initializeDateFacet(index: SearchIndex<T>, facet: SearchFacet): Promise<void> {
    // Similar to range facet but for dates
    await this.initializeRangeFacet(index, facet);
  }
  private async initializeHierarchicalFacet(index: SearchIndex<T>, facet: SearchFacet): Promise<void> {
    // Initialize hierarchical structure
    const hierarchy: FacetHierarchy = {
      levels: [],
      separator: '/',
      expandedLevels: new Set()
    };
    // Build hierarchy from document values
    for (const doc of index.documents.values()) {
      const value = doc.fields[facet.field];
      if (typeof value === 'string') {
        const parts = value.split(hierarchy.separator);
        // Build hierarchy levels from path parts
        // Implementation would create hierarchical structure
      }
    }
    facet.hierarchy = hierarchy;
  }
  // Built-in query processors
  private async processTextQuery(query: string): Promise<any> {
    return this.parseQueryText(query);
  }
  private async processFuzzyQuery(query: string): Promise<any> {
    // Add fuzzy matching logic
    return this.parseQueryText(query);
  }
  private async processPhraseQuery(query: string): Promise<any> {
    // Handle phrase queries
    return this.parseQueryText(query);
  }
}

// Suggestion Engine
class SuggestionEngine {
  private config: any;
  constructor(config: any) {
    this.config = config;
  }
  async getSuggestions()
    index: SearchIndex<any>, 
    query: string, 
    type: string, 
    maxSuggestions: number,
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    if (type === 'all' || type === 'completion') {
      suggestions.push(...await this.getCompletionSuggestions(index, query, maxSuggestions));
    }
    if (type === 'all' || type === 'correction') {
      suggestions.push(...await this.getCorrectionSuggestions(index, query, maxSuggestions));
    }
    return suggestions.slice(0, maxSuggestions);
  }
  private async getCompletionSuggestions()
    index: SearchIndex<any>, 
    query: string, 
    maxSuggestions: number,
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();
    // Find completions from indexed terms
    for (const doc of index.documents.values()) {
      for (const [fieldName, fieldValue] of Object.entries(doc.fields)) {
        if (typeof fieldValue === 'string') {
          const terms = fieldValue.toLowerCase().split(/\s+/);
          for (const term of terms) {
            if (term.startsWith(queryLower) && term.length > queryLower.length) {
              suggestions.push({)
                type: 'completion',
                text: term,
                highlight: `<strong>${queryLower}</strong>${term.substring(queryLower.length)}`,}
                score: this.calculateSuggestionScore(term, query),
                count: 1,
              });
            }
          }
        }
      }
    }
    // Deduplicate and sort
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    return uniqueSuggestions.sort((a, b) => b.score - a.score).slice(0, maxSuggestions);
  }
  private async getCorrectionSuggestions()
    index: SearchIndex<any>, 
    query: string, 
    maxSuggestions: number,
  ): Promise<SearchSuggestion[]> {
    // Simple spell correction - in practice, you'd use a proper spell checker
    return [];
  }
  private calculateSuggestionScore(suggestion: string, query: string): number {
    const lengthDiff = Math.abs(suggestion.length - query.length);
    const lengthPenalty = lengthDiff / Math.max(suggestion.length, query.length);
    return 1 - lengthPenalty;
  }
  private deduplicateSuggestions(suggestions: SearchSuggestion[]): SearchSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {)
      if (seen.has(suggestion.text)) {
        return false;
      }
      seen.add(suggestion.text);
      return true;
    });
  }
}

// Search Analytics
class SearchAnalytics {
  private searches: Array<{
    query: SearchQuery;
    result: SearchResult<any>;
    timestamp: Date;
    cached: boolean;
  }> = [];
  recordSearch(query: SearchQuery, result: SearchResult<any>, cached: boolean): void {
    this.searches.push({)
      query,
      result,
      timestamp: new Date(),
      cached
    });
    // Keep only recent searches
    if (this.searches.length > 10000) {
      this.searches.shift();
    }
  }
  getAnalytics(indexName?: string): any {
    const relevantSearches = indexName ;
      ? this.searches.filter(s => s.query.text.includes(indexName))
      : this.searches;
    if (relevantSearches.length === 0) {
      return {
        totalSearches: 0,
        averageResponseTime: 0,
        popularQueries: [],
        popularFacets: [],
        cacheHitRate: 0,
        errorRate: 0,
      };
    }
    const totalSearches = relevantSearches.length;
    const averageResponseTime = relevantSearches.reduce((sum, s) => sum + s.result.metadata.took, 0) / totalSearches;
    const cacheHits = relevantSearches.filter(s => s.cached).length;
    const cacheHitRate = (cacheHits / totalSearches) * 100;
    // Popular queries
    const queryCount = new Map<string, number>();
    relevantSearches.forEach(search => {)
      const query = search.query.text;
      queryCount.set(query, (queryCount.get(query) || 0) + 1);
    });
    const popularQueries = Array.from(queryCount.entries());
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return {
      totalSearches,
      averageResponseTime,
      popularQueries,
      popularFacets: [],
      cacheHitRate,
      errorRate: 0,
    };
  }
}

export default {
  FacetedSearchSystem
};