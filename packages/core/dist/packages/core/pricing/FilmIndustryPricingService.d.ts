/**
 * Film Industry Pricing Service
 * Epic 17 - Film Industry Pricing Integration (E17-1753114397435-FAE0EA)
 *
 * Specialized pricing service for Wild Construct's $2.3B film industry integration
 */
import { EventEmitter } from 'events';
import { PricingOptimizer } from './PricingOptimizer';
export interface FilmStudioProfile {
    studioId: string;
    name: string;
    tier: 'independent' | 'mid_tier' | 'major_studio' | 'streaming_platform';
    annualBudget: number;
    productionVolume: number;
    primaryGenres: string;
    distributionChannels: ('theatrical' | 'streaming' | 'tv' | 'digital')[];
    paymentTerms: {
        preferredBilling: 'monthly' | 'per_project' | 'annual';
        creditLimit: number;
        paymentDays: number;
    };
    premiumFeatures: string;
    contractStartDate: number;
    contractEndDate: number;
    loyaltyStatus: 'new' | 'standard' | 'preferred' | 'vip';
}
export interface ProjectPricingRequest {
    studioId: string;
    projectId: string;
    projectDetails: {
        title: string;
        genre: string;
        budgetRange: 'micro' | 'low' | 'medium' | 'high' | 'blockbuster';
        timeline: {
            startDate: number;
            endDate: number;
            deliveryDate: number;
        };
        deliverables: ProjectDeliverable;
        priority: 'standard' | 'rush' | 'emergency';
        distributionPlan: string;
    };
    contentRequirements: {
        scriptAnalysis?: ScriptAnalysisOptions;
        storyboardGeneration?: StoryboardOptions;
        conceptArt?: ConceptArtOptions;
        marketingContent?: MarketingContentOptions;
        characterDevelopment?: CharacterDevelopmentOptions;
    };
}
export interface ProjectDeliverable {
    type: 'script_analysis' | 'character_profiles' | 'scene_breakdown' | 'dialogue_generation' | ;
}
export interface ScriptAnalysisOptions {
    analysisDepth: 'basic' | 'comprehensive' | 'deep_dive';
    includeCharacterArcs: boolean;
    includeDialogueAnalysis: boolean;
    includeStructuralNotes: boolean;
    includeGenreCompliance: boolean;
    benchmarkScripts?: string;
}
export interface StoryboardOptions {
    artStyle: 'sketch' | 'detailed' | 'cinematic' | 'animatic';
    frameCount: number;
    includeNotes: boolean;
    colorTreatment: 'bw' | 'color' | 'mood_palette';
    animationPreview: boolean;
}
export interface ConceptArtOptions {
    artDirection: 'realistic' | 'stylized' | 'fantastical' | 'period_accurate';
    deliverableTypes: ('character_design' | 'environment_design' | 'prop_design' | 'costume_design')[];
    iterationRounds: number;
    highResolution: boolean;
    includeVariations: boolean;
}
export interface MarketingContentOptions {
    campaignScope: 'teaser' | 'full_campaign' | 'awards_season' | 'international';
    platforms: ('theatrical' | 'digital' | 'social' | 'print' | 'tv')[];
    audienceSegments: string;
    brandGuidelines: boolean;
    localizationNeeded: string;
}
export interface CharacterDevelopmentOptions {
    characterCount: number;
    developmentDepth: 'basic_profile' | 'detailed_background' | 'full_psychology';
    includeDialoguePatterns: boolean;
    includeVisualReferences: boolean;
    includeRelationshipMaps: boolean;
}
export interface FilmIndustryPricingResult {
    projectId: string;
    studioId: string;
    totalPrice: number;
    currency: string;
    basePrice: number;
    studioTierAdjustment: number;
    projectComplexityMultiplier: number;
    timelineAdjustment: number;
    deliverablesPricing: Array<{}, deliverable>;
    string: any;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    complexity: string;
}
export interface PaymentScheduleItem {
    milestone: string;
    percentage: number;
    amount: number;
    dueDate: number;
    description: string;
}
export interface StudioPricingAnalytics {
    studioId: string;
    period: {
        start: number;
        end: number;
    };
    totalRevenue: number;
    averageProjectValue: number;
    profitMargin: number;
    paymentPerformance: {
        averagePaymentDays: number;
        latePaymentRate: number;
        creditUtilization: number;
    };
    totalProjects: number;
    projectsByType: Record<string, number>;
    projectsByGenre: Record<string, number>;
    averageProjectTimeline: number;
    deliveryPerformance: {
        onTimeDeliveryRate: number;
        qualityScore: number;
        revisionRate: number;
    };
    seasonalPatterns: Array<{}, period>;
    string: any;
    volume: number;
    revenue: number;
    averageValue: number;
}
export declare class FilmIndustryPricingService extends EventEmitter {
    private optimizer;
    private studioProfiles;
    private studioAnalytics;
    private deliverablePricing;
    private genreMultipliers;
    private complexityMultipliers;
    constructor(optimizer: PricingOptimizer);
}
//# sourceMappingURL=FilmIndustryPricingService.d.ts.map