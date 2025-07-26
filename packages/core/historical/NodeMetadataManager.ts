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
}

export interface NodeTag {
  id: string;
  type: 'era' | 'genre' | 'style' | 'material' | 'social_class' | 'region' | 'custom';
  value: string;
  source: 'user' | 'system' | 'imported' | 'inferred';
  confidence: number; // 0-1 confidence score
  metadata?: Record<string, any>;
}

export interface EraTag {
  id: string;
  name: string;
  period: {
    start: number;
    end: number;
  };
  region: string[];
  accuracy: 'high' | 'medium' | 'low';
  description: string;
  parent?: string; // For hierarchical periods
  children?: string[]; // Sub-periods
}

export interface GenreTag {
  id: string;
  name: string;
  category: 'artistic' | 'literary' | 'musical' | 'architectural' | 'cultural';
  description: string;
  characteristics: string[];
  relatedGenres: string[];
}

export interface StyleTag {
  id: string;
  name: string;
  category: 'fashion' | 'architecture' | 'art' | 'literature' | 'decoration';
  period: string[];
  region: string[];
  description: string;
  keyFeatures: string[];
}

export interface QualityMetadata {
  authenticity: number; // 0-1 historical authenticity score
  completeness: number; // 0-1 how complete the information is
  sources: string[]; // References to data sources
  verification: 'verified' | 'unverified' | 'disputed' | 'fictional';
  lastVerified?: string;
}

export interface HistoricalContext {
  socialClass: 'peasant' | 'artisan' | 'merchant' | 'noble' | 'clergy' | 'royal' | 'unknown';
  usage: 'daily' | 'ceremonial' | 'religious' | 'military' | 'trade' | 'artistic';
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'unique';
  materials: string[];
  productionMethod: string[];
  culturalSignificance: string;
}

export interface TagInheritanceRule {
  id: string;
  name: string;
  sourceType: string; // Node type that provides tags
  targetType: string; // Node type that receives tags
  conditions: TagCondition[];
  transformations: TagTransformation[];
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

/**
 * NodeMetadataManager - Manages metadata and tagging for nodes
 */
export class NodeMetadataManager {
  private static instance: NodeMetadataManager;
  private nodeMetadata = new Map<string, NodeMetadata>();
  private eraDefinitions = new Map<string, EraTag>();
  private genreDefinitions = new Map<string, GenreTag>();
  private styleDefinitions = new Map<string, StyleTag>();
  private inheritanceRules = new Map<string, TagInheritanceRule>();

  public static getInstance(): NodeMetadataManager {
    if (!NodeMetadataManager.instance) {
      NodeMetadataManager.instance = new NodeMetadataManager();
    }
    return NodeMetadataManager.instance;
  }

  constructor() {
    this.initializeDefaultDefinitions();
    this.initializeDefaultInheritanceRules();
  }

  /**
   * Initialize default era, genre, and style definitions
   */
  private initializeDefaultDefinitions(): void {
    // Initialize era definitions
    this.initializeEraDefinitions();
    this.initializeGenreDefinitions();
    this.initializeStyleDefinitions();
  }

