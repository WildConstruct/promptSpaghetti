/**
 * Promotion Service Interfaces - Epic 17 Implementation
 * Task: E17-1753114397317-A8CDBE - Design promotion interfaces
 *
 * Service contracts and API interfaces for promotion management operations
 * including CRUD, eligibility checking, application, and analytics.
 */
import { BasePromotion, ContentPromotion, CampaignPromotion, PromotionType, PromotionStatus, PromotionServiceResponse, PromotionEligibilityCheck, PromotionApplicationResult, PromotionSearchCriteria, PromotionSearchResult, PromotionPerformanceMetrics, PromotionRule, PromotionTemplate } from './PromotionInterfaces';
export interface IPromotionService {
    createPromotion(promotionData: CreatePromotionRequest): Promise<PromotionServiceResponse<BasePromotion>>;
    getPromotion(promotionId: string): Promise<PromotionServiceResponse<BasePromotion>>;
    updatePromotion(promotionId: string, updates: UpdatePromotionRequest): Promise<PromotionServiceResponse<BasePromotion>>;
    deletePromotion(promotionId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
    createPromotions(promotions: CreatePromotionRequest[]): Promise<PromotionServiceResponse<BasePromotion[]>>;
    updatePromotions(updates: Array<{)
        id: string;
        data: UpdatePromotionRequest;
    }>): Promise<PromotionServiceResponse<BasePromotion[]>>;
    deletePromotions(promotionIds: string[], deletedBy: string): Promise<PromotionServiceResponse<BulkOperationResult>>;
    searchPromotions(criteria: PromotionSearchCriteria): Promise<PromotionServiceResponse<PromotionSearchResult>>;
    getActivePromotions(filters?: ActivePromotionFilters): Promise<PromotionServiceResponse<BasePromotion[]>>;
    getPromotionsByType<T extends BasePromotion>(type: PromotionType): Promise<PromotionServiceResponse<T[]>>;
    activatePromotion(promotionId: string, activatedBy: string): Promise<PromotionServiceResponse<BasePromotion>>;
    pausePromotion(promotionId: string, pausedBy: string, reason?: string): Promise<PromotionServiceResponse<BasePromotion>>;
    cancelPromotion(promotionId: string, cancelledBy: string, reason: string): Promise<PromotionServiceResponse<BasePromotion>>;
    validatePromotion(promotionData: Partial<BasePromotion>): Promise<PromotionServiceResponse<PromotionValidationResult>>;
    checkPromotionConflicts(promotionId: string): Promise<PromotionServiceResponse<PromotionConflictCheck>>;
}
export interface IPromotionEligibilityService {
    checkEligibility(request: EligibilityCheckRequest): Promise<PromotionServiceResponse<PromotionEligibilityCheck>>;
    checkMultipleEligibility(request: MultipleEligibilityCheckRequest): Promise<PromotionServiceResponse<PromotionEligibilityCheck[]>>;
    checkUserPromotionEligibility(userId: string, filters?: EligibilityFilters): Promise<PromotionServiceResponse<PromotionEligibilityCheck[]>>;
    applyPromotion(request: ApplyPromotionRequest): Promise<PromotionServiceResponse<PromotionApplicationResult>>;
    removePromotion(request: RemovePromotionRequest): Promise<PromotionServiceResponse<PromotionApplicationResult>>;
    findApplicablePromotions(context: PromotionContext): Promise<PromotionServiceResponse<ApplicablePromotionsResult>>;
    getRecommendedPromotions(userId: string, context?: PromotionContext): Promise<PromotionServiceResponse<PromotionRecommendation[]>>;
    evaluateCartPromotions(cartId: string, userId: string): Promise<PromotionServiceResponse<CartPromotionEvaluation>>;
    applyBestPromotions(cartId: string, userId: string): Promise<PromotionServiceResponse<CartPromotionApplication>>;
    validatePromoCode(promoCode: string, userId: string, context?: PromotionContext): Promise<PromotionServiceResponse<PromoCodeValidation>>;
    applyPromoCode(promoCode: string, cartId: string, userId: string): Promise<PromotionServiceResponse<PromotionApplicationResult>>;
}
export interface IContentPromotionService {
    createContentPromotion(promotionData: CreateContentPromotionRequest): Promise<PromotionServiceResponse<ContentPromotion>>;
    updateContentSelection(promotionId: string, contentIds: string[]): Promise<PromotionServiceResponse<ContentPromotion>>;
    refreshContentSelection(promotionId: string): Promise<PromotionServiceResponse<ContentPromotion>>;
    getPromotedContent(location: string, userId?: string, limit?: number): Promise<PromotionServiceResponse<PromotedContent[]>>;
    getContentByPromotionSlot(slotId: string): Promise<PromotionServiceResponse<PromotedContent[]>>;
    trackContentView(contentId: string, promotionId: string, userId?: string): Promise<PromotionServiceResponse<void>>;
    trackContentClick(contentId: string, promotionId: string, userId?: string): Promise<PromotionServiceResponse<void>>;
    trackContentConversion(contentId: string, promotionId: string, userId: string, conversionData: ConversionData): Promise<PromotionServiceResponse<void>>;
    getContentPromotionAnalytics(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<ContentPromotionAnalytics>>;
    getContentPerformanceReport(contentIds: string[], dateRange?: DateRange): Promise<PromotionServiceResponse<ContentPerformanceReport>>;
    createContentABTest(testConfig: ContentABTestConfig): Promise<PromotionServiceResponse<ContentABTest>>;
    getABTestResults(testId: string): Promise<PromotionServiceResponse<ABTestResults>>;
}
export interface ICampaignService {
    createCampaign(campaignData: CreateCampaignRequest): Promise<PromotionServiceResponse<CampaignPromotion>>;
    getCampaign(campaignId: string): Promise<PromotionServiceResponse<CampaignPromotion>>;
    updateCampaign(campaignId: string, updates: UpdateCampaignRequest): Promise<PromotionServiceResponse<CampaignPromotion>>;
    deleteCampaign(campaignId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
    launchCampaign(campaignId: string, launchedBy: string): Promise<PromotionServiceResponse<CampaignLaunchResult>>;
    pauseCampaign(campaignId: string, pausedBy: string): Promise<PromotionServiceResponse<CampaignPromotion>>;
    resumeCampaign(campaignId: string, resumedBy: string): Promise<PromotionServiceResponse<CampaignPromotion>>;
    configureChannel(campaignId: string, channelConfig: CampaignChannelConfig): Promise<PromotionServiceResponse<CampaignPromotion>>;
    updateChannelBudget(campaignId: string, channel: string, newBudget: number): Promise<PromotionServiceResponse<CampaignPromotion>>;
    getCampaignPerformance(campaignId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<CampaignPerformanceReport>>;
    getCampaignROI(campaignId: string): Promise<PromotionServiceResponse<CampaignROIReport>>;
    updateCampaignBudget(campaignId: string, budgetUpdates: CampaignBudgetUpdate): Promise<PromotionServiceResponse<CampaignPromotion>>;
    getCampaignSpending(campaignId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<CampaignSpendingReport>>;
}
export interface IPromotionAnalyticsService {
    getPromotionPerformance(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionPerformanceReport>>;
    getMultiplePromotionPerformance(promotionIds: string[], dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionPerformanceReport[]>>;
    comparePromotions(promotionIds: string[], metrics: string[], dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionComparisonReport>>;
    benchmarkPromotion(promotionId: string, benchmarkType: BenchmarkType): Promise<PromotionServiceResponse<PromotionBenchmarkReport>>;
    getPromotionRevenue(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<RevenueAnalyticsReport>>;
    getRevenueImpact(promotionIds: string[], dateRange?: DateRange): Promise<PromotionServiceResponse<RevenueImpactReport>>;
    calculateROI(promotionId: string): Promise<PromotionServiceResponse<ROICalculation>>;
    getPromotionUserMetrics(promotionId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<PromotionUserMetrics>>;
    getUserPromotionHistory(userId: string, limit?: number): Promise<PromotionServiceResponse<UserPromotionHistory[]>>;
    getPromotionTrends(dateRange: DateRange, groupBy: TrendGrouping): Promise<PromotionServiceResponse<PromotionTrendReport>>;
    getSeasonalAnalysis(promotionType?: PromotionType, years?: number): Promise<PromotionServiceResponse<SeasonalAnalysisReport>>;
    predictPromotionPerformance(promotionData: PredictionRequest): Promise<PromotionServiceResponse<PerformancePrediction>>;
    getOptimizationRecommendations(promotionId: string): Promise<PromotionServiceResponse<OptimizationRecommendation[]>>;
    getRealtimePromotionStats(promotionId: string): Promise<PromotionServiceResponse<RealtimePromotionStats>>;
    subscribeToPromotionUpdates(promotionId: string, callback: PromotionUpdateCallback): Promise<PromotionServiceResponse<SubscriptionHandle>>;
}
export interface IPromotionRulesService {
    createRule(ruleData: CreateRuleRequest): Promise<PromotionServiceResponse<PromotionRule>>;
    getRule(ruleId: string): Promise<PromotionServiceResponse<PromotionRule>>;
    updateRule(ruleId: string, updates: UpdateRuleRequest): Promise<PromotionServiceResponse<PromotionRule>>;
    deleteRule(ruleId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
    evaluateRules(context: RuleEvaluationContext): Promise<PromotionServiceResponse<RuleEvaluationResult[]>>;
    executeRule(ruleId: string, context: RuleEvaluationContext): Promise<PromotionServiceResponse<RuleExecutionResult>>;
    testRule(ruleData: PromotionRule, testContext: RuleEvaluationContext): Promise<PromotionServiceResponse<RuleTestResult>>;
    validateRuleLogic(ruleData: PromotionRule): Promise<PromotionServiceResponse<RuleValidationResult>>;
    getRulePerformance(ruleId: string, dateRange?: DateRange): Promise<PromotionServiceResponse<RulePerformanceReport>>;
    optimizeRules(criteria: RuleOptimizationCriteria): Promise<PromotionServiceResponse<RuleOptimizationResult>>;
}
export interface IPromotionTemplateService {
    createTemplate(templateData: CreateTemplateRequest): Promise<PromotionServiceResponse<PromotionTemplate>>;
    getTemplate(templateId: string): Promise<PromotionServiceResponse<PromotionTemplate>>;
    updateTemplate(templateId: string, updates: UpdateTemplateRequest): Promise<PromotionServiceResponse<PromotionTemplate>>;
    deleteTemplate(templateId: string, deletedBy: string): Promise<PromotionServiceResponse<void>>;
    getTemplates(filters?: TemplateFilters): Promise<PromotionServiceResponse<PromotionTemplate[]>>;
    getPopularTemplates(limit?: number): Promise<PromotionServiceResponse<PromotionTemplate[]>>;
    getRecommendedTemplates(context: TemplateRecommendationContext): Promise<PromotionServiceResponse<PromotionTemplate[]>>;
    createPromotionFromTemplate(templateId: string, customizations: TemplateCustomization): Promise<PromotionServiceResponse<BasePromotion>>;
    cloneTemplate(templateId: string, newName: string, customizations?: TemplateCustomization): Promise<PromotionServiceResponse<PromotionTemplate>>;
    getTemplateUsageStats(templateId: string): Promise<PromotionServiceResponse<TemplateUsageStats>>;
    getTemplatePerformance(templateId: string): Promise<PromotionServiceResponse<TemplatePerformanceStats>>;
}
export interface CreatePromotionRequest {
    type: PromotionType;
    name: string;
    description: string;
    start_date: Date;
    end_date: Date;
    timezone: string;
    discount_config?: any;
    content_config?: any;
    bundle_config?: any;
    campaign_config?: any;
    targeting_rules: any[];
    application_type: string;
    promo_code?: string;
    usage_limit?: number;
    metadata?: Record<string, any>;
    tags?: string[];
    created_by: string;
}
export interface UpdatePromotionRequest {
    name?: string;
    description?: string;
    status?: PromotionStatus;
    enabled?: boolean;
    start_date?: Date;
    end_date?: Date;
    usage_limit?: number;
    targeting_rules?: any[];
    metadata?: Record<string, any>;
    tags?: string[];
    updated_by: string;
}
export interface EligibilityCheckRequest {
    promotion_id: string;
    user_id: string;
    cart_id?: string;
    item_ids?: string[];
    promo_code?: string;
    context?: PromotionContext;
}
export interface MultipleEligibilityCheckRequest {
    promotion_ids: string[];
    user_id: string;
    cart_id?: string;
    item_ids?: string[];
    context?: PromotionContext;
}
export interface ApplyPromotionRequest {
    promotion_id: string;
    user_id: string;
    cart_id: string;
    promo_code?: string;
    force_apply?: boolean;
    context?: PromotionContext;
}
export interface RemovePromotionRequest {
    promotion_id: string;
    user_id: string;
    cart_id: string;
    reason?: string;
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
    };
    session_data?: Record<string, any>;
    custom_attributes?: Record<string, any>;
}
export interface ActivePromotionFilters {
    type?: PromotionType[];
    applicable_to_user?: string;
    location?: string;
    limit?: number;
}
export interface PromotionValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: string[];
}
export interface ValidationError {
    field: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
}
export interface ValidationWarning {
    field: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
}
export interface PromotionConflictCheck {
    has_conflicts: boolean;
    conflicts: Array<{,
        conflicting_promotion_id: string;
        conflict_type: 'time_overlap' | 'mutual_exclusion' | 'resource_conflict';
        description: string;
        severity: 'blocking' | 'warning';
    }>;
    recommendations: string[];
}
export interface BulkOperationResult {
    total_processed: number;
    successful: number;
    failed: number;
    results: Array<{,
        id: string;
        success: boolean;
        error?: string;
    }>;
}
export interface ApplicablePromotionsResult {
    applicable_promotions: PromotionEligibilityCheck[];
    auto_applied: string[];
    suggested: PromotionRecommendation[];
    total_potential_savings_cents: number;
}
export interface PromotionRecommendation {
    promotion_id: string;
    promotion_name: string;
    promotion_type: PromotionType;
    potential_savings_cents: number;
    confidence_score: number;
    recommendation_reason: string;
    call_to_action: string;
    expires_at?: Date;
}
export interface CartPromotionEvaluation {
    cart_id: string;
    current_promotions: string[];
    applicable_promotions: PromotionEligibilityCheck[];
    potential_savings_cents: number;
    optimization_suggestions: PromotionOptimizationSuggestion[];
}
export interface PromotionOptimizationSuggestion {
    type: 'add_item' | 'increase_quantity' | 'apply_code' | 'stack_promotion';
    description: string;
    additional_savings_cents: number;
    required_actions: string[];
}
export interface CartPromotionApplication {
    cart_id: string;
    applied_promotions: PromotionApplicationResult[];
    total_savings_cents: number;
    final_cart_total_cents: number;
    optimization_performed: boolean;
}
export interface PromoCodeValidation {
    valid: boolean;
    promotion_id?: string;
    promotion_name?: string;
    discount_preview?: {
        type: string;
        amount_cents?: number;
        percentage?: number;
    };
    error_code?: string;
    error_message?: string;
    expires_at?: Date;
}
export interface PromotionPerformanceReport {
    promotion_id: string;
    promotion_name: string;
    date_range: DateRange;
    metrics: PromotionPerformanceMetrics;
    time_series: Array<{,
        date: string;
        usage_count: number;
        revenue_cents: number;
        conversion_rate: number;
    }>;
    user_segments: Array<{,
        segment_name: string;
        usage_count: number;
        conversion_rate: number;
        average_order_value_cents: number;
    }>;
    insights: PerformanceInsight[];
    recommendations: OptimizationRecommendation[];
}
export interface PerformanceInsight {
    type: 'positive' | 'negative' | 'neutral';
    title: string;
    description: string;
    impact_score: number;
    confidence: number;
    supporting_data: Record<string, any>;
}
export interface OptimizationRecommendation {
    type: 'increase_budget' | 'adjust_targeting' | 'modify_timing' | 'change_discount' | 'extend_duration';
    title: string;
    description: string;
    expected_impact: string;
    effort_level: 'low' | 'medium' | 'high';
    priority_score: number;
    implementation_steps: string[];
}
export interface DateRange {
    start_date: Date;
    end_date: Date;
}
export interface BenchmarkType {
    type: 'industry' | 'category' | 'historical' | 'similar_promotions';
    parameters?: Record<string, any>;
}
export interface RevenueAnalyticsReport {
    promotion_id: string;
    date_range: DateRange;
    total_revenue_cents: number;
    incremental_revenue_cents: number;
    revenue_per_use_cents: number;
    total_discount_given_cents: number;
    cost_of_promotion_cents: number;
    net_revenue_impact_cents: number;
    roi_percentage: number;
    payback_period_days?: number;
    break_even_usage_count: number;
    revenue_by_segment: Array<{,
        segment: string;
        revenue_cents: number;
        percentage: number;
    }>;
    daily_revenue: Array<{,
        date: string;
        revenue_cents: number;
        usage_count: number;
    }>;
}
export interface UserPromotionHistory {
    promotion_id: string;
    promotion_name: string;
    promotion_type: PromotionType;
    used_at: Date;
    discount_received_cents: number;
    order_total_cents: number;
    items_purchased: number;
}
export interface PromotionUpdateCallback {
    (update: PromotionUpdate): void;
}
export interface PromotionUpdate {
    promotion_id: string;
    update_type: 'usage' | 'performance' | 'status_change';
    data: any;
    timestamp: Date;
}
export interface SubscriptionHandle {
    unsubscribe(): void;
}
export type { IPromotionService, IPromotionEligibilityService, IContentPromotionService, ICampaignService, IPromotionAnalyticsService, IPromotionRulesService, IPromotionTemplateService };
//# sourceMappingURL=PromotionServices.d.ts.map