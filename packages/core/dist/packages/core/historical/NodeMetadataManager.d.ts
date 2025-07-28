/**
 * Node Metadata and Tagging System
 * Epic 8.8 Task 2: Node Metadata and Tagging System
 *
 * Extends node schema to support metadata tags, era-based tagging,
 * genre/style classification, and tag management.
 */
export interface NodeMetadata {
    id: string;
    nodeId: string;
    tags: NodeTag;
    era: EraTag;
    genre: GenreTag;
    style: StyleTag;
    quality: QualityMetadata;
    historicalContext: HistoricalContext;
    created: string;
    updated: string;
    author: string;
}
export interface NodeTag {
    id: string;
    type: 'era' | 'genre' | 'style' | 'material' | 'social_class' | 'region' | 'custom';
    value: string;
    source: 'user' | 'system' | 'imported' | 'inferred';
    confidence: number;
    metadata?: Record<string, any>;
}
export interface EraTag {
    id: string;
    name: string;
    period: {
        start: number;
        end: number;
    };
    region: string;
    accuracy: 'high' | 'medium' | 'low';
    description: string;
    parent?: string;
    children?: string;
}
export interface GenreTag {
    id: string;
    name: string;
    category: 'artistic' | 'literary' | 'musical' | 'architectural' | 'cultural';
    description: string;
    characteristics: string;
    relatedGenres: string;
}
export interface StyleTag {
    id: string;
    name: string;
    category: 'fashion' | 'architecture' | 'art' | 'literature' | 'decoration';
    period: string;
    region: string;
    description: string;
    keyFeatures: string;
}
export interface QualityMetadata {
    authenticity: number;
    completeness: number;
    sources: string;
    verification: 'verified' | 'unverified' | 'disputed' | 'fictional';
    lastVerified?: string;
}
export interface HistoricalContext {
    socialClass: 'peasant' | 'artisan' | 'merchant' | 'noble' | 'clergy' | 'royal' | 'unknown';
    usage: 'daily' | 'ceremonial' | 'religious' | 'military' | 'trade' | 'artistic';
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'unique';
    materials: string;
    productionMethod: string;
    culturalSignificance: string;
}
export interface TagInheritanceRule {
    id: string;
    name: string;
    sourceType: string;
    targetType: string;
    conditions: TagCondition;
    transformations: TagTransformation;
    enabled: boolean;
}
export interface TagCondition {
    field: string;
    operator: 'equals' | 'contains' | 'matches' | 'in' | 'not_in';
    value: any;
}
export interface TagTransformation {
    type: 'copy' | 'modify' | 'merge' | 'filter';
    config: Record<string, any>;
}
export declare class NodeMetadataManager {
    private static instance;
    private nodeMetadata;
    private eraDefinitions;
    private genreDefinitions;
    private styleDefinitions;
    private inheritanceRules;
    static getInstance(): NodeMetadataManager;
    /**
     * Initialize default era, genre, and style definitions
     */
    private initializeDefaultDefinitions;
    private initializeEraDefinitions;
    private initializeGenreDefinitions;
    private initializeStyleDefinitions;
    /**
     * Initialize default tag inheritance rules
     */
    private initializeDefaultInheritanceRules;
    /**
     * Get metadata for a specific node
     */
    getNodeMetadata(nodeId: string): NodeMetadata | undefined;
    /**
     * Set metadata for a node
     */
    setNodeMetadata(nodeId: string, metadata: Partial<NodeMetadata>): void;
    nodeId: any;
    tags: metadata.tags;
}
//# sourceMappingURL=NodeMetadataManager.d.ts.map