  private initializeEraDefinitions(): void {
    const eras: EraTag[] = [
      {
        id: 'ancient-egypt',
        name: 'Ancient Egypt',
        period: { start: -3100, end: -30 },
        region: ['egypt', 'north-africa'],
        accuracy: 'high',
        description: 'Ancient Egyptian civilization from the Early Dynastic Period to Roman conquest',
        children: ['old-kingdom', 'middle-kingdom', 'new-kingdom']
      },
      {
        id: 'classical-antiquity',
        name: 'Classical Antiquity',
        period: { start: -800, end: 600 },
        region: ['greece', 'rome', 'mediterranean'],
        accuracy: 'high',
        description: 'Period of classical Greek and Roman civilizations',
        children: ['archaic-greece', 'classical-greece', 'hellenistic', 'roman-republic', 'roman-empire']
      },
      {
        id: 'early-medieval',
        name: 'Early Medieval Period',
        period: { start: 500, end: 1000 },
        region: ['europe', 'britain', 'france', 'germany'],
        accuracy: 'high',
        description: 'Early medieval period, also known as the Dark Ages',
        parent: 'medieval',
        children: ['carolingian', 'anglo-saxon', 'viking-age']
      },
      {
        id: 'high-medieval',
        name: 'High Medieval Period',
        period: { start: 1000, end: 1300 },
        region: ['europe', 'britain', 'france', 'germany', 'italy'],
        accuracy: 'high',
        description: 'High medieval period characterized by population growth, urban development, and crusades',
        parent: 'medieval',
        children: ['romanesque', 'early-gothic']
      },
      {
        id: 'late-medieval',
        name: 'Late Medieval Period',
        period: { start: 1300, end: 1500 },
        region: ['europe', 'britain', 'france', 'germany', 'italy'],
        accuracy: 'high',
        description: 'Late medieval period marked by social upheaval, plague, and emergence of nation-states',
        parent: 'medieval',
        children: ['gothic', 'early-renaissance']
      },
      {
        id: 'renaissance',
        name: 'Renaissance',
        period: { start: 1400, end: 1600 },
        region: ['italy', 'europe', 'france', 'england'],
        accuracy: 'high',
        description: 'Cultural rebirth and intellectual movement in Europe',
        children: ['early-renaissance', 'high-renaissance', 'northern-renaissance']
      },
      {
        id: 'baroque',
        name: 'Baroque Period',
        period: { start: 1600, end: 1750 },
        region: ['europe', 'italy', 'france', 'spain', 'germany'],
        accuracy: 'high',
        description: 'Artistic and architectural style characterized by ornate detail and dramatic effects'
      },
      {
        id: 'enlightenment',
        name: 'Age of Enlightenment',
        period: { start: 1650, end: 1800 },
        region: ['europe', 'france', 'britain', 'germany'],
        accuracy: 'high',
        description: 'Intellectual and philosophical movement emphasizing reason and individualism'
      },
      {
        id: 'industrial',
        name: 'Industrial Age',
        period: { start: 1760, end: 1840 },
        region: ['britain', 'europe', 'america'],
        accuracy: 'high',
        description: 'Period of major industrialization and technological advancement'
      },
      {
        id: 'victorian',
        name: 'Victorian Era',
        period: { start: 1837, end: 1901 },
        region: ['britain', 'british-empire'],
        accuracy: 'high',
        description: 'Period of British history during Queen Victoria\'s reign'
      },
      {
        id: 'modern',
        name: 'Modern Period',
        period: { start: 1900, end: 2000 },
        region: ['global'],
        accuracy: 'high',
        description: 'Modern historical period of the 20th century'
      }
    ];

    eras.forEach(era => this.eraDefinitions.set(era.id, era));
  }

  private initializeGenreDefinitions(): void {
    const genres: GenreTag[] = [
      {
        id: 'epic-fantasy',
        name: 'Epic Fantasy',
        category: 'literary',
        description: 'Fantasy subgenre characterized by large-scale adventures and world-building',
        characteristics: ['heroic quests', 'magical worlds', 'good vs evil', 'multiple character arcs'],
        relatedGenres: ['high-fantasy', 'sword-and-sorcery', 'mythology']
      },
      {
        id: 'historical-fiction',
        name: 'Historical Fiction',
        category: 'literary',
        description: 'Fiction set in the past that attempts to capture historical period details',
        characteristics: ['period settings', 'historical accuracy', 'authentic dialogue', 'period customs'],
        relatedGenres: ['period-drama', 'historical-romance', 'biographical-fiction']
      },
      {
        id: 'gothic-architecture',
        name: 'Gothic Architecture',
        category: 'architectural',
        description: 'Architectural style prevalent in Europe during medieval period',
        characteristics: ['pointed arches', 'ribbed vaults', 'flying buttresses', 'large windows'],
        relatedGenres: ['romanesque', 'byzantine', 'renaissance']
      },
      {
        id: 'courtly-romance',
        name: 'Courtly Romance',
        category: 'literary',
        description: 'Medieval literary tradition focusing on chivalric love and adventure',
        characteristics: ['chivalric ideals', 'courtly love', 'quests', 'noble characters'],
        relatedGenres: ['chansons-de-geste', 'arthurian-legend', 'epic-poetry']
      },
      {
        id: 'religious-art',
        name: 'Religious Art',
        category: 'artistic',
        description: 'Art created for religious purposes or depicting religious themes',
        characteristics: ['biblical scenes', 'saints', 'symbolic imagery', 'devotional purpose'],
        relatedGenres: ['icon-painting', 'illuminated-manuscripts', 'church-architecture']
      }
    ];

    genres.forEach(genre => this.genreDefinitions.set(genre.id, genre));
  }

