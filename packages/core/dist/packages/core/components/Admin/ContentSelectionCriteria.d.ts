/**
 * Content Selection Criteria - E17-1753114397323-A4BE50
 *
 * Administrative interface for creating and managing content selection criteria
 * Part of Epic 17.5.2 - Featured Content Tools (Backstage Admin Controls)
 */
import React from 'react';
export interface ContentCriteria {
    min_rating?: number;
    min_download_count?: number;
    quality_score_threshold?: number;
    categories?: string;
    tags?: string;
    exclude_categories?: string;
    published_after?: Date;
    last_updated_after?: Date;
    creator_ids?: string;
    creator_tiers?: string;
    min_conversion_rate?: number;
    min_engagement_score?: number;
    content_types?: string;
    languages?: string;
    exclude_content_ids?: string;
    exclude_recently_promoted?: boolean;
    exclude_current_promotions?: boolean;
    max_content_count?: number;
    diversification_rules?: DiversificationRule;
}
export interface DiversificationRule {
    attribute: string;
    max_percentage: number;
    enforce_uniqueness: boolean;
}
export interface SelectionCriteriaTemplate {
    id: string;
    name: string;
    description: string;
    category: 'quality' | 'performance' | 'diversity' | 'trending' | 'seasonal' | 'custom';
    criteria: ContentCriteria;
    is_system_template: boolean;
    usage_count: number;
    created_by: string;
    created_at: Date;
    last_used?: Date;
}
export interface ContentSelectionPreview {
    total_matches: number;
    sample_content: Array<{}, id>;
    string: any;
    title: string;
    creator: string;
    rating: number;
    downloads: number;
    category: string;
    match_reasons: string;
}
export interface ContentSelectionCriteriaProps {
    className?: string;
}
export declare const ContentSelectionCriteria: React.FC<ContentSelectionCriteriaProps>;
export default ContentSelectionCriteria;
//# sourceMappingURL=ContentSelectionCriteria.d.ts.map