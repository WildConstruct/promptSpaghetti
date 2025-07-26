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
    name: 'Wild Construct Prompt Generator';
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
    format: 'vfx-pipeline-v1';
    quality: 'production' | 'preview' | 'debug';
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
      source: 'user' | 'generated' | 'scene_data' | 'default';
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

  // === HYBRID PROMPTING EXTENSIONS ===
  
  // MARS (Metadata, Actions, Rendering, Style) structure for VFX compatibility
  mars?: VFXMARSStructure;
  
  // Zada-style natural language variants alongside structured data
  zadaVariants?: VFXZadaVariant[];
  
  // Hollywood protocol reproducibility seeds
  hollywoodProtocol?: VFXHollywoodProtocol;
  
  // Human-readable export layer for filmmaker review
  humanReadable?: VFXHumanReadableLayer;
  
  // ControlNet integration metadata tags
  controlNetTags?: VFXControlNetTags;
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
    complexity: 'simple' | 'moderate' | 'complex';
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
  category: 'input' | 'logic' | 'transformation' | 'output' | 'variable';
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
  dataType: 'text' | 'number' | 'boolean' | 'array' | 'object';
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
  trigger: 'user_request' | 'auto_refresh' | 'variable_change' | 'node_change';
  seed: number;
  result: string;
  executionTime: number;
}

export interface VFXModification {
  timestamp: string;
  type: 'node_added' | 'node_removed' | 'node_modified' | 'connection_added' | 'connection_removed' | 'variable_changed';
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
    interpolation?: 'linear' | 'ease' | 'ease-in-out' | 'bezier';
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
    filmstock?: 'digital' | '35mm' | '16mm' | 'super8' | 'polaroid';
    colorGrading?: 'natural' | 'cinematic' | 'desaturated' | 'vibrant' | 'monochrome';
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
  timeOfDay?: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
  weather?: 'clear' | 'cloudy' | 'overcast' | 'stormy' | 'foggy' | 'snowy';
  mood?: 'bright' | 'dramatic' | 'soft' | 'harsh' | 'moody' | 'ethereal';
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
  type: 'static' | 'dolly' | 'pan' | 'tilt' | 'crane' | 'handheld' | 'steadicam';
  movement?: {
    path: [number, number, number][]; // Camera movement path
    duration: number;                 // Movement duration in seconds
    easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  };
}

export interface VFXLightingData {
  setup: 'key' | 'three-point' | 'natural' | 'practical' | 'studio' | 'location';
  sources: {
    type: 'key' | 'fill' | 'rim' | 'background' | 'practical';
    position: [number, number, number];
    intensity: number;
    color: [number, number, number];  // RGB values
    temperature?: number;             // Color temperature
  }[];
}

export interface VFXEnvironmentData {
  type: 'indoor' | 'outdoor' | 'studio' | 'location' | 'greenscreen';
  conditions: {
    weather?: string;
    timeOfDay?: string;
    season?: 'spring' | 'summer' | 'fall' | 'winter';
    atmosphere?: string;
  };
  background?: {
    type: 'practical' | 'matte_painting' | '3d_environment' | 'greenscreen';
    description: string;
    sourceFile?: string;
  };
}

// === UTILITY TYPES ===
export type VFXExportQuality = 'production' | 'preview' | 'debug';

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

// === HYBRID PROMPTING SYSTEM INTERFACES ===

/**
 * MARS (Metadata, Actions, Rendering, Style) structure for VFX compatibility
 * Provides structured sections that align with professional VFX workflows
 */
