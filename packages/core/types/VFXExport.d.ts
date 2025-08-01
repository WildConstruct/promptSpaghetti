export interface VFXExportFormat { metadata: VFXExportMetadata;
    prompt: VFXPromptData;
    graph: VFXGraphStructure;
    execution: VFXExecutionData;
    extensions: VFXExtensions;
    rendering: VFXRenderingData }
}
}
export interface VFXExportMetadata { exportId: string;
    version: string;
    timestamp: string;
    generator: {
        name: 'Wild Construct Prompt Generator';
        version: string;
        build: string }
}
    };
    project: { name?: string;
        id?: string;
        scene?: string;
        shot?: string };
    export: { format: 'vfx-pipeline-v1';
        quality: 'production' | 'preview' | 'debug';
        includeDebugInfo: boolean;
        includeHistoricalData: boolean };
    compatibility: { controlNet: boolean;
        diffusionModels: string[];
        animationFramework: boolean;
        billboardProjection: boolean };

}
}
export interface VFXPromptData { finalPrompt: string;
    components: {
        subject: string[];
        action: string[];
        setting: string[];
        mood: string[];
        technical: string[];
        style: string[] }
}
    };
    variables: { [variableName: string]: {
            value: string;
            source: 'user' | 'generated' | 'scene_data' | 'default';
            alternatives?: string[];
            confidence?: number };
    };
    variants: VFXPromptVariant[];
    negativePrompt?: string;
    weights: { overall: number;
        subject: number;
        composition: number;
        style: number };
    mars?: VFXMARSStructure;
    zadaVariants?: VFXZadaVariant[];
    hollywoodProtocol?: VFXHollywoodProtocol;
    humanReadable?: VFXHumanReadableLayer;
    controlNetTags?: VFXControlNetTags;

}
}
export interface VFXPromptVariant { id: string;
    seed: number;
    prompt: string;
    confidence: number;
    metadata: {
        generationTime: number;
        nodesExecuted: number;
        variablesUsed: string[] }
}
    };

}
}
export interface VFXGraphStructure { nodes: VFXGraphNode[];
    connections: VFXGraphConnection[];
    executionPath: string[];
    criticalPath: string[];
    analysis: {
        complexity: 'simple' | 'moderate' | 'complex';
        variabilityScore: number;
        determinismScore: number;
        performanceScore: number }
}
    };

}
}
export interface VFXGraphNode { id: string;
    type: string;
    label: string;
    category: 'input' | 'logic' | 'transformation' | 'output' | 'variable';
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
            y: number }
}
        };
        originalSize: { width: number;
            height: number };
        creationTimestamp: string;
        lastModified: string;
        configurationHash: string;
    };

}
}
export interface VFXGraphConnection { id: string;
    source: {
        nodeId: string;
        port?: string }
}
    };
    target: { nodeId: string;
        port?: string };
    dataType: 'text' | 'number' | 'boolean' | 'array' | 'object';
    label?: string;

}
}
export interface VFXExecutionData { randomization: {
        masterSeed: number;
        nodeSeed: {
            [nodeId: string]: number }
}
        };
        rngState?: string;
        reproducibilityHash?: string;
        nodeRngStates?: { [nodeId: string]: {
                seed: number;
                state: string;
                callCount: number;
                lastValue: number };
        };
        executionSequence?: string[];
    };
    performance: { totalTime: number;
        nodePerformance: {
            [nodeId: string]: {
                executionTime: number;
                cacheHits: number;
                cacheMisses: number };
        };
        memoryUsage?: number;
    };
    history: { iterations: VFXExecutionIteration[];
        modifications: VFXModification[] };
    reproduction: { environment: {
            nodeVersion: string;
            platform: string;
            locale?: string };
        exactReproduction: boolean;
        approximateReproduction: boolean;
    };

}
}
export interface VFXExecutionIteration { iterationId: string;
    timestamp: string;
    trigger: 'user_request' | 'auto_refresh' | 'variable_change' | 'node_change';
    seed: number;
    result: string;
    executionTime: number }
}
}
export interface VFXModification { timestamp: string;
    type: 'node_added' | 'node_removed' | 'node_modified' | 'connection_added' | 'connection_removed' | 'variable_changed';
    nodeId?: string;
    before?: unknown;
    after?: unknown;
    userNote?: string }
}
}
export interface VFXExtensions { controlNet?: {
        pose?: VFXControlNetPose;
        depth?: VFXControlNetDepth;
        canny?: VFXControlNetCanny;
        openpose?: VFXControlNetOpenpose }
}
    };
    animation?: {
        frameCount?: number;
        fps?: number;
        keyframes?: VFXKeyframe[];
        interpolation?: 'linear' | 'ease' | 'ease-in-out' | 'bezier'
  };
    scene3D?: { camera?: VFXCameraData;
        lighting?: VFXLightingData;
        environment?: VFXEnvironmentData };
    wildConstruct?: { crowdControl?: WildConstructCrowdControl;
        backdrop?: WildConstructBackdrop;
        meteor?: WildConstructMeteor;
        maestro?: WildConstructMaestro;
        utdg?: WildConstructUTDG };
    custom?: { [moduleName: string]: unknown };

}
}
export interface VFXRenderingData { resolution: {
        width: number;
        height: number;
        aspectRatio: string }
}
    };
    camera: VFXCameraParams;
    lighting: VFXLightingParams;
    style: { filmstock?: 'digital' | '35mm' | '16mm' | 'super8' | 'polaroid';
        colorGrading?: 'natural' | 'cinematic' | 'desaturated' | 'vibrant' | 'monochrome';
        lensProfile?: string;
        dof?: {
            enabled: boolean;
            focusDistance?: number;
            blurRadius?: number };
    };
    quality: { samples?: number;
        denoising?: number;
        sharpness?: number;
        upscaling?: number };

}
}
export interface VFXControlNetPose { enabled: boolean;
    strength: number;
    poseData?: string;
    poseDescription: string }
}
}
export interface VFXControlNetDepth { enabled: boolean;
    strength: number;
    depthMap?: string;
    depthRange: [number, number] }
}
}
export interface VFXControlNetCanny { enabled: boolean;
    strength: number;
    threshold: [number, number];
    edgeMap?: string }
}
}
export interface VFXControlNetOpenpose { enabled: boolean;
    strength: number;
    poseKeypoints?: number[][];
    bodyParts: string[] }
}
}
export interface VFXCameraParams { fov?: number;
    focal?: number;
    aperture?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    target?: [number, number, number] }
}
}
export interface VFXLightingParams { timeOfDay?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
    weather?: 'clear' | 'cloudy' | 'overcast' | 'stormy' | 'foggy' | 'snowy';
    mood?: 'bright' | 'dramatic' | 'soft' | 'harsh' | 'moody' | 'ethereal';
    temperature?: number;
    exposure?: number }
}
}
export interface VFXKeyframe { frame: number;
    timestamp: number;
    prompt?: string;
    variables?: {
        [key: string]: string }
}
    };
    camera?: Partial<VFXCameraParams>;
    lighting?: Partial<VFXLightingParams>;

}
}
export interface VFXCameraData { type: 'static' | 'dolly' | 'pan' | 'tilt' | 'crane' | 'handheld' | 'steadicam';
    movement?: {
        path: [number, number, number][];
        duration: number;
        easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' }
}
    };

}
}
export interface VFXLightingData { setup: 'key' | 'three-point' | 'natural' | 'practical' | 'studio' | 'location';
    sources: {
        type: 'key' | 'fill' | 'rim' | 'background' | 'practical';
        position: [number, number, number];
        intensity: number;
        color: [number, number, number];
        temperature?: number }
}
    }[];

}
}
export interface VFXEnvironmentData { type: 'indoor' | 'outdoor' | 'studio' | 'location' | 'greenscreen';
    conditions: {
        weather?: string;
        timeOfDay?: string;
        season?: 'spring' | 'summer' | 'fall' | 'winter';
        atmosphere?: string }
}
    };
    background?: { type: 'practical' | 'matte_painting' | '3d_environment' | 'greenscreen';
        description: string;
        sourceFile?: string };

