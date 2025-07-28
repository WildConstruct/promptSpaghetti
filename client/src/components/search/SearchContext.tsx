/**
 * Search and Filter Context
 * 
 * FILE-985116-5A41: Build Search and Filter System
 * 
 * Provides a unified search and filter context that can be used across
 * different components like file browsers, admin dashboards, and data tables.
 * Supports advanced filtering, sorting, faceted search, and search history.
 */
import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Search and Filter Types
export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between' | 'in' | 'regex';

export type SortDirection = 'asc' | 'desc';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
  values?: unknown[]; // For 'in' and 'between' operators
}

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export interface SearchQuery {
  text: string;
  filters: FilterCondition[];
  sorts: SortCondition[];
  facets?: string[];
}

export interface SearchResult<T = unknown> {
  items: T[];
  totalCount: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
  executionTime?: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: SearchQuery;
  createdAt: string;
  lastUsedAt: string;
}

// Search State
interface SearchState {
  currentQuery: SearchQuery;
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  searchHistory: SearchQuery[];
  savedSearches: SavedSearch[];
  quickFilters: Record<string, FilterCondition[]>;
}

// Search Actions
type SearchAction =
  | { type: 'SET_QUERY'; payload: Partial<SearchQuery> }
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'ADD_FILTER'; payload: FilterCondition }
  | { type: 'REMOVE_FILTER'; payload: number }
  | { type: 'UPDATE_FILTER'; payload: { index: number; filter: FilterCondition } }
  | { type: 'SET_FILTERS'; payload: FilterCondition[] }
  | { type: 'ADD_SORT'; payload: SortCondition }
  | { type: 'REMOVE_SORT'; payload: number }
  | { type: 'SET_SORTS'; payload: SortCondition[] }
  | { type: 'SET_RESULTS'; payload: SearchResult }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TO_HISTORY'; payload: SearchQuery }
  | { type: 'SAVE_SEARCH'; payload: SavedSearch }
  | { type: 'REMOVE_SAVED_SEARCH'; payload: string }
  | { type: 'CLEAR_RESULTS' }
  | { type: 'RESET_QUERY' };

// Initial state
const initialState: SearchState = {
  currentQuery: {,
    text: '',
    filters: [],
    sorts: [],
    facets: [],
  },
  results: null,
  isLoading: false,
  error: null,
  searchHistory: [],
  savedSearches: [],
  quickFilters: {}
};

// Reducer
const searchReducer = (state: SearchState, action: SearchAction): SearchState => {
  switch (action.type) {
  case 'SET_QUERY':
    return {
      ...state,
      currentQuery: { ...state.currentQuery, ...action.payload }
    };
  case 'SET_TEXT':
    return {
      ...state,
      currentQuery: { ...state.currentQuery, text: action.payload }
    };
  case 'ADD_FILTER':
    return {
      ...state,
      currentQuery: {,
        ...state.currentQuery,
        filters: [...state.currentQuery.filters, action.payload]
      }
    };
  case 'REMOVE_FILTER':
    return {
      ...state,
      currentQuery: {,
        ...state.currentQuery,
        filters: state.currentQuery.filters.filter((_, index) => index !== action.payload)
      }
    };
  case 'UPDATE_FILTER':
    return {
      ...state,
      currentQuery: {,
        ...state.currentQuery,
        filters: state.currentQuery.filters.map((filter, index) =>
          index === action.payload.index ? action.payload.filter : filter
      }
    };
  case 'SET_FILTERS':
    return {
      ...state,
      currentQuery: { ...state.currentQuery, filters: action.payload }
    };
  case 'ADD_SORT': {
    // Remove existing sort for same field, then add new one
    const existingSorts = state.currentQuery.sorts.filter(s => s.field !== action.payload.field);
    return {
      ...state,
      currentQuery: {,
        ...state.currentQuery,
        sorts: [...existingSorts, action.payload]
      }
    };
  }
  case 'REMOVE_SORT':
    return {
      ...state,
      currentQuery: {,
        ...state.currentQuery,
        sorts: state.currentQuery.sorts.filter((_, index) => index !== action.payload)
      }
    };
  case 'SET_SORTS':
    return {
      ...state,
      currentQuery: { ...state.currentQuery, sorts: action.payload }
    };
  case 'SET_RESULTS':
    return {
      ...state,
      results: action.payload,
      isLoading: false,
      error: null,
    };
  case 'SET_LOADING':
    return {
      ...state,
      isLoading: action.payload,
    };
  case 'SET_ERROR':
    return {
      ...state,
      error: action.payload,
      isLoading: false,
    };
  case 'ADD_TO_HISTORY': {
    const newHistory = [action.payload, ...state.searchHistory.filter(;)
      h => JSON.stringify(h) !== JSON.stringify(action.payload)
    )].slice(0, 10); // Keep last 10 searches
    return {
      ...state,
      searchHistory: newHistory,
    };
  }
  case 'SAVE_SEARCH':
    return {
      ...state,
      savedSearches: [...state.savedSearches.filter(s => s.id !== action.payload.id), action.payload]
    };
  case 'REMOVE_SAVED_SEARCH':
    return {
      ...state,
      savedSearches: state.savedSearches.filter(s => s.id !== action.payload),
    };
  case 'CLEAR_RESULTS':
    return {
      ...state,
      results: null,
      error: null,
    };
  case 'RESET_QUERY':
    return {
      ...state,
      currentQuery: initialState.currentQuery,
      results: null,
      error: null,
    };
  default:
    return state;
  }
};

