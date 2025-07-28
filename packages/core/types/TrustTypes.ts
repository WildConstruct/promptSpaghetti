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

// =============================================================================
// Core Trust Score Interfaces
// =============================================================================

export interface TrustScore {
  score: number; // 0-100 overall trust score,
  grade: TrustGrade;,
  status: TrustStatus;
  lastUpdated: Date;,
  version: string;
  confidence: number; // 0-100 confidence in the score,
}
export type TrustGrade = 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
export type TrustStatus = 'excellent' | 'good' | 'fair' | 'warning' | 'critical' | 'suspended';

export interface TrustFactor {
  factor: string;,
  weight: number; // 0-1,
  score: number; // 0-100,
  impact: number; // contribution to overall score,
  description: string;,
  evidence: string;
  category: TrustFactorCategory;
}
export type TrustFactorCategory = 
  | 'behavior' 
  | 'quality' 
  | 'security' 
  | 'community' 
  | 'performance' 
  | 'compliance';

// =============================================================================
// User Trust Score
// =============================================================================

export interface UserTrustScore extends TrustScore {
  userId: string;,
  userType: 'creator' | 'buyer' | 'both';
  // Core trust dimensions
  dimensions: UserTrustDimensions;
  // Specialized scores based on user type
  creatorScore?: CreatorTrustScore;
  buyerScore?: BuyerTrustScore;
  // Trust history and trends
  history: TrustScoreHistory;,
  trends: TrustTrends;
  // Risk and safety indicators
  riskFactors: RiskFactor;,
  verificationStatus: VerificationStatus;
  // Metadata
  dataQuality: DataQualityScore;,
  calculationMethod: string;
  export interface UserTrustDimensions {
  reliability: DimensionScore; // Consistency, commitments, responsiveness,
  quality: DimensionScore; // Content/interaction quality,
  community: DimensionScore; // Community engagement, helpfulness,
  security: DimensionScore; // Account security, compliance,
  expertise: DimensionScore; // Domain knowledge, skill level,
}
export interface DimensionScore {
  score: number; // 0-100,
  weight: number; // contribution to overall score,
  factors: TrustFactor;,
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Date;
}
export interface CreatorTrustScore {
  score: number; // 0-100,
  // Creator-specific metrics
  contentQuality: ContentQualityTrustMetrics;,
  marketplaceReputation: ReputationMetrics;
  customerSatisfaction: SatisfactionMetrics;,
  platformCompliance: ComplianceMetrics;
  // Creator performance indicators
  templateCount: number;,
  averageTemplateScore: number;
  customerRetentionRate: number;,
  supportResponseTime: number; // hours,
  // Creator trust badges
  badges: TrustBadge;,
  certifications: Certification;
}
export interface BuyerTrustScore {
  score: number; // 0-100,
  // Buyer-specific metrics
  purchaseHistory: PurchaseHistoryMetrics;,
  reviewQuality: ReviewQualityMetrics;
  communityContribution: CommunityContributionMetrics;,
  paymentReliability: PaymentReliabilityMetrics;
  // Buyer behavior indicators
  averageReviewRating: number;,
  reviewHelpfulnessScore: number;
  disputeRate: number;,
  refundRate: number;
  // =============================================================================
  // Template Trust Score
  // =============================================================================
}
export interface TemplateTrustScore extends TrustScore {
  templateId: string;,
  creatorId: string;
  // Template-specific dimensions
  dimensions: TemplateTrustDimensions;
  // Quality and safety assessment
  qualityAssessment: TemplateQualityAssessment;,
  safetyAssessment: TemplateSafetyAssessment;
  // Community validation
  communityValidation: CommunityValidationMetrics;
  // Performance and reliability
  performanceMetrics: TemplatePerformanceMetrics;
  // Trust indicators
  trustIndicators: TemplateTrustIndicator;,
  warnings: TrustWarning;
  export interface TemplateTrustDimensions {
  contentQuality: DimensionScore; // Code quality, effectiveness,
  safety: DimensionScore; // Security, compliance, risk assessment,
  reliability: DimensionScore; // Stability, error rates, performance,
  community: DimensionScore; // Reviews, adoption, satisfaction,
  transparency: DimensionScore; // Documentation, clarity, openness,
}
export interface TemplateQualityAssessment {
  overallQuality: number; // 0-100,
  codeQuality: number;,
  documentationQuality: number;
  usabilityScore: number;,
  effectivenessScore: number;
  maintenabilityScore: number;,
  qualityTrend: 'improving' | 'stable' | 'declining';
}
export interface TemplateSafetyAssessment {
  overallSafety: number; // 0-100,
  securityScore: number;,
  privacyScore: number;
  complianceScore: number;,
  vulnerabilityCount: number;
  safetyWarnings: SafetyWarning;,
  lastSecurityScan: Date;
}
export interface CommunityValidationMetrics {
  reviewCount: number;,
  averageRating: number;
  ratingDistribution: RatingDistribution;,
  communityTrust: number; // 0-100,
  reportedIssues: number;,
  communityFlags: CommunityFlag;
}
export interface TemplatePerformanceMetrics {
  executionSuccessRate: number; // %,
  averageExecutionTime: number; // milliseconds,
  errorRate: number; // %,
  resourceEfficiency: number; // 0-100,
  scalabilityScore: number; // 0-100,
  uptimePercentage: number; // %,
  // =============================================================================
  // Transaction Trust Score
  // =============================================================================
}
export interface TransactionTrustScore extends TrustScore {
  transactionId: string;,
  buyerId: string;
  sellerId: string;,
  templateId: string;
  // Transaction-specific factors
  factors: TransactionTrustFactors;
  // Risk assessment
  riskAssessment: TransactionRiskAssessment;
  // Fraud detection
  fraudScore: number; // 0-100 (lower is better),
  fraudIndicators: FraudIndicator;
  // Transaction context
  transactionContext: TransactionContext;
  export interface TransactionTrustFactors {
  buyerTrustScore: number;,
  sellerTrustScore: number;
  templateTrustScore: number;,
  transactionAmount: number;
  paymentMethod: string;,
  transactionHistory: number; // between these parties,
}
export interface TransactionRiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';,
  riskScore: number; // 0-100,
  riskFactors: RiskFactor;,
  mitigationStrategies: string;
  recommendedActions: string;
  // =============================================================================
  // Supporting Interfaces
  // =============================================================================
}
export interface TrustScoreHistory {
  date: Date;,
  score: number;
  factors: string;,
  reason: string;
  impact: number;
}
export interface TrustTrends {
  direction: 'improving' | 'stable' | 'declining';,
  velocity: number; // rate of change,
  prediction: number; // predicted score in 30 days,
  confidence: number; // confidence in prediction,
}
export interface RiskFactor {
  factor: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-100,
  impact: number; // potential impact on trust score,
  description: string;,
  mitigation: string;
}
export interface VerificationStatus {
  isVerified: boolean;,
  verificationType: VerificationType;
  verificationDate?: Date;
  verificationExpiry?: Date;
  verificationProvider?: string;
}
export type VerificationType = 
  | 'email' 
  | 'phone' 
  | 'identity' 
  | 'business' 
  | 'expertise' 
  | 'background_check';

export interface DataQualityScore {
  completeness: number; // % of required data present,
  accuracy: number; // % of data that is accurate,
  freshness: number; // how recent the data is,
  consistency: number; // internal consistency of data,
  overallQuality: number; // composite score,
}
export interface ContentQualityTrustMetrics {
  averageQualityScore: number;,
  qualityConsistency: number;
  qualityTrend: 'improving' | 'stable' | 'declining';,
  topPerformingTemplates: number;
  qualityBadges: string;
}
export interface ReputationMetrics {
  overallReputation: number; // 0-100,
  peerRecognition: number;,
  communityStanding: number;
  expertiseRecognition: number;,
  contributionScore: number;
}
export interface SatisfactionMetrics {
  customerSatisfactionScore: number; // 0-100,
  netPromoterScore: number; // -100 to 100,
  customerRetentionRate: number; // %,
  supportSatisfaction: number; // 0-100,
}
export interface ComplianceMetrics {
  complianceScore: number; // 0-100,
  violationCount: number;
  lastViolationDate?: Date;
  complianceHistory: ComplianceEvent;,
  certificationStatus: CertificationStatus;
}
export interface PurchaseHistoryMetrics {
  totalPurchases: number;,
  purchaseValue: number;
  averageOrderValue: number;,
  purchaseFrequency: number; // purchases per month,
  disputeRate: number; // %,
  refundRate: number; // %,
}
export interface ReviewQualityMetrics {
  reviewCount: number;,
  averageReviewLength: number;
  reviewHelpfulnessScore: number; // 0-100,
  reviewAccuracy: number; // how accurate reviews are,
  constructiveFeedbackScore: number; // 0-100,
}
export interface CommunityContributionMetrics {
  helpfulnessScore: number; // 0-100,
  mentorshipScore: number;,
  knowledgeSharingScore: number;
  communityEngagement: number;,
  forumContributions: number;
}
export interface PaymentReliabilityMetrics {
  paymentSuccessRate: number; // %,
  averagePaymentTime: number; // days,
  chargebackRate: number; // %,
  paymentMethodsUsed: number;,
  paymentHistory: PaymentEvent;
}
export interface TrustBadge {
  badgeId: string;,
  name: string;
  description: string;,
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedDate: Date;
  expiryDate?: Date;
  criteria: string;
}
export interface Certification {
  certificationId: string;,
  name: string;
  issuer: string;,
  issuedDate: Date;
  expiryDate?: Date;
  status: 'active' | 'expired' | 'revoked';
  verificationUrl?: string;
}
export interface TemplateTrustIndicator {
  indicator: string;,
  type: 'positive' | 'neutral' | 'negative';
  weight: number;,
  description: string;
  evidenceCount: number;
}
export interface TrustWarning {
  warningId: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;,
  title: string;
  description: string;,
  recommendedAction: string;
  reportedDate: Date;,
  status: 'active' | 'resolved' | 'dismissed';
}
export interface SafetyWarning {
  warningId: string;,
  type: 'security' | 'privacy' | 'content' | 'performance';
  severity: 'low' | 'medium' | 'high' | 'critical';,
  description: string;
  impact: string;,
  recommendation: string;
  detectedDate: Date;
}
export interface RatingDistribution {
  oneStar: number;,
  twoStar: number;
  threeStar: number;,
  fourStar: number;
  fiveStar: number;
}
export interface CommunityFlag {
  flagId: string;,
  type: 'inappropriate' | 'spam' | 'quality' | 'safety' | 'other';
  reason: string;,
  reporterCount: number;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';,
  reportedDate: Date;
}
export interface FraudIndicator {
  indicator: string;,
  type: 'behavioral' | 'transactional' | 'identity' | 'technical';
  severity: 'low' | 'medium' | 'high' | 'critical';,
  confidence: number; // 0-100,
  description: string;,
  detectedDate: Date;
}
export interface TransactionContext {
  deviceInfo: DeviceInfo;,
  locationInfo: LocationInfo;
  timingInfo: TimingInfo;,
  behaviorInfo: BehaviorInfo;
}
export interface DeviceInfo {
  deviceType: string;,
  browser: string;
  operatingSystem: string;,
  ipAddress: string;
  userAgent: string;
}
export interface LocationInfo {
  country: string;,
  region: string;
  city: string;,
  timezone: string;
  isVPN: boolean;
}
export interface TimingInfo {
  transactionTime: Date;,
  sessionDuration: number; // seconds,
  timeOnPage: number; // seconds,
  timeSinceLastTransaction: number; // hours,
}
export interface BehaviorInfo {
  clickPattern: string;,
  typingPattern: string;
  navigationPattern: string;,
  suspiciousActivity: boolean;
}
export interface ComplianceEvent {
  eventId: string;,
  type: 'violation' | 'warning' | 'certification' | 'audit';
  description: string;,
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;,
  resolved: boolean;
  resolutionDate?: Date;
}
export interface CertificationStatus {
  certification: string;,
  status: 'active' | 'expired' | 'pending' | 'revoked';
  issuedDate: Date;
  expiryDate?: Date;
  issuer: string;
}
export interface PaymentEvent {
  eventId: string;,
  type: 'payment' | 'refund' | 'chargeback' | 'dispute';
  amount: number;,
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'cancelled';,
  date: Date;
  paymentMethod: string;
  // =============================================================================
  // Trust Score Configuration
  // =============================================================================
}
export interface TrustScoreConfig {
  version: string;
  // Weight configurations for different user types
  weights: {,
  creator: CreatorTrustWeights;,
  buyer: BuyerTrustWeights;
  template: TemplateTrustWeights;,
  transaction: TransactionTrustWeights;
};
  // Threshold configurations
  thresholds: TrustThresholds;
  // Calculation parameters
  calculation: CalculationConfig;
  // Fraud detection parameters
  fraudDetection: FraudDetectionConfig;
  // Update frequencies
  updateFrequencies: UpdateFrequencyConfig;
}
export interface CreatorTrustWeights {
  reliability: number;,
  quality: number;
  community: number;,
  security: number;
  expertise: number;
}
export interface BuyerTrustWeights {
  reliability: number;,
  quality: number;
  community: number;,
  security: number;
  expertise: number;
}
export interface TemplateTrustWeights {
  contentQuality: number;,
  safety: number;
  reliability: number;,
  community: number;
  transparency: number;
}
export interface TransactionTrustWeights {
  buyerScore: number;,
  sellerScore: number;
  templateScore: number;,
  transactionContext: number;
  historicalData: number;
}
export interface TrustThresholds {
  excellent: number; // 90+,
  good: number;      // 80+,
  fair: number;      // 70+,
  warning: number;   // 60+,
  critical: number;  // <60,
  suspension: number; // <40,
}
export interface CalculationConfig {
  minimumDataPoints: number;,
  historicalWindow: number; // days,
  decayFactor: number; // for older data,
  confidenceThreshold: number;,
  recalculationTriggers: string;
}
export interface FraudDetectionConfig {
  enabled: boolean;,
  sensitivityLevel: 'low' | 'medium' | 'high';
  fraudThreshold: number; // 0-100,
  autoSuspendThreshold: number;,
  alertThreshold: number;
}
export interface UpdateFrequencyConfig {
  realTime: string; // which scores update in real-time,
  hourly: string;,
  daily: string;
  weekly: string;
  // =============================================================================
  // Trust Score Analytics
  // =============================================================================
}
export interface TrustScoreAnalytics {
  period: AnalyticsPeriod;,
  generatedAt: Date;
  // Overall marketplace trust metrics
  overallMetrics: MarketplaceTrustMetrics;
  // Trust distribution across user types
  userTrustDistribution: TrustDistribution;,
  templateTrustDistribution: TrustDistribution;
  // Trust trends
  trustTrends: TrustTrendAnalysis;
  // Risk analysis
  riskAnalysis: RiskAnalysis;
  // Trust insights and recommendations
  insights: TrustInsight;,
  recommendations: TrustRecommendation;
}
export interface AnalyticsPeriod {
  startDate: Date;,
  endDate: Date;
  timeRange: TimeRange;
}
export interface MarketplaceTrustMetrics {
  averageTrustScore: number;,
  trustScoreDistribution: TrustDistribution;
  highTrustUsersPercentage: number;,
  suspendedUsersPercentage: number;
  trustScoreImprovement: number; // % change,
  communityTrustHealth: number; // 0-100,
}
export interface TrustDistribution {
  excellent: number;,
  good: number;
  fair: number;,
  warning: number;
  critical: number;,
  suspended: number;
}
export interface TrustTrendAnalysis {
  overallTrend: 'improving' | 'stable' | 'declining';,
  trendVelocity: number;
  trustScoreVolatility: number;,
  seasonalPatterns: SeasonalPattern;
  trustMilestones: TrustMilestone;
}
export interface SeasonalPattern {
  period: string;,
  impact: number;
  confidence: number;,
  description: string;
}
export interface TrustMilestone {
  date: Date;,
  milestone: string;
  impact: number;,
  description: string;
}
export interface RiskAnalysis {
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';,
  riskFactors: RiskFactor;
  fraudIncidents: number;,
  suspiciousActivityCount: number;
  riskTrends: RiskTrend;
}
export interface RiskTrend {
  riskType: string;,
  trend: 'increasing' | 'stable' | 'decreasing';
  severity: 'low' | 'medium' | 'high' | 'critical';,
  affectedUsers: number;
  impact: string;
}
export interface TrustInsight {
  insightId: string;,
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly';
  title: string;,
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';,
  confidence: number; // 0-100,
  actionable: boolean;,
  relatedMetrics: string;
  generatedAt: Date;
}
export interface TrustRecommendation {
  recommendationId: string;,
  category: 'user_engagement' | 'fraud_prevention' | 'quality_improvement' | 'community_building';
  priority: 'low' | 'medium' | 'high' | 'critical';,
  title: string;
  description: string;,
  expectedImpact: string;
  implementation: {,
  effort: 'low' | 'medium' | 'high';,
  timeline: string;
  resources: string;
};
  success_metrics: string;,
  generatedAt: Date;
}