export interface VFXMARSStructure {
  // [CAM] - Camera and cinematography metadata
  metadata: {
    camera: {
      shotType: 'extreme-wide' | 'wide' | 'medium' | 'close-up' | 'extreme-close-up' | 'two-shot' | 'over-shoulder';
      movement: 'static' | 'pan' | 'tilt' | 'dolly' | 'crane' | 'handheld' | 'steadicam' | 'tracking';
      angle: 'eye-level' | 'low-angle' | 'high-angle' | 'dutch-angle' | 'birds-eye' | 'worms-eye';
      lens: {
        focalLength: number;        // mm
        aperture: number;           // f-stop
        focusType: 'sharp' | 'shallow-dof' | 'deep-focus' | 'rack-focus' | 'soft-focus';
      };
      framing: {
        composition: 'rule-of-thirds' | 'centered' | 'golden-ratio' | 'symmetrical' | 'asymmetrical';
        aspectRatio: '16:9' | '21:9' | '4:3' | '2.35:1' | '1.85:1' | 'square';
        headroom: 'tight' | 'standard' | 'loose';
      };
    };
    scene: {
      location: 'interior' | 'exterior' | 'studio' | 'practical-location' | 'virtual-set';
      timeOfDay: 'golden-hour' | 'blue-hour' | 'day' | 'night' | 'magic-hour' | 'overcast';
      season: 'spring' | 'summer' | 'autumn' | 'winter' | 'timeless';
      weather: 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy' | 'windy';
      atmosphere: 'calm' | 'tense' | 'chaotic' | 'serene' | 'ominous' | 'festive' | 'melancholic';
    };
    technical: {
      filmStock: 'digital' | '35mm' | '16mm' | 'super8' | 'imax' | 'alexa' | 'red' | 'blackmagic';
      colorSpace: 'rec709' | 'rec2020' | 'dci-p3' | 'aces' | 'log' | 'srgb';
      resolution: '2k' | '4k' | '6k' | '8k' | 'hd' | 'uhd' | 'cinema4k';
      frameRate: 24 | 25 | 30 | 48 | 50 | 60 | 120;
    };
  };

  // [SUBJ] - Subject and character actions  
  actions: {
    primary: {
      subjects: VFXMARSSubject[];
      primaryAction: string;
      secondaryActions: string[];
      interactions: VFXMARSInteraction[];
    };
    performance: {
      emotionalState: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted' | 'contemptuous';
      intensity: 'subtle' | 'moderate' | 'intense' | 'extreme';
      bodyLanguage: 'open' | 'closed' | 'confident' | 'nervous' | 'aggressive' | 'passive' | 'theatrical';
      facialExpression: 'natural' | 'exaggerated' | 'stoic' | 'animated' | 'pensive' | 'determined';
    };
    movement: {
      pace: 'slow' | 'moderate' | 'fast' | 'frenetic' | 'static';
      direction: 'left-to-right' | 'right-to-left' | 'toward-camera' | 'away-from-camera' | 'circular' | 'chaotic';
      choreography: 'natural' | 'staged' | 'dance-like' | 'combat' | 'athletic' | 'ceremonial';
    };
  };

  // [FX] - Rendering and visual effects parameters
  rendering: {
    lighting: {
      setup: 'natural' | 'three-point' | 'key-only' | 'rim' | 'silhouette' | 'high-key' | 'low-key' | 'chiaroscuro';
      quality: 'soft' | 'hard' | 'mixed' | 'dramatic' | 'flat' | 'volumetric' | 'practical';
      temperature: {
        kelvin: number;
        description: 'warm' | 'cool' | 'neutral' | 'mixed' | 'color-contrast';
      };
      motivation: 'sun' | 'moon' | 'artificial' | 'fire' | 'neon' | 'candle' | 'fluorescent' | 'led';
    };
    effects: {
      atmosphere: ('fog' | 'smoke' | 'dust' | 'rain' | 'snow' | 'mist' | 'haze' | 'steam')[];
      particles: ('sparks' | 'embers' | 'ash' | 'pollen' | 'debris' | 'magical' | 'digital' | 'organic')[];
      postProcessing: {
        colorGrading: 'natural' | 'cinematic' | 'stylized' | 'desaturated' | 'high-contrast' | 'vintage' | 'futuristic';
        filtration: 'clean' | 'film-grain' | 'digital-noise' | 'softening' | 'sharpening' | 'glow' | 'bloom';
      };
    };
    quality: {
      renderEngine: 'path-tracing' | 'ray-tracing' | 'rasterization' | 'hybrid' | 'real-time' | 'offline';
      samples: number;
      bounces: number;
      denoising: boolean;
      upscaling: '1x' | '2x' | '4x' | 'ai-upscale';
    };
  };

