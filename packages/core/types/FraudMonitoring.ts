/**
 * Fraud Monitoring Types - Epic 17
 * 
 * Comprehensive type definitions for advanced fraud monitoring, detection,
 * and prevention systems. Integrates with existing trust scoring, transaction
 * monitoring, and enforcement actions for complete fraud protection.
 * 
 * Task: E17-1753114397354-F17F8C - Create fraud monitoring
 * Epic: 17 - Backstage Admin Controls
 */
import { TimeRange } from '../marketplace/analytics.types';
import { ActionSeverity } from './EnforcementTypes';
import { RiskFactor, FraudIndicator } from './TrustTypes';

// =============================================================================
// Core Fraud Detection Interfaces
// =============================================================================

export interface FraudDetectionResult {
  fraudScore: number; // 0-100 (higher = more likely fraud),
  riskLevel: FraudRiskLevel;,
  confidence: number; // 0-100 confidence in the assessment,
  indicators: FraudIndicator;,
  riskFactors: FraudRiskFactor;
  recommendations: FraudRecommendation;,
  detectionMethod: FraudDetectionMethod;
  timestamp: Date;
  sessionId?: string;
  requiresReview: boolean;,
  autoBlocked: boolean;
}
export type FraudRiskLevel = 'very_low' | 'low' | 'medium' | 'high' | 'very_high' | 'critical';

export interface FraudRiskFactor {
  factor: string;,
  type: FraudFactorType;
  severity: ActionSeverity;,
  weight: number; // 0-1 contribution to overall score,
  confidence: number; // 0-100,
  description: string;,
  evidence: string;
  mitigationActions: string;
}
export type FraudFactorType = 
  | 'payment' 
  | 'behavioral' 
  | 'identity' 
  | 'device' 
  | 'velocity' 
  | 'network' 
  | 'content' 
  | 'account';

export interface FraudRecommendation {
  action: FraudAction;,
  priority: 'immediate' | 'high' | 'medium' | 'low';
  reason: string;,
  automated: boolean;
  requiresHuman: boolean;,
  estimatedImpact: number; // 0-100,
}
export type FraudAction = 
  | 'allow' 
  | 'challenge' 
  | 'review' 
  | 'block' 
  | 'flag' 
  | 'verify_identity' 
  | 'verify_payment' 
  | 'limit_account' 
  | 'require_2fa';

export interface FraudDetectionMethod {
  primary: FraudDetectionTechnique;,
  secondary: FraudDetectionTechnique;
  modelVersion?: string;
  ruleSetVersion?: string;
  mlConfidence?: number;
  processingTime: number; // milliseconds,
}
export type FraudDetectionTechnique = 
  | 'ml_model' 
  | 'rule_engine' 
  | 'behavioral_analysis' 
  | 'velocity_check' 
  | 'device_fingerprint' 
  | 'geo_analysis' 
  | 'network_analysis' 
  | 'pattern_matching' 
  | 'anomaly_detection';

// =============================================================================
// Payment Fraud Detection
// =============================================================================

export interface PaymentFraudAssessment {
  transactionId: string;,
  fraudScore: number;
  riskFactors: PaymentRiskFactor;,
  velocityChecks: VelocityCheck;
  cardTesting: CardTestingAnalysis;,
  chargebackRisk: ChargebackRiskAssessment;
  geolocationRisk: GeolocationRisk;,
  deviceRisk: DeviceRiskAssessment;
  recommendation: PaymentRecommendation;,
  processingTime: number;
  timestamp: Date;
}
export interface PaymentRiskFactor {
  factor: PaymentRiskType;,
  score: number; // 0-100,
  weight: number; // contribution to overall score,
  description: string;,
  evidence: PaymentEvidence;
}
export type PaymentRiskType = 
  | 'high_value_transaction'
  | 'new_payment_method'
  | 'velocity_limit_exceeded'
  | 'suspicious_merchant'
  | 'card_testing_pattern'
  | 'geographic_mismatch'
  | 'device_mismatch'
  | 'unusual_time'
  | 'proxy_vpn_usage'
  | 'known_fraud_pattern';