export type VFXExportQuality = 'production' | 'preview' | 'debug';

}
}
export interface VFXValidationResult { isValid: boolean;
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
            weightsPreserved: boolean }
}
        };
    };

}
}
export interface VFXExporter { exportGraph(graph: any, options: VFXExportOptions): Promise<VFXExportFormat>;
    validateExport(exportData: VFXExportFormat): VFXValidationResult;
    generateDocumentation(exportData: VFXExportFormat): string }
}
}
export interface VFXExportOptions {
    quality: VFXExportQuality;
    includeDebugInfo?: boolean;
    includeHistoricalData?: boolean;
    includePerformanceData?: boolean;
    includeVariantData?: boolean;
    formatVersion?: string;
    customExtensions?: string[];
/**
 * CrowdControl Integration for historically accurate crowd generation
 */

}
}
}
export interface WildConstructCrowdControl { enabled: boolean;
    version: string;
    crowdData?: {
        era: {
            name: string;
            period: [number, number];
            region: string[] }
}
        };
        demographics: { totalPopulation: number;
            socialClasses: {
                [className: string]: {
                    percentage: number;
                    occupations: string[];
                    clothingStyles: string[] };
            };
            ageDistribution: { children: number;
                adults: number;
                elderly: number };
            genderRatio: { male: number;
                female: number };
        };
        behavior: { activities: string[];
            interactions: string[];
            socialMixing: boolean;
            culturalPatterns: string[] };
        validation: { historicalAccuracy: number;
            constraintViolations: string[];
            suggestions: string[] };
    };
    pipeline: { format: 'json' | 'xml' | 'csv' | 'maya' | 'blender';
        memoryEstimate: number;
        renderComplexity: 'low' | 'medium' | 'high';
        polyCount: number;
        textureSize: number };