  // Style and aesthetic directives
  style: {
    genre: 'drama' | 'action' | 'comedy' | 'horror' | 'sci-fi' | 'fantasy' | 'documentary' | 'commercial' | 'music-video';
    visualStyle: {
      overall: 'realistic' | 'stylized' | 'surreal' | 'abstract' | 'minimalist' | 'maximalist' | 'retro' | 'futuristic';
      colorPalette: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic' | 'natural';
      contrast: 'low' | 'medium' | 'high' | 'extreme' | 'variable';
      saturation: 'desaturated' | 'natural' | 'saturated' | 'hyper-saturated' | 'selective-color';
    };
    influences: {
      cinematographer: string[];      // e.g., ["Roger Deakins", "Emmanuel Lubezki"]
      director: string[];             // e.g., ["Denis Villeneuve", "Christopher Nolan"]
      period: string[];               // e.g., ["1970s cinema", "film noir", "golden age"]
      artMovement: string[];          // e.g., ["expressionism", "impressionism", "modernism"]
    };
    references: {
      films: string[];                // Reference films for visual style
      artwork: string[];              // Reference artworks or artists
      photography: string[];          // Photographic styles or photographers
      other: string[];                // Other visual references
    };
  };
}

/**
 * Subject definition within MARS structure
 */
export interface VFXMARSSubject {
  id: string;
  type: 'human' | 'animal' | 'creature' | 'object' | 'vehicle' | 'environment' | 'abstract';
  description: string;
  importance: 'primary' | 'secondary' | 'background' | 'prop';
  characteristics: {
    physical: string[];               // Physical description elements
    emotional: string[];              // Emotional characteristics
    narrative: string[];              // Story-relevant traits
  };
  positioning: {
    screenPosition: 'left' | 'center' | 'right' | 'multiple' | 'off-screen';
    depth: 'foreground' | 'midground' | 'background';
    relationship: string[];           // Relationship to other subjects
  };
}

/**
 * Interaction definition between subjects
 */
export interface VFXMARSInteraction {
  type: 'dialogue' | 'physical' | 'emotional' | 'spatial' | 'narrative';
  participants: string[];            // Subject IDs involved
  description: string;
  intensity: 'subtle' | 'moderate' | 'strong' | 'dominant';
  duration: 'brief' | 'sustained' | 'extended';
}

/**
 * Zada-style natural language variants alongside structured data
 * Provides human-readable alternatives to structured prompts
 */
export interface VFXZadaVariant {
  id: string;
  type: 'conversational' | 'technical' | 'poetic' | 'director-notes' | 'screenplay';
  language: 'english' | 'spanish' | 'french' | 'german' | 'italian' | 'japanese' | string;
  style: {
    formality: 'casual' | 'professional' | 'academic' | 'artistic' | 'technical';
    length: 'concise' | 'detailed' | 'verbose' | 'bullet-points' | 'paragraph';
    perspective: 'objective' | 'subjective' | 'first-person' | 'second-person' | 'third-person';
  };
  content: {
    naturalLanguage: string;          // Human-readable description
    technicalNotes: string[];         // Technical implementation notes
    creativeNotes: string[];          // Creative direction notes
    productionNotes: string[];        // Production-specific guidance
  };
  metadata: {
    targetAudience: 'director' | 'cinematographer' | 'vfx-supervisor' | 'editor' | 'producer' | 'general';
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    context: 'pre-production' | 'production' | 'post-production' | 'presentation' | 'documentation';
  };
  equivalence: {
    marsMapping: {                    // Which MARS sections this variant represents
      metadata: boolean;
      actions: boolean;
      rendering: boolean;
      style: boolean;
    };
    structuredPrompt: string;         // Equivalent structured prompt
    confidence: number;               // 0-1 confidence in equivalence
  };
}

/**
 * Hollywood protocol reproducibility seeds
 * Industry-standard seed management for consistent results across productions
 */
export interface VFXHollywoodProtocol {
  version: '1.0' | '1.1' | '2.0';     // Protocol version
  
  // Master production seeds
  production: {
    masterSeed: number;               // Overall production seed
    projectCode: string;              // Studio project identifier
    episodeNumber?: number;           // For episodic content
    sequenceNumber?: number;          // Sequence within episode/film
    shotNumber?: number;              // Specific shot identifier
  };

  // Departmental seeds for different teams
  departmental: {
    cinematography: number;           // Camera and lighting dept
    vfx: number;                     // Visual effects dept
    editorial: number;                // Editorial dept
    sound: number;                   // Sound design dept
    grading: number;                 // Color grading dept
  };

