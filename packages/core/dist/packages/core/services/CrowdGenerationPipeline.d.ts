/**
 * Data Pipeline for Crowd Generation System
 * Enables historically accurate crowd generation for Wild Construct CrowdControl integration
 */
import { HistoricalItem, Era, ValidationResult } from '../types/UTDG';
import { VFXPipelineMetadata } from '../types/VFXExport';
export interface CrowdGenerationRequest {
    scene: {
        era: Era;
        region: string;
        location: string;
        timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
        season: 'spring' | 'summer' | 'autumn' | 'winter';
    };
    crowd: {
        size: number;
        density: 'sparse' | 'moderate' | 'dense';
        demographics: CrowdDemographics;
        activity: CrowdActivity;
    };
    constraints: {
        historicalAccuracy: 'strict' | 'moderate' | 'creative';
        socialMixing: boolean;
        genderMixing: boolean;
        culturalSensitivity: boolean;
    };
    output: {
        format: 'json' | 'xml' | 'csv';
        includeMetadata: boolean;
        vfxPipeline: VFXPipelineMetadata;
    };
}
export interface CrowdDemographics {
    socialClasses: {
        peasant: number;
        artisan: number;
        merchant: number;
        noble: number;
        clergy: number;
        royal: number;
    };
    ageDistribution: {
        children: number;
        youth: number;
        adults: number;
        elderly: number;
    };
    genderRatio: {
        male: number;
        female: number;
        nonBinary?: number;
    };
}
export interface CrowdActivity {
    primary: string;
    secondary: string;
    mood: 'festive' | 'solemn' | 'busy' | 'tense' | 'peaceful';
    interactions: InteractionType;
}
export interface InteractionType {
    type: 'trading' | 'conversation' | 'ceremony' | 'performance' | 'labor';
    participants: string;
    frequency: 'rare' | 'occasional' | 'common';
}
export interface CrowdGenerationResult {
    individuals: CrowdIndividual;
    groups: CrowdGroup;
    interactions: CrowdInteraction;
    validation: ValidationResult;
    metadata: CrowdMetadata;
}
export interface CrowdIndividual {
    id: string;
    demographics: {
        age: number;
        gender: 'male' | 'female';
        socialClass: string;
        occupation: string;
    };
    appearance: {
        clothing: HistoricalItem;
        accessories: HistoricalItem;
        physicalTraits: string;
    };
    behavior: {
        activity: string;
        posture: string;
        movement: string;
        interactions: string;
    };
    position: {
        x: number;
        y: number;
        z: number;
        facing: number;
    };
    historicalAccuracy: number;
}
export interface CrowdGroup {
    id: string;
    type: 'family' | 'guild' | 'religious' | 'merchant' | 'nobility';
    members: string;
    activity: string;
    formation: 'circle' | 'line' | 'cluster' | 'processional';
    relationship: string;
}
export interface CrowdInteraction {
    id: string;
    type: InteractionType['type'];
    participants: string;
    duration: number;
    intensity: 'subtle' | 'moderate' | 'prominent';
    historicalContext: string;
}
export interface CrowdMetadata {
    generation: {
        timestamp: string;
        processingTime: number;
        algorithm: string;
        version: string;
    };
    validation: {
        overallAccuracy: number;
        constraintViolations: number;
        historicalConsistency: number;
    };
    vfx: {
        renderComplexity: 'low' | 'medium' | 'high';
        memoryEstimate: number;
        polyCount: number;
        textureSize: number;
    };
}
export declare class CrowdGenerationPipeline {
    private historicalDataService;
    private constraintValidator;
    private clothingGenerator;
    private behaviorEngine;
    private vfxExporter;
    constructor();
    historicalDataService: HistoricalDataService;
    constraintValidator: ConstraintValidator;
    clothingGenerator: HistoricalClothingGenerator;
    behaviorEngine: CrowdBehaviorEngine;
    vfxExporter: VFXExporter;
}
//# sourceMappingURL=CrowdGenerationPipeline.d.ts.map