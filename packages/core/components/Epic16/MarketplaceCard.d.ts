/**
 * Epic 16 Marketplace Card Component
 *
 * Reusable card component for displaying marketplace templates with
 * consistent design patterns for thumbnail, metadata, pricing, and actions.
 */
import React from 'react';

}
export interface MarketplaceTemplate {
    id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    price: number;
    currency: string;
    tags: string[];
    rating: number;
    reviewCount: number;
    creatorName: string;
    creatorAvatar?: string;
    compatibility: string[];
    isAiGenerated: boolean;
    status: 'draft' | 'listed' | 'blocked' | 'archived';
    stats: {
        downloads: number;
        views: number;
        likes: number;
}
    };
    createdAt: Date;
    updatedAt: Date;
}
interface MarketplaceCardProps {
    template: MarketplaceTemplate;
    variant?: 'grid' | 'list' | 'featured';
    showActions?: boolean;
    onPreview?: (template: MarketplaceTemplate) => void;
    onPurchase?: (template: MarketplaceTemplate) => void;
    onLike?: (template: MarketplaceTemplate) => void;
    onShare?: (template: MarketplaceTemplate) => void;
    className?: string;

export declare const MarketplaceCard: React.FC<MarketplaceCardProps>;
export default MarketplaceCard;
//# sourceMappingURL=MarketplaceCard.d.ts.map
}