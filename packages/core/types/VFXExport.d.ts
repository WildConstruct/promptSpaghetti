export interface VFXExportFormat {
    metadata: VFXExportMetadata;
    prompt: VFXPromptData;
    graph: VFXGraphStructure;
    execution: VFXExecutionData;
    extensions: VFXExtensions;
    rendering: VFXRenderingData;
}
export interface VFXExportMetadata {
    exportId: string;
    version: string;
    timestamp: string;
    generator: {
        name: "Wild Construct Prompt Generator";
        version: string;
        build: string;
    };
    project: {
        name?: string;
        id?: string;
        scene?: string;
        shot?: string;
    };
    export: {
        format: "vfx-pipeline-v1";
        quality: "production" | "preview" | "debug";
        includeDebugInfo: boolean;
        includeHistoricalData: boolean;
    };
    compatibility: {
        controlNet: boolean;
        diffusionModels: string[];
        animationFramework: boolean;
        billboardProjection: boolean;
    };
}
export interface VFXPromptData {
    finalPrompt: string;
    components: {
        subject: string[];
        action: string[];
        setting: string[];
        mood: string[];
        technical: string[];
        style: string[];
    };
    variables: {
        [variableName: string]: {
            value: string;
            source: "user" | "generated" | "scene_data" | "default";
            alternatives?: string[];
            confidence?: number;
        };
    };
    variants: VFXPromptVariant[];
    negativePrompt?: string;
    weights: {
        overall: number;
        subject: number;
        composition: number;
        style: number;
    };
}
export interface VFXPromptVariant {
    id: string;
    seed: number;
    prompt: string;
    confidence: number;
    metadata: {
        generationTime: number;
        nodesExecuted: number;
        variablesUsed: string[];
    };
}
export interface VFXGraphStructure {
    nodes: VFXGraphNode[];
    connections: VFXGraphConnection[];
    executionPath: string[];
    criticalPath: string[];
    analysis: {
        complexity: "simple" | "moderate" | "complex";
        variabilityScore: number;
        determinismScore: number;
        performanceScore: number;
    };
}
export interface VFXGraphNode {
    id: string;
    type: string;
    label: string;
    category: "input" | "logic" | "transformation" | "output" | "variable";
    purpose: string;
    configuration: Record<string, unknown>;
    executionOrder: number;
    executionTime?: number;
    cacheHit?: boolean;
    dependsOn: string[];
    affects: string[];
    reproducibilityData?: {
        originalPosition: {
            x: number;
            y: number;
        };
        originalSize: {
            width: number;
            height: number;
        };
        creationTimestamp: string;
        lastModified: string;
        configurationHash: string;
    };
}
export interface VFXGraphConnection {
    id: string;
    source: {
        nodeId: string;
        port?: string;
    };
    target: {
        nodeId: string;
        port?: string;
    };
    dataType: "text" | "number" | "boolean" | "array" | "object";
    label?: string;
}
export interface VFXExecutionData {
    randomization: {
        masterSeed: number;
        nodeSeed: {
            [nodeId: string]: number;
        };
        rngState?: string;
        reproducibilityHash?: string;
        nodeRngStates?: {
            [nodeId: string]: {
                seed: number;
                state: string;
                callCount: number;
                lastValue: number;
            };
        };
        executionSequence?: string[];
    };
    performance: {
        totalTime: number;
        nodePerformance: {
            [nodeId: string]: {
                executionTime: number;
                cacheHits: number;
                cacheMisses: number;
            };
        };
        memoryUsage?: number;
    };
    history: {
        iterations: VFXExecutionIteration[];
        modifications: VFXModification[];
    };
    reproduction: {
        environment: {
            nodeVersion: string;
            platform: string;
            locale?: string;
        };
        exactReproduction: boolean;
        approximateReproduction: boolean;
    };
}
export interface VFXExecutionIteration {
    iterationId: string;
    timestamp: string;
    trigger: "user_request" | "auto_refresh" | "variable_change" | "node_change";
    seed: number;
    result: string;
    executionTime: number;
}
export interface VFXModification {
    timestamp: string;
    type: "node_added" | "node_removed" | "node_modified" | "connection_added" | "connection_removed" | "variable_changed";
    nodeId?: string;
    before?: unknown;
    after?: unknown;
    userNote?: string;
}
export interface VFXExtensions {
    controlNet?: {
        pose?: VFXControlNetPose;
        depth?: VFXControlNetDepth;
        canny?: VFXControlNetCanny;
        openpose?: VFXControlNetOpenpose;
    };
    animation?: {
        frameCount?: number;
        fps?: number;
        keyframes?: VFXKeyframe[];
        interpolation?: "linear" | "ease" | "ease-in-out" | "bezier";
    };
    scene3D?: {
        camera?: VFXCameraData;
        lighting?: VFXLightingData;
        environment?: VFXEnvironmentData;
    };
    wildConstruct?: {
        crowdControl?: WildConstructCrowdControl;
        backdrop?: WildConstructBackdrop;
        meteor?: WildConstructMeteor;
        maestro?: WildConstructMaestro;
        utdg?: WildConstructUTDG;
    };
    custom?: {
        [moduleName: string]: unknown;
    };
}
export interface VFXRenderingData {
    resolution: {
        width: number;
        height: number;
        aspectRatio: string;
    };
    camera: {
        fov?: number;
        focal?: number;
        aperture?: number;
        position?: [number, number, number];
        rotation?: [number, number, number];
        target?: [number, number, number];
    };
    lighting: {
        timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night";
        weather?: "clear" | "cloudy" | "overcast" | "stormy" | "foggy" | "snowy";
        mood?: "bright" | "dramatic" | "soft" | "harsh" | "moody" | "ethereal";
        temperature?: number;
        exposure?: number;
    };
    style: {
        filmstock?: "digital" | "35mm" | "16mm" | "super8" | "polaroid";
        colorGrading?: "natural" | "cinematic" | "desaturated" | "vibrant" | "monochrome";
        lensProfile?: string;
        dof?: {
            enabled: boolean;
            focusDistance?: number;
            blurRadius?: number;
        };
    };
    quality: {
        samples?: number;
        denoising?: number;
        sharpness?: number;
        upscaling?: number;
    };
}
export interface VFXControlNetPose {
    enabled: boolean;
    strength: number;
    poseData?: string;
    poseDescription: string;
}
export interface VFXControlNetDepth {
    enabled: boolean;
    strength: number;
    depthMap?: string;
    depthRange: [number, number];
}
export interface VFXControlNetCanny {
    enabled: boolean;
    strength: number;
    threshold: [number, number];
    edgeMap?: string;
}
export interface VFXControlNetOpenpose {
    enabled: boolean;
    strength: number;
    poseKeypoints?: number[][];
    bodyParts: string[];
}
export interface VFXKeyframe {
    frame: number;
    timestamp: number;
    prompt?: string;
    variables?: {
        [key: string]: string;
    };
    camera?: Partial<VFXRenderingData['camera']>;
    lighting?: Partial<VFXRenderingData['lighting']>;
}
export interface VFXCameraData {
    type: "static" | "dolly" | "pan" | "tilt" | "crane" | "handheld" | "steadicam";
    movement?: {
        path: [number, number, number][];
        duration: number;
        easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
    };
}
export interface VFXLightingData {
    setup: "key" | "three-point" | "natural" | "practical" | "studio" | "location";
    sources: {
        type: "key" | "fill" | "rim" | "background" | "practical";
        position: [number, number, number];
        intensity: number;
        color: [number, number, number];
        temperature?: number;
    }[];
}
export interface VFXEnvironmentData {
    type: "indoor" | "outdoor" | "studio" | "location" | "greenscreen";
    conditions: {
        weather?: string;
        timeOfDay?: string;
        season?: "spring" | "summer" | "fall" | "winter";
        atmosphere?: string;
    };
    background?: {
        type: "practical" | "matte_painting" | "3d_environment" | "greenscreen";
        description: string;
        sourceFile?: string;
    };
}
export type VFXExportQuality = "production" | "preview" | "debug";
export interface VFXValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    compatibility: {
        controlNet: boolean;
        animation: boolean;
        rendering: boolean;
        reproducibility?: {
            exact: boolean;
            approximate: boolean;
            configPreserved: boolean;
            weightsPreserved: boolean;
        };
    };
}
export interface VFXExporter {
    exportGraph(graph: any, options: VFXExportOptions): Promise<VFXExportFormat>;
    validateExport(exportData: VFXExportFormat): VFXValidationResult;
    generateDocumentation(exportData: VFXExportFormat): string;
}
export interface VFXExportOptions {
    quality: VFXExportQuality;
    includeDebugInfo?: boolean;
    includeHistoricalData?: boolean;
    includePerformanceData?: boolean;
    includeVariantData?: boolean;
    formatVersion?: string;
    customExtensions?: string[];
}
/**
 * CrowdControl Integration for historically accurate crowd generation
 */