  private initializeStyleDefinitions(): void {
    const styles: StyleTag[] = [
      {
        id: 'byzantine-fashion',
        name: 'Byzantine Fashion',
        category: 'fashion',
        period: ['byzantine'],
        region: ['byzantine-empire', 'constantinople'],
        description: 'Luxurious clothing style of the Byzantine Empire',
        keyFeatures: ['rich fabrics', 'elaborate embroidery', 'imperial purple', 'religious motifs']
      },
      {
        id: 'medieval-court-dress',
        name: 'Medieval Court Dress',
        category: 'fashion',
        period: ['high-medieval', 'late-medieval'],
        region: ['france', 'england', 'germany'],
        description: 'Formal attire worn at medieval royal courts',
        keyFeatures: ['long sleeves', 'fitted bodices', 'trailing hems', 'heraldic elements']
      },
      {
        id: 'romanesque-style',
        name: 'Romanesque Style',
        category: 'architecture',
        period: ['early-medieval', 'high-medieval'],
        region: ['europe', 'france', 'italy'],
        description: 'Architectural style preceding Gothic, characterized by round arches',
        keyFeatures: ['round arches', 'thick walls', 'small windows', 'barrel vaults']
      },
      {
        id: 'illuminated-manuscript',
        name: 'Illuminated Manuscript Style',
        category: 'art',
        period: ['medieval', 'renaissance'],
        region: ['europe', 'ireland', 'britain'],
        description: 'Decorative manuscript style with ornate lettering and illustrations',
        keyFeatures: ['gold leaf', 'ornate letters', 'miniature paintings', 'border decorations']
      },
      {
        id: 'gothic-decoration',
        name: 'Gothic Decorative Style',
        category: 'decoration',
        period: ['high-medieval', 'late-medieval'],
        region: ['france', 'england', 'germany'],
        description: 'Decorative style associated with Gothic architecture',
        keyFeatures: ['trefoils', 'quatrefoils', 'crockets', 'finials', 'geometric patterns']
      }
    ];

    styles.forEach(style => this.styleDefinitions.set(style.id, style));
  }

  /**
   * Initialize default tag inheritance rules
   */
  private initializeDefaultInheritanceRules(): void {
    const rules: TagInheritanceRule[] = [
      {
        id: 'era-inheritance',
        name: 'Era Tag Inheritance',
        sourceType: 'SetVariable',
        targetType: 'WeightedChoice',
        conditions: [
          { field: 'variableName', operator: 'contains', value: 'era' },
          { field: 'value', operator: 'in', value: ['medieval', 'renaissance', 'ancient'] }
        ],
        transformations: [
          { type: 'copy', config: { tagTypes: ['era'] } }
        ],
        enabled: true
      },
      {
        id: 'material-inheritance',
        name: 'Material Tag Inheritance',
        sourceType: 'WeightedChoice',
        targetType: 'Concat',
        conditions: [
          { field: 'choices', operator: 'contains', value: 'material' }
        ],
        transformations: [
          { type: 'copy', config: { tagTypes: ['material', 'era'] } }
        ],
        enabled: true
      },
      {
        id: 'social-class-inheritance',
        name: 'Social Class Tag Inheritance',
        sourceType: 'SetVariable',
        targetType: 'Output',
        conditions: [
          { field: 'variableName', operator: 'matches', value: /social|class|rank/i }
        ],
        transformations: [
          { type: 'copy', config: { tagTypes: ['social_class', 'era'] } }
        ],
        enabled: true
      }
    ];

    rules.forEach(rule => this.inheritanceRules.set(rule.id, rule));
  }

