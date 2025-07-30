/**
 * Historical Constraint Validation System
 * Epic 8.8: Historical Data Integration Foundation
 * 
 * Provides constraint validation for historically accurate content generation
 */
import {
  UTDGNode,
  Era,
  HistoricalConstraint,
  ConstraintValidationResult,
  ConstraintViolation,
  ConstraintWarning,
  ConstraintSuggestion,
  SocialClass,
  HISTORICAL_ERAS
} from '../types/UTDG';

export class ConstraintValidator {
  private constraints: HistoricalConstraint = [];
  private enabledEnforcement: ('strict' | 'warning' | 'suggestion')[] = ['strict', 'warning', 'suggestion'];
  constructor(constraints: HistoricalConstraint = []) {
  this.constraints = [...constraints, ...this.getDefaultConstraints()];
  }

  /**
  * Add a new constraint to the validator
  */
  addConstraint(constraint: HistoricalConstraint): void {
  this.constraints.push(constraint);
  }

  /**
  * Remove a constraint by ID
  */
  removeConstraint(constraintId: string): void {
  this.constraints = this.constraints.filter(c => c.id !== constraintId);
  }

  /**
  * Configure which enforcement levels are active
  */
  setEnforcement(levels: ('strict' | 'warning' | 'suggestion')[]): void {
  this.enabledEnforcement = levels;
  }

  /**
  * Validate a set of UTDG nodes against historical constraints
  */
  validateNodes(nodes: UTDGNode[]): ConstraintValidationResult {
    const violations: ConstraintViolation[] = [];
    const warnings: ConstraintWarning[] = [];
    const suggestions: ConstraintSuggestion[] = [];
    
    // Check each constraint against the node set
    for (const constraint of this.constraints) {
      if (!this.enabledEnforcement.includes(constraint.enforcement)) {
        continue;
      }
      
      const result = this.evaluateConstraint(constraint, nodes);
      if (result) {
        switch (constraint.enforcement) {
          case 'strict':
            violations.push(result as ConstraintViolation);
            break;
          case 'warning':
            warnings.push(result as ConstraintWarning);
            break;
          case 'suggestion':
            suggestions.push(result as ConstraintSuggestion);
            break;
        }
      }
    }
    
    return {
      valid: violations.length === 0,
      violations,
      warnings,
      suggestions
    };
  }

  /**
   * Validate nodes for a specific era
   */
  validateForEra(nodes: UTDGNode[], era: Era): ConstraintValidationResult {
    // Filter constraints relevant to the era
    const eraConstraints = this.constraints.filter(constraint =>
      constraint.eras.some(cEra => this.erasOverlap(cEra, era))
    );
    const validator = new ConstraintValidator(eraConstraints);
    validator.setEnforcement(this.enabledEnforcement);
    return validator.validateNodes(nodes);
  }

  /**
   * Get suggestions for improving historical accuracy
   */
  getSuggestions(nodes: UTDGNode, era: Era): string {
    const result = this.validateForEra(nodes, era);
    const suggestions: string = [];
    // Add suggestions from constraint violations
    result.suggestions.forEach(suggestion => {
      suggestions.push(suggestion.message);
      if (suggestion.suggested_alternatives) {
        suggestions.push(...suggestion.suggested_alternatives.map(alt => `Consider: ${alt}`));
      }
    });
    // Add general improvement suggestions
    if (nodes.length > 0) {
      const avgAuthenticity = nodes.reduce((sum, node) => sum + node.metadata.authenticity, 0) / nodes.length;
      if (avgAuthenticity < 0.7) {
        suggestions.push(`Average authenticity is ${(avgAuthenticity * 100).toFixed(0)}%. Consider using more historically verified items.`);}
      const missingSourceNodes = nodes.filter(node => !node.external_source);
      if (missingSourceNodes.length > 0) {
        suggestions.push(`${missingSourceNodes.length} nodes lack external source validation. Consider verifying with historical databases.`);
      }
    }
    return suggestions;
  }

