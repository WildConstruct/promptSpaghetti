/**
 * UTDG (Universal Texture Description Graph) Manager
 * Epic 8.8: Historical Data Integration Foundation
 * 
 * Central management system for UTDG data and historical content generation
 */
import {
  UTDGNode,
  UTDGGraph,
  Era,
  HistoricalQuery,
  HistoricalQueryResult,
  ContentGenerationConfig,
  GeneratedContent,
  VFXExportData,
  ValidationReport,
  ConstraintValidationResult,
  HISTORICAL_ERAS
} from '../types/UTDG';
import ConstraintValidator from './ConstraintValidator';
import ExternalDataService from './ExternalDataService';
import MedievalDemoDatabase, { MEDIEVAL_DEMO_CONSTRAINTS } from './MedievalDemo';
/**
 * UTDG Manager - Central orchestrator for historical data integration
 */
export class UTDGManager {
  private static instance: UTDGManager;
  private constraintValidator: ConstraintValidator;
  private externalDataService: ExternalDataService;
  private medievalDemo: MedievalDemoDatabase;
  private nodeRegistry: Map<string, UTDGNode> = new Map();
  constructor() {
  this.constraintValidator = new ConstraintValidator(MEDIEVAL_DEMO_CONSTRAINTS);
  this.externalDataService = new ExternalDataService();
  this.medievalDemo = MedievalDemoDatabase.getInstance();
  }

  static getInstance(): UTDGManager {
  if (!UTDGManager.instance) {
  UTDGManager.instance = new UTDGManager();
  }
  return UTDGManager.instance;
  }

  /**
  * Query historical content from all available sources
  */
  async queryHistoricalContent(query: HistoricalQuery): Promise<HistoricalQueryResult> {
  // Try external sources first
  try {
  const externalResults = await this.externalDataService.queryHistoricalData(query);
  // If we get good results from external sources, return them
  if (externalResults.nodes.length > 0) {
  return externalResults;
  }
} catch (error) {
  console.warn('External data query failed, falling back to local demo:', error);
  // Fallback to medieval demo database
  return this.queryMedievalDemo(query);
  }
  }

  /**
  * Generate historically accurate content for a specific scenario
  */
  async generateHistoricalContent(config: ContentGenerationConfig): Promise<GeneratedContent> {
  const startTime = performance.now();
  // Build query from configuration
  const query: HistoricalQuery = {
  era: config.era.name,
  region: config.region,
  category: this.getRelevantNodeTypes(config.scenario),
  social_class: config.social_class,
  filters: {
  scenario: config.scenario,
  gender: config.gender,
  age_groups: config.age_groups,
  required_elements: config.required_elements,
  forbidden_elements: config.forbidden_elements,
},
  limit: 20,
      min_authenticity: config.historical_accuracy === 'strict' ? 0.8 :
        config.historical_accuracy === 'moderate' ? 0.6 : 0.4
  };
    // Query for relevant content
    const queryResult = await this.queryHistoricalContent(query);
    let candidateNodes = queryResult.nodes;
    // Apply configuration-specific filtering
    candidateNodes = this.filterByConfiguration(candidateNodes, config);
    // Apply creativity and variation
    const selectedNodes = this.applyCreativityFilter(candidateNodes, config);
    // Validate historical constraints
    const constraintValidation = this.constraintValidator.validateForEra(selectedNodes, config.era);
    const appliedConstraints = this.getAppliedConstraints(selectedNodes, config.era);
    // Calculate scores
    const accuracyScore = this.calculateAccuracyScore(selectedNodes, constraintValidation);
    const creativityScore = config.creativity_factor;
    return {
  nodes: selectedNodes,
  constraints_applied: appliedConstraints,
  generation_metadata: {
    config,
    generation_time: performance.now() - startTime,
    accuracy_score: accuracyScore,
    creativity_score: creativityScore,
    historical_basis: selectedNodes.map(node => node.external_source?.url || node.metadata.source).filter(Boolean),
  }
};
}