  // Creative variation seeds
  creative: {
    directorVariant: number;          // Director's preferred variant
    alternativeVersions: {            // Alternative creative versions
      [versionName: string]: {
        seed: number;
        description: string;
        approvalStatus: 'draft' | 'review' | 'approved' | 'final';
        notes: string;
      };
    };
  };

  // Quality assurance and validation
  qa: {
    validationSeed: number;           // Seed for validation renders
    comparisonSeeds: number[];        // Seeds for A/B testing
    benchmarkSeed: number;            // Industry standard benchmark
  };

  // Reproducibility metadata
  reproducibility: {    
    guaranteeLevel: 'exact' | 'approximate' | 'creative-equivalent' | 'concept-only';
    environmentHash: string;          // Hash of rendering environment
    softwareVersions: {              // Critical software versions
      [software: string]: string;
    };
    hardwareFingerprint: string;     // Hardware configuration hash
    lastValidated: string;            // ISO timestamp of last validation
    validationNotes: string;          // Notes from validation process
  };

  // Industry compliance
  compliance: {
    studioCertification: boolean;     // Studio QA certification
    distributorApproval: boolean;     // Distributor technical approval  
    archiveCompliant: boolean;        // Archive format compliance
    regulatoryCompliance: string[];   // Regulatory requirements met
  };
}

/**
 * Human-readable export layer for filmmaker review
 * Provides non-technical summaries for creative decision-making
 */
export interface VFXHumanReadableLayer {
  // Executive summary for producers and directors
  executiveSummary: {
    description: string;              // One-paragraph scene description
    keyElements: string[];            // Most important visual elements
    creativeIntent: string;           // Director's creative vision
    technicalComplexity: 'simple' | 'moderate' | 'complex' | 'experimental';
    estimatedCost: 'low' | 'medium' | 'high' | 'premium';
    estimatedTime: 'hours' | 'days' | 'weeks' | 'months';
  };

  // Creative team briefing
  creativeTeam: {
    director: {
      vision: string;                 // Overall creative vision
      references: string[];           // Visual or thematic references
      priorities: string[];           // Most important elements to nail
      concerns: string[];             // Areas requiring special attention
    };
    cinematographer: {
      lookAndFeel: string;           // Overall visual approach
      lightingApproach: string;      // Lighting strategy
      cameraWork: string;            // Camera movement and framing
      technicalChallenges: string[]; // Technical challenges anticipated
    };
    vfxSupervisor: {
      vfxApproach: string;           // VFX strategy and methodology
      practicalElements: string[];   // What's shot practically
      digitalElements: string[];     // What's created digitally
      integrationNotes: string[];    // How practical and digital integrate
    };
  };

  // Production logistics
  production: {
    schedule: {
      prep: string;                   // Pre-production requirements
      shoot: string;                  // On-set requirements
      post: string;                   // Post-production timeline
    };
    resources: {
      crew: string[];                 // Key crew requirements
      equipment: string[];            // Special equipment needed
      locations: string[];            // Location requirements
      talent: string[];               // Casting considerations
    };
    dependencies: {
      prerequisites: string[];        // What must be completed first
      deliverables: string[];         // What this shot delivers to others
      approvals: string[];            // Required approvals and sign-offs
    };
  };

  // Review and approval workflow
  approval: {
    reviewStages: {
      [stageName: string]: {
        reviewers: string[];          // Who reviews at this stage
        criteria: string[];           // What they're reviewing for
        deliverables: string[];       // What's delivered for review
        timeline: string;             // How long this stage takes
      };
    };
    signOffs: {
      creative: boolean;              // Creative approval received
      technical: boolean;             // Technical approval received
      legal: boolean;                 // Legal clearance received
      budget: boolean;                // Budget approval received
    };
    notes: {
      directorNotes: string[];        // Director's review notes
      producerNotes: string[];        // Producer's review notes
      clientNotes: string[];          // Client feedback (if applicable)
      technicalNotes: string[];       // Technical review notes
    };
  };

  // Documentation and archival
  documentation: {
    projectDocuments: string[];       // Related project documents
    referenceImages: string[];        // Reference image descriptions
    testFootage: string[];            // Test footage descriptions
    alternativeVersions: string[];    // Alternative version descriptions
    archiveNotes: string;             // Notes for long-term archival
  };
}

