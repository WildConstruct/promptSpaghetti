/**
 * Epic 16 Marketplace Leaderboards Component
 * Task: E16-1753114247137-1F7DE2 - Implement leaderboards
 *
 * Comprehensive marketplace leaderboard display with templates, creators,
 * categories, and user engagement rankings with real-time updates.
 */
import React from 'react';
export interface MarketplaceLeaderboardsProps {
    defaultTab?: 'templates' | 'creators' | 'categories' | 'engagement';
    onTemplateClick?: (templateId: string) => void;
    onCreatorClick?: (creatorId: string) => void;
    onCategoryClick?: (categoryId: string) => void;
    className?: string;
}
export declare const MarketplaceLeaderboards: React.FC<MarketplaceLeaderboardsProps>;
export default MarketplaceLeaderboards;
//# sourceMappingURL=MarketplaceLeaderboards.d.ts.map