export interface PaymentEvidence {
  type: 'metadata' | 'behavioral' | 'device' | 'network' | 'historical';,
  data: any;
  confidence: number;,
  source: string;
  timestamp: Date;
}
export interface VelocityCheck {
  metric: VelocityMetric;,
  timeWindow: number; // minutes,
  currentValue: number;,
  threshold: number;
  exceeded: boolean;,
  severity: ActionSeverity;
}
export type VelocityMetric = 
  | 'transaction_count'
  | 'transaction_value'
  | 'failed_attempts'
  | 'unique_cards'
  | 'unique_addresses'
  | 'login_attempts';

export interface CardTestingAnalysis {
  isCardTesting: boolean;,
  confidence: number;
  patterns: CardTestingPattern;,
  recommendations: string;
}
export interface CardTestingPattern {
  pattern: 'sequential_attempts' | 'multiple_cards' | 'small_amounts' | 'rapid_fire' | 'known_bin';,
  detected: boolean;
  evidence: string;,
  severity: ActionSeverity;
}
export interface ChargebackRiskAssessment {
  riskScore: number; // 0-100,
  predictedProbability: number; // 0-1,
  riskFactors: string;,
  historicalChargebackRate: number;
  merchantCategory: string;
  timeToLikelyChargeback?: number; // days,
}
export interface GeolocationRisk {
  riskScore: number;,
  factors: GeoRiskFactor;
  vpnDetected: boolean;,
  proxyDetected: boolean;
  geoMismatch: boolean;,
  suspiciousLocation: boolean;
}
export interface GeoRiskFactor {
  factor: 'distance_from_billing' | 'high_risk_country' | 'vpn_proxy' | 'tor_exit' | 'data_center';,
  detected: boolean;
  severity: ActionSeverity;,
  details: string;
}
export interface DeviceRiskAssessment {
  deviceId: string;,
  riskScore: number;
  isNewDevice: boolean;,
  isTrustedDevice: boolean;
  riskFactors: DeviceRiskFactor;,
  fingerprintConfidence: number;
}
export interface DeviceRiskFactor {
  factor: 'new_device' | 'multiple_accounts' | 'suspicious_browser' | 'tampered_headers' | 'bot_behavior';,
  detected: boolean;
  score: number;,
  evidence: string;
}
export interface PaymentRecommendation {
  action: 'approve' | 'challenge' | 'decline' | 'review';,
  confidence: number;
  reasons: string;,
  requiredVerifications: string;
  holdDuration?: number; // minutes for holds,
  reviewPriority?: 'low' | 'medium' | 'high' | 'urgent';
  // =============================================================================
  // Account Fraud Detection
  // =============================================================================
}
export interface AccountFraudAssessment {
  userId: string;,
  fraudScore: number;
  accountRisk: AccountRiskProfile;,
  identityVerification: IdentityVerificationStatus;
  behavioralAnalysis: BehavioralFraudAnalysis;,
  syntheticIdentityRisk: SyntheticIdentityRisk;
  accountTakeoverRisk: AccountTakeoverRisk;,
  recommendation: AccountRecommendation;
  timestamp: Date;
}
export interface AccountRiskProfile {
  overallRisk: FraudRiskLevel;,
  riskFactors: AccountRiskFactor;
  trustScore: number;,
  verificationLevel: VerificationLevel;
  accountAge: number; // days,
  activityPattern: 'normal' | 'suspicious' | 'dormant' | 'hyperactive';
}
export interface AccountRiskFactor {
  factor: AccountRiskType;,
  severity: ActionSeverity;
  confidence: number;,
  firstDetected: Date;
  lastUpdated: Date;,
  evidence: string;
}
export type AccountRiskType = 
  | 'unverified_identity'
  | 'suspicious_registration'
  | 'multiple_accounts'
  | 'fake_information'
  | 'stolen_identity'
  | 'bot_behavior'
  | 'unusual_activity'
  | 'rapid_escalation'
  | 'trust_violations';

export interface IdentityVerificationStatus {
  level: VerificationLevel;,
  documents: DocumentVerification;
  biometric: BiometricVerification;,
  phoneVerification: PhoneVerification;
  emailVerification: EmailVerification;,
  overallConfidence: number;
  riskFlags: string;
}
export type VerificationLevel = 'none' | 'email' | 'phone' | 'document' | 'biometric' | 'full';

