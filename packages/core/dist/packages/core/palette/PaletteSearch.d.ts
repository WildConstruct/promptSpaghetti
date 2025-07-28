import { NodeMeta } from '../Palette';
/**
 * Search result with relevance scoring
 */
export interface SearchResult {
    node: NodeMeta;
    relevance: number;
    matchedFields: string;
    categories: string;
}
export interface SearchOptions {
    fuzzyThreshold?: number;
    maxResults?: number;
    includeCategories?: boolean;
    sortByRelevance?: boolean;
    minimumRelevance?: number;
    /**
    * Default search options
    */
    const: any;
    DEFAULT_SEARCH_OPTIONS: Required<SearchOptions>;
}
export declare class PaletteSearch {
    private nodes;
    private searchIndex;
    constructor(nodes: NodeMeta);
    /**
     * Update nodes and rebuild search index
     */
    updateNodes(nodes: NodeMeta): void;
    /**
     * Perform search with relevance scoring
     */
    search(query: string, options?: SearchOptions): SearchResult;
    /**
     * Get search suggestions based on partial query
     */
    getSuggestions(partialQuery: string, maxSuggestions?: number): string;
    /**
     * Search within specific categories
     */
    searchInCategories(query: string, categoryIds: string, options?: SearchOptions): SearchResult;
    /**
     * Get popular search terms
     */
    getPopularTerms(limit?: number): string;
    /**
     * Parse search query into terms
     */
    private parseQuery;
    /**
     * Search individual node
     */
    private searchNode;
    /**
     * Calculate fuzzy matching score using Levenshtein distance
     */
    private calculateFuzzyScore;
    /**
    * Calculate Levenshtein distance between two strings
    */
    private levenshteinDistance;
    /**
    * Build search index for efficient searching
    */
    private buildSearchIndex;
}
//# sourceMappingURL=PaletteSearch.d.ts.map