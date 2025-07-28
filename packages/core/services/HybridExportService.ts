/**
 * Hybrid Prompting Export Service
 * Epic 8.6 Task 7: Combines MARS framework, Zada-style natural language, and VFX structured data
 * 
 * Supports Wild Construct film industry integration with multiple export formats:
 * - MARS framework tags ([CAM], [SUBJ], [FX], !FOCAL) for VFX professionals
 * - Zada-style natural language variants for director accessibility
 * - Structured VFX data for pipeline integration
 * - Hollywood protocol reproducibility with complete seed tracking
 */
import { VFXExportFormat, VFXPromptVariant } from '../types/VFXExport.js';
import { WildConstructVFXExporter } from './VFXExporter.js';
import { Node, Edge } from 'reactflow';
import { substituteVariables } from '../utils/templateParser.js';

export interface HybridExportFormat extends VFXExportFormat {
  // Hybrid prompting extensions
  hybridPrompting: {,
  mars: {,
  framework: 'MARS-v1.0';,
  tags: MARSFrameworkTags;
  structured: MARSStructuredPrompt;
};
    zada: {,
  approach: 'screenplay-style';
  variants: ZadaNaturalLanguageVariant;,
  director_friendly: DirectorAccessiblePrompt;
};
    hollywood: {,
  protocol: 'reproducibility-v1';
  seeds: HollywoodSeedProtocol;,
  iteration_tracking: IterationHistory;
};
  };

// === MARS FRAMEWORK INTEGRATION ===

export interface MARSFrameworkTags {
  // Camera and composition tags
  CAM: {,
  shot_type: 'ECU' | 'CU' | 'MS' | 'WS' | 'EWS' | 'OTS' | 'POV';,
  angle: 'high' | 'eye' | 'low' | 'dutch' | 'aerial';
  movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'zoom' | 'handheld';,
  lens: string; // e.g., "35mm", "85mm", "wide-angle",
  depth_of_field: 'shallow' | 'deep' | 'rack-focus';
};
  // Subject and character tags
  SUBJ: {,
  primary: string; // Main subject description,
  secondary?: string; // Supporting elements,
  interaction: string; // Character actions/interactions,
  emotion: string; // Emotional state/expression,
  blocking: string; // Physical positioning,
};
  // Effects and post-processing tags
  FX: {,
  lighting: 'natural' | 'dramatic' | 'soft' | 'harsh' | 'practical' | 'motivated';
  color_grade: 'neutral' | 'warm' | 'cool' | 'desaturated' | 'cinematic';,
  atmosphere: 'clear' | 'hazy' | 'smoky' | 'foggy' | 'dusty';
  special_fx?: string; // VFX elements to add,
  post_processing?: string; // Post-production effects,
};
  // Focal elements (using !FOCAL syntax)
  FOCAL: {,
  primary_focus: string; // Main visual focus point,
  secondary_focus?: string; // Supporting focus elements,
  background_treatment: 'blur' | 'sharp' | 'silhouette' | 'bokeh';,
  visual_hierarchy: 'foreground' | 'midground' | 'background';
};
}
export interface MARSStructuredPrompt {
  raw_mars: string; // Original MARS-tagged prompt,
  parsed_structure: {,
  camera_section: string;,
  subject_section: string;
  effects_section: string;,
  focal_section: string;
};
  controlnet_mapping: {,
  pose_guidance: string; // SUBJ → pose parameters,
  depth_hints: string; // CAM → depth estimation,
  edge_conditions: string; // FX → edge detection,
  composition_rules: string; // FOCAL → composition guides,
};

// === ZADA NATURAL LANGUAGE APPROACH ===
}
export interface ZadaNaturalLanguageVariant {
  variant_id: string;,
  style: 'screenplay' | 'storyboard' | 'shot_list' | 'director_note';
  content: string;,
  accessibility_level: 'director' | 'cinematographer' | 'general_crew';
  human_readable_score: number; // 1-10, how accessible to non-technical users,
}
export interface DirectorAccessiblePrompt {
  screenplay_style: string; // "FADE IN: CLOSE-UP on character's face...",
  shot_description: string; // Natural language shot breakdown,
  mood_direction: string; // Emotional/atmospheric guidance,
  reference_notes: string; // Visual references and inspirations,
  crew_notes: {,
  cinematographer: string;,
  lighting_director: string;
  vfx_supervisor: string;
};

// === HOLLYWOOD REPRODUCIBILITY PROTOCOL ===
}
export interface HollywoodSeedProtocol {
  master_seed: number; // Primary reproducibility seed,
  component_seeds: Record<string, number>; // Per-node/component seeds,
  iteration_seeds: number; // Seeds for multiple iterations,
  reproducibility_checksum: string; // Validation hash,
  version_compatibility: {,
  generator_version: string;,
  node_version_map: Record<string, string>;
  schema_version: string;
};
}
export interface IterationHistory {
  iteration_id: string;,
  timestamp: string;
  seed_used: number;,
  changes_from_previous: string;
  director_notes?: string;
  approval_status: 'draft' | 'review' | 'approved' | 'final';
  // === HYBRID EXPORT SERVICE ===
}
export class HybridPromptExportService {
  private vfxExporter: WildConstructVFXExporter;
  private marsExtractor: MARSFrameworkExtractor;
  private zadaGenerator: ZadaNaturalLanguageGenerator;
  private seedManager: HollywoodSeedManager;
  constructor() {
    this.vfxExporter = WildConstructVFXExporter.getInstance();
    this.marsExtractor = new MARSFrameworkExtractor();
    this.zadaGenerator = new ZadaNaturalLanguageGenerator();
    this.seedManager = new HollywoodSeedManager();
  /**
   * Export graph with hybrid prompting approach combining all methodologies
   */
  async exportHybridPrompt(graph: { nodes: Node; edges: Edge },)
    executionResults: {,
  finalPrompt: string;
  variables: Record<string, string>;
  executionTime: number;
  nodePerformance?: Record<string, number>;
  variants?: VFXPromptVariant;
},
  options: {,
  includeMARS: boolean;
  includeZada: boolean;,
  includeHollywoodProtocol: boolean;
  quality: 'production' | 'preview' | 'debug';,
  targetAudience: 'director' | 'vfx_professional' | 'mixed_crew';
} = {
      includeMARS: true,
      includeZada: true,
      includeHollywoodProtocol: true,
      quality: 'production',
      targetAudience: 'mixed_crew'): Promise<HybridExportFormat> {,
    // Start with base VFX export
    const baseExport = await this.vfxExporter.exportGraph(;);
      graph,
      executionResults,
      { quality: options.quality }
    );
    // Build hybrid extensions
    const hybridExtensions = await this.buildHybridExtensions(;);
      graph,
      executionResults,
      options
    );
    // Combine into hybrid export format
    const hybridExport: HybridExportFormat = {
  ...baseExport,
  hybridPrompting: hybridExtensions,
};
    return hybridExport;
  private async buildHybridExtensions()
    graph: { nodes: Node; edges: Edge },
    executionResults: any,
    options: any,
    const extensions: HybridExportFormat['hybridPrompting'] = {,
  mars: {,
  framework: 'MARS-v1.0',
  tags: await this.marsExtractor.extractMARSTags(),
  executionResults.finalPrompt,
  executionResults.variables
  ),
  structured: await this.marsExtractor.createStructuredPrompt(),
  executionResults.finalPrompt
},
  zada: {,
  approach: 'screenplay-style',
  variants: await this.zadaGenerator.generateNaturalLanguageVariants(),
  executionResults.finalPrompt,
  executionResults.variables,
  options.targetAudience
  ),
  director_friendly: await this.zadaGenerator.createDirectorAccessiblePrompt(),
  executionResults.finalPrompt,
  executionResults.variables
},
  hollywood: {,
  protocol: 'reproducibility-v1',
  seeds: this.seedManager.generateHollywoodSeeds(graph),
  iteration_tracking: this.seedManager.createIterationHistory(),
  executionResults
};
    return extensions;

// === MARS FRAMEWORK EXTRACTOR ===
class MARSFrameworkExtractor {
  async extractMARSTags(prompt: string, variables: Record<string, string>): Promise<MARSFrameworkTags> {,
  // Analyze prompt and variables to extract MARS framework tags
  const tags: MARSFrameworkTags = {,
  CAM: this.extractCameraTags(prompt, variables),
  SUBJ: this.extractSubjectTags(prompt, variables),
  FX: this.extractEffectsTags(prompt, variables),
  FOCAL: this.extractFocalTags(prompt, variables),
};
    return tags;
  async createStructuredPrompt(prompt: string): Promise<MARSStructuredPrompt> {
  // Parse prompt into MARS structured format
  const structured: MARSStructuredPrompt = {,
  raw_mars: this.convertToMARSFormat(prompt),
  parsed_structure: {,
  camera_section: this.extractCameraSection(prompt),
  subject_section: this.extractSubjectSection(prompt),
  effects_section: this.extractEffectsSection(prompt),
  focal_section: this.extractFocalSection(prompt),
},
  controlnet_mapping: {,
  pose_guidance: this.mapToControlNetPose(prompt),
  depth_hints: this.mapToControlNetDepth(prompt),
  edge_conditions: this.mapToControlNetEdges(prompt),
  composition_rules: this.mapToControlNetComposition(prompt),
};
    return structured;
  private extractCameraTags(prompt: string, variables: Record<string, string>): MARSFrameworkTags['CAM'] {
  // Intelligent extraction of camera parameters from prompt/variables
  const cameraVariables = this.filterCameraVariables(variables);
  return {
  shot_type: this.inferShotType(prompt, cameraVariables),
  angle: this.inferCameraAngle(prompt, cameraVariables),
  movement: this.inferCameraMovement(prompt, cameraVariables),
  lens: this.inferLensChoice(prompt, cameraVariables),
  depth_of_field: this.inferDepthOfField(prompt, cameraVariables),
};
  private extractSubjectTags(prompt: string, variables: Record<string, string>): MARSFrameworkTags['SUBJ'] {
  return {
  primary: this.extractPrimarySubject(prompt),
  secondary: this.extractSecondarySubjects(prompt),
  interaction: this.extractInteractions(prompt, variables),
  emotion: this.extractEmotionalState(prompt, variables),
  blocking: this.extractPhysicalBlocking(prompt, variables),
};
  private extractEffectsTags(prompt: string, variables: Record<string, string>): MARSFrameworkTags['FX'] {
  return {
  lighting: this.inferLightingStyle(prompt, variables),
  color_grade: this.inferColorGrading(prompt, variables),
  atmosphere: this.inferAtmosphericConditions(prompt, variables),
  special_fx: this.extractSpecialEffects(prompt, variables),
  post_processing: this.extractPostProcessingEffects(prompt, variables),
};
  private extractFocalTags(prompt: string, variables: Record<string, string>): MARSFrameworkTags['FOCAL'] {
  return {
  primary_focus: this.identifyPrimaryFocus(prompt),
  secondary_focus: this.identifySecondaryFocus(prompt),
  background_treatment: this.inferBackgroundTreatment(prompt, variables),
  visual_hierarchy: this.determineVisualHierarchy(prompt, variables),
};
  // Helper methods for tag extraction
  private filterCameraVariables(variables: Record<string, string>): Record<string, string> {
  return Object.fromEntries()
  Object.entries(variables).filter(([key]) =>
  key.toLowerCase().includes('camera') ||
  key.toLowerCase().includes('shot') ||
  key.toLowerCase().includes('angle') ||
  key.toLowerCase().includes('lens')
  );
  private inferShotType(prompt: string, variables: Record<string, string>): 'ECU' | 'CU' | 'MS' | 'WS' | 'EWS' | 'OTS' | 'POV' {,
  // Intelligent shot type inference from prompt content
  const shotKeywords = {
  'ECU': ['extreme close', 'macro', 'detail'],
  'CU': ['close-up', 'close up', 'face', 'portrait'],
  'MS': ['medium shot', 'waist up', 'half body'],
  'WS': ['wide shot', 'full body', 'establishing'],
  'EWS': ['extreme wide', 'landscape', 'aerial'],
  'OTS': ['over shoulder', 'over the shoulder'],
  'POV': ['point of view', 'first person', 'through eyes'],
};
    for (const [shotType, keywords] of Object.entries(shotKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return shotType as any;
  return 'MS'; // Default medium shot
  private inferCameraAngle(prompt: string, variables: Record<string, string>): 'high' | 'eye' | 'low' | 'dutch' | 'aerial' {,
  const angleKeywords = {
  'high': ['high angle', 'looking down', 'from above'],
  'low': ['low angle', 'looking up', 'from below', 'worm view'],
  'dutch': ['dutch angle', 'tilted', 'canted'],
  'aerial': ['aerial', 'bird view', 'drone'],
  'eye': ['eye level', 'straight on', 'neutral'],
};
    for (const [angle, keywords] of Object.entries(angleKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return angle as any;
  return 'eye'; // Default eye level
  private inferCameraMovement(prompt: string, variables: Record<string, string>): 'static' | 'pan' | 'tilt' | 'dolly' | 'zoom' | 'handheld' {,
  const movementKeywords = {
  'pan': ['panning', 'pan left', 'pan right', 'horizontal move'],
  'tilt': ['tilting', 'tilt up', 'tilt down', 'vertical move'],
  'dolly': ['dolly in', 'dolly out', 'tracking', 'pushing in'],
  'zoom': ['zoom in', 'zoom out', 'zooming'],
  'handheld': ['handheld', 'shaky', 'documentary', 'unstable'],
  'static': ['static', 'locked off', 'tripod', 'steady'],
};
    for (const [movement, keywords] of Object.entries(movementKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return movement as any;
  return 'static'; // Default static
  private inferLensChoice(prompt: string, variables: Record<string, string>): string {,
  const lensKeywords = [;
  '24mm', '35mm', '50mm', '85mm', '135mm',
  'wide-angle', 'standard', 'telephoto',
  'fish-eye', 'macro', 'portrait lens'
  ];
  for (const lens of lensKeywords) {
  if (prompt.toLowerCase().includes(lens) ||
  Object.values(variables).some(v => v.toLowerCase().includes(lens))) {
  return lens;
  return '50mm'; // Default standard lens
  private inferDepthOfField(prompt: string, variables: Record<string, string>): 'shallow' | 'deep' | 'rack-focus' {,
  const dofKeywords = {
  'shallow': ['shallow', 'bokeh', 'blur', 'f/1.4', 'f/2.8'],
  'deep': ['deep focus', 'sharp', 'f/8', 'f/11', 'everything in focus'],
  'rack-focus': ['rack focus', 'focus pull', 'shifting focus'],
};
    for (const [dof, keywords] of Object.entries(dofKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return dof as any;
  return 'shallow'; // Default shallow DOF for cinematic look
  // Additional extraction methods would continue here...
  private extractPrimarySubject(prompt: string): string {,
  // Extract main subject from prompt
  const sentences = prompt.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim() || '';
  // Simple subject extraction - could be enhanced with NLP
  const subjectPattern = /(?:a|an|the)\s+([^]+)/i;
  const match = firstSentence.match(subjectPattern);
  return match?.[1] || 'character';
  private extractSecondarySubjects(prompt: string): string | undefined {,
  // Extract secondary elements
  if (prompt.includes(' and ') || prompt.includes(' with ')) {
  const parts = prompt.split(/\s+(?:and|with)\s+/);
  return parts.slice(1).join(', ');
  return undefined;
  private extractInteractions(prompt: string, variables: Record<string, string>): string {,
  // Extract action words and interactions
  const actionWords = ['walking', 'running', 'sitting', 'standing', 'looking', 'holding', 'talking'];
  const foundActions = actionWords.filter(action => ;);
  prompt.toLowerCase().includes(action)
  );
  return foundActions.join(', ') || 'neutral pose';
  private extractEmotionalState(prompt: string, variables: Record<string, string>): string {,
  // Extract emotional descriptors
  const emotions = ['happy', 'sad', 'angry', 'surprised', 'contemplative', 'serious', 'joyful'];
  const foundEmotions = emotions.filter(emotion => ;);
  prompt.toLowerCase().includes(emotion)
  );
  return foundEmotions[0] || 'neutral';
  private extractPhysicalBlocking(prompt: string, variables: Record<string, string>): string {,
  // Extract positioning and blocking information
  const positionWords = ['standing', 'sitting', 'leaning', 'center', 'left', 'right', 'foreground', 'background'];
  const foundPositions = positionWords.filter(position => ;);
  prompt.toLowerCase().includes(position)
  );
  return foundPositions.join(', ') || 'center frame';
  private inferLightingStyle(prompt: string, variables: Record<string, string>): 'natural' | 'dramatic' | 'soft' | 'harsh' | 'practical' | 'motivated' {,
  const lightingKeywords = {
  'dramatic': ['dramatic', 'moody', 'high contrast', 'chiaroscuro'],
  'soft': ['soft', 'diffused', 'gentle', 'flattering'],
  'harsh': ['harsh', 'hard', 'sharp shadows', 'direct'],
  'practical': ['practical', 'motivated', 'realistic'],
  'natural': ['natural', 'daylight', 'window light', 'available'],
};
    for (const [style, keywords] of Object.entries(lightingKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return style as any;
  return 'natural'; // Default natural lighting
  private inferColorGrading(prompt: string, variables: Record<string, string>): 'neutral' | 'warm' | 'cool' | 'desaturated' | 'cinematic' {,
  const colorKeywords = {
  'warm': ['warm', 'golden', 'orange', 'sunset'],
  'cool': ['cool', 'blue', 'cold', 'winter'],
  'desaturated': ['muted', 'desaturated', 'bleached', 'washed out'],
  'cinematic': ['cinematic', 'film', 'movie-like', 'theatrical'],
};
    for (const [grade, keywords] of Object.entries(colorKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return grade as any;
  return 'neutral'; // Default neutral grading
  private inferAtmosphericConditions(prompt: string, variables: Record<string, string>): 'clear' | 'hazy' | 'smoky' | 'foggy' | 'dusty' {,
  const atmosphereKeywords = {
  'hazy': ['hazy', 'soft', 'dreamy'],
  'smoky': ['smoky', 'smoke', 'mysterious'],
  'foggy': ['foggy', 'fog', 'mist', 'misty'],
  'dusty': ['dusty', 'dust', 'particles', 'gritty'],
};
    for (const [atmosphere, keywords] of Object.entries(atmosphereKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return atmosphere as any;
  return 'clear'; // Default clear atmosphere
  private extractSpecialEffects(prompt: string, variables: Record<string, string>): string | undefined {,
  const fxKeywords = ['explosion', 'fire', 'water', 'magic', 'sparks', 'lightning', 'energy'];
  const foundFX = fxKeywords.filter(fx => ;);
  prompt.toLowerCase().includes(fx) ||
  Object.values(variables).some(v => v.toLowerCase().includes(fx))
  );
  return foundFX.length > 0 ? foundFX : undefined;
  private extractPostProcessingEffects(prompt: string, variables: Record<string, string>): string | undefined {,
  const postFX = ['grain', 'vignette', 'bloom', 'chromatic aberration', 'lens flare'];
  const foundPostFX = postFX.filter(fx => ;);
  prompt.toLowerCase().includes(fx) ||
  Object.values(variables).some(v => v.toLowerCase().includes(fx))
  );
  return foundPostFX.length > 0 ? foundPostFX : undefined;
  private identifyPrimaryFocus(prompt: string): string {,
  // Identify what should be the main focus
  const focusIndicators = ['focus on', 'centered on', 'highlighting', 'featuring'];
  for (const indicator of focusIndicators) {
  const index = prompt.toLowerCase().indexOf(indicator);
  if (index !== -1) {
  const afterIndicator = prompt.substring(index + indicator.length).trim();
  const focusSubject = afterIndicator.split(/[.]|[.]$/)[0];
  return focusSubject.trim();
  return this.extractPrimarySubject(prompt);
  private identifySecondaryFocus(prompt: string): string | undefined {,
  // Identify secondary focus elements
  if (prompt.includes('background') || prompt.includes('in the distance')) {
  const backgroundPattern = /(?:background|in the distance)[^.]*([^,.]+)/i;
  const match = prompt.match(backgroundPattern);
  return match?.[1]?.trim();
  return undefined;
  private inferBackgroundTreatment(prompt: string, variables: Record<string, string>): 'blur' | 'sharp' | 'silhouette' | 'bokeh' {,
  const treatmentKeywords = {
  'blur': ['blur', 'blurred', 'out of focus'],
  'bokeh': ['bokeh', 'creamy', 'smooth blur'],
  'silhouette': ['silhouette', 'backlit', 'rim light'],
  'sharp': ['sharp', 'detailed', 'clear background'],
};
    for (const [treatment, keywords] of Object.entries(treatmentKeywords)) {
  if (keywords.some(keyword => )
  prompt.toLowerCase().includes(keyword) ||
  Object.values(variables).some(v => v.toLowerCase().includes(keyword))
  )) {
  return treatment as any;
  return 'blur'; // Default background blur for cinematic look
  private determineVisualHierarchy(prompt: string, variables: Record<string, string>): 'foreground' | 'midground' | 'background' {,
  if (prompt.toLowerCase().includes('foreground') || prompt.toLowerCase().includes('close to camera')) {
  return 'foreground';
} else if (prompt.toLowerCase().includes('background') || prompt.toLowerCase().includes('distance')) {
      return 'background';
    return 'midground'; // Default midground focus
  // MARS conversion methods
  private convertToMARSFormat(prompt: string): string {
    // Convert natural language prompt to MARS tagged format
    return `[CAM:MS:eye:static:50mm] [SUBJ:${this.extractPrimarySubject(prompt)}:neutral:center] [FX:natural:neutral:clear] !FOCAL[${this.identifyPrimaryFocus(prompt)}]`;}
  private extractCameraSection(prompt: string): string {
    return `[CAM:${this.inferShotType(prompt, {})}:${this.inferCameraAngle(prompt, {})}:${this.inferCameraMovement(prompt, {})}:${this.inferLensChoice(prompt, {})}]`;}
  private extractSubjectSection(prompt: string): string {
    return `[SUBJ:${this.extractPrimarySubject(prompt)}:${this.extractEmotionalState(prompt, {})}:${this.extractPhysicalBlocking(prompt, {})}]`;}
  private extractEffectsSection(prompt: string): string {
    return `[FX:${this.inferLightingStyle(prompt, {})}:${this.inferColorGrading(prompt, {})}:${this.inferAtmosphericConditions(prompt, {})}]`;}
  private extractFocalSection(prompt: string): string {
    return `!FOCAL[${this.identifyPrimaryFocus(prompt)}]`;}
  // ControlNet mapping methods
  private mapToControlNetPose(prompt: string): string {
    return `pose_estimation: ${this.extractInteractions(prompt, {})}, blocking: ${this.extractPhysicalBlocking(prompt, {})}`;}
  private mapToControlNetDepth(prompt: string): string {
    return `depth_estimation: ${this.inferDepthOfField(prompt, {})}, background_treatment: ${this.inferBackgroundTreatment(prompt, {})}`;}
  private mapToControlNetEdges(prompt: string): string {
    return `edge_detection: canny, style: ${this.inferLightingStyle(prompt, {})}, contrast: ${this.inferColorGrading(prompt, {})}`;}
  private mapToControlNetComposition(prompt: string): string {
    return `composition: ${this.determineVisualHierarchy(prompt, {})}, focus: ${this.identifyPrimaryFocus(prompt)}`;}

// === ZADA NATURAL LANGUAGE GENERATOR ===
class ZadaNaturalLanguageGenerator {
  async generateNaturalLanguageVariants(prompt: string,)
  variables: Record<string, string>,
  targetAudience: 'director' | 'vfx_professional' | 'mixed_crew'): Promise<ZadaNaturalLanguageVariant> {,
  const variants: ZadaNaturalLanguageVariant = [];
  // Screenplay-style variant
  variants.push({)
  variant_id: 'screenplay-v1',
  style: 'screenplay',
  content: this.convertToScreenplayStyle(prompt, variables),
  accessibility_level: 'director',
  human_readable_score: 9,
});
    // Storyboard variant  
    variants.push({)
  variant_id: 'storyboard-v1',
  style: 'storyboard',
  content: this.convertToStoryboardStyle(prompt, variables),
  accessibility_level: 'cinematographer',
  human_readable_score: 8,
});
    // Shot list variant
    variants.push({)
  variant_id: 'shot-list-v1',
  style: 'shot_list',
  content: this.convertToShotListStyle(prompt, variables),
  accessibility_level: 'general_crew',
  human_readable_score: 7,
});
    // Director notes variant
    variants.push({)
  variant_id: 'director-notes-v1',
  style: 'director_note',
  content: this.convertToDirectorNotes(prompt, variables),
  accessibility_level: 'director',
  human_readable_score: 10,
});
    return variants;
  async createDirectorAccessiblePrompt(prompt: string,)
    variables: Record<string, string>
  ): Promise<DirectorAccessiblePrompt> {
  return {
  screenplay_style: this.convertToScreenplayStyle(prompt, variables),
  shot_description: this.createNaturalShotDescription(prompt, variables),
  mood_direction: this.extractMoodDirection(prompt, variables),
  reference_notes: this.generateReferenceNotes(prompt, variables),
  crew_notes: {,
  cinematographer: this.generateCinematographerNotes(prompt, variables),
  lighting_director: this.generateLightingDirectorNotes(prompt, variables),
  vfx_supervisor: this.generateVFXSupervisorNotes(prompt, variables),
};
  private convertToScreenplayStyle(prompt: string, variables: Record<string, string>): string {
    // Convert technical prompt to screenplay format
    const subject = this.extractPrimarySubject(prompt);
    const action = this.extractMainAction(prompt);
    const setting = this.extractSetting(prompt, variables);
    return `FADE IN:
${setting.toUpperCase()}
${this.formatScreenplayAction(subject, action, prompt)}
The shot captures ${this.createNaturalDescription(prompt, variables)}.`;}
  private convertToStoryboardStyle(prompt: string, variables: Record<string, string>): string {
    return `PANEL DESCRIPTION:
Shot Type: ${this.inferShotTypeNaturally(prompt)},}
  Composition: ${this.describeComposition(prompt, variables)},}
  Subject: ${this.describeSubjectNaturally(prompt, variables)},}
  Lighting: ${this.describeLightingNaturally(prompt, variables)},}
  Mood: ${this.extractMoodDirection(prompt, variables)}
VISUAL NOTES:
${this.generateVisualNotes(prompt, variables)}`;}
  private convertToShotListStyle(prompt: string, variables: Record<string, string>): string {
    return `SHOT ${Math.floor(Math.random() * 100) + 1}:}
• Type: ${this.inferShotTypeNaturally(prompt)}
• Subject: ${this.extractPrimarySubject(prompt)}
• Action: ${this.extractMainAction(prompt)}
• Camera: ${this.describeCameraNaturally(prompt, variables)}
• Lighting: ${this.describeLightingNaturally(prompt, variables)}
• Notes: ${this.generateShotNotes(prompt, variables)}`;}
  private convertToDirectorNotes(prompt: string, variables: Record<string, string>): string {
    return `DIRECTOR'S VISION:
${this.createNaturalDescription(prompt, variables)}
CREATIVE INTENT:
${this.extractCreativeIntent(prompt, variables)}
PERFORMANCE NOTES:
${this.generatePerformanceNotes(prompt, variables)}
TECHNICAL CONSIDERATIONS:
${this.generateTechnicalConsiderations(prompt, variables)}`;}
  // Helper methods for natural language generation
  private extractPrimarySubject(prompt: string): string {
    // Extract main subject in natural language
    const subjectPattern = /(?:a|an|the|)\s*([^]+?)(?:\s+(?:in|at|on|with|standing|sitting|walking))/i;
    const match = prompt.match(subjectPattern);
    return match?.[1]?.trim() || 'the character';
  private extractMainAction(prompt: string): string {
    // Extract primary action/verb
    const actionWords = ['walking', 'running', 'sitting', 'standing', 'looking', 'holding', 'talking', 'smiling', 'thinking'];
    const foundAction = actionWords.find(action => ;);
      prompt.toLowerCase().includes(action)
    );
    return foundAction || 'posing naturally';
  private extractSetting(prompt: string, variables: Record<string, string>): string {
    // Extract location/setting
    const locationWords = ['in', 'at', 'on', 'inside', 'outside', 'near'];
    for (const preposition of locationWords) {
      const pattern = new RegExp(`${preposition}\\s+([^,\\.]+)`, 'i');}
      const match = prompt.match(pattern);
      if (match) {
        return match[1].trim();
    // Check variables for location info
    const locationVars = Object.entries(variables).filter(([key]) => ;
      key.toLowerCase().includes('location') || 
      key.toLowerCase().includes('setting') ||
      key.toLowerCase().includes('place')
    );
    if (locationVars.length > 0) {
      return locationVars[0][1];
    return 'INTERIOR - SCENE';
  private formatScreenplayAction(subject: string, action: string, prompt: string): string {
    return `${subject.toUpperCase()} ${action} as we ${this.createCameraDescription(prompt)}.`;}
  private createNaturalDescription(prompt: string, variables: Record<string, string>): string {
    // Create flowing, natural language description
    const subject = this.extractPrimarySubject(prompt);
    const action = this.extractMainAction(prompt);
    const setting = this.extractSetting(prompt, variables);
    const mood = this.extractMoodDirection(prompt, variables);
    return `${subject} ${action} ${setting}. The scene has ${mood} with ${this.describeLightingNaturally(prompt, variables)}.`;}
  private createCameraDescription(prompt: string): string {
    const shotType = this.inferShotTypeNaturally(prompt);
    const movement = this.inferCameraMovementNaturally(prompt);
    if (movement === 'static') {
      return `see ${shotType}`;}
    } else {
      return `${movement} to reveal ${shotType}`;}
  private inferShotTypeNaturally(prompt: string): string {
  const shotTypes = {
  'extreme close-up': ['extreme close', 'macro', 'detail'],
  'close-up': ['close-up', 'close up', 'face', 'portrait'],
  'medium shot': ['medium shot', 'waist up', 'half body'],
  'wide shot': ['wide shot', 'full body', 'establishing'],
  'extreme wide shot': ['extreme wide', 'landscape', 'aerial'],
};
    for (const [naturalName, keywords] of Object.entries(shotTypes)) {
  if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
  return naturalName;
  return 'medium shot';
  private inferCameraMovementNaturally(prompt: string): string {,
  const movements = {
  'pan across to': ['panning', 'pan left', 'pan right'],
  'tilt up to': ['tilting', 'tilt up', 'tilt down'],
  'push in to': ['dolly in', 'pushing in', 'moving closer'],
  'pull back to': ['dolly out', 'pulling back', 'moving away'],
  'zoom in to': ['zoom in', 'zooming in'],
  'zoom out to': ['zoom out', 'zooming out'],
  'handheld camera shows': ['handheld', 'shaky', 'documentary'],
};
    for (const [naturalMovement, keywords] of Object.entries(movements)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        return naturalMovement;
    return 'static';
  private describeComposition(prompt: string, variables: Record<string, string>): string {
    // Describe visual composition in natural terms
    const hierarchy = this.determineVisualHierarchyNaturally(prompt);
    const focus = this.identifyPrimaryFocusNaturally(prompt);
    return `${hierarchy} composition focusing on ${focus}`;}
  private describeSubjectNaturally(prompt: string, variables: Record<string, string>): string {
    const subject = this.extractPrimarySubject(prompt);
    const emotion = this.extractEmotionalStateNaturally(prompt);
    const blocking = this.extractPhysicalBlockingNaturally(prompt);
    return `${subject} appearing ${emotion}, positioned ${blocking}`;}
  private describeLightingNaturally(prompt: string, variables: Record<string, string>): string {
    const style = this.inferLightingStyleNaturally(prompt);
    const mood = this.extractMoodDirection(prompt, variables);
    return `${style} lighting creating ${mood} atmosphere`;}
  private describeCameraNaturally(prompt: string, variables: Record<string, string>): string {
    const angle = this.inferCameraAngleNaturally(prompt);
    const lens = this.inferLensChoiceNaturally(prompt);
    return `${angle} angle, ${lens}`;}
  private generateVisualNotes(prompt: string, variables: Record<string, string>): string {
    return `Key visual elements: ${this.extractKeyVisualElements(prompt, variables).join(', ')}`;}
  private generateShotNotes(prompt: string, variables: Record<string, string>): string {
    return `Focus on ${this.identifyPrimaryFocusNaturally(prompt)}. ${this.extractMoodDirection(prompt, variables)}.`;}
  private createNaturalShotDescription(prompt: string, variables: Record<string, string>): string {
    return `${this.inferShotTypeNaturally(prompt)} of ${this.describeSubjectNaturally(prompt, variables)} with ${this.describeLightingNaturally(prompt, variables)}`;}
  private extractMoodDirection(prompt: string, variables: Record<string, string>): string {
    const moodWords = ['dramatic', 'peaceful', 'intense', 'calm', 'energetic', 'mysterious', 'warm', 'cold'];
    const foundMood = moodWords.find(mood => ;);
      prompt.toLowerCase().includes(mood) ||
      Object.values(variables).some(v => v.toLowerCase().includes(mood))
    );
    return foundMood ? `a ${foundMood} mood` : 'a natural, authentic feel';}
  private generateReferenceNotes(prompt: string, variables: Record<string, string>): string {
    return `Visual style reminiscent of ${this.inferCinematicReferences(prompt)}. Color palette: ${this.inferColorPalette(prompt, variables)}.`;}
  private generateCinematographerNotes(prompt: string, variables: Record<string, string>): string {
    return `Camera: ${this.describeCameraNaturally(prompt, variables)}. Framing: ${this.describeComposition(prompt, variables)}. Movement: ${this.inferCameraMovementNaturally(prompt)}.`;}
  private generateLightingDirectorNotes(prompt: string, variables: Record<string, string>): string {
    return `Lighting approach: ${this.describeLightingNaturally(prompt, variables)}. Key considerations: ${this.extractLightingConsiderations(prompt, variables)}.`;}
  private generateVFXSupervisorNotes(prompt: string, variables: Record<string, string>): string {
    const specialFX = this.extractSpecialEffectsNaturally(prompt, variables);
    return specialFX ? `VFX elements needed: ${specialFX.join(', ')}` : 'No special VFX requirements for this shot.';}
  private extractCreativeIntent(prompt: string, variables: Record<string, string>): string {
    return `The creative goal is to ${this.inferDirectorialIntent(prompt)} while maintaining ${this.extractMoodDirection(prompt, variables)}.`;}
  private generatePerformanceNotes(prompt: string, variables: Record<string, string>): string {
    const emotion = this.extractEmotionalStateNaturally(prompt);
    return `Performance should convey ${emotion}. ${this.extractActionDirection(prompt)}`;}
  private generateTechnicalConsiderations(prompt: string, variables: Record<string, string>): string {
    return `Technical requirements: ${this.extractTechnicalRequirements(prompt, variables).join(', ')}`;}
  // Additional helper methods for natural language generation
  private determineVisualHierarchyNaturally(prompt: string): string {
  if (prompt.toLowerCase().includes('foreground')) return 'Foreground-dominant';
  if (prompt.toLowerCase().includes('background')) return 'Background-focused';
  return 'Balanced';
  private identifyPrimaryFocusNaturally(prompt: string): string {,
  return this.extractPrimarySubject(prompt);
  private extractEmotionalStateNaturally(prompt: string): string {,
  const emotions = ['happy', 'contemplative', 'serious', 'joyful', 'melancholic', 'determined'];
  return emotions.find(emotion => prompt.toLowerCase().includes(emotion)) || 'natural';
  private extractPhysicalBlockingNaturally(prompt: string): string {,
  const positions = ['center frame', 'left of frame', 'right of frame', 'in the foreground'];
  return positions.find(position => prompt.toLowerCase().includes(position.split(' ')[0])) || 'naturally in the scene';
  private inferLightingStyleNaturally(prompt: string): string {,
  const styles = {
  'Soft, natural': ['soft', 'natural', 'gentle'],
  'Dramatic, moody': ['dramatic', 'moody', 'contrast'],
  'Warm, inviting': ['warm', 'golden', 'cozy'],
  'Cool, modern': ['cool', 'blue', 'contemporary'],
};
    for (const [naturalStyle, keywords] of Object.entries(styles)) {
  if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
  return naturalStyle;
  return 'Natural, even';
  private inferCameraAngleNaturally(prompt: string): string {,
  const angles = {
  'Eye-level': ['eye level', 'straight'],
  'Low-angle': ['low angle', 'looking up'],
  'High-angle': ['high angle', 'looking down'],
  'Dutch angle': ['dutch', 'tilted'],
};
    for (const [naturalAngle, keywords] of Object.entries(angles)) {
      if (keywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
        return naturalAngle;
    return 'Eye-level';
  private inferLensChoiceNaturally(prompt: string): string {
    if (prompt.toLowerCase().includes('wide')) return 'wide-angle lens';
    if (prompt.toLowerCase().includes('telephoto') || prompt.toLowerCase().includes('85mm')) return 'portrait lens';
    if (prompt.toLowerCase().includes('50mm')) return 'standard lens';
    return 'natural perspective';
  private extractKeyVisualElements(prompt: string, variables: Record<string, string>): string {
    const elements = [];
    if (prompt.toLowerCase().includes('light')) elements.push('lighting');
    if (prompt.toLowerCase().includes('color')) elements.push('color palette');
    if (prompt.toLowerCase().includes('texture')) elements.push('texture');
    if (prompt.toLowerCase().includes('pattern')) elements.push('patterns');
    return elements.length > 0 ? elements : ['composition', 'lighting', 'subject positioning'];
  private inferCinematicReferences(prompt: string): string {
    // Simple reference inference - could be enhanced with a database
    if (prompt.toLowerCase().includes('dramatic')) return 'classic film noir';
    if (prompt.toLowerCase().includes('warm')) return 'golden hour cinematography';
    if (prompt.toLowerCase().includes('natural')) return 'documentary realism';
    return 'contemporary cinema';
  private inferColorPalette(prompt: string, variables: Record<string, string>): string {
    if (prompt.toLowerCase().includes('warm')) return 'warm tones with golden highlights';
    if (prompt.toLowerCase().includes('cool')) return 'cool blues and teals';
    if (prompt.toLowerCase().includes('muted')) return 'desaturated, natural palette';
    return 'balanced, natural colors';
  private extractLightingConsiderations(prompt: string, variables: Record<string, string>): string {
    return 'natural light sources, avoid harsh shadows, maintain consistent color temperature';
  private extractSpecialEffectsNaturally(prompt: string, variables: Record<string, string>): string | null {
    const fxKeywords = ['explosion', 'fire', 'water effects', 'magical elements', 'sparks', 'energy effects'];
    const foundFX = fxKeywords.filter(fx => ;);
      prompt.toLowerCase().includes(fx.split(' ')[0])
    );
    return foundFX.length > 0 ? foundFX : null;
  private inferDirectorialIntent(prompt: string): string {
    if (prompt.toLowerCase().includes('character')) return 'showcase the character\'s personality';
    if (prompt.toLowerCase().includes('setting')) return 'establish the environment and mood';
    if (prompt.toLowerCase().includes('action')) return 'capture the dynamic movement';
    return 'create a compelling visual narrative';
  private extractActionDirection(prompt: string): string {
    const action = this.extractMainAction(prompt);
    return `Focus on natural ${action} with authentic emotion.`;}
  private extractTechnicalRequirements(prompt: string, variables: Record<string, string>): string {
    const requirements = [];
    if (prompt.toLowerCase().includes('depth')) requirements.push('shallow depth of field');
    if (prompt.toLowerCase().includes('movement')) requirements.push('camera movement');
    if (prompt.toLowerCase().includes('light')) requirements.push('lighting setup');
    return requirements.length > 0 ? requirements : ['standard filming requirements'];

// === HOLLYWOOD SEED MANAGER ===
class HollywoodSeedManager {
  generateHollywoodSeeds(graph: { nodes: Node; edges: Edge }): HollywoodSeedProtocol {
    const masterSeed = Date.now();
    const componentSeeds: Record<string, number> = {};
    // Generate seeds for each node
    graph.nodes.forEach((node, index) => {
      componentSeeds[node.id] = this.hashSeed(`${masterSeed}_${node.id}_${index}`);}
    });
    // Generate iteration seeds (5 variants by default)
    const iterationSeeds = Array.from({ length: 5 }, (_, i) => 
      this.hashSeed(`${masterSeed}_iteration_${i}`)}
    );
    return {
  master_seed: masterSeed,
  component_seeds: componentSeeds,
  iteration_seeds: iterationSeeds,
  reproducibility_checksum: this.generateChecksum(masterSeed, componentSeeds, iterationSeeds),
  version_compatibility: {,
  generator_version: '1.0.0',
  node_version_map: this.extractNodeVersions(graph.nodes),
  schema_version: 'wild-construct-v1',
};
  createIterationHistory(executionResults: any): IterationHistory {
    return [{
      iteration_id: `iter_${Date.now()}`}
},
  timestamp: new Date().toISOString(),
      seed_used: executionResults.seed || Date.now(),
      changes_from_previous: ['Initial generation'],
      approval_status: 'draft' as const;
  }];
  private hashSeed(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    return Math.abs(hash);
  private generateChecksum(masterSeed: number, componentSeeds: Record<string, number>, iterationSeeds: number): string {
    const combined = `${masterSeed}_${JSON.stringify(componentSeeds)}_${iterationSeeds.join('_')}`;}
    return this.hashSeed(combined).toString(16);
  private extractNodeVersions(nodes: Node): Record<string, string> {
    const versions: Record<string, string> = {};
    nodes.forEach(node => {)
  versions[node.id] = node.type ? `${node.type}-v1.0` : 'unknown-v1.0';}
    });
    return versions;

export { HybridPromptExportService, MARSFrameworkExtractor, ZadaNaturalLanguageGenerator, HollywoodSeedManager };
export default HybridPromptExportService;