/**
 * Backdrop Integration for era-appropriate environments
 */

}
}
export interface WildConstructBackdrop { enabled: boolean;
    version: string;
    environment?: {
        era: {
            name: string;
            architecturalStyle: string[];
            materials: string[];
            colors: string[] }
}
        };
        location: { type: 'urban' | 'rural' | 'interior' | 'natural';
            description: string;
            authenticity: number;
            socialContext: string };
        atmosphere: { timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
            season: 'spring' | 'summer' | 'autumn' | 'winter';
            weather: string;
            mood: string };
        assets: { buildings: BackdropAsset[];
            props: BackdropAsset[];
            vegetation: BackdropAsset[];
            terrain: BackdropAsset[] };
    };
    scene3D: { coordinate: [number, number, number];
        scale: [number, number, number];
        lighting: {
            ambientColor: [number, number, number];
            directionalLights: Array<{
                direction: [number, number, number];
                color: [number, number, number];
                intensity: number }>;
        };
    };
/**
 * Meteor Integration for period-accurate atmospheric effects
 */

}
}
export interface WildConstructMeteor { enabled: boolean;
    version: string;
    atmosphere?: {
        era: {
            name: string;
            climateData: string[];
            seasonalPatterns: string[] }
}
        };
        weather: { condition: string;
            temperature: number;
            humidity: number;
            windSpeed: number;
            precipitation: number;
            visibility: number };
        effects: { particles: Array<{
                type: 'rain' | 'snow' | 'fog' | 'dust' | 'smoke' | 'mist';
                density: number;
                size: number;
                velocity: [number, number, number];
                color: [number, number, number, number] }>;
            volumetrics: { enabled: boolean;
                scattering: number;
                absorption: number };
        };
        historicalAccuracy: { score: number;
            factors: string[];
            references: string[] };
    };
