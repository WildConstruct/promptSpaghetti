# Wild Construct VFX Export Format Specification

## Overview

The Wild Construct VFX Export Format is designed to enable seamless integration with professional VFX pipelines while preserving complete reproducibility of prompt generation results. This document provides the technical specification for VFX pipeline developers.

**Current Version**: 1.2.0  
**Schema Version**: vfx-pipeline-v1  
**Last Updated**: 2025-07-22

## Format Structure

### Root Schema

```typescript
interface VFXExportFormat {
  metadata: VFXExportMetadata; // Core export information
  prompt: VFXPromptData; // Generated prompt and variables
  graph: VFXGraphStructure; // Node graph structure
  execution: VFXExecutionData; // Execution and reproducibility data
  extensions: VFXExtensions; // ControlNet and animation data
  rendering: VFXRenderingData; // VFX-specific render parameters
}
```

## 1. Metadata Section

### Core Identification

- **exportId**: Unique identifier (format: `wcx_{timestamp}_{random}`)
- **version**: Schema version (semantic versioning)
- **timestamp**: ISO 8601 export timestamp

### Generator Information

```json
{
  "generator": {
    "name": "Wild Construct Prompt Generator",
    "version": "1.0.0",
    "coreVersion": "2.1.0",
    "exporterVersion": "1.2.0",
    "dependencies": {
      "reactflow": "11.10.1",
      "seedrandom": "3.0.5",
      "typescript": "5.0.0"
    }
  }
}
```

### Compatibility Matrix

Comprehensive compatibility tracking for:

- **VFX Software**: Blender, Maya, Houdini, Nuke, After Effects
- **Render Engines**: Cycles, Octane, Arnold, Redshift, V-Ray
- **Platforms**: Windows 10+, macOS 12.0+, Ubuntu 20.04+
- **Diffusion Models**: Stable Diffusion, SDXL, DALL-E 3, Midjourney v6

## 2. Prompt Data Structure

### Final Output

- **finalPrompt**: Complete generated prompt text
- **negativePrompt**: Auto-generated negative prompt for diffusion models
- **weights**: Prompt strength parameters (overall, subject, composition, style)

### Component Analysis

Automatic categorization of prompt elements:

```json
{
  "components": {
    "subject": ["character", "person"],
    "action": ["running", "jumping"],
    "setting": ["forest", "mountain"],
    "mood": ["dramatic", "mysterious"],
    "technical": ["cinematic", "4k"],
    "style": ["realistic", "painting"]
  }
}
```

### Variable Substitution

Complete tracking of variable usage:

```json
{
  "variables": {
    "character": {
      "value": "warrior",
      "source": "user",
      "alternatives": ["hero", "knight", "fighter"],
      "confidence": 1.0
    }
  }
}
```

### Multi-Variant Generation

Support for multiple prompt variants with metadata:

- Seed values for each variant
- Generation time and performance metrics
- Node execution counts per variant

## 3. Graph Structure

### Node Representation

Each node includes:

- **Basic Info**: ID, type, label, category, purpose
- **Configuration**: Complete node settings preservation
- **Dependencies**: Input/output node relationships
- **Execution Data**: Performance metrics and cache statistics

#### Enhanced Configuration Preservation

For **WeightedChoice** nodes:

```json
{
  "weightedChoiceData": {
    "choices": ["option1", "option2", "option3"],
    "weights": [10, 5, 15],
    "weightDistribution": {
      "percentages": [33.3, 16.7, 50.0],
      "entropy": 1.459,
      "uniformity": 0.833
    },
    "totalWeight": 30,
    "normalizedWeights": [0.333, 0.167, 0.5]
  }
}
```

For **Conditional** nodes:

```json
{
  "conditionalData": {
    "conditions": ["variable === 'value'"],
    "expressions": ["startsWith(variable, 'prefix')"],
    "evaluationContext": {}
  }
}
```

### Reproducibility Metadata

Each node includes comprehensive reproducibility data:

```json
{
  "reproducibilityData": {
    "originalPosition": { "x": 100, "y": 200 },
    "originalSize": { "width": 200, "height": 150 },
    "creationTimestamp": "2025-07-22T10:30:00Z",
    "lastModified": "2025-07-22T11:45:00Z",
    "configurationHash": "a1b2c3d4"
  }
}
```

### Connection Mapping

Detailed edge relationships with:

- Source/target node IDs and ports
- Data type classification (text, number, boolean, etc.)
- Optional connection labels

### Graph Analysis

Automated analysis provides:

- **Complexity**: Simple/Moderate/Complex classification
- **Variability Score**: 0-1 measure of output variation potential
- **Determinism Score**: 0-1 measure of output predictability
- **Performance Score**: 0-1 execution efficiency rating

## 4. Execution and Reproducibility

### Randomization State Capture

Complete state preservation for exact reproduction:

```json
{
  "randomization": {
    "masterSeed": 123456,
    "nodeSeed": {
      "node1": 789012,
      "node2": 345678
    },
    "rngState": "{serialized_rng_state}",
    "reproducibilityHash": "validation_hash",
    "nodeRngStates": {
      "node1": {
        "seed": 789012,
        "state": "{node_specific_state}",
        "callCount": 15,
        "lastValue": 0.7234
      }
    },
    "executionSequence": ["node1", "node2", "output"]
  }
}
```

### Performance Metrics

Detailed execution tracking:

- Total execution time (milliseconds)
- Per-node performance data
- Cache hit/miss statistics
- Memory usage snapshots

### Environment Capture

Complete environment information for reproducibility:

- Node.js version
- Platform and architecture
- Locale settings
- Dependency versions

### Reproduction Validation

Built-in validation system provides:

- **Exact Reproduction**: Full RNG state + environment match
- **Approximate Reproduction**: Master seed + basic config match
- **Confidence Levels**: Exact/Approximate/Uncertain classification

## 5. Extensions and VFX Integration

### ControlNet Support

Ready-to-use structure for AI image generation:

```json
{
  "controlNet": {
    "pose": {
      "enabled": false,
      "strength": 0.8,
      "poseDescription": "Natural standing pose"
    },
    "depth": {
      "enabled": false,
      "strength": 0.6,
      "depthRange": [0.1, 100.0]
    },
    "canny": {
      "enabled": false,
      "strength": 0.7,
      "threshold": [100, 200]
    }
  }
}
```

### Animation Framework

Keyframe-based animation support:

- Frame count and FPS specification
- Keyframe prompt variations
- Variable interpolation between keyframes
- Camera and lighting state changes

### 3D Scene Integration

Structured data for 3D-aware generation:

- Camera parameters (position, rotation, FOV)
- Lighting setup specification
- Environment conditions

## 6. Rendering Parameters

### Resolution and Format

- Width/height in pixels
- Aspect ratio calculation (16:9, 2.35:1, etc.)
- Format recommendations

### Camera Simulation

Professional camera parameter mapping:

```json
{
  "camera": {
    "fov": 50,
    "focal": 85,
    "aperture": 2.8,
    "position": [0, 0, 10],
    "rotation": [0, 0, 0],
    "target": [0, 0, 0]
  }
}
```

### Lighting Conditions

Comprehensive lighting specification:

- Time of day enumeration
- Weather conditions
- Mood presets
- Color temperature (Kelvin)
- Exposure adjustments

### Style and Post-Processing

Film simulation and grading:

- Film stock emulation (35mm, 16mm, digital)
- Color grading presets
- Lens profile characteristics
- Depth of field parameters

### Quality Settings

Render optimization parameters:

- Sample count recommendations
- Denoising strength
- Sharpening levels
- Upscaling factors

## Version Compatibility

### Current Version (1.2.0)

- Enhanced reproducibility system
- Weight distribution analysis
- Multi-platform compatibility
- Comprehensive node configuration preservation

### Backwards Compatibility

- Supports versions 1.0.0 and 1.1.0
- Graceful degradation for missing features
- Migration utilities available

### Future Roadmap

- Version 1.3.0: Real-time collaboration features
- Version 2.0.0: Advanced AI integration

## Validation and Quality Assurance

### Export Validation

Comprehensive validation covers:

- Required field presence
- Data type correctness
- Reproducibility requirements
- Performance thresholds

### Reproducibility Testing

Automated testing ensures:

- Seed-based determinism
- Configuration preservation
- Version compatibility
- Cross-platform consistency

## Integration Examples

See companion documents:

- [VFX Pipeline Integration Patterns](./vfx-pipeline-integration.md)
- [Real-World Use Cases](./vfx-export-examples.md)

## Support and Resources

- **API Documentation**: `/docs/api/vfx-export.md`
- **Troubleshooting**: `/docs/troubleshooting/vfx-export.md`
- **Migration Guide**: `/docs/migration/to-v1.2.0.md`
- **Sample Exports**: `/examples/vfx-exports/`

---

_This specification is maintained by the Wild Construct development team. For technical questions or feature requests, please refer to our developer documentation or contact support._
