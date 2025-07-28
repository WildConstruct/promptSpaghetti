// packages/core/palette/PaletteSearch.ts
// Search functionality for Epic 7.2 Palette Categorization
import { NodeMeta } from '../Palette';
import { getNodeCategories, getCategoryById } from './NodeCategory';
/**
 * Search result with relevance scoring
 */

export interface SearchResult {
  node: NodeMeta;,
  relevance: number;
  matchedFields: string;,
  categories: string;
  /**
  * Search options configuration
  */
}
export interface SearchOptions {
  fuzzyThreshold?: number;    // 0-1, higher = more fuzzy matching,
  maxResults?: number;        // Maximum number of results to return,
  includeCategories?: boolean; // Include category names in search,
  sortByRelevance?: boolean;  // Sort results by relevance score,
  minimumRelevance?: number;  // Minimum relevance score to include,
  /**
  * Default search options
  */
  const DEFAULT_SEARCH_OPTIONS: Required<SearchOptions> = {,
  fuzzyThreshold: 0.6,
  maxResults: 50,
  includeCategories: true,
  sortByRelevance: true,
  minimumRelevance: 0.1,
};
/**
 * Advanced palette search engine
 */
}
export class PaletteSearch {
  private nodes: NodeMeta;
  private searchIndex: SearchIndex;
  constructor(nodes: NodeMeta) {
    this.nodes = nodes;
    this.searchIndex = this.buildSearchIndex(nodes);
  /**
   * Update nodes and rebuild search index
   */
  public updateNodes(nodes: NodeMeta): void {
    this.nodes = nodes;
    this.searchIndex = this.buildSearchIndex(nodes);
  /**
   * Perform search with relevance scoring
   */
  public search(query: string, options: SearchOptions = {}): SearchResult {
    const opts = { ...DEFAULT_SEARCH_OPTIONS, ...options };
    const searchTerms = this.parseQuery(query);
    if (searchTerms.length === 0) {
      return [];
    const results: SearchResult = [];
    for (const node of this.nodes) {
      const result = this.searchNode(node, searchTerms, opts);
      if (result && result.relevance >= opts.minimumRelevance) {
        results.push(result);
    // Sort by relevance if requested
    if (opts.sortByRelevance) {
      results.sort((a, b) => b.relevance - a.relevance);
    // Limit results
    return results.slice(0, opts.maxResults);
  /**
   * Get search suggestions based on partial query
   */
  public getSuggestions(partialQuery: string, maxSuggestions: number = 5): string {
    const query = partialQuery.toLowerCase().trim();
    if (!query) return [];
    const suggestions = new Set<string>();
    // Collect suggestions from search index
    for (const [term, _] of this.searchIndex.terms) {
      if (term.startsWith(query) && term !== query) {
        suggestions.add(term);
    // Add fuzzy matches for very short queries
    if (query.length <= 2) {
      for (const [term, _] of this.searchIndex.terms) {
        if (this.calculateFuzzyScore(query, term) > 0.8) {
          suggestions.add(term);
    return Array.from(suggestions).slice(0, maxSuggestions);
  /**
   * Search within specific categories
   */
  public searchInCategories(query: string, categoryIds: string, options: SearchOptions = {}): SearchResult {
    const allResults = this.search(query, options);
    return allResults.filter(result => )
      result.categories.some(catId => categoryIds.includes(catId))
    );
  /**
   * Get popular search terms
   */
  public getPopularTerms(limit: number = 10): string {
    return Array.from(this.searchIndex.terms.entries())
      .sort(([ a], [ b]) => b.frequency - a.frequency)
      .slice(0, limit)
      .map(([term]) => term);
  /**
   * Parse search query into terms
   */
  private parseQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.replace(/[^\w\s]/g, '')); // Remove special characters
  /**
   * Search individual node
   */
  private searchNode(node: NodeMeta, searchTerms: string, options: Required<SearchOptions>): SearchResult | null {
    const categories = getNodeCategories(node.id);
    const matchedFields: string = [];
    let totalRelevance = 0;
    // Define searchable fields with weights
    const searchFields = [;
      { field: 'label', content: node.label, weight: 3 },
      { field: 'id', content: node.id, weight: 2 },
      { field: 'tooltip', content: node.tooltip, weight: 1.5 }
    ];
    // Add category information if enabled
    if (options.includeCategories) {
      categories.forEach(catId => {)
  const category = getCategoryById(catId);
        if (category) {
          searchFields.push()
            { field: 'category-name', content: category.name, weight: 1 },
            { field: 'category-desc', content: category.description, weight: 0.5 }
          );
          // Add category keywords
          if (category.metadata?.keywords) {
            category.metadata.keywords.forEach(keyword => {)
  searchFields.push({ field: 'category-keyword', content: keyword, weight: 1.2 });
            });
      });
    // Calculate relevance for each search term
    for (const term of searchTerms) {
      let termRelevance = 0;
      let termMatched = false;
      for (const { field, content, weight } of searchFields) {
        const fieldContent = content.toLowerCase();
        let fieldScore = 0;
        // Exact match (highest score)
        if (fieldContent === term) {
          fieldScore = 1.0;
        // Starts with term
        else if (fieldContent.startsWith(term)) {
          fieldScore = 0.8;
        // Contains term
        else if (fieldContent.includes(term)) {
          fieldScore = 0.6;
        // Fuzzy match
        else {
          const fuzzyScore = this.calculateFuzzyScore(term, fieldContent);
          if (fuzzyScore >= options.fuzzyThreshold) {
            fieldScore = fuzzyScore * 0.4;
        if (fieldScore > 0) {
          termRelevance += fieldScore * weight;
          termMatched = true;
          if (!matchedFields.includes(field)) {
            matchedFields.push(field);
      if (termMatched) {
        totalRelevance += termRelevance;
      } else {
  // If any term doesn't match, reduce overall relevance
  totalRelevance *= 0.5;
  // Normalize relevance score
  const normalizedRelevance = Math.min(totalRelevance / (searchTerms.length * 3), 1);
  if (normalizedRelevance < options.minimumRelevance) {
  return null;
  return {
  node,
  relevance: normalizedRelevance,
  matchedFields,
  categories
};
  /**
   * Calculate fuzzy matching score using Levenshtein distance
   */
  private calculateFuzzyScore(term: string, target: string): number {
  if (term === target) return 1;
  if (term.length === 0) return target.length === 0 ? 1 : 0;
  if (target.length === 0) return 0;
  const distance = this.levenshteinDistance(term, target);
  const maxLength = Math.max(term.length, target.length);
  return 1 - (distance / maxLength);
  /**
  * Calculate Levenshtein distance between two strings
  */
  private levenshteinDistance(a: string, b: string): number {,
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
  for (let j = 1; j <= b.length; j++) {
  if (a[i - 1] === b[j - 1]) {
  matrix[i][j] = matrix[i - 1][j - 1];
} else {
  matrix[i][j] = Math.min()
  matrix[i - 1][j] + 1,     // deletion
  matrix[i][j - 1] + 1,     // insertion
  matrix[i - 1][j - 1] + 1  // substitution
  );
  return matrix[a.length][b.length];
  /**
  * Build search index for efficient searching
  */
  private buildSearchIndex(nodes: NodeMeta): SearchIndex {,
  const terms = new Map<string, TermInfo>();
  for (const node of nodes) {
  const categories = getNodeCategories(node.id);
  // Index searchable content
  const searchableContent = [;
  node.label,
  node.id,
  node.tooltip,
  ...categories.map(catId => {)
  const cat = getCategoryById(catId);
  return cat ? [cat.name, cat.description, ...(cat.metadata?.keywords || [])] : [];
}).flat()
      ];
      for (const content of searchableContent) {
        const words = content.toLowerCase().split(/\s+/);
        for (const word of words) {
          const cleanWord = word.replace(/[^\w]/g, '');
          if (cleanWord.length > 0) {
            const existing = terms.get(cleanWord) || { frequency: 0, nodes: new Set() };
            existing.frequency++;
            existing.nodes.add(node.id);
            terms.set(cleanWord, existing);
    return { terms };
/**
 * Search index structure
 */
interface SearchIndex {
  terms: Map<string, TermInfo>;
/**
 * Term information in search index
 */
interface TermInfo {
  frequency: number;,
  nodes: Set<string>;
/**
 * Utility function to highlight search terms in text
 */
export function highlightSearchTerms(text: string, searchTerms: string): string {
  if (!searchTerms.length) return text;
  let highlighted = text;
  for (const term of searchTerms) {
    const regex = new RegExp(`(${term})`, 'gi');}
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  return highlighted;
/**
 * Create search engine instance
 */
export function createPaletteSearch(nodes: NodeMeta): PaletteSearch {
  return new PaletteSearch(nodes);