  /**
   * Generate medieval demo content specifically
   */
  generateMedievalDemo(scenario: 'court_scene' | 'village_life' | 'monastery' | 'market_day'): GeneratedContent {
  let config: ContentGenerationConfig;
  switch (scenario) {
  case 'court_scene':
      config = {
  era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
  region: 'France',
  social_class: 'noble',
  scenario: 'ceremonial',
  gender: 'mixed',
  age_groups: ['adult'],
  variation_level: 'high',
  historical_accuracy: 'strict',
  creativity_factor: 0.7,
  prefer_common_items: false,
};
      break;
    case 'village_life':
      config = {
  era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
  region: 'England',
  social_class: 'peasant',
  scenario: 'daily_life',
  gender: 'mixed',
  age_groups: ['adult', 'child'],
  variation_level: 'medium',
  historical_accuracy: 'moderate',
  creativity_factor: 0.5,
  prefer_common_items: true,
};
      break;
    case 'monastery':
      config = {
  era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
  social_class: 'clergy',
  scenario: 'religious',
  gender: 'male',
  age_groups: ['adult'],
  variation_level: 'low',
  historical_accuracy: 'strict',
  creativity_factor: 0.3,
  prefer_common_items: true,
};
      break;
    case 'market_day':
      config = {
  era: HISTORICAL_ERAS.MEDIEVAL_HIGH,
  social_class: 'artisan',
  scenario: 'daily_life',
  gender: 'mixed',
  age_groups: ['adult'],
  variation_level: 'high',
  historical_accuracy: 'moderate',
  creativity_factor: 0.6,
  prefer_common_items: true,
};
      break;
    default:
      throw new Error(`Unknown medieval scenario: ${scenario}`);
    }
    return this.generateHistoricalContentSync(config);
  }

  /**
   * Export UTDG data for Wild Construct VFX pipeline
   */
  exportForVFX(nodes: UTDGNode[], era: Era, scene_description: string): VFXExportData {
  // Generate material descriptions for VFX
  const materials = nodes
    .filter(node => node.type === 'material' || node.type === 'texture')
    .map(node => ({
      name: node.content.split(' ')[0], // First word as material name
  properties: this.extractMaterialProperties(node),
  historical_basis: node.external_source?.url || node.metadata.source,
  authenticity_level: node.metadata.authenticity,
}));
    // Generate texture descriptions
    const textures = nodes
      .filter(node => node.type === 'pattern' || node.type === 'texture')
      .map(node => ({
        name: node.content,
  pattern: this.extractPatternDescription(node),
  color_palette: this.extractColorPalette(node),
  historical_source: node.metadata.source,
}));
    // Generate crowd control data
    const crowdControlData = {
  character_types: this.extractCharacterTypes(nodes),
  clothing_combinations: this.generateClothingCombinations(nodes),
  social_stratification: this.calculateSocialDistribution(nodes),
};
    // Generate backdrop data
    const backdropData = {
  architectural_style: this.determineArchitecturalStyle(era),
  materials: materials.map(m => m.name),
  atmospheric_conditions: this.getAtmosphericConditions(era),
};
    // Generate atmospheric data
    const meteorData = {
  weather_patterns: this.getWeatherPatterns(era),
  seasonal_conditions: this.getSeasonalConditions(era),
  time_of_day_preferences: this.getTimePreferences(era),
};
    return {
  scene_description,
  historical_context: era,
  accuracy_notes: this.generateAccuracyNotes(nodes),
  materials,
  textures,
  lighting_notes: this.generateLightingNotes(era),
  atmospheric_notes: this.generateAtmosphericNotes(era),
  crowd_control_data: crowdControlData,
  backdrop_data: backdropData,
  meteor_data: meteorData,
    };
  }

