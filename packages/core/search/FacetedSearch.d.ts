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
    value: any;
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
        value: any;
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
    value: any;
    values?: any[];
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
    key: any;
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
    took: number;
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
    indexSize: number;
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
export declare class FacetedSearchSystem<T = any> extends EventEmitter {
    private indexes;
    private cache;
    private config;
    private queryProcessors;
    private facetProcessors;
    private suggestionEngine;
    private searchAnalytics;
    constructor(config?: Partial<SearchConfiguration>);
    createIndex(name: string, fields: IndexField[], configuration?: Partial<IndexConfiguration>): Promise<void>;
    addDocuments(indexName: string, documents: T[], idField?: string): Promise<void>;
    addFacet(indexName: string, facet: SearchFacet): Promise<void>;
    search(indexName: string, query: Partial<SearchQuery>): Promise<SearchResult<T>>;
    searchRealTime(indexName: string, query: Partial<SearchQuery>, callback: (result: SearchResult<T>) => void, debounceMs?: number): Promise<() => void>;
    updateFacetSelection(indexName: string, facetId: string, value: any, selected: boolean): Promise<void>;
    clearFacetSelections(indexName: string, facetId?: string): Promise<void>;
    getSuggestions(indexName: string, query: string, type?: 'all' | 'completion' | 'correction'): Promise<SearchSuggestion[]>;
    getSearchAnalytics(indexName?: string): {
        totalSearches: number;
        averageResponseTime: number;
        popularQueries: Array<{,
            query: string;
            count: number;
        }>;
        popularFacets: Array<{,
            facetId: string;
            selectionCount: number;
        }>;
        cacheHitRate: number;
        errorRate: number;
    };
    updateConfiguration(config: Partial<SearchConfiguration>): void;
    deleteIndex(indexName: string): Promise<void>;
    reindexDocuments(indexName: string): Promise<void>;
    destroy(): void;
    private initializeProcessors;
    private buildCompleteQuery;
    private parseQuery;
    private parseQueryText;
    private extractPhrases;
    private extractOperators;
    private extractFieldQueries;
    private processFilter;
    private normalizeFilterValue;
    private executeSearch;
    private calculateDocumentScore;
    private calculateTextScore;
    private calculateFieldScore;
    private matchesFilter;
    private generateHighlights;
    private highlightField;
    private getMatchedFields;
    private generateScoreExplanation;
    private compareByField;
    private getFieldValueForSort;
    private processFacets;
    private processFacet;
    private processTermsFacet;
    private processRangeFacet;
    private processDateFacet;
    private processHierarchicalFacet;
    private generateSuggestions;
    private generateAggregations;
    private buildPagination;
    private analyzeQuery;
    private classifyQuery;
    private generateCacheKey;
    private clearCacheForIndex;
    private extractId;
    private extractFields;
    private processFieldValue;
    private calculateIndexSize;
    private updateFacetCounts;
    private initializeFacet;
    private initializeTermsFacet;
    private initializeRangeFacet;
    private initializeDateFacet;
    private initializeHierarchicalFacet;
    private processTextQuery;
    private processFuzzyQuery;
    private processPhraseQuery;
}
declare const _default: {
    FacetedSearchSystem: typeof FacetedSearchSystem;
};
export default _default;
//# sourceMappingURL=FacetedSearch.d.ts.map