/**
 * Promotion Service Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 * 
 * Service contracts and API interfaces for promotion management operations
 * including CRUD, eligibility checking, application, and analytics.
 */
import {
  BasePromotion,
  DiscountPromotion,
  ContentPromotion,
  BundlePromotion,
  CampaignPromotion,
  PromotionType,
  PromotionStatus,
  PromotionServiceResponse,
  PromotionEligibilityCheck,
  PromotionApplicationResult,
  PromotionSearchCriteria,
  PromotionSearchResult,
  PromotionPerformanceMetrics,
  PromotionRule,
  PromotionTemplate,
  PromotionAuditLog
} from './PromotionInterfaces';

// =============================================================================
// Core Promotion Management Service
// =============================================================================

}
export interface IPromotionService {
  // CRUD Operations
  createPromotion(promotionData: CreatePromotionRequest): Promise<PromotionServiceResponse<BasePromotion>>;
  getPromotion(promotionId: string): Promise<PromotionServiceResponse<BasePromotion>>;
  updatePromotion(promotionId: string, updates: UpdatePromotionRequest): Promise<PromotionServiceResponse<BasePromotion>>;
  deletePromotion(promotionId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
  // Bulk Operations
  createPromotions(promotions: CreatePromotionRequest): Promise<PromotionServiceResponse<BasePromotion>>;

}
  updatePromotions(updates: Array<{ id: string; data: UpdatePromotionRequest }>): Promise<PromotionServiceResponse<BasePromotion>>;
  deletePromotions(promotionIds: string, deletedBy: string): Promise<PromotionServiceResponse<BulkOperationResult>>;
  // Search and Discovery
  searchPromotions(criteria: PromotionSearchCriteria): Promise<PromotionServiceResponse<PromotionSearchResult>>;
  getActivePromotions(filters?: ActivePromotionFilters): Promise<PromotionServiceResponse<BasePromotion>>;
  getPromotionsByType<T extends BasePromotion>(type: PromotionType): Promise<PromotionServiceResponse<T>>;
  // Status Management
  activatePromotion(promotionId: string, activatedBy: string): Promise<PromotionServiceResponse<BasePromotion>>;
  pausePromotion(promotionId: string, pausedBy: string, reason?: string): Promise<PromotionServiceResponse<BasePromotion>>;
  cancelPromotion(promotionId: string, cancelledBy: string, reason: string): Promise<PromotionServiceResponse<BasePromotion>>;
  // Validation
  validatePromotion(promotionData: Partial<BasePromotion>): Promise<PromotionServiceResponse<PromotionValidationResult>>;
  checkPromotionConflicts(promotionId: string): Promise<PromotionServiceResponse<PromotionConflictCheck>>;

// =============================================================================
// Promotion Application and Eligibility Service
// =============================================================================
}
}
export interface IPromotionEligibilityService {
  // Eligibility Checking
  checkEligibility(request: EligibilityCheckRequest): Promise<PromotionServiceResponse<PromotionEligibilityCheck>>;
  checkMultipleEligibility(request: MultipleEligibilityCheckRequest): Promise<PromotionServiceResponse<PromotionEligibilityCheck>>;
  checkUserPromotionEligibility(userId: string, filters?: EligibilityFilters): Promise<PromotionServiceResponse<PromotionEligibilityCheck>>;
  // Promotion Application
  applyPromotion(request: ApplyPromotionRequest): Promise<PromotionServiceResponse<PromotionApplicationResult>>;
  removePromotion(request: RemovePromotionRequest): Promise<PromotionServiceResponse<PromotionApplicationResult>>;
  // Automatic Promotion Detection
  findApplicablePromotions(context: PromotionContext): Promise<PromotionServiceResponse<ApplicablePromotionsResult>>;
  getRecommendedPromotions(userId: string, context?: PromotionContext): Promise<PromotionServiceResponse<PromotionRecommendation>>;
  // Cart Integration
  evaluateCartPromotions(cartId: string, userId: string): Promise<PromotionServiceResponse<CartPromotionEvaluation>>;
  applyBestPromotions(cartId: string, userId: string): Promise<PromotionServiceResponse<CartPromotionApplication>>;
  // Promo Code Handling
  validatePromoCode(promoCode: string, userId: string, context?: PromotionContext): Promise<PromotionServiceResponse<PromoCodeValidation>>;
  applyPromoCode(promoCode: string, cartId: string, userId: string): Promise<PromotionServiceResponse<PromotionApplicationResult>>;
  // =============================================================================
  // Content Promotion Service
  // =============================================================================
}
}
}
export interface IContentPromotionService {
  // Content Selection and Management
  createContentPromotion(promotionData: CreateContentPromotionRequest): Promise<PromotionServiceResponse<ContentPromotion>>;
  updateContentSelection(promotionId: string, contentIds: string): Promise<PromotionServiceResponse<ContentPromotion>>;
  refreshContentSelection(promotionId: string): Promise<PromotionServiceResponse<ContentPromotion>>;
  // Content Display and Placement
  getPromotedContent(location: string, userId?: string, limit?: number): Promise<PromotionServiceResponse<PromotedContent>>;
  getContentByPromotionSlot(slotId: string): Promise<PromotionServiceResponse<PromotedContent>>;
  // Content Performance
  trackContentView(contentId: string, promotionId: string, userId?: string): Promise<PromotionServiceResponse<void>>;
  trackContentClick(contentId: string, promotionId: string, userId?: string): Promise<PromotionServiceResponse<void>>;
  trackContentConversion(contentId: string, promotionId: string, userId: string, conversionData: ConversionData): Promise<PromotionServiceResponse<void>>;
  // Content Analytics
  getContentPromotionAnalytics(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<ContentPromotionAnalytics>>;
  getContentPerformanceReport(contentIds: string, dateRange?: DateRange): Promise<PromotionServiceResponse<ContentPerformanceReport>>;
  // A/B Testing
  createContentABTest(testConfig: ContentABTestConfig): Promise<PromotionServiceResponse<ContentABTest>>;
  getABTestResults(testId: string): Promise<PromotionServiceResponse<ABTestResults>>;
  // =============================================================================
  // Campaign Management Service
  // =============================================================================
}
}
}
export interface ICampaignService {
  // Campaign CRUD
  createCampaign(campaignData: CreateCampaignRequest): Promise<PromotionServiceResponse<CampaignPromotion>>;
  getCampaign(campaignId: string): Promise<PromotionServiceResponse<CampaignPromotion>>;
  updateCampaign(campaignId: string, updates: UpdateCampaignRequest): Promise<PromotionServiceResponse<CampaignPromotion>>;
  deleteCampaign(campaignId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
  // Campaign Execution
  launchCampaign(campaignId: string, launchedBy: string): Promise<PromotionServiceResponse<CampaignLaunchResult>>;
  pauseCampaign(campaignId: string, pausedBy: string): Promise<PromotionServiceResponse<CampaignPromotion>>;
  resumeCampaign(campaignId: string, resumedBy: string): Promise<PromotionServiceResponse<CampaignPromotion>>;
  // Multi-Channel Management
  configureChannel(campaignId: string, channelConfig: CampaignChannelConfig): Promise<PromotionServiceResponse<CampaignPromotion>>;
  updateChannelBudget(campaignId: string, channel: string, newBudget: number): Promise<PromotionServiceResponse<CampaignPromotion>>;
  // Campaign Analytics
  getCampaignPerformance(campaignId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<CampaignPerformanceReport>>;
  getCampaignROI(campaignId: string): Promise<PromotionServiceResponse<CampaignROIReport>>;
  // Budget Management
  updateCampaignBudget(campaignId: string, budgetUpdates: CampaignBudgetUpdate): Promise<PromotionServiceResponse<CampaignPromotion>>;
  getCampaignSpending(campaignId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<CampaignSpendingReport>>;
  // =============================================================================
  // Promotion Analytics Service
  // =============================================================================
}
}
}
export interface IPromotionAnalyticsService {
  // Performance Analytics
  getPromotionPerformance(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionPerformanceReport>>;
  getMultiplePromotionPerformance(promotionIds: string, dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionPerformanceReport>>;
  // Comparative Analytics
  comparePromotions(promotionIds: string, metrics: string, dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionComparisonReport>>;
  benchmarkPromotion(promotionId: string, benchmarkType: BenchmarkType): Promise<PromotionServiceResponse<PromotionBenchmarkReport>>;
  // Revenue Analytics
  getPromotionRevenue(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<RevenueAnalyticsReport>>;
  getRevenueImpact(promotionIds: string, dateRange?: DateRange): Promise<PromotionServiceResponse<RevenueImpactReport>>;
  calculateROI(promotionId: string): Promise<PromotionServiceResponse<ROICalculation>>;
  // User Analytics
  getPromotionUserMetrics(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionUserMetrics>>;
  getUserPromotionHistory(userId: string, limit?: number): Promise<PromotionServiceResponse<UserPromotionHistory>>;
  // Trend Analytics
  getPromotionTrends(dateRange: DateRange, groupBy: TrendGrouping): Promise<PromotionServiceResponse<PromotionTrendReport>>;
  getSeasonalAnalysis(promotionType?: PromotionType, years?: number): Promise<PromotionServiceResponse<SeasonalAnalysisReport>>;
  // Predictive Analytics
  predictPromotionPerformance(promotionData: PredictionRequest): Promise<PromotionServiceResponse<PerformancePrediction>>;
  getOptimizationRecommendations(promotionId: string): Promise<PromotionServiceResponse<OptimizationRecommendation>>;
  // Real-time Analytics
  getRealtimePromotionStats(promotionId: string): Promise<PromotionServiceResponse<RealtimePromotionStats>>;
  subscribeToPromotionUpdates(promotionId: string, callback: PromotionUpdateCallback): Promise<PromotionServiceResponse<SubscriptionHandle>>;
  // =============================================================================
  // Promotion Rules Engine Service
  // =============================================================================
}
}
}
export interface IPromotionRulesService {
  // Rule Management
  createRule(ruleData: CreateRuleRequest): Promise<PromotionServiceResponse<PromotionRule>>;
  getRule(ruleId: string): Promise<PromotionServiceResponse<PromotionRule>>;
  updateRule(ruleId: string, updates: UpdateRuleRequest): Promise<PromotionServiceResponse<PromotionRule>>;
  deleteRule(ruleId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
  // Rule Execution
  evaluateRules(context: RuleEvaluationContext): Promise<PromotionServiceResponse<RuleEvaluationResult>>;
  executeRule(ruleId: string, context: RuleEvaluationContext): Promise<PromotionServiceResponse<RuleExecutionResult>>;
  // Rule Testing
  testRule(ruleData: PromotionRule, testContext: RuleEvaluationContext): Promise<PromotionServiceResponse<RuleTestResult>>;
  validateRuleLogic(ruleData: PromotionRule): Promise<PromotionServiceResponse<RuleValidationResult>>;
  // Rule Performance
  getRulePerformance(ruleId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<RulePerformanceReport>>;
  optimizeRules(criteria: RuleOptimizationCriteria): Promise<PromotionServiceResponse<RuleOptimizationResult>>;
  // =============================================================================
  // Promotion Template Service
  // =============================================================================
}
}
}
export interface IPromotionTemplateService {
  // Template Management
  createTemplate(templateData: CreateTemplateRequest): Promise<PromotionServiceResponse<PromotionTemplate>>;
  getTemplate(templateId: string): Promise<PromotionServiceResponse<PromotionTemplate>>;
  updateTemplate(templateId: string, updates: UpdateTemplateRequest): Promise<PromotionServiceResponse<PromotionTemplate>>;
  deleteTemplate(templateId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
  // Template Discovery
  getTemplates(filters?: TemplateFilters): Promise<PromotionServiceResponse<PromotionTemplate>>;
  getPopularTemplates(limit?: number): Promise<PromotionServiceResponse<PromotionTemplate>>;
  getRecommendedTemplates(context: TemplateRecommendationContext): Promise<PromotionServiceResponse<PromotionTemplate>>;
  // Template Usage
  createPromotionFromTemplate(templateId: string, customizations: TemplateCustomization): Promise<PromotionServiceResponse<BasePromotion>>;
  cloneTemplate(templateId: string, newName: string, customizations?: TemplateCustomization): Promise<PromotionServiceResponse<PromotionTemplate>>;
  // Template Analytics
  getTemplateUsageStats(templateId: string): Promise<PromotionServiceResponse<TemplateUsageStats>>;
  getTemplatePerformance(templateId: string): Promise<PromotionServiceResponse<TemplatePerformanceStats>>;
  // =============================================================================
  // Request/Response Type Definitions
  // =============================================================================
}
}
}
export interface CreatePromotionRequest {
  type: PromotionType;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  timezone: string;
  // Type-specific configuration
  discount_config?: any; // Will be typed based on promotion type,
  content_config?: any;
  bundle_config?: any;
  campaign_config?: any;
  // Targeting and application
  targeting_rules: any;
  application_type: string;
  promo_code?: string;
  usage_limit?: number;
  // Metadata
  metadata?: Record<string, any>;
  tags?: string;
  created_by: string;
}
}
}
export interface UpdatePromotionRequest {
  name?: string;
  description?: string;
  status?: PromotionStatus;
  enabled?: boolean;
  start_date?: Date;
  end_date?: Date;
  usage_limit?: number;
  targeting_rules?: any;
  metadata?: Record<string, any>;
  tags?: string;
  updated_by: string;
}
}
}
export interface EligibilityCheckRequest {
  promotion_id: string;
  user_id: string;
  cart_id?: string;
  item_ids?: string;
  promo_code?: string;
  context?: PromotionContext;
}
}
}
export interface MultipleEligibilityCheckRequest {
  promotion_ids: string;
  user_id: string;
  cart_id?: string;
  item_ids?: string;
  context?: PromotionContext;
}
}
}
export interface ApplyPromotionRequest {
  promotion_id: string;
  user_id: string;
  cart_id: string;
  promo_code?: string;
  force_apply?: boolean;
  context?: PromotionContext;
}
}
}
export interface RemovePromotionRequest {
  promotion_id: string;
  user_id: string;
  cart_id: string;
  reason?: string;
}
}
}
export interface PromotionContext {
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  campaign_source?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  location?: {
  country: string;
  region?: string;
  city?: string;
}
};
  session_data?: Record<string, any>;
  custom_attributes?: Record<string, any>;
}
}
export interface ActivePromotionFilters {
  type?: PromotionType;
  applicable_to_user?: string;
  location?: string;
  limit?: number;
}
}
}
export interface PromotionValidationResult {
  valid: boolean;
  errors: ValidationError;
  warnings: ValidationWarning;
  suggestions: string;
}
}
}
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning'
}
  }
}
export interface ValidationWarning {
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high'
}
  }
}
export interface PromotionConflictCheck {
  has_conflicts: boolean;
  conflicts: Array<{
  conflicting_promotion_id: string;
  conflict_type: 'time_overlap' | 'mutual_exclusion' | 'resource_conflict';
  description: string;
  severity: 'blocking' | 'warning'
}
  }>;
  recommendations: string;
}
}
export interface BulkOperationResult {
  total_processed: number;
  successful: number;
  failed: number;
  results: Array<{
  id: string;
  success: boolean;
  error?: string;
}
}>;
}
}
export interface ApplicablePromotionsResult {
  applicable_promotions: PromotionEligibilityCheck;
  auto_applied: string; // Promotion IDs that were automatically applied,
  suggested: PromotionRecommendation;
  total_potential_savings_cents: number;
}
}
}
export interface PromotionRecommendation {
  promotion_id: string;
  promotion_name: string;
  promotion_type: PromotionType;
  potential_savings_cents: number;
  confidence_score: number; // 0-1,
  recommendation_reason: string;
  call_to_action: string;
  expires_at?: Date;
}
}
}
export interface CartPromotionEvaluation {
  cart_id: string;
  current_promotions: string;
  applicable_promotions: PromotionEligibilityCheck;
  potential_savings_cents: number;
  optimization_suggestions: PromotionOptimizationSuggestion;
}
}
}
export interface PromotionOptimizationSuggestion {
  type: 'add_item' | 'increase_quantity' | 'apply_code' | 'stack_promotion';
  description: string;
  additional_savings_cents: number;
  required_actions: string;
}
}
}
export interface CartPromotionApplication {
  cart_id: string;
  applied_promotions: PromotionApplicationResult;
  total_savings_cents: number;
  final_cart_total_cents: number;
  optimization_performed: boolean;
}
}
}
export interface PromoCodeValidation {
  valid: boolean;
  promotion_id?: string;
  promotion_name?: string;
  discount_preview?: {
  type: string;
  amount_cents?: number;
  percentage?: number;
}
};
  error_code?: string;
  error_message?: string;
  expires_at?: Date;