export interface WildConstructCrowdControl {
    enabled: boolean;
    version: string;
    crowdData?: {
        era: {
            name: string;
            period: [number, number];
            region: string[];
        };
        demographics: {
            totalPopulation: number;
            socialClasses: {
                [className: string]: {
                    percentage: number;
                    occupations: string[];
                    clothingStyles: string[];
                };
            };
            ageDistribution: {
                children: number;
                adults: number;
                elderly: number;
            };
            genderRatio: {
                male: number;
                female: number;
            };
        };
        behavior: {
            activities: string[];
            interactions: string[];
            socialMixing: boolean;
            culturalPatterns: string[];
        };
        validation: {
            historicalAccuracy: number;
            constraintViolations: string[];
            suggestions: string[];
        };
    };
    pipeline: {
        format: 'json' | 'xml' | 'csv' | 'maya' | 'blender';
        memoryEstimate: number;
        renderComplexity: 'low' | 'medium' | 'high';
        polyCount: number;
        textureSize: number;
    };
}
/**
 * Backdrop Integration for era-appropriate environments
 */
export interface WildConstructBackdrop {
    enabled: boolean;
    version: string;
    environment?: {
        era: {
            name: string;
            architecturalStyle: string[];
            materials: string[];
            colors: string[];
        };
        location: {
            type: 'urban' | 'rural' | 'interior' | 'natural';
            description: string;
            authenticity: number;
            socialContext: string;
        };
        atmosphere: {
            timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
            season: 'spring' | 'summer' | 'autumn' | 'winter';
            weather: string;
            mood: string;
        };
        assets: {
            buildings: BackdropAsset[];
            props: BackdropAsset[];
            vegetation: BackdropAsset[];
            terrain: BackdropAsset[];
        };
    };
    scene3D: {
        coordinate: [number, number, number];
        scale: [number, number, number];
        lighting: {
            ambientColor: [number, number, number];
            directionalLights: Array<{
                direction: [number, number, number];
                color: [number, number, number];
                intensity: number;
            }>;
        };
    };
}
/**
 * Meteor Integration for period-accurate atmospheric effects
 */
