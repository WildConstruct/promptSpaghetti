/**
 * Cross-Modal Intelligence Workflow Nodes
 * Epic 35.1.5 - Cross-Modal Intelligence
 *
 * Workflow nodes for multimodal understanding and cross-modal content processing
 */
import { AdvancedRuntimeNode, AdvancedExecutionContext, NodeExecutionResult } from '../advanced';
import { TypedInputs } from '../io-system';

export interface CrossModalConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'custom';
    apiKey: string;
    baseURL?: string;
    model?: string;
    defaultParameters?: Record<string, any>;

export interface MultimodalInput {
    type: 'text' | 'image' | 'audio' | 'video';
    content: string | ArrayBuffer | File | Blob;
    metadata?: {
        role?: 'user' | 'assistant' | 'system';
        description?: string;
        duration?: number;
        resolution?: {
            width: number;
            height: number;
        };
    };

export interface CrossModalAnalysis {
    content_understanding: {
        overall_summary: string;
        key_themes: string[];
        sentiment: {
            score: number;
            label: string;
        };
        complexity_score: number;
    };
    modality_insights: Array<{,
        modality: string;
        confidence: number;
        key_elements: string[];
        dominant_features: string[];
    }>;
    cross_modal_connections: Array<{,
        connection_type: 'semantic' | 'temporal' | 'causal' | 'contextual';
        modalities: string[];
        strength: number;
        description: string;
    }>;
    extracted_information: {
        entities: Array<{,
            name: string;
            type: string;
            confidence: number;
        }>;
        topics: Array<{,
            topic: string;
            relevance: number;
        }>;
        emotions: Array<{,
            emotion: string;
            intensity: number;
            source: string;
        }>;
        actions: Array<{,
            action: string;
            confidence: number;
        }>;
    };

export declare class MultimodalUnderstandingNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapter;
    constructor(nodeId: string, config: CrossModalConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _initializeAdapter;
    private _createCrossModalAnalysis;
    private _calculateOverallSentiment;
    private _calculateComplexity;
    private _extractDominantFeatures;
    private _extractActions;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class ContentComparisonNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapter;
    constructor(nodeId: string, config: CrossModalConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _initializeAdapter;
    private _analyzeComparison;
    private _extractCharacteristics;
    private _getPrimaryModality;
    private _estimateComplexity;
    private _extractSimilarities;
    private _extractDifferences;
    private _generateRecommendation;
    private _calculateSimilarityScores;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

export declare class ContentAdaptationNode extends AdvancedRuntimeNode {
    private modelFactory;
    private adapter;
    constructor(nodeId: string, config: CrossModalConfig);
    executeAdvanced(inputs: TypedInputs, context: AdvancedExecutionContext): Promise<NodeExecutionResult>;
    private _initializeAdapter;
    private _createAdaptationPlan;
    private _extractKeyElements;
    private _determineEmotionalTone;
    private _assessComplexity;
    private _determineAdaptationStrategy;
    private _identifyPotentialChallenges;
    private _generateRecommendations;
    private _estimateAdaptationEffort;
    private _estimateTimeline;
    private _generateAdaptedContentSpec;
    private _generateContentOutline;
    private _generateTechnicalSpecs;
    private _defineQualityCriteria;
    private _defineSuccessMetrics;
    validateInputs(inputs: Record<string, any>): Promise<string[]>;

//# sourceMappingURL=CrossModalNode.d.ts.map