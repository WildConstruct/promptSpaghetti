// packages/core/types/VFXExport.ts
// VFX-ready export schema for Wild Construct film production pipeline integration
;
// Project context
project: {
    name ?  : string;
    id ?  : string;
    scene ?  : string; // Scene identifier for multi-scene projects,
    shot ?  : string; // Shot identifier for shot-specific prompts,
}
;
{
    format: 'vfx-pipeline-v1';
    quality: 'production' | 'preview' | 'debug';
    includeDebugInfo: boolean;
    includeHistoricalData: boolean;
}
;
// Compatibility flags
compatibility: {
    controlNet: boolean;
    diffusionModels: string; // Supported models (SD, SDXL, etc.),
    animationFramework: boolean; // Animation sequence support,
    billboardProjection: boolean; // 3D billboard rendering support,
}
;
;
// Variable substitution history
variables: {
    [variableName, string];
    {
        value: string; // Final substituted value,
        source: 'user' | 'generated' | 'scene_data' | 'default';
        alternatives ?  : string; // Other possible values that were rejected,
        confidence ?  : number; // 0-1 confidence if generated,
    }
    ;
}
;
// Multi-variant generation
variants: VFXPromptVariant;
// Negative prompt for diffusion models
negativePrompt ?  : string;
// Prompt strengths and weights
weights: {
    overall: number; // Base prompt strength,
    subject: number; // Subject emphasis,
    composition: number; // Composition weight,
    style: number; // Style adherence weight,
}
;
// === HYBRID PROMPTING EXTENSIONS ===
// MARS (Metadata, Actions, Rendering, Style) structure for VFX compatibility
mars ?  : VFXMARSStructure;
// Zada-style natural language variants alongside structured data
zadaVariants ?  : VFXZadaVariant;
// Hollywood protocol reproducibility seeds
hollywoodProtocol ?  : VFXHollywoodProtocol;
// Human-readable export layer for filmmaker review
humanReadable ?  : VFXHumanReadableLayer;
// ControlNet integration metadata tags
controlNetTags ?  : VFXControlNetTags;
;
;
;
;
target: {
    nodeId: string;
    port ?  : string;
}
;
dataType: 'text' | 'number' | 'boolean' | 'array' | 'object';
label ?  : string;
;
// Performance metrics
performance: {
    totalTime: number; // Total execution time (ms),
    nodePerformance: {
        [nodeId, string];
        {
            executionTime: number;
            cacheHits: number;
            cacheMisses: number;
        }
        ;
    }
    ;
    memoryUsage ?  : number; // Peak memory (bytes)
}
;
// Generation history
history: {
    iterations: VFXExecutionIteration;
    modifications: VFXModification; // User changes during generation,
}
;
// Reproducibility data
reproduction: {
    environment: {
        nodeVersion: string;
        platform: string;
        locale ?  : string;
    }
    ;
    exactReproduction: boolean; // Can this be exactly reproduced?,
    approximateReproduction: boolean; // Can this be approximately reproduced?
}
;
;
// Animation sequences
animation ?  : {
    frameCount: number,
    fps: number,
    keyframes: VFXKeyframe,
    interpolation: 'linear' | 'ease' | 'ease-in-out' | 'bezier'
};
// 3D scene integration
scene3D ?  : {
    camera: VFXCameraData,
    lighting: VFXLightingData,
    environment: VFXEnvironmentData
};
// Wild Construct Ecosystem Integration
wildConstruct ?  : {
    crowdControl: WildConstructCrowdControl,
    backdrop: WildConstructBackdrop,
    meteor: WildConstructMeteor,
    maestro: WildConstructMaestro,
    utdg: WildConstructUTDG
};
// Custom Wild Construct modules
custom ?  : {
    [moduleName]: string, unknown
};
;
// Camera parameters (for 3D-aware generation)
camera: VFXCameraParams;
// Lighting conditions
lighting: VFXLightingParams;
// Style and post-processing
style: {
    filmstock ?  : 'digital' | '35mm' | '16mm' | 'super8' | 'polaroid';
    colorGrading ?  : 'natural' | 'cinematic' | 'desaturated' | 'vibrant' | 'monochrome';
    lensProfile ?  : string; // Lens characteristics,
    dof ?  : {
        enabled: boolean,
        focusDistance: number,
        blurRadius: number
    };
}
;
// Render quality settings
quality: {
    samples ?  : number; // Render samples/iterations,
    denoising ?  : number; // Denoising strength (0-1),
    sharpness ?  : number; // Output sharpening (0-1),
    upscaling ?  : number; // Upscale factor (1x, 2x, 4x),
}
;
variables ?  : { [key]: string, string }; // Variable values at this keyframe
camera ?  : Partial; // Camera state
lighting ?  : Partial; // Lighting state
;
[];
;
background ?  : {
    type: 'practical' | 'matte_painting' | '3d_environment' | 'greenscreen',
    description: string,
    sourceFile: string
};
;
;
// VFX pipeline integration
pipeline: {
    format: 'json' | 'xml' | 'csv' | 'maya' | 'blender';
    memoryEstimate: number; // MB,
    renderComplexity: 'low' | 'medium' | 'high';
    polyCount: number;
    textureSize: number; // MB,
}
;
;
// 3D scene integration
scene3D: {
    coordinate: [number, number, number]; // World coordinates,
    scale: [number, number, number];
    lighting: {
        ambientColor: [number, number, number];
        directionalLights: Array;
    }
    ;
}
;
;
;
// Rendering coordination
rendering: {
    renderOrder: string;
    compositing: {
        layers: string;
        blendModes: string;
        masks: string;
    }
    ;
    postProcessing: {
        colorGrading: boolean;
        filmGrain: boolean;
        vignette: boolean;
        historicalFilmLook: string; // e.g., "1970s film stock",
    }
    ;
}
;
;
// Historical accuracy framework
historical: {
    era: {
        name: string;
        period: [number, number];
        regions: string;
        accuracy: 'high' | 'medium' | 'creative';
    }
    ;
    constraints: Array;
    validation: {
        overallScore: number; // 0-1,
        violations: Array;
    }
    ;
}
;
// Data sources and provenance
dataSources: Array;
// VFX pipeline metadata
vfxMetadata: {
    textureCategories: string;
    materialProperties: Array;
    compatibilityFlags: {
        maya: boolean;
        blender: boolean;
        houdini: boolean;
        unreal: boolean;
        unity: boolean;
    }
    ;
}
;
;
relationships: {
    compatible: string;
    incompatible: string;
    variations: string;
}
;
vfxProperties: {
    roughness ?  : number;
    metallic ?  : number;
    normal ?  : string;
    albedo ?  : [number, number, number];
    emission ?  : [number, number, number];
}
;
;
// [SUBJ] - Subject and character actions  
actions: {
    primary: {
        subjects: VFXMARSSubject;
        primaryAction: string;
        secondaryActions: string;
        interactions: VFXMARSInteraction;
    }
    ;
    performance: {
        emotionalState: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted' | 'contemptuous';
        intensity: 'subtle' | 'moderate' | 'intense' | 'extreme';
        bodyLanguage: 'open' | 'closed' | 'confident' | 'nervous' | 'aggressive' | 'passive' | 'theatrical';
        facialExpression: 'natural' | 'exaggerated' | 'stoic' | 'animated' | 'pensive' | 'determined';
    }
    ;
    movement: {
        pace: 'slow' | 'moderate' | 'fast' | 'frenetic' | 'static';
        direction: 'left-to-right' | 'right-to-left' | 'toward-camera' | 'away-from-camera' | 'circular' | 'chaotic';
        choreography: 'natural' | 'staged' | 'dance-like' | 'combat' | 'athletic' | 'ceremonial';
    }
    ;
}
;
// [FX] - Rendering and visual effects parameters
rendering: {
    lighting: {
        setup: 'natural' | 'three-point' | 'key-only' | 'rim' | 'silhouette' | 'high-key' | 'low-key' | 'chiaroscuro';
        quality: 'soft' | 'hard' | 'mixed' | 'dramatic' | 'flat' | 'volumetric' | 'practical';
        temperature: {
            kelvin: number;
            description: 'warm' | 'cool' | 'neutral' | 'mixed' | 'color-contrast';
        }
        ;
        motivation: 'sun' | 'moon' | 'artificial' | 'fire' | 'neon' | 'candle' | 'fluorescent' | 'led';
    }
    ;
    effects: {
        atmosphere: ('fog' | 'smoke' | 'dust' | 'rain' | 'snow' | 'mist' | 'haze' | 'steam')[];
        particles: ('sparks' | 'embers' | 'ash' | 'pollen' | 'debris' | 'magical' | 'digital' | 'organic')[];
        postProcessing: {
            colorGrading: 'natural' | 'cinematic' | 'stylized' | 'desaturated' | 'high-contrast' | 'vintage' | 'futuristic';
            filtration: 'clean' | 'film-grain' | 'digital-noise' | 'softening' | 'sharpening' | 'glow' | 'bloom';
        }
        ;
    }
    ;
    quality: {
        renderEngine: 'path-tracing' | 'ray-tracing' | 'rasterization' | 'hybrid' | 'real-time' | 'offline';
        samples: number;
        bounces: number;
        denoising: boolean;
        upscaling: '1x' | '2x' | '4x' | 'ai-upscale';
    }
    ;
}
;
// Style and aesthetic directives
style: {
    genre: 'drama' | 'action' | 'comedy' | 'horror' | 'sci-fi' | 'fantasy' | 'documentary' | 'commercial' | 'music-video';
    visualStyle: {
        overall: 'realistic' | 'stylized' | 'surreal' | 'abstract' | 'minimalist' | 'maximalist' | 'retro' | 'futuristic';
        colorPalette: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic' | 'natural';
        contrast: 'low' | 'medium' | 'high' | 'extreme' | 'variable';
        saturation: 'desaturated' | 'natural' | 'saturated' | 'hyper-saturated' | 'selective-color';
    }
    ;
    influences: {
        cinematographer: string; // e.g., ["Roger Deakins", "Emmanuel Lubezki"],
        director: string; // e.g., ["Denis Villeneuve", "Christopher Nolan"],
        period: string; // e.g., ["1970s cinema", "film noir", "golden age"],
        artMovement: string; // e.g., ["expressionism", "impressionism", "modernism"],
    }
    ;
    references: {
        films: string; // Reference films for visual style,
        artwork: string; // Reference artworks or artists,
        photography: string; // Photographic styles or photographers,
        other: string; // Other visual references,
    }
    ;
}
;
;
positioning: {
    screenPosition: 'left' | 'center' | 'right' | 'multiple' | 'off-screen';
    depth: 'foreground' | 'midground' | 'background';
    relationship: string; // Relationship to other subjects,
}
;
;
content: {
    naturalLanguage: string; // Human-readable description,
    technicalNotes: string; // Technical implementation notes,
    creativeNotes: string; // Creative direction notes,
    productionNotes: string; // Production-specific guidance,
}
;
metadata: {
    targetAudience: 'director' | 'cinematographer' | 'vfx-supervisor' | 'editor' | 'producer' | 'general';
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    context: 'pre-production' | 'production' | 'post-production' | 'presentation' | 'documentation';
}
;
equivalence: {
    marsMapping: { // Which MARS sections this variant represents,
        metadata: boolean;
        actions: boolean;
        rendering: boolean;
        style: boolean;
    }
    ;
    structuredPrompt: string; // Equivalent structured prompt,
    confidence: number; // 0-1 confidence in equivalence
}
;
;
// Departmental seeds for different teams
departmental: {
    cinematography: number; // Camera and lighting dept,
    vfx: number; // Visual effects dept,
    editorial: number; // Editorial dept,
    sound: number; // Sound design dept,
    grading: number; // Color grading dept,
}
;
// Creative variation seeds
creative: {
    directorVariant: number; // Director's preferred variant,
    alternativeVersions: { // Alternative creative versions,
        [versionName, string];
        {
            seed: number;
            description: string;
            approvalStatus: 'draft' | 'review' | 'approved' | 'final';
            notes: string;
        }
        ;
    }
    ;
}
;
// Quality assurance and validation
qa: {
    validationSeed: number; // Seed for validation renders,
    comparisonSeeds: number; // Seeds for A/B testing,
    benchmarkSeed: number; // Industry standard benchmark,
}
;
// Reproducibility metadata
reproducibility: {
    guaranteeLevel: 'exact' | 'approximate' | 'creative-equivalent' | 'concept-only';
    environmentHash: string; // Hash of rendering environment,
    softwareVersions: { // Critical software versions,
        [software, string];
        string;
    }
    ;
    hardwareFingerprint: string; // Hardware configuration hash,
    lastValidated: string; // ISO timestamp of last validation
    validationNotes: string; // Notes from validation process
}
;
// Industry compliance
compliance: {
    studioCertification: boolean; // Studio QA certification,
    distributorApproval: boolean; // Distributor technical approval,
    archiveCompliant: boolean; // Archive format compliance,
    regulatoryCompliance: string; // Regulatory requirements met,
}
;
;
// Creative team briefing
creativeTeam: {
    director: {
        vision: string; // Overall creative vision,
        references: string; // Visual or thematic references,
        priorities: string; // Most important elements to nail,
        concerns: string; // Areas requiring special attention,
    }
    ;
    cinematographer: {
        lookAndFeel: string; // Overall visual approach,
        lightingApproach: string; // Lighting strategy,
        cameraWork: string; // Camera movement and framing,
        technicalChallenges: string; // Technical challenges anticipated,
    }
    ;
    vfxSupervisor: {
        vfxApproach: string; // VFX strategy and methodology,
        practicalElements: string; // What's shot practically,
        digitalElements: string; // What's created digitally,
        integrationNotes: string; // How practical and digital integrate,
    }
    ;
}
;
// Production logistics
production: {
    schedule: {
        prep: string; // Pre-production requirements,
        shoot: string; // On-set requirements,
        post: string; // Post-production timeline,
    }
    ;
    resources: {
        crew: string; // Key crew requirements,
        equipment: string; // Special equipment needed,
        locations: string; // Location requirements,
        talent: string; // Casting considerations,
    }
    ;
    dependencies: {
        prerequisites: string; // What must be completed first,
        deliverables: string; // What this shot delivers to others,
        approvals: string; // Required approvals and sign-offs,
    }
    ;
}
;
// Review and approval workflow
approval: {
    reviewStages: {
        [stageName, string];
        {
            reviewers: string; // Who reviews at this stage,
            criteria: string; // What they're reviewing for,
            deliverables: string; // What's delivered for review,
            timeline: string; // How long this stage takes,
        }
        ;
    }
    ;
    signOffs: {
        creative: boolean; // Creative approval received,
        technical: boolean; // Technical approval received,
        legal: boolean; // Legal clearance received,
        budget: boolean; // Budget approval received,
    }
    ;
    notes: {
        directorNotes: string; // Director's review notes,
        producerNotes: string; // Producer's review notes,
        clientNotes: string; // Client feedback (if applicable),
        technicalNotes: string; // Technical review notes,
    }
    ;
}
;
// Documentation and archival
documentation: {
    projectDocuments: string; // Related project documents,
    referenceImages: string; // Reference image descriptions,
    testFootage: string; // Test footage descriptions,
    alternativeVersions: string; // Alternative version descriptions,
    archiveNotes: string; // Notes for long-term archival,
}
;
;
// Subject-related ControlNet metadata  
subjects: {
    [tagName, string];
    VFXControlNetTag;
}
;
// Effects-related ControlNet metadata
effects: {
    [tagName, string];
    VFXControlNetTag;
}
;
// Combined MARS metadata for ControlNet processing
marsIntegration: {
    enabled: boolean;
    globalSettings: {
        baseStrength: number; // Default strength for all ControlNet operations,
        adaptiveWeighting: boolean; // Whether to adjust weights based on importance,
        cascadeMode: boolean; // Whether to process tags in sequence or parallel,
    }
    ;
    tagProcessingOrder: string; // Order to process MARS tags for optimal results
}
;
;
// VFX pipeline rendering hints
renderingHints: {
    // Camera-specific hints
    cameraDistance ?  : number; // Distance from subject in scene units,
    verticalAngle ?  : number; // Camera vertical angle in degrees,
    horizontalAngle ?  : number; // Camera horizontal angle in degrees,
    fieldOfView ?  : number; // Camera field of view in degrees,
    // Subject-specific hints
    subjectScale ?  : number; // Subject scale relative to scene (0.0-1.0),
    detailLevel ?  : 'background' | 'midground' | 'hero';
    materialType ?  : string; // Material type for proper shading,
    animationReady ?  : boolean; // Whether subject is prepared for animation,
    // Effects-specific hints
    mistDensity ?  : number; // Atmospheric effect density (0.0-1.0),
    lightingTemperature ?  : number; // Color temperature in Kelvin,
    atmosphericPerspective ?  : boolean; // Whether to apply atmospheric perspective,
    volumetricLighting ?  : boolean; // Whether volumetric lighting is needed,
    // General rendering hints
    priorityLevel ?  : 'low' | 'medium' | 'high' | 'critical';
    processingOrder ?  : number; // Order to process this tag (1-100),
    dependsOnTags ?  : string; // Other tags this one depends on,
    conflictsWith ?  : string; // Tags that conflict with this one,
}
;
// Metadata for pipeline integration
integration: {
    softwareCompatibility: string; // Compatible software (Maya, Houdini, etc.),
    pipelineStage: 'previs' | 'lighting' | 'animation' | 'compositing' | 'final';
    qualityLevel: 'draft' | 'preview' | 'final';
    lastValidated ?  : string; // ISO timestamp of last validation,
    validationNotes ?  : string; // Notes from pipeline validation,
}
;
export {};
