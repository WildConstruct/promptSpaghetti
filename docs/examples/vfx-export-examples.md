# VFX Export Examples - Real-World Use Cases

## Overview

This document provides comprehensive real-world examples of Wild Construct VFX exports across different production scenarios. Each example includes the complete export JSON, integration code samples, and production pipeline implementation details.

## Table of Contents

- [Epic Fantasy Film - Dragon Scene](#epic-fantasy-film---dragon-scene)
- [Sci-Fi Series - Spaceship Battle](#sci-fi-series---spaceship-battle)
- [Historical Drama - Medieval Castle](#historical-drama---medieval-castle)
- [Horror Film - Creature Reveal](#horror-film---creature-reveal)
- [Commercial - Product Hero Shot](#commercial---product-hero-shot)
- [Music Video - Abstract Visualization](#music-video---abstract-visualization)

## Epic Fantasy Film - Dragon Scene

### Production Context

- **Project**: "The Last Kingdom" - Epic Fantasy Feature
- **Scene**: Act II, Dragon Encounter Sequence
- **Shot**: Wide establishing shot of dragon on ancient ruins
- **Director**: Wants multiple dragon types and lighting variations
- **VFX Supervisor**: Requires exact reproducibility for creature consistency

### Complete Export JSON

```json
{
  "metadata": {
    "exportId": "last-kingdom-dragon-wide-001",
    "version": "1.2.0",
    "timestamp": "2025-07-24T14:30:00.000Z",
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
    },
    "project": {
      "name": "The Last Kingdom",
      "id": "tlk-2025-001",
      "scene": "Dragon Encounter - Act II",
      "shot": "wide-establishing-001"
    },
    "export": {
      "format": "vfx-pipeline-v1",
      "quality": "production",
      "includeDebugInfo": true,
      "includeHistoricalData": true,
      "compatibilityLevel": "1.2.0",
      "backwardsCompatible": ["1.0.0", "1.1.0"],
      "minimumVersion": "1.0.0",
      "breaking_changes": []
    },
    "compatibility": {
      "controlNet": true,
      "diffusionModels": ["stable-diffusion-xl", "midjourney-v6", "dall-e-3"],
      "animationFramework": true,
      "billboardProjection": true,
      "vfxSoftware": {
        "blender": { "supported": true, "minVersion": "3.6.0" },
        "maya": { "supported": true, "minVersion": "2023" },
        "houdini": { "supported": true, "minVersion": "19.5" },
        "nuke": { "supported": true, "minVersion": "13.0" }
      },
      "renderEngines": {
        "cycles": true,
        "octane": true,
        "arnold": true,
        "redshift": true,
        "vray": true
      }
    }
  },
  "prompt": {
    "finalPrompt": "A majestic ancient red dragon with weathered scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, mist swirling around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering",
    "components": {
      "subject": ["ancient red dragon", "weathered scales", "majestic"],
      "action": ["perched majestically"],
      "setting": ["crumbling stone ruins", "ancient temple"],
      "mood": ["dramatic", "golden hour lighting", "mist swirling"],
      "technical": ["cinematic composition", "depth of field", "8K resolution"],
      "style": ["photorealistic rendering"]
    },
    "variables": {
      "dragon_type": {
        "value": "ancient red dragon",
        "source": "generated",
        "alternatives": ["frost dragon", "shadow dragon", "golden dragon"],
        "confidence": 0.92
      },
      "dragon_age": {
        "value": "ancient",
        "source": "user",
        "alternatives": ["young", "adult", "elder"],
        "confidence": 1.0
      },
      "scale_texture": {
        "value": "weathered scales",
        "source": "generated",
        "alternatives": ["pristine scales", "battle-scarred", "crystalline"],
        "confidence": 0.85
      },
      "lighting_time": {
        "value": "golden hour",
        "source": "user",
        "alternatives": ["dawn", "noon", "dusk", "stormy"],
        "confidence": 1.0
      },
      "atmosphere": {
        "value": "mist swirling",
        "source": "generated",
        "alternatives": ["clear air", "smoke rising", "magical particles"],
        "confidence": 0.78
      }
    },
    "variants": [
      {
        "id": "variant-red-dragon",
        "seed": 12345,
        "prompt": "A majestic ancient red dragon with weathered scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, mist swirling around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering",
        "confidence": 0.92,
        "metadata": {
          "generationTime": 245,
          "nodesExecuted": 8,
          "variablesUsed": [
            "dragon_type",
            "dragon_age",
            "scale_texture",
            "lighting_time",
            "atmosphere"
          ]
        }
      },
      {
        "id": "variant-frost-dragon",
        "seed": 12346,
        "prompt": "A majestic ancient frost dragon with crystalline scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, magical particles swirling around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering",
        "confidence": 0.87,
        "metadata": {
          "generationTime": 251,
          "nodesExecuted": 8,
          "variablesUsed": [
            "dragon_type",
            "dragon_age",
            "scale_texture",
            "lighting_time",
            "atmosphere"
          ]
        }
      },
      {
        "id": "variant-shadow-dragon",
        "seed": 12347,
        "prompt": "A majestic ancient shadow dragon with battle-scarred scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, smoke rising around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering",
        "confidence": 0.89,
        "metadata": {
          "generationTime": 238,
          "nodesExecuted": 8,
          "variablesUsed": [
            "dragon_type",
            "dragon_age",
            "scale_texture",
            "lighting_time",
            "atmosphere"
          ]
        }
      }
    ],
    "negativePrompt": "blurry, low quality, distorted, deformed, ugly, cartoon, anime, painting, illustration, modern buildings, vehicles, people, crowds",
    "weights": {
      "overall": 1.0,
      "subject": 1.4,
      "composition": 1.2,
      "style": 1.0
    }
  },
  "graph": {
    "nodes": [
      {
        "id": "dragon-type-selector",
        "type": "WeightedChoice",
        "label": "Dragon Type Selection",
        "category": "input",
        "purpose": "Select dragon species with weighted probability",
        "configuration": {
          "name": "Dragon Type",
          "choices": [
            { "text": "ancient red dragon", "weight": 4 },
            { "text": "frost dragon", "weight": 2 },
            { "text": "shadow dragon", "weight": 2 },
            { "text": "golden dragon", "weight": 1 }
          ],
          "reproducibilityMetadata": {
            "nodeType": "WeightedChoice",
            "configurationKeys": ["name", "choices"],
            "checksums": {
              "choices": "a1b2c3",
              "weights": "d4e5f6",
              "fullConfig": "g7h8i9"
            },
            "preservationTimestamp": "2025-07-24T14:30:00.000Z"
          }
        },
        "executionOrder": 1,
        "executionTime": 35,
        "cacheHit": false,
        "dependsOn": [],
        "affects": ["dragon-description-builder"],
        "reproducibilityData": {
          "originalPosition": { "x": 100, "y": 100 },
          "originalSize": { "width": 220, "height": 180 },
          "creationTimestamp": "2025-07-24T14:00:00.000Z",
          "lastModified": "2025-07-24T14:25:00.000Z",
          "configurationHash": "a1b2c3d4e5f6g7h8"
        }
      },
      {
        "id": "scale-texture-selector",
        "type": "WeightedChoice",
        "label": "Scale Texture Variation",
        "category": "logic",
        "purpose": "Add texture variation to dragon scales",
        "configuration": {
          "name": "Scale Texture",
          "choices": [
            { "text": "weathered scales", "weight": 3 },
            { "text": "pristine scales", "weight": 2 },
            { "text": "battle-scarred", "weight": 2 },
            { "text": "crystalline", "weight": 1 }
          ]
        },
        "executionOrder": 2,
        "executionTime": 28,
        "dependsOn": [],
        "affects": ["dragon-description-builder"]
      },
      {
        "id": "atmosphere-selector",
        "type": "WeightedChoice",
        "label": "Atmospheric Effects",
        "category": "logic",
        "purpose": "Add environmental atmosphere",
        "configuration": {
          "name": "Atmosphere",
          "choices": [
            { "text": "mist swirling", "weight": 3 },
            { "text": "smoke rising", "weight": 2 },
            { "text": "magical particles", "weight": 2 },
            { "text": "clear air", "weight": 1 }
          ]
        },
        "executionOrder": 3,
        "executionTime": 32,
        "dependsOn": [],
        "affects": ["atmosphere-integration"]
      },
      {
        "id": "dragon-description-builder",
        "type": "Concat",
        "label": "Dragon Description Builder",
        "category": "transformation",
        "purpose": "Combine dragon type and texture into cohesive description",
        "configuration": {
          "name": "Dragon Description",
          "template": "A majestic {{dragon_type}} with {{scale_texture}} perched majestically on crumbling stone ruins of an ancient temple"
        },
        "executionOrder": 4,
        "executionTime": 15,
        "dependsOn": ["dragon-type-selector", "scale-texture-selector"],
        "affects": ["final-prompt-assembly"]
      },
      {
        "id": "atmosphere-integration",
        "type": "Concat",
        "label": "Atmosphere Integration",
        "category": "transformation",
        "purpose": "Integrate atmospheric effects into scene description",
        "configuration": {
          "name": "Atmosphere Description",
          "template": "{{atmosphere}} around the base of the ruins"
        },
        "executionOrder": 5,
        "executionTime": 12,
        "dependsOn": ["atmosphere-selector"],
        "affects": ["final-prompt-assembly"]
      },
      {
        "id": "lighting-setup",
        "type": "SetVariable",
        "label": "Lighting Configuration",
        "category": "variable",
        "purpose": "Set lighting parameters for scene",
        "configuration": {
          "variableName": "lighting_description",
          "template": "dramatic golden hour lighting casting long shadows"
        },
        "executionOrder": 6,
        "executionTime": 8,
        "dependsOn": [],
        "affects": ["final-prompt-assembly"]
      },
      {
        "id": "technical-specs",
        "type": "SetVariable",
        "label": "Technical Specifications",
        "category": "variable",
        "purpose": "Define technical rendering requirements",
        "configuration": {
          "variableName": "technical_specs",
          "template": "cinematic composition with depth of field, 8K resolution, photorealistic rendering"
        },
        "executionOrder": 7,
        "executionTime": 5,
        "dependsOn": [],
        "affects": ["final-prompt-assembly"]
      },
      {
        "id": "final-prompt-assembly",
        "type": "Output",
        "label": "Final Prompt Assembly",
        "category": "output",
        "purpose": "Assemble complete prompt from all components",
        "configuration": {
          "name": "Final Dragon Scene Prompt",
          "template": "{{dragon_description}}, {{lighting_description}}, {{atmosphere_description}}, {{technical_specs}}"
        },
        "executionOrder": 8,
        "executionTime": 18,
        "dependsOn": [
          "dragon-description-builder",
          "atmosphere-integration",
          "lighting-setup",
          "technical-specs"
        ],
        "affects": []
      }
    ],
    "connections": [
      {
        "id": "conn-dragon-to-desc",
        "source": { "nodeId": "dragon-type-selector", "port": "output" },
        "target": {
          "nodeId": "dragon-description-builder",
          "port": "dragon_type"
        },
        "dataType": "text",
        "label": "dragon_type"
      },
      {
        "id": "conn-scales-to-desc",
        "source": { "nodeId": "scale-texture-selector", "port": "output" },
        "target": {
          "nodeId": "dragon-description-builder",
          "port": "scale_texture"
        },
        "dataType": "text",
        "label": "scale_texture"
      },
      {
        "id": "conn-atmosphere-to-integration",
        "source": { "nodeId": "atmosphere-selector", "port": "output" },
        "target": { "nodeId": "atmosphere-integration", "port": "atmosphere" },
        "dataType": "text",
        "label": "atmosphere"
      },
      {
        "id": "conn-dragon-desc-to-final",
        "source": { "nodeId": "dragon-description-builder", "port": "output" },
        "target": {
          "nodeId": "final-prompt-assembly",
          "port": "dragon_description"
        },
        "dataType": "text"
      },
      {
        "id": "conn-atmosphere-desc-to-final",
        "source": { "nodeId": "atmosphere-integration", "port": "output" },
        "target": {
          "nodeId": "final-prompt-assembly",
          "port": "atmosphere_description"
        },
        "dataType": "text"
      },
      {
        "id": "conn-lighting-to-final",
        "source": { "nodeId": "lighting-setup", "port": "output" },
        "target": {
          "nodeId": "final-prompt-assembly",
          "port": "lighting_description"
        },
        "dataType": "text"
      },
      {
        "id": "conn-tech-to-final",
        "source": { "nodeId": "technical-specs", "port": "output" },
        "target": {
          "nodeId": "final-prompt-assembly",
          "port": "technical_specs"
        },
        "dataType": "text"
      }
    ],
    "executionPath": [
      "dragon-type-selector",
      "scale-texture-selector",
      "atmosphere-selector",
      "dragon-description-builder",
      "atmosphere-integration",
      "lighting-setup",
      "technical-specs",
      "final-prompt-assembly"
    ],
    "criticalPath": [
      "dragon-type-selector",
      "dragon-description-builder",
      "final-prompt-assembly"
    ],
    "analysis": {
      "complexity": "moderate",
      "variabilityScore": 0.75,
      "determinismScore": 0.85,
      "performanceScore": 0.92
    }
  },
  "execution": {
    "randomization": {
      "masterSeed": 12345,
      "nodeSeed": {
        "dragon-type-selector": 12346,
        "scale-texture-selector": 12347,
        "atmosphere-selector": 12348,
        "dragon-description-builder": 12349,
        "atmosphere-integration": 12350,
        "lighting-setup": 12351,
        "technical-specs": 12352,
        "final-prompt-assembly": 12353
      },
      "rngState": "{\"masterRng\":{\"type\":\"snapshot\",\"values\":[0.7234,0.8912,0.4567]},\"nodeStates\":{\"dragon-type-selector\":{\"seed\":12346,\"state\":\"{\\\"type\\\":\\\"snapshot\\\",\\\"values\\\":[0.9123,0.3456,0.7890]}\",\"callCount\":3,\"lastValue\":0.7890}}}",
      "reproducibilityHash": "a1b2c3d4e5f6g7h8i9j0",
      "nodeRngStates": {
        "dragon-type-selector": {
          "seed": 12346,
          "state": "{\"type\":\"snapshot\",\"values\":[0.9123,0.3456,0.7890]}",
          "callCount": 3,
          "lastValue": 0.789
        },
        "scale-texture-selector": {
          "seed": 12347,
          "state": "{\"type\":\"snapshot\",\"values\":[0.2345,0.6789,0.1234]}",
          "callCount": 2,
          "lastValue": 0.1234
        },
        "atmosphere-selector": {
          "seed": 12348,
          "state": "{\"type\":\"snapshot\",\"values\":[0.5678,0.9012,0.3456]}",
          "callCount": 2,
          "lastValue": 0.3456
        }
      },
      "executionSequence": [
        "dragon-type-selector",
        "scale-texture-selector",
        "atmosphere-selector",
        "dragon-description-builder",
        "atmosphere-integration",
        "lighting-setup",
        "technical-specs",
        "final-prompt-assembly"
      ]
    },
    "performance": {
      "totalTime": 153,
      "nodePerformance": {
        "dragon-type-selector": {
          "executionTime": 35,
          "cacheHits": 0,
          "cacheMisses": 1
        },
        "scale-texture-selector": {
          "executionTime": 28,
          "cacheHits": 0,
          "cacheMisses": 1
        },
        "atmosphere-selector": {
          "executionTime": 32,
          "cacheHits": 0,
          "cacheMisses": 1
        },
        "dragon-description-builder": {
          "executionTime": 15,
          "cacheHits": 0,
          "cacheMisses": 1
        },
        "atmosphere-integration": {
          "executionTime": 12,
          "cacheHits": 0,
          "cacheMisses": 1
        },
        "lighting-setup": {
          "executionTime": 8,
          "cacheHits": 1,
          "cacheMisses": 0
        },
        "technical-specs": {
          "executionTime": 5,
          "cacheHits": 1,
          "cacheMisses": 0
        },
        "final-prompt-assembly": {
          "executionTime": 18,
          "cacheHits": 0,
          "cacheMisses": 1
        }
      },
      "memoryUsage": 3456000
    },
    "history": {
      "iterations": [
        {
          "iterationId": "iter-dragon-001",
          "timestamp": "2025-07-24T14:30:00.000Z",
          "trigger": "user_request",
          "seed": 12345,
          "result": "A majestic ancient red dragon with weathered scales perched majestically on crumbling stone ruins of an ancient temple, dramatic golden hour lighting casting long shadows, mist swirling around the base of the ruins, cinematic composition with depth of field, 8K resolution, photorealistic rendering",
          "executionTime": 153
        }
      ],
      "modifications": [
        {
          "timestamp": "2025-07-24T14:25:00.000Z",
          "type": "node_modified",
          "nodeId": "dragon-type-selector",
          "before": {
            "choices": [{ "text": "ancient red dragon", "weight": 3 }]
          },
          "after": {
            "choices": [{ "text": "ancient red dragon", "weight": 4 }]
          },
          "userNote": "Director wants more red dragons in variations"
        }
      ]
    },
    "reproduction": {
      "environment": {
        "nodeVersion": "v18.17.0",
        "platform": "darwin",
        "locale": "en-US"
      },
      "exactReproduction": true,
      "approximateReproduction": true
    }
  },
  "extensions": {
    "controlNet": {
      "pose": {
        "enabled": true,
        "strength": 0.85,
        "poseDescription": "Majestic dragon perched on ruins with wings partially spread, head raised proudly, tail curled around base of structure"
      },
      "depth": {
        "enabled": true,
        "strength": 0.75,
        "depthRange": [2.0, 50.0]
      },
      "canny": {
        "enabled": true,
        "strength": 0.6,
        "threshold": [100, 200]
      }
    },
    "animation": {
      "frameCount": 1,
      "fps": 24,
      "keyframes": [],
      "interpolation": "ease-in-out"
    },
    "scene3D": {
      "camera": {
        "position": [0, 8, 25],
        "rotation": [-10, 0, 0],
        "target": [0, 6, 0]
      },
      "lighting": {
        "ambientColor": [0.2, 0.15, 0.1],
        "directionalLights": [
          {
            "direction": [-0.5, -0.7, -0.3],
            "color": [1.0, 0.8, 0.6],
            "intensity": 1.2
          }
        ]
      }
    }
  },
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
      "position": [0, 8, 25],
      "rotation": [-10, 0, 0],
      "target": [0, 6, 0]
    },
    "lighting": {
      "timeOfDay": "afternoon",
      "weather": "clear",
      "mood": "dramatic",
      "temperature": 3200,
      "exposure": 0.3
    },
    "style": {
      "filmstock": "digital",
      "colorGrading": "cinematic",
      "lensProfile": "canon-85mm-f1.4",
      "dof": {
        "enabled": true,
        "focusDistance": 25,
        "blurRadius": 3.5
      }
    },
    "quality": {
      "samples": 128,
      "denoising": 0.75,
      "sharpness": 0.7,
      "upscaling": 1
    }
  }
}
```

### Maya Integration Code

```python
# Maya integration for dragon scene
import maya.cmds as cmds
import json
from datetime import datetime

def import_dragon_scene_export(export_path):
    """Import The Last Kingdom dragon scene into Maya"""

    with open(export_path, 'r') as f:
        export_data = json.load(f)

    # Create scene namespace
    scene_name = export_data['metadata']['project']['scene'].replace(' ', '_')
    namespace = f"wildConstruct_{scene_name}"
    cmds.namespace(add=namespace)

    # Setup camera
    camera_data = export_data['rendering']['camera']
    camera_transform, camera_shape = cmds.camera(name=f'{namespace}:hero_camera')

    # Set camera parameters
    cmds.setAttr(f'{camera_shape}.focalLength', camera_data['focal'])
    cmds.setAttr(f'{camera_shape}.fStop', camera_data['aperture'])
    cmds.setAttr(f'{camera_shape}.horizontalFilmAperture', 1.417) # 35mm Academy
    cmds.setAttr(f'{camera_shape}.verticalFilmAperture', 0.945)

    # Position camera
    pos = camera_data['position']
    rot = camera_data['rotation']
    cmds.setAttr(f'{camera_transform}.translateX', pos[0])
    cmds.setAttr(f'{camera_transform}.translateY', pos[1])
    cmds.setAttr(f'{camera_transform}.translateZ', pos[2])
    cmds.setAttr(f'{camera_transform}.rotateX', rot[0])
    cmds.setAttr(f'{camera_transform}.rotateY', rot[1])
    cmds.setAttr(f'{camera_transform}.rotateZ', rot[2])

    # Setup lighting for golden hour
    lighting_data = export_data['rendering']['lighting']

    # Key light (sun)
    key_light = cmds.directionalLight(
        name=f'{namespace}:key_light',
        intensity=1.2,
        useRayTraceShadows=True
    )
    key_transform = cmds.listRelatives(key_light, parent=True)[0]
    cmds.setAttr(f'{key_transform}.rotateX', -30)
    cmds.setAttr(f'{key_transform}.rotateY', 45)

    # Set golden hour color temperature
    temp_color = temperature_to_rgb(lighting_data['temperature'])
    cmds.setAttr(f'{key_light}.color', *temp_color, type='double3')

    # Fill light (sky)
    fill_light = cmds.directionalLight(
        name=f'{namespace}:fill_light',
        intensity=0.3
    )
    fill_transform = cmds.listRelatives(fill_light, parent=True)[0]
    cmds.setAttr(f'{fill_transform}.rotateX', -60)
    cmds.setAttr(f'{fill_transform}.rotateY', -30)
    cmds.setAttr(f'{fill_light}.color', 0.7, 0.8, 1.0, type='double3')

    # Create locators for dragon and ruins placement
    dragon_locator = cmds.spaceLocator(name=f'{namespace}:dragon_placement')[0]
    cmds.setAttr(f'{dragon_locator}.translateY', 6)

    ruins_locator = cmds.spaceLocator(name=f'{namespace}:ruins_placement')[0]

    # Add custom attributes for prompt data
    cmds.addAttr(dragon_locator, longName='dragonType', dataType='string')
    cmds.addAttr(dragon_locator, longName='scaleTexture', dataType='string')
    cmds.addAttr(dragon_locator, longName='reproSeed', attributeType='long')

    # Set values from export
    final_prompt = export_data['prompt']['finalPrompt']
    dragon_type = export_data['prompt']['variables']['dragon_type']['value']
    scale_texture = export_data['prompt']['variables']['scale_texture']['value']
    master_seed = export_data['execution']['randomization']['masterSeed']

    cmds.setAttr(f'{dragon_locator}.dragonType', dragon_type, type='string')
    cmds.setAttr(f'{dragon_locator}.scaleTexture', scale_texture, type='string')
    cmds.setAttr(f'{dragon_locator}.reproSeed', master_seed)

    # Create custom shelf button for variant switching
    create_variant_switcher(export_data)

    print(f"Dragon scene imported successfully!")
    print(f"Scene: {export_data['metadata']['project']['scene']}")
    print(f"Final Prompt: {final_prompt}")
    print(f"Reproducibility Seed: {master_seed}")

    return namespace

def temperature_to_rgb(temp_kelvin):
    """Convert color temperature to RGB values"""
    temp = temp_kelvin / 100.0

    if temp <= 66:
        red = 255
        green = temp
        green = 99.4708025861 * math.log(green) - 161.1195681661
        if temp >= 19:
            blue = temp - 10
            blue = 138.5177312231 * math.log(blue) - 305.0447927307
        else:
            blue = 0
    else:
        red = temp - 60
        red = 329.698727446 * (red ** -0.1332047592)
        green = temp - 60
        green = 288.1221695283 * (green ** -0.0755148492)
        blue = 255

    return [max(0, min(255, red))/255.0,
            max(0, min(255, green))/255.0,
            max(0, min(255, blue))/255.0]

def create_variant_switcher(export_data):
    """Create Maya shelf tool for switching between prompt variants"""
    variants = export_data['prompt']['variants']

    shelf_code = f'''
import maya.cmds as cmds

def switch_dragon_variant(variant_index):
    variants = {variants}
    if variant_index < len(variants):
        variant = variants[variant_index]
        print(f"Switching to variant {{variant_index + 1}}: {{variant['prompt'][:50]}}...")

        # Update scene based on variant
        # This would trigger any variant-specific changes
        seed = variant['seed']
        cmds.setAttr('wildConstruct_Dragon_Encounter___Act_II:dragon_placement.reproSeed', seed)
'''

    # Add shelf button (simplified - would normally use Maya's shelf API)
    print("Variant switcher code generated. Add to Maya shelf manually.")
```

### Houdini VEX Implementation

```c
// VEX shader for procedural dragon scale generation
// Based on Wild Construct export parameters

#include <voplib.h>

shader dragon_scales(
    string scale_type = "weathered";
    float scale_size = 0.05;
    float wear_amount = 0.7;
    float color_variation = 0.3;
    vector base_color = {0.8, 0.2, 0.1};  // Red dragon base
    int reproduction_seed = 12345;

    export vector Cf = 0;
    export vector N = 0;
    export float rough = 0;
)
{
    // Seed random functions with reproduction seed
    int seed = reproduction_seed + (int)(P.x * 1000) + (int)(P.y * 1000) + (int)(P.z * 1000);

    // Generate scale pattern
    vector scale_pos = P / scale_size;
    float scale_noise = noise(scale_pos, seed);

    // Apply weathering based on scale_type
    float weathering = 0.0;
    if (scale_type == "weathered") {
        weathering = wear_amount * noise(scale_pos * 2.0, seed + 100);
    } else if (scale_type == "battle-scarred") {
        weathering = wear_amount * 1.5 * noise(scale_pos * 0.5, seed + 200);
    } else if (scale_type == "crystalline") {
        weathering = -0.3; // Negative weathering for pristine look
    }

    // Color variation
    vector color_offset = noise(scale_pos * 3.0, seed + 300) * color_variation;
    Cf = base_color + color_offset;

    // Adjust roughness based on weathering
    rough = 0.4 + weathering * 0.6;

    // Normal perturbation for scale detail
    vector scale_normal = noise(scale_pos * 10.0, seed + 400);
    N = normalize(N + scale_normal * 0.1);
}
```

## Sci-Fi Series - Spaceship Battle

### Production Context

- **Project**: "Stellar Frontiers" - Episodic Sci-Fi Series
- **Episode**: S02E08 - "Battle for Kepler Station"
- **Shot**: Hero ship dodging through asteroid field
- **VFX Requirements**: Multiple ship variations, dynamic lighting from explosions
- **Pipeline**: Maya + Houdini + Nuke workflow

### Abbreviated Export (Key Sections)

```json
{
  "metadata": {
    "exportId": "stellar-frontiers-s02e08-hero-dodge",
    "project": {
      "name": "Stellar Frontiers",
      "id": "sf-s02e08",
      "scene": "Asteroid Field Battle",
      "shot": "hero-dodge-001"
    }
  },
  "prompt": {
    "finalPrompt": "Sleek military starship with glowing blue engines weaving through dense asteroid field, explosions creating dramatic orange and red lighting, debris and sparks flying, cinematic space battle composition, volumetric lighting, photorealistic CGI",
    "variables": {
      "ship_class": {
        "value": "military starship",
        "alternatives": ["exploration vessel", "cargo hauler", "fighter craft"]
      },
      "engine_color": {
        "value": "glowing blue engines",
        "alternatives": [
          "plasma red thrusters",
          "ion white drives",
          "quantum purple trail"
        ]
      },
      "environment_hazard": {
        "value": "dense asteroid field",
        "alternatives": ["nebula cloud", "debris field", "meteor shower"]
      }
    }
  },
  "extensions": {
    "animation": {
      "frameCount": 150,
      "fps": 24,
      "keyframes": [
        {
          "frame": 1,
          "timestamp": 0.0,
          "prompt": "Ship enters asteroid field from left",
          "camera": { "position": [50, 10, 0] }
        },
        {
          "frame": 75,
          "timestamp": 3.125,
          "prompt": "Ship dodges large asteroid with engine flare",
          "camera": { "position": [0, 5, -30] }
        },
        {
          "frame": 150,
          "timestamp": 6.25,
          "prompt": "Ship exits right with explosion behind",
          "camera": { "position": [-50, 15, -10] }
        }
      ]
    }
  }
}
```

### Houdini Procedural Setup

```python
# Houdini procedural asteroid field generation
import hou
import random

def create_asteroid_field_from_export(export_data):
    """Generate procedural asteroid field based on Wild Construct export"""

    # Get scene parameters from export
    environment = export_data['prompt']['variables']['environment_hazard']['value']
    seed = export_data['execution']['randomization']['masterSeed']

    # Create geometry network
    geo = hou.node('/obj').createNode('geo', 'asteroid_field')

    # Scatter points for asteroid positions
    scatter = geo.createNode('scatter', 'asteroid_positions')
    scatter.parm('npts').set(500)  # Number of asteroids
    scatter.parm('seed').set(seed)

    # Create source geometry (bounding volume)
    box = geo.createNode('box', 'field_bounds')
    box.parm('sizex').set(200)
    box.parm('sizey').set(100)
    box.parm('sizez').set(200)

    scatter.setInput(0, box)

    # Copy asteroid geometry to points
    copy = geo.createNode('copy', 'asteroid_copy')
    copy.setInput(0, create_asteroid_geometry(geo, seed))
    copy.setInput(1, scatter)

    # Add variation attributes
    attrib_randomize = geo.createNode('attribrandomize', 'size_variation')
    attrib_randomize.setInput(0, copy)
    attrib_randomize.parm('name').set('pscale')
    attrib_randomize.parm('min').set(0.5)
    attrib_randomize.parm('max').set(3.0)
    attrib_randomize.parm('seed').set(seed + 1)

    # Material assignment based on prompt
    material = create_asteroid_material(export_data)
    geo.createNode('material', 'asteroid_material')

    return geo

def create_asteroid_geometry(parent, seed):
    """Create base asteroid geometry with procedural variation"""
    sphere = parent.createNode('sphere', 'base_asteroid')

    # Add noise for irregular shape
    mountain = parent.createNode('mountain', 'asteroid_surface')
    mountain.setInput(0, sphere)
    mountain.parm('height').set(0.3)
    mountain.parm('offset').set(seed)

    # Add more detailed noise
    mountain2 = parent.createNode('mountain', 'surface_detail')
    mountain2.setInput(0, mountain)
    mountain2.parm('height').set(0.1)
    mountain2.parm('elementsize').set(0.1)
    mountain2.parm('offset').set(seed + 100)

    return mountain2
```

## Historical Drama - Medieval Castle

### Production Context

- **Project**: "Crown and Sword" - Historical Drama Series
- **Season**: 3, Episode 4 - "The Siege"
- **Shot**: Establishing shot of besieged castle at dawn
- **Historical Accuracy**: 12th century English castle architecture
- **Lighting**: Authentic dawn lighting with mist

### Key Export Sections

```json
{
  "prompt": {
    "finalPrompt": "Massive stone medieval castle on hilltop surrounded by siege camps, dawn light breaking through morning mist, authentic 12th century Norman architecture with round towers and thick walls, soldiers visible on battlements, historically accurate medieval siege warfare scene, cinematic composition",
    "variables": {
      "castle_style": {
        "value": "12th century Norman architecture",
        "source": "user",
        "confidence": 1.0
      },
      "time_period": {
        "value": "dawn light breaking through morning mist",
        "alternatives": [
          "noon harsh sunlight",
          "dusk golden hour",
          "stormy overcast"
        ]
      },
      "military_activity": {
        "value": "siege camps",
        "alternatives": [
          "peaceful courtyard",
          "battle aftermath",
          "construction work"
        ]
      }
    }
  },
  "extensions": {
    "wildConstruct": {
      "backdrop": {
        "enabled": true,
        "version": "2.1.0",
        "environment": {
          "era": {
            "name": "High Middle Ages",
            "architecturalStyle": ["Norman", "Early Gothic"],
            "materials": ["limestone", "oak timber", "iron"],
            "colors": ["grey stone", "brown timber", "rust iron"]
          },
          "location": {
            "type": "outdoor",
            "description": "Hilltop castle complex with surrounding siege camps",
            "authenticity": 0.95,
            "socialContext": "military siege"
          }
        }
      }
    }
  },
  "rendering": {
    "lighting": {
      "timeOfDay": "dawn",
      "weather": "misty",
      "mood": "dramatic",
      "temperature": 4500
    }
  }
}
```

## Horror Film - Creature Reveal

### Production Context

- **Project**: "The Depths" - Supernatural Horror Feature
- **Scene**: Act III - Monster Reveal
- **Shot**: Close-up creature emergence from darkness
- **VFX Requirements**: Practical + CG hybrid creature
- **Mood**: Terrifying, atmospheric

### Key Export Sections

```json
{
  "prompt": {
    "finalPrompt": "Grotesque aquatic creature with translucent flesh and multiple eyes emerging from murky water, dramatic single light source creating harsh shadows, bioluminescent details glowing softly, water droplets catching light, horror movie cinematography, photorealistic creature effects",
    "components": {
      "subject": [
        "grotesque aquatic creature",
        "translucent flesh",
        "multiple eyes"
      ],
      "action": ["emerging from murky water"],
      "mood": [
        "dramatic single light source",
        "harsh shadows",
        "horror movie cinematography"
      ],
      "technical": [
        "bioluminescent details",
        "water droplets",
        "photorealistic creature effects"
      ]
    }
  },
  "rendering": {
    "lighting": {
      "timeOfDay": "night",
      "mood": "terrifying",
      "temperature": 2700
    },
    "camera": {
      "fov": 85, // Wide angle for distortion
      "aperture": 1.4, // Shallow DOF
      "position": [0, -2, 3] // Low angle
    }
  }
}
```

## Commercial - Product Hero Shot

### Production Context

- **Project**: Luxury Watch Advertisement
- **Brand**: "Chronos Elite"
- **Shot**: Product hero shot with dramatic lighting
- **Requirements**: Photorealistic product rendering

### Key Export Sections

```json
{
  "prompt": {
    "finalPrompt": "Luxury gold watch with intricate mechanical movement visible through sapphire crystal caseback, dramatic studio lighting with soft reflections, black velvet background, macro photography detail, commercial product photography, photorealistic rendering",
    "weights": {
      "overall": 1.0,
      "subject": 1.8, // Heavy emphasis on product
      "composition": 1.4,
      "style": 1.6
    }
  },
  "rendering": {
    "resolution": {
      "width": 4096,
      "height": 4096,
      "aspectRatio": "1:1"
    },
    "quality": {
      "samples": 256, // High quality for product shot
      "denoising": 0.9,
      "sharpness": 0.9
    }
  }
}
```

## Music Video - Abstract Visualization

### Production Context

- **Project**: "Neon Dreams" Music Video
- **Artist**: Electronic/Synthwave genre
- **Shot**: Beat-synchronized abstract visuals
- **Style**: Retro-futuristic, neon-soaked

### Key Export Sections

```json
{
  "prompt": {
    "finalPrompt": "Abstract geometric shapes morphing to music rhythm, vibrant neon colors in pink and cyan, retro-futuristic aesthetic, particle systems creating light trails, synthwave style visualization, electronic music video effects",
    "variants": [
      {
        "id": "beat-sync-1",
        "seed": 20001,
        "prompt": "Geometric shapes pulsing with bass frequencies..."
      },
      {
        "id": "beat-sync-2",
        "seed": 20002,
        "prompt": "Light trails following melody progression..."
      }
    ]
  },
  "extensions": {
    "animation": {
      "frameCount": 720, // 30 seconds at 24fps
      "fps": 24,
      "keyframes": [
        {
          "frame": 1,
          "prompt": "Intro - subtle geometric forms",
          "timestamp": 0.0
        },
        {
          "frame": 240,
          "prompt": "Build-up - shapes growing in complexity",
          "timestamp": 10.0
        },
        {
          "frame": 480,
          "prompt": "Drop - explosive particle systems",
          "timestamp": 20.0
        }
      ]
    }
  }
}
```

## Integration Examples Summary

Each export example demonstrates different aspects of the VFX pipeline integration:

1. **Epic Fantasy**: Complex graph structure with multiple variables and reproducibility
2. **Sci-Fi Series**: Animation sequences and procedural generation
3. **Historical Drama**: Cultural accuracy and historical Wild Construct integration
4. **Horror Film**: Mood and atmosphere emphasis with specialized lighting
5. **Commercial**: High-quality product focus with technical precision
6. **Music Video**: Beat synchronization and abstract visualization

These examples provide templates for different production types and demonstrate the flexibility of the Wild Construct VFX export format across various industry applications.