/**
 * Maestro Integration for scene orchestration
 */

}
}
export interface WildConstructMaestro { enabled: boolean;
    version: string;
    orchestration?: {
        sceneComposition: {
            foreground: string[];
            midground: string[];
            background: string[];
            depth: number }
}
        };
        timing: {
            duration: number;
            keyMoments: Array<{
                time: number;
                event: string;
                priority: 'high' | 'medium' | 'low'
  }>;
        };
        coordination: { crowdControl: boolean;
            backdrop: boolean;
            meteor: boolean;
            dependencies: string[] };
        historicalContext: { narrative: string;
            culturalSignificance: string;
            historicalEvents: string[];
            accuracy: number };
    };
    rendering: { renderOrder: string[];
        compositing: {
            layers: string[];
            blendModes: string[];
            masks: string[] };
        postProcessing: { colorGrading: boolean;
            filmGrain: boolean;
            vignette: boolean;
            historicalFilmLook: string };
    };
/**
 * UTDG (Universal Texture Description Graph) Integration
 */

}
}
export interface WildConstructUTDG { enabled: boolean;
    version: string;
    graph?: {
        nodes: UTDGNode[];
        connections: UTDGConnection[];
        metadata: UTDGMetadata }
}
    };
    historical: {
        era: {
            name: string;
            period: [number, number];
            regions: string[];
            accuracy: 'high' | 'medium' | 'creative'
  };
        constraints: Array<{ type: 'temporal' | 'regional' | 'social' | 'technical';
            rule: string;
            enforcement: 'strict' | 'warning' | 'suggestion';
            context: string }>;
        validation: { overallScore: number;
            violations: Array<{
                severity: 'error' | 'warning' | 'info';
                message: string;
                suggestions: string[] }>;
        };
    };
    dataSources: Array<{ id: string;
        name: string;
        type: 'museum' | 'academic' | 'archaeological' | 'specialist';
        url?: string;
        reliability: number;
        coverage: string[] }>;
    vfxMetadata: { textureCategories: string[];
        materialProperties: Array<{
            name: string;
            values: Record<string, unknown>;
            historicalBasis: string }>;
        compatibilityFlags: { maya: boolean;
            blender: boolean;
            houdini: boolean;
            unreal: boolean;
            unity: boolean };
    };

}
}
export interface BackdropAsset { id: string;
    name: string;
    type: string;
    historicalPeriod: string;
    authenticity: number;
    materials: string[];
    dimensions?: [number, number, number];
    position?: [number, number, number];
    rotation?: [number, number, number] }
}
}
export interface UTDGNode { id: string;
    type: 'material' | 'texture' | 'pattern' | 'style' | 'composite';
    content: string;
    historicalData: {
        era: string;
        region: string[];
        authenticity: number;
        source: string;
        tags: string[] }
}
    };
    relationships: { compatible: string[];
        incompatible: string[];
        variations: string[] };
    vfxProperties: { roughness?: number;
        metallic?: number;
        normal?: string;
        albedo?: [number, number, number];
        emission?: [number, number, number] };

}
}
export interface UTDGConnection { id: string;
    source: string;
    target: string;
    relationship: 'enhances' | 'conflicts' | 'requires' | 'modifies';
    strength: number;
    historicalBasis: string }
}
}
export interface UTDGMetadata {
    creationDate: string;
    lastModified: string;
    accuracy: number;
    complexity: 'simple' | 'moderate' | 'complex';
    historicalPeriods: string[];
    regions: string[];
    dataProvenance: string[];
/**
 * MARS (Metadata, Actions, Rendering, Style) structure for VFX compatibility
 * Provides structured sections that align with professional VFX workflows
 */

}
}
}
export interface VFXMARSStructure { metadata: {
        camera: {
            shotType: 'extreme-wide' | 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'two-shot' | 'over-shoulder';
            movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'crane' | 'handheld' | 'steadicam' | 'tracking';
            angle: 'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | 'birds-eye' | 'worms-eye';
            lens: {
                focalLength: number;
                aperture: number;
                focusType: 'sharp' | 'shallow-dof' | 'deep-focus' | 'rack-focus' | 'soft-focus' }
}
            };
            framing: {
                composition: 'rule-of-thirds' | 'centered' | 'golden-ratio' | 'symmetrical' | 'asymmetrical';
                aspectRatio: '16:9' | '21:9' | '4:3' | '2.35:1' | '1.85:1' | 'square';
                headroom: 'tight' | 'standard' | 'loose'
  };
        };
        scene: {
            location: 'interior' | 'exterior' | 'studio' | 'practical-location' | 'virtual-set';
            timeOfDay: 'golden-hour' | 'blue-hour' | 'day' | 'night' | 'magic-hour' | 'overcast';
            season: 'spring' | 'summer' | 'autumn' | 'winter' | 'timeless';
            weather: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy' | 'windy';
            atmosphere: 'calm' | 'tense' | 'chaotic' | 'serene' | 'ominous' | 'festive' | 'melancholic'
  };
        technical: { filmStock: 'digital' | '35mm' | '16mm' | 'super8' | 'imax' | 'alexa' | 'red' | 'blackmagic';
            colorSpace: 'rec709' | 'rec2020' | 'dci-p3' | 'aces' | 'log' | 'srgb';
            resolution: '2k' | '4k' | '6k' | '8k' | 'hd' | 'uhd' | 'cinema4k';
            frameRate: 24 | 25 | 30 | 48 | 50 | 60 | 120 };
    };
    actions: { primary: {
            subjects: VFXMARSSubject[];
            primaryAction: string;
            secondaryActions: string[];
            interactions: VFXMARSInteraction[] };
        performance: {
            emotionalState: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted' | 'contemptuous';
            intensity: 'subtle' | 'moderate' | 'intense' | 'extreme';
            bodyLanguage: 'open' | 'closed' | 'confident' | 'nervous' | 'aggressive' | 'passive' | 'theatrical';
            facialExpression: 'natural' | 'exaggerated' | 'stoic' | 'animated' | 'pensive' | 'determined'
  };
        movement: {
            pace: 'slow' | 'moderate' | 'fast' | 'frenetic' | 'static';
            direction: 'left-to-right' | 'right-to-left' | 'toward-camera' | 'away-from-camera' | 'circular' | 'chaotic';
            choreography: 'natural' | 'staged' | 'dance-like' | 'combat' | 'athletic' | 'ceremonial'
  };
    };
    rendering: { lighting: {
            setup: 'natural' | 'three-point' | 'key-only' | 'rim' | 'silhouette' | 'high-key' | 'low-key' | 'chiaroscuro';
            quality: 'soft' | 'hard' | 'mixed' | 'dramatic' | 'flat' | 'volumetric' | 'practical';
            temperature: {
                kelvin: number;
                description: 'warm' | 'cool' | 'neutral' | 'mixed' | 'color-contrast' };
            motivation: 'sun' | 'moon' | 'artificial' | 'fire' | 'neon' | 'candle' | 'fluorescent' | 'led'
  };
        effects: {
            atmosphere: ('fog' | 'smoke' | 'dust' | 'rain' | 'snow' | 'mist' | 'haze' | 'steam')[];
            particles: ('sparks' | 'embers' | 'ash' | 'pollen' | 'debris' | 'magical' | 'digital' | 'organic')[];
            postProcessing: {
                colorGrading: 'natural' | 'cinematic' | 'stylized' | 'desaturated' | 'high-contrast' | 'vintage' | 'futuristic';
                filtration: 'clean' | 'film-grain' | 'digital-noise' | 'softening' | 'sharpening' | 'glow' | 'bloom'
  };
        };
        quality: { renderEngine: 'path-tracing' | 'ray-tracing' | 'rasterization' | 'hybrid' | 'real-time' | 'offline';
            samples: number;
            bounces: number;
            denoising: boolean;
            upscaling: '1x' | '2x' | '4x' | 'ai-upscale' };
    };
    style: { genre: 'drama' | 'action' | 'comedy' | 'horror' | 'sci-fi' | 'fantasy' | 'documentary' | 'commercial' | 'music-video';
        visualStyle: {
            overall: 'realistic' | 'stylized' | 'surreal' | 'abstract' | 'minimalist' | 'maximalist' | 'retro' | 'futuristic';
            colorPalette: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic' | 'natural';
            contrast: 'low' | 'medium' | 'high' | 'extreme' | 'variable';
            saturation: 'desaturated' | 'natural' | 'saturated' | 'hyper-saturated' | 'selective-color' };
        influences: { cinematographer: string[];
            director: string[];
            period: string[];
            artMovement: string[] };
        references: { films: string[];
            artwork: string[];
            photography: string[];
            other: string[] };
    };
