/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Features
 * 
 * Professional film industry collaboration system for prompt methodology
 * development, MARS-structured workflows, and VFX pipeline integration.
 */
import { EventEmitter } from 'events';

export type FilmIndustryRole = 
  | 'director' 
  | 'vfx_supervisor' 
  | 'pipeline_td' 
  | 'vfx_artist' 
  | 'cinematographer'
  | 'producer'
  | 'script_supervisor';

export type PromptingMethodology = 'zada' | 'mars' | 'hybrid' | 'custom';

export type MARSZoneType = 
  | 'camera' 
  | 'subject' 
  | 'effects' 
  | 'focal' 
  | 'lighting'
  | 'composition'
  | 'post_processing';


export interface FilmIndustryUser { id: string;
  name: string;
  role: FilmIndustryRole;
  department: string;
  permissions: string;
  isOnline: boolean;
  currentSession?: string }



export interface MARSRegionTemplate { id: string;
  zoneType: MARSZoneType;
  title: string;
  description: string;
  color: string;
  tags: string;
  defaultNodes: string;
  vfxCompatible: boolean;
  marsParameters: { }
  category: string;
  subcategory: string;
  controlNetMapping?: string;


};


export interface ZadaPromptPattern { id: string;
  name: string;
  description: string;
  pattern: string;
  methodology: PromptingMethodology;
  filmGenre: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  elements: { }
  timeAndSetting: string;
  actions: string;
  locations: string;
  characters: string;
  cinematography: string;


};
  accessibility: { ,
  directorFriendly: boolean;
  technicalLevel: number; // 1-10,
  humanReadableScore: number; // 1-10 }
};


export interface PromptingMethodologySession { sessionId: string;
  title: string;
  methodology: PromptingMethodology;
  participants: FilmIndustryUser;
  currentPattern: ZadaPromptPattern | null }
  marsRegions: MARSRegionTemplate;
  collaborativeEdits: MethodologyEdit;
  vfxExportConfig: VFXPipelineConfig;
  createdAt: Date;
  lastModified: Date;




export interface MethodologyEdit { id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  type: 'pattern_edit' | 'mars_region_add' | 'zada_element_edit' | 'vfx_config_update' }
  data: any;
  conflictResolution?: string;




export interface VFXPipelineConfig { includeAnnotations: boolean;
  includeMarsStructure: boolean;
  includeZadaPatterns: boolean;
  exportFormat: 'controlnet' | 'stable_diffusion' | 'custom_pipeline';
  targetSoftware: string;
  pipelineMetadata: { }
  project: string;
  sequence: string;
  shot: string;
  version: string;


};


export interface FilmIndustryWorkflowTemplate { id: string;
  name: string;
  description: string;
  targetRole: FilmIndustryRole;
  methodology: PromptingMethodology;
  phases: WorkflowPhase;
  marsZones: MARSZoneType;
  zadaElements: string;
  estimatedDuration: number; // minutes;
  complexity: 'simple' | 'intermediate' | 'advanced' }




export interface WorkflowPhase { id: string;
  name: string;
  description: string;
  duration: number;
  requiredRoles: FilmIndustryRole;
  deliverables: string;
  methodology: PromptingMethodology;
  marsConfiguration?: MARSRegionTemplate;
  zadaPattern?: ZadaPromptPattern }



export interface CollaborationComment { id: string;
  userId: string;
  userName: string;
  role: FilmIndustryRole;
  timestamp: Date;
  content: string;
  type: 'general' | 'technical' | 'creative' | 'retake_needed' | 'client_feedback' | 'pipeline_note' }
  targetType: 'pattern' | 'mars_region' | 'zada_element' | 'vfx_config';
  targetId: string;
  resolved: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  /**
  * Advanced Prompting Collaboration Service for Film Industry Teams
  *
  * Provides sophisticated collaboration tools for film industry professionals
  * working with AI prompt generation, combining MARS framework, Zada natural
  * language patterns, and VFX pipeline integration.
  */