  /**
   * Get metadata for a specific node
   */
  public getNodeMetadata(nodeId: string): NodeMetadata | undefined {
    return this.nodeMetadata.get(nodeId);
  }

  /**
   * Set metadata for a node
   */
  public setNodeMetadata(nodeId: string, metadata: Partial<NodeMetadata>): void {
    const existing = this.nodeMetadata.get(nodeId);
    const now = new Date().toISOString();

    const updatedMetadata: NodeMetadata = {
      id: existing?.id || `meta-${nodeId}-${Date.now()}`,
      nodeId,
      tags: metadata.tags || existing?.tags || [],
      era: metadata.era || existing?.era || [],
      genre: metadata.genre || existing?.genre || [],
      style: metadata.style || existing?.style || [],
      quality: metadata.quality || existing?.quality || {
        authenticity: 0.5,
        completeness: 0.5,
        sources: [],
        verification: 'unverified'
      },
      historicalContext: metadata.historicalContext || existing?.historicalContext || {
        socialClass: 'unknown',
        usage: 'daily',
        rarity: 'common',
        materials: [],
        productionMethod: [],
        culturalSignificance: ''
      },
      created: existing?.created || now,
      updated: now,
      author: metadata.author || existing?.author || 'system'
    };

    this.nodeMetadata.set(nodeId, updatedMetadata);
  }

  /**
   * Add tags to a node
   */
  public addNodeTags(nodeId: string, tags: NodeTag[]): void {
    const metadata = this.getNodeMetadata(nodeId);
    if (metadata) {
      // Avoid duplicate tags
      const existingTagValues = new Set(metadata.tags.map(t => `${t.type}:${t.value}`));
      const newTags = tags.filter(tag => !existingTagValues.has(`${tag.type}:${tag.value}`));
      
      metadata.tags.push(...newTags);
      metadata.updated = new Date().toISOString();
      this.nodeMetadata.set(nodeId, metadata);
    } else {
      this.setNodeMetadata(nodeId, { tags });
    }
  }

  /**
   * Remove tags from a node
   */
  public removeNodeTags(nodeId: string, tagIds: string[]): void {
    const metadata = this.getNodeMetadata(nodeId);
    if (metadata) {
      metadata.tags = metadata.tags.filter(tag => !tagIds.includes(tag.id));
      metadata.updated = new Date().toISOString();
      this.nodeMetadata.set(nodeId, metadata);
    }
  }

  /**
   * Search nodes by tags
   */
  public searchNodesByTags(searchTags: Partial<NodeTag>[], operator: 'AND' | 'OR' = 'AND'): string[] {
    const results: string[] = [];

    for (const [nodeId, metadata] of this.nodeMetadata.entries()) {
      const matches = searchTags.map(searchTag => {
        return metadata.tags.some(nodeTag => {
          return Object.entries(searchTag).every(([key, value]) => {
            const nodeValue = (nodeTag as any)[key];
            if (key === 'confidence' && typeof value === 'number') {
              return nodeValue >= value;
            }
            return nodeValue === value;
          });
        });
      });

      const isMatch = operator === 'AND' 
        ? matches.every(Boolean)
        : matches.some(Boolean);

      if (isMatch) {
        results.push(nodeId);
      }
    }

    return results;
  }

  /**
   * Get all available era definitions
   */
  public getEraDefinitions(): EraTag[] {
    return Array.from(this.eraDefinitions.values());
  }

  /**
   * Get era definition by ID
   */
  public getEraDefinition(id: string): EraTag | undefined {
    return this.eraDefinitions.get(id);
  }

  /**
   * Get eras by time period
   */
  public getErasByPeriod(year: number): EraTag[] {
    return Array.from(this.eraDefinitions.values()).filter(era => 
      year >= era.period.start && year <= era.period.end
    );
  }

  /**
   * Get all available genre definitions
   */
  public getGenreDefinitions(): GenreTag[] {
    return Array.from(this.genreDefinitions.values());
  }

  /**
   * Get all available style definitions
   */
  public getStyleDefinitions(): StyleTag[] {
    return Array.from(this.styleDefinitions.values());
  }

