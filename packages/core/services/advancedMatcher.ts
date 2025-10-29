// Advanced Matcher Service with ML Capabilities
// Story 2.5b: Advanced Asset Browser Features

import { Edge, Node } from 'reactflow';
import { Asset, AssetMetadata } from './assetMatcher';
import { SegmentMetadata } from './llm/MetadataExtractor';
import { SimilarityEngine } from './llm/SimilarityEngine';
import { LLMService } from './llm/LLMService';

interface GraphNodeMetadata extends AssetMetadata {
  timePeriod?: string;
  category?: string;
  keywords?: string[];
}

interface GraphNodeData extends Record<string, unknown> {
  label?: string;
  metadata?: GraphNodeMetadata;
}

type GraphNode = Node<GraphNodeData>;
type GraphEdge = Edge<Record<string, unknown> | undefined>;

export interface GraphContext {
  selectedNode?: GraphNode;
  allNodes: GraphNode[];
  edges: GraphEdge[];
  recentActions?: string[];
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  favoriteAssets: string[];
  rejectedAssets: string[];
  acceptanceHistory: AcceptanceRecord[];
  stylePreference?: string;
}

export interface AcceptanceRecord {
  assetId: string;
  accepted: boolean;
  context: string;
  timestamp: number;
}

export interface AdvancedMatchOptions {
  limit?: number;
  includeCategories?: boolean;
  learningEnabled?: boolean;
  consistencyCheck?: boolean;
}

export interface CategorizedMatches {
  complementary: ScoredAsset[];
  alternatives: ScoredAsset[];
  extensions: ScoredAsset[];
  refinements: ScoredAsset[];
  all: ScoredAsset[];
}

export interface ScoredAsset {
  asset: Asset;
  semantic: number;
  contextual: number;
  preference: number;
  popularity: number;
  consistency: number;
  totalScore: number;
  category: 'complementary' | 'alternatives' | 'extensions' | 'refinements';
  explanation: string;
}

export class AdvancedMatcherService {
  private similarityEngine: SimilarityEngine;
  private llmService: LLMService | null;
  private userModel: UserPreferenceModel;
  private consistencyEngine: ConsistencyEngine;
  private popularityCache: Map<string, number> = new Map();

  constructor(llmService?: LLMService) {
    this.similarityEngine = new SimilarityEngine();
    this.llmService = llmService || null;
    this.userModel = new UserPreferenceModel();
    this.consistencyEngine = new ConsistencyEngine();
  }

  async findMatches(
    context: GraphContext,
    assets: Asset[],
    options: AdvancedMatchOptions = {}
  ): Promise<CategorizedMatches> {
    const {
      limit = 10,
      includeCategories = true,
      learningEnabled = true,
      consistencyCheck = true
    } = options;

    // Calculate multi-factor scores for all assets
    const scores = await this.calculateScores(context, assets, {
      consistencyCheck,
      learningEnabled
    });

    // Categorize based on relationship type
    const categorized = includeCategories
      ? this.categorizeMatches(scores, context)
      : {
          all: scores,
          complementary: [],
          alternatives: [],
          extensions: [],
          refinements: []
        };

    // Apply user learning if enabled
    if (learningEnabled && context.userPreferences) {
      this.applyUserLearning(categorized, context.userPreferences);
    }

    // Limit results per category
    return {
      complementary: categorized.complementary.slice(0, limit),
      alternatives: categorized.alternatives.slice(0, limit),
      extensions: categorized.extensions.slice(0, limit),
      refinements: categorized.refinements.slice(0, limit),
      all: categorized.all.slice(0, limit * 4)
    };
  }

