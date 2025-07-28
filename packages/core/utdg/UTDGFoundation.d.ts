/**
 * UTDG Foundation Architecture
 * Universal Texture Description Graph - Advanced content integration system
 * Provides unified interface for historical, cultural, and creative content integration
 */
import { HistoricalEra, Genre, Style } from '../historical/NodeMetadataManager';

export interface UTDGNode {
    id: string;
    type: 'concept' | 'entity' | 'relationship' | 'attribute' | 'constraint';
    label: string;
    description: string;
    properties: Record<string, any>;
    metadata: {,
        era?: HistoricalEra;
        genre?: Genre;
        style?: Style;
        tags: string[];
        confidence: number;
        sources: string[];
        lastUpdated: Date;
    };
    relationships: UTDGRelationship[];

export interface UTDGRelationship {
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: 'contains' | 'partOf' | 'influences' | 'requires' | 'excludes' | 'similar' | 'temporal' | 'causal';
    strength: number;
    direction: 'bidirectional' | 'sourceToTarget' | 'targetToSource';
    context?: string;
    temporalConstraints?: {
        before?: Date;
        after?: Date;
        duration?: number;
    };

export interface UTDGQuery {
    nodeTypes?: string[];
    relationshipTypes?: string[];
    eras?: HistoricalEra[];
    genres?: Genre[];
    styles?: Style[];
    tags?: string[];
    confidenceThreshold?: number;
    maxResults?: number;
    includeRelationships?: boolean;
    spatialConstraints?: {
        regions?: string[];
        excludeRegions?: string[];
    };
    temporalConstraints?: {
        startYear?: number;
        endYear?: number;
        seasons?: string[];
    };
    socialConstraints?: {
        socialClasses?: string[];
        professions?: string[];
        genders?: string[];
    };

export interface UTDGContext {
    historical: {,
        era: HistoricalEra;
        year?: number;
        region?: string;
        culturalContext?: string;
    };
    creative: {,
        genre: Genre;
        style: Style;
        tone?: string;
        audience?: string;
    };
    technical: {,
        accuracy: 'strict' | 'moderate' | 'creative';
        sources: 'academic' | 'popular' | 'mixed';
        validation: boolean;
    };

export interface UTDGContentSuggestion {
    type: 'character' | 'setting' | 'object' | 'event' | 'concept';
    content: any;
    confidence: number;
    reasoning: string;
    alternatives: any[];
    historicalAccuracy: {,
        score: number;
        violations: string[];
        suggestions: string[];
    };

export declare class UTDGFoundation {
    private nodes;
    private relationships;
    private metadataManager;
    private dataSourceManager;
    private medievalDemo;
    private indexByType;
    private indexByEra;
    private indexByGenre;
    private indexByTags;
    constructor();
    /**
     * Initialize UTDG foundation with core knowledge graph
     */
    private initializeFoundation;
    /**
     * Build core knowledge graph structure
     */
    private buildCoreKnowledgeGraph;
    /**
     * Integrate medieval content into UTDG
     */
    private integrateMedievalContent;
    /**
     * Build relationships between historical elements
     */
    private buildHistoricalRelationships;
    /**
     * Add node to the graph
     */
    addNode(node: UTDGNode): void;
    /**
     * Add relationship to the graph
     */
    addRelationship(relationship: UTDGRelationship): void;
    /**
     * Query the UTDG for relevant content
     */
    query(query: UTDGQuery): UTDGNode[];
    /**
     * Generate content suggestions based on context
     */
    generateContentSuggestions(context: UTDGContext): UTDGContentSuggestion[];
    /**
     * Validate historical accuracy of content
     */
    private validateHistoricalAccuracy;
    /**
     * Update search indices
     */
    private updateIndices;
    /**
     * Validate graph consistency
     */
    private validateGraphConsistency;
    /**
     * Check for circular dependencies in the graph
     */
    private hasCircularDependency;
    /**
     * Helper methods for social class properties
     */
    private getSocialClassEconomicPower;
    private getSocialClassPoliticalInfluence;
    private getSocialClassMobility;
    private getSocialClassOccupations;
    /**
     * Get graph statistics
     */
    getGraphStats(): {
        totalNodes: number;
        totalRelationships: number;
        nodesByType: Record<string, number>;
        nodesByEra: Record<string, number>;
        averageConfidence: number;
    };
    /**
     * Export graph data for external use
     */
    exportGraph(): {
        nodes: UTDGNode[];
        relationships: UTDGRelationship[];
        metadata: {,
            exportDate: Date;
            version: string;
            stats: any;
        };
    };

export default UTDGFoundation;
//# sourceMappingURL=UTDGFoundation.d.ts.map