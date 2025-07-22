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
  camera: {
    fov?: number;                     // Field of view in degrees
    focal?: number;                   // Focal length in mm
    aperture?: number;                // f-stop
    position?: [number, number, number]; // X, Y, Z coordinates
    rotation?: [number, number, number]; // Pitch, yaw, roll
    target?: [number, number, number];   // Look-at target
  };
  
  // Lighting conditions
  lighting: {
    timeOfDay?: "dawn" | "morning" | "noon" | "afternoon" | "dusk" | "night";
    weather?: "clear" | "cloudy" | "overcast" | "stormy" | "foggy" | "snowy";
    mood?: "bright" | "dramatic" | "soft" | "harsh" | "moody" | "ethereal";
    temperature?: number;             // Color temperature in Kelvin
    exposure?: number;                // EV adjustment
  };
  
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
export interface VFXKeyframe {
  frame: number;
  timestamp: number;                  // Time in seconds
  prompt?: string;                    // Prompt for this keyframe
  variables?: { [key: string]: string }; // Variable values at this keyframe
  camera?: Partial<VFXRenderingData['camera']>; // Camera state
  lighting?: Partial<VFXRenderingData['lighting']>; // Lighting state
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