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
import { Node, Edge } from 'reactflow';

export interface HybridExportFormat extends VFXExportFormat {
    hybridPrompting: {
        mars: {
            framework: 'MARS-v1.0';
            tags: MARSFrameworkTags;
            structured: MARSStructuredPrompt;
        };
        zada: {
            approach: 'screenplay-style';
            variants: ZadaNaturalLanguageVariant[];
            director_friendly: DirectorAccessiblePrompt;
        };
        hollywood: {
            protocol: 'reproducibility-v1';
            seeds: HollywoodSeedProtocol;
            iteration_tracking: IterationHistory[];
        };
    };

export interface MARSFrameworkTags {
    CAM: {
        shot_type: 'ECU' | 'CU' | 'MS' | 'WS' | 'EWS' | 'OTS' | 'POV';
        angle: 'high' | 'eye' | 'low' | 'dutch' | 'aerial';
        movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'zoom' | 'handheld';
        lens: string;
        depth_of_field: 'shallow' | 'deep' | 'rack-focus';
    };
    SUBJ: {
        primary: string;
        secondary?: string;
        interaction: string;
        emotion: string;
        blocking: string;
    };
    FX: {
        lighting: 'natural' | 'dramatic' | 'soft' | 'harsh' | 'practical' | 'motivated';
        color_grade: 'neutral' | 'warm' | 'cool' | 'desaturated' | 'cinematic';
        atmosphere: 'clear' | 'hazy' | 'smoky' | 'foggy' | 'dusty';
        special_fx?: string[];
        post_processing?: string[];
    };
    FOCAL: {
        primary_focus: string;
        secondary_focus?: string;
        background_treatment: 'blur' | 'sharp' | 'silhouette' | 'bokeh';
        visual_hierarchy: 'foreground' | 'midground' | 'background'
  };

export interface MARSStructuredPrompt {
    raw_mars: string;
    parsed_structure: {
        camera_section: string;
        subject_section: string;
        effects_section: string;
        focal_section: string;
    };
    controlnet_mapping: {
        pose_guidance: string;
        depth_hints: string;
        edge_conditions: string;
        composition_rules: string;
    };

export interface ZadaNaturalLanguageVariant {
    variant_id: string;
    style: 'screenplay' | 'storyboard' | 'shot_list' | 'director_note';
    content: string;
    accessibility_level: 'director' | 'cinematographer' | 'general_crew';
    human_readable_score: number;

export interface DirectorAccessiblePrompt {
    screenplay_style: string;
    shot_description: string;
    mood_direction: string;
    reference_notes: string;
    crew_notes: {
        cinematographer: string;
        lighting_director: string;
        vfx_supervisor: string;
    };

export interface HollywoodSeedProtocol {
    master_seed: number;
    component_seeds: Record<string, number>;
    iteration_seeds: number[];
    reproducibility_checksum: string;
    version_compatibility: {
        generator_version: string;
        node_version_map: Record<string, string>;
        schema_version: string;
    };

export interface IterationHistory {
    iteration_id: string;
    timestamp: string;
    seed_used: number;
    changes_from_previous: string[];
    director_notes?: string;
    approval_status: 'draft' | 'review' | 'approved' | 'final';

export declare class HybridPromptExportService {
    private vfxExporter;
    private marsExtractor;
    private zadaGenerator;
    private seedManager;
    constructor();
    /**
     * Export graph with hybrid prompting approach combining all methodologies
     */
    exportHybridPrompt(graph: {)
        nodes: Node[];
        edges: Edge[];
    }, executionResults: {
        finalPrompt: string;
        variables: Record<string, string>;
        executionTime: number;
        nodePerformance?: Record<string, number>;
        variants?: VFXPromptVariant[];
    }, options?: {
        includeMARS: boolean;
        includeZada: boolean;
        includeHollywoodProtocol: boolean;
        quality: 'production' | 'preview' | 'debug';
        targetAudience: 'director' | 'vfx_professional' | 'mixed_crew'
  }): Promise<HybridExportFormat>;
    private buildHybridExtensions;
declare class MARSFrameworkExtractor {
    extractMARSTags(prompt: string, variables: Record<string, string>): Promise<MARSFrameworkTags>;
    createStructuredPrompt(prompt: string): Promise<MARSStructuredPrompt>;
    private extractCameraTags;
    private extractSubjectTags;
    private extractEffectsTags;
    private extractFocalTags;
    private filterCameraVariables;
    private inferShotType;
    private inferCameraAngle;
    private inferCameraMovement;
    private inferLensChoice;
    private inferDepthOfField;
    private extractPrimarySubject;
    private extractSecondarySubjects;
    private extractInteractions;
    private extractEmotionalState;
    private extractPhysicalBlocking;
    private inferLightingStyle;
    private inferColorGrading;
    private inferAtmosphericConditions;
    private extractSpecialEffects;
    private extractPostProcessingEffects;
    private identifyPrimaryFocus;
    private identifySecondaryFocus;
    private inferBackgroundTreatment;
    private determineVisualHierarchy;
    private convertToMARSFormat;
    private extractCameraSection;
    private extractSubjectSection;
    private extractEffectsSection;
    private extractFocalSection;
    private mapToControlNetPose;
    private mapToControlNetDepth;
    private mapToControlNetEdges;
    private mapToControlNetComposition;
declare class ZadaNaturalLanguageGenerator {
    generateNaturalLanguageVariants();
      prompt: string,
      variables: Record<string,
      string>,
      targetAudience: 'director' | 'vfx_professional' | 'mixed_crew',
    ): Promise<ZadaNaturalLanguageVariant[]>;
    createDirectorAccessiblePrompt();
      prompt: string,
      variables: Record<string,
      string>
    ): Promise<DirectorAccessiblePrompt>;
    private convertToScreenplayStyle;
    private convertToStoryboardStyle;
    private convertToShotListStyle;
    private convertToDirectorNotes;
    private extractPrimarySubject;
    private extractMainAction;
    private extractSetting;
    private formatScreenplayAction;
    private createNaturalDescription;
    private createCameraDescription;
    private inferShotTypeNaturally;
    private inferCameraMovementNaturally;
    private describeComposition;
    private describeSubjectNaturally;
    private describeLightingNaturally;
    private describeCameraNaturally;
    private generateVisualNotes;
    private generateShotNotes;
    private createNaturalShotDescription;
    private extractMoodDirection;
    private generateReferenceNotes;
    private generateCinematographerNotes;
    private generateLightingDirectorNotes;
    private generateVFXSupervisorNotes;
    private extractCreativeIntent;
    private generatePerformanceNotes;
    private generateTechnicalConsiderations;
    private determineVisualHierarchyNaturally;
    private identifyPrimaryFocusNaturally;
    private extractEmotionalStateNaturally;
    private extractPhysicalBlockingNaturally;
    private inferLightingStyleNaturally;
    private inferCameraAngleNaturally;
    private inferLensChoiceNaturally;
    private extractKeyVisualElements;
    private inferCinematicReferences;
    private inferColorPalette;
    private extractLightingConsiderations;
    private extractSpecialEffectsNaturally;
    private inferDirectorialIntent;
    private extractActionDirection;
    private extractTechnicalRequirements;
declare class HollywoodSeedManager {
    generateHollywoodSeeds(graph: {)
        nodes: Node[];
        edges: Edge[];
    }): HollywoodSeedProtocol;
    createIterationHistory(executionResults: any): IterationHistory[];
    private hashSeed;
    private generateChecksum;
    private extractNodeVersions;

export { HybridPromptExportService, MARSFrameworkExtractor, ZadaNaturalLanguageGenerator, HollywoodSeedManager };
export default HybridPromptExportService;
//# sourceMappingURL=HybridExportService.d.ts.map