  private async calculateScores(
    context: GraphContext,
    assets: Asset[],
    options: { consistencyCheck: boolean; learningEnabled: boolean }
  ): Promise<ScoredAsset[]> {
    const scores: ScoredAsset[] = [];

    // Batch process for performance
    const batchSize = 10;
    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);
      const batchScores = await Promise.all(
        batch.map(asset => this.scoreAsset(asset, context, options))
      );
      scores.push(...batchScores);
    }

    // Sort by total score
    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }

  private async scoreAsset(
    asset: Asset,
    context: GraphContext,
    options: { consistencyCheck: boolean; learningEnabled: boolean }
  ): Promise<ScoredAsset> {
    // Calculate individual score components
    const semantic = await this.calculateSemanticScore(asset, context);
    const contextual = this.calculateContextualFit(asset, context);
    const preference = options.learningEnabled
      ? await this.userModel.getPreferenceScore(asset, context.userPreferences)
      : 0.5;
    const popularity = await this.getPopularityScore(asset);
    const consistency = options.consistencyCheck
      ? this.consistencyEngine.checkConsistency(asset, context)
      : 1.0;

    // Weighted combination
    const totalScore =
      (semantic * 0.4 +
        contextual * 0.3 +
        preference * 0.2 +
        popularity * 0.1) *
      consistency; // Consistency acts as a multiplier

    return {
      asset,
      semantic,
      contextual,
      preference,
      popularity,
      consistency,
      totalScore,
      category: 'complementary', // Will be updated by categorization
      explanation: this.generateExplanation(asset, {
        semantic,
        contextual,
        preference,
        popularity,
        consistency
      })
    };
  }

  private async calculateSemanticScore(
    asset: Asset,
    context: GraphContext
  ): Promise<number> {
    if (!context.selectedNode || !this.similarityEngine) {
      return 0.5; // Neutral score if no context
    }

    try {
      const query = this.buildSimilarityQuery(context.selectedNode);
      if (!query) {
        return 0.5;
      }

      // Use similarity engine for semantic matching
      const similar = await this.similarityEngine.findSimilar(
        query.text,
        query.metadata,
        { limit: 100 }
      );

      const match = similar.find(s => s.id === asset.id);
      return match ? match.score / 100 : 0.2;
    } catch {
      // Fallback to keyword matching
      return this.keywordSimilarity(
        asset.metadata,
        context.selectedNode.data?.metadata
      );
    }
  }

  private buildSimilarityQuery(
    node: GraphNode
  ): { text: string; metadata: SegmentMetadata } | null {
    const data = node.data;
    if (!data) {
      return null;
    }

    const metadata = data.metadata ?? {};
    const label =
      typeof data.label === 'string' && data.label.trim().length > 0
        ? data.label.trim()
        : undefined;
    const theme =
      typeof metadata.theme === 'string' && metadata.theme.trim().length > 0
        ? metadata.theme.trim()
        : undefined;

    const text = label ?? theme ?? node.id;

    const keywordTags = Array.isArray(metadata.keywords)
      ? metadata.keywords.filter(
          (keyword): keyword is string => typeof keyword === 'string'
        )
      : [];
    const entityTags = Array.isArray(metadata.entities)
      ? metadata.entities.filter(
          (entity): entity is string => typeof entity === 'string'
        )
      : [];
    const tags = Array.from(new Set([...keywordTags, ...entityTags]));

    const segmentMetadata: SegmentMetadata = {
      subject: metadata.theme,
      action: metadata.style,
      location: metadata.setting,
      mood: metadata.mood,
      tags
    };

    return { text, metadata: segmentMetadata };
  }

  private calculateContextualFit(asset: Asset, context: GraphContext): number {
    let score = 0.5; // Base score

    // Check if asset type fits with existing graph structure
    const nodeTypes = context.allNodes.map(n => n.type);

    // Boost score if asset complements existing types
    if (asset.metadata?.keywords) {
      const keywords = asset.metadata.keywords;

      // Check for missing elements
      if (
        !nodeTypes.includes('WeightedChoice') &&
        keywords.includes('choice')
      ) {
        score += 0.2;
      }
      if (!nodeTypes.includes('Variable') && keywords.includes('variable')) {
        score += 0.2;
      }

      // Check for logical flow
      if (context.edges.length > 0) {
        const hasOutput = nodeTypes.includes('Output');
        if (!hasOutput && keywords.includes('output')) {
          score += 0.3;
        }
      }
    }

    // Consider recent actions
    if (context.recentActions?.includes('add_character')) {
      if (asset.metadata?.category === 'character') {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  private async getPopularityScore(asset: Asset): Promise<number> {
    // Check cache first
    const cachedScore = this.popularityCache.get(asset.id);
    if (cachedScore !== undefined) {
      return cachedScore;
    }

    // In production, this would query usage analytics
    // For now, use a simple heuristic
    let score = 0.5;

    // Boost popular categories
    if (asset.metadata?.category === 'character') {
      score += 0.2;
    }
    if (asset.metadata?.category === 'action') {
      score += 0.1;
    }

    // Cache the result
    this.popularityCache.set(asset.id, score);
    return score;
  }

  private keywordSimilarity(
    assetMetadata: AssetMetadata | undefined,
    nodeMetadata: GraphNodeMetadata | undefined
  ): number {
    const text1 = JSON.stringify(assetMetadata ?? {}).toLowerCase();
    const text2 = JSON.stringify(nodeMetadata ?? {}).toLowerCase();

    const words1 = text1.match(/\b\w+\b/g) || [];
    const words2 = text2.match(/\b\w+\b/g) || [];

    const common = words1.filter(w => words2.includes(w));
    const union = new Set([...words1, ...words2]);

    return common.length / union.size;
  }

  private categorizeMatches(
    scores: ScoredAsset[],
    context: GraphContext
  ): CategorizedMatches {
    const categorized: CategorizedMatches = {
      complementary: [],
      alternatives: [],
      extensions: [],
      refinements: [],
      all: scores
    };

    scores.forEach(scored => {
      const category = this.determineCategory(scored, context);
      scored.category = category;
      categorized[category].push(scored);
    });

    return categorized;
  }

  private determineCategory(
    scored: ScoredAsset,
    context: GraphContext
  ): 'complementary' | 'alternatives' | 'extensions' | 'refinements' {
    const asset = scored.asset;

    // High semantic similarity = alternative
    if (scored.semantic > 0.8) {
      return 'alternatives';
    }

    // High contextual fit = complementary
    if (scored.contextual > 0.7) {
      return 'complementary';
    }

    // Check if it extends current functionality
    if (context.selectedNode) {
      const currentType = context.selectedNode.type;
      if (this.isExtension(currentType, asset.type)) {
        return 'extensions';
      }
    }

    // Default to refinements
    return 'refinements';
  }

  private isExtension(currentType: string, assetType: string): boolean {
    const extensionMap: Record<string, string[]> = {
      Variable: ['WeightedChoice', 'Concat'],
      WeightedChoice: ['Concat', 'Output'],
      Concat: ['Output', 'Variable'],
      TextBlock: ['WeightedChoice', 'Concat']
    };

    return extensionMap[currentType]?.includes(assetType) || false;
  }

  private applyUserLearning(
    categorized: CategorizedMatches,
    preferences: UserPreferences
  ): void {
    // Boost favorites
    preferences.favoriteAssets.forEach(favId => {
      Object.values(categorized).forEach(category => {
        if (Array.isArray(category)) {
          const asset = category.find(s => s.asset.id === favId);
          if (asset) {
            asset.preference *= 1.5;
            asset.totalScore *= 1.2;
          }
        }
      });
    });

    // Penalize rejected
    preferences.rejectedAssets.forEach(rejId => {
      Object.values(categorized).forEach(category => {
        if (Array.isArray(category)) {
          const asset = category.find(s => s.asset.id === rejId);
          if (asset) {
            asset.preference *= 0.5;
            asset.totalScore *= 0.8;
          }
        }
      });
    });

    // Re-sort after adjustments
    Object.keys(categorized).forEach(key => {
      if (Array.isArray(categorized[key as keyof CategorizedMatches])) {
        (categorized[key as keyof CategorizedMatches] as ScoredAsset[]).sort(
          (a, b) => b.totalScore - a.totalScore
        );
      }
    });
  }

  private generateExplanation(
    asset: Asset,
    scores: {
      semantic: number;
      contextual: number;
      preference: number;
      popularity: number;
      consistency: number;
    }
  ): string {
    const reasons = [];

    if (scores.semantic > 0.7) {
      reasons.push('High semantic similarity');
    }
    if (scores.contextual > 0.7) {
      reasons.push('Fits well with current graph');
    }
    if (scores.preference > 0.7) {
      reasons.push('Matches your preferences');
    }
    if (scores.popularity > 0.7) {
      reasons.push('Popular choice');
    }
    if (scores.consistency < 0.5) {
      reasons.push('⚠️ May have consistency issues');
    }

    return reasons.join(', ') || 'General match';
  }
}

// User Preference Model
class UserPreferenceModel {
  async getPreferenceScore(
    asset: Asset,
    preferences?: UserPreferences
  ): Promise<number> {
    if (!preferences) {
      return 0.5;
    }

    // Check direct preferences
    if (preferences.favoriteAssets.includes(asset.id)) {
      return 1.0;
    }
    if (preferences.rejectedAssets.includes(asset.id)) {
      return 0.0;
    }

    // Analyze acceptance history
    const relevantHistory = preferences.acceptanceHistory.filter(record =>
      this.isRelevantContext(record.context, asset)
    );

    if (relevantHistory.length === 0) {
      return 0.5;
    }

    const acceptanceRate =
      relevantHistory.filter(r => r.accepted).length / relevantHistory.length;
    return acceptanceRate;
  }

  private isRelevantContext(context: string, asset: Asset): boolean {
    // Simple context matching
    const assetContext = JSON.stringify(asset.metadata).toLowerCase();
    return context
      .toLowerCase()
      .split(' ')
      .some(word => assetContext.includes(word));
  }
}

// Consistency Engine
class ConsistencyEngine {
  checkConsistency(asset: Asset, context: GraphContext): number {
    let score = 1.0;

    // Check temporal consistency
    const temporalIssue = this.checkTemporalConsistency(asset, context);
    if (temporalIssue) {
      score *= 0.7;
    }

    // Check style consistency
    const styleIssue = this.checkStyleConsistency(asset, context);
    if (styleIssue) {
      score *= 0.8;
    }

    // Check semantic consistency
    const semanticIssue = this.checkSemanticConsistency(asset, context);
    if (semanticIssue) {
      score *= 0.6;
    }

    return score;
  }

  private checkTemporalConsistency(
    asset: Asset,
    context: GraphContext
  ): boolean {
    // Check for time period conflicts
    const assetTime = asset.metadata?.timePeriod;
    const graphTimes = context.allNodes
      .map(n => n.data?.metadata?.timePeriod)
      .filter(Boolean);

    if (!assetTime || graphTimes.length === 0) {
      return false;
    }

    // Simple check: medieval shouldn't mix with futuristic
    if (assetTime === 'medieval' && graphTimes.includes('futuristic')) {
      return true;
    }
    if (assetTime === 'futuristic' && graphTimes.includes('medieval')) {
      return true;
    }

    return false;
  }

  private checkStyleConsistency(asset: Asset, context: GraphContext): boolean {
    const assetStyle = asset.metadata?.style;
    const graphStyles = context.allNodes
      .map(n => n.data?.metadata?.style)
      .filter(Boolean);

    if (!assetStyle || graphStyles.length === 0) {
      return false;
    }

    // Check for style clashes
    if (assetStyle === 'cartoon' && graphStyles.includes('realistic')) {
      return true;
    }
    if (assetStyle === 'realistic' && graphStyles.includes('cartoon')) {
      return true;
    }

    return false;
  }

  private checkSemanticConsistency(
    asset: Asset,
    context: GraphContext
  ): boolean {
    // Check for logical inconsistencies
    const assetCategory = asset.metadata?.category;
    const graphCategories = context.allNodes
      .map(n => n.data?.metadata?.category)
      .filter(Boolean);

    if (!assetCategory || graphCategories.length === 0) {
      return false;
    }

    // Simple semantic rules
    if (assetCategory === 'underwater' && graphCategories.includes('desert')) {
      return true;
    }
    if (assetCategory === 'space' && graphCategories.includes('medieval')) {
      return true;
    }

    return false;
  }
}
