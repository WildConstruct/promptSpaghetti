/**
 * Enhanced OpenAI adaptor with advanced pipeline features
 * Epic 10.2.1 - Enhanced ModelAdaptor Base Class
 */
import { TextToTextAdaptor, PlatformCapabilities, ValidationResult, PlatformPrompt, TranslationContext } from '../types';
import { AdvancedBaseAdaptor, AdvancedAdaptorConfig } from './AdvancedBaseAdaptor';
/**
 * Enhanced OpenAI adaptor with full pipeline features
 */
export declare class EnhancedOpenAIAdaptor extends AdvancedBaseAdaptor implements TextToTextAdaptor {
    readonly id = "enhanced-openai-gpt";
    readonly version = "2.0.0";
    readonly name = "Enhanced OpenAI GPT";
    readonly description = "Advanced OpenAI GPT adaptor with comprehensive pipeline";
    readonly platforms: string[];
    private openaiConfig;
    /**
     * Initialize with enhanced configuration
     */
    protected onInitialize(): Promise<void>;
    /**
     * Get enhanced platform capabilities
     */
    capabilities(): Promise<PlatformCapabilities>;
    /**
     * Get text generation specific capabilities
     */
    textCapabilities(): Promise<{
        maxContextLength: number;
        supportsChatFormat: boolean;
        supportsSystemMessages: boolean;
        supportsFunctionCalling: boolean;
        temperatureRange: [number, number];
        topPRange: [number, number];
    }>;
    /**
     * Enhanced platform-specific validation
     */
    protected performPlatformValidation(graph: any, config?: AdvancedAdaptorConfig): Promise<ValidationResult>;
    /**
     * Enhanced transformation with conversation handling
     */
    protected performTransformation(graph: any, config?: AdvancedAdaptorConfig): Promise<Omit<PlatformPrompt, 'metadata'>>;
    /**
     * Analyze graph content comprehensively
     */
    private analyzeGraphContent;
    /**
     * Estimate tokens with enhanced context awareness
     */
    private estimateTokensWithContext;
    /**
     * Build enhanced prompt structure
     */
    private buildEnhancedPromptStructure;
    /**
     * Optimize conversation flow
     */
    private optimizeConversationFlow;
    /**
     * Build advanced parameters
     */
    private buildAdvancedParameters;
    /**
     * Format prompt for OpenAI API
     */
    private formatPromptForOpenAI;
    protected isValidGraphStructure(graph: any): boolean;
    protected hasCycles(graph: any): boolean;
    protected hasIncoherentContent(content: string): boolean;
    protected estimateComplexity(graph: any): number;
    protected normalizeGraphStructure(graph: any): any;
    protected applyPreprocessingOptimizations(graph: any, context: TranslationContext): Promise<any>;
    protected canOptimizeContent(graph: any): boolean;
    protected canOptimizeStructure(graph: any): boolean;
    protected applyPostprocessingFilters(result: any, context: TranslationContext): any;
    protected validateFinalResult(result: any): boolean;
    private setupEventListeners;
    private getModelCapabilities;
    private supportsFunctionCalling;
    private supportsJsonMode;
    private detectPrimaryIntent;
    private extractTopics;
    private assessSentiment;
    private calculateContentComplexity;
    private assessContentQuality;
    private enhanceSystemMessage;
    private generateContextualSystemMessage;
    private topologicalSort;
    private optimizeMessageOrder;
    private mergeContextIntoMessages;
    private deduplicateContent;
    private mergeCompatibleNodes;
    private sanitizeContent;
    private optimizeParameters;
}
//# sourceMappingURL=EnhancedOpenAIAdaptor.d.ts.map