  /**
   * Apply tag inheritance rules
   */
  public applyTagInheritance(
    sourceNodeId: string,
    targetNodeId: string,
    sourceNodeType: string,
    targetNodeType: string
  ): void {
    const applicableRules = Array.from(this.inheritanceRules.values()).filter(rule => 
      rule.enabled && 
      rule.sourceType === sourceNodeType && 
      rule.targetType === targetNodeType
    );

    const sourceMetadata = this.getNodeMetadata(sourceNodeId);
    if (!sourceMetadata) return;

    for (const rule of applicableRules) {
      // Check conditions
      const conditionsMet = this.evaluateConditions(rule.conditions, sourceMetadata);
      if (!conditionsMet) continue;

      // Apply transformations
      for (const transformation of rule.transformations) {
        this.applyTagTransformation(sourceMetadata, targetNodeId, transformation);
      }
    }
  }

  /**
   * Evaluate inheritance rule conditions
   */
  private evaluateConditions(conditions: TagCondition[], metadata: NodeMetadata): boolean {
    return conditions.every(condition => {
      // This would need to be implemented based on the actual node data structure
      // For now, we'll return true to allow inheritance
      return true;
    });
  }

  /**
   * Apply tag transformation
   */
  private applyTagTransformation(
    sourceMetadata: NodeMetadata,
    targetNodeId: string,
    transformation: TagTransformation
  ): void {
    switch (transformation.type) {
      case 'copy':
        const tagTypes = transformation.config.tagTypes as string[];
        const tagsToInherit = sourceMetadata.tags.filter(tag => 
          tagTypes.includes(tag.type)
        );
        
        if (tagsToInherit.length > 0) {
          this.addNodeTags(targetNodeId, tagsToInherit.map(tag => ({
            ...tag,
            id: `inherited-${tag.id}-${Date.now()}`,
            source: 'inferred' as const,
            confidence: Math.max(0.1, tag.confidence - 0.2) // Reduce confidence for inherited tags
          })));
        }
        break;
      
      case 'modify':
        // Implement tag modification logic
        break;
      
      case 'merge':
        // Implement tag merging logic
        break;
      
      case 'filter':
        // Implement tag filtering logic
        break;
    }
  }

  /**
   * Infer tags from node content
   */
  public inferTagsFromContent(nodeId: string, content: string, nodeType: string): NodeTag[] {
    const inferredTags: NodeTag[] = [];

    // Era inference
    const eras = this.getEraDefinitions();
    for (const era of eras) {
      const eraKeywords = [era.name.toLowerCase(), era.id];
      if (eraKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
        inferredTags.push({
          id: `inferred-era-${era.id}-${Date.now()}`,
          type: 'era',
          value: era.id,
          source: 'inferred',
          confidence: 0.7
        });
      }
    }

    // Material inference
    const materialKeywords = ['silk', 'wool', 'linen', 'cotton', 'leather', 'iron', 'steel', 'gold', 'silver', 'stone', 'wood'];
    for (const material of materialKeywords) {
      if (content.toLowerCase().includes(material)) {
        inferredTags.push({
          id: `inferred-material-${material}-${Date.now()}`,
          type: 'material',
          value: material,
          source: 'inferred',
          confidence: 0.8
        });
      }
    }

    // Social class inference
    const socialClassKeywords = {
      'noble': ['noble', 'lord', 'lady', 'duke', 'duchess', 'count', 'countess'],
      'peasant': ['peasant', 'serf', 'farmer', 'villager'],
      'clergy': ['priest', 'monk', 'nun', 'bishop', 'archbishop', 'abbot'],
      'merchant': ['merchant', 'trader', 'shopkeeper', 'craftsman'],
      'royal': ['king', 'queen', 'prince', 'princess', 'royal']
    };

    for (const [socialClass, keywords] of Object.entries(socialClassKeywords)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        inferredTags.push({
          id: `inferred-social-${socialClass}-${Date.now()}`,
          type: 'social_class',
          value: socialClass,
          source: 'inferred',
          confidence: 0.75
        });
      }
    }

    return inferredTags;
  }

