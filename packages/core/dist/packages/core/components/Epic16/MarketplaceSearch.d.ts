/**
 * Epic 16 Marketplace Search Component
 *
 * Advanced search interface with autocomplete, filters, and category browsing
 * for the marketplace template discovery experience.
 */
import React from 'react';
export interface SearchFilters {
    priceRange: [number, number];
    tags: string;
    rating: number;
    compatibility: string;
    isAiGenerated?: boolean;
    sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'downloads' | 'newest' | 'oldest';
    creatorId?: string;
}
interface SearchSuggestion {
    text: string;
    type: 'query' | 'tag' | 'creator' | 'template';
    count?: number;
    icon?: string;
}
interface MarketplaceSearchProps {
    onSearch: (query: string, filters: SearchFilters) => void;
    onFiltersChange?: (filters: SearchFilters) => void;
    availableTags?: string;
    availableCreators?: Array<{
        id: string;
        name: string;
        templateCount: number;
    }>;
    availableModels?: string;
    searchSuggestions?: SearchSuggestion;
    isLoading?: boolean;
    resultCount?: number;
    className?: string;
    const: any;
    defaultFilters: SearchFilters;
}
export declare const MarketplaceSearch: React.FC<MarketplaceSearchProps>;
export default MarketplaceSearch;
//# sourceMappingURL=MarketplaceSearch.d.ts.map