/**
 * ControlNet integration metadata tags for VFX pipeline compatibility
 * Provides MARS tags ([CAM], [SUBJ], [FX]) as structured metadata for AI-driven animation
 */
export interface VFXControlNetTags {
  // Camera-related ControlNet metadata
  camera: {
    [tagName: string]: VFXControlNetTag;
  };
  
  // Subject-related ControlNet metadata  
  subjects: {
    [tagName: string]: VFXControlNetTag;
  };
  
  // Effects-related ControlNet metadata
  effects: {
    [tagName: string]: VFXControlNetTag;
  };
  
  // Combined MARS metadata for ControlNet processing
  marsIntegration: {
    enabled: boolean;
    globalSettings: {
      baseStrength: number;          // Default strength for all ControlNet operations
      adaptiveWeighting: boolean;    // Whether to adjust weights based on importance
      cascadeMode: boolean;          // Whether to process tags in sequence or parallel
    };
    tagProcessingOrder: string[];    // Order to process MARS tags for optimal results
  };
}

/**
 * Individual ControlNet tag with specific parameters and rendering hints
 */
export interface VFXControlNetTag {
  // Tag identification
  tag: string;                       // The actual MARS tag (e.g., "[CAM:WIDE_LOW_ANGLE]")
  description: string;               // Human-readable description of what this tag represents
  
  // ControlNet-specific parameters
  controlNetParameters: {
    // Depth control for 3D understanding
    depth?: {
      enabled: boolean;
      strength: number;              // 0.0-1.0 influence strength
      preprocessor: 'midas' | 'dpt' | 'zoe' | 'leres';
      guidanceScale?: number;        // Optional guidance scale override
    };
    
    // Pose control for character/creature positioning
    pose?: {
      enabled: boolean;
      strength: number;
      preprocessor: 'openpose' | 'dwpose' | 'animal_pose';
      detectHands?: boolean;
      detectFace?: boolean;
    };
    
    // Edge detection for composition control
    canny?: {
      enabled: boolean;
      strength: number;
      lowThreshold?: number;         // Canny edge detection low threshold
      highThreshold?: number;        // Canny edge detection high threshold
    };
    
    // Normal map control for surface detail
    normal?: {
      enabled: boolean;
      strength: number;
      preprocessor: 'normal' | 'bae';
    };
    
    // Segmentation for precise subject control
    segmentation?: {
      enabled: boolean;
      strength: number;
      preprocessor: 'seg' | 'ade20k';
    };
    
    // Scribble/sketch control for artistic direction
    scribble?: {
      enabled: boolean;
      strength: number;
      preprocessor: 'scribble' | 'fake_scribble';
    };
  };
  
  // VFX pipeline rendering hints
  renderingHints: {
    // Camera-specific hints
    cameraDistance?: number;         // Distance from subject in scene units
    verticalAngle?: number;          // Camera vertical angle in degrees
    horizontalAngle?: number;        // Camera horizontal angle in degrees
    fieldOfView?: number;            // Camera field of view in degrees
    
    // Subject-specific hints  
    subjectScale?: number;           // Subject scale relative to scene (0.0-1.0)
    detailLevel?: 'background' | 'midground' | 'hero';
    materialType?: string;           // Material type for proper shading
    animationReady?: boolean;        // Whether subject is prepared for animation
    
    // Effects-specific hints
    mistDensity?: number;            // Atmospheric effect density (0.0-1.0)
    lightingTemperature?: number;    // Color temperature in Kelvin
    atmosphericPerspective?: boolean; // Whether to apply atmospheric perspective
    volumetricLighting?: boolean;    // Whether volumetric lighting is needed
    
    // General rendering hints
    priorityLevel?: 'low' | 'medium' | 'high' | 'critical';
    processingOrder?: number;        // Order to process this tag (1-100)
    dependsOnTags?: string[];        // Other tags this one depends on
    conflictsWith?: string[];        // Tags that conflict with this one
  };
  
  // Metadata for pipeline integration
  integration: {
    softwareCompatibility: string[]; // Compatible software (Maya, Houdini, etc.)
    pipelineStage: 'previs' | 'lighting' | 'animation' | 'compositing' | 'final';
    qualityLevel: 'draft' | 'preview' | 'final';
    lastValidated?: string;          // ISO timestamp of last validation
    validationNotes?: string[];      // Notes from pipeline validation
  };
}