export interface WildConstructMeteor {
    enabled: boolean;
    version: string;
    atmosphere?: {
        era: {
            name: string;
            climateData: string[];
            seasonalPatterns: string[];
        };
        weather: {
            condition: string;
            temperature: number;
            humidity: number;
            windSpeed: number;
            precipitation: number;
            visibility: number;
        };
        effects: {
            particles: Array<{
                type: 'rain' | 'snow' | 'fog' | 'dust' | 'smoke' | 'mist';
                density: number;
                size: number;
                velocity: [number, number, number];
                color: [number, number, number, number];
            }>;
            volumetrics: {
                enabled: boolean;
                scattering: number;
                absorption: number;
            };
        };
        historicalAccuracy: {
            score: number;
            factors: string[];
            references: string[];
        };
    };
}
/**
 * Maestro Integration for scene orchestration
 */
export interface WildConstructMaestro {
    enabled: boolean;
    version: string;
    orchestration?: {
        sceneComposition: {
            foreground: string[];
            midground: string[];
            background: string[];
            depth: number;
        };
        timing: {
            duration: number;
            keyMoments: Array<{
                time: number;
                event: string;
                priority: 'high' | 'medium' | 'low';
            }>;
        };
        coordination: {
            crowdControl: boolean;
            backdrop: boolean;
            meteor: boolean;
            dependencies: string[];
        };
        historicalContext: {
            narrative: string;
            culturalSignificance: string;
            historicalEvents: string[];
            accuracy: number;
        };
    };
    rendering: {
        renderOrder: string[];
        compositing: {
            layers: string[];
            blendModes: string[];
            masks: string[];
        };
        postProcessing: {
            colorGrading: boolean;
            filmGrain: boolean;
            vignette: boolean;
            historicalFilmLook: string;
        };
    };
}
/**
 * UTDG (Universal Texture Description Graph) Integration
 */