  /**
   * Evaluate a single constraint against a set of nodes
   */
  private evaluateConstraint(
    constraint: HistoricalConstraint,
    nodes: UTDGNode[],
  ): ConstraintViolation | ConstraintWarning | ConstraintSuggestion | null {
  const violatingNodes: string = [];
  // Apply constraint-specific logic based on rule type
  switch (constraint.rule) {
  case 'era_compatibility':
      violatingNodes.push(...this.checkEraCompatibility(constraint, nodes));
  break;
  case 'social_class_appropriateness':
      violatingNodes.push(...this.checkSocialClassAppropriateness(constraint, nodes));
  break;
  case 'material_availability':
      violatingNodes.push(...this.checkMaterialAvailability(constraint, nodes));
  break;
  case 'cultural_appropriateness':
      violatingNodes.push(...this.checkCulturalAppropriateness(constraint, nodes));
  break;
  case 'temporal_consistency':
      violatingNodes.push(...this.checkTemporalConsistency(constraint, nodes));
  break;
  case 'regional_authenticity':
      violatingNodes.push(...this.checkRegionalAuthenticity(constraint, nodes));
  break;
    default:
      // Generic constraint evaluation
      violatingNodes.push(...this.evaluateGenericConstraint(constraint, nodes));
      break;
    }
    
    if (violatingNodes.length === 0) {
      return null;
    }
    
    const baseResult = {
  constraint_id: constraint.id,
  node_ids: violatingNodes,
  message: constraint.message,
};
    switch (constraint.enforcement) {
      case 'strict':
        return {
          ...baseResult,
          severity: 'major' as const,
        };
      case 'warning':
        return {
          ...baseResult,
          historical_context: constraint.historical_basis,
        };
      case 'suggestion':
        return {
          ...baseResult,
          suggested_alternatives: this.generateAlternatives(constraint, nodes),
        };
    }
    return null;
  }
  /**
   * Check if items from different eras are inappropriately mixed
   */
  private checkEraCompatibility(constraint: HistoricalConstraint, nodes: UTDGNode): string {
    const violatingNodes: string = [];
    // Group nodes by their primary era
    const eraGroups = new Map<string, UTDGNode>();
    for (const node of nodes) {
      const primaryEra = node.metadata.era[0];
      if (primaryEra) {
        const eraKey = `${primaryEra.name}-${primaryEra.period.start}`;
        if (!eraGroups.has(eraKey)) {
          eraGroups.set(eraKey, []);
        }
        eraGroups.get(eraKey)!.push(node);
      }
    }
    // Check for era conflicts
    if (eraGroups.size > 1) {
      const eraNames = Array.from(eraGroups.keys());
      // Check if any eras are incompatible
      for (let i = 0; i < eraNames.length; i++) {
        for (let j = i + 1; j < eraNames.length; j++) {
          const era1Nodes = eraGroups.get(eraNames[i])!;
          const era2Nodes = eraGroups.get(eraNames[j])!;
          if (this.areErasIncompatible(era1Nodes[0].metadata.era[0], era2Nodes[0].metadata.era[0])) {
            violatingNodes.push(...era1Nodes.map(n => n.id), ...era2Nodes.map(n => n.id));
          }
        }
      }
    }
    return violatingNodes;
  }
  /**
   * Check if items are appropriate for the specified social classes
   */
  private checkSocialClassAppropriateness(constraint: HistoricalConstraint, nodes: UTDGNode): string {
    const violatingNodes: string = [];
    for (const node of nodes) {
      if (node.metadata.social_class && constraint.social_classes) {
        const nodeClasses = node.metadata.social_class;
        const allowedClasses = constraint.social_classes;
        const hasValidClass = nodeClasses.some(cls => allowedClasses.includes(cls));
        if (!hasValidClass) {
          violatingNodes.push(node.id);
        }
      }
    }
    return violatingNodes;
  }
  
