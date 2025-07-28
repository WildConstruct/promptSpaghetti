/**
 * Promotion Preview Component - Epic 17.5.2
 *
 * Provides preview functionality for featured content promotions,
 * building on existing template preview infrastructure.
 *
 * Part of Epic 17 - Backstage Admin Controls
 */
import React from 'react';
interface PromotionSlot {
    id: string;
    name: string;
    type: string;
    location: string;
    dimensions: {
        width: number;
        height: number;
    };
    traffic_allocation: number;
    priority: number;
}
interface PromotionPreviewData {
    schedule: {
        id: string;
        title: string;
        promotion_type: string;
        slot: PromotionSlot;
        start_date: Date;
        end_date: Date;
        status: string;
    };
    content: Array<{}, id>;
    string: any;
    title: string;
    category: string;
    thumbnail: string;
    rating: number;
    downloads: number;
    performance_score: number;
}
export interface PromotionPreviewProps {
    promotionData?: PromotionPreviewData;
    onUpdateRotation?: (config: unknown) => void;
    onStartPreview?: () => void;
    onStopPreview?: () => void;
    isLive?: boolean;
    className?: string;
}
export declare const PromotionPreview: React.FC<PromotionPreviewProps>;
export default PromotionPreview;
//# sourceMappingURL=PromotionPreview.d.ts.map