// Context
interface SearchContextValue {
  // State
  query: SearchQuery;
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  searchHistory: SearchQuery[];
  savedSearches: SavedSearch[];
  // Actions
  setQuery: (query: Partial<SearchQuery>) => void;
  setText: (text: string) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (index: number) => void;
  updateFilter: (index: number, filter: FilterCondition) => void;
  setFilters: (filters: FilterCondition[]) => void;
  addSort: (sort: SortCondition) => void;
  removeSort: (index: number) => void;
  setSorts: (sorts: SortCondition[]) => void;
  setResults: (results: SearchResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (query: SearchQuery) => void;
  saveSearch: (name: string) => void;
  removeSavedSearch: (id: string) => void;
  loadSavedSearch: (search: SavedSearch) => void;
  clearResults: () => void;
  resetQuery: () => void;
  // Computed values
  hasActiveFilters: boolean;
  hasActiveSorts: boolean;
  isQueryEmpty: boolean;
}
const SearchContext = createContext<SearchContextValue | undefined>(undefined);

// Provider Props
interface SearchProviderProps {
  children: React.ReactNode;
}

// Provider Component
export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [state, dispatch] = useReducer(searchReducer, initialState);
  // Actions
  const setQuery = useCallback((query: Partial<SearchQuery>) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);
  const setText = useCallback((text: string) => {
    dispatch({ type: 'SET_TEXT', payload: text });
  }, []);
  const addFilter = useCallback((filter: FilterCondition) => {
    dispatch({ type: 'ADD_FILTER', payload: filter });
  }, []);
  const removeFilter = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_FILTER', payload: index });
  }, []);
  const updateFilter = useCallback((index: number, filter: FilterCondition) => {
    dispatch({ type: 'UPDATE_FILTER', payload: { index, filter } });
  }, []);
  const setFilters = useCallback((filters: FilterCondition[]) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);
  const addSort = useCallback((sort: SortCondition) => {
    dispatch({ type: 'ADD_SORT', payload: sort });
  }, []);
  const removeSort = useCallback((index: number) => {
    dispatch({ type: 'REMOVE_SORT', payload: index });
  }, []);
  const setSorts = useCallback((sorts: SortCondition[]) => {
    dispatch({ type: 'SET_SORTS', payload: sorts });
  }, []);
  const setResults = useCallback((results: SearchResult) => {
    dispatch({ type: 'SET_RESULTS', payload: results });
  }, []);
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);
  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);
  const addToHistory = useCallback((query: SearchQuery) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: query });
  }, []);
  const saveSearch = useCallback((name: string) => {
    const savedSearch: SavedSearch = {
      id: `search_${Date.now()}`,}
      name,
      query: state.currentQuery,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SAVE_SEARCH', payload: savedSearch });
  }, [state.currentQuery]);
  const removeSavedSearch = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SAVED_SEARCH', payload: id });
  }, []);
  const loadSavedSearch = useCallback((search: SavedSearch) => {
    dispatch({ type: 'SET_QUERY', payload: search.query });
    // Update last used time
    const updatedSearch = { ...search, lastUsedAt: new Date().toISOString() };
    dispatch({ type: 'SAVE_SEARCH', payload: updatedSearch });
  }, []);
  const clearResults = useCallback(() => {
    dispatch({ type: 'CLEAR_RESULTS' });
  }, []);
  const resetQuery = useCallback(() => {
    dispatch({ type: 'RESET_QUERY' });
  }, []);
  // Computed values
  const hasActiveFilters = useMemo(() => state.currentQuery.filters.length > 0, [state.currentQuery.filters]);
  const hasActiveSorts = useMemo(() => state.currentQuery.sorts.length > 0, [state.currentQuery.sorts]);
  const isQueryEmpty = useMemo(() => ;
    !state.currentQuery.text && 
    state.currentQuery.filters.length === 0 && 
    state.currentQuery.sorts.length === 0,
  [state.currentQuery]
  );
  const contextValue: SearchContextValue = {
    // State
    query: state.currentQuery,
    results: state.results,
    isLoading: state.isLoading,
    error: state.error,
    searchHistory: state.searchHistory,
    savedSearches: state.savedSearches,
    // Actions
    setQuery,
    setText,
    addFilter,
    removeFilter,
    updateFilter,
    setFilters,
    addSort,
    removeSort,
    setSorts,
    setResults,
    setLoading,
    setError,
    addToHistory,
    saveSearch,
    removeSavedSearch,
    loadSavedSearch,
    clearResults,
    resetQuery,
    // Computed values
    hasActiveFilters,
    hasActiveSorts,
    isQueryEmpty
  };
  return ()
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
};

// Hook to use search context
export const useSearch = (): SearchContextValue => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};