/**
 * Trust Score Types - Epic 17
 *
 * Comprehensive type definitions for the marketplace trust scoring system.
 * Provides trust assessment for users, creators, templates, and transactions.
 *
 * Task: E17-1753114397410-91A84B - Create trust score
 * Epic: 17 - Backstage Admin Controls
 */
import { TimeRange } from '../marketplace/analytics.types';
export interface TrustScore {
    score: number;
    grade: TrustGrade;
    status: TrustStatus;
    lastUpdated: Date;
    version: string;
    confidence: number;
}
export type TrustGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
export type TrustStatus = 'excellent' | 'good' | 'fair' | 'warning' | 'critical' | 'suspended';
export interface TrustFactor {
    factor: string;
    weight: number;
    score: number;
    impact: number;
    description: string;
    evidence: string;
    category: TrustFactorCategory;
}
export type TrustFactorCategory = 'behavior' | 'quality' | 'security' | 'community' | 'performance' | 'compliance';
export interface UserTrustScore extends TrustScore {
    userId: string;
    userType: 'creator' | 'buyer' | 'both';
    dimensions: UserTrustDimensions;
    creatorScore?: CreatorTrustScore;
    buyerScore?: BuyerTrustScore;
    history: TrustScoreHistory;
    trends: TrustTrends;
    riskFactors: RiskFactor;
    verificationStatus: VerificationStatus;
    dataQuality: DataQualityScore;
    calculationMethod: string;
}
export interface UserTrustDimensions {
    reliability: DimensionScore;
    quality: DimensionScore;
    community: DimensionScore;
    security: DimensionScore;
    expertise: DimensionScore;
}
export interface DimensionScore {
    score: number;
    weight: number;
    factors: TrustFactor;
    trend: 'improving' | 'stable' | 'declining';
    lastUpdated: Date;
}
export interface CreatorTrustScore {
    score: number;
    contentQuality: ContentQualityTrustMetrics;
    marketplaceReputation: ReputationMetrics;
    customerSatisfaction: SatisfactionMetrics;
    platformCompliance: ComplianceMetrics;
    templateCount: number;
    averageTemplateScore: number;
    customerRetentionRate: number;
    supportResponseTime: number;
    badges: TrustBadge;
    certifications: Certification;
}
export interface BuyerTrustScore {
    score: number;
    purchaseHistory: PurchaseHistoryMetrics;
    reviewQuality: ReviewQualityMetrics;
    communityContribution: CommunityContributionMetrics;
    paymentReliability: PaymentReliabilityMetrics;
    averageReviewRating: number;
    reviewHelpfulnessScore: number;
    disputeRate: number;
    refundRate: number;
}
export interface TemplateTrustScore extends TrustScore {
    templateId: string;
    creatorId: string;
    dimensions: TemplateTrustDimensions;
    qualityAssessment: TemplateQualityAssessment;
    safetyAssessment: TemplateSafetyAssessment;
    communityValidation: CommunityValidationMetrics;
    performanceMetrics: TemplatePerformanceMetrics;
    trustIndicators: TemplateTrustIndicator;
    warnings: TrustWarning;
}
export interface TemplateTrustDimensions {
    contentQuality: DimensionScore;
    safety: DimensionScore;
    reliability: DimensionScore;
    community: DimensionScore;
    transparency: DimensionScore;
}
export interface TemplateQualityAssessment {
    overallQuality: number;
    codeQuality: number;
    documentationQuality: number;
    usabilityScore: number;
    effectivenessScore: number;
    maintenabilityScore: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
}
export interface TemplateSafetyAssessment {
    overallSafety: number;
    securityScore: number;
    privacyScore: number;
    complianceScore: number;
    vulnerabilityCount: number;
    safetyWarnings: SafetyWarning;
    lastSecurityScan: Date;
}
export interface CommunityValidationMetrics {
    reviewCount: number;
    averageRating: number;
    ratingDistribution: RatingDistribution;
    communityTrust: number;
    reportedIssues: number;
    communityFlags: CommunityFlag;
}
export interface TemplatePerformanceMetrics {
    executionSuccessRate: number;
    averageExecutionTime: number;
    errorRate: number;
    resourceEfficiency: number;
    scalabilityScore: number;
    uptimePercentage: number;
}
export interface TransactionTrustScore extends TrustScore {
    transactionId: string;
    buyerId: string;
    sellerId: string;
    templateId: string;
    factors: TransactionTrustFactors;
    riskAssessment: TransactionRiskAssessment;
    fraudScore: number;
    fraudIndicators: FraudIndicator;
    transactionContext: TransactionContext;
}
export interface TransactionTrustFactors {
    buyerTrustScore: number;
    sellerTrustScore: number;
    templateTrustScore: number;
    transactionAmount: number;
    paymentMethod: string;
    transactionHistory: number;
}
export interface TransactionRiskAssessment {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    riskFactors: RiskFactor;
    mitigationStrategies: string;
    recommendedActions: string;
}
export interface TrustScoreHistory {
    date: Date;
    score: number;
    factors: string;
    reason: string;
    impact: number;
}
export interface TrustTrends {
    direction: 'improving' | 'stable' | 'declining';
    velocity: number;
    prediction: number;
    confidence: number;
}
export interface RiskFactor {
    factor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number;
    impact: number;
    description: string;
    mitigation: string;
}
export interface VerificationStatus {
    isVerified: boolean;
    verificationType: VerificationType;
    verificationDate?: Date;
    verificationExpiry?: Date;
    verificationProvider?: string;
}
export type VerificationType = 'email' | 'phone' | 'identity' | 'business' | 'expertise' | 'background_check';
export interface DataQualityScore {
    completeness: number;
    accuracy: number;
    freshness: number;
    consistency: number;
    overallQuality: number;
}
export interface ContentQualityTrustMetrics {
    averageQualityScore: number;
    qualityConsistency: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    topPerformingTemplates: number;
    qualityBadges: string;
}
export interface ReputationMetrics {
    overallReputation: number;
    peerRecognition: number;
    communityStanding: number;
    expertiseRecognition: number;
    contributionScore: number;
}
export interface SatisfactionMetrics {
    customerSatisfactionScore: number;
    netPromoterScore: number;
    customerRetentionRate: number;
    supportSatisfaction: number;
}
export interface ComplianceMetrics {
    complianceScore: number;
    violationCount: number;
    lastViolationDate?: Date;
    complianceHistory: ComplianceEvent;
    certificationStatus: CertificationStatus;
}
export interface PurchaseHistoryMetrics {
    totalPurchases: number;
    purchaseValue: number;
    averageOrderValue: number;
    purchaseFrequency: number;
    disputeRate: number;
    refundRate: number;
}
export interface ReviewQualityMetrics {
    reviewCount: number;
    averageReviewLength: number;
    reviewHelpfulnessScore: number;
    reviewAccuracy: number;
    constructiveFeedbackScore: number;
}
export interface CommunityContributionMetrics {
    helpfulnessScore: number;
    mentorshipScore: number;
    knowledgeSharingScore: number;
    communityEngagement: number;
    forumContributions: number;
}
export interface PaymentReliabilityMetrics {
    paymentSuccessRate: number;
    averagePaymentTime: number;
    chargebackRate: number;
    paymentMethodsUsed: number;
    paymentHistory: PaymentEvent;
}
export interface TrustBadge {
    badgeId: string;
    name: string;
    description: string;
    level: 'bronze' | 'silver' | 'gold' | 'platinum';
    earnedDate: Date;
    expiryDate?: Date;
    criteria: string;
}
export interface Certification {
    certificationId: string;
    name: string;
    issuer: string;
    issuedDate: Date;
    expiryDate?: Date;
    status: 'active' | 'expired' | 'revoked';
    verificationUrl?: string;
}
export interface TemplateTrustIndicator {
    indicator: string;
    type: 'positive' | 'neutral' | 'negative';
    weight: number;
    description: string;
    evidenceCount: number;
}
export interface TrustWarning {
    warningId: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: string;
    title: string;
    description: string;
    recommendedAction: string;
    reportedDate: Date;
    status: 'active' | 'resolved' | 'dismissed';
}
export interface SafetyWarning {
    warningId: string;
    type: 'security' | 'privacy' | 'content' | 'performance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: string;
    recommendation: string;
    detectedDate: Date;
}
export interface RatingDistribution {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
}
export interface CommunityFlag {
    flagId: string;
    type: 'inappropriate' | 'spam' | 'quality' | 'safety' | 'other';
    reason: string;
    reporterCount: number;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    reportedDate: Date;
}
export interface FraudIndicator {
    indicator: string;
    type: 'behavioral' | 'transactional' | 'identity' | 'technical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
    detectedDate: Date;
}
export interface TransactionContext {
    deviceInfo: DeviceInfo;
    locationInfo: LocationInfo;
    timingInfo: TimingInfo;
    behaviorInfo: BehaviorInfo;
}
export interface DeviceInfo {
    deviceType: string;
    browser: string;
    operatingSystem: string;
    ipAddress: string;
    userAgent: string;
}
export interface LocationInfo {
    country: string;
    region: string;
    city: string;
    timezone: string;
    isVPN: boolean;
}
export interface TimingInfo {
    transactionTime: Date;
    sessionDuration: number;
    timeOnPage: number;
    timeSinceLastTransaction: number;
}
export interface BehaviorInfo {
    clickPattern: string;
    typingPattern: string;
    navigationPattern: string;
    suspiciousActivity: boolean;
}
export interface ComplianceEvent {
    eventId: string;
    type: 'violation' | 'warning' | 'certification' | 'audit';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    date: Date;
    resolved: boolean;
    resolutionDate?: Date;
}
export interface CertificationStatus {
    certification: string;
    status: 'active' | 'expired' | 'pending' | 'revoked';
    issuedDate: Date;
    expiryDate?: Date;
    issuer: string;
}
export interface PaymentEvent {
    eventId: string;
    type: 'payment' | 'refund' | 'chargeback' | 'dispute';
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending' | 'cancelled';
    date: Date;
    paymentMethod: string;
}
export interface TrustScoreConfig {
    version: string;
    weights: {
        creator: CreatorTrustWeights;
        buyer: BuyerTrustWeights;
        template: TemplateTrustWeights;
        transaction: TransactionTrustWeights;
    };
    thresholds: TrustThresholds;
    calculation: CalculationConfig;
    fraudDetection: FraudDetectionConfig;
    updateFrequencies: UpdateFrequencyConfig;
}
export interface CreatorTrustWeights {
    reliability: number;
    quality: number;
    community: number;
    security: number;
    expertise: number;
}
export interface BuyerTrustWeights {
    reliability: number;
    quality: number;
    community: number;
    security: number;
    expertise: number;
}
export interface TemplateTrustWeights {
    contentQuality: number;
    safety: number;
    reliability: number;
    community: number;
    transparency: number;
}
export interface TransactionTrustWeights {
    buyerScore: number;
    sellerScore: number;
    templateScore: number;
    transactionContext: number;
    historicalData: number;
}
export interface TrustThresholds {
    excellent: number;
    good: number;
    fair: number;
    warning: number;
    critical: number;
    suspension: number;
}
export interface CalculationConfig {
    minimumDataPoints: number;
    historicalWindow: number;
    decayFactor: number;
    confidenceThreshold: number;
    recalculationTriggers: string;
}
export interface FraudDetectionConfig {
    enabled: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    fraudThreshold: number;
    autoSuspendThreshold: number;
    alertThreshold: number;
}
export interface UpdateFrequencyConfig {
    realTime: string;
    hourly: string;
    daily: string;
    weekly: string;
}
export interface TrustScoreAnalytics {
    period: AnalyticsPeriod;
    generatedAt: Date;
    overallMetrics: MarketplaceTrustMetrics;
    userTrustDistribution: TrustDistribution;
    templateTrustDistribution: TrustDistribution;
    trustTrends: TrustTrendAnalysis;
    riskAnalysis: RiskAnalysis;
    insights: TrustInsight;
    recommendations: TrustRecommendation;
}
export interface AnalyticsPeriod {
    startDate: Date;
    endDate: Date;
    timeRange: TimeRange;
}
export interface MarketplaceTrustMetrics {
    averageTrustScore: number;
    trustScoreDistribution: TrustDistribution;
    highTrustUsersPercentage: number;
    suspendedUsersPercentage: number;
    trustScoreImprovement: number;
    communityTrustHealth: number;
}
export interface TrustDistribution {
    excellent: number;
    good: number;
    fair: number;
    warning: number;
    critical: number;
    suspended: number;
}
export interface TrustTrendAnalysis {
    overallTrend: 'improving' | 'stable' | 'declining';
    trendVelocity: number;
    trustScoreVolatility: number;
    seasonalPatterns: SeasonalPattern;
    trustMilestones: TrustMilestone;
}
export interface SeasonalPattern {
    period: string;
    impact: number;
    confidence: number;
    description: string;
}
export interface TrustMilestone {
    date: Date;
    milestone: string;
    impact: number;
    description: string;
}
export interface RiskAnalysis {
    overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: RiskFactor;
    fraudIncidents: number;
    suspiciousActivityCount: number;
    riskTrends: RiskTrend;
}
export interface RiskTrend {
    riskType: string;
    trend: 'increasing' | 'stable' | 'decreasing';
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedUsers: number;
    impact: string;
}
export interface TrustInsight {
    insightId: string;
    type: 'opportunity' | 'risk' | 'trend' | 'anomaly';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    actionable: boolean;
    relatedMetrics: string;
    generatedAt: Date;
}
export interface TrustRecommendation {
    recommendationId: string;
    category: 'user_engagement' | 'fraud_prevention' | 'quality_improvement' | 'community_building';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImpact: string;
    implementation: {
        effort: 'low' | 'medium' | 'high';
        timeline: string;
        resources: string;
    };
    success_metrics: string;
    generatedAt: Date;
}
//# sourceMappingURL=TrustTypes.d.ts.map