export interface DocumentVerification {
  documentType: 'id_card' | 'passport' | 'drivers_license' | 'utility_bill';,
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  confidence: number;,
  extractedData: any;
  riskFlags: string;
  verifiedAt?: Date;
  expiresAt?: Date;
}
export interface BiometricVerification {
  type: 'face' | 'fingerprint' | 'voice' | 'signature';,
  status: 'pending' | 'verified' | 'failed';
  confidence: number;,
  livenessCheck: boolean;
  spoofingRisk: number;
  verifiedAt?: Date;
}
export interface PhoneVerification {
  phoneNumber: string;,
  verified: boolean;
  riskScore: number;,
  lineType: 'mobile' | 'landline' | 'voip' | 'unknown';
  carrier: string;,
  country: string;
  riskFlags: string;
  verifiedAt?: Date;
}
export interface EmailVerification {
  email: string;,
  verified: boolean;
  riskScore: number;,
  domain: string;
  disposable: boolean;,
  freeProvider: boolean;
  riskFlags: string;
  verifiedAt?: Date;
}
export interface BehavioralFraudAnalysis {
  behaviorScore: number; // 0-100,
  patterns: BehavioralPattern;,
  anomalies: BehavioralAnomaly;
  baseline: BehavioralBaseline;,
  botProbability: number; // 0-1,
  humanLikelihood: number; // 0-1,
}
export interface BehavioralPattern {
  pattern: BehavioralPatternType;,
  frequency: number;
  confidence: number;,
  riskLevel: FraudRiskLevel;
  firstSeen: Date;,
  lastSeen: Date;
}
export type BehavioralPatternType = 
  | 'click_fraud'
  | 'velocity_abuse'
  | 'bot_behavior'
  | 'account_farming'
  | 'fake_engagement'
  | 'scraping_behavior'
  | 'automation_detected';

export interface BehavioralAnomaly {
  anomaly: string;,
  severity: ActionSeverity;
  deviation: number; // how far from baseline,
  confidence: number;,
  timestamp: Date;
  context: any;
}
export interface BehavioralBaseline {
  establishedAt: Date;,
  sampleSize: number;
  confidence: number;,
  patterns: BaselinePattern;
  lastUpdated: Date;
}
export interface BaselinePattern {
  metric: string;,
  average: number;
  standardDeviation: number;,
  min: number;
  max: number;,
  sampleCount: number;
}
export interface SyntheticIdentityRisk {
  riskScore: number; // 0-100,
  indicators: SyntheticIndicator;,
  confidence: number;
  recommendation: 'allow' | 'challenge' | 'block';
}
export interface SyntheticIndicator {
  indicator: SyntheticIndicatorType;,
  detected: boolean;
  confidence: number;,
  evidence: string;
}
export type SyntheticIndicatorType = 
  | 'pii_mismatch'
  | 'credit_invisibility'
  | 'address_inconsistency'
  | 'phone_type_mismatch'
  | 'email_age_mismatch'
  | 'social_footprint_missing'
  | 'identity_elements_mix';

export interface AccountTakeoverRisk {
  riskScore: number;,
  indicators: TakeoverIndicator;
  sessionRisk: SessionRiskAssessment;,
  recommendation: 'allow' | 'challenge' | 'block' | 'force_logout';
}
export interface TakeoverIndicator {
  indicator: TakeoverIndicatorType;,
  detected: boolean;
  severity: ActionSeverity;,
  evidence: string;
  timestamp: Date;
}
export type TakeoverIndicatorType = 
  | 'credential_stuffing'
  | 'unusual_login_pattern'
  | 'device_change'
  | 'location_change'
  | 'password_change'
  | 'contact_info_change'
  | 'payment_method_change'
  | 'behavioral_change';

