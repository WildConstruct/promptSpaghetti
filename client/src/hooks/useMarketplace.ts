// Epic 16 Marketplace - Custom React Hook
import { useState, useCallback, useRef } from 'react';
import { API_URL } from '../config/environment';

// Types
interface SearchFilters {
  query?: string;
  categories?: string[];
  tags?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest' | 'oldest';
  is_free?: boolean;
  is_featured?: boolean;
  page?: number;
  limit?: number;
}

interface Template {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  price_cents: number;
  avg_rating: number;
  total_reviews: number;
  total_purchases: number;
  categories?: string[];
  owner?: {
    id: string;
    name: string;
    verified: boolean;
  };
  featured_at?: string;
  created_at: string;
  is_ai_generated?: boolean;
  claude_compat: string[];
}

interface SearchResult {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  sort_order: number;
  parent_id?: string;
}

interface MarketplaceState {
  templates: SearchResult;
  categories: Category[];
  featuredTemplates: Template[];
  loading: boolean;
  error: string | null;
}

interface MarketplaceActions {
  searchTemplates: (filters: SearchFilters, append?: boolean) => Promise<void>;
  loadCategories: () => Promise<void>;
  loadFeaturedTemplates: () => Promise<void>;
  getTemplate: (id: string) => Promise<Template | null>;
  previewTemplate: (
    id: string,
    options?: { format?: string; version?: string }
  ) => Promise<{ success: boolean; preview?: string; error?: string }>;
  purchaseTemplate: (
    id: string,
    options?: { paymentMethod?: string; coupon?: string }
  ) => Promise<{ success: boolean; transactionId?: string; error?: string }>;
  getSearchSuggestions: (query: string) => Promise<string[]>;
  clearError: () => void;
  reset: () => void;
}

const API_BASE_URL = `${API_URL}/api/marketplace`;

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData = { error: 'Unknown error' };
    try {
      errorData = await response.json();
    } catch {
      // Use default error data if JSON parsing fails
    }
    throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export 
  // Keep track of ongoing requests to prevent race conditions
  const requestIdRef = useRef(0);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const reset = useCallback(() => {
    setState({
      templates: {
        templates: [],
        total: 0,
        page: 1,
        limit: 20,
        has_more: false
      },
      categories: [],
      featuredTemplates: [],
      loading: false,
      error: null
    });
  }, []);

  const searchTemplates = useCallback(async (filters: SearchFilters, append: boolean = false) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    clearError();

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${API_BASE_URL}/templates/search?${searchParams}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);

      // Check if this is still the latest request
      if (requestId === requestIdRef.current) {
        setState(prev => ({
          ...prev,
          templates: append ? {
            ...data,
            templates: [...prev.templates.templates, ...data.templates]
          } : data,
          loading: false
        }));
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setError(error instanceof Error ? error.message : 'Failed to search templates');
      }
    }
  }, [setLoading, clearError, setError]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: getAuthHeaders()
      });

      const categories = await handleApiResponse(response);

      setState(prev => ({
        ...prev,
        categories: categories.sort((a: Category, b: Category) => a.sort_order - b.sort_order)
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to load categories:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      // Don't set error state for categories as it's not critical
    }
  }, []);

  const loadFeaturedTemplates = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/search?is_featured=true&limit=6`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);

      setState(prev => ({
        ...prev,
        featuredTemplates: data.templates || []
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to load featured templates:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      // Don't set error state for featured templates as it's not critical
    }
  }, []);

  const getTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        headers: getAuthHeaders()
      });

      return await handleApiResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get template:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, []);

  const previewTemplate = useCallback(async (id: string, options: { format?: string; version?: string } = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/preview`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(options)
      });

      return await handleApiResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to preview template:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, []);

  const purchaseTemplate = useCallback(
    async (id: string,
    options: { paymentMethod?: string; coupon?: string } = {}
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          template_id: id,
          ...options
        })
      });

      return await handleApiResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to purchase template:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }, []);

  // Recommendation methods
  const getPersonalizedRecommendations = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/personalized?limit=${limit}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get personalized recommendations:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  const getTrendingTemplates = useCallback(async (timeWindow: number = 7, limit: number = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/trending?timeWindow=${timeWindow}&limit=${limit}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get trending templates:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  const getSimilarTemplates = useCallback(async (templateId: string, limit: number = 5) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${templateId}/similar?limit=${limit}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get similar templates:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  const getNewUserRecommendations = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/new-user?limit=${limit}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get new user recommendations:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  const getCategoryRecommendations = useCallback(
    async (categoryId: string,
    limit: number = 10,
    exclude: string[] = []
  ) => {
    try {
      const excludeParam = exclude.length > 0 ? `&exclude=${exclude.join(',')}` : '';
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/recommendations?limit=${limit}${excludeParam}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get category recommendations:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  const getSearchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.suggestions || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get search suggestions:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  const getSearchBasedRecommendations = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recommendations/search-based?limit=${limit}`, {
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response);
      return data.templates || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get search-based recommendations:', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
      return [];
    }
  }, []);

  return {
    ...state,
    searchTemplates,
    loadCategories,
    loadFeaturedTemplates,
    getTemplate,
    previewTemplate,
    purchaseTemplate,
    getSearchSuggestions,
    clearError,
    reset,
    // Recommendation methods
    getPersonalizedRecommendations,
    getTrendingTemplates,
    getSimilarTemplates,
    getNewUserRecommendations,
    getCategoryRecommendations,
    getSearchBasedRecommendations
  };
};