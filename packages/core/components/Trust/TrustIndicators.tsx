/**
 * Trust Indicators System - E17-1753114397408-F8D885
 * 
 * Visual trust and credibility indicators for Wild Construct creators
 * Displays verification status, trust scores, and professional credentials
 * across the platform interface.
 */

import React from 'react';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { 
  Shield, 
  Star, 
  Award, 
  CheckCircle, 
  Verified,
  Crown,
  TrendingUp,
  Users,
  ExternalLink,
  Clock,
  AlertTriangle,
  Info
} from 'lucide-react';
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
  verifications?: string[];
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
  verifications: string[];
  maxDisplay?: number;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Main trust indicator component
 */
export const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  trustScore,
  size = 'medium',
  variant = 'detailed',
  showLabel = true,
  showTooltip = true,
  className = ''
}) => {
  if (!trustScore) {
    return (
      <div className={`trust-indicator unverified ${size} ${className}`}>
        <Shield className="trust-icon unverified-icon" />
        {showLabel && <span className="trust-label">Unverified</span>}
      </div>
    );
  }

  const getTrustIcon = (tier: string) => {
    switch (tier) {
      case 'expert':
        return <Crown className="trust-icon expert-icon" />;
      case 'professional':
        return <Award className="trust-icon professional-icon" />;
      case 'verified':
        return <CheckCircle className="trust-icon verified-icon" />;
      case 'basic':
        return <Shield className="trust-icon basic-icon" />;
      default:
        return <Shield className="trust-icon unverified-icon" />;
    }
  };

  const getTrustColor = (tier: string) => {
    switch (tier) {
      case 'expert': return 'trust-expert';
      case 'professional': return 'trust-professional';
      case 'verified': return 'trust-verified';
      case 'basic': return 'trust-basic';
      default: return 'trust-unverified';
    }
  };

  const getTrustLabel = (tier: string) => {
    switch (tier) {
      case 'expert': return 'Expert';
      case 'professional': return 'Professional';
      case 'verified': return 'Verified';
      case 'basic': return 'Basic';
      default: return 'Unverified';
    }
  };

  const indicator = (
    <div className={`trust-indicator ${getTrustColor(trustScore.tier)} ${size} ${variant} ${className}`}>
      {getTrustIcon(trustScore.tier)}
      {showLabel && (
        <span className="trust-label">{getTrustLabel(trustScore.tier)}</span>
      )}
      {variant === 'detailed' && (
        <span className="trust-score">{trustScore.overall}/100</span>
      )}
    </div>
  );

  if (!showTooltip) {
    return indicator;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {indicator}
        </TooltipTrigger>
        <TooltipContent>
          <div className="trust-tooltip">
            <div className="tooltip-header">
              <strong>{getTrustLabel(trustScore.tier)} Creator</strong>
              <span className="tooltip-score">{trustScore.overall}/100</span>
            </div>
            <div className="tooltip-breakdown">
              <div className="breakdown-item">
                <span>Identity:</span>
                <span>{trustScore.components.identity}/100</span>
              </div>
              <div className="breakdown-item">
                <span>Professional:</span>
                <span>{trustScore.components.professional}/100</span>
              </div>
              <div className="breakdown-item">
                <span>Community:</span>
                <span>{trustScore.components.community}/100</span>
              </div>
              <div className="breakdown-item">
                <span>Activity:</span>
                <span>{trustScore.components.activity}/100</span>
              </div>
            </div>
            {trustScore.badges.length > 0 && (
              <div className="tooltip-badges">
                <strong>Badges:</strong>
                <div className="badge-list">
                  {trustScore.badges.map((badge, index) => (
                    <Badge key={index} variant="outline" className="tooltip-badge">
                      {badge.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Creator trust badge with comprehensive information
 */
export const CreatorTrustBadge: React.FC<CreatorTrustBadgeProps> = ({
  creatorId,
  creatorName,
  trustScore,
  verifications = [],
  showFullDetails = false,
  className = ''
}) => {
  const hasHighTrust = trustScore && trustScore.overall >= 80;
  const hasVerifications = verifications.length > 0;

  return (
    <div className={`creator-trust-badge ${className}`}>
      <div className="creator-info">
        <div className="creator-avatar">
          {/* Placeholder for creator avatar */}
          <div className="avatar-placeholder">
            {creatorName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="creator-details">
          <div className="creator-name">
            <span>{creatorName}</span>
            {hasHighTrust && (
              <Verified className="verified-icon" />
            )}
          </div>
          <div className="trust-indicators">
            <TrustIndicator 
              trustScore={trustScore}
              size="small"
              variant="compact"
              showTooltip={true}
            />
            {hasVerifications && (
              <VerificationBadges 
                verifications={verifications}
                maxDisplay={3}
                size="small"
              />
            )}
          </div>
        </div>
      </div>
      
      {showFullDetails && trustScore && (
        <div className="trust-details">
          <TrustScoreDisplay trustScore={trustScore} />
        </div>
      )}
    </div>
  );
};

/**
 * Detailed trust score display with breakdown
 */
export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({
  trustScore,
  showBreakdown = true,
  orientation = 'horizontal',
  className = ''
}) => {
  return (
    <div className={`trust-score-display ${orientation} ${className}`}>
      <div className="overall-score">
        <div className="score-circle">
          <div className="score-value">{trustScore.overall}</div>
          <div className="score-max">/100</div>
        </div>
        <div className="score-tier">
          <Badge className={`tier-badge tier-${trustScore.tier}`}>
            {trustScore.tier.toUpperCase()}
          </Badge>
        </div>
      </div>
      
      {showBreakdown && (
        <div className="score-breakdown">
          <div className="component-score">
            <span className="component-label">Identity</span>
            <Progress value={trustScore.components.identity} className="component-progress identity" />
            <span className="component-value">{trustScore.components.identity}</span>
          </div>
          <div className="component-score">
            <span className="component-label">Professional</span>
            <Progress value={trustScore.components.professional} className="component-progress professional" />
            <span className="component-value">{trustScore.components.professional}</span>
          </div>
          <div className="component-score">
            <span className="component-label">Community</span>
            <Progress value={trustScore.components.community} className="component-progress community" />
            <span className="component-value">{trustScore.components.community}</span>
          </div>
          <div className="component-score">
            <span className="component-label">Activity</span>
            <Progress value={trustScore.components.activity} className="component-progress activity" />
            <span className="component-value">{trustScore.components.activity}</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Verification badges display
 */
export const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  verifications,
  maxDisplay = 5,
  size = 'medium',
  className = ''
}) => {
  const getVerificationIcon = (verification: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'verified_email': <CheckCircle className="verification-icon" />,
      'verified_phone': <CheckCircle className="verification-icon" />,
      'verified_identity': <Shield className="verification-icon" />,
      'verified_professional': <Award className="verification-icon" />,
      'verified_director': <Star className="verification-icon" />,
      'portfolio_verified': <ExternalLink className="verification-icon" />,
      'social_verified': <Users className="verification-icon" />,
      'industry_member': <TrendingUp className="verification-icon" />
    };

    return iconMap[verification] || <Info className="verification-icon" />;
  };

  const getVerificationLabel = (verification: string) => {
    const labelMap: Record<string, string> = {
      'verified_email': 'Email Verified',
      'verified_phone': 'Phone Verified',
      'verified_identity': 'ID Verified',
      'verified_professional': 'Professional',
      'verified_director': 'Director',
      'portfolio_verified': 'Portfolio Verified',
      'social_verified': 'Social Verified',
      'industry_member': 'Industry Member'
    };

    return labelMap[verification] || verification.replace('_', ' ');
  };

  const getVerificationColor = (verification: string) => {
    if (verification.includes('director') || verification.includes('professional')) {
      return 'verification-professional';
    }
    if (verification.includes('identity') || verification.includes('verified')) {
      return 'verification-verified';
    }
    return 'verification-basic';
  };

  const displayedVerifications = verifications.slice(0, maxDisplay);
  const remainingCount = verifications.length - maxDisplay;

  return (
    <div className={`verification-badges ${size} ${className}`}>
      {displayedVerifications.map((verification, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                variant="secondary" 
                className={`verification-badge ${getVerificationColor(verification)}`}
              >
                {getVerificationIcon(verification)}
                <span className="verification-label">
                  {size === 'small' ? '' : getVerificationLabel(verification)}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <span>{getVerificationLabel(verification)}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      
      {remainingCount > 0 && (
        <Badge variant="outline" className="remaining-badge">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

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

export const TemplateTrustIndicator: React.FC<TemplateTrustIndicatorProps> = ({
  creatorTrustScore,
  templateQualityScore = 0,
  downloadCount = 0,
  rating = 0,
  isVerifiedCreator = false,
  className = ''
}) => {
  const getQualityLevel = (score: number) => {
    if (score >= 90) return { level: 'premium', color: 'quality-premium' };
    if (score >= 75) return { level: 'high', color: 'quality-high' };
    if (score >= 60) return { level: 'good', color: 'quality-good' };
    return { level: 'standard', color: 'quality-standard' };
  };

  const qualityInfo = getQualityLevel(templateQualityScore);
  const isPopular = downloadCount > 100;
  const isHighRated = rating > 4.0;

  return (
    <div className={`template-trust-indicator ${className}`}>
      <div className="trust-elements">
        {isVerifiedCreator && (
          <Badge variant="default" className="creator-verified">
            <Verified className="w-3 h-3 mr-1" />
            Verified Creator
          </Badge>
        )}
        
        {templateQualityScore > 0 && (
          <Badge variant="secondary" className={`quality-badge ${qualityInfo.color}`}>
            <Star className="w-3 h-3 mr-1" />
            {qualityInfo.level.toUpperCase()} QUALITY
          </Badge>
        )}
        
        {isPopular && (
          <Badge variant="outline" className="popularity-badge">
            <TrendingUp className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        )}
        
        {isHighRated && (
          <Badge variant="outline" className="rating-badge">
            <Star className="w-3 h-3 mr-1" />
            {rating.toFixed(1)} ★
          </Badge>
        )}
      </div>

      {creatorTrustScore && (
        <div className="creator-trust-summary">
          <TrustIndicator 
            trustScore={creatorTrustScore}
            size="small"
            variant="minimal"
            showTooltip={true}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Inline trust status for compact displays
 */
export interface InlineTrustStatusProps {
  trustTier?: string;
  isVerified?: boolean;
  size?: 'small' | 'medium';
  className?: string;
}

export const InlineTrustStatus: React.FC<InlineTrustStatusProps> = ({
  trustTier = 'unverified',
  isVerified = false,
  size = 'small',
  className = ''
}) => {
  if (!isVerified && trustTier === 'unverified') {
    return null;
  }

  return (
    <span className={`inline-trust-status ${size} ${className}`}>
      {trustTier === 'expert' && <Crown className="inline-icon expert" />}
      {trustTier === 'professional' && <Award className="inline-icon professional" />}
      {(trustTier === 'verified' || isVerified) && <CheckCircle className="inline-icon verified" />}
      {trustTier === 'basic' && <Shield className="inline-icon basic" />}
    </span>
  );
};

export default {
  TrustIndicator,
  CreatorTrustBadge,
  TrustScoreDisplay,
  VerificationBadges,
  TemplateTrustIndicator,
  InlineTrustStatus
};