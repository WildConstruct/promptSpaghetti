// Asset Matcher Service for Metadata-Based Suggestions
// Story 2.5a: Asset Browser Integration MVP

import { MetadataExtractor } from './llm/MetadataExtractor';

export interface Asset {
  id: string;
  name: string;
  type: 'psg' | 'psglib';
  metadata?: AssetMetadata;
  content?: unknown;
  tags?: string[];
}

export interface AssetMetadata {
  theme?: string;
  mood?: string;
  setting?: string;
  style?: string;
  entities?: string[];
  keywords?: string[];
  extractedAt?: number;
}

export interface AssetMatch {
  asset: Asset;
  score: number;
  relevance: 'high' | 'medium' | 'low';
  explanation?: string;
}

export interface NodeMetadata extends AssetMetadata {
  nodeType?: string;
  nodeId?: string;
}

export class AssetMatcherService {
  private metadataExtractor: MetadataExtractor;
  private offlineMode: boolean = false;

  // Static keyword mappings for offline fallback
  private static readonly STATIC_MATCHES: Record<string, string[]> = {
    urban: ['city', 'street', 'building', 'downtown', 'metropolitan'],
    character: ['person', 'actor', 'extra', 'individual', 'figure'],
    action: ['movement', 'gesture', 'reaction', 'behavior', 'activity'],
    emotion: ['happy', 'sad', 'angry', 'fear', 'surprise', 'neutral'],
    time: ['morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk'],
    weather: ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'clear'],
    indoor: ['room', 'office', 'home', 'interior', 'inside'],
    outdoor: ['outside', 'exterior', 'open', 'nature', 'landscape']
  };

  constructor(metadataExtractor?: MetadataExtractor) {
    this.metadataExtractor = metadataExtractor || new MetadataExtractor();
  }

  async findMatches(
    nodeMetadata: NodeMetadata,
    assets: Asset[],
    options: {
      limit?: number;
      minScore?: number;
      offlineOnly?: boolean;
    } = {}
  ): Promise<AssetMatch[]> {
    const { limit = 3, minScore = 0, offlineOnly = false } = options;

    // Use offline mode if specified or if LLM is unavailable
    const useOffline =
      offlineOnly || this.offlineMode || !this.metadataExtractor;

    const matches = await Promise.all(
      assets.map(async asset => {
        const score = useOffline
          ? this.calculateOfflineScore(nodeMetadata, asset.metadata || {})
          : await this.calculateSmartScore(nodeMetadata, asset.metadata || {});

        return {
          asset,
          score,
          relevance: this.getRelevanceLevel(score),
          explanation: this.generateExplanation(
            nodeMetadata,
            asset.metadata || {},
            score
          )
        } as AssetMatch;
      })
    );

    return matches
      .filter(m => m.score > minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private async calculateSmartScore(
    node: NodeMetadata,
    asset: AssetMetadata
  ): Promise<number> {
    let score = 0;

    // Exact matches (highest weight)
    if (node.setting && asset.setting && node.setting === asset.setting) {
      score += 50;
    }
    if (node.mood && asset.mood && node.mood === asset.mood) {
      score += 30;
    }
    if (node.theme && asset.theme && node.theme === asset.theme) {
      score += 20;
    }

    // Partial matches using keywords
    const nodeKeywords = this.extractKeywords(node);
    const assetKeywords = this.extractKeywords(asset);
    const commonKeywords = nodeKeywords.filter(k => assetKeywords.includes(k));
    score += commonKeywords.length * 5;

    // Entity overlap
    if (node.entities && asset.entities) {
      const assetEntities = asset.entities ?? [];
      const commonEntities = node.entities.filter(e =>
        assetEntities.includes(e)
      );
      score += commonEntities.length * 10;
    }

    // Style compatibility
    if (node.style && asset.style) {
      const styleSimilarity = this.calculateStyleSimilarity(
        node.style,
        asset.style
      );
      score += styleSimilarity * 15;
    }

    return Math.min(score, 100); // Cap at 100
  }

  private calculateOfflineScore(
    node: NodeMetadata,
    asset: AssetMetadata
  ): number {
    let score = 0;

    // Simple keyword matching for offline mode
    const nodeText = this.metadataToText(node).toLowerCase();
    const assetText = this.metadataToText(asset).toLowerCase();

    // Check static matches
    for (const [key, synonyms] of Object.entries(
      AssetMatcherService.STATIC_MATCHES
    )) {
      if (nodeText.includes(key)) {
        for (const synonym of synonyms) {
          if (assetText.includes(synonym)) {
            score += 10;
          }
        }
      }
    }

    // Direct word overlap
    const nodeWords = nodeText.split(/\s+/);
    const assetWords = assetText.split(/\s+/);
    const commonWords = nodeWords.filter(
      w => assetWords.includes(w) && w.length > 3
    );
    score += commonWords.length * 5;

    // Node type compatibility bonus
    if (
      node.nodeType &&
      asset.keywords?.includes(node.nodeType.toLowerCase())
    ) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  private extractKeywords(metadata: AssetMetadata): string[] {
    const keywords: string[] = [];

    if (metadata.keywords) {
      keywords.push(...metadata.keywords);
    }

    // Extract from other fields
    if (metadata.theme) {
      keywords.push(...metadata.theme.split(/\s+/));
    }
    if (metadata.mood) {
      keywords.push(...metadata.mood.split(/\s+/));
    }
    if (metadata.setting) {
      keywords.push(...metadata.setting.split(/\s+/));
    }

    return keywords.map(k => k.toLowerCase()).filter(k => k.length > 2);
  }

  private calculateStyleSimilarity(style1: string, style2: string): number {
    const s1 = style1.toLowerCase();
    const s2 = style2.toLowerCase();

    if (s1 === s2) {
      return 1;
    }

    // Check for partial matches
    const styles = [
      'cinematic',
      'documentary',
      'artistic',
      'realistic',
      'dramatic'
    ];
    for (const style of styles) {
      if (s1.includes(style) && s2.includes(style)) {
        return 0.7;
      }
    }

    return 0;
  }

  private metadataToText(metadata: AssetMetadata): string {
    const parts = [];
    if (metadata.theme) {
      parts.push(metadata.theme);
    }
    if (metadata.mood) {
      parts.push(metadata.mood);
    }
    if (metadata.setting) {
      parts.push(metadata.setting);
    }
    if (metadata.style) {
      parts.push(metadata.style);
    }
    if (metadata.keywords) {
      parts.push(...metadata.keywords);
    }
    if (metadata.entities) {
      parts.push(...metadata.entities);
    }
    return parts.join(' ');
  }

  private getRelevanceLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 70) {
      return 'high';
    }
    if (score >= 40) {
      return 'medium';
    }
    return 'low';
  }

  private generateExplanation(
    node: NodeMetadata,
    asset: AssetMetadata,
    score: number
  ): string {
    const reasons = [];

    if (node.setting === asset.setting) {
      reasons.push(`Same setting: ${node.setting}`);
    }
    if (node.mood === asset.mood) {
      reasons.push(`Matching mood: ${node.mood}`);
    }
    if (node.theme === asset.theme) {
      reasons.push(`Similar theme: ${node.theme}`);
    }

    if (reasons.length === 0) {
      return `General compatibility (score: ${Math.round(score)})`;
    }

    reasons.push(`Score: ${Math.round(score)}`);
    return reasons.join(', ');
  }

  // Check if suggestions should use smart mode
  isSmartModeAvailable(): boolean {
    return !this.offlineMode && this.metadataExtractor !== null;
  }

  // Toggle offline mode
  setOfflineMode(offline: boolean): void {
    this.offlineMode = offline;
  }

  // Get suggestions for WeightedChoice quick add
  async getSuggestionsForWeightedChoice(
    nodeMetadata: NodeMetadata,
    assets: Asset[]
  ): Promise<AssetMatch[]> {
    // Filter for compatible assets (text-based)
    const compatibleAssets = assets.filter(
      asset =>
        asset.type === 'psg' ||
        asset.metadata?.keywords?.includes('text') ||
        asset.metadata?.keywords?.includes('choice')
    );

    return this.findMatches(nodeMetadata, compatibleAssets, {
      limit: 5,
      minScore: 20
    });
  }

  // Batch processing for multiple nodes
  async findMatchesForMultipleNodes(
    nodes: NodeMetadata[],
    assets: Asset[]
  ): Promise<Map<string, AssetMatch[]>> {
    const results = new Map<string, AssetMatch[]>();

    // Process in parallel for performance
    await Promise.all(
      nodes.map(async node => {
        const matches = await this.findMatches(node, assets);
        if (node.nodeId) {
          results.set(node.nodeId, matches);
        }
      })
    );

    return results;
  }
}
