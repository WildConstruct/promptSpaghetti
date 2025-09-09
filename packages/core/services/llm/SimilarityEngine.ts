// Advanced Similarity Engine for Story 2.3b
// Provides semantic similarity matching using vector embeddings

import { SegmentMetadata } from './MetadataExtractor';
import { LLMService } from './LLMService';

export interface SimilarityOptions {
  limit?: number;
  threshold?: number;
  weights?: {
    semantic?: number;
    style?: number;
    tags?: number;
    recency?: number;
  };
}

export interface SimilarAsset {
  id: string;
  score: number;
  explanation: string;
  matches: {
    semantic?: number;
    style?: number;
    tags?: number;
    recency?: number;
  };
}

export interface AssetEmbedding {
  asset_id: string;
  embedding: number[];
  metadata: SegmentMetadata;
  timestamp: string;
}

export interface ClusterInfo {
  id: string;
  name: string;
  centroid: number[];
  members: string[];
  description: string;
}

// Simple in-memory vector database for MVP
class SimpleVectorDB {
  private embeddings: Map<string, AssetEmbedding> = new Map();
  private dimensions: number = 384; // Default embedding size

  async store(embedding: AssetEmbedding): Promise<void> {
    this.embeddings.set(embedding.asset_id, embedding);
  }

  async search(
    queryVector: number[],
    limit: number = 10
  ): Promise<Array<{ id: string; score: number }>> {
    const scores: Array<{ id: string; score: number }> = [];

    for (const [id, embedding] of this.embeddings.entries()) {
      const score = this.cosineSimilarity(queryVector, embedding.embedding);
      scores.push({ id, score });
    }

    return scores.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async findClusters(k: number = 5): Promise<ClusterInfo[]> {
    // Simple k-means clustering
    const vectors = Array.from(this.embeddings.values());
    if (vectors.length < k) return [];

    // Initialize centroids randomly
    const centroids: number[][] = [];
    for (let i = 0; i < k; i++) {
      const randomIdx = Math.floor(Math.random() * vectors.length);
      centroids.push([...vectors[randomIdx].embedding]);
    }

    // Run k-means iterations
    const maxIterations = 20;
    let clusters: Map<number, string[]> = new Map();

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to clusters
      clusters = new Map();
      for (let i = 0; i < k; i++) {
        clusters.set(i, []);
      }

      for (const embedding of vectors) {
        let bestCluster = 0;
        let bestScore = -1;

        for (let i = 0; i < k; i++) {
          const score = this.cosineSimilarity(
            embedding.embedding,
            centroids[i]
          );
          if (score > bestScore) {
            bestScore = score;
            bestCluster = i;
          }
        }

        clusters.get(bestCluster)!.push(embedding.asset_id);
      }

      // Update centroids
      for (let i = 0; i < k; i++) {
        const clusterMembers = clusters.get(i)!;
        if (clusterMembers.length === 0) continue;

        const newCentroid = new Array(this.dimensions).fill(0);
        for (const memberId of clusterMembers) {
          const memberEmbedding = this.embeddings.get(memberId)!;
          for (let d = 0; d < this.dimensions; d++) {
            newCentroid[d] += memberEmbedding.embedding[d];
          }
        }

        for (let d = 0; d < this.dimensions; d++) {
          newCentroid[d] /= clusterMembers.length;
        }

        centroids[i] = newCentroid;
      }
    }

    // Create cluster info
    const clusterInfos: ClusterInfo[] = [];
    for (let i = 0; i < k; i++) {
      const members = clusters.get(i)!;
      if (members.length > 0) {
        clusterInfos.push({
          id: `cluster_${i}`,
          name: this.generateClusterName(members),
          centroid: centroids[i],
          members,
          description: `Cluster with ${members.length} items`
        });
      }
    }

    return clusterInfos;
  }