export interface WildConstructUTDG {
    enabled: boolean;
    version: string;
    graph?: {
        nodes: UTDGNode[];
        connections: UTDGConnection[];
        metadata: UTDGMetadata;
    };
    historical: {
        era: {
            name: string;
            period: [number, number];
            regions: string[];
            accuracy: 'high' | 'medium' | 'creative';
        };
        constraints: Array<{
            type: 'temporal' | 'regional' | 'social' | 'technical';
            rule: string;
            enforcement: 'strict' | 'warning' | 'suggestion';
            context: string;
        }>;
        validation: {
            overallScore: number;
            violations: Array<{
                severity: 'error' | 'warning' | 'info';
                message: string;
                suggestions: string[];
            }>;
        };
    };
    dataSources: Array<{
        id: string;
        name: string;
        type: 'museum' | 'academic' | 'archaeological' | 'specialist';
        url?: string;
        reliability: number;
        coverage: string[];
    }>;
    vfxMetadata: {
        textureCategories: string[];
        materialProperties: Array<{
            name: string;
            values: Record<string, unknown>;
            historicalBasis: string;
        }>;
        compatibilityFlags: {
            maya: boolean;
            blender: boolean;
            houdini: boolean;
            unreal: boolean;
            unity: boolean;
        };
    };
}
export interface BackdropAsset {
    id: string;
    name: string;
    type: string;
    historicalPeriod: string;
    authenticity: number;
    materials: string[];
    dimensions?: [number, number, number];
    position?: [number, number, number];
    rotation?: [number, number, number];
}
export interface UTDGNode {
    id: string;
    type: 'material' | 'texture' | 'pattern' | 'style' | 'composite';
    content: string;
    historicalData: {
        era: string;
        region: string[];
        authenticity: number;
        source: string;
        tags: string[];
    };
    relationships: {
        compatible: string[];
        incompatible: string[];
        variations: string[];
    };
    vfxProperties: {
        roughness?: number;
        metallic?: number;
        normal?: string;
        albedo?: [number, number, number];
        emission?: [number, number, number];
    };
}
export interface UTDGConnection {
    id: string;
    source: string;
    target: string;
    relationship: 'enhances' | 'conflicts' | 'requires' | 'modifies';
    strength: number;
    historicalBasis: string;
}
export interface UTDGMetadata {
    creationDate: string;
    lastModified: string;
    accuracy: number;
    complexity: 'simple' | 'moderate' | 'complex';
    historicalPeriods: string[];
    regions: string[];
    dataProvenance: string[];
}
//# sourceMappingURL=VFXExport.d.ts.map