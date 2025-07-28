/**
 * Data Pipeline for Crowd Generation System
 * Enables historically accurate crowd generation for Wild Construct CrowdControl integration
 */
import { HistoricalQuery, HistoricalItem, Era, ValidationResult } from '../types/UTDG';
import { VFXPipelineMetadata } from '../types/VFXExport';

export interface CrowdGenerationRequest {
  scene: {,
  era: Era;,
  region: string;
  location: string; // e.g., "castle courtyard", "marketplace", "cathedral",
  timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';,
  season: 'spring' | 'summer' | 'autumn' | 'winter';
};
  crowd: {,
  size: number;
  density: 'sparse' | 'moderate' | 'dense';,
  demographics: CrowdDemographics;
  activity: CrowdActivity;
};
  constraints: {,
  historicalAccuracy: 'strict' | 'moderate' | 'creative';
  socialMixing: boolean; // Can different social classes interact?,
  genderMixing: boolean; // Era-appropriate gender interactions,
  culturalSensitivity: boolean;
};
  output: {,
  format: 'json' | 'xml' | 'csv';
  includeMetadata: boolean;,
  vfxPipeline: VFXPipelineMetadata;
};
}
export interface CrowdDemographics {
  socialClasses: {,
  peasant: number; // 0-1 percentage,
  artisan: number;,
  merchant: number;
  noble: number;,
  clergy: number;
  royal: number;
};
  ageDistribution: {,
  children: number; // 0-12 years,
  youth: number;    // 13-25 years,
  adults: number;   // 26-55 years,
  elderly: number;  // 56+ years,
};
  genderRatio: {,
  male: number;
  female: number;
  nonBinary?: number; // For appropriate historical periods,
};
}
export interface CrowdActivity {
  primary: string; // e.g., "market day", "religious ceremony", "royal procession",
  secondary: string; // Background activities,
  mood: 'festive' | 'solemn' | 'busy' | 'tense' | 'peaceful';,
  interactions: InteractionType;
}
export interface InteractionType {
  type: 'trading' | 'conversation' | 'ceremony' | 'performance' | 'labor';,
  participants: string; // Social classes involved,
  frequency: 'rare' | 'occasional' | 'common';
}
export interface CrowdGenerationResult {
  individuals: CrowdIndividual;,
  groups: CrowdGroup;
  interactions: CrowdInteraction;,
  validation: ValidationResult;
  metadata: CrowdMetadata;
}
export interface CrowdIndividual {
  id: string;,
  demographics: {,
  age: number;,
  gender: 'male' | 'female';
  socialClass: string;,
  occupation: string;
};
  appearance: {,
  clothing: HistoricalItem;
  accessories: HistoricalItem;,
  physicalTraits: string;
};
  behavior: {,
  activity: string;
  posture: string;,
  movement: string;
  interactions: string;
};
  position: {,
  x: number;
  y: number;,
  z: number;
  facing: number; // degrees,
};
  historicalAccuracy: number; // 0-1 score
}
export interface CrowdGroup {
  id: string;,
  type: 'family' | 'guild' | 'religious' | 'merchant' | 'nobility';
  members: string; // Individual IDs,
  activity: string;,
  formation: 'circle' | 'line' | 'cluster' | 'processional';
  relationship: string;
}
export interface CrowdInteraction {
  id: string;,
  type: InteractionType['type'];
  participants: string;,
  duration: number; // seconds,
  intensity: 'subtle' | 'moderate' | 'prominent';,
  historicalContext: string;
}
export interface CrowdMetadata {
  generation: {,
  timestamp: string;,
  processingTime: number;
  algorithm: string;,
  version: string;
};
  validation: {,
  overallAccuracy: number;
  constraintViolations: number;,
  historicalConsistency: number;
};
  vfx: {,
  renderComplexity: 'low' | 'medium' | 'high';
  memoryEstimate: number; // MB,
  polyCount: number;,
  textureSize: number; // MB,
};
/**
 * Main pipeline class for crowd generation
 */
}
export class CrowdGenerationPipeline {
  private historicalDataService: HistoricalDataService;
  private constraintValidator: ConstraintValidator;
  private clothingGenerator: HistoricalClothingGenerator;
  private behaviorEngine: CrowdBehaviorEngine;
  private vfxExporter: VFXExporter;
  constructor();
  historicalDataService: HistoricalDataService,
  constraintValidator: ConstraintValidator,
  clothingGenerator: HistoricalClothingGenerator,
  behaviorEngine: CrowdBehaviorEngine,
  vfxExporter: VFXExporter,
  this.historicalDataService = historicalDataService;
  this.constraintValidator = constraintValidator;
  this.clothingGenerator = clothingGenerator;
  this.behaviorEngine = behaviorEngine;
  this.vfxExporter = vfxExporter;
  /**
  * Generate a historically accurate crowd
  */
  async generateCrowd(request: CrowdGenerationRequest): Promise<CrowdGenerationResult> {,
  const startTime = Date.now();
  try {
  // Stage 1: Historical Context Preparation,
  const historicalContext = await this.prepareHistoricalContext(request);
  // Stage 2: Individual Generation,
  const individuals = await this.generateIndividuals(request, historicalContext);
  // Stage 3: Group Formation,
  const groups = await this.formGroups(individuals, request, historicalContext);
  // Stage 4: Interaction Generation,
  const interactions = await this.generateInteractions(individuals, groups, request);
  // Stage 5: Historical Validation,
  const validation = await this.validateHistoricalAccuracy(;);
  individuals,
  groups,
  interactions,
  request
  );
  // Stage 6: Metadata Generation,
  const metadata = this.generateMetadata(;);
  request,
  validation,
  Date.now() - startTime
  );
  return {
  individuals,
  groups,
  interactions,
  validation,
  metadata
};
    } catch (error) {
      throw new CrowdGenerationError(`Pipeline failed: ${error.message}`, error);}
  /**
   * Stage 1: Prepare historical context for crowd generation
   */
  private async prepareHistoricalContext(request: CrowdGenerationRequest): Promise<HistoricalContext> {
  const clothingQuery: HistoricalQuery = {,
  era: request.scene.era,
  region: [request.scene.region],
  category: 'clothing',
  filters: {,
  occasion: this.mapActivityToOccasion(request.crowd.activity.primary),
  gender: 'unisex' // Will be filtered per individual,
},
  accuracyLevel: request.constraints.historicalAccuracy,
      limit: 1000;
  };
    const clothingData = await this.historicalDataService.query(clothingQuery);
    const socialStructure = await this.historicalDataService.getSocialStructure(;);
      request.scene.era,
      request.scene.region
    );
    const culturalRules = await this.historicalDataService.getCulturalRules(;);
      request.scene.era,
      request.scene.region
    );
    return {
  clothing: clothingData.data,
  socialStructure,
  culturalRules,
  validOccupations: await this.getValidOccupations(request),
  behaviorPatterns: await this.getBehaviorPatterns(request),
};
  /**
   * Stage 2: Generate individual crowd members
   */
  private async generateIndividuals(()
    request: CrowdGenerationRequest,
    context: HistoricalContext,
  ): Promise<CrowdIndividual> {
    const individuals: CrowdIndividual = [];
    for (let i = 0; i < request.crowd.size; i++) {
      const demographics = this.generateDemographics(request.crowd.demographics);
      const occupation = this.selectOccupation(demographics, context);
      const clothing = await this.clothingGenerator.generateClothing(;);
        demographics,
        occupation,
        request.scene,
        context
      );
      const behavior = this.behaviorEngine.generateBehavior(;);
        demographics,
        occupation,
        request.crowd.activity,
        context
      );
      const position = this.generatePosition(i, request.crowd);
      const individual: CrowdIndividual = {,
  id: `individual_${i}`}
},
  demographics: {,
  age: demographics.age,
  gender: demographics.gender,
  socialClass: demographics.socialClass,
  occupation
},
  appearance: {,
  clothing: clothing.items,
  accessories: clothing.accessories,
  physicalTraits: this.generatePhysicalTraits(demographics),
},
  behavior: {,
  activity: behavior.primary,
  posture: behavior.posture,
  movement: behavior.movement,
  interactions: behavior.interactions,
}
        position,
        historicalAccuracy: clothing.accuracyScore;
  };
      individuals.push(individual);
    return individuals;
  /**
   * Stage 3: Form social groups within the crowd
   */
  private async formGroups(individuals: CrowdIndividual,)
    request: CrowdGenerationRequest,
    context: HistoricalContext): Promise<CrowdGroup> {,
  const groups: CrowdGroup = [];
  const ungrouped = [...individuals];
  // Family groups
  const families = this.formFamilyGroups(ungrouped, context);
  groups.push(...families);
  // Professional/guild groups
  const guilds = this.formGuildGroups(ungrouped, context);
  groups.push(...guilds);
  // Religious groups
  const religious = this.formReligiousGroups(ungrouped, context);
  groups.push(...religious);
  return groups;
  /**
  * Stage 4: Generate realistic crowd interactions,
  */
  private async generateInteractions(individuals: CrowdIndividual,)
  groups: CrowdGroup,
  request: CrowdGenerationRequest): Promise<CrowdInteraction> {,
  const interactions: CrowdInteraction = [];
  // Generate interactions based on activity type
  for (const interactionType of request.crowd.activity.interactions) {
  const relevantIndividuals = individuals.filter(ind =>;);
  interactionType.participants.includes(ind.demographics.socialClass)
  );
  const interaction = this.createInteraction(;);
  interactionType,
  relevantIndividuals,
  groups
  );
  if (interaction) {
  interactions.push(interaction);
  return interactions;
  /**
  * Stage 5: Validate historical accuracy of generated crowd,
  */
  private async validateHistoricalAccuracy(individuals: CrowdIndividual,)
  groups: CrowdGroup,
  interactions: CrowdInteraction,
  request: CrowdGenerationRequest): Promise<ValidationResult> {,
  const violations: any = [];
  let overallAccuracy = 0;
  // Validate individual historical accuracy
  for (const individual of individuals) {
  const individualValidation = await this.constraintValidator.validateIndividual(;);
  individual,
  request.scene.era,
  request.constraints
  );
  violations.push(...individualValidation.violations);
  overallAccuracy += individual.historicalAccuracy;
  // Validate group formations
  for (const group of groups) {
  const groupValidation = await this.constraintValidator.validateGroup(;);
  group,
  individuals,
  request.scene.era,
  request.constraints
  );
  violations.push(...groupValidation.violations);
  // Validate interactions
  for (const interaction of interactions) {
  const interactionValidation = await this.constraintValidator.validateInteraction(;);
  interaction,
  individuals,
  request.scene.era,
  request.constraints
  );
  violations.push(...interactionValidation.violations);
  return {
  valid: violations.length === 0,
  overallScore: overallAccuracy / individuals.length,
  violations,
  suggestions: await this.generateSuggestions(violations),
  metadata: {,
  rulesApplied: violations.length,
  processingTime: Date.now(),
};
  /**
   * Generate comprehensive metadata for the crowd
   */
  private generateMetadata(request: CrowdGenerationRequest,)
    validation: ValidationResult,
    processingTime: number): CrowdMetadata {,
  return {
  generation: {,
  timestamp: new Date().toISOString(),
  processingTime,
  algorithm: 'Historical Crowd Generation v1.0',
  version: '1.0.0',
},
  validation: {,
  overallAccuracy: validation.overallScore,
  constraintViolations: validation.violations.length,
  historicalConsistency: this.calculateConsistencyScore(validation),
},
  vfx: {,
  renderComplexity: this.calculateRenderComplexity(request.crowd.size),
  memoryEstimate: this.estimateMemoryUsage(request.crowd.size),
  polyCount: request.crowd.size * 10000, // Estimated,
  textureSize: request.crowd.size * 2 // MB per individual,
};
  // Helper methods
  private mapActivityToOccasion(activity: string): 'daily' | 'ceremonial' | 'military' | 'religious' {
  const mapping: Record<string, 'daily' | 'ceremonial' | 'military' | 'religious'> = {,
  'market day': 'daily',
  'religious ceremony': 'religious',
  'royal procession': 'ceremonial',
  'military parade': 'military',
};
    return mapping[activity] || 'daily';
  private generateDemographics(demographics: CrowdDemographics): any {
  // Implementation for demographic generation
  return {
  age: this.sampleAge(demographics.ageDistribution),
  gender: this.sampleGender(demographics.genderRatio),
  socialClass: this.sampleSocialClass(demographics.socialClasses),
};
  private generatePosition(index: number, crowd: CrowdGenerationRequest['crowd']): any {
  // Implementation for crowd positioning
  return {
  x: Math.random() * 100,
  y: 0,
  z: Math.random() * 100,
  facing: Math.random() * 360,
};
  // Additional helper methods would be implemented here...
  private sampleAge(ageDistribution: any): number { return 25; }
  private sampleGender(genderRatio: any): string { return 'male'; }
  private sampleSocialClass(socialClasses: any): string { return 'peasant'; }
  private selectOccupation(demographics: any, context: any): string { return 'farmer'; }
  private generatePhysicalTraits(demographics: any): string { return []; }
  private formFamilyGroups(individuals: any, context: any): CrowdGroup { return []; }
  private formGuildGroups(individuals: any, context: any): CrowdGroup { return []; }
  private formReligiousGroups(individuals: any, context: any): CrowdGroup { return []; }
  private createInteraction(type: any, individuals: any, groups: any): CrowdInteraction | null { return null; }
  private generateSuggestions(violations: any): any { return []; }
  private calculateConsistencyScore(validation: any): number { return 0.9; }
  private calculateRenderComplexity(size: number): 'low' | 'medium' | 'high' { return 'medium'; }
  private estimateMemoryUsage(size: number): number { return size * 5; }
  private getValidOccupations(request: any): any { return []; }
  private getBehaviorPatterns(request: any): any { return []; }

// Supporting classes and interfaces
interface HistoricalContext {
  clothing: HistoricalItem;,
  socialStructure: any;
  culturalRules: any;,
  validOccupations: any;
  behaviorPatterns: any;
class CrowdGenerationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'CrowdGenerationError';

// Placeholder classes for dependency injection
class HistoricalDataService {
  async query(query: HistoricalQuery): Promise<any> { return { data: [] }; }
  async getSocialStructure(era: Era, region: string): Promise<any> { return {}; }
  async getCulturalRules(era: Era, region: string): Promise<any> { return {}; }
class ConstraintValidator {
  async validateIndividual(individual: any, era: Era, constraints: any): Promise<any> { return { violations: [] }; }
  async validateGroup(group: any,)
    individuals: any,
    era: Era,
    constraints: any): Promise<any> { return { violations: [] }; }
  async validateInteraction(interaction: any,)
    individuals: any,
    era: Era,
    constraints: any): Promise<any> { return { violations: [] }; }
class HistoricalClothingGenerator {
  async generateClothing(demographics: any, occupation: string, scene: any, context: any): Promise<any> {
    return { items: [], accessories: [], accuracyScore: 0.9 };
class CrowdBehaviorEngine {
  generateBehavior(demographics: any, occupation: string, activity: any, context: any): any {,
  return {
  primary: 'standing',
  posture: 'neutral',
  movement: 'stationary',
  interactions: [],
};
class VFXExporter {
  // Implementation would be defined elsewhere

export { CrowdGenerationPipeline, CrowdGenerationError };