  /**
   * Validate UTDG data quality and historical accuracy
   */
  validateUTDGData(nodes: UTDGNode[]): ValidationReport {
  const issues: any = [];
  let completenessScore = 0;
  let consistencyScore = 0;
  let accuracyScore = 0;
  let reliabilityScore = 0;
  let freshnessScore = 0;
  // Check completeness
  const totalFields = nodes.length * 10; // Assume 10 required fields per node
  let filledFields = 0;
  for (const node of nodes) {
    if (node.id) filledFields++;
    if (node.type) filledFields++;
    if (node.content) filledFields++;
    if (node.metadata?.era?.length > 0) filledFields++;
    if (node.metadata?.authenticity !== undefined) filledFields++;
    if (node.metadata?.source) filledFields++;
    if (node.metadata?.tags?.length > 0) filledFields++;
    if (node.relationships) filledFields++;
    if (node.constraints) filledFields++;
    if (node.external_source) filledFields++;
  }
  completenessScore = filledFields / totalFields;
  // Check consistency
  const constraintResult = this.constraintValidator.validateNodes(nodes);
  consistencyScore = constraintResult.valid ? 1.0 : Math.max(
    0,
    1 - constraintResult.violations.length / nodes.length
  );
  // Check historical accuracy
  accuracyScore = nodes.reduce((sum, node) => sum + node.metadata.authenticity, 0) / nodes.length;
  // Check source reliability
  const sourcedNodes = nodes.filter(node => node.external_source);
  reliabilityScore = sourcedNodes.length / nodes.length;
  // Check freshness (simplified)
  freshnessScore = 0.8; // Assume reasonably fresh for demo
  const overallScore = (completenessScore + consistencyScore + accuracyScore + reliabilityScore + freshnessScore) / 5;
    return {
      overall_score: overallScore,
      metrics: {
        completeness: completenessScore,
        consistency: consistencyScore,
        historical_accuracy: accuracyScore,
        source_reliability: reliabilityScore,
        freshness: freshnessScore,
      },
      issues,
      recommendations: this.generateRecommendations(overallScore, {
        completeness: completenessScore,
        consistency: consistencyScore,
        historical_accuracy: accuracyScore,
        source_reliability: reliabilityScore,
        freshness: freshnessScore,
      }),
      last_validated: new Date().toISOString()
    };
  }
  /**
   * Register external data sources
   */
  registerExternalSource(source: any): void {
    this.externalDataService.registerDataSource(source);
  }
  /**
  * Get constraint validator for custom validation
  */
  getConstraintValidator(): ConstraintValidator {
    return this.constraintValidator;
  }
  /**
  * Get external data service for custom queries
  */
  getExternalDataService(): ExternalDataService {
    return this.externalDataService;
  }
  /**
  * Query medieval demo database directly
  */
  private queryMedievalDemo(query: HistoricalQuery): HistoricalQueryResult {
    const startTime = performance.now();
    let results: UTDGNode[] = [];
    
    // Convert query to demo criteria
    const era = Array.isArray(query.era) ? 
      HISTORICAL_ERAS[query.era[0].toUpperCase()] || HISTORICAL_ERAS.MEDIEVAL_HIGH :
      HISTORICAL_ERAS.MEDIEVAL_HIGH;
  HISTORICAL_ERAS[query.era.toUpperCase()] || HISTORICAL_ERAS.MEDIEVAL_HIGH;
    // Query clothing
    if (!query.category || query.category.includes('garment')) {
      const clothing = this.medievalDemo.getClothing({
        era,
        social_class: query.social_class,
        gender: query.filters?.gender,
      });
      results.push(...clothing);
    }
    
    // Query materials
    if (!query.category || query.category.includes('material')) {
      const materials = this.medievalDemo.getMaterials({ era });
      results.push(...materials);
    }
    
    // Query accessories
    if (!query.category || query.category.includes('accessory')) {
  const accessories = this.medievalDemo.getAccessories({
        era,
        social_class: query.social_class,
      });
      results.push(...accessories);
    }
    
    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }
    
