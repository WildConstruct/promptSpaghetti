import { TrustScore } from '../auth/IdentityValidation';
export interface TrustIndicatorConfig {
    userId?: string;
    showRealTimeUpdates?: boolean;
    cacheTimeout?: number;
}
export interface EnhancedTrustData {
    trustScore: TrustScore | null;
    reputationScore: number;
    templateCount: number;
    downloadCount: number;
    averageRating: number;
    reviewCount: number;
    verificationStatus: {
        email: boolean;
        phone: boolean;
        identity: boolean;
        professional: boolean;
        portfolio: boolean;
        social: boolean;
    };
    badges: string;
    communityStanding: 'excellent' | 'good' | 'fair' | 'poor' | 'unrated';
    trustTrend: 'improving' | 'stable' | 'declining';
}
export interface TrustDisplayOptions {
    showScore?: boolean;
    showBadges?: boolean;
    showTrend?: boolean;
    compactMode?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}
export declare const useTrustIndicators: (config?: TrustIndicatorConfig) => void;
//# sourceMappingURL=useTrustIndicators.d.ts.map