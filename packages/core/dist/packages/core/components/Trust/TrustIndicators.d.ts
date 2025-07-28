/**
 * Trust Indicators System - E17-1753114397408-F8D885
 *
 * Visual trust and credibility indicators for Wild Construct creators
 * Displays verification status, trust scores, and professional credentials
 * across the platform interface.
 */
import React from 'react';
import { TrustScore } from '../auth/IdentityValidation';
export interface TrustIndicatorProps {
    trustScore?: TrustScore | null;
    size?: 'small' | 'medium' | 'large';
    variant?: 'minimal' | 'detailed' | 'compact';
    showLabel?: boolean;
    showTooltip?: boolean;
    className?: string;
}
export interface CreatorTrustBadgeProps {
    creatorId: string;
    creatorName: string;
    trustScore?: TrustScore | null;
    verifications?: string;
    showFullDetails?: boolean;
    className?: string;
}
export interface TrustScoreDisplayProps {
    trustScore: TrustScore;
    showBreakdown?: boolean;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
}
export interface VerificationBadgesProps {
    verifications: string;
    maxDisplay?: number;
    size?: 'small' | 'medium' | 'large';
    className?: string;
}
export declare const TrustIndicator: React.FC<TrustIndicatorProps>;
/**
 * Detailed trust score display with breakdown
 */
export declare const TrustScoreDisplay: React.FC<TrustScoreDisplayProps>;
/**
 * Verification badges display
 */
export declare const VerificationBadges: React.FC<VerificationBadgesProps>;
/**
 * Template trust indicator for marketplace
 */
export interface TemplateTrustIndicatorProps {
    creatorTrustScore?: TrustScore | null;
    templateQualityScore?: number;
    downloadCount?: number;
    rating?: number;
    isVerifiedCreator?: boolean;
    className?: string;
}
export declare const TemplateTrustIndicator: React.FC<TemplateTrustIndicatorProps>;
/**
 * Inline trust status for compact displays
 */
export interface InlineTrustStatusProps {
    trustTier?: string;
    isVerified?: boolean;
    size?: 'small' | 'medium';
    className?: string;
}
export declare const InlineTrustStatus: React.FC<InlineTrustStatusProps>;
//# sourceMappingURL=TrustIndicators.d.ts.map