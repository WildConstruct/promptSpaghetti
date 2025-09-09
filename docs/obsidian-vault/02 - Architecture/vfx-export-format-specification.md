# VFX Export Format Specification v1.2.0

## Overview

The Wild Construct VFX Export Format is a comprehensive JSON-based specification designed for professional film production pipeline integration. This format enables seamless exchange of prompt generation data, graph structures, execution metadata, and reproducibility information between Wild Construct and VFX production tools.

## Table of Contents

- [Format Structure](#format-structure)
- [Core Metadata](#core-metadata)
- [Prompt and Generation Data](#prompt-and-generation-data)
- [Graph Structure](#graph-structure)
- [Execution Data](#execution-data)
- [Extensions System](#extensions-system)
- [Rendering Data](#rendering-data)
- [Reproducibility System](#reproducibility-system)
- [Validation Schema](#validation-schema)
- [Version Compatibility](#version-compatibility)

## Format Structure

The VFX export format follows a hierarchical JSON structure with six main sections:

```typescript
interface VFXExportFormat {
  metadata: VFXExportMetadata; // Core export information
  prompt: VFXPromptData; // Generated prompt and variants
  graph: VFXGraphStructure; // Node network and execution flow
  execution: VFXExecutionData; // Performance and reproducibility data
  extensions: VFXExtensions; // Future module integration hooks
  rendering: VFXRenderingData; // VFX-specific render parameters
}
```

## Core Metadata

### Export Identification

```json
{
  "metadata": {
    "exportId": "wc-vfx-20250724-001",
    "version": "1.2.0",
    "timestamp": "2025-07-24T10:00:00.000Z",
    "generator": {
      "name": "Wild Construct Prompt Generator",
      "version": "1.0.0",
      "build": "production-2025.07.24",
      "coreVersion": "2.1.0",
      "exporterVersion": "1.2.0",
      "schemaVersion": "1.2.0",
      "dependencies": {
        "reactflow": "11.10.1",
        "seedrandom": "3.0.5",
        "typescript": "5.0.0"
      }
    }
  }
}
```

### Project Context

```json
{
  "metadata": {
    "project": {
      "name": "Epic Fantasy Film - Scene 42",
      "id": "project-epic-fantasy-001",
      "scene": "Dragon Encounter",
      "shot": "wide-establishing-001"
    }
  }
}
```

### Compatibility Matrix

```json
{
  "metadata": {
    "compatibility": {
      "controlNet": true,
      "diffusionModels": ["stable-diffusion", "sdxl", "midjourney-v6"],
      "animationFramework": true,
      "billboardProjection": true,
      "vfxSoftware": {
        "blender": { "supported": true, "minVersion": "3.6.0" },
        "maya": { "supported": true, "minVersion": "2023" },
        "houdini": { "supported": true, "minVersion": "19.5" },
        "nuke": { "supported": true, "minVersion": "13.0" }
      }
    }
  }
}
```

## Prompt and Generation Data

### Final Prompt Structure

```json
{
  "prompt": {
    "finalPrompt": "A majestic dragon perched on ancient stone ruins, dramatic lighting, cinematic composition, 4K resolution",
    "components": {
      "subject": ["dragon", "majestic"],
      "action": ["perched"],
      "setting": ["ancient stone ruins"],
      "mood": ["dramatic"],
      "technical": ["cinematic composition", "4K resolution"],
      "style": ["cinematic lighting"]
    },
    "weights": {
      "overall": 1.0,
      "subject": 1.2,
      "composition": 1.0,
      "style": 0.8
    }
  }
}
```

### Variable Substitution History

```json
{
  "prompt": {
    "variables": {
      "creature": {
        "value": "dragon",
        "source": "generated",
        "alternatives": ["phoenix", "griffin", "wyvern"],
        "confidence": 0.85
      },
      "setting": {
        "value": "ancient stone ruins",
        "source": "user",
        "alternatives": ["medieval castle", "mystical forest"],
        "confidence": 1.0
      }
    }
  }
}
```

### Multi-Variant Generation

```json
{
  "prompt": {
    "variants": [
      {
        "id": "variant-001",
        "seed": 12345,
        "prompt": "A majestic dragon perched on ancient stone ruins...",
        "confidence": 0.85,
        "metadata": {
          "generationTime": 150,
          "nodesExecuted": 7,
          "variablesUsed": ["creature", "setting", "mood"]
        }
      }
    ]
  }
}
```

## Graph Structure

### Node Network Definition

```json
{
  "graph": {
    "nodes": [
      {
        "id": "creature-selector",
        "type": "WeightedChoice",
        "label": "Creature Selection",
        "category": "input",
        "purpose": "Select mythical creature type",
        "configuration": {
          "name": "Creature Choice",
          "choices": [
            { "text": "dragon", "weight": 3 },
            { "text": "phoenix", "weight": 2 },
            { "text": "griffin", "weight": 1 }
          ]
        },
        "executionOrder": 1,
        "executionTime": 25,
        "dependsOn": [],
        "affects": ["setting-combiner"],
        "reproducibilityData": {
          "originalPosition": { "x": 100, "y": 100 },
          "originalSize": { "width": 200, "height": 150 },
          "configurationHash": "a1b2c3d4e5f6"
        }
      }
    ],
    "connections": [
      {
        "id": "conn-001",
        "source": { "nodeId": "creature-selector" },
        "target": { "nodeId": "setting-combiner" },
        "dataType": "text",
        "label": "creature_type"
      }
    ]
  }
}
```

### Execution Flow Analysis

```json
{
  "graph": {
    "executionPath": ["creature-selector", "setting-combiner", "final-output"],
    "criticalPath": ["creature-selector", "final-output"],
    "analysis": {
      "complexity": "moderate",
      "variabilityScore": 0.7,
      "determinismScore": 0.8,
      "performanceScore": 0.9
    }
  }
}
```

## Execution Data

### Randomization State (Reproducibility Core)

```json
{
  "execution": {
    "randomization": {
      "masterSeed": 12345,
      "nodeSeed": {
        "creature-selector": 12346,
        "setting-combiner": 12347,
        "final-output": 12348
      },
      "rngState": "{\"masterRng\":\"...\",\"nodeStates\":{...}}",
      "reproducibilityHash": "repro-hash-a1b2c3",
      "nodeRngStates": {
        "creature-selector": {
          "seed": 12346,
          "state": "serialized-rng-state",
          "callCount": 3,
          "lastValue": 0.7234
        }
      },
      "executionSequence": [
        "creature-selector",
        "setting-combiner",
        "final-output"
      ]
    }
  }
}
```

### Performance Metrics

```json
{
  "execution": {
    "performance": {
      "totalTime": 150,
      "nodePerformance": {
        "creature-selector": {
          "executionTime": 25,
          "cacheHits": 0,
          "cacheMisses": 1
        }
      },
      "memoryUsage": 2048000
    }
  }
}
```

### Generation History

```json
{
  "execution": {
    "history": {
      "iterations": [
        {
          "iterationId": "iter-001",
          "timestamp": "2025-07-24T10:00:00.000Z",
          "trigger": "user_request",
          "seed": 12345,
          "result": "A majestic dragon...",
          "executionTime": 150
        }
      ],
      "modifications": [
        {
          "timestamp": "2025-07-24T10:05:00.000Z",
          "type": "node_modified",
          "nodeId": "creature-selector",
          "before": { "weight": 2 },
          "after": { "weight": 3 },
          "userNote": "Increased dragon probability"
        }
      ]
    }
  }
}
```

## Extensions System

### ControlNet Integration

```json
{
  "extensions": {
    "controlNet": {
      "pose": {
        "enabled": true,
        "strength": 0.8,
        "poseData": "base64-encoded-pose-keypoints",
        "poseDescription": "Dragon perched pose with wings spread"
      },
      "depth": {
        "enabled": true,
        "strength": 0.6,
        "depthMap": "base64-encoded-depth-map",
        "depthRange": [0.1, 100.0]
      }
    }
  }
}
```

### Animation Sequences

```json
{
  "extensions": {
    "animation": {
      "frameCount": 120,
      "fps": 24,
      "keyframes": [
        {
          "frame": 1,
          "timestamp": 0.0,
          "prompt": "Dragon landing on ruins",
          "camera": { "position": [0, 5, 10] }
        },
        {
          "frame": 60,
          "timestamp": 2.5,
          "prompt": "Dragon roaring dramatically",
          "camera": { "position": [2, 8, 12] }
        }
      ],
      "interpolation": "ease-in-out"
    }
  }
}
```

### Wild Construct Ecosystem Integration

```json
{
  "extensions": {
    "wildConstruct": {
      "crowdControl": {
        "enabled": true,
        "version": "2.1.0",
        "crowdData": {
          "era": {
            "name": "Medieval Fantasy",
            "period": [1200, 1400]
          },
          "demographics": {
            "totalPopulation": 50,
            "socialClasses": {
              "peasants": {
                "percentage": 0.7,
                "occupations": ["farmer", "blacksmith"]
              },
              "nobles": { "percentage": 0.3, "occupations": ["knight", "lord"] }
            }
          }
        }
      }
    }
  }
}
```

## Rendering Data

### Camera Parameters

```json
{
  "rendering": {
    "resolution": {
      "width": 3840,
      "height": 2160,
      "aspectRatio": "16:9"
    },
    "camera": {
      "fov": 35,
      "focal": 85,
      "aperture": 2.8,
      "position": [0, 5, 10],
      "rotation": [-15, 0, 0],
      "target": [0, 2, 0]
    }
  }
}
```

### Lighting Configuration

```json
{
  "rendering": {
    "lighting": {
      "timeOfDay": "dusk",
      "weather": "clear",
      "mood": "dramatic",
      "temperature": 3200,
      "exposure": 0.5
    }
  }
}
```

### Style and Post-Processing

```json
{
  "rendering": {
    "style": {
      "filmstock": "35mm",
      "colorGrading": "cinematic",
      "lensProfile": "canon-85mm-f1.4",
      "dof": {
        "enabled": true,
        "focusDistance": 15,
        "blurRadius": 3
      }
    },
    "quality": {
      "samples": 100,
      "denoising": 0.7,
      "sharpness": 0.6,
      "upscaling": 2
    }
  }
}
```

## Reproducibility System

### Hash-Based Validation

The reproducibility system uses SHA-256 hashes to ensure data integrity:

```typescript
// Configuration hash calculation
function calculateConfigurationHash(config: any): string {
  const configString = JSON.stringify(config, Object.keys(config).sort());
  return crypto
    .createHash('sha256')
    .update(configString)
    .digest('hex')
    .substring(0, 16);
}

// Reproducibility hash for entire export
function calculateReproducibilityHash(exportData: VFXExportFormat): string {
  const reproData = {
    masterSeed: exportData.execution.randomization.masterSeed,
    nodeSeed: exportData.execution.randomization.nodeSeed,
    nodeConfigs: exportData.graph.nodes.map(n => ({
      id: n.id,
      config: n.configuration
    }))
  };
  const reproString = JSON.stringify(reproData, Object.keys(reproData).sort());
  return crypto
    .createHash('sha256')
    .update(reproString)
    .digest('hex')
    .substring(0, 16);
}
```

### RNG State Serialization

```typescript
// Serialize RNG state for exact reproduction
function serializeRngState(rng: seedrandom.prng): string {
  if (rng.state && typeof rng.state === 'function') {
    return JSON.stringify(rng.state());
  }
  // Fallback: capture sequence for approximation
  return JSON.stringify({ type: 'snapshot', values: [rng(), rng(), rng()] });
}
```

## Validation Schema

### Required Fields Validation

```typescript
interface ValidationRules {
  required: {
    'metadata.exportId': string;
    'metadata.version': string;
    'prompt.finalPrompt': string;
    'graph.nodes': Array<VFXGraphNode>;
    'execution.randomization.masterSeed': number;
  };
  optional: {
    'execution.randomization.rngState': string;
    'execution.performance.memoryUsage': number;
    'extensions.controlNet': ControlNetData;
  };
  constraints: {
    'metadata.version': /^\d+\.\d+\.\d+$/;
    'execution.randomization.masterSeed': { min: 0, max: 1000000 };
    'rendering.resolution.width': { min: 640, max: 8192 };
  };
}
```

### Compatibility Checking

```typescript
function validateCompatibility(exportData: VFXExportFormat): ValidationResult {
  const compatibility = exportData.metadata.compatibility;
  const issues: string[] = [];

  // Check VFX software compatibility
  if (compatibility.vfxSoftware.blender.minVersion < '3.6.0') {
    issues.push('Blender version too old for advanced features');
  }

  // Check render engine support
  if (
    !compatibility.renderEngines.cycles &&
    !compatibility.renderEngines.octane
  ) {
    issues.push('No supported render engines found');
  }

  return { isValid: issues.length === 0, issues };
}
```

## Version Compatibility

### Semantic Versioning

The VFX export format follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backward-compatible functionality additions
- **PATCH**: Backward-compatible bug fixes

### Migration Support

```json
{
  "metadata": {
    "versionInfo": {
      "exportedFrom": "1.2.0",
      "canUpgradeTo": ["1.3.0", "2.0.0"],
      "deprecatedFeatures": ["legacy-node-types"],
      "newFeatures": [
        "enhanced-reproducibility",
        "multi-platform-compatibility",
        "performance-optimization"
      ]
    }
  }
}
```

### Backward Compatibility Matrix

| Export Version | Import Version | Status     | Notes                     |
| -------------- | -------------- | ---------- | ------------------------- |
| 1.2.0          | 1.2.0          | ✅ Full    | Perfect compatibility     |
| 1.2.0          | 1.1.0          | ⚠️ Partial | Some features unavailable |
| 1.2.0          | 1.0.0          | ❌ None    | Major breaking changes    |
| 1.1.0          | 1.2.0          | ✅ Full    | Forward compatible        |

## Integration Examples

### Basic Export Usage

```typescript
import { WildConstructVFXExporter } from '@wild-construct/core';

const exporter = WildConstructVFXExporter.getInstance();

// Export with full reproducibility
const exportData = await exporter.exportGraph(graph, executionResults, {
  quality: 'production',
  includeDebugInfo: true,
  includeHistoricalData: true,
  formatVersion: '1.2.0'
});

// Validate export
const validation = exporter.validateExport(exportData);
if (!validation.isValid) {
  console.error('Export validation failed:', validation.errors);
}

// Save to file
const exportJson = JSON.stringify(exportData, null, 2);
fs.writeFileSync('scene-42-dragon-encounter.vfx.json', exportJson);
```

### Reproduction Workflow

```typescript
// Load export data
const exportData = JSON.parse(
  fs.readFileSync('scene-42-dragon-encounter.vfx.json', 'utf8')
);

// Validate reproducibility
const reproductionCheck = exporter.validateReproducibility(exportData);
console.log(`Reproduction confidence: ${reproductionCheck.confidence}`);

// Reproduce results
if (reproductionCheck.canReproduce) {
  const reproducedResults = await exporter.reproduceFromExport(exportData);
  console.log('Reproduction successful:', reproducedResults.success);
}
```

## Error Handling

### Common Validation Errors

```typescript
enum ValidationErrorCodes {
  MISSING_EXPORT_ID = 'MISSING_EXPORT_ID',
  INVALID_VERSION = 'INVALID_VERSION',
  MISSING_FINAL_PROMPT = 'MISSING_FINAL_PROMPT',
  EMPTY_GRAPH = 'EMPTY_GRAPH',
  MISSING_MASTER_SEED = 'MISSING_MASTER_SEED',
  CONFIGURATION_HASH_MISMATCH = 'CONFIGURATION_HASH_MISMATCH'
}
```

### Error Response Format

```json
{
  "isValid": false,
  "errors": [
    {
      "code": "MISSING_MASTER_SEED",
      "message": "Master seed is required for reproducibility",
      "severity": "critical",
      "field": "execution.randomization.masterSeed",
      "suggestion": "Ensure seed is generated during execution"
    }
  ],
  "warnings": [
    {
      "code": "MISSING_RNG_STATE",
      "message": "RNG state not preserved - approximate reproducibility only",
      "impact": "reproducibility",
      "suggestion": "Enable debug mode for exact reproducibility"
    }
  ]
}
```

## Best Practices

### Performance Optimization

1. **Selective Export**: Use quality levels to control export size
2. **Compression**: Compress large exports with gzip
3. **Streaming**: Use streaming JSON parsers for large files
4. **Caching**: Cache validation results for repeated operations

### Security Considerations

1. **Data Sanitization**: Validate all input data before processing
2. **Size Limits**: Enforce reasonable file size limits
3. **Schema Validation**: Always validate against schema before processing
4. **Access Control**: Implement proper access controls for export operations

### Integration Guidelines

1. **Version Checking**: Always check format version before processing
2. **Graceful Degradation**: Handle missing optional fields gracefully
3. **Error Recovery**: Implement robust error handling and recovery
4. **Documentation**: Maintain clear integration documentation

## Conclusion

The Wild Construct VFX Export Format provides a comprehensive, extensible foundation for professional film production pipeline integration. With its robust reproducibility system, extensive metadata capture, and forward-compatible design, it enables seamless data exchange between Wild Construct and industry-standard VFX tools.

For additional support and integration assistance, refer to the pipeline integration guides and troubleshooting documentation.
