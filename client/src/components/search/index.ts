/**
 * Search System Exports
 * 
 * FILE-985116-5A41: Build Search and Filter System
 * 
 * Centralized exports for the complete search and filter system.
 * Provides both individual components and the unified system.
 */

// Main unified system
export { default as UnifiedSearchSystem } from './UnifiedSearchSystem';
export type { UnifiedSearchSystemProps } from './UnifiedSearchSystem';

// Individual components
export { default as SearchBar } from './SearchBar';
export { default as FilterPanel } from './FilterPanel';
export { default as SearchResults } from './SearchResults';

// Context and types
export {
  SearchProvider,
  useSearch,
  type SearchQuery,
  type SearchResult,
  type FilterCondition,
  type FilterOperator,
  type SortCondition,
  type SortDirection,
  type SavedSearch
} from './SearchContext';

// Re-export for convenience
export {
  SearchProvider as SearchContextProvider,
  UnifiedSearchSystem as SearchSystem
} from './UnifiedSearchSystem';