/**
 * Subject definition within MARS structure
 */

}
}
export interface VFXMARSSubject { id: string;
    type: 'human' | 'animal' | 'creature' | 'object' | 'vehicle' | 'environment' | 'abstract';
    description: string;
    importance: 'primary' | 'secondary' | 'background' | 'prop';
    characteristics: {
        physical: string[];
        emotional: string[];
        narrative: string[] }
}
    };
    positioning: { screenPosition: 'left' | 'center' | 'right' | 'multiple' | 'off-screen';
        depth: 'foreground' | 'midground' | 'background';
        relationship: string[] };
/**
 * Interaction definition between subjects
 */

}
}
export interface VFXMARSInteraction {
    type: 'dialogue' | 'physical' | 'emotional' | 'spatial' | 'narrative';
    participants: string[];
    description: string;
    intensity: 'subtle' | 'moderate' | 'strong' | 'dominant';
    duration: 'brief' | 'sustained' | 'extended';
/**
 * Zada-style natural language variants alongside structured data
 * Provides human-readable alternatives to structured prompts
 */

}
}
}
export interface VFXZadaVariant { id: string;
    type: 'conversational' | 'technical' | 'poetic' | 'director-notes' | 'screenplay';
    language: 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'japanese' | string;
    style: {
        formality: 'casual' | 'professional' | 'academic' | 'artistic' | 'technical';
        length: 'concise' | 'detailed' | 'verbose' | 'bullet-points' | 'paragraph';
        perspective: 'objective' | 'subjective' | 'first-person' | 'second-person' | 'third-person' }
}
    };
    content: { naturalLanguage: string;
        technicalNotes: string[];
        creativeNotes: string[];
        productionNotes: string[] };
    metadata: {
        targetAudience: 'director' | 'cinematographer' | 'vfx-supervisor' | 'editor' | 'producer' | 'general';
        expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
        context: 'pre-production' | 'production' | 'post-production' | 'presentation' | 'documentation'
  };
    equivalence: { marsMapping: {
            metadata: boolean;
            actions: boolean;
            rendering: boolean;
            style: boolean };
        structuredPrompt: string;
        confidence: number;
    };
