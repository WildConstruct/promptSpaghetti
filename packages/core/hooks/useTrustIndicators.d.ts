/**
 * React Hook for Trust Indicators Integration
 *
 * Provides utilities for displaying and managing trust indicators
 * across the Wild Construct platform interface.
 */
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
    verificationStatus: {,
        email: boolean;
        phone: boolean;
        identity: boolean;
        professional: boolean;
        portfolio: boolean;
        social: boolean;
    };
    badges: string[];
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
export declare const useTrustIndicators: (config?: TrustIndicatorConfig) => {
    trustData: EnhancedTrustData | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    loadTrustData: (forceRefresh?: boolean) => Promise<void>;
    refreshTrustData: () => Promise<void>;
    getTrustLevel: (score?: number) => "professional" | "basic" | "expert" | "verified" | "unverified";
    getTrustLevelColor: (level: string) => string;
    getTrustLevelBenefits: (level: string) => string[];
    formatTrustScore: (score?: number) => string;
    getTrustScoreColor: (score?: number) => string;
    trustScore: number;
    trustTier: "professional" | "basic" | "expert" | "verified" | "unverified";
    verificationStatus: {,
        email: boolean;
        phone: boolean;
        identity: boolean;
        professional: boolean;
        portfolio: boolean;
        social: boolean;
    };
    verificationCount: number;
    shouldShowVerificationPrompt: boolean;
    getNextVerificationStep: () => string | null;
    communityStanding: "excellent" | "good" | "poor" | "fair" | "unrated";
    getCommunityStandingColor: (standing: string) => string;
    trustTrend: "stable" | "improving" | "declining";
    getTrustTrendIcon: (trend: string) => string;
    getTrustTrendColor: (trend: string) => string;
    badges: string[];
    getDisplayBadges: (maxBadges?: number) => string[];
    getRemainingBadgeCount: (maxBadges?: number) => number;
    templateCount: number;
    downloadCount: number;
    averageRating: number;
    reputationScore: number;
    canSellTemplates: boolean;
    canAccessPremiumFeatures: boolean;
    isVerifiedCreator: boolean;
    isProfessionalCreator: boolean;
    hasEmailVerification: boolean;
    hasPhoneVerification: boolean;
    hasIdentityVerification: boolean;
    hasProfessionalVerification: boolean;
    hasPortfolioVerification: boolean;
    hasSocialVerification: boolean;
};
export default useTrustIndicators;
//# sourceMappingURL=useTrustIndicators.d.ts.map