export interface SessionRiskAssessment {
  sessionId: string;,
  riskScore: number;
  deviceFingerprint: string;,
  ipAddress: string;
  geolocation: SessionGeolocation;,
  userAgent: string;
  riskFactors: SessionRiskFactor;
}
export interface SessionGeolocation {
  country: string;,
  region: string;
  city: string;,
  latitude: number;
  longitude: number;,
  timezone: string;
  isp: string;,
  vpnDetected: boolean;
  proxyDetected: boolean;
}
export interface SessionRiskFactor {
  factor: 'new_device' | 'new_location' | 'vpn_proxy' | 'tor_usage' | 'suspicious_timing';,
  detected: boolean;
  score: number;,
  evidence: string;
}
export interface AccountRecommendation {
  action: 'allow' | 'verify' | 'restrict' | 'suspend' | 'review';,
  priority: 'low' | 'medium' | 'high' | 'urgent';
  verificationRequired: VerificationLevel;,
  restrictions: string;
  monitoringLevel: 'standard' | 'enhanced' | 'intensive';,
  reviewRequired: boolean;
  // =============================================================================
  // Network and Ring Fraud Detection
  // =============================================================================
}
export interface FraudNetworkAnalysis {
  networkId: string;,
  riskScore: number;
  networkType: NetworkType;,
  nodes: NetworkNode;
  connections: NetworkConnection;,
  suspiciousPatterns: NetworkPattern;
  recommendation: NetworkRecommendation;,
  analysisTimestamp: Date;
}
export type NetworkType = 'fraud_ring' | 'bot_network' | 'affiliate_fraud' | 'collusion_ring' | 'account_farming';

export interface NetworkNode {
  nodeId: string;,
  nodeType: 'user' | 'device' | 'ip' | 'payment_method' | 'address';
  riskScore: number;,
  connections: number;
  centrality: number; // importance in network,
  joinedAt: Date;,
  attributes: Record<string, any>;
}
export interface NetworkConnection {
  sourceId: string;,
  targetId: string;
  connectionType: ConnectionType;,
  strength: number; // 0-1,
  confidence: number;,
  evidence: string;
  firstSeen: Date;,
  lastSeen: Date;
}
export type ConnectionType = 
  | 'shared_device'
  | 'shared_ip'
  | 'shared_payment'
  | 'shared_address'
  | 'shared_phone'
  | 'behavioral_similarity'
  | 'temporal_correlation';

export interface NetworkPattern {
  pattern: NetworkPatternType;,
  confidence: number;
  affectedNodes: string;,
  evidence: string;
  riskLevel: FraudRiskLevel;
}
export type NetworkPatternType = 
  | 'circular_transactions'
  | 'burst_registrations'
  | 'coordinated_activity'
  | 'shared_resources'
  | 'velocity_pumping'
  | 'review_manipulation';

export interface NetworkRecommendation {
  action: 'monitor' | 'investigate' | 'flag' | 'block_network';,
  priority: 'low' | 'medium' | 'high' | 'critical';
  affectedAccounts: string;,
  suggestedActions: string;
  investigationRequired: boolean;
  // =============================================================================
  // Fraud Rules Engine
  // =============================================================================
}
export interface FraudRule {
  ruleId: string;,
  name: string;
  description: string;,
  category: FraudRuleCategory;
  severity: ActionSeverity;,
  enabled: boolean;
  conditions: RuleCondition;,
  actions: RuleAction;
  thresholds: RuleThreshold;,
  metadata: RuleMetadata;
}
export type FraudRuleCategory = 
  | 'payment_fraud'
  | 'account_fraud'
  | 'behavioral_fraud'
  | 'velocity_limits'
  | 'content_fraud'
  | 'network_fraud';

export interface RuleCondition {
  field: string;,
  operator: RuleOperator;
  value: any;,
  weight: number; // 0-1,
  required: boolean;
}
export type RuleOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'in_list'
  | 'not_in_list'
  | 'regex_match'
  | 'exists'
  | 'not_exists';

export interface RuleAction {
  action: FraudAction;,
  parameters: Record<string, any>;
  automated: boolean;,
  priority: number;
}
export interface RuleThreshold {
  metric: string;,
  value: number;
  timeWindow?: number; // minutes,
  action: FraudAction;
}
export interface RuleMetadata {
  createdBy: string;,
  createdAt: Date;
  lastModified: Date;,
  version: string;
  tags: string;
  falsePositiveRate?: number;
  truePositiveRate?: number;
  executionCount: number;,
  successCount: number;
  // =============================================================================
  // Machine Learning Models
  // =============================================================================
}
export interface FraudMLModel {
  modelId: string;,
  name: string;
  type: MLModelType;,
  version: string;
  status: MLModelStatus;,
  performance: ModelPerformance;
  features: ModelFeature;,
  training: TrainingInfo;
  deployment: DeploymentInfo;
}
export type MLModelType = 
  | 'supervised_classification'
  | 'unsupervised_clustering'
  | 'anomaly_detection'
  | 'time_series'
  | 'neural_network'
  | 'ensemble';