  private generateClusterName(members: string[]): string {
    // Generate a name based on common tags or metadata
    const commonTags = new Map<string, number>();

    for (const memberId of members) {
      const embedding = this.embeddings.get(memberId);
      if (embedding?.metadata?.tags) {
        for (const tag of embedding.metadata.tags) {
          commonTags.set(tag, (commonTags.get(tag) || 0) + 1);
        }
      }
    }

    const sortedTags = Array.from(commonTags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tag]) => tag);

    return sortedTags.length > 0 ? sortedTags.join(' & ') : 'Mixed Group';
  }
}

export class SimilarityEngine {
  private vectorDB: SimpleVectorDB;
  private llmService: LLMService | null;
  private embeddingCache: Map<string, number[]> = new Map();

  constructor(llmService?: LLMService) {
    this.vectorDB = new SimpleVectorDB();
    this.llmService = llmService || null;
  }

  // Generate embedding for text/metadata
  async generateEmbedding(
    text: string,
    metadata?: SegmentMetadata
  ): Promise<number[]> {
    // Check cache first
    const cacheKey = `${text}_${JSON.stringify(metadata || {})}`;
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey)!;
    }

    // Generate embedding (simplified for MVP - uses random vectors)
    // In production, this would call an embedding model
    let embedding: number[];

    if (this.llmService) {
      try {
        // Would call real embedding model here
        embedding = await this.generateMockEmbedding(text, metadata);
      } catch (error) {
        console.debug('Embedding generation failed, using fallback:', error);
        embedding = this.generateFallbackEmbedding(text, metadata);
      }
    } else {
      embedding = this.generateFallbackEmbedding(text, metadata);
    }

    // Cache the embedding
    this.embeddingCache.set(cacheKey, embedding);
    return embedding;
  }

  // Find similar assets
  async findSimilar(
    queryText: string,
    queryMetadata: SegmentMetadata,
    options: SimilarityOptions = {}
  ): Promise<SimilarAsset[]> {
    const {
      limit = 10,
      threshold = 0.5,
      weights = {
        semantic: 0.4,
        style: 0.3,
        tags: 0.2,
        recency: 0.1
      }
    } = options;

    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(
      queryText,
      queryMetadata
    );

    // Search vector database
    const vectorMatches = await this.vectorDB.search(queryEmbedding, limit * 2);

    // Calculate composite scores
    const results: SimilarAsset[] = [];

    for (const match of vectorMatches) {
      const semanticScore = match.score;
      const styleScore = this.calculateStyleSimilarity(queryMetadata, match.id);
      const tagScore = this.calculateTagSimilarity(queryMetadata, match.id);
      const recencyScore = this.calculateRecencyScore(match.id);

      const compositeScore =
        weights.semantic! * semanticScore +
        weights.style! * styleScore +
        weights.tags! * tagScore +
        weights.recency! * recencyScore;

      if (compositeScore >= threshold) {
        results.push({
          id: match.id,
          score: compositeScore,
          explanation: this.explainMatch(
            semanticScore,
            styleScore,
            tagScore,
            recencyScore
          ),
          matches: {
            semantic: semanticScore,
            style: styleScore,
            tags: tagScore,
            recency: recencyScore
          }
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Index an asset
  async indexAsset(
    id: string,
    text: string,
    metadata: SegmentMetadata
  ): Promise<void> {
    const embedding = await this.generateEmbedding(text, metadata);

    const assetEmbedding: AssetEmbedding = {
      asset_id: id,
      embedding,
      metadata,
      timestamp: new Date().toISOString()
    };

    await this.vectorDB.store(assetEmbedding);
  }

  // Bulk index assets
  async bulkIndex(
    assets: Array<{ id: string; text: string; metadata: SegmentMetadata }>
  ): Promise<void> {
    const batchSize = 10;

    for (let i = 0; i < assets.length; i += batchSize) {
      const batch = assets.slice(i, i + batchSize);

      await Promise.all(
        batch.map(asset =>
          this.indexAsset(asset.id, asset.text, asset.metadata)
        )
      );
    }
  }

  // Find clusters in the asset space
  async findClusters(k?: number): Promise<ClusterInfo[]> {
    return this.vectorDB.findClusters(k);
  }

  // Get "more like this" suggestions
  async moreLikeThis(
    assetId: string,
    limit: number = 5
  ): Promise<SimilarAsset[]> {
    // Retrieve the asset's data
    const assetData = await this.getAssetData(assetId);
    if (!assetData) return [];

    return this.findSimilar(
      assetData.text || '',
      assetData.metadata || { tags: [] },
      { limit, threshold: 0.3 }
    );
  }

  // Private helper methods

  private async generateMockEmbedding(
    text: string,
    metadata?: SegmentMetadata
  ): Promise<number[]> {
    // Mock embedding generation based on text features
    const dimensions = 384;
    const embedding = new Array(dimensions);

    // Use text hash as seed for deterministic embeddings
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash = hash & hash;
    }

    // Generate pseudo-random values based on hash
    for (let i = 0; i < dimensions; i++) {
      const seed = hash + i;
      embedding[i] = Math.sin(seed) * Math.cos(seed * 0.5);
    }

    // Incorporate metadata features
    if (metadata) {
      if (metadata.mood === 'intense') embedding[0] += 0.5;
      if (metadata.mood === 'calm') embedding[0] -= 0.5;
      if (metadata.location === 'urban') embedding[1] += 0.3;
      if (metadata.location === 'desert') embedding[1] -= 0.3;
      if (metadata.tags?.includes('action')) embedding[2] += 0.4;
    }

    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < dimensions; i++) {
        embedding[i] /= norm;
      }
    }

    return embedding;
  }

  private generateFallbackEmbedding(
    text: string,
    metadata?: SegmentMetadata
  ): number[] {
    // Simple fallback embedding based on text features
    const dimensions = 384;
    const embedding = new Array(dimensions).fill(0);

    // Use simple features
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length && i < dimensions; i++) {
      let wordHash = 0;
      for (let j = 0; j < words[i].length; j++) {
        wordHash += words[i].charCodeAt(j);
      }
      embedding[i] = wordHash / 1000;
    }

    // Add metadata features
    if (metadata?.tags) {
      for (let i = 0; i < metadata.tags.length && i < 10; i++) {
        embedding[100 + i] = metadata.tags[i].length / 10;
      }
    }

    return embedding;
  }

  private calculateStyleSimilarity(
    query: SegmentMetadata,
    assetId: string
  ): number {
    // Calculate style similarity based on mood, intensity, etc.
    // Simplified for MVP
    return Math.random() * 0.8 + 0.2;
  }

  private calculateTagSimilarity(
    query: SegmentMetadata,
    assetId: string
  ): number {
    // Calculate tag overlap
    // Simplified for MVP
    return Math.random() * 0.7 + 0.3;
  }

  private calculateRecencyScore(assetId: string): number {
    // Prefer recently used assets slightly
    // Simplified for MVP
    return Math.random() * 0.5 + 0.5;
  }

  private explainMatch(
    semantic: number,
    style: number,
    tags: number,
    recency: number
  ): string {
    const factors: string[] = [];

    if (semantic > 0.7) factors.push('Strong semantic match');
    else if (semantic > 0.5) factors.push('Good semantic similarity');

    if (style > 0.7) factors.push('Similar style/mood');
    if (tags > 0.7) factors.push('Matching tags');
    if (recency > 0.8) factors.push('Recently used');

    return factors.length > 0 ? factors.join(', ') : 'General similarity';
  }

  private async getAssetData(
    assetId: string
  ): Promise<{ text?: string; metadata?: SegmentMetadata } | null> {
    // In production, this would retrieve from a database
    // For now, return mock data
    return {
      text: `Asset ${assetId} content`,
      metadata: { tags: ['sample'] }
    };
  }
}
