// packages/core/types/VFXExport.ts
// VFX-ready export schema for Wild Construct film production pipeline integration

export interface VFXExportFormat {
  // Core metadata
  metadata: VFXExportMetadata;
  
  // Prompt and generation data
  prompt: VFXPromptData;
  
  // Graph structure for pipeline understanding
  graph: VFXGraphStructure;
  
  // Execution and randomization data
  execution: VFXExecutionData;
  
  // Future Wild Construct modules integration
  extensions: VFXExtensions;
  
  // VFX-specific render parameters
  rendering: VFXRenderingData;
}

// === CORE METADATA ===
export interface VFXExportMetadata {
  // Export identification
  exportId: string;
  version: string;                    // Schema version (e.g., "1.0.0")
  timestamp: string;                  // ISO 8601 timestamp
  
  // Wild Construct system info
  generator: {
    name: "Wild Construct Prompt Generator";
    version: string;
    build: string;
  };
  
  // Project context
  project: {
    name?: string;
    id?: string;
    scene?: string;                   // Scene identifier for multi-scene projects
    shot?: string;                    // Shot identifier for shot-specific prompts
  };
  
  // Export settings
  export: {
    format: "vfx-pipeline-v1";
    quality: "production" | "preview" | "debug";
    includeDebugInfo: boolean;
    includeHistoricalData: boolean;
  };
  
  // Compatibility flags
  compatibility: {
    controlNet: boolean;
    diffusionModels: string[];        // Supported models (SD, SDXL, etc.)
    animationFramework: boolean;      // Animation sequence support
    billboardProjection: boolean;     // 3D billboard rendering support
  };
}

// === PROMPT AND GENERATION DATA ===
export interface VFXPromptData {
  // Final generated prompt
  finalPrompt: string;
  
  // Prompt components breakdown
  components: {
    subject: string[];                // Main subjects in the prompt
    action: string[];                 // Actions and verbs
    setting: string[];                // Location and environment
    mood: string[];                   // Atmosphere and feeling
    technical: string[];              // Camera, lighting, render terms
    style: string[];                  // Art style and aesthetic terms
  };
  
  // Variable substitution history
  variables: {
    [variableName: string]: {
      value: string;                  // Final substituted value
      source: "user" | "generated" | "scene_data" | "default";
      alternatives?: string[];        // Other possible values that were rejected
      confidence?: number;            // 0-1 confidence if generated
    };
  };
  
  // Multi-variant generation
  variants: VFXPromptVariant[];
  
  // Negative prompt for diffusion models
  negativePrompt?: string;
  
  // Prompt strengths and weights
  weights: {
    overall: number;                  // Base prompt strength
    subject: number;                  // Subject emphasis
    composition: number;              // Composition weight
    style: number;                    // Style adherence weight
  };
}

export interface VFXPromptVariant {
  id: string;
  seed: number;
  prompt: string;
  confidence: number;                 // Generated quality confidence
  metadata: {
    generationTime: number;           // MS to generate
    nodesExecuted: number;
    variablesUsed: string[];
  };
}

// === GRAPH STRUCTURE ===
export interface VFXGraphStructure {
  // Node network
  nodes: VFXGraphNode[];
  connections: VFXGraphConnection[];
  
  // Execution flow
  executionPath: string[];            // Node IDs in execution order
  criticalPath: string[];             // Nodes that affect final output
  
  // Graph analysis
  analysis: {
    complexity: "simple" | "moderate" | "complex";
    variabilityScore: number;         // 0-1 how much output varies
    determinismScore: number;         // 0-1 how predictable output is
    performanceScore: number;         // 0-1 execution efficiency
  };
}

export interface VFXGraphNode {
  id: string;
  type: string;
  label: string;
  
  // VFX-friendly type categorization
  category: "input" | "logic" | "transformation" | "output" | "variable";
  purpose: string;                    // Human-readable purpose
  
  // Configuration
  configuration: Record<string, unknown>;
  
  // Execution data
  executionOrder: number;
  executionTime?: number;             // MS to execute
  cacheHit?: boolean;
  
  // Dependencies
  dependsOn: string[];                // Input node IDs
  affects: string[];                  // Output node IDs
  