/**
 * Hollywood protocol reproducibility seeds
 * Industry-standard seed management for consistent results across productions
 */

}
}
export interface VFXHollywoodProtocol { version: '1.0' | '1.1' | '2.0';
    production: {
        masterSeed: number;
        projectCode: string;
        episodeNumber?: number;
        sequenceNumber?: number;
        shotNumber?: number }
}
    };
    departmental: { cinematography: number;
        vfx: number;
        editorial: number;
        sound: number;
        grading: number };
    creative: { directorVariant: number;
        alternativeVersions: {
            [versionName: string]: {
                seed: number;
                description: string;
                approvalStatus: 'draft' | 'review' | 'approved' | 'final';
                notes: string };
        };
    };
    qa: { validationSeed: number;
        comparisonSeeds: number[];
        benchmarkSeed: number };
    reproducibility: { guaranteeLevel: 'exact' | 'approximate' | 'creative-equivalent' | 'concept-only';
        environmentHash: string;
        softwareVersions: {
            [software: string]: string };
        hardwareFingerprint: string;
        lastValidated: string;
        validationNotes: string;
    };
    compliance: { studioCertification: boolean;
        distributorApproval: boolean;
        archiveCompliant: boolean;
        regulatoryCompliance: string[] };
/**
 * Human-readable export layer for filmmaker review
 * Provides non-technical summaries for creative decision-making
 */

}
}
export interface VFXHumanReadableLayer {
    executiveSummary: {
        description: string;
        keyElements: string[];
        creativeIntent: string;
        technicalComplexity: 'simple' | 'moderate' | 'complex' | 'experimental';
        estimatedCost: 'low' | 'medium' | 'high' | 'premium';
        estimatedTime: 'hours' | 'days' | 'weeks' | 'months'
}
}
  };
    creativeTeam: { director: {
            vision: string;
            references: string[];
            priorities: string[];
            concerns: string[] };
        cinematographer: { lookAndFeel: string;
            lightingApproach: string;
            cameraWork: string;
            technicalChallenges: string[] };
        vfxSupervisor: { vfxApproach: string;
            practicalElements: string[];
            digitalElements: string[];
            integrationNotes: string[] };
    };
    production: { schedule: {
            prep: string;
            shoot: string;
            post: string };
        resources: { crew: string[];
            equipment: string[];
            locations: string[];
            talent: string[] };
        dependencies: { prerequisites: string[];
            deliverables: string[];
            approvals: string[] };
    };
    approval: { reviewStages: {
            [stageName: string]: {
                reviewers: string[];
                criteria: string[];
                deliverables: string[];
                timeline: string };
        };
        signOffs: { creative: boolean;
            technical: boolean;
            legal: boolean;
            budget: boolean };
        notes: { directorNotes: string[];
            producerNotes: string[];
            clientNotes: string[];
            technicalNotes: string[] };
    };
    documentation: { projectDocuments: string[];
        referenceImages: string[];
        testFootage: string[];
        alternativeVersions: string[];
        archiveNotes: string };