  /**
   * Check if materials were actually available in the specified era/region
   */
  private checkMaterialAvailability(constraint: HistoricalConstraint, nodes: UTDGNode[]): string[] {
    const violatingNodes: string[] = [];
    for (const node of nodes) {
      if (node.type === 'material' || node.type === 'texture') {
        // Check if material was available in constraint eras/regions
        const nodeEras = node.metadata.era;
        const constraintEras = constraint.eras;
        const constraintRegions = constraint.regions || [];
        let isAvailable = false;
        for (const nodeEra of nodeEras) {
          for (const constraintEra of constraintEras) {
            if (this.erasOverlap(nodeEra, constraintEra)) {
              if (constraintRegions.length === 0 || )
                  nodeEra.region.some(r => constraintRegions.includes(r))) {
                isAvailable = true;
                break;
          if (isAvailable) break;
        if (!isAvailable) {
          violatingNodes.push(node.id);
    return violatingNodes;
  /**
   * Check for cultural appropriateness and sensitivity
   */
  private checkCulturalAppropriateness(constraint: HistoricalConstraint, nodes: UTDGNode): string {
    const violatingNodes: string = [];
    for (const node of nodes) {
      // Check for culturally sensitive items
      const culturalTags = node.metadata.tags.filter(tag => ;);
        tag.includes('religious') || 
        tag.includes('sacred') || 
        tag.includes('ceremonial') ||
        tag.includes('ritual')
      );
      if (culturalTags.length > 0) {
        // Apply cultural sensitivity checks
        if (!node.metadata.ceremonial && culturalTags.some(tag => tag.includes('sacred'))) {
          violatingNodes.push(node.id);
    return violatingNodes;
  /**
   * Check for temporal consistency within the same time period
   */
  private checkTemporalConsistency(constraint: HistoricalConstraint, nodes: UTDGNode): string {
    const violatingNodes: string = [];
    if (nodes.length < 2) return violatingNodes;
    // Find the most restrictive era overlap
    const commonPeriod = { start: -Infinity, end: Infinity };
    for (const node of nodes) {
  for (const era of node.metadata.era) {
  commonPeriod.start = Math.max(commonPeriod.start, era.period.start);
  commonPeriod.end = Math.min(commonPeriod.end, era.period.end);
  // If no common period exists, flag all nodes
  if (commonPeriod.start >= commonPeriod.end) {
  return nodes.map(n => n.id);
  // Check each node against the common period
  for (const node of nodes) {
  const nodeValidInPeriod = node.metadata.era.some(era => ;);
  era.period.start <= commonPeriod.end && era.period.end >= commonPeriod.start
  );
  if (!nodeValidInPeriod) {
  violatingNodes.push(node.id);
  return violatingNodes;
  /**
  * Check for regional authenticity
  */
  private checkRegionalAuthenticity(constraint: HistoricalConstraint, nodes: UTDGNode): string {,
  const violatingNodes: string = [];
  const constraintRegions = constraint.regions || [];
  if (constraintRegions.length === 0) return violatingNodes;
  for (const node of nodes) {
  const nodeRegions = node.metadata.era.flatMap(era => era.region);
  const hasValidRegion = nodeRegions.some(region => ;);
  constraintRegions.some(cRegion => )
  region.toLowerCase().includes(cRegion.toLowerCase()) ||
  cRegion.toLowerCase().includes(region.toLowerCase())
  );
  if (!hasValidRegion) {
  violatingNodes.push(node.id);
  return violatingNodes;
  /**
  * Generic constraint evaluation for custom rules
  */
  private evaluateGenericConstraint(constraint: HistoricalConstraint, nodes: UTDGNode): string {,
  // This can be extended for custom constraint rules
  return [];
  /**
  * Generate alternative suggestions for constraint violations
  */
  private generateAlternatives(constraint: HistoricalConstraint, nodes: UTDGNode): string {,
  const alternatives: string = [];
  switch (constraint.rule) {
  case 'era_compatibility':,
  alternatives.push('Use items from a single historical period');
  alternatives.push('Choose transitional periods for era mixing');
  break;
  case 'social_class_appropriateness':,
  alternatives.push('Select items appropriate for the target social class');
  alternatives.push('Use simpler materials for lower classes');
  alternatives.push('Add luxury items for higher social classes');
  break;
  case 'material_availability':,
  alternatives.push('Use locally available materials');
  alternatives.push('Consider trade route materials for the period');
  break;
  return alternatives;
  /**
  * Check if two eras overlap temporally
  */
  private erasOverlap(era1: Era, era2: Era): boolean {,
  return era1.period.start <= era2.period.end && era2.period.start <= era1.period.end;
  /**
  * Check if two eras are considered incompatible
  */
  private areErasIncompatible(era1: Era, era2: Era): boolean {,
  const timeDifference = Math.abs(era1.period.start - era2.period.start);
  // Eras more than 500 years apart are generally incompatible
  if (timeDifference > 500) return true;
  // Different regions with no cultural connection
  const hasCommonRegion = era1.region.some(r1 => ;);
  era2.region.some(r2 => r1 === r2)
  );
  if (!hasCommonRegion && timeDifference > 200) return true;
  return false;
  /**
  * Get default historical constraints
  */
  private getDefaultConstraints(): HistoricalConstraint {,
  return [
  {
  id: 'medieval-modern-separation',
  rule: 'era_compatibility',
  eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH, HISTORICAL_ERAS.MEDIEVAL_LATE],
  enforcement: 'strict',
  message: 'Medieval and modern items should not be mixed without historical justification',
  historical_basis: 'Medieval technology and materials were fundamentally different from modern equivalents',
}
      {
  id: 'silk-availability-medieval',
  rule: 'material_availability',
  eras: [HISTORICAL_ERAS.MEDIEVAL_EARLY],
  regions: ['Northern Europe'],
  enforcement: 'warning',
  message: 'Silk was extremely rare and expensive in early medieval Northern Europe',
  historical_basis: 'Silk trade routes were disrupted and silk was primarily available to royalty and high clergy',
}
      {
  id: 'social-class-clothing',
  rule: 'social_class_appropriateness',
  eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH, HISTORICAL_ERAS.MEDIEVAL_LATE],
  social_classes: ['peasant'],
  enforcement: 'warning',
  message: 'Elaborate clothing items inappropriate for peasant social class',
  historical_basis: 'Sumptuary laws regulated clothing by social class in medieval Europe',
}
      {
        id: 'cultural-sensitivity-religious',
        rule: 'cultural_appropriateness',
        eras: Object.values(HISTORICAL_ERAS),
        enforcement: 'suggestion',
        message: 'Religious items should be used with cultural sensitivity and historical context',
        historical_basis: 'Religious artifacts had sacred significance and specific usage contexts'];

export default ConstraintValidator;