  // Enhanced reproducibility data
  reproducibilityData?: {
    originalPosition: { x: number; y: number };
    originalSize: { width: number; height: number };
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

// === EXECUTION DATA ===
export interface VFXExecutionData {
  // Randomization state
  randomization: {
    masterSeed: number;
    nodeSeed: { [nodeId: string]: number };
    rngState?: string;                // Serialized RNG state for reproduction
    reproducibilityHash?: string;     // Hash for validating reproduction integrity
    nodeRngStates?: {                 // Per-node RNG state capture
      [nodeId: string]: {
        seed: number;
        state: string;
        callCount: number;
        lastValue: number;
      };
    };
    executionSequence?: string[];     // Node execution order for reproducible results
  };
  
  // Performance metrics
  performance: {
    totalTime: number;                // Total execution time (ms)
    nodePerformance: {
      [nodeId: string]: {
        executionTime: number;
        cacheHits: number;
        cacheMisses: number;
      };
    };
    memoryUsage?: number;             // Peak memory (bytes)
  };
  
  // Generation history
  history: {
    iterations: VFXExecutionIteration[];
    modifications: VFXModification[];  // User changes during generation
  };
  
  // Reproducibility data
  reproduction: {
    environment: {
      nodeVersion: string;
      platform: string;
      locale?: string;
    };
    exactReproduction: boolean;       // Can this be exactly reproduced?
    approximateReproduction: boolean; // Can this be approximately reproduced?
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

// === EXTENSIONS FOR WILD CONSTRUCT MODULES ===
export interface VFXExtensions {
  // Future ControlNet integration
  controlNet?: {
    pose?: VFXControlNetPose;
    depth?: VFXControlNetDepth;
    canny?: VFXControlNetCanny;
    openpose?: VFXControlNetOpenpose;
  };
  
  // Animation sequences
  animation?: {
    frameCount?: number;
    fps?: number;
    keyframes?: VFXKeyframe[];
    interpolation?: "linear" | "ease" | "ease-in-out" | "bezier";
  };
  
  // 3D scene integration
  scene3D?: {
    camera?: VFXCameraData;
    lighting?: VFXLightingData;
    environment?: VFXEnvironmentData;
  };

  // Wild Construct Ecosystem Integration
  wildConstruct?: {
    crowdControl?: WildConstructCrowdControl;
    backdrop?: WildConstructBackdrop;
    meteor?: WildConstructMeteor;
    maestro?: WildConstructMaestro;
    utdg?: WildConstructUTDG;
  };
  
  // Custom Wild Construct modules
  custom?: {
    [moduleName: string]: unknown;
  };
}

// === VFX RENDERING DATA ===
export interface VFXRenderingData {
  // Render resolution and format
  resolution: {
    width: number;
    height: number;
    aspectRatio: string;              // e.g., "16:9", "2.35:1"
  };
  
  // Camera parameters (for 3D-aware generation)
  camera: VFXCameraParams;
  
  // Lighting conditions
  lighting: VFXLightingParams;
  
  // Style and post-processing
  style: {
    filmstock?: "digital" | "35mm" | "16mm" | "super8" | "polaroid";
    colorGrading?: "natural" | "cinematic" | "desaturated" | "vibrant" | "monochrome";
    lensProfile?: string;             // Lens characteristics
    dof?: {                           // Depth of field
      enabled: boolean;
      focusDistance?: number;
      blurRadius?: number;
    };
  };
  
  // Render quality settings
  quality: {
    samples?: number;                 // Render samples/iterations
    denoising?: number;               // Denoising strength (0-1)
    sharpness?: number;               // Output sharpening (0-1)
    upscaling?: number;               // Upscale factor (1x, 2x, 4x)
  };
}

// === CONTROL NET SPECIFIC TYPES ===
export interface VFXControlNetPose {
  enabled: boolean;
  strength: number;                   // 0-1 influence strength
  poseData?: string;                  // Base64 encoded pose keypoints
  poseDescription: string;            // Human-readable pose description
}

export interface VFXControlNetDepth {
  enabled: boolean;
  strength: number;
  depthMap?: string;                  // Base64 encoded depth map
  depthRange: [number, number];       // Near, far depth range
}

export interface VFXControlNetCanny {
  enabled: boolean;
  strength: number;
  threshold: [number, number];        // Low, high threshold for edge detection
  edgeMap?: string;                   // Base64 encoded edge map
}

export interface VFXControlNetOpenpose {
  enabled: boolean;
  strength: number;
  poseKeypoints?: number[][];         // Array of [x, y, confidence] keypoints
  bodyParts: string[];                // Detected body parts
}

// === ANIMATION AND 3D TYPES ===
// Define camera and lighting parameter types
export interface VFXCameraParams {
  fov?: number;                     // Field of view in degrees
  focal?: number;                   // Focal length in mm
  aperture?: number;                // f-stop
  position?: [number, number, number]; // X, Y, Z coordinates
  rotation?: [number, number, number]; // Pitch, yaw, roll
  target?: [number, number, number];   // Look-at target
}

export interface VFXLightingParams {
  timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night";
  weather?: "clear" | "cloudy" | "overcast" | "stormy" | "foggy" | "snowy";
  mood?: "bright" | "dramatic" | "soft" | "harsh" | "moody" | "ethereal";
  temperature?: number;             // Color temperature in Kelvin
  exposure?: number;                // EV adjustment
}

export interface VFXKeyframe {
  frame: number;
  timestamp: number;                  // Time in seconds
  prompt?: string;                    // Prompt for this keyframe
  variables?: { [key: string]: string }; // Variable values at this keyframe
  camera?: Partial<VFXCameraParams>; // Camera state
  lighting?: Partial<VFXLightingParams>; // Lighting state
}

export interface VFXCameraData {
  type: "static" | "dolly" | "pan" | "tilt" | "crane" | "handheld" | "steadicam";
  movement?: {
    path: [number, number, number][]; // Camera movement path
    duration: number;                 // Movement duration in seconds
    easing: "linear" | "ease-in" | "ease-out" | "ease-in-out";
  };
}

export interface VFXLightingData {
  setup: "key" | "three-point" | "natural" | "practical" | "studio" | "location";
  sources: {
    type: "key" | "fill" | "rim" | "background" | "practical";
    position: [number, number, number];
    intensity: number;
    color: [number, number, number];  // RGB values
    temperature?: number;             // Color temperature
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

// === UTILITY TYPES ===
export type VFXExportQuality = "production" | "preview" | "debug";

export interface VFXValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  compatibility: {
    controlNet: boolean;
    animation: boolean;
    rendering: boolean;
    // Enhanced reproducibility compatibility
    reproducibility?: {
      exact: boolean;                 // Can be exactly reproduced
      approximate: boolean;           // Can be approximately reproduced
      configPreserved: boolean;       // All node configs preserved
      weightsPreserved: boolean;      // All weight data preserved
    };
  };
}

// === EXPORT FUNCTIONS INTERFACE ===
export interface VFXExporter {
  exportGraph(
    graph: any, 
    options: VFXExportOptions
  ): Promise<VFXExportFormat>;
  
  validateExport(
    exportData: VFXExportFormat
  ): VFXValidationResult;
  
  generateDocumentation(
    exportData: VFXExportFormat
  ): string;
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

// === WILD CONSTRUCT ECOSYSTEM INTEGRATION ===

/**
 * CrowdControl Integration for historically accurate crowd generation
 */
export interface WildConstructCrowdControl {
  enabled: boolean;
  version: string;
  
  // Historical crowd generation data
  crowdData?: {
    era: {
      name: string;
      period: [number, number]; // [startYear, endYear]
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
        children: number;  // 0-1 percentage
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
      historicalAccuracy: number; // 0-1
      constraintViolations: string[];
      suggestions: string[];
    };
  };
  
  // VFX pipeline integration
  pipeline: {
    format: 'json' | 'xml' | 'csv' | 'maya' | 'blender';
    memoryEstimate: number; // MB
    renderComplexity: 'low' | 'medium' | 'high';
    polyCount: number;
    textureSize: number; // MB
  };
}

/**
 * Backdrop Integration for era-appropriate environments
 */
export interface WildConstructBackdrop {
  enabled: boolean;
  version: string;
  
  // Historical environment data
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
      authenticity: number; // 0-1
      socialContext: string; // e.g., "noble court", "peasant village"
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
  
  // 3D scene integration
  scene3D: {
    coordinate: [number, number, number]; // World coordinates
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
  
  // Atmospheric data
  atmosphere?: {
    era: {
      name: string;
      climateData: string[];
      seasonalPatterns: string[];
    };
    weather: {
      condition: string;
      temperature: number; // Celsius
      humidity: number; // 0-1
      windSpeed: number; // m/s
      precipitation: number; // 0-1
      visibility: number; // meters
    };
    effects: {
      particles: Array<{
        type: 'rain' | 'snow' | 'fog' | 'dust' | 'smoke' | 'mist';
        density: number; // 0-1
        size: number;
        velocity: [number, number, number];
        color: [number, number, number, number]; // RGBA
      }>;
      volumetrics: {
        enabled: boolean;
        scattering: number;
        absorption: number;
      };
    };
    historicalAccuracy: {
      score: number; // 0-1
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
  
  // Scene orchestration data
  orchestration?: {
    sceneComposition: {
      foreground: string[];
      midground: string[];
      background: string[];
      depth: number; // Scene depth in meters
    };
    timing: {
      duration: number; // seconds
      keyMoments: Array<{
        time: number; // seconds
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
      accuracy: number; // 0-1
    };
  };
  
  // Rendering coordination
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
      historicalFilmLook: string; // e.g., "1970s film stock"
    };
  };
}

/**
 * UTDG (Universal Texture Description Graph) Integration
 */
export interface WildConstructUTDG {
  enabled: boolean;
  version: string;
  
  // UTDG graph data
  graph?: {
    nodes: UTDGNode[];
    connections: UTDGConnection[];
    metadata: UTDGMetadata;
  };
  
  // Historical accuracy framework
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
      overallScore: number; // 0-1
      violations: Array<{
        severity: 'error' | 'warning' | 'info';
        message: string;
        suggestions: string[];
      }>;
    };
  };
  
  // Data sources and provenance
  dataSources: Array<{
    id: string;
    name: string;
    type: 'museum' | 'academic' | 'archaeological' | 'specialist';
    url?: string;
    reliability: number; // 0-1
    coverage: string[];
  }>;
  
  // VFX pipeline metadata
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

// Supporting interfaces for Wild Construct integration
export interface BackdropAsset {
  id: string;
  name: string;
  type: string;
  historicalPeriod: string;
  authenticity: number; // 0-1
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
  strength: number; // 0-1
  historicalBasis: string;
}

export interface UTDGMetadata {
  creationDate: string;
  lastModified: string;
  accuracy: number; // 0-1
  complexity: 'simple' | 'moderate' | 'complex';
  historicalPeriods: string[];
  regions: string[];
  dataProvenance: string[];
}