export type MLModelStatus = 'training' | 'validating' | 'deployed' | 'deprecated' | 'failed';

export interface ModelPerformance {
  accuracy: number;,
  precision: number;
  recall: number;,
  f1Score: number;
  auc: number;,
  falsePositiveRate: number;
  falseNegativeRate: number;,
  lastEvaluated: Date;
}
export interface ModelFeature {
  name: string;,
  type: 'numerical' | 'categorical' | 'boolean' | 'text';
  importance: number; // 0-1,
  description: string;,
  source: string;
}
export interface TrainingInfo {
  datasetSize: number;,
  trainingPeriod: DateRange;
  algorithm: string;,
  hyperparameters: Record<string, any>;
  trainedAt: Date;,
  trainingDuration: number; // minutes,
}
export interface DeploymentInfo {
  deployedAt: Date;,
  deployedBy: string;
  environment: 'development' | 'staging' | 'production';,
  rolloutPercentage: number; // 0-100,
  performanceThreshold: number;,
  autoRollback: boolean;
}
export interface DateRange {
  startDate: Date;,
  endDate: Date;
  // =============================================================================
  // Fraud Analytics and Reporting
  // =============================================================================
}
export interface FraudAnalytics {
  period: AnalyticsPeriod;,
  generatedAt: Date;
  // Overall fraud metrics
  overallMetrics: FraudOverallMetrics;
  // Detection performance
  detectionMetrics: DetectionMetrics;
  // Fraud trends
  trends: FraudTrends;
  // False positive analysis
  falsePositiveAnalysis: FalsePositiveAnalysis;
  // Financial impact
  financialImpact: FinancialImpact;
  // Insights and recommendations
  insights: FraudInsight;,
  recommendations: FraudAnalyticsRecommendation;
}
export interface AnalyticsPeriod {
  startDate: Date;,
  endDate: Date;
  timeRange: TimeRange;
}
export interface FraudOverallMetrics {
  totalTransactions: number;,
  fraudulentTransactions: number;
  fraudRate: number; // percentage,
  blockedTransactions: number;,
  reviewedTransactions: number;
  averageFraudScore: number;
  // Detection metrics
  truePositives: number;,
  falsePositives: number;
  trueNegatives: number;,
  falseNegatives: number;
  // Performance metrics
  accuracy: number;,
  precision: number;
  recall: number;,
  f1Score: number;
}
export interface DetectionMetrics {
  byMethod: DetectionMethodMetrics;,
  byRiskLevel: RiskLevelMetrics;
  responseTime: ResponseTimeMetrics;,
  automationRate: number; // percentage of automated decisions,
}
export interface DetectionMethodMetrics {
  method: FraudDetectionTechnique;,
  detectionCount: number;
  accuracy: number;,
  falsePositiveRate: number;
  averageConfidence: number;,
  averageProcessingTime: number;
}
export interface RiskLevelMetrics {
  riskLevel: FraudRiskLevel;,
  count: number;
  percentage: number;,
  actionTaken: string;
  accuracy: number;
}
export interface ResponseTimeMetrics {
  averageResponseTime: number; // milliseconds,
  percentile95: number;,
  percentile99: number;
  slowestRequests: number;
}
export interface FraudTrends {
  fraudRateTrend: 'increasing' | 'stable' | 'decreasing';,
  volumeTrend: 'increasing' | 'stable' | 'decreasing';
  // Time series data
  dailyFraudRates: number;,
  dailyVolumes: number;
  // Seasonal patterns
  seasonalPatterns: SeasonalFraudPattern;
  // Emerging patterns
  emergingThreats: EmergingThreat;
}
export interface SeasonalFraudPattern {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';,
  pattern: number;
  confidence: number;,
  description: string;
}
export interface EmergingThreat {
  threatId: string;,
  type: string;
  description: string;,
  confidence: number;
  affectedTransactions: number;,
  firstDetected: Date;
  severity: ActionSeverity;
}
export interface FalsePositiveAnalysis {
  overallRate: number;,
  byCategory: CategoryFalsePositive;
  costImpact: number; // lost revenue from false positives,
  trends: FalsePositiveTrend;,
  improvementOpportunities: string;
}
export interface CategoryFalsePositive {
  category: string;,
  count: number;
  rate: number;,
  costImpact: number;
  topReasons: string;
}
export interface FalsePositiveTrend {
  date: Date;,
  rate: number;
  volume: number;
}
export interface FinancialImpact {
  fraudPrevented: number; // total amount saved,
  falsePositiveCost: number; // revenue lost to false positives,
  operationalCost: number; // cost of fraud operations,
  netBenefit: number; // fraudPrevented - falsePositiveCost - operationalCost,
  roi: number; // return on investment,
  // Breakdown by type
  paymentFraudPrevented: number;,
  accountFraudPrevented: number;
  networkFraudPrevented: number;
}
export interface FraudInsight {
  insightId: string;,
  type: 'trend' | 'anomaly' | 'pattern' | 'performance' | 'opportunity';
  title: string;,
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';,
  confidence: number;
  actionable: boolean;,
  relatedData: any;
  generatedAt: Date;
}
export interface FraudAnalyticsRecommendation {
  recommendationId: string;,
  category: 'model_tuning' | 'rule_adjustment' | 'process_improvement' | 'investigation';
  priority: 'low' | 'medium' | 'high' | 'critical';,
  title: string;
  description: string;,
  expectedImpact: string;
  implementation: {,
  effort: 'low' | 'medium' | 'high';,
  timeline: string;
  resources: string;
};
  successMetrics: string;,
  generatedAt: Date;

// =============================================================================
// Fraud Configuration and Settings
// =============================================================================
}
export interface FraudMonitoringConfig {
  enabled: boolean;,
  realTimeMonitoring: boolean;
  mlModelsEnabled: boolean;,
  rulesEngineEnabled: boolean;
  // Detection thresholds
  thresholds: FraudThresholds;
  // Response configuration
  responseConfig: FraudResponseConfig;
  // Integration settings
  integrations: ExternalIntegrations;
  // Performance settings
  performance: PerformanceConfig;
  // Notification settings
  notifications: NotificationConfig;
}
export interface FraudThresholds {
  lowRisk: number; // 0-25,
  mediumRisk: number; // 26-50,
  highRisk: number; // 51-75,
  veryHighRisk: number; // 76-90,
  criticalRisk: number; // 91-100,
  // Auto-action thresholds
  autoApprove: number;,
  autoChallenge: number;
  autoReview: number;,
  autoBlock: number;
}
export interface FraudResponseConfig {
  autoActions: boolean;,
  challengeEnabled: boolean;
  reviewQueueEnabled: boolean;
  // Escalation settings
  escalationThresholds: EscalationThreshold;
  // Appeal settings
  appealEnabled: boolean;,
  appealWindow: number; // hours,
}
export interface EscalationThreshold {
  condition: string;,
  action: string;
  delay: number; // minutes,
  requiredRole: string;
}
export interface ExternalIntegrations {
  fraudServices: FraudServiceIntegration;,
  identityVerification: IdentityServiceIntegration;
  paymentIntelligence: PaymentIntelligenceIntegration;
}
export interface FraudServiceIntegration {
  service: 'sift' | 'forter' | 'kount' | 'signifyd' | 'custom';,
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  confidence: number; // 0-100,
  weight: number; // 0-1 in ensemble,
}
export interface IdentityServiceIntegration {
  service: 'jumio' | 'onfido' | 'trulioo' | 'idology' | 'custom';,
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  verificationLevel: VerificationLevel;
}
export interface PaymentIntelligenceIntegration {
  service: 'stripe_radar' | 'paypal_risk' | 'adyen_riskmanagement' | 'custom';,
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  riskScoreWeight: number; // 0-1,
}
export interface PerformanceConfig {
  maxProcessingTime: number; // milliseconds,
  cacheEnabled: boolean;,
  cacheTtl: number; // seconds,
  batchProcessing: boolean;,
  maxBatchSize: number;
  parallelProcessing: boolean;,
  maxConcurrency: number;
}
export interface NotificationConfig {
  realTimeAlerts: boolean;,
  emailNotifications: boolean;
  slackIntegration?: SlackConfig;
  webhookEndpoints: WebhookConfig;,
  escalationNotifications: boolean;
}
export interface SlackConfig {
  webhookUrl: string;,
  channel: string;
  username: string;,
  alertLevels: FraudRiskLevel;
}
export interface WebhookConfig {
  url: string;,
  events: string;
  headers?: Record<string, string>;
  retryAttempts: number;,
  timeout: number; // seconds,
}