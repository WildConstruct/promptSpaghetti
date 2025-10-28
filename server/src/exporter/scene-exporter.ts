// Scene-specific export functions extracted from exporter.ts
import { Graph, Node } from '../../../packages/core/graphSchema';
import { SceneData, GeneratorBundle } from './schemas';

/**
 * Extract scene data from graph metadata
 */
export function extractSceneData(graph: Graph): Partial<SceneData> {
  const sceneData: Partial<SceneData> = {};

  // Look for scene-specific metadata in graph
  if (graph.metadata?.scene) {
    const scene = graph.metadata.scene;

    // Camera settings
    if (scene.camera) {
      sceneData.camera = {
        position: scene.camera.position ?? { x: 0, y: 0, z: 5 },
        angle: scene.camera.angle ?? { pitch: 0, yaw: 0, roll: 0 },
        distance: scene.camera.distance ?? 5,
        lens: scene.camera.lens,
        movement: scene.camera.movement
      };
    }

    // Lighting settings
    if (scene.lighting) {
      sceneData.lighting = {
        timeOfDay: scene.lighting.timeOfDay ?? 'noon',
        weather: scene.lighting.weather ?? 'clear',
        mood: scene.lighting.mood ?? 'bright',
        keyLight: scene.lighting.keyLight,
        fillLight: scene.lighting.fillLight,
        rimLight: scene.lighting.rimLight
      };
    }

    // Atmosphere settings
    if (scene.atmosphere) {
      sceneData.atmosphere = {
        fogDensity: scene.atmosphere.fogDensity ?? 0,
        fogColor: scene.atmosphere.fogColor ?? '#FFFFFF',
        particleEffects: scene.atmosphere.particleEffects ?? 'none',
        windStrength: scene.atmosphere.windStrength ?? 0,
        windDirection: scene.atmosphere.windDirection ?? 0
      };
    }

    // Post-processing settings
    if (scene.postProcessing) {
      sceneData.postProcessing = {
        colorGrading: scene.postProcessing.colorGrading ?? 'none',
        vignette: scene.postProcessing.vignette ?? 0,
        chromatic: scene.postProcessing.chromatic ?? 0,
        grain: scene.postProcessing.grain ?? 0,
        blur: scene.postProcessing.blur ?? 0
      };
    }
  }

  // Also check individual nodes for scene parameters
  graph.nodes.forEach(node => {
    if (node.data?.sceneParams) {
      const nodeScene = node.data.sceneParams;

      // Merge node-level scene params with graph-level
      if (nodeScene.camera && !sceneData.camera) {
        sceneData.camera = nodeScene.camera;
      }

      if (nodeScene.lighting && !sceneData.lighting) {
        sceneData.lighting = nodeScene.lighting;
      }

      if (nodeScene.atmosphere && !sceneData.atmosphere) {
        sceneData.atmosphere = nodeScene.atmosphere;
      }
    }
  });

  return sceneData;
}

/**
 * Generate scene-aware prompt flow based on scene data
 */
