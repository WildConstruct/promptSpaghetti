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
    tags: NodeTag[];
    era: EraTag[];
    genre: GenreTag[];
    style: StyleTag[];
    quality: QualityMetadata;
    historicalContext: HistoricalContext;
    created: string;
    updated: string;
    author: string;

export interface NodeTag {
    id: string;
    type: 'era' | 'genre' | 'style' | 'material' | 'social_class' | 'region' | 'custom';
    value: string;
    source: 'user' | 'system' | 'imported' | 'inferred';
    confidence: number;
    metadata?: Record<string, any>;

export interface EraTag {
    id: string;
    name: string;
    period: {,
        start: number;
        end: number;
    };
    region: string[];
    accuracy: 'high' | 'medium' | 'low';
    description: string;
    parent?: string;
    children?: string[];

export interface GenreTag {
    id: string;
    name: string;
    category: 'artistic' | 'literary' | 'musical' | 'architectural' | 'cultural';
    description: string;
    characteristics: string[];
    relatedGenres: string[];

export interface StyleTag {
    id: string;
    name: string;
    category: 'fashion' | 'architecture' | 'art' | 'literature' | 'decoration';
    period: string[];
    region: string[];
    description: string;
    keyFeatures: string[];

export interface QualityMetadata {
    authenticity: number;
    completeness: number;
    sources: string[];
    verification: 'verified' | 'unverified' | 'disputed' | 'fictional';
    lastVerified?: string;

export interface HistoricalContext {
    socialClass: 'peasant' | 'artisan' | 'merchant' | 'noble' | 'clergy' | 'royal' | 'unknown';
    usage: 'daily' | 'ceremonial' | 'religious' | 'military' | 'trade' | 'artistic';
    rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'unique';
    materials: string[];
    productionMethod: string[];
    culturalSignificance: string;

export interface TagInheritanceRule {
    id: string;
    name: string;
    sourceType: string;
    targetType: string;
    conditions: TagCondition[];
    transformations: TagTransformation[];
    enabled: boolean;

export interface TagCondition {
    field: string;
    operator: 'equals' | 'contains' | 'matches' | 'in' | 'not_in';
    value: any;

export interface TagTransformation {
    type: 'copy' | 'modify' | 'merge' | 'filter';
    config: Record<string, any>;
/**
 * NodeMetadataManager - Manages metadata and tagging for nodes
 */
export declare class NodeMetadataManager {
    private static instance;
    private nodeMetadata;
    private eraDefinitions;
    private genreDefinitions;
    private styleDefinitions;
    private inheritanceRules;
    static getInstance(): NodeMetadataManager;
    constructor();
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
    /**
     * Add tags to a node
     */
    addNodeTags(nodeId: string, tags: NodeTag[]): void;
    /**
     * Remove tags from a node
     */
    removeNodeTags(nodeId: string, tagIds: string[]): void;
    /**
     * Search nodes by tags
     */
    searchNodesByTags(searchTags: Partial<NodeTag>[], operator?: 'AND' | 'OR'): string[];
    /**
     * Get all available era definitions
     */
    getEraDefinitions(): EraTag[];
    /**
     * Get era definition by ID
     */
    getEraDefinition(id: string): EraTag | undefined;
    /**
     * Get eras by time period
     */
    getErasByPeriod(year: number): EraTag[];
    /**
     * Get all available genre definitions
     */
    getGenreDefinitions(): GenreTag[];
    /**
     * Get all available style definitions
     */
    getStyleDefinitions(): StyleTag[];
    /**
     * Apply tag inheritance rules
     */
    applyTagInheritance();
      sourceNodeId: string,
      targetNodeId: string,
      sourceNodeType: string,
      targetNodeType: string,
    ): void;
    /**
     * Evaluate inheritance rule conditions
     */
    private evaluateConditions;
    /**
     * Apply tag transformation
     */
    private applyTagTransformation;
    /**
     * Infer tags from node content
     */
    inferTagsFromContent(nodeId: string, content: string, nodeType: string): NodeTag[];
    /**
     * Validate tag compatibility
     */
    validateTagCompatibility(tags: NodeTag[]): {
        valid: boolean;
        conflicts: string[];
        warnings: string[];
    };
    /**
     * Check material-era compatibility
     */
    private checkMaterialEraCompatibility;
    /**
     * Get tag statistics
     */
    getTagStatistics(): {
        totalNodes: number;
        taggedNodes: number;
        totalTags: number;
        tagsByType: Record<string, number>;
        averageTagsPerNode: number;
        topTags: {,
            value: string;
            count: number;
        }[];
    };
    /**
     * Export metadata for external use
     */
    exportMetadata(nodeIds?: string[]): NodeMetadata[];
    /**
     * Import metadata from external source
     */
    importMetadata(metadataList: NodeMetadata[]): {
        imported: number;
        errors: string[];
    };

export declare const nodeMetadataManager: NodeMetadataManager;
//# sourceMappingURL=NodeMetadataManager.d.ts.map