// =============================================================================
// Analytics Response Types
// =============================================================================
}
}
export interface PromotionPerformanceReport {
  promotion_id: string;
  promotion_name: string;
  date_range: DateRange;
  // Core metrics
  metrics: PromotionPerformanceMetrics;
  // Time series data
  time_series: Array<{
  date: string;
  usage_count: number;
  revenue_cents: number;
  conversion_rate: number;
}
}>;
  // Segmentation analysis
  user_segments: Array<{
  segment_name: string;
  usage_count: number;
  conversion_rate: number;
  average_order_value_cents: number;
}>;
  // Performance insights
  insights: PerformanceInsight;
  recommendations: OptimizationRecommendation;
}
}
export interface PerformanceInsight {
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  impact_score: number; // 0-100,
  confidence: number; // 0-1,
  supporting_data: Record<string, any>;
}
}
}
export interface OptimizationRecommendation {
  type: 'increase_budget' | 'adjust_targeting' | 'modify_timing' | 'change_discount' | 'extend_duration';
  title: string;
  description: string;
  expected_impact: string;
  effort_level: 'low' | 'medium' | 'high';
  priority_score: number; // 0-100,
  implementation_steps: string;
}
}
}
export interface DateRange {
  start_date: Date;
  end_date: Date;
}
}
}
export interface BenchmarkType {
  type: 'industry' | 'category' | 'historical' | 'similar_promotions';
  parameters?: Record<string, any>;
}
}
}
export interface RevenueAnalyticsReport {
  promotion_id: string;
  date_range: DateRange;
  // Revenue metrics
  total_revenue_cents: number;
  incremental_revenue_cents: number; // Revenue attributed to promotion,
  revenue_per_use_cents: number;
  // Cost analysis
  total_discount_given_cents: number;
  cost_of_promotion_cents: number; // Including operational costs,
  net_revenue_impact_cents: number;
  // ROI calculations
  roi_percentage: number;
  payback_period_days?: number;
  break_even_usage_count: number;
  // Revenue distribution
  revenue_by_segment: Array<{
  segment: string;
  revenue_cents: number;
  percentage: number;
}
}>;
  // Trends
  daily_revenue: Array<{
  date: string;
  revenue_cents: number;
  usage_count: number;
}>;
}
}
export interface UserPromotionHistory {
  promotion_id: string;
  promotion_name: string;
  promotion_type: PromotionType;
  used_at: Date;
  discount_received_cents: number;
  order_total_cents: number;
  items_purchased: number;
  // =============================================================================
  // Event and Callback Types
  // =============================================================================
}
}
}
export interface PromotionUpdateCallback {
  (update: PromotionUpdate): void;
}
}
}
export interface PromotionUpdate {
  promotion_id: string;
  update_type: 'usage' | 'performance' | 'status_change';
  data: any;
  timestamp: Date;
}
}
}
export interface SubscriptionHandle {
  unsubscribe(): void;
  // =============================================================================
  // Export all service interfaces
  // =============================================================================
}
}
export type {
  IPromotionService,
  IPromotionEligibilityService,
  IContentPromotionService,
  ICampaignService,
  IPromotionAnalyticsService,
  IPromotionRulesService,
  IPromotionTemplateService
};