/**
 * ControlNet integration metadata tags for VFX pipeline compatibility
 * Provides MARS tags ([CAM], [SUBJ], [FX]) as structured metadata for AI-driven animation
 */

}
}
export interface VFXControlNetTags { camera: {
        [tagName: string]: VFXControlNetTag }
}
    };
    subjects: { [tagName: string]: VFXControlNetTag };
    effects: { [tagName: string]: VFXControlNetTag };
    marsIntegration: { enabled: boolean;
        globalSettings: {
            baseStrength: number;
            adaptiveWeighting: boolean;
            cascadeMode: boolean };
        tagProcessingOrder: string[];
    };
/**
 * Individual ControlNet tag with specific parameters and rendering hints
 */

}
}
export interface VFXControlNetTag { tag: string;
    description: string;
    controlNetParameters: {
        depth?: {
            enabled: boolean;
            strength: number;
            preprocessor: 'midas' | 'dpt' | 'zoe' | 'leres';
            guidanceScale?: number }
}
        };
        pose?: { enabled: boolean;
            strength: number;
            preprocessor: 'openpose' | 'dwpose' | 'animal_pose';
            detectHands?: boolean;
            detectFace?: boolean };
        canny?: { enabled: boolean;
            strength: number;
            lowThreshold?: number;
            highThreshold?: number };
        normal?: {
            enabled: boolean;
            strength: number;
            preprocessor: 'normal' | 'bae'
  };
        segmentation?: {
            enabled: boolean;
            strength: number;
            preprocessor: 'seg' | 'ade20k'
  };
        scribble?: {
            enabled: boolean;
            strength: number;
            preprocessor: 'scribble' | 'fake_scribble'
  };
    };
    renderingHints: { cameraDistance?: number;
        verticalAngle?: number;
        horizontalAngle?: number;
        fieldOfView?: number;
        subjectScale?: number;
        detailLevel?: 'background' | 'midground' | 'hero';
        materialType?: string;
        animationReady?: boolean;
        mistDensity?: number;
        lightingTemperature?: number;
        atmosphericPerspective?: boolean;
        volumetricLighting?: boolean;
        priorityLevel?: 'low' | 'medium' | 'high' | 'critical';
        processingOrder?: number;
        dependsOnTags?: string[];
        conflictsWith?: string[] };
    integration: { softwareCompatibility: string[];
        pipelineStage: 'previs' | 'lighting' | 'animation' | 'compositing' | 'final';
        qualityLevel: 'draft' | 'preview' | 'final';
        lastValidated?: string;
        validationNotes?: string[] };

//# sourceMappingURL=VFXExport.d.ts.map