  /**
   * Validate tag compatibility
   */
  public validateTagCompatibility(tags: NodeTag[]): { valid: boolean; conflicts: string[]; warnings: string[] } {
    const conflicts: string[] = [];
    const warnings: string[] = [];

    // Check for era conflicts
    const eraTags = tags.filter(tag => tag.type === 'era');
    if (eraTags.length > 1) {
      const eras = eraTags.map(tag => this.getEraDefinition(tag.value)).filter(Boolean) as EraTag[];
      for (let i = 0; i < eras.length; i++) {
        for (let j = i + 1; j < eras.length; j++) {
          const era1 = eras[i];
          const era2 = eras[j];
          
          // Check for temporal overlap
          const overlap = Math.min(era1.period.end, era2.period.end) - Math.max(era1.period.start, era2.period.start);
          if (overlap <= 0) {
            conflicts.push(`Era conflict: ${era1.name} and ${era2.name} do not overlap in time`);
          } else if (overlap < 100) {
            warnings.push(`Era warning: ${era1.name} and ${era2.name} have minimal temporal overlap`);
          }
        }
      }
    }

    // Check for material-era compatibility
    const materialTags = tags.filter(tag => tag.type === 'material');
    const materialEraConflicts = this.checkMaterialEraCompatibility(materialTags, eraTags);
    conflicts.push(...materialEraConflicts);

    return {
      valid: conflicts.length === 0,
      conflicts,
      warnings
    };
  }

  /**
   * Check material-era compatibility
   */
  private checkMaterialEraCompatibility(materialTags: NodeTag[], eraTags: NodeTag[]): string[] {
    const conflicts: string[] = [];
    
    const anachronisticMaterials = {
      'plastic': { availableFrom: 1900 },
      'aluminum': { availableFrom: 1850 },
      'synthetic fabric': { availableFrom: 1800 },
      'gunpowder': { availableFrom: 800 },
      'paper': { availableFrom: 100 },
      'glass': { availableFrom: -1500 }
    };

    for (const materialTag of materialTags) {
      const material = anachronisticMaterials[materialTag.value as keyof typeof anachronisticMaterials];
      if (material) {
        for (const eraTag of eraTags) {
          const era = this.getEraDefinition(eraTag.value);
          if (era && era.period.end < material.availableFrom) {
            conflicts.push(`Material "${materialTag.value}" not available during ${era.name}`);
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Get tag statistics
   */
  public getTagStatistics(): {
    totalNodes: number;
    taggedNodes: number;
    totalTags: number;
    tagsByType: Record<string, number>;
    averageTagsPerNode: number;
    topTags: { value: string; count: number }[];
  } {
    const totalNodes = this.nodeMetadata.size;
    const taggedNodes = totalNodes;
    let totalTags = 0;
    const tagsByType: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const metadata of this.nodeMetadata.values()) {
      totalTags += metadata.tags.length;
      
      for (const tag of metadata.tags) {
        tagsByType[tag.type] = (tagsByType[tag.type] || 0) + 1;
        tagCounts[tag.value] = (tagCounts[tag.value] || 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalNodes,
      taggedNodes,
      totalTags,
      tagsByType,
      averageTagsPerNode: totalNodes > 0 ? totalTags / totalNodes : 0,
      topTags
    };
  }

  /**
   * Export metadata for external use
   */
  public exportMetadata(nodeIds?: string[]): NodeMetadata[] {
    const targetIds = nodeIds || Array.from(this.nodeMetadata.keys());
    return targetIds
      .map(id => this.nodeMetadata.get(id))
      .filter(Boolean) as NodeMetadata[];
  }

  /**
   * Import metadata from external source
   */
  public importMetadata(metadataList: NodeMetadata[]): { imported: number; errors: string[] } {
    let imported = 0;
    const errors: string[] = [];

    for (const metadata of metadataList) {
      try {
        this.nodeMetadata.set(metadata.nodeId, metadata);
        imported++;
      } catch (error) {
        errors.push(`Failed to import metadata for node ${metadata.nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { imported, errors };
  }
}

// Export singleton instance
export const nodeMetadataManager = NodeMetadataManager.getInstance();