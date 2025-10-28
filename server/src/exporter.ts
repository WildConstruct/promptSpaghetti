// This file now re-exports the refactored exporter modules
// The original 2165-line implementation has been split into modular components:
// - schemas.ts - All Zod schema definitions
// - vfx-exporter.ts - VFX/ControlNet export functions
// - scene-exporter.ts - Scene data export functions
// - index.ts - Main export/import functions
// Original backup saved as exporter-backup.ts

export * from './exporter/index';

// For backward compatibility, also export main functions directly
export {
  graphToBundle,
  graphToBundle as graphToVFXBundle, // Alias for compatibility
  graphToSceneAwareBundle,
  bundleToGraph,
  validateGeneratorBundle,
  validateVFXCompatibility,
  generateScenePromptFlow,
  extractControlNetParameters,
  extractSceneData
} from './exporter/index';