    return {
      nodes: results,
      total_count: results.length,
      query_metadata: {
        query_time: performance.now() - startTime,
        cache_hit: false,
        sources_used: ['medieval_demo'],
      }
    };
  }
  /**
   * Synchronous content generation for demo scenarios
   */
  private generateHistoricalContentSync(config: ContentGenerationConfig): GeneratedContent {
  const startTime = performance.now();
  // Use medieval demo for synchronous generation
  let nodes: UTDGNode[] = [];
  if (config.scenario === 'ceremonial' && config.social_class === 'noble') {
    const outfit = this.medievalDemo.generateOutfit({
      era: config.era,
      social_class: config.social_class,
      gender: config.gender || 'female',
      occasion: 'ceremonial',
    });
      nodes = outfit.outfit;
    } else {
      // Generate based on configuration
      const query: HistoricalQuery = {
        era: config.era.name,
        social_class: config.social_class,
        category: 'garment',
        filters: config,
        limit: 5,
      };
      const queryResult = this.queryMedievalDemo(query);
      nodes = queryResult.nodes;
    }
    const constraintValidation = this.constraintValidator.validateForEra(nodes, config.era);
    const appliedConstraints = this.getAppliedConstraints(nodes, config.era);
    const accuracyScore = this.calculateAccuracyScore(nodes, constraintValidation);
    return {
      nodes,
      constraints_applied: appliedConstraints,
      generation_metadata: {
        config,
        generation_time: performance.now() - startTime,
        accuracy_score: accuracyScore,
        creativity_score: config.creativity_factor,
        historical_basis: nodes.map(node => node.metadata.source),
      }
    };
  }
  
  // Helper methods for content generation and validation
  private getRelevantNodeTypes(scenario: string): any {
    switch (scenario) {
      case 'daily_life': return ['garment', 'accessory', 'tool'];
      case 'ceremonial': return ['garment', 'decoration', 'accessory'];
      case 'military': return ['garment', 'accessory', 'tool'];
      case 'religious': return ['garment', 'decoration'];
      case 'artistic': return ['decoration', 'pattern', 'texture'];
      default: return ['garment', 'material', 'accessory'];
    }
  }
  
  private filterByConfiguration(nodes: UTDGNode[], config: ContentGenerationConfig): UTDGNode[] {
    return nodes.filter(node => {
      if (config.required_elements) {
        const hasRequired = config.required_elements.some(element =>
          node.content.toLowerCase().includes(element.toLowerCase()) ||
          node.metadata.tags.some(tag => tag.toLowerCase().includes(element.toLowerCase()))
        );
        if (!hasRequired) return false;
      }
      if (config.forbidden_elements) {
        const hasForbidden = config.forbidden_elements.some(element =>
          node.content.toLowerCase().includes(element.toLowerCase()) ||
          node.metadata.tags.some(tag => tag.toLowerCase().includes(element.toLowerCase()))
        );
        if (hasForbidden) return false;
      }
      return true;
    });
  }
  
  private applyCreativityFilter(nodes: UTDGNode[], config: ContentGenerationConfig): UTDGNode[] {
    const targetCount = Math.min(nodes.length, 10);
    if (config.creativity_factor < 0.3) {
      // Low creativity - prefer most authentic items
      return nodes
        .sort((a, b) => b.metadata.authenticity - a.metadata.authenticity)
        .slice(0, targetCount);
    } else if (config.creativity_factor > 0.7) {
      // High creativity - include more variation
      const shuffled = nodes.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, targetCount);
    } else {
      // Medium creativity - balanced selection
      return nodes
        .sort((a, b) => {
          const scoreA = a.metadata.authenticity + Math.random() * 0.3;
          const scoreB = b.metadata.authenticity + Math.random() * 0.3;
          return scoreB - scoreA;
        })
        .slice(0, targetCount);
    }
  }
  private getAppliedConstraints(nodes: UTDGNode, era: Era): any {
    const result = this.constraintValidator.validateForEra(nodes, era);
    return [
      ...result.violations.map(v => ({ type: 'violation', ...v })),
      ...result.warnings.map(w => ({ type: 'warning', ...w })),
      ...result.suggestions.map(s => ({ type: 'suggestion', ...s }))
    ];
  }
  
  private calculateAccuracyScore(nodes: UTDGNode[], validation: ConstraintValidationResult): number {
  if (nodes.length === 0) return 0;
  const baseScore = nodes.reduce((sum, node) => sum + node.metadata.authenticity, 0) / nodes.length;
  const penaltyFactor = Math.max(0, 1 - (validation.violations.length * 0.1));
    return baseScore * penaltyFactor;
  }
  
  private generateRecommendations(overallScore: number, metrics: any): string[] {
    const recommendations: string[] = [];
    
    if (metrics.completeness < 0.7) {
      recommendations.push('Improve data completeness by filling missing required fields');
    }
    if (metrics.consistency < 0.7) {
      recommendations.push('Address constraint violations to improve data consistency');
    }
    if (metrics.historical_accuracy < 0.7) {
      recommendations.push('Verify historical accuracy with authoritative sources');
    }
    if (metrics.source_reliability < 0.5) {
      recommendations.push('Add external source validation for more nodes');
    }
    
    if (overallScore > 0.8) {
      recommendations.push('Data quality is excellent - ready for production use');
    } else if (overallScore > 0.6) {
      recommendations.push('Data quality is good - minor improvements recommended');
    } else {
      recommendations.push('Data quality needs significant improvement before production use');
    }
    
    return recommendations;
  }
  
  // VFX Export helper methods
  private extractMaterialProperties(node: UTDGNode): Record<string, any> {
    return {
      type: node.type,
      authenticity: node.metadata.authenticity,
      era: node.metadata.era[0]?.name || 'unknown',
      social_class: node.metadata.social_class,
      tags: node.metadata.tags,
    };
  }
  private extractPatternDescription(node: UTDGNode): string {
    return node.content.split('.')[0] || node.content;
  }
  
  private extractColorPalette(node: UTDGNode): string[] {
    // Extract colors mentioned in content and tags
    const colors: string[] = [];
    const colorWords = ['red', 'blue', 'green', 'yellow', 'brown', 'black', 'white', 'gray', 'purple'];
    const text = node.content.toLowerCase() + ' ' + node.metadata.tags.join(' ').toLowerCase();
    
    colorWords.forEach(color => {
      if (text.includes(color)) {
        colors.push(color);
      }
    });
    
    return colors.length > 0 ? colors : ['natural'];
  }
  private extractCharacterTypes(nodes: UTDGNode[]): string[] {
    const types = new Set<string>();
    nodes.forEach(node => {
      if (node.metadata.social_class) {
        node.metadata.social_class.forEach(cls => types.add(cls));
      }
      if (node.metadata.occupation) {
        node.metadata.occupation.forEach(occ => types.add(occ));
      }
    });
    return Array.from(types);
  }
  private generateClothingCombinations(nodes: UTDGNode[]): string[][] {
    const combinations: string[][] = [];
    const garments = nodes.filter(node => node.type === 'garment');
    if (garments.length >= 2) {
      for (let i = 0; i < garments.length - 1; i++) {
        combinations.push([garments[i].id, garments[i + 1].id]);
      }
    }
    return combinations;
  }
  private calculateSocialDistribution(nodes: UTDGNode[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    let total = 0;
    
    nodes.forEach(node => {
      if (node.metadata.social_class) {
        node.metadata.social_class.forEach(cls => {
          distribution[cls] = (distribution[cls] || 0) + 1;
          total++;
        });
      }
    });
    
    // Convert to percentages
    Object.keys(distribution).forEach(key => {
      distribution[key] = distribution[key] / total;
    });
    
    return distribution;
  }
  private determineArchitecturalStyle(era: Era): string {
    if (era.name.includes('Medieval')) {
      return 'Gothic';
    } else if (era.name.includes('Roman')) {
      return 'Classical Roman';
    } else if (era.name.includes('Renaissance')) {
      return 'Renaissance';
    }
    return 'Period Appropriate';
  }
  private getAtmosphericConditions(era: Era): string[] {
    return ['torchlight', 'candlelight', 'natural daylight', 'fireplace glow'];
  }
  
  private getWeatherPatterns(era: Era): string[] {
    return ['clear', 'overcast', 'light rain', 'mist'];
  }
  
  private getSeasonalConditions(era: Era): string[] {
    return ['spring mild', 'summer warm', 'autumn cool', 'winter cold'];
  }
  
  private getTimePreferences(era: Era): string[] {
    return ['dawn', 'midday', 'afternoon', 'dusk'];
  }
  private generateAccuracyNotes(nodes: UTDGNode[]): string[] {
    const notes: string[] = [];
    const avgAuthenticity = nodes.reduce((sum, node) => sum + node.metadata.authenticity, 0) / nodes.length;
    notes.push(`Average historical authenticity: ${(avgAuthenticity * 100).toFixed(0)}%`);
    
    const sourcedNodes = nodes.filter(node => node.external_source);
    if (sourcedNodes.length > 0) {
      notes.push(`${sourcedNodes.length} items verified with external sources`);
    }
    
    const highAuthNodes = nodes.filter(node => node.metadata.authenticity > 0.8);
    notes.push(`${highAuthNodes.length} items with high authenticity rating`);
    
    return notes;
  }
  
  private generateLightingNotes(era: Era): string[] {
    return [
      'Use warm, low-intensity lighting to match period sources',
      'Avoid electric lighting effects',
      'Consider seasonal and time-of-day appropriate lighting'
    ];
  }
  
  private generateAtmosphericNotes(era: Era): string[] {
    return [
      'Maintain period-appropriate atmospheric density',
      'Consider smoke from hearths and candles',
      'Account for seasonal weather patterns'
    ];
  }
}

export default UTDGManager;