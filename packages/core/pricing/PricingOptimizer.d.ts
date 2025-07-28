/**
 * Pricing Optimization Engine
 * Epic 17 - Create Pricing Optimization (E17-1753114397435-FAE0EA)
 *
 * AI-driven pricing strategy implementation for Wild Construct's $2.3B film industry integration
 */
import { EventEmitter } from 'events';

export interface PricingModel {
    id: string;
    name: string;
    description: string;
    type: 'usage_based' | 'tiered' | 'flat_rate' | 'value_based' | 'dynamic';
    basePrice: number;
    currency: string;
    tiers?: PricingTier[];
    usageMetrics?: UsageMetric[];
    demandMultiplier?: number;
    complexityMultiplier?: number;
    volumeDiscounts?: VolumeDiscount[];
    aiOptimization: {,
        enabled: boolean;
        strategy: 'maximize_revenue' | 'maximize_adoption' | 'competitive' | 'value_based';
        sensitivityAnalysis: boolean;
        priceElasticity?: number;
        competitorTracking: boolean;
    };
    filmIndustryConfig?: {
        studioTierMultiplier: number;
        productionScaleFactors: Record<'indie' | 'mid_budget' | 'blockbuster', number>;
        contentTypeMultipliers: Record<'script' | 'storyboard' | 'concept_art' | 'marketing', number>;
        seasonalAdjustments: SeasonalPricing[];
    };
    createdAt: number;
    updatedAt: number;
    isActive: boolean;

export interface PricingTier {
    id: string;
    name: string;
    minUsage: number;
    maxUsage: number | null;
    pricePerUnit: number;
    features: string[];
    discountPercentage?: number;

export interface UsageMetric {
    metric: 'api_calls' | 'nodes_processed' | 'execution_time' | 'storage_gb' | 'users';
    displayName: string;
    unit: string;
    pricePerUnit: number;
    includedAmount: number;
    overageRate?: number;

export interface VolumeDiscount {
    minQuantity: number;
    discountPercentage: number;
    description: string;

export interface SeasonalPricing {
    period: 'q1' | 'q2' | 'q3' | 'q4' | 'awards_season' | 'festival_season';
    multiplier: number;
    description: string;

export interface PricingCalculationRequest {
    modelId: string;
    usage: Record<string, number>;
    userTier?: 'individual' | 'studio' | 'enterprise';
    productionType?: 'indie' | 'mid_budget' | 'blockbuster';
    contentType?: 'script' | 'storyboard' | 'concept_art' | 'marketing';
    duration?: number;
    priority?: 'standard' | 'rush' | 'emergency';
    metadata?: Record<string, any>;

export interface PricingCalculationResult {
    totalPrice: number;
    currency: string;
    breakdown: PricingBreakdown[];
    discounts: PricingDiscount[];
    taxes?: Tax[];
    billingPeriod: 'one_time' | 'monthly' | 'annual';
    aiInsights: {,
        priceOptimality: number;
        demandPrediction: 'low' | 'medium' | 'high';
        competitivePosition: 'below_market' | 'at_market' | 'above_market';
        recommendedAdjustment?: number;
        confidenceScore: number;
    };
    industryInsights?: {
        seasonalImpact: number;
        studioTierImpact: number;
        productionScaleImpact: number;
        marketTrends: string[];
    };
    createdAt: number;
    validUntil: number;

export interface PricingBreakdown {
    component: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    multipliers?: PricingMultiplier[];

export interface PricingMultiplier {
    type: 'demand' | 'complexity' | 'urgency' | 'seasonal' | 'studio_tier' | 'volume';
    factor: number;
    description: string;

export interface PricingDiscount {
    type: 'volume' | 'loyalty' | 'promotional' | 'seasonal' | 'industry';
    amount: number;
    percentage: number;
    description: string;

export interface Tax {
    type: 'vat' | 'sales_tax' | 'entertainment_tax';
    rate: number;
    amount: number;
    jurisdiction: string;

export interface PricingAnalytics {
    modelId: string;
    period: {,
        start: number;
        end: number;
    };
    totalRevenue: number;
    averageOrderValue: number;
    revenueGrowthRate: number;
    totalCalculations: number;
    uniqueCustomers: number;
    topUsagePatterns: UsagePattern[];
    priceElasticity: number;
    demandSensitivity: number;
    competitiveAdvantage: number;
    aiAccuracy: number;
    predictionConfidence: number;
    optimizationImpact: number;
    studioSegmentBreakdown: Record<string, number>;
    contentTypeDistribution: Record<string, number>;
    seasonalPerformance: Record<string, number>;

export interface UsagePattern {
    pattern: string;
    frequency: number;
    averageValue: number;
    trendDirection: 'up' | 'down' | 'stable';

export interface PricingOptimizationConfig {
    enableAI: boolean;
    optimizationFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    priceUpdateThreshold: number;
    competitorTrackingEnabled: boolean;
    seasonalAdjustmentsEnabled: boolean;
    demandPredictionEnabled: boolean;
    maxPriceIncreasePercent: number;
    maxPriceDecreasePercent: number;
    minRevenueMaintenance: number;
    filmIndustryOptimization: {,
        studioTierAdjustments: boolean;
        productionCycleTracking: boolean;
        festivalSeasonOptimization: boolean;
        awardsSeasonPremium: boolean;
    };
/**
 * AI-driven pricing optimization engine for film industry applications
 */
export declare class PricingOptimizer extends EventEmitter {
    private models;
    private analytics;
    private config;
    private optimizationInterval?;
    private demandPredictor;
    private competitorAnalyzer;
    private elasticityCalculator;
    constructor(config?: Partial<PricingOptimizationConfig>);
    /**
     * Initialize optimization scheduling
     */
    private initializeOptimization;
    /**
     * Add or update a pricing model
     */
    addPricingModel(model: PricingModel): void;
    /**
     * Calculate pricing for a given request
     */
    calculatePricing(request: PricingCalculationRequest): Promise<PricingCalculationResult>;
    /**
     * Get pricing analytics for a model
     */
    getAnalytics(modelId: string, period?: {)
        start: number;
        end: number;
    }): PricingAnalytics | null;
    /**
     * Run AI-driven pricing optimization
     */
    runOptimization(): Promise<void>;
    /**
     * Generate demand forecast for a pricing model
     */
    generateDemandForecast(modelId: string, period: number): Promise<DemandForecast>;
    /**
     * Get competitive pricing analysis
     */
    getCompetitiveAnalysis(modelId: string): Promise<CompetitiveAnalysis>;
    /**
     * Optimize pricing for specific market conditions
     */
    optimizeForMarketConditions(modelId: string, conditions: MarketConditions): Promise<PricingOptimizationResult>;
    /**
     * Shutdown the pricing optimizer
     */
    shutdown(): void;
    private calculateBasePricing;
    private applyAIOptimizations;
    private applyIndustryAdjustments;
    private applyDiscountsAndTaxes;
    private recordPricingCalculation;
    private createEmptyAnalytics;
    private calculateComplexityScore;
    private getSeasonalAdjustment;
    private getCurrentSeasonalPeriod;
    private extractUsagePattern;
    private getSeasonalFactors;
    private getIndustryTrends;
    private generateOptimizationRecommendations;
    private shouldApplyOptimization;
    private applyOptimization;
    private generateMarketBasedRecommendations;
    private calculateExpectedImpact;
    private calculateConfidenceScore;
    private assessImplementationRisk;

export interface DemandForecast {
    period: number;
    expectedDemandChange: number;
    confidence: number;
    factors: Array<{,
        name: string;
        impact: number;
    }>;

export interface CompetitiveAnalysis {
    position: 'below_market' | 'at_market' | 'above_market';
    competitorCount: number;
    averagePrice: number;
    priceRange: {,
        min: number;
        max: number;
    };
    marketShare: number;
    differentiationFactors: string[];

export interface OptimizationRecommendation {
    type: 'price_increase' | 'price_decrease' | 'dynamic_pricing' | 'tier_adjustment';
    confidence: number;
    expectedImpact: number;
    description: string;
    suggestedChange: number;

export interface MarketConditions {
    demandLevel: 'low' | 'medium' | 'high';
    competitiveIntensity: 'low' | 'medium' | 'high';
    seasonality: 'low' | 'medium' | 'high';
    economicIndicators: Record<string, number>;

export interface PricingOptimizationResult {
    modelId: string;
    recommendations: MarketOptimizationRecommendation[];
    expectedImpact: number;
    confidence: number;
    implementationRisk: 'low' | 'medium' | 'high';

export interface MarketOptimizationRecommendation {
    type: 'competitive_alignment' | 'demand_optimization' | 'seasonal_adjustment' | 'tier_restructure';
    priority: 'low' | 'medium' | 'high';
    impact: number;
    confidence: number;
    description: string;

export default PricingOptimizer;
//# sourceMappingURL=PricingOptimizer.d.ts.map