export class AdvancedPromptingCollaborationService extends EventEmitter { private sessions: Map<string, PromptingMethodologySession> = new Map();
  private users: Map<string, FilmIndustryUser> = new Map();
  private templates: Map<string, FilmIndustryWorkflowTemplate> = new Map();
  private marsRegionTemplates: Map<string, MARSRegionTemplate> = new Map();
  private zadaPatterns: Map<string, ZadaPromptPattern> = new Map();
  constructor() {
  super();
  this.initializeDefaults();
  private initializeDefaults(): void {
  // Initialize MARS region templates
  this.initializeMARSRegionTemplates();
  // Initialize Zada prompt patterns
  this.initializeZadaPromptPatterns();
  // Initialize film industry workflow templates
  this.initializeWorkflowTemplates();
  private initializeMARSRegionTemplates(): void {
  const marsTemplates: MARSRegionTemplate = [
  {
  id: 'mars-camera-zone'
  zoneType: 'camera'
  title: '📹 Camera Zone'
  description: 'Camera work, angles, movements, and lens specifications'
  color: '#3b82f6'
  tags: ['[CAM]', 'cinematography', 'shots']
  defaultNodes: ['shot_type', 'camera_angle', 'lens_choice']
  vfxCompatible: true
  marsParameters: {
  category: 'CAM'
  subcategory: 'camera_work'
  controlNetMapping: 'pose_guidance' }

      { id: 'mars-subject-zone'
  zoneType: 'subject'
  title: '👥 Subject Zone'
  description: 'Characters, actors, subjects, and their interactions'
  color: '#10b981'
  tags: ['[SUBJ]', 'characters', 'actors']
  defaultNodes: ['primary_subject', 'secondary_subjects', 'interactions']
  vfxCompatible: true
  marsParameters: {
  category: 'SUBJ'
  subcategory: 'character_work'
  controlNetMapping: 'depth_maps' }

      { id: 'mars-effects-zone'
  zoneType: 'effects'
  title: '✨ Effects Zone'
  description: 'Lighting, color grading, special effects, and atmosphere'
  color: '#8b5cf6'
  tags: ['[FX]', 'lighting', 'effects']
  defaultNodes: ['lighting_setup', 'color_grade', 'special_fx']
  vfxCompatible: true
  marsParameters: {
  category: 'FX'
  subcategory: 'visual_effects'
  controlNetMapping: 'edge_detection' }

      { id: 'mars-focal-zone'
  zoneType: 'focal'
  title: '🎯 Focal Zone'
  description: 'Focus points, visual hierarchy, and attention direction'
  color: '#f59e0b'
  tags: ['!FOCAL', 'focus', 'attention']
  defaultNodes: ['primary_focus', 'secondary_focus', 'background']
  vfxCompatible: true
  marsParameters: {
  category: 'FOCAL'
  subcategory: 'focus_control' }
  controlNetMapping: 'depth_hints'];
  marsTemplates.forEach(template => { )
  this.marsRegionTemplates.set(template.id, template) });
  private initializeZadaPromptPatterns(): void { const zadaPatterns: ZadaPromptPattern = [
      {
        id: 'zada-dialogue-scene'
        name: 'Dialogue Scene Pattern'
        description: 'Natural language pattern for character dialogue scenes' }
        pattern: 'In a {timeAndSetting}, {characters} engage in {actions} while {cinematography} captures the emotional depth of their {locations}'
        methodology: 'zada'
        filmGenre: ['drama', 'thriller', 'romance']
        complexity: 'intermediate'
        elements: { 
  timeAndSetting: 'modern office during lunch break'
  actions: 'discussing a critical business decision'
  locations: 'conference room with city skyline view'
  characters: 'two executives with conflicting perspectives'
  cinematography: 'close-up shots alternating with wide establishing shots' }

  accessibility: { 
  directorFriendly: true
  technicalLevel: 3
  humanReadableScore: 9 }

      { id: 'zada-action-sequence'
        name: 'Action Sequence Pattern'
        description: 'High-energy action scenes with dynamic camera work' }
        pattern: '{cinematography} follows {characters} as they {actions} through {locations}, with {timeAndSetting} creating urgency'
        methodology: 'zada'
        filmGenre: ['action', 'thriller', 'sci-fi']
        complexity: 'advanced'
        elements: { 
  timeAndSetting: 'nighttime during a thunderstorm'
  actions: 'chase through crowded market streets'
  locations: 'narrow alleyways and rooftops'
  characters: 'protagonist being pursued by antagonists'
  cinematography: 'handheld camera with rapid cuts and dynamic angles' }

  accessibility: { 
  directorFriendly: true
  technicalLevel: 4
  humanReadableScore: 8 }

      { id: 'zada-mars-hybrid'
        name: 'Hybrid MARS-Zada Pattern'
        description: 'Combines natural language accessibility with technical precision' }
        pattern: '[CAM:{cinematography}] captures {characters} in {locations} as they {actions} during {timeAndSetting} [FX:atmospheric-enhancement] !FOCAL[primary-subject]'
        methodology: 'hybrid'
        filmGenre: ['sci-fi', 'fantasy', 'drama']
        complexity: 'advanced'
        elements: { 
  timeAndSetting: 'golden hour in futuristic cityscape'
  actions: 'make a crucial discovery about their mission'
  locations: 'high-tech laboratory with panoramic windows'
  characters: 'research team led by brilliant scientist'
  cinematography: 'smooth dolly movement with lens flares' }

  accessibility: { 
  directorFriendly: true
  technicalLevel: 7 }
  humanReadableScore: 6];
  zadaPatterns.forEach(pattern => { )
  this.zadaPatterns.set(pattern.id, pattern) });
  private initializeWorkflowTemplates(): void { const workflows: FilmIndustryWorkflowTemplate = [
  {
  id: 'pre-viz-collaboration'
  name: 'Pre-Visualization Collaboration'
  description: 'Director and VFX team collaborative pre-visualization workflow'
  targetRole: 'director'
  methodology: 'hybrid'
  phases: [
  {
  id: 'creative-brief'
  name: 'Creative Brief Development'
  description: 'Director creates initial creative vision using natural language'
  duration: 30
  requiredRoles: ['director']
  deliverables: ['creative_brief', 'zada_patterns']
  methodology: 'zada' }

          { id: 'technical-translation'
  name: 'Technical Translation'
  description: 'VFX supervisor translates creative brief into MARS structure'
  duration: 45
  requiredRoles: ['vfx_supervisor', 'pipeline_td']
  deliverables: ['mars_regions', 'technical_specs']
  methodology: 'mars' }

          { id: 'collaborative-refinement'
  name: 'Collaborative Refinement'
  description: 'Team works together to refine hybrid approach'
  duration: 60
  requiredRoles: ['director', 'vfx_supervisor', 'cinematographer']
  deliverables: ['hybrid_patterns', 'approved_methodology']
  methodology: 'hybrid']
  marsZones: ['camera', 'subject', 'effects', 'focal']
  zadaElements: ['timeAndSetting', 'characters', 'actions', 'cinematography']
  estimatedDuration: 135 }
  complexity: 'advanced'];
  workflows.forEach(workflow => { )
  this.templates.set(workflow.id, workflow) });
  // Session Management
  async createCollaborationSession(title: string)
  methodology: PromptingMethodology
    creatorId: string): Promise<PromptingMethodologySession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const creator = this.users.get(creatorId);
    const session: PromptingMethodologySession = { sessionId
  title
  methodology
  participants: creator ? [creator] : []
  currentPattern: null
  marsRegions: Array.from(this.marsRegionTemplates.values())
  collaborativeEdits: []
  vfxExportConfig: {
  includeAnnotations: true
  includeMarsStructure: methodology === 'mars' || methodology === 'hybrid'
  includeZadaPatterns: methodology === 'zada' || methodology === 'hybrid'
  exportFormat: 'controlnet'
  targetSoftware: ['Houdini', 'Maya', 'Nuke']
  pipelineMetadata: {
  project: 'Wild Construct Demo'
  sequence: 'SEQ_001'
  shot: 'SHOT_001'
  version: '001' }

  createdAt: new Date()
      lastModified: new Date();
  };
    this.sessions.set(sessionId, session);
    this.emit('session_created', session);
    return session;
  async joinCollaborationSession(sessionId: string, userId: string): Promise<boolean> {

    const session = this.sessions.get(sessionId);
    const user = this.users.get(userId);
    if (!session || !user) {
      return false;
    // Check if user is already in session
    if (!session.participants.some(p => p.id === userId)) {
      session.participants.push(user);
      session.lastModified = new Date();
      this.emit('user_joined', { sessionId, user });
    return true;
  // Pattern Management
  async createZadaPattern(sessionId: string)
  userId: string
    patternData: Partial<ZadaPromptPattern>): Promise<ZadaPromptPattern> { 
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    const pattern: ZadaPromptPattern = { }
  id: `zada_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}

  name: patternData.name || 'New Zada Pattern'
      description: patternData.description || ''
      pattern: patternData.pattern || ''
      methodology: 'zada'
      filmGenre: patternData.filmGenre || ['general']
      complexity: patternData.complexity || 'simple'
      elements: patternData.elements || { 
  timeAndSetting: ''
  actions: ''
  locations: ''
  characters: ''
  cinematography: '' }

  accessibility: patternData.accessibility || { 
  directorFriendly: true
  technicalLevel: 1
  humanReadableScore: 8 }
};
    this.zadaPatterns.set(pattern.id, pattern);
    // Record collaborative edit
    const edit: MethodologyEdit = {
  id: `edit_${Date.now()}`}

      sessionId
      userId
      timestamp: new Date()
      type: 'pattern_edit'
      data: pattern;
  };
    session.collaborativeEdits.push(edit);
    session.lastModified = new Date();
    this.emit('zada_pattern_created', { sessionId, pattern, userId });
    return pattern;
  async createMARSRegion(sessionId: string)
  userId: string
    regionData: Partial<MARSRegionTemplate>): Promise<MARSRegionTemplate> { 
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    const region: MARSRegionTemplate = { }
  id: `mars_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`}

  zoneType: regionData.zoneType || 'effects'
      title: regionData.title || 'New MARS Zone'
      description: regionData.description || ''
      color: regionData.color || '#6b7280'
      tags: regionData.tags || []
      defaultNodes: regionData.defaultNodes || []
      vfxCompatible: regionData.vfxCompatible !== false
      marsParameters: regionData.marsParameters || { 
  category: 'CUSTOM'
  subcategory: 'user_defined' }
};
    this.marsRegionTemplates.set(region.id, region);
    session.marsRegions.push(region);
    // Record collaborative edit
    const edit: MethodologyEdit = {
  id: `edit_${Date.now()}`}

      sessionId
      userId
      timestamp: new Date()
      type: 'mars_region_add'
      data: region;
  };
    session.collaborativeEdits.push(edit);
    session.lastModified = new Date();
    this.emit('mars_region_created', { sessionId, region, userId });
    return region;
  // VFX Pipeline Integration
  async generateVFXExport(sessionId: string, userId: string): Promise<any> { const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    const vfxExport = {
      metadata: { }
  exportId: `vfx_${Date.now()}`}

        sessionId
        exportedBy: userId
        timestamp: new Date().toISOString()
        methodology: session.methodology
        pipelineConfig: session.vfxExportConfig

  marsStructure: session.vfxExportConfig.includeMarsStructure ? { 
  regions: session.marsRegions.map(region => ({)
  id: region.id
  type: region.zoneType
  marsCategory: region.marsParameters.category
  controlNetMapping: region.marsParameters.controlNetMapping
  nodes: region.defaultNodes
  vfxMetadata: {
  compatible: region.vfxCompatible
  tags: region.tags
  color: region.color }
}))
 : null
      zadaPatterns: session.vfxExportConfig.includeZadaPatterns ? { 
  currentPattern: session.currentPattern
  availablePatterns: Array.from(this.zadaPatterns.values()) }
  .filter(p => p.methodology === 'zada' || p.methodology === 'hybrid')
 : null
      annotations: session.vfxExportConfig.includeAnnotations ? { 
  collaborativeEdits: session.collaborativeEdits
  participants: session.participants.map(p => ({)
  id: p.id
  name: p.name
  role: p.role
  department: p.department }
}))
 : null
      pipelineIntegration: { 
  targetSoftware: session.vfxExportConfig.targetSoftware
  exportFormat: session.vfxExportConfig.exportFormat
  compatibilityNotes: [
  'MARS regions map to ControlNet parameters'
  'Zada patterns provide human-readable context' }
  'Collaborative edits include version history'
  ]
};
    this.emit('vfx_export_generated', { sessionId, vfxExport, userId });
    return vfxExport;
  // User Management
  registerUser(user: FilmIndustryUser): void {
    this.users.set(user.id, user);
    this.emit('user_registered', user);
  getUsersByRole(role: FilmIndustryRole): FilmIndustryUser {
    return Array.from(this.users.values()).filter(user => user.role === role);
  // Template Management
  getWorkflowTemplates(targetRole?: FilmIndustryRole): FilmIndustryWorkflowTemplate {
    const templates = Array.from(this.templates.values());
    return targetRole 
      ? templates.filter(t => t.targetRole === targetRole)
      : templates;
  getMARSRegionTemplates(zoneType?: MARSZoneType): MARSRegionTemplate {
    const templates = Array.from(this.marsRegionTemplates.values());
    return zoneType 
      ? templates.filter(t => t.zoneType === zoneType)
      : templates;
  getZadaPatterns(methodology?: PromptingMethodology): ZadaPromptPattern {
    const patterns = Array.from(this.zadaPatterns.values());
    return methodology 
      ? patterns.filter(p => p.methodology === methodology)
      : patterns;
  // Session Queries
  getActiveSessions(): PromptingMethodologySession {
    return Array.from(this.sessions.values());
  getSessionById(sessionId: string): PromptingMethodologySession | undefined {
    return this.sessions.get(sessionId);
  getUserSessions(userId: string): PromptingMethodologySession {
    return Array.from(this.sessions.values())
      .filter(session => session.participants.some(p => p.id === userId));