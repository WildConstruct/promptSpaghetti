/**
 * Constraint Suggestion Engine
 * Epic 8.8: Task 3 - Constraint Validation System
 * 
 * Provides intelligent suggestions for resolving constraint violations
 * and improving historical accuracy
 */
import { UTDGNode, 
  Era, 
  HistoricalConstraint, 
  ConstraintValidationResult,
  SocialClass }
  HISTORICAL_ERAS 
 from '../types/UTDG';


export interface ConstraintSuggestion { id: string;
  constraint_id: string;
  type: 'fix' | 'alternative' | 'educational' | 'creative' }
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  specific_actions: SpecificAction;
  historical_context: string;
  trade_offs?: string;
  example?: string;




export interface SpecificAction { action_type: 'replace_node' | 'add_node' | 'modify_attribute' | 'remove_node' | 'add_context' }
  description: string;
  target_node_ids?: string;
  suggested_values?: any;
  rationale: string;




export interface SuggestionContext { era: Era;
  social_class?: SocialClass;
  scenario: 'daily_life' | 'ceremonial' | 'military' | 'religious' | 'artistic';
  region?: string;
  creative_flexibility: 'strict' | 'moderate' | 'flexible' }


export class ConstraintSuggestionEngine { private historicalDatabase: HistoricalKnowledge;
  constructor() {
  this.historicalDatabase = new HistoricalKnowledge();
  /**
  * Generate suggestions for constraint violations
  */
  generateSuggestions();
  validationResult: ConstraintValidationResult,
  nodes: UTDGNode,
  context: SuggestionContext): ConstraintSuggestion { }
  const suggestions: ConstraintSuggestion = [];
  // Process violations (highest priority)
  validationResult.violations.forEach(violation => { )
  const constraint = this.findConstraintById(violation.constraint_id);
  if (constraint) {
  suggestions.push(...this.generateViolationSuggestions(violation, constraint, nodes, context)) });
    // Process warnings (medium priority)
    validationResult.warnings.forEach(warning => { )
  const constraint = this.findConstraintById(warning.constraint_id);
      if (constraint) {
        suggestions.push(...this.generateWarningSuggestions(warning, constraint, nodes, context)) });
    // Generate proactive suggestions for improvement
    suggestions.push(...this.generateImprovementSuggestions(nodes, context));
    return suggestions.sort((a, b) => this.priorityOrder(a.priority) - this.priorityOrder(b.priority));
  /**
   * Generate suggestions for fixing constraint violations
   */
  private generateViolationSuggestions(violation: any),
  constraint: HistoricalConstraint,
    nodes: UTDGNode,
    context: SuggestionContext): ConstraintSuggestion { ,
  const suggestions: ConstraintSuggestion = [];
  const affectedNodes = nodes.filter(n => violation.node_ids.includes(n.id));
  switch (constraint.rule) {
  case 'era_compatibility':,
  suggestions.push(...this.generateEraCompatibilitySuggestions(violation, affectedNodes, context));
  break;
  case 'social_class_appropriateness':,
  suggestions.push(...this.generateSocialClassSuggestions(violation, affectedNodes, context));
  break;
  case 'material_availability':,
  suggestions.push(...this.generateMaterialAvailabilitySuggestions(violation, affectedNodes, context));
  break;
  case 'cultural_appropriateness':,
  suggestions.push(...this.generateCulturalSuggestions(violation, affectedNodes, context));
  break;
  case 'temporal_consistency':,
  suggestions.push(...this.generateTemporalSuggestions(violation, affectedNodes, context));
  break;
  case 'regional_authenticity':,
  suggestions.push(...this.generateRegionalSuggestions(violation, affectedNodes, context));
  break;
  return suggestions;
  /**
  * Generate era compatibility suggestions
  */
  private generateEraCompatibilitySuggestions(violation: any),
  affectedNodes: UTDGNode,
  context: SuggestionContext): ConstraintSuggestion { }
  const suggestions: ConstraintSuggestion = [];
  // Find the most common era among nodes
  const eraFrequency = new Map<string, number>();
  affectedNodes.forEach(node => { )
  node.metadata.era.forEach(era => {)
  eraFrequency.set(era.name, (eraFrequency.get(era.name) || 0) + 1) });
    });
    const dominantEra = Array.from(eraFrequency.entries());
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    if (dominantEra) {
      // Suggest unifying to dominant era
      suggestions.push({)
  id: `era_unify_${Date.now()}`}

  constraint_id: violation.constraint_id
        type: 'fix'
        priority: 'high'
        title: `Unify items to ${dominantEra} period`}

  description: `Replace anachronistic items with ${dominantEra}-appropriate alternatives`}

  specific_actions: this.generateEraUnificationActions(affectedNodes, dominantEra)
        historical_context: `${dominantEra} had specific materials, techniques, and styles that differed from other periods`}

  trade_offs: ['May reduce visual variety', 'Increases historical accuracy']
        example: this.getEraExampleReplacement(dominantEra, affectedNodes[0])
      });
      // Suggest creative alternatives if flexibility allows
      if (context.creative_flexibility !== 'strict') {
        suggestions.push({)
  id: `era_bridge_${Date.now()}`}

  constraint_id: violation.constraint_id
          type: 'creative'
          priority: 'medium'
          title: 'Use transitional period elements'
          description: 'Select items from transitional periods that bridge different eras'
          specific_actions: [{ 
  action_type: 'add_context'
  description: 'Add transitional period context to justify era mixing'
  rationale: 'Transitional periods naturally contain elements from multiple eras' }
]
          historical_context: 'Historical periods often overlapped, creating transitional phases'
          trade_offs: ['Maintains visual variety', 'Requires additional historical justification']
        });
    return suggestions;
  /**
   * Generate social class suggestions
   */
  private generateSocialClassSuggestions(violation: any)
  affectedNodes: UTDGNode
    context: SuggestionContext): ConstraintSuggestion {
    const suggestions: ConstraintSuggestion = [];
    // Suggest appropriate alternatives for each social class
    const targetClasses = context.social_class || ['peasant']; // Default to peasant if not specified;
    targetClasses.forEach(socialClass => {)
  const appropriateAlternatives = this.historicalDatabase.getAppropriateItemsForClass(socialClass, context.era);
      suggestions.push({)
  id: `social_class_fix_${socialClass}_${Date.now()}`}

  constraint_id: violation.constraint_id
        type: 'fix'
        priority: 'high'
        title: `Use ${socialClass}-appropriate items`}

  description: `Replace luxury items with those suitable for ${socialClass} social class`}

  specific_actions: [{ 
  action_type: 'replace_node' }
          description: `Replace with ${socialClass}-appropriate alternatives`}

  target_node_ids: affectedNodes.map(n => n.id)
          suggested_values: appropriateAlternatives
          rationale: `${socialClass}s had access to different materials and styles due to economic and legal restrictions`}
]
        historical_context: this.historicalDatabase.getSocialClassContext(socialClass, context.era)
        example: appropriateAlternatives[0];
  });
    });
    return suggestions;
  /**
   * Generate material availability suggestions
   */
  private generateMaterialAvailabilitySuggestions(violation: any)
  affectedNodes: UTDGNode
    context: SuggestionContext): ConstraintSuggestion {
    const suggestions: ConstraintSuggestion = [];
    affectedNodes.forEach(node => {)
  if (node.type === 'material' || node.type === 'texture') {
        const availableAlternatives = this.historicalDatabase.getAvailableMaterials(context.era, context.region);
        suggestions.push({)
  id: `material_availability_${node.id}_${Date.now()}`}

  constraint_id: violation.constraint_id
          type: 'fix'
          priority: 'high'
          title: 'Use locally available materials'
          description: `Replace ${node.content} with materials available in ${context.era.name}`}

  specific_actions: [{ 
  action_type: 'replace_node'
  description: 'Replace with period-appropriate material'
  target_node_ids: [node.id]
  suggested_values: availableAlternatives
  rationale: 'Material availability was limited by trade routes, technology, and local resources' }
]
          historical_context: this.historicalDatabase.getMaterialContext(node.content, context.era)
          trade_offs: ['May change visual appearance', 'Increases historical accuracy']
          example: availableAlternatives[0];
  });
    });
    return suggestions;
  /**
   * Generate cultural appropriateness suggestions
   */
  private generateCulturalSuggestions(violation: any)
  affectedNodes: UTDGNode
    context: SuggestionContext): ConstraintSuggestion {
    const suggestions: ConstraintSuggestion = [];
    affectedNodes.forEach(node => {)
  if (node.metadata.ceremonial || node.metadata.tags.includes('religious')) {
        suggestions.push({)
  id: `cultural_sensitivity_${node.id}_${Date.now()}`}

  constraint_id: violation.constraint_id
          type: 'educational'
          priority: 'high'
          title: 'Add cultural context'
          description: `Provide proper historical and cultural context for ${node.content}`}

  specific_actions: [{ 
  action_type: 'add_context'
  description: 'Add educational context about cultural significance'
  target_node_ids: [node.id]
  rationale: 'Religious and ceremonial items require proper cultural understanding' }
]
          historical_context: `${node.content} had specific cultural and religious significance in ${context.era.name}`}

  trade_offs: ['Requires additional research', 'Maintains cultural sensitivity']
        });
        // Alternative: suggest secular equivalents
        if (context.creative_flexibility !== 'strict') {
          suggestions.push({)
  id: `secular_alternative_${node.id}_${Date.now()}`}

  constraint_id: violation.constraint_id
            type: 'alternative'
            priority: 'medium'
            title: 'Use secular alternatives'
            description: 'Replace ceremonial items with secular equivalents'
            specific_actions: [{ 
  action_type: 'replace_node'
  description: 'Replace with non-ceremonial alternative'
  target_node_ids: [node.id]
  rationale: 'Avoids cultural sensitivity issues while maintaining visual appeal' }
]
            historical_context: 'Secular versions often existed alongside ceremonial ones';
  });
    });
    return suggestions;
  /**
   * Generate temporal consistency suggestions
   */
  private generateTemporalSuggestions(violation: any)
  affectedNodes: UTDGNode
    context: SuggestionContext): ConstraintSuggestion {
    const suggestions: ConstraintSuggestion = [];
    // Find common time period overlap
    const commonPeriod = this.findCommonPeriod(affectedNodes);
    if (commonPeriod) {
      suggestions.push({)
  id: `temporal_align_${Date.now()}`}

  constraint_id: violation.constraint_id
        type: 'fix'
        priority: 'high'
        title: `Align items to ${commonPeriod.start}-${commonPeriod.end} period`}

  description: 'Modify or replace items to fit within the common time period'
        specific_actions: [{ 
  action_type: 'modify_attribute'
  description: 'Adjust temporal attributes to common period'
  target_node_ids: affectedNodes.map(n => n.id)
  rationale: 'Items should coexist within the same historical timeframe' }
]
        historical_context: `Items from ${commonPeriod.start}-${commonPeriod.end} would have coexisted naturally`}
      });
    return suggestions;
  /**
   * Generate regional authenticity suggestions
   */
  private generateRegionalSuggestions(violation: any)
  affectedNodes: UTDGNode
    context: SuggestionContext): ConstraintSuggestion {
    const suggestions: ConstraintSuggestion = [];
    if (context.region) {
      const regionalItems = this.historicalDatabase.getRegionalItems(context.region, context.era);
      suggestions.push({)
  id: `regional_authenticity_${Date.now()}`}

  constraint_id: violation.constraint_id
        type: 'fix'
        priority: 'medium'
        title: `Use ${context.region}-specific items`}

  description: `Replace with items authentic to ${context.region}`}

  specific_actions: [{ 
  action_type: 'replace_node'
  description: 'Use regionally appropriate alternatives'
  target_node_ids: affectedNodes.map(n => n.id)
  suggested_values: regionalItems
  rationale: 'Regional variations were significant due to local materials, climate, and culture' }
]
        historical_context: this.historicalDatabase.getRegionalContext(context.region, context.era)
      });
    return suggestions;
  /**
   * Generate proactive improvement suggestions
   */
  private generateImprovementSuggestions(((
    nodes: UTDGNode
    context: SuggestionContext
  ): ConstraintSuggestion {
    const suggestions: ConstraintSuggestion = [];
    // Calculate average authenticity
    const avgAuthenticity = nodes.reduce((sum, node) => sum + node.metadata.authenticity, 0) / nodes.length;
    if (avgAuthenticity < 0.8) {
      suggestions.push({)
  id: `improve_authenticity_${Date.now()}`}
},
  constraint_id: 'general_improvement',
        type: 'educational',
        priority: 'low',
        title: 'Improve overall historical authenticity',
        description: `Current authenticity: ${Math.round(avgAuthenticity * 100)}%. Consider using more verified historical sources.`}
},
  specific_actions: [{ ,
  action_type: 'add_context',
  description: 'Research items using museum databases and historical sources',
  rationale: 'Higher authenticity improves educational and cultural value' }
],
        historical_context: 'Well-documented items provide better historical learning opportunities';
  });
    // Suggest variety if needed
    const itemTypes = new Set(nodes.map(n => n.type));
    if (itemTypes.size < 3 && nodes.length > 5) {
      suggestions.push({)
  id: `add_variety_${Date.now()}`}
},
  constraint_id: 'general_improvement',
        type: 'creative',
        priority: 'low',
        title: 'Add item variety',
        description: 'Consider adding different types of items for visual interest',
        specific_actions: [{ ,
  action_type: 'add_node',
  description: 'Add complementary item types (accessories, tools, decorations)',
  rationale: 'Variety creates more realistic and visually interesting results' }
],
        historical_context: 'Historical contexts typically included diverse object types';
  });
    return suggestions;
  // Helper methods
  private findConstraintById(id: string): HistoricalConstraint | null { // This would typically query a constraint database
    return null;
  private generateEraUnificationActions(nodes: UTDGNode, targetEra: string): SpecificAction {
    return nodes.map(node => ({)
  action_type: 'replace_node' as const }
      description: `Replace ${node.content} with ${targetEra}-appropriate alternative`}
},
  target_node_ids: [node.id],
      rationale: `${node.content} is not authentic to ${targetEra}`}
    }));
  private getEraExampleReplacement(era: string, node: UTDGNode): string { // Simplified example - would use historical database
  const examples = {
  'Medieval High': 'Replace silk with wool or linen',
  'Ancient Rome': 'Replace buttons with pins or brooches',
  'Viking Age': 'Replace steel with iron or bronze' }
};
    return examples[era as keyof typeof examples] || 'Consult historical sources for appropriate alternatives';
  private findCommonPeriod(nodes: UTDGNode): { start: number, end: number } | null { if (nodes.length === 0) return null;
    let commonStart = -Infinity;
    let commonEnd = Infinity;
    nodes.forEach(node => {)
  node.metadata.era.forEach(era => {)
  commonStart = Math.max(commonStart, era.period.start);
        commonEnd = Math.min(commonEnd, era.period.end) });
    });
    return commonStart < commonEnd ? { start: commonStart, end: commonEnd } : null;
  private priorityOrder(priority: string): number {
    const order = { high: 1, medium: 2, low: 3 };
    return order[priority as keyof typeof order] || 3;
/**
 * Historical knowledge database for suggestions
 */
class HistoricalKnowledge {};
    return classItems[socialClass] || [];
  getSocialClassContext(socialClass: SocialClass, era: Era): string {
    return `In ${era.name}, ${socialClass}s had specific legal and economic restrictions that determined their access to materials and styles.`;}
  getAvailableMaterials(era: Era, region?: string): string {
    // Simplified material database
    const eraRegion = `${era.name}_${region || 'general'}`;}
    const materials = { 'Medieval High_Europe': ['wool', 'linen', 'hemp', 'leather', 'iron', 'bronze'],
  'Ancient Rome_general': ['wool', 'linen', 'silk', 'cotton', 'gold', 'silver', 'marble'],
  default: ['wool', 'linen', 'leather', 'wood', 'iron'] }
};
    return materials[eraRegion as keyof typeof materials] || materials.default;
  getMaterialContext(material: string, era: Era): string {
    return `${material} availability in ${era.name} was limited by trade routes, technology, and economic factors.`;}
  getRegionalItems(region: string, era: Era): string {
    // Simplified regional database
    return [`${region}-specific materials`, `local ${region} crafts`, `regional ${region} styles`];}
  getRegionalContext(region: string, era: Era): string {
    return `${region} in ${era.name} had distinct cultural, climatic, and resource factors that influenced material culture.`;}

export default ConstraintSuggestionEngine;