export function generateScenePromptFlow(sceneData: SceneData): {
  prefix: string;
  suffix: string;
  modifiers: string[];
} {
  const modifiers: string[] = [];
  let prefix = '';
  let suffix = '';

  // Camera-based modifiers
  if (sceneData.camera) {
    const cam = sceneData.camera;

    // Camera angle descriptions
    if (cam.angle.pitch > 45) {
      modifiers.push('high angle shot');
    } else if (cam.angle.pitch < -45) {
      modifiers.push('low angle shot');
    } else if (Math.abs(cam.angle.pitch) < 10) {
      modifiers.push('eye level shot');
    }

    // Camera distance descriptions
    if (cam.distance < 2) {
      modifiers.push('extreme close-up');
    } else if (cam.distance < 5) {
      modifiers.push('close-up');
    } else if (cam.distance < 10) {
      modifiers.push('medium shot');
    } else if (cam.distance < 20) {
      modifiers.push('full shot');
    } else {
      modifiers.push('wide shot');
    }

    // Camera movement
    if (cam.movement) {
      switch (cam.movement.type) {
        case 'pan':
          modifiers.push('panning shot');
          break;
        case 'dolly':
          modifiers.push('dolly shot');
          break;
        case 'crane':
          modifiers.push('crane shot');
          break;
        case 'handheld':
          modifiers.push('handheld camera');
          break;
      }
    }

    // Lens effects
    if (cam.lens) {
      if (cam.lens.focalLength < 35) {
        modifiers.push('wide angle lens');
      } else if (cam.lens.focalLength > 85) {
        modifiers.push('telephoto lens');
      }

      if (cam.lens.aperture < 2) {
        modifiers.push('shallow depth of field');
      } else if (cam.lens.aperture > 8) {
        modifiers.push('deep depth of field');
      }
    }
  }

  // Lighting-based modifiers
  if (sceneData.lighting) {
    const light = sceneData.lighting;

    // Time of day
    prefix = `${light.timeOfDay} scene, `;

    // Weather conditions
    if (light.weather !== 'clear') {
      modifiers.push(`${light.weather} weather`);
    }

    // Mood descriptors
    modifiers.push(`${light.mood} lighting`);

    // Special lighting conditions
    if (light.keyLight?.intensity > 1.5) {
      modifiers.push('high contrast lighting');
    }

    if (light.rimLight?.intensity > 0.5) {
      modifiers.push('rim lighting');
    }
  }

  // Atmosphere-based modifiers
  if (sceneData.atmosphere) {
    const atmos = sceneData.atmosphere;

    if (atmos.fogDensity > 0.3) {
      modifiers.push(`foggy atmosphere`);
    }

    if (atmos.particleEffects !== 'none') {
      modifiers.push(`${atmos.particleEffects} effects`);
    }

    if (atmos.windStrength > 0.5) {
      modifiers.push('windy conditions');
    }
  }

  // Post-processing effects
  if (sceneData.postProcessing) {
    const post = sceneData.postProcessing;

    if (post.colorGrading !== 'none') {
      modifiers.push(`${post.colorGrading} color grading`);
    }

    if (post.vignette > 0.5) {
      modifiers.push('vignette effect');
    }

    if (post.grain > 0.3) {
      modifiers.push('film grain');
    }

    if (post.blur > 0.3) {
      modifiers.push('motion blur');
    }
  }

  // Build suffix from modifiers
  if (modifiers.length > 0) {
    suffix = `, ${modifiers.join(', ')}`;
  }

  return { prefix, suffix, modifiers };
}

/**
 * Convert graph to scene-aware bundle
 */
export function graphToSceneAwareBundle(
  graph: Graph,
  baseBundle: GeneratorBundle
): GeneratorBundle {
  const sceneData = extractSceneData(graph);
  const scenePromptFlow = generateScenePromptFlow(sceneData as SceneData);

  // Enhance bundle with scene data
  const enhancedBundle: GeneratorBundle = {
    ...baseBundle,
    sceneData: sceneData as SceneData,
    metadata: {
      ...baseBundle.metadata,
      tags: [...(baseBundle.metadata?.tags || []), 'scene-aware', 'cinematic']
    }
  };

  // Inject scene modifiers into the prompt flow
  // This would modify the rules to include scene context
  if (scenePromptFlow.prefix || scenePromptFlow.suffix) {
    // Add scene context to entry point if it's an Output node
    const entryRule = enhancedBundle.rules[enhancedBundle.entryPoint];
    if (entryRule && entryRule.type === 'Output') {
      entryRule.scenePrefix = scenePromptFlow.prefix;
      entryRule.sceneSuffix = scenePromptFlow.suffix;
      entryRule.sceneModifiers = scenePromptFlow.modifiers;
    }
  }

  return enhancedBundle;
}
