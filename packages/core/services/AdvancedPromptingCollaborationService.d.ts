/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Features
 *
 * Professional film industry collaboration system for prompt methodology
 * development, MARS-structured workflows, and VFX pipeline integration.
 */
import { EventEmitter } from 'events';
export type FilmIndustryRole = 'director' | 'vfx_supervisor' | 'pipeline_td' | 'vfx_artist' | 'cinematographer' | 'producer' | 'script_supervisor';
export type PromptingMethodology = 'zada' | 'mars' | 'hybrid' | 'custom';
export type MARSZoneType = 'camera' | 'subject' | 'effects' | 'focal' | 'lighting' | 'composition' | 'post_processing';

export interface FilmIndustryUser {
    id: string;
    name: string;
    role: FilmIndustryRole;
    department: string;
    permissions: string[];
    isOnline: boolean;
    currentSession?: string;

export interface MARSRegionTemplate {
    id: string;
    zoneType: MARSZoneType;
    title: string;
    description: string;
    color: string;
    tags: string[];
    defaultNodes: string[];
    vfxCompatible: boolean;
    marsParameters: {,
        category: string;
        subcategory: string;
        controlNetMapping?: string;
    };

export interface ZadaPromptPattern {
    id: string;
    name: string;
    description: string;
    pattern: string;
    methodology: PromptingMethodology;
    filmGenre: string[];
    complexity: 'simple' | 'intermediate' | 'advanced';
    elements: {,
        timeAndSetting: string;
        actions: string;
        locations: string;
        characters: string;
        cinematography: string;
    };
    accessibility: {,
        directorFriendly: boolean;
        technicalLevel: number;
        humanReadableScore: number;
    };

export interface PromptingMethodologySession {
    sessionId: string;
    title: string;
    methodology: PromptingMethodology;
    participants: FilmIndustryUser[];
    currentPattern: ZadaPromptPattern | null;
    marsRegions: MARSRegionTemplate[];
    collaborativeEdits: MethodologyEdit[];
    vfxExportConfig: VFXPipelineConfig;
    createdAt: Date;
    lastModified: Date;

export interface MethodologyEdit {
    id: string;
    sessionId: string;
    userId: string;
    timestamp: Date;
    type: 'pattern_edit' | 'mars_region_add' | 'zada_element_edit' | 'vfx_config_update';
    data: any;
    conflictResolution?: string;

export interface VFXPipelineConfig {
    includeAnnotations: boolean;
    includeMarsStructure: boolean;
    includeZadaPatterns: boolean;
    exportFormat: 'controlnet' | 'stable_diffusion' | 'custom_pipeline';
    targetSoftware: string[];
    pipelineMetadata: {,
        project: string;
        sequence: string;
        shot: string;
        version: string;
    };

export interface FilmIndustryWorkflowTemplate {
    id: string;
    name: string;
    description: string;
    targetRole: FilmIndustryRole;
    methodology: PromptingMethodology;
    phases: WorkflowPhase[];
    marsZones: MARSZoneType[];
    zadaElements: string[];
    estimatedDuration: number;
    complexity: 'simple' | 'intermediate' | 'advanced';

export interface WorkflowPhase {
    id: string;
    name: string;
    description: string;
    duration: number;
    requiredRoles: FilmIndustryRole[];
    deliverables: string[];
    methodology: PromptingMethodology;
    marsConfiguration?: MARSRegionTemplate[];
    zadaPattern?: ZadaPromptPattern;

export interface CollaborationComment {
    id: string;
    userId: string;
    userName: string;
    role: FilmIndustryRole;
    timestamp: Date;
    content: string;
    type: 'general' | 'technical' | 'creative' | 'retake_needed' | 'client_feedback' | 'pipeline_note';
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
export declare class AdvancedPromptingCollaborationService extends EventEmitter {
    private sessions;
    private users;
    private templates;
    private marsRegionTemplates;
    private zadaPatterns;
    constructor();
    private initializeDefaults;
    private initializeMARSRegionTemplates;
    private initializeZadaPromptPatterns;
    private initializeWorkflowTemplates;
    createCollaborationSession();
      title: string,
      methodology: PromptingMethodology,
      creatorId: string,
    ): Promise<PromptingMethodologySession>;
    joinCollaborationSession(sessionId: string, userId: string): Promise<boolean>;
    createZadaPattern();
      sessionId: string,
      userId: string,
      patternData: Partial<ZadaPromptPattern>,
    ): Promise<ZadaPromptPattern>;
    createMARSRegion();
      sessionId: string,
      userId: string,
      regionData: Partial<MARSRegionTemplate>,
    ): Promise<MARSRegionTemplate>;
    generateVFXExport(sessionId: string, userId: string): Promise<any>;
    registerUser(user: FilmIndustryUser): void;
    getUsersByRole(role: FilmIndustryRole): FilmIndustryUser[];
    getWorkflowTemplates(targetRole?: FilmIndustryRole): FilmIndustryWorkflowTemplate[];
    getMARSRegionTemplates(zoneType?: MARSZoneType): MARSRegionTemplate[];
    getZadaPatterns(methodology?: PromptingMethodology): ZadaPromptPattern[];
    getActiveSessions(): PromptingMethodologySession[];
    getSessionById(sessionId: string): PromptingMethodologySession | undefined;
    getUserSessions(userId: string): PromptingMethodologySession[];

//# sourceMappingURL=AdvancedPromptingCollaborationService.d.ts.map