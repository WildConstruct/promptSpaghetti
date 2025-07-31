/**
 * React Hook for Trust Indicators Integration
 * 
 * Provides utilities for displaying and managing trust indicators
 * across the Wild Construct platform interface.
 */
import { useEffect, useState, useCallback, useMemo } from 'react';
import { identityValidationService, TrustScore } from '../auth/IdentityValidation';
import { marketplaceMetrics } from '../analytics/MarketplaceMetrics';

}
export interface TrustIndicatorConfig {
  userId?: string;
  showRealTimeUpdates?: boolean;
  cacheTimeout?: number; // milliseconds,
}
}
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
}
};
  badges: string;
  communityStanding: 'excellent' | 'good' | 'fair' | 'poor' | 'unrated';
  trustTrend: 'improving' | 'stable' | 'declining'
  }
}
export interface TrustDisplayOptions {
  showScore?: boolean;
  showBadges?: boolean;
  showTrend?: boolean;
  compactMode?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  const TRUST_CACHE_KEY = 'wildConstruct_trustCache';
  const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes;
}
}
export const useTrustIndicators = (config: TrustIndicatorConfig = {}) => {
  const { userId, showRealTimeUpdates = false, cacheTimeout = DEFAULT_CACHE_TIMEOUT } = config;
  const [trustData, setTrustData] = useState<EnhancedTrustData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Load trust data with caching
  const loadTrustData = useCallback(async (forceRefresh = false) => {
  if (!userId) {
  setTrustData(null);
  return;
  setIsLoading(true);
  setError(null);
  try {
  // Check cache first
  if (!forceRefresh) {
  const cached = getCachedTrustData(userId);
  if (cached && Date.now() - cached.timestamp < cacheTimeout) {
  setTrustData(cached.data);
  setLastUpdated(new Date(cached.timestamp));
  setIsLoading(false);
  return;
  // Load fresh data
  const trustScore = identityValidationService.getUserTrustScore(userId);
  const validationSummary = identityValidationService.getUserValidationSummary(userId);
  // Get marketplace data for reputation metrics
  const creatorAnalytics = marketplaceMetrics.getCreatorAnalytics(userId);
  const enhancedData: EnhancedTrustData = {,
  trustScore,
  reputationScore: calculateReputationScore(trustScore, creatorAnalytics),
  templateCount: creatorAnalytics?.metrics.totalTemplates || 0,
  downloadCount: creatorAnalytics?.metrics.totalDownloads || 0,
  averageRating: creatorAnalytics?.metrics.averageRating || 0,
  reviewCount: 0, // Would come from review system,
  verificationStatus: {
  email: validationSummary?.completedValidations?.includes('email_verification') || false,
  phone: validationSummary?.completedValidations?.includes('phone_verification') || false,
  identity: validationSummary?.completedValidations?.includes('government_id') || false,
  professional: validationSummary?.completedValidations?.includes('professional_credentials') || false,
  portfolio: validationSummary?.completedValidations?.includes('portfolio_verification') || false,
  social: validationSummary?.completedValidations?.includes('social_media_verification') || false,
},
  badges: trustScore?.badges || [],
        communityStanding: calculateCommunityStanding(trustScore, creatorAnalytics),
        trustTrend: calculateTrustTrend(trustScore);
  };
      setTrustData(enhancedData);
      setLastUpdated(new Date());
      // Cache the result
      cacheTrustData(userId, enhancedData);
    } catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load trust data');
} finally {
      setIsLoading(false);
  }, [userId, cacheTimeout]);
  // Auto-refresh for real-time updates
  useEffect(() => {
    if (showRealTimeUpdates && userId) {
      const interval = setInterval(() => {
        loadTrustData();
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
  }, [showRealTimeUpdates, userId, loadTrustData]);
  // Initial load
  useEffect(() => {
    if (userId) {
      loadTrustData();
  }, [userId, loadTrustData]);
  // Trust level utilities
  const getTrustLevel = useCallback((score?: number): 'unverified' | 'basic' | 'verified' | 'professional' | 'expert' => {
    if (!score) return 'unverified';
    if (score >= 90) return 'expert';
    if (score >= 80) return 'professional';
    if (score >= 65) return 'verified';
    if (score >= 40) return 'basic';
    return 'unverified'
  }, []);
  const getTrustLevelColor = useCallback((level: string): string => {
  switch (level) {
  case 'expert': return '#7c3aed';
  case 'professional': return '#2563eb';
  case 'verified': return '#059669';
  case 'basic': return '#d97706';
  default: return '#6b7280';
}, []);
  const getTrustLevelBenefits = useCallback((level: string): string => {
  const benefits: Record<string, string> = {,
  expert: [,
  'Expert verification badge',
  'Featured creator status',
  'Priority support',
  'Revenue sharing bonuses',
  'Early access to features',
  'Mentorship opportunities'
  ],
  professional: [,
  'Professional badge',
  'Advanced analytics',
  'Custom branding',
  'Direct industry connections',
  'Template selling privileges'
  ],
  verified: [,
  'Verified creator badge',
  'Full marketplace access',
  'Collaboration features',
  'Template creation tools'
  ],
  basic: [,
  'Basic verification badge',
  'Limited marketplace features',
  'Community access'
  ],
  unverified: [,
  'Read-only access',
  'Basic template browsing'
  ]
};
    return benefits[level] || benefits.unverified;
  }, []);
  // Trust score formatting
  const formatTrustScore = useCallback((score?: number): string => {
    if (!score) return 'Unverified';
    return `${score}/100`;}
  }, []);
  // Trust indicator helpers
  const shouldShowVerificationPrompt = useMemo(() => {
    if (!trustData) return true;
    const verificationCount = Object.values(trustData.verificationStatus).filter(Boolean).length;
    return verificationCount < 3; // Less than 3 verifications
  }, [trustData]);
  const getNextVerificationStep = useCallback((): string | null => {
    if (!trustData) return 'email_verification';
    const { verificationStatus } = trustData;
    if (!verificationStatus.email) return 'email_verification';
    if (!verificationStatus.phone) return 'phone_verification';
    if (!verificationStatus.professional) return 'professional_credentials';
    if (!verificationStatus.portfolio) return 'portfolio_verification';
    if (!verificationStatus.social) return 'social_media_verification';
    if (!verificationStatus.identity) return 'government_id';
    return null;
  }, [trustData]);
  const getTrustScoreColor = useCallback((score?: number): string => {
    if (!score) return '#6b7280';
    if (score >= 90) return '#059669';
    if (score >= 80) return '#2563eb';
    if (score >= 65) return '#d97706';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }, []);
  // Community standing helpers
  const getCommunityStandingColor = useCallback((standing: string): string => {
  switch (standing) {
  case 'excellent': return '#059669';
  case 'good': return '#2563eb';
  case 'fair': return '#d97706';
  case 'poor': return '#ef4444';
  default: return '#6b7280';
}, []);
  // Trust trend helpers
  const getTrustTrendIcon = useCallback((trend: string): string => {
  switch (trend) {
  case 'improving': return '↗️';
  case 'declining': return '↘️';
  default: return '→';
}, []);
  const getTrustTrendColor = useCallback((trend: string): string => {
  switch (trend) {
  case 'improving': return '#059669';
  case 'declining': return '#ef4444';
  default: return '#6b7280';
}, []);
  // Trust badge helpers
  const getDisplayBadges = useCallback((maxBadges: number = 3): string => {
    return trustData?.badges.slice(0, maxBadges) || [];
  }, [trustData]);
  const getRemainingBadgeCount = useCallback((maxBadges: number = 3): number => {
    const totalBadges = trustData?.badges.length || 0;
    return Math.max(0, totalBadges - maxBadges);
  }, [trustData]);
  return {
  // Core data
  trustData,
  isLoading,
  error,
  lastUpdated,
  // Data management
  loadTrustData,
  refreshTrustData: () => loadTrustData(true),
  // Trust level utilities
  getTrustLevel: (score?: number) => getTrustLevel(score || trustData?.trustScore?.overall),
  getTrustLevelColor,
  getTrustLevelBenefits,
  formatTrustScore,
  // Trust score utilities
  getTrustScoreColor,
  trustScore: trustData?.trustScore?.overall || 0,
  trustTier: trustData?.trustScore?.tier || 'unverified',
  // Verification status
  verificationStatus: trustData?.verificationStatus || {,
  email: false, phone: false, identity: false,
  professional: false, portfolio: false, social: false,
},
  verificationCount: Object.values(trustData?.verificationStatus || {}).filter(Boolean).length,
    shouldShowVerificationPrompt,
    getNextVerificationStep,
    // Community metrics
    communityStanding: trustData?.communityStanding || 'unrated',
    getCommunityStandingColor,
    // Trust trend
    trustTrend: trustData?.trustTrend || 'stable',
    getTrustTrendIcon,
    getTrustTrendColor,
    // Badge utilities
    badges: trustData?.badges || [],
    getDisplayBadges,
    getRemainingBadgeCount,
    // Marketplace metrics
    templateCount: trustData?.templateCount || 0,
    downloadCount: trustData?.downloadCount || 0,
    averageRating: trustData?.averageRating || 0,
    reputationScore: trustData?.reputationScore || 0,
    // Display helpers
    canSellTemplates: (trustData?.trustScore?.overall || 0) >= 65,
    canAccessPremiumFeatures: (trustData?.trustScore?.overall || 0) >= 40,
    isVerifiedCreator: (trustData?.trustScore?.overall || 0) >= 65,
    isProfessionalCreator: (trustData?.trustScore?.overall || 0) >= 80,
    // Quick access properties
    hasEmailVerification: trustData?.verificationStatus.email || false,
    hasPhoneVerification: trustData?.verificationStatus.phone || false,
    hasIdentityVerification: trustData?.verificationStatus.identity || false,
    hasProfessionalVerification: trustData?.verificationStatus.professional || false,
    hasPortfolioVerification: trustData?.verificationStatus.portfolio || false,
    hasSocialVerification: trustData?.verificationStatus.social || false;
  };
};

// Helper functions
function calculateReputationScore(trustScore: TrustScore | null, creatorAnalytics: any): number {
  if (!trustScore) return 0;
  let score = trustScore.overall * 0.7; // Base from trust score;
  // Add marketplace performance
  if (creatorAnalytics) {
    const ratingBonus = (creatorAnalytics.metrics.averageRating || 0) * 5;
    const downloadBonus = Math.min((creatorAnalytics.metrics.totalDownloads || 0) / 100, 10);
    score += ratingBonus + downloadBonus;
  return Math.min(Math.round(score), 100);
function calculateCommunityStanding(((
    trustScore: TrustScore | null,
    creatorAnalytics: any
  ): EnhancedTrustData['communityStanding'] {
  if (!trustScore) return 'unrated';
  const score = trustScore.components.community;
  const rating = creatorAnalytics?.metrics.averageRating || 0;
  const combinedScore = (score + (rating * 20)) / 2;
  if (combinedScore >= 85) return 'excellent';
  if (combinedScore >= 70) return 'good';
  if (combinedScore >= 50) return 'fair';
  if (combinedScore >= 30) return 'poor';
  return 'unrated';
function calculateTrustTrend(trustScore: TrustScore | null): EnhancedTrustData['trustTrend'] {
  if (!trustScore) return 'stable';
  // This would normally compare with historical data
  // For now, mock based on score
  if (trustScore.overall >= 80) return 'improving';
  if (trustScore.overall < 50) return 'declining';
  return 'stable';
function getCachedTrustData(userId: string): { data: EnhancedTrustData; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(`${TRUST_CACHE_KEY}_${userId}`);}
    return cached ? JSON.parse(cached) : null;
  } catch {
  return null;
  function cacheTrustData(userId: string, data: EnhancedTrustData): void {,
  try {
  const cacheData = {
  data,
  timestamp: Date.now(),
};
    localStorage.setItem(`${TRUST_CACHE_KEY}_${userId}`, JSON.stringify(cacheData));}
  } catch {
    // Ignore caching errors

export default useTrustIndicators;